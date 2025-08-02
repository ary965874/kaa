import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  try {
    const response = await fetch('https://hdhub4u.build');
    const html = await response.text();
    const $ = cheerio.load(html);

    const posts = [];

    $('article').each((i, el) => {
      const postUrl = $(el).find('a').first().attr('href');
      const image = $(el).find('img').first().attr('src');
      const title = $(el).find('img').first().attr('alt')?.trim();

      if (postUrl && image && title) {
        posts.push({ title, image, url: postUrl });
      }
    });

    res.status(200).json({ posts });
  } catch (err) {
    res.status(500).json({ error: 'Failed to scrape home page', details: err.message });
  }
}
