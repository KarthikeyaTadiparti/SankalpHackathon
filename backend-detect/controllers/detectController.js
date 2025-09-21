const {
  launchBrowser,
  detectDarkPatterns,
  closeBrowser,
} = require('../services/puppeteerService');

const detectDarkPatternsController = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    // Launch visible browser
    await launchBrowser();

    // Detect dark patterns
    const result = await detectDarkPatterns(url);

    // Close browser
    await closeBrowser();

    res.json({ url, result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { detectDarkPatternsController };