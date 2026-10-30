import puppeteer from 'puppeteer-core';

async function run() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message, err.stack));
  page.on('requestfailed', req => console.log('REQ FAILED:', req.url(), req.failure()?.errorText));
  page.on('response', res => {
    if (res.status() >= 400) {
      console.log('HTTP ERROR:', res.status(), res.url());
    }
  });

  console.log('Navigating to http://localhost:5173/ ...');
  try {
    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    console.log('DOM Content Loaded!');

    // Wait 3 seconds for scripts to run
    await new Promise(r => setTimeout(r, 3000));

    // Check if #sim-container has children
    const simInfo = await page.evaluate(() => {
      const el = document.getElementById('sim-container');
      return {
        found: !!el,
        childCount: el ? el.children.length : -1,
        innerHTML: el ? el.innerHTML.slice(0, 200) : ''
      };
    });
    console.log('sim-container info:', JSON.stringify(simInfo));

    await page.screenshot({ path: 'test_screen.png' });
    console.log('Screenshot saved to test_screen.png');
  } catch (e) {
    console.error('Navigation or execution failed:', e);
  } finally {
    await browser.close();
  }
}

run();
