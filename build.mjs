// Generates static oEmbed files for Puzzlr teaser embeds.
// Usage: node build.mjs   -> writes ./dist/<slug>/index.html and ./dist/<slug>/oembed.json
import { readFileSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';

const { baseUrl, games } = JSON.parse(readFileSync(new URL('./games.json', import.meta.url)));
const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

rmSync('dist', { recursive: true, force: true });

for (const g of games) {
  const params = new URLSearchParams({ game: g.game, 'game-tenant': g.tenant, 'game-id': g.gameId });
  const playUrl = `https://game.puzzlr.net/?${params}`;
  const iframeSrc = `https://game.puzzlr.net/iframe?${params}&game-variant=teaser`;
  const pageUrl = `${baseUrl}/${g.slug}/`;
  const oembedUrl = `${baseUrl}/${g.slug}/oembed.json`;
  const name = `puzzlr-${g.slug}`;

  const iframe =
    `<iframe name="${name}" id="${name}" src="${esc(iframeSrc)}" title="${esc(g.title)}" ` +
    `style="width:100%;aspect-ratio:16/9;max-width:520px;margin:0 auto;display:block;border:0" ` +
    `allow="autoplay; clipboard-write; web-share"></iframe>`;

  const oembed = {
    version: '1.0',
    type: 'rich',
    provider_name: 'BILD Games',
    provider_url: 'https://www.bild.de/',
    title: g.title,
    width: 520,
    height: 293,
    html: iframe,
  };

  const page = `<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <title>${esc(g.title)} – BILD Games</title>
  <link rel="alternate" type="application/json+oembed" href="${esc(oembedUrl)}" title="${esc(g.title)}">
  <meta property="og:title" content="${esc(g.title)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${esc(pageUrl)}">
  <meta name="twitter:card" content="player">
  <meta name="twitter:player" content="${esc(iframeSrc)}">
  <meta name="twitter:player:width" content="520">
  <meta name="twitter:player:height" content="293">
  <link rel="canonical" href="${esc(pageUrl)}">
  <style>body{margin:0;padding:24px;font-family:sans-serif}</style>
</head>
<body>
  ${iframe}
  <p style="text-align:center"><a href="${esc(playUrl)}">${esc(g.title)} spielen</a></p>
</body>
</html>
`;

  mkdirSync(`dist/${g.slug}`, { recursive: true });
  writeFileSync(`dist/${g.slug}/oembed.json`, JSON.stringify(oembed, null, 2));
  writeFileSync(`dist/${g.slug}/index.html`, page);
  console.log(`✓ ${g.slug}\n  CMS-URL: ${pageUrl}\n  oEmbed:  ${oembedUrl}`);
}
