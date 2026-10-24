<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { siteData } from '../store/siteData.js'

const emit = defineEmits(['close'])

const photos = computed(() => {
  const vis = (siteData.photoLibrary || []).filter(p => p && p.src && p.visible !== false)
  if (!vis.some(p => p.src === siteData.avatar)) {
    return [{ src: siteData.avatar, name: '当前头像' }, ...vis]
  }
  return vis
})

const idx = ref(Math.max(0, photos.value.findIndex(p => p.src === siteData.avatar)))
const current = computed(() => photos.value[idx.value] || { src: siteData.avatar })
const total = computed(() => photos.value.length)

function prev() { if (total.value > 1) idx.value = (idx.value - 1 + total.value) % total.value }
function next() { if (total.value > 1) idx.value = (idx.value + 1) % total.value }

function onKey(e) {
  if (e.key === 'Escape') emit('close')
  else if (e.key === 'ArrowLeft') prev()
  else if (e.key === 'ArrowRight') next()
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div class="avatar-lightbox" @click="emit('close')">
    <figure class="al-body" @click.stop>
      <img
        :key="current.src"
        class="al-photo"
        :src="current.src"
        :alt="current.name || '个人照片'"
      />
    </figure>

    <template v-if="total > 1">
      <button class="al-arrow left" aria-label="上一张" @click.stop="prev">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <button class="al-arrow right" aria-label="下一张" @click.stop="next">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <div class="al-count">{{ idx + 1 }} / {{ total }}</div>
    </template>

    <button class="al-close" aria-label="关闭" @click="emit('close')">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </button>
  </div>
</template>

<style scoped>
.avatar-lightbox {
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
  animation: al-in 0.18s ease;
}
@keyframes al-in { from { opacity: 0; } to { opacity: 1; } }

.al-body {
  margin: 0;
  background: #fff;
  padding: 12px;
  border-radius: 16px;
  box-shadow: 0 30px 80px rgba(31, 31, 89, 0.4);
  cursor: default;
  animation: al-pop 0.28s cubic-bezier(0.34, 1.4, 0.64, 1);
}
@keyframes al-pop {
  from { transform: scale(0.72); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
}

.al-photo {
  display: block;
  max-width: 640px;
  max-height: 560px;
  width: auto;
  height: auto;
  border-radius: 10px;
  user-select: none;
  -webkit-user-drag: none;
}

.al-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border: none;
  border-radius: var(--r-dot);
  background: rgba(255, 255, 255, 0.9);
  color: var(--ink-1);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(31, 31, 89, 0.3);
  cursor: pointer;
  transition: background 0.15s ease;
}
.al-arrow:hover { background: #fff; }
.al-arrow:active { transform: translateY(-50%) scale(0.92); }
.al-arrow.left { left: 24px; }
.al-arrow.right { right: 24px; }

.al-count {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 12px;
  border-radius: var(--r-pill);
  background: rgba(13, 13, 26, 0.55);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
}

.al-close {
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
