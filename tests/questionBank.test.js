import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parseSheetRows, createRound, validateQuestions } from '../src/data/questionBank.js';
import { selectMaleVietnameseVoice } from '../src/hooks/speechVoice.js';
import questionHandler from '../api/questions.js';
import speechHandler from '../api/speech.js';
import { generateKeyPairSync } from 'node:crypto';

const demo = JSON.parse(await readFile(new URL('../src/data/questions.json', import.meta.url), 'utf8')).map((q, i) => ({ ...q, level: i + 1 }));
const headers = ['id', 'level', 'question', 'a', 'b', 'c', 'd', 'correct', 'category', 'explanation', 'active'];
const rows = () => [[...headers], ...demo.map(q => [q.id, q.level, q.question, ...q.answers, 'ABCD'[q.correct], q.category, q.explanation, 'TRUE'])];

test('Sheets parses reordered headers, multiline text, disabled rows and answer letters', () => {
  const input = rows();
  input.push(['draft', 1, '', '', '', '', '', '', '', '', 'FALSE']);
  input[1][2] = 'Câu hỏi có dấu, dấu phẩy\nvà dòng mới';
  const reordered = input.map(row => [...row].reverse());
  const bank = parseSheetRows(reordered);
  assert.equal(bank.length, 15);
  assert.equal(bank[0].correct, demo[0].correct);
  assert.match(bank[0].question, /\n/);
});

test('invalid Sheets data fails visibly rather than changing correct answers or using demo', () => {
  for (const mutate of [r => r[1][7] = 'E', r => r[1][3] = '', r => r[2][0] = r[1][0],
    r => r[1][1] = 0, r => r[1][10] = '', r => r.splice(5, 1), r => r[0].pop()]) {
    const input = rows();
    mutate(input);
    assert.throws(() => parseSheetRows(input));
  }
});

function seededRandom(seed) {
  let value = seed >>> 0;
  return () => { value = (1664525 * value + 1013904223) >>> 0; return value / 2 ** 32; };
}

const thousandQuestions = level => Array.from({ length: 1000 }, (_, index) => ({
  ...demo[index % demo.length], id: `pool-${index + 1}`, level: level ?? (index % 15) + 1,
  question: `Câu hỏi trong kho số ${index + 1}`,
}));

test('rounds sample 15 unique questions from the entire 1000-question bank without changing it', () => {
  const bank = thousandQuestions();
  const original = structuredClone(bank);
  Object.freeze(bank);
  const round = createRound(bank, seededRandom(42));
  assert.equal(round.length, 15);
  assert.equal(new Set(round.map(q => q.id)).size, 15);
  assert.ok(round.some(q => Number(q.id.slice(5)) > 900), 'The far end of the bank must be eligible');
  assert.deepEqual(bank, original);
  assert.ok(round.every(q => q.level === bank.find(originalQuestion => originalQuestion.id === q.id).level));
  assert.notDeepEqual(round.map(q => q.level), Array.from({ length: 15 }, (_, i) => i + 1));
  assert.deepEqual(createRound(bank, seededRandom(42)), round, 'A supplied RNG should reproduce a round');
  assert.notDeepEqual(createRound(bank, seededRandom(43)).map(q => q.id), round.map(q => q.id));
});

test('a whole bank can use one level and its last question can be chosen first', () => {
  const bank = thousandQuestions(15);
  validateQuestions(bank);
  const round = createRound(bank, () => 0.99999);
  assert.equal(round[0].id, 'pool-1000');
  assert.equal(new Set(round.map(q => q.id)).size, 15);
  assert.ok(round.every(q => q.level === 15));
  const saved = structuredClone(round);
  bank[999] = { ...bank[999], question: 'Đã sửa trong Sheet' };
  assert.equal(saved[0].question, 'Câu hỏi trong kho số 1000');
});

test('the bank needs at least 15 active questions, and level is optional metadata', () => {
  assert.throws(() => validateQuestions([]));
  assert.throws(() => validateQuestions(demo.slice(0, 14)), /15/);
  validateQuestions(demo.map(({ level, ...q }) => q));
  validateQuestions(demo.map(q => ({ ...q, level: null })));
  const blankLevels = rows();
  for (const row of blankLevels.slice(1)) row[1] = '';
  assert.ok(parseSheetRows(blankLevels).every(q => q.level === null));
  const noLevelColumn = rows().map(row => row.filter((_, index) => index !== 1));
  assert.ok(parseSheetRows(noLevelColumn).every(q => q.level === null));
  assert.deepEqual(createRound(demo, () => 0), demo);
});

test('voice selection ignores female and unknown Vietnamese voices', () => {
  const female = { name: 'Microsoft HoaiMy Online (Natural)', lang: 'vi-VN' };
  const unknown = { name: 'Google Tiếng Việt', lang: 'vi-VN' };
  const male = { name: 'Microsoft NamMinh Online (Natural)', lang: 'vi-VN' };
  assert.equal(selectMaleVietnameseVoice([female, unknown]), null);
  assert.equal(selectMaleVietnameseVoice([female, unknown, male]), male);
  assert.equal(selectMaleVietnameseVoice([{ name: male.name, lang: 'en-US' }]), null);
});

function response() {
  return { headers: {}, statusCode: 200, body: null, setHeader(k, v) { this.headers[k] = v; },
    status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; }, send(body) { this.body = body; return this; } };
}

test('API serves valid demo without credentials and rejects writes', async () => {
  const previous = process.env.GOOGLE_SHEET_ID;
  delete process.env.GOOGLE_SHEET_ID;
  try {
    const res = response();
    await questionHandler({ method: 'GET' }, res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.source, 'demo');
    validateQuestions(res.body.questions);
    assert.equal(res.body.questions[0].speechVersion.length, 64);
    const write = response();
    await questionHandler({ method: 'POST' }, write);
    assert.equal(write.statusCode, 405);
  } finally { if (previous !== undefined) process.env.GOOGLE_SHEET_ID = previous; }
});

test('speech API announces the round position, caches audio, and rejects invalid positions or changed snapshots', async () => {
  const oldFetch = globalThis.fetch;
  const oldKey = process.env.GOOGLE_TTS_API_KEY;
  const oldSheet = process.env.GOOGLE_SHEET_ID;
  process.env.GOOGLE_TTS_API_KEY = 'test-key';
  delete process.env.GOOGLE_SHEET_ID;
  let calls = 0;
  const texts = [];
  globalThis.fetch = async (url, options) => {
    calls++;
    assert.equal(url, 'https://texttospeech.googleapis.com/v1/text:synthesize');
    const body = JSON.parse(options.body);
    assert.equal(body.voice.name, 'vi-VN-Standard-B');
    assert.equal(body.voice.ssmlGender, 'MALE');
    texts.push(body.input.text);
    return { ok: true, json: async () => ({ audioContent: Buffer.from('mock mp3').toString('base64') }) };
  };
  try {
    const bank = response();
    await questionHandler({ method: 'GET' }, bank);
    const version = bank.body.questions[0].speechVersion;
    for (let i = 0; i < 2; i++) {
      const res = response();
      await speechHandler({ method: 'GET', url: `/api/speech?questionId=1&version=${version}&position=12` }, res);
      assert.equal(res.statusCode, 200);
      assert.equal(res.headers['Content-Type'], 'audio/mpeg');
    }
    assert.equal(calls, 1);
    assert.match(texts[0], /^Câu hỏi số 12\./, 'Question 1 has level 1 but is twelfth in this round');
    const anotherPosition = response();
    await speechHandler({ method: 'GET', url: `/api/speech?questionId=1&version=${version}&position=7` }, anotherPosition);
    assert.equal(anotherPosition.statusCode, 200);
    assert.equal(calls, 2);
    assert.match(texts[1], /^Câu hỏi số 7\./);
    const repeat = response();
    await speechHandler({ method: 'GET', url: `/api/speech?questionId=1&version=${version}&repeat=1` }, repeat);
    assert.equal(repeat.statusCode, 200);
    assert.equal(texts[2], demo[0].question);
    assert.equal(calls, 3);
    for (const position of [null, '', '0', '16', '-1', '1.5', 'invalid']) {
      const invalid = response();
      const query = position === null ? '' : `&position=${position}`;
      await speechHandler({ method: 'GET', url: `/api/speech?questionId=1&version=${version}${query}` }, invalid);
      assert.equal(invalid.statusCode, 400, `Position ${position} must be rejected`);
    }
    assert.equal(calls, 3, 'Invalid positions must not call the paid TTS provider');
    const stale = response();
    await speechHandler({ method: 'GET', url: '/api/speech?questionId=1&version=outdated&position=12' }, stale);
    assert.equal(stale.statusCode, 409);
    assert.equal(calls, 3);
  } finally {
    globalThis.fetch = oldFetch;
    if (oldKey === undefined) delete process.env.GOOGLE_TTS_API_KEY; else process.env.GOOGLE_TTS_API_KEY = oldKey;
    if (oldSheet === undefined) delete process.env.GOOGLE_SHEET_ID; else process.env.GOOGLE_SHEET_ID = oldSheet;
  }
});

test('private Sheets authenticates on the server, validates rows and caches successful reads', async () => {
  const oldFetch = globalThis.fetch;
  const oldId = process.env.GOOGLE_SHEET_ID;
  const oldAccount = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  process.env.GOOGLE_SHEET_ID = 'test-private-sheet';
  process.env.GOOGLE_SERVICE_ACCOUNT_JSON = JSON.stringify({ client_email: 'test@example.invalid',
    private_key: privateKey.export({ type: 'pkcs8', format: 'pem' }) });
  let tokenCalls = 0;
  let sheetCalls = 0;
  let valid = false;
  globalThis.fetch = async (url, options) => {
    if (url === 'https://oauth2.googleapis.com/token') {
      tokenCalls++;
      const assertion = options.body.get('assertion');
      const claims = JSON.parse(Buffer.from(assertion.split('.')[1], 'base64url'));
      assert.equal(claims.scope, 'https://www.googleapis.com/auth/spreadsheets.readonly');
      return { ok: true, json: async () => ({ access_token: 'test-token', expires_in: 3600 }) };
    }
    sheetCalls++;
    assert.ok(url.startsWith('https://sheets.googleapis.com/v4/spreadsheets/test-private-sheet/values/'));
    assert.equal(options.headers.Authorization, 'Bearer test-token');
    return { ok: true, json: async () => ({ values: valid ? rows() : rows().slice(0, 3) }) };
  };
  try {
    const bad = response();
    await questionHandler({ method: 'GET' }, bad);
    assert.equal(bad.statusCode, 503);
    assert.equal(bad.headers['Cache-Control'], 'no-store');
    assert.match(bad.body.error, /15/);
    valid = true;
    for (let i = 0; i < 2; i++) {
      const res = response();
      await questionHandler({ method: 'GET' }, res);
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.source, 'sheets');
      validateQuestions(res.body.questions);
      assert.ok(!JSON.stringify(res.body).includes('test-token'));
    }
    assert.equal(tokenCalls, 1);
    assert.equal(sheetCalls, 2);
  } finally {
    globalThis.fetch = oldFetch;
    if (oldId === undefined) delete process.env.GOOGLE_SHEET_ID; else process.env.GOOGLE_SHEET_ID = oldId;
    if (oldAccount === undefined) delete process.env.GOOGLE_SERVICE_ACCOUNT_JSON; else process.env.GOOGLE_SERVICE_ACCOUNT_JSON = oldAccount;
  }
});
