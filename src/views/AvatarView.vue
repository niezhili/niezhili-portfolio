<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { siteData } from '../store/siteData.js'

// 个人资料窗（舞台内的头像页）：左右切换照片。
// 逻辑沿用原 AvatarLightbox：只读 siteData.photoLibrary，不引入新的数据源。
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
  if (e.ctrlKey || e.metaKey || e.altKey) return
  if (e.key === 'ArrowLeft') { e.preventDefault(); prev() }
  else if (e.key === 'ArrowRight') { e.preventDefault(); next() }
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

defineExpose({ prev, next })
</script>

<template>
  <div class="avatar-stage">
    <div class="frame glass">
      <img :key="current.src" class="photo" :src="current.src" :alt="current.name || '个人照片'" />
    </div>

    <button v-if="total > 1" class="arrow left" aria-label="上一张" @click="prev">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
    <button v-if="total > 1" class="arrow right" aria-label="下一张" @click="next">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

    <div class="foot">
      <span v-if="total > 1" class="count">{{ idx + 1 }} / {{ total }}</span>
      <span class="hint">← → 切换照片 · Esc 回到桌面</span>
    </div>
  </div>
</template>

<style scoped>
.avatar-stage {
  position: relative;
  height: 100%;
  min-height: 520px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.frame {
  padding: 12px;
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 24px 60px rgba(31, 31, 89, 0.24);
  animation: pop 0.3s cubic-bezier(0.34, 1.4, 0.64, 1);
}
@keyframes pop {
  from { transform: scale(0.94); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.photo {
  display: block;
  max-height: 470px;
  max-width: 720px;
  width: auto;
  height: auto;
  border-radius: 12px;
  user-select: none;
  -webkit-user-drag: none;
}

.arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border: none;
  border-radius: var(--r-dot);
  background: rgba(255, 255, 255, 0.92);
  color: var(--ink-1);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 18px rgba(31, 31, 89, 0.2);
  cursor: pointer;
  transition: background 0.15s ease, transform 0.15s ease;
}
.arrow:hover { background: #fff; transform: translateY(-50%) scale(1.06); }
.arrow.left { left: 8px; }
.arrow.right { right: 8px; }

.foot {
  margin-top: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 11px;
  color: var(--ink-3);
}
.count {
  padding: 3px 10px;
  border-radius: var(--r-pill);
  background: rgba(255, 255, 255, 0.6);
  font-weight: 600;
  letter-spacing: 0.06em;
}
</style>
