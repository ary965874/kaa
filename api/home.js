import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  try {
    const response = await fetch('https://hdhub4u.build');
    const html = await response.text();
    const $ = cheerio.load(html);

    const posts = [];

    $('.img_box').each((i, el) => {
      const img = $(el).find('img').attr('src');
      const title = $(el).find('img').attr('alt');
      const postUrl = $(el).parent('a').attr('href');

      if (img && title && postUrl) {
        posts.push({
          title: title.trim(),
          image: img,
          url: postUrl
        });
      }
    });

    res.status(200).json({ posts });
  } catch (error) {
    res.status(500).json({ error: 'Failed to scrape home page' });
  }
}
