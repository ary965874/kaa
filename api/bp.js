import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url || !url.includes('hubdrive.space/file/')) {
    return res.status(400).json({
      step: 'validation',
      status: 'error',
      message: 'Invalid or missing ?url= parameter. Must include hubdrive.space/file/',
    });
  }

  try {
    const logs = [];
    logs.push({ step: 'start', message: 'Starting bypass for: ' + url });

    // Step 1: Fetch HubDrive page
    const r1 = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html1 = await r1.text();
    const $ = cheerio.load(html1);

    // Step 2: Find HubCloud drive link
    const hubcloudUrl = $('a.btn-success1[href*="hubcloud.one/drive/"]').attr('href');
    if (!hubcloudUrl) {
      logs.push({ step: 'hubcloud', status: 'error', message: 'HubCloud drive link not found.' });
      return res.status(404).json({ logs });
    }

    logs.push({ step: 'hubcloud', status: 'success', message: 'Found HubCloud link.', hubcloudUrl });

    // Step 3: Fetch HubCloud drive page
    const r2 = await fetch(hubcloudUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html2 = await r2.text();
    const $$ = cheerio.load(html2);

    // Step 4: Get generator.php URL
    const generatorUrl = $$('a#download').attr('href');
    if (!generatorUrl) {
      logs.push({ step: 'generator', status: 'error', message: 'Download generator link (#download) not found.' });
      return res.status(404).json({ logs, hubcloudUrl });
    }

    logs.push({ step: 'generator', status: 'success', message: 'Found download generator link.', generatorUrl });

    // Step 5: Fetch generator page
    const r3 = await fetch(generatorUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html3 = await r3.text();
    const $$$ = cheerio.load(html3);

    // Step 6: Final FSL download link
    const finalUrl = $$$('a#fsl').attr('href');
    if (!finalUrl) {
      logs.push({
        step: 'final',
        status: 'warning',
        message: 'FSL link not found. Using generator.php URL as fallback.',
        fallback: generatorUrl,
      });
      return res.status(200).json({ logs, input: url, final: null, fallback: generatorUrl });
    }

    logs.push({ step: 'final', status: 'success', message: 'Found final FSL download link.', finalUrl });

    // Success
    return res.status(200).json({ logs, input: url, final: finalUrl, fallback: null });
  } catch (err) {
    return res.status(500).json({
      step: 'exception',
      status: 'error',
      message: 'Unhandled exception',
      error: err.message,
    });
  }
}
