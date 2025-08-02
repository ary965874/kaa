const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: "Missing ?url= parameter" });
    }

    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        const title = $('h1').first().text().trim();
        const image = $('.post-content img').first().attr('src');
        let streamUrl = '';

        $('a').each((i, el) => {
            if ($(el).text().toLowerCase().includes('watch')) {
                streamUrl = $(el).attr('href');
                return false;
            }
        });

        res.json({
            title,
            image,
            streamUrl
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch post data', details: err.message });
    }
};
