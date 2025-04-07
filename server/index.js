import express from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? true // Allow all origins in production
    : 'http://localhost:5173', // Only allow localhost in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../dist")));

  // Handle client-side routing
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../dist", "index.html"));
  });
}

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Link routes
app.post('/api/links', authenticateToken, async (req, res) => {
  const { originalUrl, customAlias, expiresAt } = req.body;
  const userId = req.user.id;

  try {
    // Validate required fields
    if (!originalUrl) {
      return res.status(400).json({ error: 'Original URL is required' });
    }

    // Validate URL format
    try {
      new URL(originalUrl);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Check if custom alias is already taken
    if (customAlias) {
      const existingLink = await prisma.link.findUnique({
        where: { shortUrl: customAlias }
      });
      if (existingLink) {
        return res.status(400).json({ error: 'Custom alias is already taken' });
      }
    }

    const shortUrl = customAlias || Math.random().toString(36).substring(2, 8);
    
    // Parse the expiration date if provided
    let parsedExpiresAt = null;
    if (expiresAt) {
      parsedExpiresAt = new Date(expiresAt);
      
      // Validate the date
      if (isNaN(parsedExpiresAt.getTime())) {
        return res.status(400).json({ error: 'Invalid expiration date format' });
      }
      
      // Ensure the expiration date is in the future
      if (parsedExpiresAt <= new Date()) {
        return res.status(400).json({ error: 'Expiration date must be in the future' });
      }
    }
    
    const link = await prisma.link.create({
      data: {
        originalUrl,
        shortUrl,
        customAlias,
        expiresAt: parsedExpiresAt,
        userId
      }
    });
    res.json(link);
  } catch (error) {
    console.error('Error creating link:', error);
    res.status(500).json({ error: 'Failed to create link' });
  }
});

app.get('/api/links', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 10, search = '' } = req.query;

  try {
    const skip = (page - 1) * limit;
    const where = {
      userId,
      OR: [
        { originalUrl: { contains: search } },
        { shortUrl: { contains: search } },
        { customAlias: { contains: search } }
      ]
    };

    const [links, total] = await Promise.all([
      prisma.link.findMany({
        where,
        skip: Number(skip),
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { clicks: true }
          }
        }
      }),
      prisma.link.count({ where })
    ]);

    res.json({
      links,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get original URL by short code
app.get('/api/links/:shortCode', async (req, res) => {
  const { shortCode } = req.params;

  try {
    const link = await prisma.link.findUnique({
      where: { shortUrl: shortCode }
    });

    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    // Check if the link has expired
    if (link.expiresAt) {
      const now = new Date();
      const expiryDate = new Date(link.expiresAt);
      
      // Debug log to see the dates
      console.log('Current time:', now);
      console.log('Expiry time:', expiryDate);
      
      if (now > expiryDate) {
        return res.status(410).json({ error: 'Link expired' });
      }
    }

    // Async click logging
    prisma.click.create({
      data: {
        linkId: link.id,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        device: req.headers['sec-ch-ua-platform'],
        browser: req.headers['sec-ch-ua']
      }
    }).catch(console.error);

    res.json({ originalUrl: link.originalUrl });
  } catch (error) {
    console.error('Error in getOriginalUrl:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Redirect route
app.get('/:shortUrl', async (req, res) => {
  const { shortUrl } = req.params;

  try {
    const link = await prisma.link.findUnique({
      where: { shortUrl },
      include: { clicks: true }
    });

    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    // Check if the link has expired
    if (link.expiresAt) {
      const now = new Date();
      const expiryDate = new Date(link.expiresAt);
      
      // Debug log to see the dates
      console.log('Current time:', now);
      console.log('Expiry time:', expiryDate);
      
      if (now > expiryDate) {
        return res.status(410).json({ error: 'Link expired' });
      }
    }

    // Async click logging
    prisma.click.create({
      data: {
        linkId: link.id,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        device: req.headers['sec-ch-ua-platform'],
        browser: req.headers['sec-ch-ua']
      }
    }).catch(console.error);

    res.redirect(link.originalUrl);
  } catch (error) {
    console.error('Error in redirect:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Analytics routes
app.get('/api/analytics/:linkId', authenticateToken, async (req, res) => {
  const { linkId } = req.params;
  const userId = req.user.id;

  try {
    const link = await prisma.link.findFirst({
      where: {
        id: linkId,
        userId
      },
      include: {
        clicks: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    const analytics = {
      totalClicks: link.clicks.length,
      deviceBreakdown: link.clicks.reduce((acc, click) => {
        acc[click.device || 'unknown'] = (acc[click.device || 'unknown'] || 0) + 1;
        return acc;
      }, {}),
      browserBreakdown: link.clicks.reduce((acc, click) => {
        acc[click.browser || 'unknown'] = (acc[click.browser || 'unknown'] || 0) + 1;
        return acc;
      }, {}),
      clicksOverTime: link.clicks.reduce((acc, click) => {
        const date = click.createdAt.toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {})
    };

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 