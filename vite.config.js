import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import questions from './api/questions.js';
import speech from './api/speech.js';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'GOOGLE_');
  for (const [key, value] of Object.entries(env)) process.env[key] = value;
  return { plugins: [react(), {
    name: 'local-game-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = req.url?.split('?')[0];
        const handler = path === '/api/questions' ? questions : path === '/api/speech' ? speech : null;
        if (!handler) return next();
        res.status = code => { res.statusCode = code; return res; };
        res.json = body => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(body)); return res; };
        res.send = body => { res.end(body); return res; };
        Promise.resolve(handler(req, res)).catch(next);
      });
    },
  }] };
});
