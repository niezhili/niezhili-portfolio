<script setup>
import { ref, computed, watch, nextTick, provide } from 'vue'
import { navItems, profile } from '../data/content.js'
import { siteData } from '../store/siteData.js'
import { STAGE_PREVIEW } from '../lib/stageContext.js'
import TopBar from './TopBar.vue'
import HomeView from '../views/HomeView.vue'
import EducationView from '../views/EducationView.vue'
import ProjectsView from '../views/ProjectsView.vue'
import CompetitionsView from '../views/CompetitionsView.vue'
import HonorsView from '../views/HonorsView.vue'

// 台前调度窗口条：头像窗（个人资料）+ 五个页面窗
// - 缩略图是**真实页面**：按主区原始尺寸 1104×768 布局，再整体缩到卡片大小
//   （所以缩略图里的版式、玻璃层、图片位置都与舞台一致，只是小）
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

// 主区实际尺寸（App.vue 里 .main-area：1280-160-16 × 800-16-16）。
const STAGE_W = 1104
const STAGE_H = 768
const CARD_W = 175 // = --stage-card-w，改令牌时这里要同步
const frameStyle = {
  width: STAGE_W + 'px',
  height: STAGE_H + 'px',
  transform: `scale(${CARD_W / STAGE_W})`
}

// ---------- 窗口条几何：所有卡片朝同一个灭点收拢 ----------
// 截图里最上面那张的「上边」往下压、最下面那张的「下边」往上抬，说明它们共享一个
// 灭点（竖直方向位于条的中心）。所以每张卡的四角由它的**槽位**决定：
//   左缘不动（最近），右缘按 TAPER 缩向灭点；右缘中点 = 灭点 + (左缘中点 - 灭点) * TAPER
// 这样整列窗就像贴在一个朝右后方退去的平面上。
const AVATAR_H = 44
const CARD_H = 122
const GAP = 12
const VPY = 400      // 画布竖直中心（= 灭点高度）
const VIS_W = 99     // 视觉宽度（透视后）
const TAPER = 0.88   // 右缘 / 左缘（0.84 时倾斜偏大，按手绘边界收到 0.88）

// 每个槽位的 canvas y（条本身垂直居中）
function slotTops(order) {
  const hs = order.map(k => (k === 'avatar' ? AVATAR_H : CARD_H))
  const total = hs.reduce((a, b) => a + b, 0) + GAP * Math.max(0, order.length - 1)
  let y = VPY - total / 2
  const out = {}
  order.forEach((k, i) => {
    out[k] = y
    y += hs[i] + GAP
  })
  return out
}

// 某个槽位上的卡片四角（相对卡片左上角）
function quadFor(top) {
  const cL = top + CARD_H / 2
  const cR = VPY + (cL - VPY) * TAPER
  const hR = CARD_H * TAPER
  return [
    [0, 0],
    [VIS_W, cR - hR / 2 - top],
    [VIS_W, cR + hR / 2 - top],
    [0, CARD_H]
  ]
}

// 把 w×h 的矩形映射到任意四边形（四点单应），返回 matrix3d
function quadMatrix(w, h, [p0, p1, p2, p3]) {
  const [x0, y0] = p0, [x1, y1] = p1, [x2, y2] = p2, [x3, y3] = p3
  const dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3
  const dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3
  let a, b, c, d, e, f, g, k
  if (Math.abs(dx3) < 1e-9 && Math.abs(dy3) < 1e-9) {
    // 仿射退化（四边形其实是平行四边形）
    a = x1 - x0; b = x2 - x1; c = x0
    d = y1 - y0; e = y2 - y1; f = y0
    g = 0; k = 0
  } else {
    const det = dx1 * dy2 - dx2 * dy1
    g = (dx3 * dy2 - dx2 * dy3) / det
    k = (dx1 * dy3 - dx3 * dy1) / det
    a = x1 - x0 + g * x1
    b = x3 - x0 + k * x3
    c = x0
    d = y1 - y0 + g * y1
    e = y3 - y0 + k * y3
    f = y0
  }
  // 源坐标是 w×h，所以把单应里的小数系数按比例还原
  const A = a / w, B = b / h, C = c
  const D = d / w, E = e / h, F = f
  const G = g / w, H = k / h
  return `matrix3d(${A},${D},0,${G}, ${B},${E},0,${H}, 0,0,1,0, ${C},${F},0,1)`
}

const quads = computed(() => {
  const tops = slotTops(props.order)
  const out = {}
  for (const key of props.order) {
    if (key === 'avatar') continue
    out[key] = quadMatrix(CARD_W, CARD_H, quadFor(tops[key]))
  }
  return out
})

// 缩略图里的页面只当画面，不挂键盘/滚轮监听
provide(STAGE_PREVIEW, true)

const VIEWS = {
  home: HomeView,
  edu: EducationView,
  proj: ProjectsView,
  comp: CompetitionsView,
  honor: HonorsView
}

const labelOf = key => key === 'avatar'
  ? '个人资料'
  : (navItems.find(n => n.key === key)?.label || key)

// ---------- 槽位重排：旧的槽位 → 新的槽位 ----------
// 卡片移动时四边形本身也会变（越靠近灭点越扁），所以关键帧里要从「旧四边形」补到「新四边形」。
const REFLOW_MS = 420
const REFLOW_EASE = 'cubic-bezier(.32,.72,0,1)'

async function reflow(prevOrder) {
  const before = slotTops(prevOrder)
  const beforeQuads = {}
  for (const k of prevOrder) if (k !== 'avatar') beforeQuads[k] = quadFor(before[k])
  await nextTick()
  const after = slotTops(props.order)
  root.value?.querySelectorAll('[data-key]').forEach(el => {
    const key = el.dataset.key
    if (before[key] == null) return
    const dy = before[key] - after[key]
    if (Math.abs(dy) < 0.5) return
    const to = key === 'avatar' ? 'translateY(0px)' : quads.value[key]
    const from = key === 'avatar'
      ? `translateY(${dy}px)`
      : `translateY(${dy}px) ${quadMatrix(CARD_W, CARD_H, beforeQuads[key])}`
    el.animate([{ transform: from }, { transform: to }], {
      duration: REFLOW_MS,
      easing: REFLOW_EASE
    })
  })
}

watch(() => props.order.slice(), (next, prev) => {
  if (prev && prev.length) reflow(prev)
})

function pick(key) {
  if (props.busy) return
  emit('pick', key)
}

defineExpose({ root })
</script>

<template>
  <aside ref="root" class="stage-strip" :class="{ busy }">
    <div
      v-for="key in order"
      :key="key"
      class="slot"
      :class="[key === 'avatar' ? 'slot-avatar' : 'slot-win', { hidden: key === hiddenKey }]"
      :data-key="key"
      :style="key === 'avatar' ? null : { transform: quads[key] }"
      role="button"
      tabindex="0"
      :aria-label="`打开${labelOf(key)}`"
      :title="labelOf(key)"
      @click="pick(key)"
      @keydown.enter.prevent="pick(key)"
      @keydown.space.prevent="pick(key)"
    >
      <!-- 头像窗：44px 正圆，只有画面没有标题 -->
      <template v-if="key === 'avatar'">
        <img class="avatar-img" :src="siteData.avatar" :alt="profile.name" />
      </template>

      <!-- 页面窗：真实页面按 1104×768 渲染后缩到卡片大小；左下角图标 -->
      <template v-else>
        <div class="thumb" inert aria-hidden="true">
          <div class="thumb-frame" :style="frameStyle">
            <TopBar :title="labelOf(key)" bare />
            <div class="thumb-body">
              <component :is="VIEWS[key]" />
            </div>
          </div>
        </div>
        <span class="badge" aria-hidden="true">
          <svg v-if="key === 'home'" width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M4 10.5L12 4l8 6.5V20a1 1 0 01-1 1h-4v-6h-6v6H5a1 1 0 01-1-1v-9.5z"
              stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
          </svg>
          <svg v-else-if="key === 'edu'" width="13" height="13" viewBox="0 0 24 24" fill="none">
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
    </div>
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
  background: rgba(255, 255, 255, 0.38);
  border: 1px solid rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(10px) saturate(120%);
  -webkit-backdrop-filter: blur(10px) saturate(120%);
  box-shadow: 0 10px 26px rgba(31, 31, 89, 0.22), 0 2px 6px rgba(31, 31, 89, 0.14);
  transform-origin: 0 0;
  cursor: pointer;
  opacity: 0.92;
  transition: opacity 0.18s ease, box-shadow 0.18s ease;
}
.slot:hover {
  opacity: 1;
  box-shadow: 0 18px 42px rgba(31, 31, 89, 0.26);
}
.slot:focus-visible {
  opacity: 1;
  outline: 2px solid var(--blue-500);
  outline-offset: 2px;
}
/* 即将被替换的槽位：飞行中保持不可见，落地瞬间再出来 */
.slot.hidden { opacity: 0 !important; }

/* 头像窗 */
.slot-avatar {
  width: var(--stage-avatar);
  height: var(--stage-avatar);
  border-radius: 50%;
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
}

/* 缩略图：真实页面按 1104×768 布局，再整体缩放到卡片大小 */
.thumb {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  overflow: hidden;
}
.thumb-frame {
  transform-origin: left top;
  display: flex;
  flex-direction: column;
  gap: 22px;
  padding: var(--pad-main);
  box-sizing: border-box;
  pointer-events: none;   /* 画面不可交互，点击落到卡片上 */
}
/* 与 .page-scroll 同款内距，缩略图里版式才能与舞台逐像素对齐 */
.thumb-body {
  flex: 1;
  overflow: hidden;
  padding: 10px 14px 10px 10px;
  margin: -10px -14px -10px -10px;
  pointer-events: none;
}

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
