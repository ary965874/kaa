const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
    try {
        const response = await axios.get('https://hdhub4u.build');
        const $ = cheerio.load(response.data);
        const posts = [];

        $('.home-post').each((i, el) => {
            posts.push({
                title: $(el).find('.title').text().trim(),
                image: $(el).find('img').attr('src'),
                url: $(el).find('a').attr('href')
            });
        });

        res.json({ posts });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch home data', details: err.message });
    }
};
