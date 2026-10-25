<script setup>
import { ref, provide, onBeforeUpdate, onUpdated } from 'vue'
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
// 卡片 132×92 与它同比例（1.4348 vs 1.4375），单轴缩放不会把画面压变形。
const STAGE_W = 1104
const STAGE_H = 768
const CARD_W = 165 // = --stage-card-w，改令牌时这里要同步
const frameStyle = {
  width: STAGE_W + 'px',
  height: STAGE_H + 'px',
  transform: `scale(${CARD_W / STAGE_W})`
}

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
    <div
      v-for="key in order"
      :key="key"
      class="slot"
      :class="[key === 'avatar' ? 'slot-avatar' : 'slot-win', { hidden: key === hiddenKey }]"
      :data-key="key"
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
  transform-origin: left center;
  transform: perspective(420px) rotateY(42deg);
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
