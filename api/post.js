import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) return res.status(400).json({ error: 'Missing url parameter' });

  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    const title = $('h1').text().trim();
    const mainImage = $('.entry-content img').first().attr('src') || null;

    let streamUrl = null;
    $('a').each((_, a) => {
      const text = $(a).text().trim().toLowerCase();
      if (text.includes('watch') && $(a).attr('href')) {
        streamUrl = $(a).attr('href');
        return false; // break loop
      }
    });

    res.status(200).json({ title, image: mainImage, streamUrl });
  } catch (err) {
    res.status(500).json({ error: 'Scraping failed', details: err.message });
  }
}
