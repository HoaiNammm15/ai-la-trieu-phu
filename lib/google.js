import { createSign } from 'node:crypto';

const tokens = new Map();
export async function googleAccessToken(scope) {
  const cached = tokens.get(scope);
  if (cached && cached.expires > Date.now() + 60000) return cached.token;
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON || '{}');
  if (!credentials.client_email || !credentials.private_key) throw new Error('Thiếu cấu hình tài khoản Google.');
  const now = Math.floor(Date.now() / 1000);
  const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
  const payload = `${encode({ alg: 'RS256', typ: 'JWT' })}.${encode({ iss: credentials.client_email,
    scope, aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 })}`;
  const signature = createSign('RSA-SHA256').update(payload).sign(credentials.private_key, 'base64url');
  const response = await fetch('https://oauth2.googleapis.com/token', { method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${payload}.${signature}` }),
    signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error('Không thể xác thực Google.');
  const data = await response.json();
  if (!data.access_token) throw new Error('Google không trả về token.');
  tokens.set(scope, { token: data.access_token, expires: Date.now() + data.expires_in * 1000 });
  return data.access_token;
}
