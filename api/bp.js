import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  const { url } = req.query;

  const debug = {
    original: url || null,
    hubcloudPageHtmlPreview: null,
    extracted: {
      hubcloudLink: null,
      finalDownloadLink: null
    },
    error: null
  };

  if (!url || !url.startsWith('https://hubdrive.space/file/')) {
    debug.error = 'Invalid or missing hubdrive URL';
    return res.status(400).json(debug);
  }

  try {
    // Step 1: Fetch HubDrive Page
    console.log(`➡️ Fetching HubDrive URL: ${url}`);
    const r1 = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html1 = await r1.text();
    const $ = cheerio.load(html1);

    // Step 2: Extract HubCloud link
    const hubcloudUrl = $('a.btn-success1[href*="hubcloud.one/drive/"]').attr('href');
    debug.extracted.hubcloudLink = hubcloudUrl || null;

    if (!hubcloudUrl) {
      debug.error = 'HubCloud link not found on HubDrive page';
      console.log('❌ HubCloud link not found.');
      return res.status(200).json(debug);
    }

    // Step 3: Fetch HubCloud Page
    console.log(`➡️ Fetching HubCloud URL: ${hubcloudUrl}`);
    const r2 = await fetch(hubcloudUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html2 = await r2.text();
    const $$ = cheerio.load(html2);

    // Step 4: Extract Final Direct Download Link
    const finalUrl =
      $$('a#fsl').attr('href') ||
      $$('a.btn-success[href*=".mkv"]').attr('href') ||
      $$('a:contains("Download")').attr('href');

    debug.extracted.finalDownloadLink = finalUrl || null;

    // Preview the HTML in case it helps debugging (only first 300 chars)
    debug.hubcloudPageHtmlPreview = html2.slice(0, 300);

    if (!finalUrl) {
      debug.error = 'Final download link not found on HubCloud page';
      console.log('❌ Final download link not found.');
      return res.status(200).json(debug);
    }

    console.log('✅ Final download link found:', finalUrl);
    res.status(200).json(debug);
  } catch (err) {
    debug.error = err.message;
    console.error('❌ Error:', err);
    res.status(500).json(debug);
  }
}
