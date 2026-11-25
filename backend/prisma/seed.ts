import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.ts';
import { hash } from 'crypto';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env['DATABASE_URL'] }),
  // Optionally you can pass log options for debugging
  log: ['query', 'info', 'warn', 'error'],
})

async function updateSuperAdmin() {
  const username = process.env['SUPER_ADMIN_USERNAME'] ?? 'root'
  const name = process.env['SUPER_ADMIN_NAME'] ?? 'Super Admin'
  const password = process.env['SUPER_ADMIN_PASSWORD'] ?? 'root@123!'

  await prisma.user.update({
    where: {
      id: 'root'
    },
    data: {
      username,
      name,
      passwordHash: hash('sha256', password)
    }
  })
}

async function main() {
  await updateSuperAdmin()
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
