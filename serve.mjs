// Local test server: serves ./dist and an oEmbed endpoint.
//   node serve.mjs            -> http://localhost:8787
//   GET /<slug>/              -> embed page (with oEmbed discovery link)
//   GET /<slug>/oembed.json   -> static oEmbed
//   GET /oembed?url=<page>    -> oEmbed endpoint (standard query form)
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORT = Number(process.env.PORT || 8787);
const DIST = fileURLToPath(new URL('./dist/', import.meta.url));
const types = { '.html': 'text/html; charset=utf-8', '.json': 'application/json; charset=utf-8' };

createServer(async (req, res) => {
  const u = new URL(req.url, `http://localhost:${PORT}`);
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    if (u.pathname === '/oembed') {
      const target = new URL(u.searchParams.get('url') || '');
      const slug = target.pathname.split('/').filter(Boolean)[0];
      const body = await readFile(join(DIST, slug, 'oembed.json'));
      res.writeHead(200, { 'Content-Type': types['.json'] });
      return res.end(body);
    }
    let p = normalize(decodeURIComponent(u.pathname)).replace(/^(\.\.[/\\])+/, '');
    if (p.endsWith('/')) p += 'index.html';
    const file = join(DIST, p);
    if (!file.startsWith(DIST)) throw new Error('forbidden');
    const body = await readFile(file);
    const ext = file.slice(file.lastIndexOf('.'));
    res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('not found');
  }
}).listen(PORT, () => console.log(`Puzzlr oEmbed server on http://localhost:${PORT}`));
