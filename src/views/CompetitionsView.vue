<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { siteData } from '../store/siteData.js'

const competitionStats = siteData.competitionStats
const competitions = siteData.competitions

// ---------- 手风琴：单开，点击切换 ----------
const openIdx = ref(-1)
function toggle(i) {
  openIdx.value = openIdx.value === i ? -1 : i
}
function pointLines(c) {
  return String(c.points || '').split('\n').map(s => s.trim()).filter(Boolean)
}

// ---------- 过程材料悬浮预览 ----------
const viewer = ref(null) // { name, kind, path, preview }
const isImg = computed(() => viewer.value?.kind === 'image')
const viewSrc = computed(() =>
  isImg.value ? viewer.value?.path : viewer.value?.preview || viewer.value?.path || ''
)
const canEmbed = computed(() => !!viewer.value && !isImg.value && /\.(pdf|html?)$/i.test(viewSrc.value))
function openFile(a) {
  viewer.value = a
}
function closeViewer() {
  viewer.value = null
}
function onKey(e) {
  if (e.key === 'Escape') closeViewer()
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div class="page">
    <div class="stats-row">
      <div v-for="s in competitionStats" :key="s.num" class="stat glass">
        <div class="num">{{ s.num }}</div>
        <div class="label">{{ s.label }}</div>
      </div>
    </div>

    <div class="comp-list">
      <article
        v-for="(c, i) in competitions"
        :key="c.title"
        class="comp glass"
        :class="{ open: openIdx === i }"
      >
        <button class="comp-head" @click="toggle(i)">
          <div class="head-text">
            <h2 class="title">{{ c.title }}</h2>
            <div class="sub">{{ c.sub }}</div>
          </div>
          <div class="head-right">
            <span class="tag" :class="c.tag?.color">{{ c.tag?.text }}</span>
            <svg
              class="chev"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </button>

        <div class="comp-body">
          <div class="comp-body-inner">
            <div v-if="c.period || c.role" class="meta">
              <span v-if="c.period" class="meta-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" stroke-width="2"/>
                  <path d="M8 3v4M16 3v4M3 10h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                {{ c.period }}
              </span>
              <span v-if="c.role" class="meta-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/>
                  <path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                {{ c.role }}
              </span>
            </div>

            <ul v-if="pointLines(c).length" class="points">
              <li v-for="(p, j) in pointLines(c)" :key="j">{{ p }}</li>
            </ul>

            <div v-if="c.result" class="result">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 01-10 0V4z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M7 6H4a1 1 0 00-1 1c0 2.5 1.8 4 4 4M17 6h3a1 1 0 011 1c0 2.5-1.8 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              {{ c.result }}
            </div>

            <div v-if="(c.attachments || []).length" class="files">
              <div class="files-label">过程材料 · {{ c.attachments.length }}</div>
              <div class="files-row">
                <button
                  v-for="(a, j) in c.attachments"
                  :key="j"
                  class="file-chip"
                  @click="openFile(a)"
                >
                  <svg v-if="a.kind === 'image'" width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" stroke-width="2"/>
                    <circle cx="9" cy="10" r="1.6" fill="currentColor"/>
                    <path d="M4 18l5-5 3 3 4-4 4 4" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
                  </svg>
                  <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
                    <path d="M14 3v5h5M9 13h6M9 17h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                  {{ a.name }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>

    <!-- 过程材料悬浮预览窗 -->
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
.page { display: flex; flex-direction: column; gap: 18px; }

.stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.stat { padding: 22px 24px; }
.num { font-family: var(--font-display); font-size: 28px; font-weight: 600; color: var(--accent-red); line-height: 1; }
.stat:nth-child(2) .num { color: var(--accent-black); }
.stat:nth-child(3) .num { color: var(--accent-gray); }
.label { margin-top: 6px; font-size: 12px; color: var(--ink-3); }

/* ---------- 手风琴列表 ---------- */
.comp-list { display: flex; flex-direction: column; gap: 12px; }
.comp { padding: 0; overflow: hidden; transition: border-color 0.2s ease; }
.comp.open { border-color: var(--blue-500); }

.comp-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
  padding: 16px 22px;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
}
.comp-head:hover { background: rgba(87, 131, 255, 0.04); }
.head-text { min-width: 0; }
.title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 600;
  color: var(--ink-1);
}
.sub { margin: 4px 0 0; font-size: 12px; color: var(--ink-3); }
.head-right { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
.tag {
  padding: 3px 10px;
  border-radius: var(--r-pill);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}
.tag.red { background: var(--accent-red); }
.tag.black { background: var(--accent-black); }
.tag.gray { background: var(--accent-gray); }
.chev { color: var(--ink-4); transition: transform 0.3s ease; flex-shrink: 0; }
.comp.open .chev { transform: rotate(180deg); }

.comp-body {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.35s ease;
}
.comp.open .comp-body { grid-template-rows: 1fr; }
.comp-body-inner {
  overflow: hidden;
  padding: 0 22px;
}
.comp.open .comp-body-inner { padding-bottom: 18px; }

.meta { display: flex; flex-wrap: wrap; gap: 16px; padding-top: 14px; }
.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--ink-2);
  font-weight: 600;
}
.meta-item svg { color: var(--blue-500); }

.points { margin: 10px 0 0; padding: 0 0 0 18px; }
.points li {
  font-size: 13px;
  color: var(--ink-2);
  line-height: 1.7;
}

.result {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 12px;
  padding: 9px 14px;
  border-left: 3px solid var(--accent-red);
  background: rgba(214, 69, 65, 0.06);
  border-radius: 0 10px 10px 0;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--ink-1);
}
.result svg { color: var(--accent-red); flex-shrink: 0; }

.files { margin-top: 14px; }
.files-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--ink-4);
  margin-bottom: 8px;
}
.files-row { display: flex; flex-wrap: wrap; gap: 8px; }
.file-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid #e5e7ef;
  border-radius: var(--r-pill);
  background: #fff;
  color: var(--ink-2);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: border 0.15s ease, color 0.15s ease;
}
.file-chip svg { color: var(--blue-500); }
.file-chip:hover { border-color: var(--blue-500); color: var(--blue-600); }

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
.viewer-body img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
.viewer-body iframe {
  width: 100%;
  height: 100%;
  border: none;
  background: #fff;
}
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
