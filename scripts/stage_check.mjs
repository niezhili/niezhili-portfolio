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

// ---------- 2. 飞行窗口的起点必须等于被点卡片的矩形 ----------
await page.goto(`${BASE}/?v=home`, { waitUntil: 'networkidle' })
await sleep(500)
const res = await page.evaluate(async () => {
  const wait = ms => new Promise(r => setTimeout(r, ms))
  const canvas = document.querySelector('.canvas-root')
  const scale = canvas.getBoundingClientRect().width / 1280
  const card = document.querySelector('.stage-strip [data-key="proj"]')
  const cardBox = card.getBoundingClientRect()
  const mainBox = document.querySelector('.main-area').getBoundingClientRect()
  card.click()
  let kf = null
  for (let i = 0; i < 40 && !kf; i++) {
    await wait(8)
    const g = document.querySelector('.main-ghost')
    if (g) {
      const a = g.getAnimations()[0]
      kf = a ? a.effect.getKeyframes()[0].transform : null
    }
  }
  const m = kf && kf.match(/translate\(([-\d.]+)px, ?([-\d.]+)px\) scale\(([\d.]+), ?([\d.]+)\)/)
  return {
    keyframe: kf,
    got: m ? { tx: +m[1], ty: +m[2], sx: +m[3], sy: +m[4] } : null,
    want: {
      tx: +((cardBox.x - mainBox.x) / scale).toFixed(1),
      ty: +((cardBox.y - mainBox.y) / scale).toFixed(1),
      sx: +((cardBox.width / mainBox.width)).toFixed(3),
      sy: +((cardBox.height / mainBox.height)).toFixed(3)
    }
  }
})
report.flightStart = res
report.flightStartOk = !!res.got &&
  Math.abs(res.got.tx - res.want.tx) < 2 &&
  Math.abs(res.got.ty - res.want.ty) < 2 &&
  Math.abs(res.got.sx - res.want.sx) < 0.01 &&
  Math.abs(res.got.sy - res.want.sy) < 0.01

// 落位后：飞行层必须消失，舞台不能残留任何内联变换
await sleep(600)
report.afterFlight = await page.evaluate(() => {
  const m = document.querySelector('.main-area')
  const cs = getComputedStyle(m)
  return {
    ghostGone: !document.querySelector('.main-ghost'),
    transform: cs.transform,
    opacity: cs.opacity,
    radius: cs.borderRadius,
    willChange: cs.willChange
  }
})

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
