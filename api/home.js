import axios from 'axios';
import cheerio from 'cheerio';

export default async function handler(req, res) {
  try {
    const { data } = await axios.get("https://hdhub4u.build/");
    const $ = cheerio.load(data);
    const posts = [];

    $('.ml-mask').each((i, el) => {
      const postUrl = $(el).parent('a').attr('href');
      const image = $(el).find('img').attr('data-original') || $(el).find('img').attr('src');
      const title = $(el).find('.ml-title').text().trim();

      if (postUrl && title && image) {
        posts.push({
          title,
          image,
          url: postUrl.startsWith('http') ? postUrl : `https://hdhub4u.build${postUrl}`
        });
      }
    });

    res.status(200).json({
      success: true,
      count: posts.length,
      posts
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
