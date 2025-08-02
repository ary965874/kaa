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

    // Image extraction
    const image = $('div.entry-content img').first().attr('src') || $('img.aligncenter').first().attr('src') || null;

    // Stream URL extraction
    let streamRawUrl = null;
    $('a').each((_, el) => {
      const text = $(el).text().toLowerCase();
      const href = $(el).attr('href');
      if (text.includes('watch') && href?.includes('hdstream')) {
        streamRawUrl = href;
        return false; // Break
      }
    });

    // Convert to embed format
    let streamUrl = null;
    if (streamRawUrl && streamRawUrl.includes('/file/')) {
      const id = streamRawUrl.split('/file/')[1];
      streamUrl = `https://ary965874.github.io/12365/player.html?video=https://hdstream4u.com/embed/${id}`;
    }

    res.status(200).json({ title, image, streamUrl });
  } catch (err) {
    res.status(500).json({ error: 'Scraping failed', details: err.message });
  }
}
