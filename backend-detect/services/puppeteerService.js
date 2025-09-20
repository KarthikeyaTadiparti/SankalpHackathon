const puppeteer = require('puppeteer');
const { shamingPhrases } = require('../utils/phrases');

// Simple sleep helper
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function detectDarkPatterns(url) {
  // ✅ Launch browser in latest headless mode
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Go to the target URL
  await page.goto(url, { waitUntil: 'networkidle2' });

  const results = {
    autoCheckedBoxes: [],
    hiddenButtons: [],
    confirmShaming: [],
    redirectCount: 0
  };

  // Track redirects
  let lastUrl = page.url();
  page.on('framenavigated', frame => {
    if (frame.url() !== lastUrl) {
      results.redirectCount += 1;
      lastUrl = frame.url();
    }
  });

  // Wait for 2 seconds to let the page fully render
  await sleep(2000);

  // Detect pre-checked checkboxes
  const checkboxes = await page.$$eval('input[type="checkbox"]', boxes =>
    boxes.filter(box => box.checked).map(box => box.outerHTML)
  );
  results.autoCheckedBoxes = checkboxes;

  // Detect hidden or misleading cancel/unsubscribe buttons
  const buttons = await page.$$eval('button, a', elements =>
    elements.filter(el => {
      const style = window.getComputedStyle(el);
      return (
        (el.innerText.toLowerCase().includes('cancel') ||
         el.innerText.toLowerCase().includes('unsubscribe')) &&
        (style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity) === 0)
      );
    }).map(el => el.outerHTML)
  );
  results.hiddenButtons = buttons;

  // Detect confirm-shaming text
  const texts = await page.$$eval('button, a, span, p, div', elements =>
    elements.map(el => el.innerText.toLowerCase())
  );
  results.confirmShaming = texts.filter(text =>
    shamingPhrases.some(phrase => text.includes(phrase))
  );

  await browser.close();
  return results;
}

module.exports = { detectDarkPatterns };
