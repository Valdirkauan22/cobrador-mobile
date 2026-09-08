import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function validateAppsScriptUrl(value: string): URL {
  const url = new URL(value);
  const allowedHosts = new Set(['script.google.com', 'script.googleusercontent.com']);
  if (url.protocol !== 'https:' || !allowedHosts.has(url.hostname)) {
    throw new Error('Somente URLs HTTPS do Google Apps Script são permitidas.');
  }
  if (url.hostname === 'script.google.com' && !url.pathname.startsWith('/macros/s/')) {
    throw new Error('URL inválida do Google Apps Script.');
  }
  return url;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Health route
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', app: 'Cobrador Mobile' });
  });

  // Google Sheets Proxy GET
  app.get('/api/sheets', async (req, res) => {
    try {
      const targetUrl = req.query.url as string;
      if (!targetUrl) {
        return res.status(400).json({ ok: false, erro: 'Parâmetro url é obrigatório' });
      }

      const urlObj = validateAppsScriptUrl(targetUrl);
      for (const [key, value] of Object.entries(req.query)) {
        if (key !== 'url' && typeof value === 'string') {
          urlObj.searchParams.set(key, value);
        }
      }

      const response = await fetch(urlObj.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'User-Agent': 'CobradorMobile/8.2',
        },
        redirect: 'follow',
      });

      const text = await response.text();
      try {
        const json = JSON.parse(text);
        return res.json(json);
      } catch {
        return res.send(text);
      }
    } catch (err: any) {
      console.error('Erro no proxy GET /api/sheets:', err);
      return res.status(500).json({ ok: false, erro: err.message || 'Erro ao conectar com Google Apps Script' });
    }
  });

  // Google Sheets Proxy POST
  app.post('/api/sheets', async (req, res) => {
    try {
      const { url: targetUrl, ...payload } = req.body;
      if (!targetUrl) {
        return res.status(400).json({ ok: false, erro: 'Parâmetro url é obrigatório' });
      }

      // Google Apps Script doPost parses JSON from postData.contents or text/plain
      const safeUrl = validateAppsScriptUrl(targetUrl);
      const response = await fetch(safeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
          'Accept': 'application/json, text/plain, */*',
          'User-Agent': 'CobradorMobile/8.2',
        },
        body: JSON.stringify(payload),
        redirect: 'follow',
      });

      const text = await response.text();
      try {
        const json = JSON.parse(text);
        return res.json(json);
      } catch {
        return res.send(text);
      }
    } catch (err: any) {
      console.error('Erro no proxy POST /api/sheets:', err);
      return res.status(500).json({ ok: false, erro: err.message || 'Erro ao conectar com Google Apps Script' });
    }
  });

  // Vite middleware in development vs static dist for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Cobrador Mobile server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
