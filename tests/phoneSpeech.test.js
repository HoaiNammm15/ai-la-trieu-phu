import test from 'node:test';
import assert from 'node:assert/strict';
import questionHandler from '../api/questions.js';
import speechHandler from '../api/speech.js';
import { createPhoneAdvice, getPhoneContact } from '../src/data/phoneContacts.js';
import { selectPhoneVoice } from '../src/hooks/speechVoice.js';

function response() {
  return {
    headers: {}, statusCode: 200, body: null,
    setHeader(key, value) { this.headers[key] = value; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
    send(body) { this.body = body; return this; },
  };
}

async function withSpeechProvider(run) {
  const oldFetch = globalThis.fetch;
  const oldKey = process.env.GOOGLE_TTS_API_KEY;
  const oldSheet = process.env.GOOGLE_SHEET_ID;
  process.env.GOOGLE_TTS_API_KEY = 'phone-speech-test-key';
  delete process.env.GOOGLE_SHEET_ID;
  const calls = [];
  globalThis.fetch = async (url, options) => {
    const audio = Buffer.from(`mock phone audio ${calls.length + 1}`);
    calls.push({ url, method: options.method, headers: options.headers, ...JSON.parse(options.body), audio });
    return { ok: true, json: async () => ({ audioContent: audio.toString('base64') }) };
  };
  try {
    const bank = response();
    await questionHandler({ method: 'GET' }, bank);
    assert.equal(bank.statusCode, 200);
    assert.equal(bank.body.source, 'demo');
    await run({ calls, questions: bank.body.questions });
  } finally {
    globalThis.fetch = oldFetch;
    if (oldKey === undefined) delete process.env.GOOGLE_TTS_API_KEY;
    else process.env.GOOGLE_TTS_API_KEY = oldKey;
    if (oldSheet === undefined) delete process.env.GOOGLE_SHEET_ID;
    else process.env.GOOGLE_SHEET_ID = oldSheet;
  }
}

async function requestSpeech(question, overrides = {}) {
  const params = new URLSearchParams({
    questionId: String(question.id), version: question.speechVersion,
    position: '12', kind: 'phone', contactId: 'jack', answer: '1', confident: '1',
  });
  for (const [key, value] of Object.entries(overrides)) {
    if (value === null) params.delete(key);
    else params.set(key, String(value));
  }
  const res = response();
  await speechHandler({ method: 'GET', url: `/api/speech?${params}` }, res);
  return res;
}

test('phone speech uses each contact language and voice with advice from the stored question', async () => {
  await withSpeechProvider(async ({ calls, questions }) => {
    const question = questions[0];
    const mappings = [
      ['ronaldo', 'pt-PT', 'pt-PT-Standard-F', 'MALE'],
      ['messi', 'es-US', 'es-US-Standard-B', 'MALE'],
      ['jack', 'vi-VN', 'vi-VN-Standard-B', 'MALE'],
      ['sontung', 'vi-VN', 'vi-VN-Standard-B', 'MALE'],
      ['eimi', 'ja-JP', 'ja-JP-Standard-A', 'FEMALE'],
    ];
    for (const [contactId, languageCode, name, ssmlGender] of mappings) {
      const res = await requestSpeech(question, { contactId, answer: 2, text: 'Untrusted client speech text' });
      assert.equal(res.statusCode, 200, contactId);
      assert.equal(res.headers['Content-Type'], 'audio/mpeg');
      const call = calls.at(-1);
      assert.equal(call.url, 'https://texttospeech.googleapis.com/v1/text:synthesize');
      assert.equal(call.method, 'POST');
      assert.deepEqual(call.voice, { languageCode, name, ssmlGender });
      assert.equal(call.input.text, createPhoneAdvice(contactId, question, 2, true).speech);
      assert.ok(!call.input.text.includes('Untrusted client speech text'));
      assert.deepEqual(res.body, call.audio);
      if (languageCode === 'vi-VN') assert.ok(call.input.text.includes(`C: ${question.answers[2]}`));
      else assert.ok(!call.input.text.includes(question.answers[2]));
    }
    assert.equal(calls.length, 5, 'Every contact must synthesize its own advice');
    assert.equal(new Set(calls.map(call => call.input.text)).size, 5);
    assert.match(calls[0].input.text, /Olá!.*opção C/);
    assert.match(calls[1].input.text, /Che,.*opción C.*Vos tenés/);
    assert.match(calls[4].input.text, /[\u3040-\u30ff]/);
  });
});

test('identical phone advice is cached while contact, answer, and confidence changes synthesize new audio', async () => {
  await withSpeechProvider(async ({ calls, questions }) => {
    const question = questions[1];
    const options = { contactId: 'jack', answer: 3, confident: 0 };
    const first = await requestSpeech(question, options);
    const duplicate = await requestSpeech(question, options);
    const anotherPosition = await requestSpeech(question, { ...options, position: 7 });
    for (const res of [first, duplicate, anotherPosition]) assert.equal(res.statusCode, 200);
    assert.equal(calls.length, 1, 'The same spoken advice needs only one paid synthesis');
    assert.deepEqual(duplicate.body, first.body);
    assert.deepEqual(anotherPosition.body, first.body);

    const anotherContact = await requestSpeech(question, { ...options, contactId: 'sontung' });
    assert.equal(anotherContact.statusCode, 200);
    assert.equal(calls.length, 2);
    assert.notEqual(calls[1].input.text, calls[0].input.text);
    const anotherAnswer = await requestSpeech(question, { ...options, answer: 2 });
    assert.equal(anotherAnswer.statusCode, 200);
    assert.equal(calls.length, 3);
    assert.ok(calls[2].input.text.includes(`C: ${question.answers[2]}`));
    const moreConfident = await requestSpeech(question, { ...options, answer: 2, confident: 1 });
    assert.equal(moreConfident.statusCode, 200);
    assert.equal(calls.length, 4);
    assert.notEqual(calls[3].input.text, calls[2].input.text);
  });
});

test('invalid phone contacts and answers are rejected before calling the paid provider', async () => {
  await withSpeechProvider(async ({ calls, questions }) => {
    const question = questions[0];
    for (const contactId of ['unknown', '', null]) {
      const res = await requestSpeech(question, { contactId });
      assert.equal(res.statusCode, 400, `Contact ${contactId} must be rejected`);
    }
    for (const answer of [null, '', ' ', -1, 4, 1.5, 'invalid']) {
      const res = await requestSpeech(question, { answer });
      assert.equal(res.statusCode, 400, `Answer ${answer} must be rejected`);
    }
    assert.equal(calls.length, 0);
  });
});

test('phone advice rejects a changed question snapshot before synthesis', async () => {
  await withSpeechProvider(async ({ calls, questions }) => {
    const res = await requestSpeech(questions[0], { version: 'outdated-question-version' });
    assert.equal(res.statusCode, 409);
    assert.equal(calls.length, 0);
  });
});

test('regular question narration keeps the male Vietnamese host voice', async () => {
  await withSpeechProvider(async ({ calls, questions }) => {
    const question = questions[2];
    const res = await requestSpeech(question, { kind: null, position: 15 });
    assert.equal(res.statusCode, 200);
    assert.equal(calls.length, 1);
    assert.deepEqual(calls[0].voice, { languageCode: 'vi-VN', name: 'vi-VN-Standard-B', ssmlGender: 'MALE' });
    assert.ok(calls[0].input.text.startsWith(`Câu hỏi số 15. ${question.question}`));
    for (let answer = 0; answer < 4; answer++) {
      assert.ok(calls[0].input.text.includes(`${'ABCD'[answer]}. ${question.answers[answer]}`));
    }
  });
});

test('phone browser voices prefer an exact regional language before a same-language fallback', () => {
  const spanishFallback = { name: 'Spanish Spain', lang: 'es-ES' };
  const exactArgentina = { name: 'Spanish Argentina', lang: 'ES_ar' };
  const english = { name: 'English', lang: 'en-US' };
  const messi = getPhoneContact('messi');
  assert.equal(selectPhoneVoice([spanishFallback, english, exactArgentina], messi), exactArgentina);
  assert.equal(selectPhoneVoice([english, spanishFallback], messi), spanishFallback);

  const portugal = { name: 'Portuguese Portugal', lang: 'pt-PT' };
  const brazil = { name: 'Portuguese Brazil', lang: 'pt-BR' };
  const ronaldo = getPhoneContact('ronaldo');
  assert.equal(selectPhoneVoice([brazil, portugal], ronaldo), portugal);
  assert.equal(selectPhoneVoice([english, spanishFallback, brazil], ronaldo), brazil);
  assert.equal(selectPhoneVoice([english, spanishFallback], ronaldo), null);
  assert.equal(selectPhoneVoice([], ronaldo), null);
  assert.equal(selectPhoneVoice([english], null), null);
});

test('Vietnamese phone calls select only known male Vietnamese browser voices', () => {
  const female = { name: 'Microsoft HoaiMy Online (Natural)', lang: 'vi-VN' };
  const unknown = { name: 'Google Tiếng Việt', lang: 'vi-VN' };
  const englishMale = { name: 'Microsoft NamMinh Online (Natural)', lang: 'en-US' };
  const male = { name: 'Microsoft NamMinh Online (Natural)', lang: 'vi-VN' };
  for (const contactId of ['jack', 'sontung']) {
    const contact = getPhoneContact(contactId);
    assert.equal(selectPhoneVoice([female, unknown, englishMale], contact), null);
    assert.equal(selectPhoneVoice([female, unknown, englishMale, male], contact), male);
  }
});
