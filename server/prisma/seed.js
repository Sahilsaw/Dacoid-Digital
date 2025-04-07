import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Test123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'intern@dacoid.com' },
    update: {},
    create: {
      email: 'intern@dacoid.com',
      password: hashedPassword
    }
  });

  console.log('Database has been seeded. 🌱');
  console.log('Default user created:', user.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 