import 'dotenv/config';
import path from 'node:path';
import xlsx from 'xlsx';
import { PrismaClient } from '@prisma/client';
import { encrypt } from '../src/services/crypto.js';

const prisma = new PrismaClient();
const folder = path.resolve(process.env.DATASET_FOLDER || path.join(process.cwd(), 'Dataset'));
const read = fileName => xlsx.readFile(path.join(folder, fileName), { cellDates: true });
const text = value => value === null || value === undefined || String(value).trim() === '' ? null : String(value).trim();
const integer = value => value === null || value === undefined || value === '' ? null : Number.parseInt(String(value), 10);
const dateValue = value => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.valueOf()) ? null : date;
};
const normalizedGender = value => value === 'M' ? 'Male' : value === 'F' ? 'Female' : text(value);

async function importFaculty() {
  const workbook = read('Faculty Pannel.xlsx');
  const sheetName = workbook.SheetNames[0];
  const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });
  let imported = 0;
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const serialNo = integer(row['S.No']);
    if (!serialNo) continue;
    const sourceKey = `faculty|${sheetName}|${serialNo}|${text(row.Name) || i}`;
    await prisma.faculty.upsert({
      where: { sourceKey },
      update: {},
      create: {
        serialNo,
        sourceKey,
        topic: text(row.Topic),
        name: text(row.Name),
        post: text(row.Post),
        service: text(row.Service),
        officeAddress: text(row['office address']),
        email: text(row['Email ID '] || row['Email ID']),
        mobile: text(row['Mobile NO'])
      }
    });
    imported++;
  }
  return imported;
}

async function importTrainingSheet(fileName, sheetName) {
  const workbook = read(fileName);
  const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], {
    defval: '',
    range: sheetName === 'Data Base' ? 1 : 0
  });
  let imported = 0;
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const serialNo = integer(row['S.No']);
    if (!serialNo) continue;
    const sourceKey = `training|${fileName}|${sheetName}|${i}|${serialNo}`;
    await prisma.training.upsert({
      where: { sourceKey },
      update: {},
      create: {
        serialNo,
        sourceKey,
        name: text(row['Name of Training '] || row['Name of Training']),
        type: text(row['Type of Training ZO Regular/In House / Outsource / Induction B / Induction A'] || row['Type of Training ( ZO Regular/In House / Outsource / Induction B / Induction A']),
        conductedMonth: text(row['Conducted Month']),
        conductedYear: integer(row['Conducted Year']),
        startDate: dateValue(row['Duration (Start)']),
        endDate: dateValue(row['Duration (End)']),
        numberOfDays: integer(row['No of Days '] || row['No of Days']),
        employeeId: integer(row['Emp. ID '] || row['Emp. ID']),
        participantName: text(row['Name of Participant'] || row['Name of Participents']),
        gender: normalizedGender(row.Gender),
        designation: text(row.Designation),
        employeeType: text(row['Type of employee  (Regular / Contractual)']),
        service: text(row['Service(ISS/SSS/Admin/Contractual ) '] || row['Service(ISS/SSS/Admin/Contractual )']),
        officeName: text(row['Name of RO/SRO/Ministrys '] || row['Name of RO/SRO/Ministrys']),
        email: text(row['Email ID']),
        mobile: text(row['Mobile Number'])
      }
    });
    imported++;
  }
  return imported;
}

async function importTraining() {
  const calendar = await importTrainingSheet('Training Calendar 26-27.xlsx', 'DataBase');
  const historical = await importTrainingSheet('Traning DataBase.xlsx', 'Data Base');
  return calendar + historical;
}

async function importParticipation() {
  const workbook = read('Training Calendar 26-27.xlsx');
  const sheetName = workbook.SheetNames.find(name => /part/i.test(name));
  const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '', range: 1 });
  let imported = 0;
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const serialNo = integer(row['S.No']);
    if (!serialNo) continue;
    const categoryNames = ['ISS','SSO','JSO','SSS','SS','SE','Cont.','Field All','All Field','ASS','AO','Assistant','Stenographer','UDC','LDC','JTO','SCD','MTS','Admin All'];
    const categories = Object.fromEntries(categoryNames.map(name => [name, integer(row[name]) || 0]));
    if (integer(row['Cont. Field All']) !== null) categories['Cont.'] = integer(row['Cont. Field All']) || 0;
    const sourceKey = `participation|${sheetName}|${i}|${serialNo}`;
    await prisma.participation.upsert({
      where: { sourceKey },
      update: {},
      create: {
        serialNo,
        sourceKey,
        training: text(row.Training),
        duration: integer(row['Duration (in days)']),
        mode: text(row['Mode of Training']),
        month: text(row.Month),
        year: integer(row.Year),
        dateFrom: dateValue(row['Date From']),
        dateTo: dateValue(row['Date to']),
        batchSize: integer(row['Batch Size']),
        male: integer(row.Male),
        female: integer(row.Female),
        categories
      }
    });
    imported++;
  }
  return imported;
}

async function importTrainingDatabaseDetail() {
  const workbook = read('Traning DataBase.xlsx');
  const sheetName = 'Sheet2';
  const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, defval: '' });
  let imported = 0;
  let currentSerial = null;
  let currentTraining = null;
  let currentDuration = null;
  for (let i = 2; i < rows.length; i++) {
    const row = rows[i];
    if (row[0] !== '' && integer(row[0]) !== null) {
      currentSerial = integer(row[0]);
      currentTraining = text(row[1]);
      currentDuration = text(row[2]);
    }
    const facultyName = text(row[3]);
    if (!currentSerial || !facultyName) continue;
    const sourceKey = `training-database|${sheetName}|${i}|${currentSerial}|${facultyName}`;
    const accountNumber = text(row[10]);
    const panNumber = text(row[12]);
    await prisma.trainingDatabaseRecord.upsert({
      where: { sourceKey },
      update: {},
      create: {
        serialNo: currentSerial,
        sourceKey,
        trainingName: currentTraining,
        duration: currentDuration,
        facultyName,
        officeName: text(row[4]),
        email: text(row[5]),
        mobile: text(row[6]),
        topic: text(row[7]),
        lectures: integer(row[8]),
        bankName: text(row[9]),
        ifscCode: text(row[11]),
        financial: accountNumber || panNumber ? {
          create: {
            encryptedAccount: encrypt(accountNumber),
            encryptedPan: encrypt(panNumber)
          }
        } : undefined
      }
    });
    imported++;
  }
  return imported;
}

async function importTrainingDatabaseMain() {
  const workbook = read('Traning DataBase.xlsx');
  const sheetName = workbook.SheetNames.find(name => name === 'Data Base') || workbook.SheetNames[0];
  const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '', range: 1 });
  let imported = 0;
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const serialNo = integer(row['S.No']);
    if (!serialNo) continue;
    const sourceKey = `training-database-main|${sheetName}|${i}|${serialNo}`;
    await prisma.trainingDatabaseRecord.upsert({
      where: { sourceKey },
      update: {},
      create: {
        serialNo,
        sourceKey,
        trainingName: text(row['Name of Training ']),
        duration: text(row['Duration (Start)']),
        facultyName: text(row['Name of Participents']),
        officeName: text(row['Name of RO/SRO/Ministrys ']),
        email: text(row['Email ID']),
        mobile: text(row['Mobile Number']),
        topic: text(row['Type of Training ( ZO Regular/In House / Outsource / Induction B / Induction A']),
        lectures: integer(row['No of Days '])
      }
    });
    imported++;
  }
  return imported;
}

async function main() {
  const counts = {
    faculty: await importFaculty(),
    training: await importTraining(),
    participation: await importParticipation(),
    trainingDatabase: await importTrainingDatabaseDetail()
  };
  await prisma.databaseInitialization.upsert({
    where: { id: 'excel-dataset-import' },
    update: { status: 'COMPLETED', initializedAt: new Date(), initializedBy: null },
    create: { id: 'excel-database-import', status: 'COMPLETED', initializedAt: new Date(), initializedBy: null }
  });
  console.log(JSON.stringify({ status: 'COMPLETED', counts }));
}

main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
