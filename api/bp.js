import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing url parameter' });

  const API_KEY = '57e9758e150311f9e07c9923e5731678';
  const proxyUrl = `http://api.scraperapi.com?api_key=${API_KEY}&url=${encodeURIComponent(url)}`;

  try {
    const r = await fetch(proxyUrl);
    if (!r.ok) return res.status(r.status).json({ error: `Proxy fetch failed (${r.status})` });

    const html = await r.text();
    const $ = cheerio.load(html);
    const href = $('a#download').attr('href');
    if (!href) return res.status(404).json({ error: 'Download link not found' });

    const finalUrl = href.startsWith('http') ? href : `https://hubcloud.one${href}`;
    return res.json({ success: true, finalUrl });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
