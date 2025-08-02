export const config = {
  runtime: "nodejs"
};

import cheerio from "cheerio";

export default async function handler(req, res) {
  try {
    const response = await fetch("https://hdhub4u.build");
    const body = await response.text();
    const $ = cheerio.load(body);

    const posts = [];

    $("a").each((_, el) => {
      const link = $(el).attr("href");
      const title = $(el).find("p").text();
      const image = $(el).find("img").attr("src");

      if (link && title && image) {
        posts.push({ title, image, link });
      }
    });

    res.status(200).json({ posts });
  } catch (err) {
    console.error("❌ Home scraper error:", err.message);
    res.status(500).json({ error: "Failed to fetch homepage", details: err.message });
  }
}
