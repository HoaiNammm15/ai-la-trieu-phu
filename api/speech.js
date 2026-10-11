import { createHash } from 'node:crypto';
import { getQuestionBank } from '../lib/questions.js';
import { googleAccessToken } from '../lib/google.js';
import { createPhoneAdvice, getPhoneContact } from '../src/data/phoneContacts.js';

const audioCache = new Map();
export default async function handler(req, res) {
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ error: 'Method not allowed' }); }
  res.setHeader('Cache-Control', 'no-store');
  if (!process.env.GOOGLE_TTS_API_KEY && !process.env.GOOGLE_SERVICE_ACCOUNT_JSON) return res.status(503).json({ error: 'Giọng MC chưa được cấu hình.' });
  try {
    const url = new URL(req.url, 'http://localhost');
    const { questions } = await getQuestionBank();
    const q = questions.find(item => String(item.id) === url.searchParams.get('questionId'));
    if (!q) return res.status(404).json({ error: 'Không tìm thấy câu hỏi.' });
    if (url.searchParams.get('version') !== q.speechVersion) return res.status(409).json({ error: 'Câu hỏi đã được cập nhật. Giữ phụ đề của lượt hiện tại.' });
    const repeat = url.searchParams.get('repeat') === '1';
    const position = Number(url.searchParams.get('position'));
    if (!repeat && (!Number.isInteger(position) || position < 1 || position > 15)) return res.status(400).json({ error: 'Số thứ tự câu hỏi phải từ 1 đến 15.' });
    let text = repeat ? q.question
      : `Câu hỏi số ${position}. ${q.question} ${q.answers.map((a, i) => `${'ABCD'[i]}. ${a}`).join('. ')}`;
    let voice = { languageCode: 'vi-VN', name: 'vi-VN-Standard-B', ssmlGender: 'MALE' };
    if (url.searchParams.get('kind') === 'phone') {
      const contact = getPhoneContact(url.searchParams.get('contactId'));
      const answerValue = url.searchParams.get('answer');
      const answer = answerValue === null || answerValue.trim() === '' ? NaN : Number(answerValue);
      if (!contact || !Number.isInteger(answer) || answer < 0 || answer > 3) return res.status(400).json({ error: 'Liên hệ hoặc phương án tư vấn không hợp lệ.' });
      text = createPhoneAdvice(contact.id, q, answer, url.searchParams.get('confident') === '1').speech;
      voice = { languageCode: contact.voiceName.split('-').slice(0, 2).join('-'), name: contact.voiceName, ssmlGender: contact.id === 'eimi' ? 'FEMALE' : 'MALE' };
    }
    if (Buffer.byteLength(text, 'utf8') > 4500) return res.status(422).json({ error: 'Câu hỏi quá dài để đọc.' });
    const hash = createHash('sha256').update(`${voice.name}\n${text}`).digest('hex');
    let audio = audioCache.get(hash);
    if (!audio) {
      const key = process.env.GOOGLE_TTS_API_KEY;
      const headers = { 'Content-Type': 'application/json' };
      if (key) headers['X-Goog-Api-Key'] = key;
      else headers.Authorization = `Bearer ${await googleAccessToken('https://www.googleapis.com/auth/cloud-platform')}`;
      const response = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', { method: 'POST', headers,
        body: JSON.stringify({ input: { text }, voice,
          audioConfig: { audioEncoding: 'MP3', speakingRate: 0.95 } }), signal: AbortSignal.timeout(12000) });
      if (!response.ok) throw new Error('Speech unavailable');
      const data = await response.json();
      if (!data.audioContent) throw new Error('Missing audio');
      audio = Buffer.from(data.audioContent, 'base64');
      if (audioCache.size >= 100) audioCache.delete(audioCache.keys().next().value);
      audioCache.set(hash, audio);
    }
    res.setHeader('Content-Type', 'audio/mpeg');
    return res.status(200).send(audio);
  } catch { return res.status(503).json({ error: 'Chưa phát được giọng MC. Bạn có thể dùng phụ đề hoặc thử đọc lại.' }); }
}
