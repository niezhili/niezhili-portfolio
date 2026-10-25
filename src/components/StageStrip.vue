<script setup>
import { ref, onBeforeUpdate, onUpdated, nextTick } from 'vue'
import { navItems, profile } from '../data/content.js'
import { siteData } from '../store/siteData.js'

// 台前调度窗口条：头像窗（个人资料）+ 各页面窗
// - 顺序固定（由 order 传入），当前页不在条中
// - 卡片保持梯形透视、半透明、无描边，左下角挂一枚页面图标（对齐 macOS 观感）
// - 槽位重排用手写 FLIP（祖先有 scale，TransitionGroup 会补偿错位）
const props = defineProps({
  order: { type: Array, required: true },
  hiddenKey: { type: String, default: null },
  busy: { type: Boolean, default: false }
})
const emit = defineEmits(['pick'])

const root = ref(null)

const labelOf = key => key === 'avatar'
  ? '个人资料'
  : (navItems.find(n => n.key === key)?.label || key)

// 每页的线框示意宽度（三条横条，模拟各自版式）
const WIRE = {
  edu:   [100, 72, 48],
  proj:  [100, 86, 60],
  comp:  [94, 94, 56],
  honor: [78, 100, 66]
}
const wireOf = key => WIRE[key] || [96, 78, 54]

// ---------- 槽位重排：前后对比 top 差值，用 WAAPI 补一段位移 ----------
let prevTops = {}
function tops() {
  const m = {}
  if (!root.value) return m
  root.value.querySelectorAll('[data-key]').forEach(el => {
    m[el.dataset.key] = el.getBoundingClientRect().top
  })
  return m
}
// canvas 可能被缩放，位移量要换算回未缩放坐标
function canvasScale() {
  const c = document.querySelector('.canvas-root')
  if (!c) return 1
  return c.getBoundingClientRect().width / 1280 || 1
}

onBeforeUpdate(() => { prevTops = tops() })
onUpdated(() => {
  if (!root.value) return
  const k = canvasScale()
  root.value.querySelectorAll('[data-key]').forEach(el => {
    const before = prevTops[el.dataset.key]
    if (before == null) return
    const delta = (before - el.getBoundingClientRect().top) / k
    if (Math.abs(delta) < 1) return
    el.animate(
      [{ transform: `translateY(${delta}px)` }, { transform: 'translateY(0px)' }],
      { duration: 260, easing: 'cubic-bezier(.32,.72,0,1)' }
    )
  })
})

function pick(key) {
  if (props.busy) return
  emit('pick', key)
}

defineExpose({ root })
</script>

<template>
  <aside ref="root" class="stage-strip" :class="{ busy }">
    <button
      v-for="key in order"
      :key="key"
      class="slot"
      :class="[key === 'avatar' ? 'slot-avatar' : 'slot-win', { hidden: key === hiddenKey }]"
      :data-key="key"
      type="button"
      :aria-label="`打开${labelOf(key)}`"
      @click="pick(key)"
    >
      <!-- 头像窗：44px 正圆，只有画面没有标题 -->
      <template v-if="key === 'avatar'">
        <img class="avatar-img" :src="siteData.avatar" :alt="profile.name" />
      </template>

      <!-- 页面窗：页名 + 线框示意 + 左下角图标 -->
      <template v-else>
        <div class="win-head">
          <span class="win-title">{{ labelOf(key) }}</span>
        </div>
        <div class="wire" aria-hidden="true">
          <i v-for="(w, i) in wireOf(key)" :key="i" :style="{ width: w + '%' }" />
        </div>
        <span class="badge" aria-hidden="true">
          <svg v-if="key === 'edu'" width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M3 9l9-4 9 4-9 4-9-4z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
            <path d="M7 11.5V16c0 1.5 2.2 2.5 5 2.5s5-1 5-2.5v-4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
          <svg v-else-if="key === 'proj'" width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M4 8l8-4 8 4-8 4-8-4z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
            <path d="M4 13l8 4 8-4M4 17.5l8 4 8-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <svg v-else-if="key === 'comp'" width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M7 4h10v4a5 5 0 01-10 0V4z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
            <path d="M7 5H4v2a3 3 0 003 3M17 5h3v2a3 3 0 01-3 3M12 13v4M9 20h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
          <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="9" r="5" stroke="currentColor" stroke-width="1.8"/>
            <path d="M9 13.5L8 21l4-2 4 2-1-7.5" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
          </svg>
        </span>
      </template>
    </button>
  </aside>
</template>

<style scoped>
.stage-strip {
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--stage-gap);
  z-index: 45;
}
.stage-strip.busy { pointer-events: none; }

/* 通用槽位：梯形透视、无描边、半透明 */
.slot {
  position: relative;
  padding: 0;
  border: none;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(30px) saturate(140%);
  -webkit-backdrop-filter: blur(30px) saturate(140%);
  box-shadow: 0 14px 32px rgba(31, 31, 89, 0.2);
  transform-origin: left center;
  transform: perspective(700px) rotateY(22deg);
  cursor: pointer;
  opacity: 0.62;
  transition: opacity 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
}
.slot:hover {
  opacity: 1;
  background: #fff;
  box-shadow: 0 18px 42px rgba(31, 31, 89, 0.26);
}
/* 即将被替换的槽位：飞行中保持不可见，落地瞬间再出来 */
.slot.hidden { opacity: 0 !important; }

/* 头像窗 */
.slot-avatar {
  width: var(--stage-avatar);
  height: var(--stage-avatar);
  border-radius: 50%;
  overflow: hidden;
}
.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  display: block;
}

/* 页面窗 */
.slot-win {
  width: var(--stage-card-w);
  height: var(--stage-card-h);
  border-radius: var(--stage-radius);
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  text-align: left;
}
.win-head { display: flex; align-items: center; }
.win-title {
  font-family: var(--font-display);
  font-size: 12.5px;
  font-weight: 500;
  color: var(--ink-2);
  letter-spacing: 0.01em;
  white-space: nowrap;
}

/* 线框示意：三条横条 */
.wire {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding-bottom: 2px;
}
.wire i {
  display: block;
  height: 4px;
  border-radius: 2px;
  background: rgba(31, 31, 89, 0.14);
}
.slot:hover .wire i { background: rgba(10, 132, 255, 0.2); }

/* 左下角图标：略凸出窗口边缘 */
.badge {
  position: absolute;
  left: -6px;
  bottom: -6px;
  width: 26px;
  height: 26px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ink-1);
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 4px 10px rgba(31, 31, 89, 0.24);
  transition: color 0.18s ease;
}
.slot:hover .badge { color: var(--blue-600); }
</style>
