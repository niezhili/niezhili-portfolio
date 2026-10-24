import { chromium } from '/Users/zhili/.workbuddy/binaries/node/workspace/node_modules/playwright-core/index.mjs';
import { execSync } from 'node:child_process';

const outDir = '/Users/zhili/Desktop/作品集/portfolio-app/.workbuddy/screenshots';

function findChrome() {
  try {
    const cache = '/Users/zhili/Library/Caches/ms-playwright';
    const dirs = execSync(`ls ${cache}`).toString().trim().split('\n');
    for (const d of dirs.reverse()) {
      for (const bin of ['chrome-mac/Chromium.app/Contents/MacOS/Chromium', 'chromium_headless_shell-mac/chrome-headless-shell-mac-arm64/chrome-headless-shell']) {
        const p = `${cache}/${d}/${bin}`;
        try { execSync(`test -x "${p}"`); return p; } catch {}
      }
      // generic search inside version dir
      try {
        const found = execSync(`find "${cache}/${d}" -name "chrome-headless-shell" -o -name "Chromium" 2>/dev/null | head -1`).toString().trim();
        if (found) return found;
      } catch {}
    }
  } catch {}
  return null;
}

const exe = findChrome();
console.log('chrome exe:', exe);
const browser = await chromium.launch({
  executablePath: exe || undefined,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

// 1) collapsed thumbnail state
await page.goto('http://localhost:5199/', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
await page.screenshot({ path: `${outDir}/sidebar-thumb-after.png` });
console.log('saved thumb state');

// 2) open panel state (?sb=1 dev shortcut)
await page.goto('http://localhost:5199/?sb=1', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
await page.screenshot({ path: `${outDir}/sidebar-open-after.png` });
console.log('saved open state');

await browser.close();
