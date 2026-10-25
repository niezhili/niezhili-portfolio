<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { navItems } from './data/content.js'
import StageStrip from './components/StageStrip.vue'
import TopBar from './components/TopBar.vue'
import PasscodeModal from './components/PasscodeModal.vue'
import CMSWindow from './components/CMSWindow.vue'
import { isSessionUnlocked, markSessionUnlocked } from './lib/biometric.js'
import HomeView from './views/HomeView.vue'
import EducationView from './views/EducationView.vue'
import ProjectsView from './views/ProjectsView.vue'
import CompetitionsView from './views/CompetitionsView.vue'
import HonorsView from './views/HonorsView.vue'
import AvatarView from './views/AvatarView.vue'

const VIEWS = {
  home: HomeView,
  edu: EducationView,
  proj: ProjectsView,
  comp: CompetitionsView,
  honor: HonorsView,
  avatar: AvatarView
}

const STAGE_KEYS = ['avatar', ...navItems.map(n => n.key)]

// 支持 ?v=proj 之类深链，方便直接分享到某一页
function initialRoute() {
  try {
    const v = new URLSearchParams(window.location.search).get('v')
    if (v && STAGE_KEYS.includes(v)) return v
  } catch (e) { /* ignore */ }
  return 'home'
}

const route = ref(initialRoute())
const pendingKey = ref(null)
// 正在从卡片飞出来的那一页（渲染在舞台之上，落位后与舞台换手）
const incoming = ref(null)
const busy = computed(() => !!incoming.value)
const activeKey = computed(() => pendingKey.value ?? route.value)

// 台前调度：左侧窗口条 + 中央舞台。
// 顺序固定（头像 → 主页 → 教育 → 项目 → 竞赛 → 荣誉），当前页从条中抽出、其余补位。
// 主页也占一张卡：它是「回首页」的唯一入口。
const stripOrder = computed(() =>
  STAGE_KEYS.filter(k => k !== activeKey.value)
)

const mainEl = ref(null)
const ghostEl = ref(null)
const stripRef = ref(null)

const showPasscode = ref(false)
const showCMS = ref(false)

// ---------- 舞台缩放 ----------
const stageEl = ref(null)
const scale = ref(1)
const offset = ref({ x: 0, y: 0 })

function computeScale() {
  const W = window.innerWidth
  const H = window.innerHeight
  const s = Math.min(1, W / 1280, H / 800)
  scale.value = s
  const scaledW = 1280 * s
  const scaledH = 800 * s
  offset.value = {
    x: Math.round((W - scaledW) / 2),
    y: Math.round((H - scaledH) / 2)
  }
}

// ---------- 窗口飞行 ----------
const wait = ms => new Promise(r => setTimeout(r, ms))
// 开发调试：?slowstage=4 把切换动画放慢 4 倍，便于逐帧检查（生产忽略）
const SLOW = import.meta.env.DEV ? Math.max(1, Math.min(8, Number(new URLSearchParams(location.search).get('slowstage') || 1))) : 1
// 切换前会用 Escape 广播关掉页内浮层；这个标志防止该广播反过来触发「Esc 回桌面」
let closingOverlays = false

const DUR_OUT = 80
const DUR_IN = 400

// 把元素矩形换算到「未缩放」的画布坐标（canvas-root 有 scale）
function canvasRect(el) {
  const rootEl = document.querySelector('.canvas-root')
  if (!rootEl || !el) return null
  const rb = rootEl.getBoundingClientRect()
  const s = scale.value || 1
  const r = el.getBoundingClientRect()
  return { x: (r.left - rb.left) / s, y: (r.top - rb.top) / s, w: r.width / s, h: r.height / s }
}

// 目标矩形 → 舞台的 transform（transform-origin: 0 0，左上角对齐）
function frameTransform(from, main) {
  const sx = from.w / main.w
  const sy = from.h / main.h
  return {
    transform: `translate(${from.x - main.x}px, ${from.y - main.y}px) scale(${sx}, ${sy})`,
    // 圆角在元素坐标系里放大，视觉上才等于卡片的 14px
    radius: Math.min(600, 14 / Math.max(Math.min(sx, sy), 0.01))
  }
}

async function switchTo(key) {
  if (busy.value || key === route.value || !STAGE_KEYS.includes(key)) return

  // 关闭页内浮层（灯箱 / 预览窗都会响应 Escape）
  closingOverlays = true
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
  await nextTick()
  closingOverlays = false

  const main = canvasRect(mainEl.value)
  // 被点那张卡的位置：必须在条重排前量（重排后它就不在条里了）
  const cardEl = stripRef.value?.root?.querySelector(`[data-key="${key}"]`)
  const cardRect = cardEl ? canvasRect(cardEl) : null

  // 条立刻重排：被点的卡片「飞出去」，旧页的卡片滑回自己的槽位
  pendingKey.value = key
  incoming.value = key
  await nextTick()

  // 旧窗口：80ms 内淡出。
  // 为什么不「缩回槽位」：两层页面都是透明玻璃，只要重叠就会被看穿、糊成一片，
  // 而新窗口是 ease-out（前段长得极快），旧页必须在它铺开之前就消失。
  if (mainEl.value) {
    mainEl.value.animate(
      [{ opacity: 1 }, { opacity: 0 }],
      { duration: DUR_OUT * SLOW, easing: 'cubic-bezier(.4, 0, .2, 1)', fill: 'forwards' }
    )
  }

  // 新窗口：就是被点的那张卡，从卡片矩形长到满屏
  if (ghostEl.value && cardRect) {
    const from = frameTransform(cardRect, main)
    // 头像窗的卡是正圆：起点用 50% 才会是圆（用 px 会被 44px 盒子限制成圆角方块）
    const startRadius = key === 'avatar' ? '50%' : `${from.radius}px`
    ghostEl.value.animate(
      [
        { transform: from.transform, borderRadius: startRadius },
        { transform: 'translate(0px, 0px) scale(1, 1)', borderRadius: '0px' }
      ],
      { duration: DUR_IN * SLOW, easing: 'cubic-bezier(.25, .46, .45, .94)', fill: 'forwards' }
    )
  }

  await wait(DUR_IN * SLOW)

  // 同一帧内：撤掉旧舞台的动画残留 → 换页 → 移除飞出层，视觉上无缝衔接
  mainEl.value?.getAnimations().forEach(a => a.cancel())
  route.value = key
  pendingKey.value = null
  incoming.value = null
  await nextTick()

  try {
    const url = new URL(location.href)
    url.searchParams.set('v', key)
    history.replaceState(null, '', url)
  } catch (e) { /* file:// 或沙箱环境忽略 */ }
}

// ---------- 键盘 ----------
function onStageKey(e) {
  if (e.key === 'Escape') {
    if (!closingOverlays && route.value === 'avatar' && !busy.value) switchTo('home')
    return
  }
  if (!(e.ctrlKey || e.metaKey)) return
  if (busy.value || showCMS.value || showPasscode.value) return
  if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
  e.preventDefault()
  const keys = navItems.map(n => n.key)
  const i = keys.indexOf(route.value)
  const base = i < 0 ? 0 : i
  const dir = e.key === 'ArrowRight' ? 1 : -1
  switchTo(keys[(base + dir + keys.length) % keys.length])
}

onMounted(() => {
  computeScale()
  window.addEventListener('resize', computeScale)
  window.addEventListener('keydown', onStageKey)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', computeScale)
  window.removeEventListener('keydown', onStageKey)
})

// 当前页标题（顶栏居中显示）
function titleOf(key) {
  if (key === 'avatar') return '个人资料'
  return navItems.find(n => n.key === key)?.label || ''
}
const currentTitle = computed(() => titleOf(route.value))

function openCMS() {
  if (isSessionUnlocked()) {
    showCMS.value = true
    return
  }
  showPasscode.value = true
}
function onUnlockSuccess() {
  markSessionUnlocked()
  showPasscode.value = false
  showCMS.value = true
}
function closePasscode() { showPasscode.value = false }
function closeCMS() { showCMS.value = false }
function onPublish() {
  showCMS.value = false
  switchTo('home')
}
</script>

<template>
  <div ref="stageEl" class="canvas-stage">
    <div
      class="canvas-root"
      :style="{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})` }"
    >
      <!-- 台前调度窗口条：头像窗 + 各页面窗，点击即把该窗口送到舞台 -->
      <StageStrip
        ref="stripRef"
        :order="stripOrder"
        :busy="busy"
        @pick="switchTo"
      />

      <!-- 舞台 -->
      <div ref="mainEl" class="main-area" :inert="busy">
        <TopBar :title="currentTitle" @open-cms="openCMS" />
        <div class="page-scroll">
          <component :is="VIEWS[route]" v-on="route === 'home' ? { 'open-cms': openCMS } : {}" />
        </div>
      </div>

      <!-- 飞出的窗口：起步就是被点那张卡的位置与大小，长到满屏后与舞台换手 -->
      <div v-if="incoming" ref="ghostEl" class="main-area main-ghost" inert>
        <TopBar :title="titleOf(incoming)" />
        <div class="page-scroll">
          <component :is="VIEWS[incoming]" v-on="incoming === 'home' ? { 'open-cms': openCMS } : {}" />
        </div>
      </div>

      <!-- Overlays -->
      <Transition name="fade">
        <PasscodeModal
          v-if="showPasscode"
          @close="closePasscode"
          @success="onUnlockSuccess"
        />
      </Transition>

      <Transition name="fade">
        <CMSWindow
          v-if="showCMS"
          @close="closeCMS"
          @publish="onPublish"
        />
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.canvas-root { transition: transform 0.18s ease; }

.main-area {
  position: absolute;
  top: 16px;
  left: 160px;
  right: 16px;
  bottom: 16px;
  display: flex;
  flex-direction: column;
  padding: var(--pad-main);
  gap: 22px;
  overflow: hidden;
  /* 飞行动画按左上角换算矩形，必须显式 0 0；
     默认 center 会让落点整体偏掉半个宽度 */
  transform-origin: 0 0;
}

/* 飞出的窗口：盖在条（45）之上，落位时正好与舞台重合 */
.main-ghost {
  z-index: 46;
  pointer-events: none;
}

.page-scroll {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 10px 14px 10px 10px;
  margin: -10px -14px -10px -10px;
}
.page-scroll::-webkit-scrollbar { width: 6px; }
.page-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.4); border-radius: 3px; }
.page-scroll::-webkit-scrollbar-track { background: transparent; }

/* Modal transitions */
.fade-enter-active, .fade-leave-active { transition: opacity 0.22s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
