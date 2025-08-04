import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).send("Missing ?url= parameter");
  }

  try {
    const headers = { 'User-Agent': 'Mozilla/5.0' };

    // Case 1: Direct bypass for /player/ links
    if (url.includes('hubcloud.one/player/')) {
      const r = await fetch(url, { headers });
      const html = await r.text();
      const $ = cheerio.load(html);
      const downloadUrl = $('a#download').attr('href');

      if (downloadUrl) {
        const finalUrl = downloadUrl.startsWith('http') ? downloadUrl : 'https://hubcloud.one' + downloadUrl;
        return res.redirect(finalUrl);
      } else {
        return res.status(404).send("❌ Download link not found.");
      }
    }

    // Case 2: hubdrive.space/file/
    if (!url.includes('hubdrive.space/file/')) {
      return res.status(400).send("Invalid URL format");
    }

    // Step 1: Fetch hubdrive page
    const r1 = await fetch(url, { headers });
    const html1 = await r1.text();
    const $ = cheerio.load(html1);

    // Step 2: Get hubcloud drive link
    const hubcloudUrl = $('a.btn-success1[href*="hubcloud.one/drive/"]').attr('href');
    if (!hubcloudUrl) return res.status(404).send("❌ HubCloud link not found.");

    // Step 3: Open hubcloud page
    const r2 = await fetch(hubcloudUrl, { headers });
    const html2 = await r2.text();
    const $$ = cheerio.load(html2);

    // Step 4: Find download generator
    const generatorUrl = $$('a#download').attr('href');
    if (!generatorUrl) return res.status(404).send("❌ Generator link not found.");

    // Step 5: Open generator.php page
    const r3 = await fetch(generatorUrl, { headers });
    const html3 = await r3.text();
    const $$$ = cheerio.load(html3);

    // Step 6: Find final FSL link
    const finalUrl = $$$('a#fsl').attr('href');
    if (!finalUrl) return res.status(404).send("❌ FSL download link not found.");

    // ✅ Return final URL only
    return res.redirect(finalUrl);

  } catch (err) {
    return res.status(500).send("❌ Error: " + err.message);
  }
}
