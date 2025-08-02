import axios from 'axios';
import cheerio from 'cheerio';

export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).json({ success: false, message: "Missing 'url' query param." });

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const title = $('h1.entry-title').text().trim();
    const image = $('.entry-content img').first().attr('src');

    let streamUrl = null;
    $('.entry-content a').each((i, el) => {
      const linkText = $(el).text().toLowerCase();
      if (linkText.includes("watch") || linkText.includes("stream")) {
        streamUrl = $(el).attr('href');
        return false;
      }
    });

    res.status(200).json({
      success: true,
      title,
      image,
      streamUrl
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
