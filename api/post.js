import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) return res.status(400).json({ error: 'Missing url parameter' });

  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    const title = $('h1').first().text().trim();

    // Fix for image extraction
    const image = $('div.entry-content img').first().attr('src') || $('img.aligncenter').first().attr('src') || null;

    // Stream link detection
    let streamUrl = null;
    $('a').each((_, el) => {
      const text = $(el).text().toLowerCase();
      if (text.includes('watch') && $(el).attr('href')?.includes('hdstream')) {
        streamUrl = $(el).attr('href');
        return false; // Break loop
      }
    });

    res.status(200).json({ title, image, streamUrl });
  } catch (err) {
    res.status(500).json({ error: 'Scraping failed', details: err.message });
  }
}
