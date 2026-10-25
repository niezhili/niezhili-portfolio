<script setup>
import { ref, watch, inject, onBeforeUnmount } from 'vue'
import { siteData } from '../store/siteData.js'
import { STAGE_PREVIEW } from '../lib/stageContext.js'

const honors = siteData.honors

// ---------- 占位回退：路径为空或图片加载失败时显示占位框 ----------
const failed = ref(new Set())
function isMissing(h) { return !h.image || failed.value.has(h.image) }
function onImgError(h) { failed.value.add(h.image) }

// ---------- Lightbox：点击相框放大查看证书 ----------
const zoomed = ref(null)
function openZoom(h) { if (!isMissing(h)) zoomed.value = h }
function closeZoom() { zoomed.value = null }

function onKey(e) { if (e.key === 'Escape') closeZoom() }
const preview = inject(STAGE_PREVIEW, false)
watch(zoomed, v => {
  if (v && !preview) window.addEventListener('keydown', onKey)
  else window.removeEventListener('keydown', onKey)
})
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div class="page">
    <div class="wall-head">
      <span class="eyebrow">HONOR WALL · {{ honors.length }} 项</span>
      <span class="hint">点击证书可放大查看</span>
    </div>

    <!-- 三列瀑布流：横版矮框 / 竖版高框自然错落 -->
    <div class="wall">
      <figure v-for="h in honors" :key="h.title" class="frame glass" @click="openZoom(h)">
        <div class="mat">
          <img
            v-if="!isMissing(h)"
            :src="h.image"
            :alt="h.title"
            loading="lazy"
            @error="onImgError(h)"
          />
          <div v-else class="ph">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" stroke-width="1.6"/>
              <path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
            </svg>
            <span>证书照片 · 待补充</span>
          </div>
        </div>
        <figcaption class="caption">
          <div class="kicker" :class="h.accent">{{ h.eyebrow }}</div>
          <div class="title">{{ h.title }}</div>
          <div class="desc">{{ h.desc }}</div>
        </figcaption>
      </figure>
    </div>

    <!-- Lightbox -->
    <div v-if="zoomed" class="lightbox" @click="closeZoom">
      <figure class="lb-body" @click.stop>
        <img :src="zoomed.image" :alt="zoomed.title" />
        <figcaption class="lb-caption">
          <span class="kicker" :class="zoomed.accent">{{ zoomed.eyebrow }}</span>
          <span class="lb-title">{{ zoomed.title }}</span>
        </figcaption>
      </figure>
      <button class="lb-close" aria-label="关闭" @click="closeZoom">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.page { display: flex; flex-direction: column; gap: 14px; }

.wall-head { display: flex; align-items: baseline; justify-content: space-between; }
.hint { font-size: 11px; color: var(--ink-4); }

.wall { column-count: 3; column-gap: 16px; }

.frame {
  break-inside: avoid;
  margin: 0 0 16px;
  padding: 10px 10px 0;
  border-radius: 18px;
  cursor: zoom-in;
}
/* 覆盖全局 .glass 的 scale hover — 瀑布流内用上移更稳 */
.frame:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 30px var(--glass-shadow), inset 0 1px 2px var(--glass-inner);
}

/* 白色卡纸 + 证书原比例展示；竖版证书限高，避免单帧过长 */
.mat {
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.mat img {
  width: 100%;
  height: auto;
  max-height: 400px;
  object-fit: contain;
}

.ph {
  width: 100%;
  aspect-ratio: 3 / 4;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1.5px dashed #b9c6e2;
  background: #f6f8fd;
  color: var(--ink-4);
  font-size: 11px;
}

.caption { padding: 10px 4px 12px; }
.kicker {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--blue-500);
}
.kicker.red { color: var(--accent-red); }
.kicker.black { color: var(--accent-black); }
.kicker.gray { color: var(--accent-gray); }
.title {
  margin-top: 4px;
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 600;
  color: var(--ink-1);
  line-height: 1.35;
}
.desc { margin-top: 3px; font-size: 11px; color: var(--ink-2); line-height: 1.5; }

/* Lightbox — fixed 定位：canvas-root 的 transform 使其成为包含块，铺满 1280×800 画布 */
.lightbox {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  background: var(--overlay);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: zoom-out;
  animation: lb-in 0.18s ease;
}
@keyframes lb-in { from { opacity: 0; } to { opacity: 1; } }

.lb-body {
  margin: 0;
  background: #fff;
  border-radius: 14px;
  padding: 12px 12px 10px;
  max-width: 1000px;
  box-shadow: 0 30px 80px rgba(31, 31, 89, 0.4);
  cursor: default;
}
.lb-body img {
  display: block;
  max-width: 976px;
  max-height: 580px;
  width: auto;
  height: auto;
  border-radius: 6px;
}
.lb-caption { display: flex; align-items: baseline; gap: 10px; padding: 10px 4px 2px; }
.lb-title {
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 600;
  color: var(--ink-1);
}

.lb-close {
  position: absolute;
  top: 18px;
  right: 18px;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: var(--r-dot);
  background: rgba(255, 255, 255, 0.9);
  color: var(--ink-1);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(31, 31, 89, 0.3);
}
</style>
