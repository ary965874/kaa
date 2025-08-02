import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  try {
    const response = await fetch('https://hdhub4u.build/');
    const html = await response.text();
    const $ = cheerio.load(html);

    const posts = [];

    $('div.blogbox').each((_, el) => {
      const link = $(el).find('a').attr('href');
      const img = $(el).find('img').attr('src');
      const title = $(el).find('h2').text().trim();

      if (link && img && title) {
        posts.push({ title, image: img, link });
      }
    });

    res.status(200).json({ posts });
  } catch (err) {
    res.status(500).json({ error: 'Scraping failed', details: err.message });
  }
}
