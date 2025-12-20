const http = require('http');
const fs = require('fs/promises');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const DATA_FILE = path.join(DATA_DIR, 'intake.json');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.json': 'application/json; charset=utf-8',
  '.ico': 'image/x-icon',
};

const ensureDataFile = async () => {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.access(DATA_FILE);
  } catch (error) {
    await fs.writeFile(DATA_FILE, '[]');
  }
};

const sendJson = (res, statusCode, payload) => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
};

const getSafePath = (urlPath) => {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const sanitized = decoded.replace(/\0/g, '');
  const resolved = path.normalize(path.join(ROOT, sanitized));
  if (!resolved.startsWith(ROOT)) {
    return null;
  }
  return resolved;
};

const handleIntake = async (req, res) => {
  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
  });

  req.on('end', async () => {
    try {
      const payload = JSON.parse(body || '{}');
      if (!payload.formType) {
        sendJson(res, 400, { error: 'Missing formType.' });
        return;
      }

      await ensureDataFile();
      const raw = await fs.readFile(DATA_FILE, 'utf-8');
      const data = JSON.parse(raw || '[]');
      data.push({
        id: Date.now(),
        receivedAt: new Date().toISOString(),
        ...payload,
      });

      await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));

      const messages = {
        sdvosb:
          'Thanks for submitting the SDVOSB intake. We will review fit and follow up with next steps.',
        prime:
          'Thanks for submitting the prime intake. We will review your requirements and follow up with next steps.',
        general: 'Thanks for your message. We will respond with next steps soon.',
      };

      sendJson(res, 200, { message: messages[payload.formType] || messages.general });
    } catch (error) {
      sendJson(res, 500, { error: 'Unable to store submission.' });
    }
  });
};

const server = http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.url.startsWith('/api/intake')) {
    await handleIntake(req, res);
    return;
  }

  if (req.method !== 'GET') {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Method not allowed');
    return;
  }

  let requestPath = req.url === '/' ? '/index.html' : req.url;
  const filePath = getSafePath(requestPath);
  if (!filePath) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Bad request');
    return;
  }

  try {
    const stats = await fs.stat(filePath);
    let resolvedPath = filePath;
    if (stats.isDirectory()) {
      resolvedPath = path.join(filePath, 'index.html');
    }
    const ext = path.extname(resolvedPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const file = await fs.readFile(resolvedPath);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(file);
  } catch (error) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`PrimePartner site running at http://localhost:${PORT}`);
});
