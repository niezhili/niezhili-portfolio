<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { siteData } from '../store/siteData.js'
import featImg from '../assets/feat-smart-mirror.png'

const projects = siteData.projects

// 有实拍/渲染图的项目用图，其余用首字排版块占位
const covers = { '智能镜 Smart Mirror': featImg }

// ---------- 编辑目录：编号 + 大字级，展开后原位下推 ----------
// 展开状态由滚动位置驱动：滚到谁，谁展开（点击 = 平滑滚到该条）
const openIdx = ref(0)
function pointLines(p) {
  return String(p.points || '').split('\n').map(s => s.trim()).filter(Boolean)
}
const pad = n => String(n).padStart(2, '0')

const rootEl = ref(null)
const scroller = ref(null)
let raf = 0
let lockUntil = 0

// 以滚动视口 42% 处为判定线：最后一个越过该线的条目即当前条目。
// 条目展开后自身变高，后续条目被推到线下，因此不会来回跳。
function currentIdx() {
  const sc = scroller.value
  const els = rowEls.filter(Boolean)
  if (!sc || !els.length) return 0
  const rect = sc.getBoundingClientRect()
  // 内容不足一屏时保持当前条目（交给点击控制）；停在顶部时固定第一条
  if (sc.scrollHeight - sc.clientHeight <= 8) return openIdx.value
  if (sc.scrollTop <= 2) return 0
  const line = rect.top + rect.height * 0.42
  let idx = 0
  rowEls.forEach((el, i) => {
    if (el && el.getBoundingClientRect().top <= line) idx = i
  })
  if (sc.scrollTop + sc.clientHeight >= sc.scrollHeight - 4) idx = els.length - 1
  return idx
}

function syncOpen() {
  if (performance.now() < lockUntil) return
  const idx = currentIdx()
  if (idx === openIdx.value) return
  openIdx.value = idx
  hovered.value = idx
  lockUntil = performance.now() + 420
}

function onScroll() {
  if (raf) return
  raf = requestAnimationFrame(() => { raf = 0; syncOpen() })
}

// 点击：立即展开 + 把该条滚到判定线上方一点（内容不足一屏时只展开）
function goTo(i) {
  openIdx.value = i
  hovered.value = i
  lockUntil = performance.now() + 700
  const sc = scroller.value
  const el = rowEls[i]
  if (!sc || !el || sc.scrollHeight - sc.clientHeight <= 8) return
  const rect = sc.getBoundingClientRect()
  const top = el.getBoundingClientRect().top - rect.top + sc.scrollTop - (rect.height * 0.42 - 30)
  sc.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
}

// ---------- 右侧玻璃预览卡：sticky 吸附在滚动视口内，内容随当前行切换 ----------
const hovered = ref(0)
const rowEls = []
function setRow(el, i) { if (el) rowEls[i] = el }
function onEnter(i) { hovered.value = i }
function onLeave() { hovered.value = openIdx.value }

const doneCount = computed(() => projects.filter(p => !/进行中/.test(p.tag?.text || '')).length)
const liveCount = computed(() => projects.length - doneCount.value)

const active = computed(() => projects[hovered.value] || projects[0] || null)
const activeCover = computed(() => (active.value ? covers[active.value.title] : ''))
const activeFiles = computed(() => (active.value?.attachments || []).length)

// ---------- 过程材料悬浮预览 ----------
const viewer = ref(null)
const isImg = computed(() => viewer.value?.kind === 'image')
const viewSrc = computed(() =>
  isImg.value ? viewer.value?.path : viewer.value?.preview || viewer.value?.path || ''
)
const canEmbed = computed(() => !!viewer.value && !isImg.value && /\.(pdf|html?)$/i.test(viewSrc.value))
function openFile(a) { viewer.value = a }
function closeViewer() { viewer.value = null }
function onKey(e) { if (e.key === 'Escape') closeViewer() }
onMounted(() => {
  window.addEventListener('keydown', onKey)
  scroller.value = rootEl.value?.closest('.page-scroll') || null
  scroller.value?.addEventListener('scroll', onScroll, { passive: true })
  nextTick(() => {
    hovered.value = openIdx.value
    syncOpen()
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  scroller.value?.removeEventListener('scroll', onScroll)
  if (raf) cancelAnimationFrame(raf)
})

</script>

<template>
  <div ref="rootEl" class="page">
    <div class="list-col">
      <div class="head">
        <span class="eyebrow">PROJECTS · {{ pad(projects.length) }}</span>
        <span class="hint">滚动即展开 · 按含金量排序</span>
      </div>

      <div class="rows">
        <article
          v-for="(p, i) in projects"
          :key="p.title"
          :ref="el => setRow(el, i)"
          class="row"
          :class="{ open: openIdx === i }"
        >
          <button
            class="row-head"
            :aria-expanded="openIdx === i"
            @click="goTo(i)"
            @mouseenter="onEnter(i)"
            @focus="onEnter(i)"
            @mouseleave="onLeave"
            @blur="onLeave"
          >
            <span class="num">{{ pad(i + 1) }}</span>
            <span class="head-main">
              <span class="row-title">{{ p.title }}</span>
              <span class="row-sub">{{ p.sub }}</span>
            </span>
            <span class="row-tag" :class="p.tag?.color">{{ p.tag?.text }}</span>
            <svg class="chev" width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>

          <div class="row-body">
            <div class="row-inner">
              <div class="content">
                <div v-if="p.insight" class="block">
                  <div class="block-label">我的判断</div>
                  <p class="insight">{{ p.insight }}</p>
                </div>

                <div v-if="pointLines(p).length" class="block">
                  <div class="block-label">关键动作</div>
                  <ul class="points">
                    <li v-for="(line, j) in pointLines(p)" :key="j">{{ line }}</li>
                  </ul>
                </div>

                <div v-if="p.result" class="result">{{ p.result }}</div>

                <div v-if="(p.attachments || []).length" class="block files">
                  <div class="block-label">原件</div>
                  <div class="files-row">
                    <button
                      v-for="(a, j) in p.attachments"
                      :key="j"
                      class="file-chip"
                      @click="openFile(a)"
                    >
                      <svg v-if="a.kind === 'image'" width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" stroke-width="2"/>
                        <circle cx="9" cy="10" r="1.6" fill="currentColor"/>
                        <path d="M4 18l5-5 3 3 4-4 4 4" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
                      </svg>
                      <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
                        <path d="M14 3v5h5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                      </svg>
                      {{ a.name }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>

      <div class="foot">
        <span>共 {{ pad(projects.length) }} 个项目</span>
        <span>已结题 {{ pad(doneCount) }} · 进行中 {{ pad(liveCount) }}</span>
      </div>
    </div>

    <aside class="preview-col">
      <div v-if="active" :key="active.title" class="preview-card">
        <div class="cover">
          <img v-if="activeCover" :src="activeCover" :alt="active.title" />
          <span v-else class="mono">{{ active.title.slice(0, 1) }}</span>
        </div>
        <div class="p-title">{{ active.title }}</div>
        <div class="p-meta">{{ active.tag?.text }}</div>
        <div v-if="activeFiles" class="p-files">{{ activeFiles }} 份原件可查</div>
      </div>
    </aside>

    <div v-if="viewer" class="viewer-overlay" @click.self="closeViewer">
      <div class="viewer glass">
        <div class="viewer-top">
          <span class="viewer-name">{{ viewer.name }}</span>
          <div class="viewer-actions">
            <a class="dl-btn" :href="viewer.path" :download="viewer.name">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M12 4v12m0 0l-4-4m4 4l4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M4 20h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              下载原件
            </a>
            <button class="x-btn" aria-label="关闭" @click="closeViewer">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="viewer-body">
          <img v-if="isImg" :src="viewer.path" :alt="viewer.name" />
          <iframe v-else-if="canEmbed" :src="viewSrc" title="材料预览" />
          <div v-else class="no-preview">
            <p>此格式暂不支持在线预览</p>
            <a class="dl-btn big" :href="viewer.path" :download="viewer.name">下载原件查看</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 196px;
  gap: 32px;
  align-items: start;
}

/* ---------- 目录头 ---------- */
.head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(31, 31, 89, 0.18);
}
.eyebrow {
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.16em;
  color: var(--blue-500);
}
.hint { font-size: 11px; color: var(--ink-3); }

/* ---------- 目录行 ---------- */
.rows { position: relative; }
.row { border-bottom: 1px solid rgba(31, 31, 89, 0.16); }

.row-head {
  display: flex;
  align-items: baseline;
  gap: 18px;
  width: 100%;
  padding: 20px 0 18px;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.num {
  width: 34px;
  flex-shrink: 0;
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 500;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  color: rgba(10, 132, 255, 0.55);
  transition: color 0.2s ease;
}
.row:hover .num,
.row.open .num { color: var(--blue-500); }

.head-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 5px; }

.row-title {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 600;
  line-height: 1.12;
  letter-spacing: -0.01em;
  color: var(--ink-1);
  transition: color 0.2s ease;
}
.row:hover .row-title,
.row.open .row-title { color: var(--ink-1); }

.row-sub {
  font-size: 12px;
  color: var(--ink-3);
  line-height: 1.45;
  letter-spacing: 0.01em;
}

.row-tag {
  flex-shrink: 0;
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.02em;
  padding: 3px 9px;
  border-radius: var(--r-pill);
  border: 1px solid currentColor;
  align-self: center;
}
.row-tag.black { color: var(--accent-black); }
.row-tag.red { color: var(--accent-red); }
.row-tag.gray { color: var(--accent-gray-text); background: rgba(255, 255, 255, 0.45); }

.chev {
  flex-shrink: 0;
  align-self: center;
  color: var(--ink-4);
  transition: transform 0.3s ease, color 0.2s ease;
}
.row.open .chev { transform: rotate(180deg); color: var(--blue-500); }

.foot {
  display: flex;
  justify-content: space-between;
  padding-top: 12px;
  font-size: 11px;
  color: var(--ink-3);
  letter-spacing: 0.02em;
}

/* ---------- 展开体 ---------- */
.row-body {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.35s ease;
}
.row.open .row-body { grid-template-rows: 1fr; }
.row-inner { overflow: hidden; }

.content {
  position: relative;
  margin: 0 0 22px 52px;
  padding: 2px 0 0 26px;
}
.content::before {
  content: '';
  position: absolute;
  left: 0;
  top: 4px;
  bottom: 0;
  width: 2px;
  background: var(--blue-500);
  opacity: 0.35;
}

.block { margin-bottom: 16px; }
.block-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.14em;
  color: var(--blue-500);
  margin-bottom: 7px;
}

.insight {
  margin: 0;
  font-size: 15px;
  line-height: 1.65;
  color: var(--ink-1);
  letter-spacing: -0.005em;
}

.points { margin: 0; padding: 0; list-style: none; }
.points li {
  position: relative;
  padding-left: 15px;
  font-size: 12.5px;
  line-height: 1.75;
  color: var(--ink-2);
}
.points li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--blue-500);
  opacity: 0.45;
}

.result {
  margin: 0 0 16px;
  padding: 10px 14px;
  border-left: 2px solid var(--accent-black);
  background: rgba(255, 255, 255, 0.5);
  border-radius: 0 10px 10px 0;
  font-size: 12.5px;
  font-weight: 600;
  line-height: 1.6;
  color: var(--ink-1);
}

.files { margin-bottom: 0; }
.files-row { display: flex; flex-wrap: wrap; gap: 7px; }
.file-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 11px;
  border: 1px solid rgba(10, 132, 255, 0.28);
  border-radius: var(--r-pill);
  background: rgba(255, 255, 255, 0.55);
  color: var(--blue-600);
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;
}
.file-chip:hover { border-color: var(--blue-500); background: #fff; }

/* ---------- 右侧预览卡 ---------- */
.preview-col {
  position: sticky;
  top: 16px;
  align-self: start;
  padding-top: 12px;
}
.preview-card {
  width: 196px;
  padding: 9px;
  background: var(--glass-fill-strong);
  border: 1px solid var(--glass-stroke);
  border-radius: 16px;
  backdrop-filter: blur(20px) saturate(150%);
  -webkit-backdrop-filter: blur(20px) saturate(150%);
  box-shadow: 0 18px 40px var(--glass-shadow);
}
@keyframes pvIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
.preview-card { animation: pvIn 0.22s ease; }
.cover {
  height: 88px;
  border-radius: 9px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}
.cover img { width: 100%; height: 100%; object-fit: cover; filter: saturate(0.92); }
.mono {
  font-family: var(--font-display);
  font-size: 34px;
  font-weight: 600;
  color: rgba(10, 132, 255, 0.45);
  line-height: 1;
}
.p-title {
  margin-top: 9px;
  font-family: var(--font-display);
  font-size: 12.5px;
  font-weight: 600;
  color: var(--ink-1);
  line-height: 1.3;
}
.p-meta { margin-top: 3px; font-size: 10.5px; color: var(--ink-4); }
.p-files { margin-top: 5px; font-size: 10.5px; color: var(--blue-600); }

/* ---------- 悬浮预览窗 ---------- */
.viewer-overlay {
  position: fixed;
  inset: 0;
  background: var(--overlay);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fade 0.2s ease;
}
@keyframes fade { from { opacity: 0; } to { opacity: 1; } }

.viewer {
  width: 860px;
  height: 640px;
  background: #fff;
  border-radius: 18px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 30px 80px rgba(31, 31, 89, 0.4);
  animation: pop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes pop { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }

.viewer-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 12px 18px;
  border-bottom: 1px solid #eef0f6;
}
.viewer-name {
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 600;
  color: var(--ink-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.viewer-actions { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.dl-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 28px;
  padding: 0 12px;
  border-radius: var(--r-pill);
  background: var(--accent-black);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  text-decoration: none;
}
.dl-btn:hover { background: var(--accent-black-hover, #333); }
.dl-btn.big { height: 38px; padding: 0 20px; font-size: 13px; }
.x-btn {
  width: 28px;
  height: 28px;
  border: 1px solid #e5e7ef;
  background: #fff;
  border-radius: 10px;
  color: var(--ink-3);
  display: flex;
  align-items: center;
  justify-content: center;
}
.x-btn:hover { background: #f5f7fb; color: var(--ink-1); }

.viewer-body {
  flex: 1;
  min-height: 0;
  background: #f6f8fc;
  display: flex;
  align-items: center;
  justify-content: center;
}
.viewer-body img { max-width: 100%; max-height: 100%; object-fit: contain; }
.viewer-body iframe { width: 100%; height: 100%; border: none; background: #fff; }
.no-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  font-size: 13px;
  color: var(--ink-3);
}
.no-preview p { margin: 0; }
</style>
