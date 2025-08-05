const cheerio = require('cheerio');
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const { url } = req.query;

  if (!url || !url.startsWith('http')) {
    return res.status(400).json({ error: '❌ Invalid or missing `url` parameter' });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://google.com',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1'
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `❌ Failed to fetch page. Status ${response.status}` });
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const downloadBtn = $('a#download').attr('href');

    if (downloadBtn) {
      const finalUrl = downloadBtn.startsWith('http') ? downloadBtn : 'https://hubcloud.one' + downloadBtn;
      return res.status(200).json({ success: true, url: finalUrl });
    } else {
      return res.status(404).json({ error: '❌ Download link not found.' });
    }
  } catch (err) {
    return res.status(500).json({ error: '❌ Exception: ' + err.message });
  }
};
