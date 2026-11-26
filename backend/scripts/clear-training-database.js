import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
await prisma.restrictedFinancialDetails.deleteMany();
await prisma.trainingDatabaseRecord.deleteMany();
console.log('Training database records cleared');
await prisma.$disconnect();
