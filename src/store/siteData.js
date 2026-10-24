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
  products,
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
  products: clone(products),
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

// 旧存档迁移：竞赛/项目条目按标题合并默认值，补齐新增字段（period/role/points/result/weight/attachments）
for (const key of ['competitions', 'projects']) {
  if (Array.isArray(siteData[key])) {
    const defs = defaults[key]
    siteData[key] = siteData[key].map(s => {
      const def = defs.find(d => d.title === s.title)
      if (!def) return { attachments: [], weight: 50, ...s }
      const merged = { ...clone(def), ...s }
      // 过程材料补齐：存档里还没有材料时用默认值填充，已有上传则不覆盖
      if ((!Array.isArray(s.attachments) || s.attachments.length === 0) && def.attachments?.length) {
        merged.attachments = clone(def.attachments)
      }
      return merged
    })
  }
}

// ---------- 内容版本化播种 ----------
// content.js 新增条目（论文 / 软著 / 语言证书等）后，浏览器里的旧存档不会自动带上。
// 这里按版本号做一次增量合并：只追加缺失条目、刷新统计与简介文本，
// 用户自己在 CMS 里改过的头像、照片库、条目详情一律保留。标记写入后不再重复播种。
const SEED_REV = '2026-10-24-intern-products'
const SEED_KEY = 'portfolio-cms-seed-rev'

function seedContent() {
  // 1) 统计数字与简介类文本整体刷新为新默认值
  siteData.stats = clone(defaults.stats)
  siteData.competitionStats = clone(defaults.competitionStats)
  siteData.education = clone(defaults.education)
  siteData.featured = clone(defaults.featured)
  siteData.hero = { ...siteData.hero, tags: clone(defaults.hero.tags) }
  // 2) 三类列表追加缺失条目 → 文案字段以 content.js 为准 → 按含金量降序重排
  //    用户上传的材料与荣誉图片一律保留，不被默认值覆盖
  for (const key of ['honors', 'competitions', 'projects', 'products']) {
    if (!Array.isArray(siteData[key])) continue
    for (const def of defaults[key]) {
      if (!siteData[key].some(x => x && x.title === def.title)) siteData[key].push(clone(def))
    }
    siteData[key] = siteData[key].map(x => {
      const def = defaults[key].find(d => d.title === x.title)
      if (!def) return x
      const keep = {}
      const files = Array.isArray(x.attachments) ? x.attachments : []
      keep.attachments = files.length ? files : clone(def.attachments || [])
      if (key === 'honors' && x.image) keep.image = x.image
      return { ...clone(def), ...keep }
    })
    siteData[key].sort((a, b) => (b.weight || 0) - (a.weight || 0))
  }
}

let seeded = false
try { seeded = localStorage.getItem(SEED_KEY) === SEED_REV } catch (e) { seeded = true }
if (!seeded) {
  seedContent()
  try { localStorage.setItem(SEED_KEY, SEED_REV) } catch (e) { /* ignore */ }
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
