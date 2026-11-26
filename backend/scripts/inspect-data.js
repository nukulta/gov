import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const faculty = await prisma.faculty.findMany({ take: 3 });
const training = await prisma.training.findMany({ take: 5 });
const participation = await prisma.participation.findMany({ take: 3 });
const database = await prisma.trainingDatabaseRecord.findMany({ take: 5 });
console.log(JSON.stringify({ faculty, training, participation, database }, null, 2));
await prisma.$disconnect();
