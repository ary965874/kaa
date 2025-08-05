import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url || !url.includes('hubcloud.one/drive/')) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid or missing ?url= parameter. Must include hubcloud.one/drive/',
    });
  }

  try {
    const logs = [];
    logs.push({ step: 'start', message: `Fetching: ${url}` });

    // Step 1: Fetch the page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'text/html',
        'Referer': 'https://google.com',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({
        status: 'error',
        message: `Failed to fetch the page. Status: ${response.status}`,
      });
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Step 2: Look for <a id="download">
    const downloadHref = $('a#download').attr('href');
    logs.push({ step: 'parse', foundHref: downloadHref || null });

    if (!downloadHref) {
      return res.status(404).json({
        status: 'error',
        message: '❌ Download link (#download) not found.',
        logs,
      });
    }

    // Step 3: Construct full URL
    const finalUrl = downloadHref.startsWith('http')
      ? downloadHref
      : `https://hubcloud.one${downloadHref}`;

    logs.push({ step: 'success', message: '✅ Final download URL found.', finalUrl });

    return res.status(200).json({ status: 'success', finalUrl, logs });
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: '❌ Unhandled exception occurred.',
      error: err.message,
    });
  }
}
