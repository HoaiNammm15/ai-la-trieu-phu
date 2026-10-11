export function validateQuestions(questions) {
  if (!Array.isArray(questions) || !questions.length) throw new Error('Kho câu hỏi đang trống.');
  const ids = new Set();
  for (const q of questions) {
    if (!q || !['string', 'number'].includes(typeof q.id) || !String(q.id).trim() || ids.has(String(q.id))
      || (q.level != null && (!Number.isInteger(q.level) || q.level < 1 || q.level > 15))
      || typeof q.question !== 'string' || !q.question.trim()
      || !Array.isArray(q.answers) || q.answers.length !== 4 || q.answers.some(a => typeof a !== 'string' || !a.trim())
      || !Number.isInteger(q.correct) || q.correct < 0 || q.correct > 3
      || typeof q.category !== 'string' || !q.category.trim() || typeof q.explanation !== 'string' || !q.explanation.trim()) {
      throw new Error('Câu hỏi thiếu dữ liệu, trùng ID hoặc có đáp án không hợp lệ.');
    }
    ids.add(String(q.id));
  }
  if (questions.length < 15) throw new Error('Kho câu hỏi cần ít nhất 15 câu đang bật để bắt đầu lượt chơi.');
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
  return validateQuestions(questions);
}

export function createRound(bank, random = Math.random) {
  validateQuestions(bank);
  const shuffled = [...bank];
  // Sample without replacement from the entire bank, preserving the stored source.
  for (let i = 0; i < 15; i++) {
    const j = i + Math.floor(random() * (shuffled.length - i));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, 15);
}
