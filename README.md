# URL Shortener with Analytics

A full-stack URL shortener application with analytics dashboard, built with React, Node.js, PostgreSQL, and Zustand.

## Features

- User authentication with JWT
- Create shortened URLs with custom aliases
- Set expiration dates for links
- QR code generation for each link
- Analytics dashboard with:
  - Click tracking
  - Device and browser breakdown
  - Click trends over time
- Search and pagination
- Modern UI with Tailwind CSS and shadcn/ui

## Tech Stack

- Frontend:
  - React
  - Vite
  - Zustand (state management)
  - React Router
  - Tailwind CSS
  - shadcn/ui
  - Recharts (analytics charts)
  - React Hook Form + Zod (form validation)

- Backend:
  - Node.js
  - Express
  - PostgreSQL
  - Prisma (ORM)
  - JWT (authentication)

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL
- npm or yarn

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd url-shortener
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
# Create a PostgreSQL database named 'url_shortener'
createdb url_shortener

# Run Prisma migrations
npx prisma migrate dev
```

4. Create a `.env` file in the root directory with the following variables:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/url_shortener"
JWT_SECRET="your-super-secret-jwt-key"
PORT=5000
```

5. Start the development servers:
```bash
# Start the backend server
npm run server

# In a new terminal, start the frontend
npm run dev
```

## Usage

1. Login with the default credentials:
   - Email: intern@dacoid.com
   - Password: Test123

2. Create a new shortened URL:
   - Enter the original URL
   - Optionally add a custom alias
   - Set an expiration date (optional)
   - Get your shortened URL and QR code

3. View analytics:
   - Track clicks over time
   - See device and browser breakdown
   - Monitor link performance

## API Endpoints

- `POST /api/auth/login` - User login
- `POST /api/links` - Create a new shortened link
- `GET /api/links` - Get all links with pagination
- `GET /api/analytics/:linkId` - Get analytics for a specific link
- `GET /:shortUrl` - Redirect to original URL

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License.
