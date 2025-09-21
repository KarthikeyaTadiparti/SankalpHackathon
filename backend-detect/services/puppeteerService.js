// darkPatternBot.js
const puppeteer = require("puppeteer");
const { shamingPhrases } = require("../utils/phrases");
const config = require("../config.json"); // email & password stored here

let browser, page;

// ----------------------
// ✅ Launch Browser
// ----------------------
async function launchBrowser() {
  browser = await puppeteer.launch({
    headless: false, // visible browser
    executablePath: config.ChromePath,
    args: [config.resolution || "--no-sandbox"],
    defaultViewport: null,
  });

  page = (await browser.pages())[0];
  page.setDefaultNavigationTimeout(60000);
  console.log("[INFO] Browser launched");

  // Polyfill waitForTimeout if missing
  if (!puppeteer.Page.prototype.waitForTimeout) {
    puppeteer.Page.prototype.waitForTimeout = function (ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    };
  }
}

// ----------------------
// ✅ Login Helper
// ----------------------
async function tryLogin(page, url, email, password) {
  console.log(`[INFO] Attempting login at ${url}`);
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

  const emailField = await page.$(
    'input[type="email"], input[name*="email"], input[id*="email"], input[name*="user"], input[id*="user"], input[autocomplete="username"]'
  );
  if (emailField) await emailField.type(email, { delay: 50 });

  const passField = await page.$(
    'input[type="password"], input[name*="pass"], input[id*="pass"], input[autocomplete="current-password"]'
  );
  if (passField) await passField.type(password, { delay: 50 });

  const loginSelectors = [
    'button[type="submit"]',
    'input[type="submit"]',
    'button[name*="login"]',
    'button[id*="login"]',
    '[aria-label*="sign in"]',
    '[aria-label*="log in"]',
    '[data-testid*="login"]',
    '[class*="login"]',
  ];

  let clicked = false;
  for (const sel of loginSelectors) {
    const btn = await page.$(sel);
    if (btn) {
      await Promise.all([
        btn.click(),
        page
          .waitForNavigation({ waitUntil: "networkidle2", timeout: 30000 })
          .catch(() => {}),
      ]);
      clicked = true;
      break;
    }
  }

  if (!clicked) {
    await page.keyboard.press("Enter");
    await page
      .waitForNavigation({ waitUntil: "networkidle2", timeout: 30000 })
      .catch(() => {});
  }

  if (
    page.url().includes("login") ||
    page.url().includes("signin") ||
    page.url().includes("checkpoint")
  ) {
    throw new Error("❌ Login failed: still on login page");
  }

  console.log("[SUCCESS] Logged in!");
}

// ----------------------
// 🔍 Recursive Hidden Cancel/Unsubscribe Buttons
// ----------------------
async function getHiddenCancelButtons(frame) {
  const buttons = await frame.$$eval("button, a", (elements) =>
    elements
      .filter((el) => {
        const style = window.getComputedStyle(el);
        return (
          (el.innerText.toLowerCase().includes("cancel") ||
            el.innerText.toLowerCase().includes("unsubscribe")) &&
          (style.display === "none" ||
            style.visibility === "hidden" ||
            style.opacity === "0")
        );
      })
      .map((el) => {
        let path = [];
        let current = el;
        while (current && current.tagName) {
          let selector = current.tagName.toLowerCase();
          if (current.id) selector += `#${current.id}`;
          else if (current.className)
            selector += `.${current.className.split(" ").join(".")}`;
          path.unshift(selector);
          current = current.parentElement;
        }
        return path.join(" > ");
      })
  );

  for (const childFrame of frame.childFrames()) {
    buttons.push(...(await getHiddenCancelButtons(childFrame)));
  }

  return buttons;
}

// ----------------------
// 🔍 Collect All Buttons/Links (text, attrs, path, visibility)
// ----------------------
async function getAllButtons(frame) {
  const elements = await frame.$$eval("button, a", (els) =>
    els.map((el) => {
      const text = el.innerText.trim();
      const attrs = {};
      for (const attr of el.attributes) {
        attrs[attr.name] = attr.value;
      }
      const style = window.getComputedStyle(el);
      const visible =
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        style.opacity !== "0";

      let path = [];
      let current = el;
      while (current && current.tagName) {
        let selector = current.tagName.toLowerCase();
        if (current.id) selector += `#${current.id}`;
        else if (current.className)
          selector += `.${current.className.split(" ").join(".")}`;
        path.unshift(selector);
        current = current.parentElement;
      }

      return { text, attributes: attrs, path: path.join(" > "), visible };
    })
  );

  for (const child of frame.childFrames()) {
    elements.push(...(await getAllButtons(child)));
  }

  return elements;
}

// ----------------------
// 🔍 Dark Pattern Detector
// ----------------------
async function detectDarkPatterns(url) {
  if (!page || !browser)
    throw new Error("Browser not launched. Call launchBrowser() first.");

  const results = {
    url,
    autoCheckedBoxes: [],
    hiddenButtons: [],
    confirmShaming: [],
    redirects: [],
    allButtons: [],
  };

  try {
    // Step 1: Login first
    await tryLogin(page, url, config.email, config.password);

    // Step 2: Track redirects & navigations
    const visited = new Set();
    const trackRedirect = (u) => {
      if (!visited.has(u)) {
        visited.add(u);
        results.redirects.push(u);
      }
    };

    trackRedirect(page.url());

    page.on("framenavigated", (frame) => trackRedirect(frame.url()));
    page.on("request", (request) =>
      request.redirectChain().forEach((r) => trackRedirect(r.url()))
    );

    await page.exposeFunction("trackNavigation", trackRedirect);
    await page.evaluate(() => {
      document
        .querySelectorAll("a, button")
        .forEach((el) =>
          el.addEventListener("click", () =>
            setTimeout(() => window.trackNavigation(window.location.href), 1000)
          )
        );
    });

    await page.waitForTimeout(3000);

    // Step 3: Auto-checked checkboxes
    const frames = page.frames();
    for (const frame of frames) {
      const checked = await frame.$$eval('input[type="checkbox"]', (boxes) =>
        boxes.filter((box) => box.checked).map((box) => box.outerHTML)
      );
      results.autoCheckedBoxes.push(...checked);
    }

    // Step 4: Hidden cancel/unsubscribe buttons
    results.hiddenButtons = await getHiddenCancelButtons(page.mainFrame());

    // Step 5: Confirm-shaming texts
    const texts = await page.$$eval("button, a, span, p, div", (elements) =>
      elements.map((el) => el.innerText.toLowerCase())
    );
    results.confirmShaming = texts.filter((text) =>
      shamingPhrases.some((phrase) => text.includes(phrase))
    );

    // Step 6: All buttons/links info
    results.allButtons = await getAllButtons(page.mainFrame());
  } catch (err) {
    console.error("[ERROR]", err.message);
    results.error = err.message;
  }

  return results;
}

// ----------------------
// ✅ Close Browser
// ----------------------
async function closeBrowser() {
  if (browser) {
    await browser.close();
    console.log("[INFO] Browser closed");
  }
}

// ----------------------
// 🔹 Exports
// ----------------------
module.exports = { launchBrowser, detectDarkPatterns, closeBrowser };