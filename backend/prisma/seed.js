import 'dotenv/config';
import argon2 from 'argon2';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const dropdowns = {
  service: ['ISS', 'SSS', 'Admin', 'Contractual'],
  gender: ['Male', 'Female', 'Other'],
  designation: ['Assistant Commissioner', 'Section Officer', 'Inspector', 'Assistant'],
  post: ['Director', 'Deputy Director', 'Assistant Director'],
  trainingType: ['ZO Regular', 'In House', 'Outsource', 'Induction B', 'Induction A'],
  employeeType: ['Regular', 'Contractual'],
  mode: ['Online', 'Offline', 'Hybrid', 'Other'],
  honorific: ['Dr.', 'Ms.', 'Shri.', 'Other']
};
async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set before seeding');
  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
  await prisma.user.upsert({ where: { email }, update: {}, create: { name: 'System Administrator', email, passwordHash, role: 'SUPER_ADMIN' } });
  for (const [category, values] of Object.entries(dropdowns)) for (const value of values) await prisma.dropdownValue.upsert({ where: { category_value: { category, value } }, update: {}, create: { category, value } });
}
main().finally(() => prisma.$disconnect());
