import test from 'node:test';
import assert from 'node:assert/strict';
import { phoneContacts, getPhoneContact, createPhoneAdvice, phoneSuggestion } from '../src/data/phoneContacts.js';

const question = { answers: ['Hà Nội', 'Huế', 'Đà Nẵng', 'Cần Thơ'], correct: 1 };

test('five call contacts have their own identity, language, voice, and color', () => {
  assert.deepEqual(phoneContacts.map(contact => contact.id), ['ronaldo', 'messi', 'jack', 'sontung', 'eimi']);
  assert.deepEqual(phoneContacts.map(contact => contact.name), ['Ronaldo', 'Messi', 'Jack · J97', 'Sơn Tùng M-TP', 'Eimi Fukada']);
  assert.deepEqual(phoneContacts.map(contact => contact.lang), ['pt-PT', 'es-AR', 'vi-VN', 'vi-VN', 'ja-JP']);
  assert.deepEqual(phoneContacts.map(contact => contact.fallbackLangs), [['pt'], ['es'], ['vi'], ['vi'], ['ja']]);
  assert.deepEqual(phoneContacts.map(contact => contact.voiceName), ['pt-PT-Standard-F', 'es-US-Standard-B', 'vi-VN-Standard-B', 'vi-VN-Standard-B', 'ja-JP-Standard-A']);
  assert.equal(getPhoneContact('messi').languageLabel, 'Tiếng Tây Ban Nha · Argentina');
  assert.equal(new Set(phoneContacts.map(contact => contact.color)).size, 5);
  for (const contact of phoneContacts) {
    assert.equal(getPhoneContact(contact.id), contact);
    assert.ok(contact.subtitle.length > 0 && contact.languageLabel.length > 0 && contact.initials.length > 0);
    assert.match(contact.color, /^#[0-9a-f]{6}$/i);
  }
  assert.equal(getPhoneContact('missing'), null);
});

test('native speech uses the selected letter and Vietnamese subtitles retain every full option', () => {
  for (const contact of phoneContacts) {
    for (let answer = 0; answer < 4; answer++) {
      const { speech, subtitle } = createPhoneAdvice(contact.id, question, answer);
      assert.ok(speech.includes('ABCD'[answer]), `${contact.id} speaks the selected letter`);
      assert.ok(subtitle.includes(`${'ABCD'[answer]}: ${question.answers[answer]}`));
      assert.match(subtitle, /chưa chắc|không chắc/);
      if (contact.lang === 'vi-VN') assert.ok(speech.includes(question.answers[answer]));
      else for (const text of question.answers) assert.ok(!speech.includes(text), `${contact.id} leaves Vietnamese answer text to subtitles`);
    }
  }
  assert.match(createPhoneAdvice('ronaldo', question, 0).speech, /Não tenho a certeza.*opção A/);
  assert.match(createPhoneAdvice('messi', question, 0).speech, /Che,.*No estoy del todo seguro.*opción A.*Vos tenés/);
  assert.match(createPhoneAdvice('eimi', question, 0).speech, /[\u3040-\u30ff].*はっきりとはわからないけど、A/);
});

test('confidence changes the advice wording without promising correctness', () => {
  for (const contact of phoneContacts) {
    const uncertain = createPhoneAdvice(contact.id, question, 2, false);
    const confident = createPhoneAdvice(contact.id, question, 2, true);
    assert.notEqual(confident.speech, uncertain.speech);
    assert.match(confident.subtitle, /khá tự tin/);
    assert.ok(confident.subtitle.includes('C: Đà Nẵng'));
    assert.doesNotMatch(confident.subtitle, /chắc chắn đúng|đảm bảo|100%/i);
  }
});

test('advice rejects unknown people, invalid indices, and missing options', () => {
  assert.throws(() => createPhoneAdvice('unknown', question, 1), /Unknown phone contact/);
  for (const answer of [-1, 4, 0.5, undefined, '1']) {
    assert.throws(() => createPhoneAdvice('jack', question, answer), /index must be an integer from 0 to 3/);
  }
  for (const invalid of [null, {}, { answers: ['A', 'B', 'C'] }, { answers: ['A', 'B', undefined, 'D'] }, { answers: ['A', ' ', 'C', 'D'] }, { answers: Array(4) }]) {
    assert.throws(() => createPhoneAdvice('eimi', invalid, 0), /four nonempty answer strings/);
  }
});

test('suggestions preserve the difficulty probability and confidence threshold', () => {
  assert.deepEqual(phoneSuggestion(question, [], 0, () => 0.89), { answer: 1, confident: true });
  assert.deepEqual(phoneSuggestion(question, [], 0, () => 0.9), { answer: 3, confident: false });
  assert.deepEqual(phoneSuggestion(question, [], 6, () => 0), { answer: 1, confident: true });
  assert.deepEqual(phoneSuggestion(question, [], 7, () => 0), { answer: 1, confident: false });
  assert.deepEqual(phoneSuggestion(question, [], 30, () => 0.479), { answer: 1, confident: false });
  assert.deepEqual(phoneSuggestion(question, [], 30, () => 0.48), { answer: 2, confident: false });
});

test('wrong suggestions choose only visible options after 50:50', () => {
  for (const remainingWrong of [0, 2, 3]) {
    const hidden = [0, 2, 3].filter(index => index !== remainingWrong);
    for (const random of [() => 0.95, () => 0.999]) {
      const suggestion = phoneSuggestion(question, hidden, 0, random);
      assert.deepEqual(suggestion, { answer: remainingWrong, confident: false });
      assert.ok(!hidden.includes(suggestion.answer));
    }
    assert.deepEqual(phoneSuggestion(question, hidden, 0, () => 0), { answer: 1, confident: true });
  }
});

test('with no remaining wrong options suggestions return the correct option without drawing randomness', () => {
  const random = () => assert.fail('A sole answer needs no random draw.');
  assert.deepEqual(phoneSuggestion(question, [0, 2, 3], 3, random), { answer: 1, confident: true });
  assert.deepEqual(phoneSuggestion(question, [0, 2, 3], 9, random), { answer: 1, confident: false });
});

test('advice and suggestions do not mutate caller input or shared contacts', () => {
  const frozenQuestion = Object.freeze({ answers: Object.freeze([...question.answers]), correct: 1 });
  const hidden = Object.freeze([0, 3]);
  const contactsBefore = structuredClone(phoneContacts);
  for (const contact of phoneContacts) createPhoneAdvice(contact.id, frozenQuestion, 2, true);
  phoneSuggestion(frozenQuestion, hidden, 6, () => 0.999);
  assert.deepEqual(frozenQuestion, question);
  assert.deepEqual(hidden, [0, 3]);
  assert.deepEqual(phoneContacts, contactsBefore);
});

test('suggestions reject a malformed question or hidden option indices', () => {
  assert.throws(() => phoneSuggestion({ ...question, correct: 4 }), /correct answer index/);
  assert.throws(() => phoneSuggestion({ ...question, answers: [] }), /four nonempty answer strings/);
  assert.throws(() => phoneSuggestion(question, null), /must be an array/);
  assert.throws(() => phoneSuggestion(question, [4]), /hidden answer index/);
});
