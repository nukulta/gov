import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
await prisma.faculty.deleteMany({ where: { OR: [{ name: 'Dr. Ananya Sharma' }, { name: 'Shri Rakesh Kumar' }] } });
await prisma.training.deleteMany({ where: { OR: [{ name: 'Leadership in Public Service' }, { name: 'Digital Records Workshop' }] } });
console.log(JSON.stringify({
  faculty: await prisma.faculty.count(),
  training: await prisma.training.count(),
  participation: await prisma.participation.count(),
  trainingDatabase: await prisma.trainingDatabaseRecord.count(),
  users: await prisma.user.count()
}));
await prisma.$disconnect();
