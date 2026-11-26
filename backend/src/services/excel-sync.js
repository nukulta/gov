import fs from 'node:fs';
import path from 'node:path';
import xlsx from 'xlsx';

export const DATASET_FOLDER = path.resolve(process.env.DATASET_FOLDER || path.join(process.cwd(), 'Dataset'));

function workbookPath(fileName) {
  return path.join(DATASET_FOLDER, fileName);
}

export function listDatasets() {
  return fs.readdirSync(DATASET_FOLDER)
    .filter(name => /\.(xlsx|xls)$/i.test(name))
    .map(name => {
      const fullPath = workbookPath(name);
      const workbook = xlsx.readFile(fullPath);
      return {
        fileName: name,
        sheets: workbook.SheetNames.map(sheetName => {
          const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, defval: '' });
          return { name: sheetName, rows: rows.length };
        })
      };
    });
}

function formatDate(value) {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.valueOf()) ? '' : date.toISOString().slice(0, 10);
}

export function syncFaculty(row) {
  const fileName = 'Faculty Pannel.xlsx';
  const fullPath = workbookPath(fileName);
  const workbook = xlsx.readFile(fullPath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  const header = rows[1] || ['S.No', 'Topic', 'Name', 'Post', 'Service', 'office address', 'Email ID ', 'Mobile NO'];
  const data = [row.serialNo, row.topic || '', row.name || '', row.post || '', row.service || '', row.officeAddress || '', row.email || '', row.mobile || ''];
  const index = rows.findIndex((entry, i) => i > 1 && Number(entry[0]) === row.serialNo);
  if (index >= 0) rows[index] = data;
  else rows.push(data);
  const title = rows[0] || [];
  const dataRows = rows.slice(1).filter((entry, i) => i === 0 || entry.some(value => value !== ''));
  workbook.Sheets[sheetName] = xlsx.utils.aoa_to_sheet([title, ...dataRows]);
  workbook.SheetNames = [sheetName];
  xlsx.writeFile(workbook, fullPath);
}

export function syncTraining(row) {
  const fileName = 'Training Calendar 26-27.xlsx';
  const fullPath = workbookPath(fileName);
  const workbook = xlsx.readFile(fullPath);
  const sheetName = workbook.SheetNames.includes('DataBase') ? 'DataBase' : workbook.SheetNames[0];
  const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, defval: '' });
  const headerIndex = rows.findIndex(rowValues => rowValues[0] === 'S.No' || rowValues[0] === 'S. No.');
  const data = [
    row.serialNo, row.name || '', row.type || '', row.conductedMonth || '', row.conductedYear || '',
    formatDate(row.startDate), formatDate(row.endDate), row.numberOfDays || '',
    row.employeeId || '', row.participantName || '', row.gender || '', row.designation || '',
    row.employeeType || '', row.service || '', row.officeName || '', row.email || '', row.mobile || ''
  ];
  const index = rows.findIndex((entry, i) => i > headerIndex && Number(entry[0]) === row.serialNo);
  if (index >= 0) rows[index] = data;
  else rows.push(data);
  workbook.Sheets[sheetName] = xlsx.utils.aoa_to_sheet(rows);
  xlsx.writeFile(workbook, fullPath);
}

export function syncParticipation(row) {
  const fileName = 'Training Calendar 26-27.xlsx';
  const fullPath = workbookPath(fileName);
  const workbook = xlsx.readFile(fullPath);
  const sheetName = workbook.SheetNames.includes('Training Parti.') ? 'Training Parti.' : workbook.SheetNames[0];
  const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, defval: '' });
  const headerIndex = rows.findIndex(rowValues => rowValues[0] === 'S.No');
  const categories = row.categories || {};
  const categoryNames = ['ISS','SSO','JSO','SSS','SS','SE','Cont.','Field All','All Field','ASS','AO','Assistant','Stenographer','UDC','LDC','JTO','SCD','MTS','Admin All'];
  const data = [
    row.serialNo, row.training || '', row.duration || '', row.mode || '', row.month || '', row.year || '',
    formatDate(row.dateFrom), formatDate(row.dateTo),
    ...categoryNames.map(name => Number(categories[name] || 0)),
    row.batchSize || '', row.male || '', row.female || ''
  ];
  const index = rows.findIndex((entry, i) => i > headerIndex && Number(entry[0]) === row.serialNo);
  if (index >= 0) rows[index] = data;
  else rows.push(data);
  workbook.Sheets[sheetName] = xlsx.utils.aoa_to_sheet(rows);
  xlsx.writeFile(workbook, fullPath);
}

export function syncTrainingDatabase(row, accountNumber = '', panNumber = '') {
  const fileName = 'Traning DataBase.xlsx';
  const fullPath = workbookPath(fileName);
  const workbook = xlsx.readFile(fullPath);
  const sheetName = workbook.SheetNames.includes('Sheet2') ? 'Sheet2' : workbook.SheetNames[0];
  const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, defval: '' });
  const headerIndex = rows.findIndex(rowValues => rowValues[0] === 'S.No');
  const data = [
    row.serialNo, row.trainingName || '', row.duration || '', row.facultyName || '',
    row.officeName || '', row.email || '', row.mobile || '', row.topic || '',
    row.lectures || '', row.bankName || '', accountNumber || '', row.ifscCode || '', panNumber || ''
  ];
  const index = rows.findIndex((entry, i) => i > headerIndex && Number(entry[0]) === row.serialNo);
  if (index >= 0) rows[index] = data;
  else rows.push(data);
  workbook.Sheets[sheetName] = xlsx.utils.aoa_to_sheet(rows);
  xlsx.writeFile(workbook, fullPath);
}
