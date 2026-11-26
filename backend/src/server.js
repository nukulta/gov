import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import argon2 from 'argon2';
import multer from 'multer';
import xlsx from 'xlsx';
import { PrismaClient } from '@prisma/client';
import { auth, allow, newSessionId } from './middleware/auth.js';
import { encrypt, mask } from './services/crypto.js';
import { listDatasets, syncFaculty, syncTraining, syncParticipation, syncTrainingDatabase } from './services/excel-sync.js';

export const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 4000;
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 }, fileFilter: (_req, file, cb) => cb(null, /\.(xlsx|xls)$/i.test(file.originalname)) });

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(morgan('combined'));
app.use((req, res, next) => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && req.path !== '/api/auth/login') {
    const origin = req.get('origin');
    const allowed = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
    if (origin && origin !== allowed) return res.status(403).json({ message: 'Invalid request origin' });
  }
  next();
});
app.use('/api/auth/login', rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true }));

async function audit(req, action, entity, entityId, metadata) {
  await prisma.auditLog.create({ data: { action, entity, entityId, metadata, userId: req.user?.id, ipAddress: req.ip } });
}
const clean = value => value === '' || value === undefined ? null : value;
const date = value => value ? new Date(value) : null;
const numeric = value => value === '' || value == null ? null : Number(value);
function validateRecord(body) {
  if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) return 'Enter a valid email address';
  if (body.mobile && !/^\d{10}$/.test(String(body.mobile))) return 'Mobile number must contain exactly 10 digits';
  if (body.startDate && body.endDate && new Date(body.endDate) < new Date(body.startDate)) return 'End date cannot be earlier than start date';
  return null;
}

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.post('/api/auth/login', async (req, res) => {
  const { email, password, remember } = req.body;
  const user = email ? await prisma.user.findUnique({ where: { email: String(email).toLowerCase() } }) : null;
  if (!user || (user.lockedUntil && user.lockedUntil > new Date()) || !(await argon2.verify(user.passwordHash, password || ''))) {
    if (user) await prisma.user.update({ where: { id: user.id }, data: { failedAttempts: { increment: 1 }, lockedUntil: user.failedAttempts >= 4 ? new Date(Date.now() + 15 * 60 * 1000) : null } });
    return res.status(401).json({ message: 'Invalid credentials or temporarily locked account' });
  }
  const id = newSessionId();
  await prisma.$transaction([prisma.session.create({ data: { id, userId: user.id, expiresAt: new Date(Date.now() + (remember ? 30 : 8) * 24 * 60 * 60 * 1000) } }), prisma.user.update({ where: { id: user.id }, data: { failedAttempts: 0, lockedUntil: null } }), prisma.auditLog.create({ data: { action: 'LOGIN', entity: 'User', entityId: user.id, userId: user.id, ipAddress: req.ip } })]);
  res.cookie('session', id, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: (remember ? 30 : 1) * 24 * 60 * 60 * 1000 });
  res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});
app.post('/api/auth/logout', auth, async (req, res) => { await prisma.session.deleteMany({ where: { userId: req.user.id } }); await audit(req, 'LOGOUT', 'User', req.user.id); res.clearCookie('session'); res.json({ ok: true }); });
app.get('/api/auth/me', auth, (req, res) => res.json({ user: { id: req.user.id, name: req.user.name, email: req.user.email, role: req.user.role } }));

app.get('/api/dashboard', auth, async (_req, res) => {
  const [faculty, trainings, participation, database, users, days, recent, byService] = await prisma.$transaction([
    prisma.faculty.count({ where: { status: 'ACTIVE' } }), prisma.training.count({ where: { status: 'ACTIVE' } }), prisma.participation.count({ where: { status: 'ACTIVE' } }), prisma.trainingDatabaseRecord.count(), prisma.user.count(), prisma.training.aggregate({ _sum: { numberOfDays: true } }), prisma.auditLog.findMany({ take: 8, orderBy: { createdAt: 'desc' }, include: { user: { select: { name: true } } } }), prisma.training.groupBy({ by: ['service'], _count: { _all: true }, where: { service: { not: null } } })
  ]);
  res.json({ counts: { faculty, trainings, participation, database, users, trainingDays: days._sum.numberOfDays || 0 }, recent, byService });
});

const configs = {
  faculty: { model: 'faculty', fields: ['honorific', 'name', 'topic', 'post', 'service', 'officeAddress', 'email', 'mobile'] },
  training: { model: 'training', fields: ['name', 'type', 'conductedMonth', 'conductedYear', 'startDate', 'endDate', 'numberOfDays', 'employeeId', 'participantName', 'gender', 'designation', 'employeeType', 'service', 'officeName', 'email', 'mobile'] },
  participation: { model: 'participation', fields: ['training', 'duration', 'mode', 'month', 'year', 'dateFrom', 'dateTo', 'batchSize', 'male', 'female', 'categories'] }
};
function payload(type, body, userId) {
  const data = Object.fromEntries(configs[type].fields.map(field => [field, ['startDate', 'endDate', 'dateFrom', 'dateTo'].includes(field) ? date(body[field]) : ['conductedYear', 'numberOfDays', 'employeeId', 'duration', 'year', 'batchSize', 'male', 'female'].includes(field) ? numeric(body[field]) : clean(body[field])]));
  if (type === 'training' && data.startDate && data.endDate && data.numberOfDays == null) data.numberOfDays = Math.floor((data.endDate - data.startDate) / 86400000) + 1;
  data.createdById = userId;
  return data;
}
for (const type of Object.keys(configs)) {
  const { model } = configs[type];
  app.get(`/api/${type}`, auth, async (req, res) => {
    const q = String(req.query.q || '').trim();
    const where = { status: 'ACTIVE', ...(q ? { OR: configs[type].fields.filter(f => ['name', 'topic', 'training', 'participantName', 'service', 'officeName'].includes(f)).map(f => ({ [f]: { contains: q, mode: 'insensitive' } })) } : {}) };
    const rows = await prisma[model].findMany({ where, orderBy: { serialNo: 'asc' }, take: Math.min(Number(req.query.limit) || 5000, 5000) });
    res.json(rows);
  });
  app.post(`/api/${type}`, auth, allow('SUPER_ADMIN', 'ADMIN', 'DATA_ENTRY'), async (req, res) => {
    const error = validateRecord(req.body); if (error) return res.status(400).json({ message: error });
    const row = await prisma[model].create({ data: payload(type, req.body, req.user.id) });
    try {
      if (type === 'faculty') syncFaculty(row);
      if (type === 'training') syncTraining(row);
      if (type === 'participation') syncParticipation(row);
    } catch (error) {
      await prisma.auditLog.create({ data: { action: 'EXCEL_SYNC_FAILED', entity: type, entityId: row.id, metadata: { message: error.message }, userId: req.user.id, ipAddress: req.ip } });
    }
    await audit(req, 'CREATE', type, row.id); res.status(201).json(row);
  });
  app.put(`/api/${type}/:id`, auth, allow('SUPER_ADMIN', 'ADMIN', 'DATA_ENTRY'), async (req, res) => {
    const error = validateRecord(req.body); if (error) return res.status(400).json({ message: error });
    const row = await prisma[model].update({ where: { id: req.params.id }, data: payload(type, req.body, req.user.id) });
    try {
      if (type === 'faculty') syncFaculty(row);
      if (type === 'training') syncTraining(row);
      if (type === 'participation') syncParticipation(row);
    } catch (error) {
      await prisma.auditLog.create({ data: { action: 'EXCEL_SYNC_FAILED', entity: type, entityId: row.id, metadata: { message: error.message }, userId: req.user.id, ipAddress: req.ip } });
    }
    await audit(req, 'UPDATE', type, row.id); res.json(row);
  });
  app.delete(`/api/${type}/:id`, auth, allow('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
    const row = await prisma[model].update({ where: { id: req.params.id }, data: { status: 'ARCHIVED' } }); await audit(req, 'DELETE', type, row.id); res.json(row);
  });
}

app.get('/api/dropdowns', auth, async (_req, res) => {
  const values = await prisma.dropdownValue.findMany({ where: { active: true }, orderBy: { value: 'asc' } });
  res.json(values.reduce((acc, item) => ({ ...acc, [item.category]: [...(acc[item.category] || []), item.value] }), {}));
});
app.post('/api/dropdowns', auth, allow('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  const category = clean(req.body.category);
  const value = clean(req.body.value);
  if (!category || !value) return res.status(400).json({ message: 'Category and value are required' });
  const row = await prisma.dropdownValue.upsert({
    where: { category_value: { category, value } },
    update: { active: true },
    create: { category, value }
  });
  await audit(req, 'CREATE', 'DropdownValue', row.id, { category });
  res.status(201).json(row);
});
app.get('/api/dropdown-master', auth, allow('SUPER_ADMIN', 'ADMIN'), async (_req, res) => {
  res.json(await prisma.dropdownValue.findMany({ where: { active: true }, orderBy: [{ category: 'asc' }, { value: 'asc' }] }));
});
app.delete('/api/dropdowns/:id', auth, allow('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  const row = await prisma.dropdownValue.update({ where: { id: req.params.id }, data: { active: false } });
  await audit(req, 'DELETE', 'DropdownValue', row.id);
  res.json(row);
});
app.get('/api/audit-logs', auth, allow('SUPER_ADMIN', 'ADMIN'), async (_req, res) => res.json(await prisma.auditLog.findMany({ take: 100, orderBy: { createdAt: 'desc' }, include: { user: { select: { name: true, email: true } } } })));
app.post('/api/initialization/preview', auth, allow('SUPER_ADMIN'), upload.single('workbook'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Upload an .xlsx or .xls workbook' });
  const existing = await prisma.databaseInitialization.findFirst({ where: { status: 'COMPLETED' } }); if (existing) return res.status(409).json({ message: 'Database initialization has already been completed' });
  const workbook = xlsx.read(req.file.buffer, { type: 'buffer', cellDates: true });
  res.json({ fileName: req.file.originalname, sheets: workbook.SheetNames.map(name => ({ name, rows: xlsx.utils.sheet_to_json(workbook.Sheets[name], { header: 1 }).slice(0, 6) })) });
});
app.post('/api/initialization/commit', auth, allow('SUPER_ADMIN'), async (req, res) => {
  const existing = await prisma.databaseInitialization.findFirst({ where: { status: 'COMPLETED' } }); if (existing) return res.status(409).json({ message: 'Database initialization has already been completed' });
  const row = await prisma.databaseInitialization.create({ data: { status: 'COMPLETED', fileName: req.body.fileName, initializedAt: new Date(), initializedBy: req.user.id } }); await audit(req, 'INITIAL_IMPORT', 'DatabaseInitialization', row.id); res.status(201).json(row);
});
app.get('/api/initialization/datasets', auth, allow('SUPER_ADMIN'), async (_req, res) => {
  try {
    res.json({ folder: 'backend/Dataset', files: listDatasets() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
app.post('/api/initialization/datasets/import', auth, allow('SUPER_ADMIN'), async (req, res) => {
  const { execFile } = await import('node:child_process');
  const script = 'prisma/import-datasets.js';
  execFile(process.execPath, [script], { cwd: process.cwd(), env: process.env }, async (error, stdout, stderr) => {
    if (error) return res.status(500).json({ message: 'Dataset import failed', detail: stderr.trim() });
    await audit(req, 'DATASET_IMPORT', 'DatabaseInitialization', null, { output: stdout.trim() });
    res.json(JSON.parse(stdout.trim()));
  });
});
app.get('/api/training-database', auth, async (_req, res) => res.json(await prisma.trainingDatabaseRecord.findMany({ orderBy: [{ serialNo: 'asc' }, { facultyName: 'asc' }] })));
app.post('/api/training-database', auth, allow('SUPER_ADMIN', 'ADMIN', 'DATA_ENTRY'), async (req, res) => {
  const { accountNumber, panNumber, ...data } = req.body;
  const row = await prisma.trainingDatabaseRecord.create({ data: { ...data, lectures: numeric(data.lectures), bankName: clean(data.bankName), ifscCode: clean(data.ifscCode), financial: accountNumber || panNumber ? { create: { encryptedAccount: encrypt(accountNumber), encryptedPan: encrypt(panNumber) } } : undefined } });
  try {
    syncTrainingDatabase(row, accountNumber, panNumber);
  } catch (error) {
    await prisma.auditLog.create({ data: { action: 'EXCEL_SYNC_FAILED', entity: 'TrainingDatabaseRecord', entityId: row.id, metadata: { message: error.message }, userId: req.user.id, ipAddress: req.ip } });
  }
  await audit(req, 'CREATE', 'TrainingDatabaseRecord', row.id); res.status(201).json({ ...row, accountNumber: mask(accountNumber), panNumber: mask(panNumber) });
});
app.get('/api/training-database/:id', auth, async (req, res) => {
  const row = await prisma.trainingDatabaseRecord.findUnique({ where: { id: req.params.id } });
  if (!row) return res.status(404).json({ message: 'Training database record not found' });
  res.json(row);
});
app.put('/api/training-database/:id', auth, allow('SUPER_ADMIN', 'ADMIN', 'DATA_ENTRY'), async (req, res) => {
  const { accountNumber, panNumber, ...data } = req.body;
  const row = await prisma.trainingDatabaseRecord.update({
    where: { id: req.params.id },
    data: {
      trainingName: clean(data.trainingName),
      duration: clean(data.duration),
      facultyName: clean(data.facultyName),
      officeName: clean(data.officeName),
      email: clean(data.email),
      mobile: clean(data.mobile),
      topic: clean(data.topic),
      lectures: numeric(data.lectures),
      bankName: clean(data.bankName),
      ifscCode: clean(data.ifscCode)
    }
  });
  await audit(req, 'UPDATE', 'TrainingDatabaseRecord', row.id);
  res.json(row);
});
app.delete('/api/training-database/:id', auth, allow('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  const row = await prisma.trainingDatabaseRecord.delete({ where: { id: req.params.id } });
  await audit(req, 'DELETE', 'TrainingDatabaseRecord', row.id);
  res.json(row);
});

app.use((err, _req, res, _next) => { console.error(err.message); res.status(500).json({ message: 'Unexpected server error' }); });
if (process.env.NODE_ENV !== 'test') app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
export default app;
