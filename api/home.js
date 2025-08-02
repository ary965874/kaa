import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  const url = 'https://hdhub4u.build/';

  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    const posts = [];

    $('li.thumb.col-md-2.col-sm-4.col-xs-6').each((_, el) => {
      const img = $(el).find('img').attr('src') || '';
      const link = $(el).find('a').attr('href') || '';
      const title = $(el).find('figcaption p').text().trim() || '';

      if (img && link && title) {
        posts.push({
          title,
          image: img,
          url: link
        });
      }
    });

    res.status(200).json({ posts });
  } catch (err) {
    res.status(500).json({ error: 'Scraping failed', details: err.message });
  }
}
