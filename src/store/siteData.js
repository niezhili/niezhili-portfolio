// Shared reactive site data with localStorage persistence.
// CMS edits flow into this store; front-page views read from it,
// so changes survive refresh and update the front pages live.
import { reactive, watch } from 'vue'

const STORAGE_KEY = 'portfolio-cms-data'

const defaults = {
  featured: {
    badge: 'LEAD · 项目负责人',
    period: '2024 – 2025',
    title: '智能镜产品设计',
    desc: '主导智能镜产品从 0 到 1：需求调研、功能定义、交互设计与开发跟进，协同软硬件团队推进落地。'
  },
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
  featured: { ...defaults.featured, ...(saved && saved.featured) },
  lastPublishedAt: (saved && saved.lastPublishedAt) || defaults.lastPublishedAt
})

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

// Reset content back to design-spec defaults
export function resetToDefaults() {
  Object.assign(siteData.featured, defaults.featured)
  siteData.lastPublishedAt = defaults.lastPublishedAt
  try { localStorage.removeItem(STORAGE_KEY) } catch (e) { /* ignore */ }
}
