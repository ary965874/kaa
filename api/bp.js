import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url || !url.includes('hubcloud.one/drive/')) {
    return res.status(400).json({
      step: 'validation',
      status: 'error',
      message: 'Missing or invalid ?url= parameter. Must be a hubcloud.one/drive/ link.',
    });
  }

  const logs = [];

  try {
    logs.push({ step: 'start', message: 'Starting with HubCloud page: ' + url });

    // Step 1: Fetch the hubcloud.one/drive page
    const r1 = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html1 = await r1.text();
    const $ = cheerio.load(html1);

    // Step 2: Find generator link (#download)
    const generatorUrl = $('a#download').attr('href');
    if (!generatorUrl) {
      logs.push({ step: 'download-button', status: 'error', message: 'No #download link found on HubCloud page.' });
      return res.status(404).json({ logs, hubcloudUrl: url });
    }

    logs.push({ step: 'download-button', status: 'success', message: 'Found generator link.', generatorUrl });

    // Step 3: Fetch generator.php page
    const r2 = await fetch(generatorUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html2 = await r2.text();
    const $$ = cheerio.load(html2);

    // Step 4: Find final .mkv link with id="fsl"
    const finalUrl = $$('a#fsl').attr('href');
    if (!finalUrl) {
      logs.push({ step: 'fsl-link', status: 'error', message: 'FSL download link (#fsl) not found on generator page.' });
      return res.status(404).json({ logs, generatorUrl });
    }

    logs.push({ step: 'fsl-link', status: 'success', message: 'Found final download link.', finalUrl });

    // Success response
    return res.status(200).json({
      input: url,
      generatorUrl,
      finalUrl,
      logs,
    });
  } catch (err) {
    return res.status(500).json({
      step: 'exception',
      status: 'error',
      message: 'Unhandled exception occurred.',
      error: err.message,
      logs,
    });
  }
}
