export const config = {
  runtime: "nodejs"
};

import cheerio from "cheerio";
import fetch from "node-fetch";

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url || !url.startsWith("http")) {
    return res.status(400).json({ error: "Missing or invalid URL parameter" });
  }

  try {
    const response = await fetch(url);
    const body = await response.text();
    const $ = cheerio.load(body);

    const title = $("img[post-id]").attr("alt") || "";
    const image = $("img[post-id]").attr("src") || "";
    let streamUrl = null;

    $("a").each((_, el) => {
      const text = $(el).text().toLowerCase().trim();
      if (text.includes("watch")) {
        streamUrl = $(el).attr("href");
      }
    });

    res.status(200).json({ title, image, streamUrl });
  } catch (err) {
    console.error("Post scraper error:", err.message);
    res.status(500).json({ error: "Failed to fetch post data", details: err.message });
  }
}
