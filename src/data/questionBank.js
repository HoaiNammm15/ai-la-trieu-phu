export function validateQuestions(questions) {
  if (!Array.isArray(questions) || !questions.length) throw new Error('Kho câu hỏi đang trống.');
  const ids = new Set();
  for (const q of questions) {
    if (!q || !['string', 'number'].includes(typeof q.id) || !String(q.id).trim() || ids.has(String(q.id))
      || (q.level != null && (!Number.isInteger(q.level) || q.level < 1 || q.level > 15))
      || typeof q.question !== 'string' || !q.question.trim()
      || !Array.isArray(q.answers) || q.answers.length !== 4 || q.answers.some(a => typeof a !== 'string' || !a.trim())
      || new Set(q.answers.map(a => a.normalize('NFC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('vi'))).size !== 4
      || !Number.isInteger(q.correct) || q.correct < 0 || q.correct > 3
      || typeof q.category !== 'string' || !q.category.trim() || typeof q.explanation !== 'string' || !q.explanation.trim()) {
      throw new Error('Kho câu hỏi có câu thiếu dữ liệu, trùng ID hoặc có đáp án không hợp lệ.');
    }
    ids.add(String(q.id));
  }
  if (questions.length < 15) throw new Error('Kho câu hỏi cần ít nhất 15 câu đang bật để bắt đầu lượt chơi.');
  return questions;
}

export const questionStages = [
  { min: 1, max: 5, count: 5, name: 'dễ' },
  { min: 6, max: 10, count: 5, name: 'trung bình' },
  { min: 11, max: 15, count: 5, name: 'khó' },
];

export function validateQuestionBank(questions) {
  validateQuestions(questions);
  if (questions.some(q => q.level == null)) {
    throw new Error('Kho câu hỏi cần level từ 1 đến 15 cho mỗi câu đang bật.');
  }
  for (const stage of questionStages) {
    const count = questions.filter(q => q.level >= stage.min && q.level <= stage.max).length;
    if (count < stage.count) {
      throw new Error(`Kho câu hỏi cần ít nhất ${stage.count} câu ${stage.name} (level ${stage.min}–${stage.max}) đang bật; hiện có ${count} câu.`);
    }
  }
  return questions;
}

export function parseSheetRows(rows) {
  const required = ['id', 'question', 'a', 'b', 'c', 'd', 'correct', 'category', 'explanation', 'active'];
  const headers = (rows[0] || []).map(value => String(value).trim().toLowerCase());
  if (required.some(name => !headers.includes(name))) throw new Error('Sheet thiếu cột bắt buộc.');
  const questions = rows.slice(1).flatMap((row, index) => {
    if (!row.some(value => String(value).trim())) return [];
    const get = name => String(row[headers.indexOf(name)] ?? '').trim();
    const active = get('active').toLowerCase();
    if (active === 'false') return [];
    if (active !== 'true') throw new Error(`Dòng ${index + 2}: active phải là TRUE hoặc FALSE.`);
    const letter = get('correct').toUpperCase();
    if (!/^[ABCD]$/.test(letter)) throw new Error(`Dòng ${index + 2}: correct phải là A, B, C hoặc D.`);
    return [{ id: get('id'), level: get('level') ? Number(get('level')) : null, question: get('question'),
      answers: ['a', 'b', 'c', 'd'].map(get), correct: 'ABCD'.indexOf(letter), category: get('category'), explanation: get('explanation') }];
  });
  return validateQuestionBank(questions);
}

export function createRound(bank, random = Math.random) {
  validateQuestionBank(bank);
  return questionStages.flatMap(stage => {
    const pool = bank.filter(q => q.level >= stage.min && q.level <= stage.max);
    // Pick five without replacement in each stage; leave the source bank intact.
    for (let i = 0; i < stage.count; i++) {
      const j = i + Math.floor(random() * (pool.length - i));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, stage.count).sort((a, b) => a.level - b.level);
  });
}
