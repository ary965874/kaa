import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url || !url.includes('hubdrive.space/file/')) {
    return res.status(400).json({ error: 'Invalid or missing ?url= parameter' });
  }

  try {
    // Step 1: Fetch hubdrive page
    const r1 = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html1 = await r1.text();
    const $ = cheerio.load(html1);

    // Step 2: Find HubCloud drive URL
    const hubcloudUrl = $('a.btn-success1[href*="hubcloud.one/drive/"]').attr('href');
    if (!hubcloudUrl) {
      return res.status(404).json({ error: 'HubCloud link not found' });
    }

    // Step 3: Fetch HubCloud drive page
    const r2 = await fetch(hubcloudUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html2 = await r2.text();
    const $$ = cheerio.load(html2);

    // Step 4: Extract the "Generate Direct Download Link"
    const generatorUrl = $$('a#download').attr('href');
    if (!generatorUrl) {
      return res.status(404).json({ error: 'Download generator link not found' });
    }

    // Step 5: Follow the generator URL (hubcloud.php)
    const r3 = await fetch(generatorUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html3 = await r3.text();
    const $$$ = cheerio.load(html3);

    // Step 6: Try to extract final FSL URL
    const finalDownloadUrl = $$$('a#fsl').attr('href');

    // Response
    return res.status(200).json({
      input: url,
      hubcloud: hubcloudUrl,
      generator: generatorUrl,
      final: finalDownloadUrl || null,
      fallback: finalDownloadUrl ? null : generatorUrl,
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Bypass failed',
      message: err.message,
    });
  }
}
