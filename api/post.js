import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing post URL' });

  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    const title = $('h1').text().trim();
    const image = $('.entry-content img').first().attr('src') || null;

    let streamUrl = null;
    $('a').each((_, el) => {
      const link = $(el).attr('href');
      if (link && link.includes('hdstream4u.com/file')) {
        streamUrl = link;
        return false;
      }
    });

    res.status(200).json({ title, image, streamUrl });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch post data' });
  }
}
