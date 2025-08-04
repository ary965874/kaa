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
    const image =
      $('div.entry-content img').first().attr('src') ||
      $('img.aligncenter').first().attr('src') ||
      null;

    let streamUrl = null;
    $('a').each((_, el) => {
      const text = $(el).text().toLowerCase();
      const href = $(el).attr('href');
      if (text.includes('watch') && href?.includes('hdstream')) {
        streamUrl = href;
        return false;
      }
    });

    const downloadLinks = [];
    $('a').each((_, el) => {
      const href = $(el).attr('href');
      const text = $(el).text();

      if (href?.includes('hubdrive.space/file/')) {
        const qualityMatch = text.match(/(1080p|720p|480p|360p)/i);
        if (qualityMatch) {
          downloadLinks.push({
            name: qualityMatch[1],
            url: href
          });
        }
      }
    });

    res.status(200).json({ title, image, streamUrl, downloadLinks });
  } catch (err) {
    res.status(500).json({ error: 'Scraping failed', details: err.message });
  }
}
