import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

// STEP 2 → bypass hubdrive → hubcloud → fsl
async function bypassHubDrive(hubdriveUrl) {
  try {
    const res = await fetch(hubdriveUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });
    const html = await res.text();
    const $ = cheerio.load(html);

    // Find HubCloud Server link
    const hubcloudUrl = $('a.btn-success1[href*="hubcloud.one/drive/"]').attr('href');
    if (!hubcloudUrl) {
      console.warn('⚠️ HubCloud link not found at:', hubdriveUrl);
      return null;
    }

    // STEP 3 → open hubcloud
    const res2 = await fetch(hubcloudUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });
    const html2 = await res2.text();
    const $$ = cheerio.load(html2);

    // STEP 4 → find final link
    const finalUrl = $$('a#fsl').attr('href');
    if (!finalUrl) {
      console.warn('⚠️ Final FSL link not found at:', hubcloudUrl);
    }

    return finalUrl || null;
  } catch (err) {
    console.error('❌ Bypass failed for', hubdriveUrl, err.message);
    return null;
  }
}

// MAIN API HANDLER
export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing url parameter' });

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });
    const html = await response.text();
    const $ = cheerio.load(html);

    const title = $('h1').first().text().trim();
    const image =
      $('div.entry-content img').first().attr('src') ||
      $('img.aligncenter').first().attr('src') ||
      null;

    // Extract stream URL
    let streamUrl = null;
    $('a').each((_, el) => {
      const text = $(el).text().toLowerCase();
      const href = $(el).attr('href');
      if (text.includes('watch') && href?.includes('hdstream')) {
        streamUrl = href;
        return false;
      }
    });

    const downloadLinks = [];

    const linkPromises = [];

    // Extract all hubdrive links
    $('a').each((_, el) => {
      const href = $(el).attr('href');
      const text = $(el).text();

      if (href?.includes('hubdrive.space/file/')) {
        const qualityMatch = text.match(/(1080p|720p|480p|360p)/i);
        if (qualityMatch) {
          const quality = qualityMatch[1];

          // Start bypass
          linkPromises.push(
            bypassHubDrive(href).then((finalLink) => {
              if (finalLink) {
                downloadLinks.push({
                  name: quality,
                  url: finalLink,
                });
              }
            })
          );
        }
      }
    });

    await Promise.all(linkPromises);

    res.status(200).json({
      title,
      image,
      streamUrl,
      downloadLinks,
    });
  } catch (err) {
    res.status(500).json({ error: 'Scraping failed', details: err.message });
  }
}
