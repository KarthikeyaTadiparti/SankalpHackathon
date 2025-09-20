const { detectDarkPatterns } = require('../services/puppeteerService');

const detectDarkPatternsController = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    const result = await detectDarkPatterns(url);
    res.json({ url, result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { detectDarkPatternsController };
