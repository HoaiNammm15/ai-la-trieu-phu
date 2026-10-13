import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { googleAccessToken } from './google.js';
import { parseSheetRows, validateQuestionBank } from '../src/data/questionBank.js';

let cache;
const versioned = questions => questions.map(q => ({ ...q,
  speechVersion: createHash('sha256').update(JSON.stringify([q.level, q.question, q.answers])).digest('hex') }));
export async function getQuestionBank() {
  if (!process.env.GOOGLE_SHEET_ID) {
    const questions = JSON.parse(await readFile(new URL('../src/data/questions-bank.json', import.meta.url), 'utf8'));
    return { source: 'demo', questions: versioned(validateQuestionBank(questions)) };
  }
  if (cache && cache.expires > Date.now()) return cache.bank;
  const token = await googleAccessToken('https://www.googleapis.com/auth/spreadsheets.readonly');
  const range = process.env.GOOGLE_SHEET_RANGE || 'Questions!A1:K5000';
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(process.env.GOOGLE_SHEET_ID)}/values/${encodeURIComponent(range)}`;
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error('Không đọc được Google Sheet. Kiểm tra ID, tên tab và quyền Viewer.');
  const data = await response.json();
  const bank = { source: 'sheets', questions: versioned(parseSheetRows(data.values || [])) };
  cache = { bank, expires: Date.now() + 60000 };
  return bank;
}
