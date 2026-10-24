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

// 旧存档迁移：竞赛/项目条目按标题合并默认值，补齐新增字段（period/role/points/result/weight/attachments）
for (const key of ['competitions', 'projects']) {
  if (Array.isArray(siteData[key])) {
    const defs = defaults[key]
    siteData[key] = siteData[key].map(s => {
      const def = defs.find(d => d.title === s.title)
      return def ? { ...clone(def), ...s } : { attachments: [], weight: 50, ...s }
    })
  }
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
