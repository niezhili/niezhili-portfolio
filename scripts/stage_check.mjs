// 台前调度动画/结构验证脚本（仅开发用）
// 断言：槽位数、顺序、FLIP 落点、收尾清理、浮层未被捕获
import { chromium } from '/Users/zhili/.workbuddy/binaries/node/workspace/node_modules/playwright-core/index.mjs'

const BASE = 'http://localhost:5173'
const out = '/tmp/stagecheck'
const sleep = ms => new Promise(r => setTimeout(r, ms))

const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: ['--no-sandbox', '--disable-gpu']
})
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
const logs = []
page.on('console', m => logs.push(`[${m.type()}] ${m.text()}`))
page.on('pageerror', e => logs.push(`[pageerror] ${e.message}`))

const keys = () => page.$$eval('.stage-strip [data-key]', els => els.map(e => e.dataset.key))
const mainStyle = () => page.$eval('.main-area', el => ({
  transform: el.style.transform,
  radius: el.style.borderRadius,
  willChange: el.style.willChange,
  computed: getComputedStyle(el).transform,
  computedWill: getComputedStyle(el).willChange
}))

async function rects() {
  return page.evaluate(() => {
    const r = e => { if (!e) return null; const b = e.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height } }
    return { main: r(document.querySelector('.main-area')), canvas: r(document.querySelector('.canvas-root')) }
  })
}

const report = {}

// ---------- 1. 结构与顺序 ----------
await page.goto(`${BASE}/?v=home`, { waitUntil: 'networkidle' })
await sleep(600)
report.stripOnHome = await keys()
// 缩略图必须是真实页面：每张卡里都要有渲染后的页面根节点
report.thumbs = await page.evaluate(() => {
  const frames = [...document.querySelectorAll('.stage-strip .thumb-frame')]
  return frames.map(f => ({ hasPage: !!f.querySelector('.page, .avatar-stage'), nodes: f.querySelectorAll('*').length }))
})

// 点击项目经历
const card = await page.$('.stage-strip [data-key="proj"]')
const cardRectBefore = await card.evaluate(el => { const b = el.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height } })
await card.click()
await sleep(60)
await page.screenshot({ path: `${out}/t60.png` })
await sleep(90)
await page.screenshot({ path: `${out}/t150.png` })
await sleep(150)
await page.screenshot({ path: `${out}/t300.png` })
await sleep(400)
await page.screenshot({ path: `${out}/t700.png` })

report.stripOnProj = await keys()
report.styleAfter = await mainStyle()

// 收尾清理是否彻底
report.mainAfter = await page.$eval('.main-area', el => {
  const cs = getComputedStyle(el)
  return { transform: cs.transform, willChange: cs.willChange, radius: cs.borderRadius }
})

// ---------- 2. FLIP 落点校验（重新点一次，读取提交瞬间的内联 transform） ----------
await page.goto(`${BASE}/?v=home`, { waitUntil: 'networkidle' })
await sleep(500)
const res = await page.evaluate(async () => {
  const wait = ms => new Promise(r => setTimeout(r, ms))
  const canvas = document.querySelector('.canvas-root')
  const scale = canvas.getBoundingClientRect().width / 1280
  const target = document.querySelector('.stage-strip [data-key="proj"]')
  const slot = target.getBoundingClientRect()
  const main = document.querySelector('.main-area').getBoundingClientRect()
  target.click()
  // 提交发生在离场动画结束后（200ms + 少量抖动）
  let found = null
  for (let i = 0; i < 60; i++) {
    await wait(16)
    const t = document.querySelector('.main-area').style.transform
    if (t && /scale\(([\d.]+)/.test(t)) {
      const m = t.match(/translate\(([-\d.]+)px, ?([-\d.]+)px\) scale\(([\d.]+), ?([\d.]+)\)/)
      if (m) { found = { t, tx: +m[1], ty: +m[2], sx: +m[3], sy: +m[4] }; break }
    }
  }
  return { found, scale, slot: { x: slot.x, y: slot.y, w: slot.width, h: slot.height }, main: { x: main.x, y: main.y, w: main.width, h: main.height } }
})
report.flip = res

// ---------- 3. 头像页 ----------
await page.goto(`${BASE}/?v=avatar`, { waitUntil: 'networkidle' })
await sleep(600)
report.stripOnAvatar = await keys()
report.avatarShot = true
await page.screenshot({ path: `${out}/avatar.png` })

// 缩略图不接管键盘：在主页按方向键，项目缩略图里的展开行不应变化
await page.goto(`${BASE}/?v=home`, { waitUntil: 'networkidle' })
await sleep(700)
const thumbOpenBefore = await page.$eval('.stage-strip [data-key="proj"] .row.open .row-title', el => el.textContent.trim()).catch(() => null)
for (let i = 0; i < 3; i++) { await page.keyboard.press('ArrowDown'); await sleep(120) }
const thumbOpenAfter = await page.$eval('.stage-strip [data-key="proj"] .row.open .row-title', el => el.textContent.trim()).catch(() => null)
report.thumbKeyboardIsolated = thumbOpenBefore === thumbOpenAfter
report.thumbOpenRow = { before: thumbOpenBefore, after: thumbOpenAfter }

await page.goto(`${BASE}/?v=avatar`, { waitUntil: 'networkidle' })
await sleep(600)

// 左右切换
const before = await page.$eval('.avatar-stage img', el => el.src)
await page.keyboard.press('ArrowRight')
await sleep(200)
const after = await page.$eval('.avatar-stage img', el => el.src)
report.avatarSwitched = before !== after

// Esc 回桌面
await page.keyboard.press('Escape')
await sleep(700)
report.afterEsc = await page.evaluate(() => ({
  hasAvatarStage: !!document.querySelector('.avatar-stage'),
  title: document.querySelector('.main-area .page-title')?.textContent?.trim(),
  activeInStrip: [...document.querySelectorAll('.stage-strip [data-key]')].map(e => e.dataset.key)
}))
await page.screenshot({ path: `${out}/back-home.png` })

// ---------- 4. 浮层未被捕获 ----------
await page.goto(`${BASE}/?v=honor`, { waitUntil: 'networkidle' })
await sleep(700)
await page.click('.main-area .frame')
await sleep(400)
report.lightbox = await page.$eval('.lightbox', el => {
  const b = el.getBoundingClientRect()
  return { w: Math.round(b.width), h: Math.round(b.height), x: Math.round(b.x), y: Math.round(b.y) }
})

report.console = logs.filter(l => !l.includes('[vite]'))
console.log(JSON.stringify(report, null, 2))
await browser.close()
