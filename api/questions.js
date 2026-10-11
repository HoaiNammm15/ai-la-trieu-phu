import { getQuestionBank } from '../lib/questions.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ error: 'Method not allowed' }); }
  try {
    const bank = await getQuestionBank();
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60');
    return res.status(200).json({ ...bank, speechEnabled: Boolean(process.env.GOOGLE_TTS_API_KEY || process.env.GOOGLE_SERVICE_ACCOUNT_JSON) });
  } catch (error) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(503).json({ error: error.message.startsWith('Dòng') || error.message.startsWith('Kho') || error.message.startsWith('Sheet')
      ? error.message : 'Chưa tải được kho câu hỏi. Kiểm tra cấu hình Google Sheets rồi thử lại.' });
  }
}
