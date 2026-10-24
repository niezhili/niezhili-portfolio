// Shared reactive site data with localStorage persistence.
// ALL editable content lives here — initialized from content.js defaults,
// so the CMS starts 100% consistent with the front-end pages.
// Views read from this store; CMS edits update it; changes survive refresh.
import { reactive, watch } from 'vue'
import {
  profile,
  heroTags,
  stats,
  featured,
  sideProjects,
  education,
  projects,
  competitionStats,
  competitions,
  honors
} from '../data/content.js'

const STORAGE_KEY = 'portfolio-cms-data-v4'

function clone(x) {
  return JSON.parse(JSON.stringify(x))
}

const defaults = {
  avatar: profile.avatar,
  photoLibrary: [{ src: profile.avatar, name: '默认头像', visible: true }],
  hero: {
    bio: '用产品思维连接技术与业务 —— 通信工程背景的产品 / 项目经理',
    tags: [...heroTags]
  },
  stats: clone(stats),
  featured: clone(featured),
  sideProjects: clone(sideProjects),
  education: clone(education),
  projects: clone(projects),
  competitionStats: clone(competitionStats),
  competitions: clone(competitions),
  honors: clone(honors),
  lastPublishedAt: '2026.08'
}

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const saved = loadSaved()

export const siteData = reactive({
  ...clone(defaults),
  ...(saved || {}),
  // re-clone defaults for keys missing in saved (partial legacy saves)
  ...Object.fromEntries(
    Object.keys(defaults)
      .filter(k => !(saved && k in saved))
      .map(k => [k, clone(defaults[k])])
  ),
  lastPublishedAt: (saved && saved.lastPublishedAt) || defaults.lastPublishedAt
})

// ---------- 内容版本化播种 ----------
// content.js 是条目文本的唯一权威。播种时按标题对齐：文本一律以 defaults 为准，
// 只保留用户生成的资产（过程材料 attachments、荣誉图片 image）；存档里对不上号的
// 旧标题条目（历史残留）直接清除。标记 = 版本号 + 条目标题指纹，改内容即自动重播，
// 不再依赖手动升版本号（此前版本号被旧标签页抢先写过，导致播种被跳过、旧文案复活）。
const SEED_REV = '2026-10-24-canonical'
const SEED_KEY = 'portfolio-cms-seed-rev'

// 用户可能改过条目标题再改回来：资产按「标题 + 序号兜底」回挂
function carryAssets(savedList, defList) {
  return defList.map((def, i) => {
    const hit = savedList.find(x => x && x.title === def.title) || savedList[i]
    const keep = {}
    if (hit) {
      const files = Array.isArray(hit.attachments) ? hit.attachments : []
      if (files.length) keep.attachments = files
      if (def.image !== undefined && hit.image) keep.image = hit.image
    }
    if (!keep.attachments) keep.attachments = clone(def.attachments || [])
    return { ...clone(def), ...keep }
  })
}

function seedContent() {
  // 简介与统计类文本整体刷新
  siteData.stats = clone(defaults.stats)
  siteData.competitionStats = clone(defaults.competitionStats)
  siteData.education = clone(defaults.education)
  siteData.featured = clone(defaults.featured)
  siteData.sideProjects = clone(defaults.sideProjects)
  siteData.hero = { ...siteData.hero, tags: clone(defaults.hero.tags) }
  // 三类列表：以 defaults 为基准重建，只回挂用户资产
  for (const key of ['honors', 'competitions', 'projects']) {
    if (!Array.isArray(siteData[key])) { siteData[key] = clone(defaults[key]); continue }
    siteData[key] = carryAssets(siteData[key], defaults[key])
    siteData[key].sort((a, b) => (b.weight || 0) - (a.weight || 0))
  }
}

const seedSig = SEED_REV + '|' + ['honors', 'competitions', 'projects']
  .map(k => defaults[k].map(x => x.title).join('¶')).join('|')
let seeded = false
try { seeded = localStorage.getItem(SEED_KEY) === seedSig } catch (e) { seeded = true }
if (!seeded) {
  seedContent()
  try { localStorage.setItem(SEED_KEY, seedSig) } catch (e) { /* ignore */ }
}

// Debounced auto-save on any change
let timer = null
watch(siteData, () => {
  clearTimeout(timer)
  timer = setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(siteData))
    } catch (e) {
      /* storage full or disabled — ignore */
    }
  }, 200)
}, { deep: true })

// Publish: stamp the "最近更新" date shown in the top bar
export function publish() {
  const d = new Date()
  siteData.lastPublishedAt = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}`
}

// Reset all content back to design-spec defaults
export function resetToDefaults() {
  Object.assign(siteData, clone(defaults))
  try { localStorage.removeItem(STORAGE_KEY) } catch (e) { /* ignore */ }
}
