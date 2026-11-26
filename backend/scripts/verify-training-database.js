import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const count = await prisma.trainingDatabaseRecord.count();
const mukesh = await prisma.trainingDatabaseRecord.findMany({ where: { facultyName: { contains: 'Mukesh' } } });
const first = await prisma.trainingDatabaseRecord.findFirst({ orderBy: { serialNo: 'asc' } });
console.log(JSON.stringify({ count, mukesh, first }, null, 2));
await prisma.$disconnect();
