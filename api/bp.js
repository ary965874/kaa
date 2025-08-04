import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url || !url.startsWith('https://hubdrive.space/file/')) {
    return res.status(400).json({ error: 'Invalid or missing hubdrive URL' });
  }

  try {
    // Step 1: Fetch HubDrive page
    const r1 = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html1 = await r1.text();
    const $ = cheerio.load(html1);

    // Step 2: Extract HubCloud link
    const hubcloudUrl = $('a.btn-success1[href*="hubcloud.one/drive/"]').attr('href');
    if (!hubcloudUrl) {
      return res.status(404).json({ error: 'HubCloud link not found' });
    }

    // Step 3: Fetch HubCloud page
    const r2 = await fetch(hubcloudUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html2 = await r2.text();
    const $$ = cheerio.load(html2);

    // Step 4: Extract FSL download link
    const finalUrl = $$('a#fsl').attr('href');
    if (!finalUrl) {
      return res.status(404).json({ error: 'Final download link not found' });
    }

    // Respond with all steps
    res.status(200).json({
      original: url,
      hubcloud: hubcloudUrl,
      direct: finalUrl
    });
  } catch (err) {
    res.status(500).json({ error: 'Bypass failed', details: err.message });
  }
}
