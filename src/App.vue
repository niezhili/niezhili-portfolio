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
const phase = ref('idle')            // idle | out | in
const busy = computed(() => phase.value !== 'idle')
const activeKey = computed(() => pendingKey.value ?? route.value)

// 台前调度：左侧窗口条 + 中央舞台。
// 顺序固定（头像 → 教育 → 项目 → 竞赛 → 荣誉），当前页从条中抽出、其余补位；
// 主页 = 桌面，不占卡片位，子页覆盖它。
const stripOrder = computed(() =>
  STAGE_KEYS.filter(k => k !== activeKey.value && k !== 'home')
)

const mainEl = ref(null)
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

// ---------- FLIP：窗口在舞台与条之间飞行 ----------
const wait = ms => new Promise(r => setTimeout(r, ms))
// 开发调试：?slowstage=4 把切换动画放慢 4 倍，便于逐帧检查（生产忽略）
const SLOW = import.meta.env.DEV ? Math.max(1, Math.min(8, Number(new URLSearchParams(location.search).get('slowstage') || 1))) : 1
// 切换前会用 Escape 广播关掉页内浮层；这个标志防止该广播反过来触发「Esc 回桌面」
let closingOverlays = false

// 把元素矩形换算到「未缩放」的画布坐标（canvas-root 有 scale）
function canvasRect(el) {
  const rootEl = document.querySelector('.canvas-root')
  if (!rootEl || !el) return null
  const rb = rootEl.getBoundingClientRect()
  const s = scale.value || 1
  const r = el.getBoundingClientRect()
  return { x: (r.left - rb.left) / s, y: (r.top - rb.top) / s, w: r.width / s, h: r.height / s }
}

function frameTransform(from, main) {
  const sx = from.w / main.w
  const sy = from.h / main.h
  return {
    transform: `translate(${from.x - main.x}px, ${from.y - main.y}px) scale(${sx}, ${sy})`,
    radius: Math.min(120, 14 / Math.max(Math.min(sx, sy), 0.04))
  }
}

async function switchTo(key) {
  if (busy.value || key === route.value || !STAGE_KEYS.includes(key)) return

  // 关闭页内浮层（灯箱 / 预览窗都会响应 Escape）
  closingOverlays = true
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
  await nextTick()
  closingOverlays = false

  const el = mainEl.value
  const main = canvasRect(el)
  const outgoing = route.value
  // 目标卡片的位置必须在条重排之前量（重排后它就不在条里了）
  const inSlot = stripRef.value?.root?.querySelector(`[data-key="${key}"]`)
  const inRect = inSlot ? canvasRect(inSlot) : null

  // 条先重排：旧页插回它的槽位，当前页被抽出
  pendingKey.value = key
  await nextTick()
  const outSlot = stripRef.value?.root?.querySelector(`[data-key="${outgoing}"]`)
  const outRect = outgoing === 'home' ? null : (outSlot ? canvasRect(outSlot) : null)

  el.style.willChange = 'transform'

  // ---------- 离场 ----------
  phase.value = 'out'
  if (outRect) {
    const end = frameTransform(outRect, main)
    const anim = el.animate(
      [
        { transform: 'translate(0px, 0px) scale(1, 1)', borderRadius: '0px' },
        { transform: end.transform, borderRadius: `${end.radius}px` }
      ],
      { duration: 200 * SLOW, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards' }
    )
    // 用定时器而不是 anim.finished：某些环境里该 Promise 会提前决议，导致离场被跳过
    await wait(200 * SLOW)
    // 先写内联终态，再 cancel —— 顺序反了会闪回全尺寸
    el.style.transform = end.transform
    el.style.borderRadius = `${end.radius}px`
    anim.cancel()
  } else {
    // 离开桌面：不飞走，原地压暗后退，由新页盖上来
    await wait(140)
  }

  // ---------- 提交 ----------
  route.value = key
  pendingKey.value = null
  await nextTick()

  // ---------- 入场 ----------
  phase.value = 'in'
  let start = { transform: 'translate(0px, 0px) scale(.985, .985)', radius: 0 }
  if (inRect) start = frameTransform(inRect, main)
  el.style.transform = start.transform
  el.style.borderRadius = `${start.radius}px`

  const anim = el.animate(
    [
      { transform: start.transform, borderRadius: `${start.radius}px` },
      { transform: 'translate(0px, 0px) scale(1, 1)', borderRadius: '0px' }
    ],
    { duration: 300 * SLOW, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'forwards' }
  )
  await wait(300 * SLOW)
  anim.cancel()

  // ---------- 收尾：必须清干净，will-change 也会让 fixed 后代被捕获 ----------
  el.style.transform = ''
  el.style.borderRadius = ''
  el.style.willChange = ''
  phase.value = 'idle'

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

// current page title (e.g. 项目经历) — shown centered in the top bar
const currentTitle = computed(() => {
  if (route.value === 'avatar') return '个人资料'
  return navItems.find(n => n.key === route.value)?.label || ''
})

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
      :class="{ 'stage-busy': busy, 'stage-out': phase === 'out', 'stage-in': phase === 'in' }"
      :style="{
        transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
        '--veil-delay': `${140 * SLOW}ms`,
        '--veil-dur': `${60 * SLOW}ms`,
        '--veil-in-delay': `${60 * SLOW}ms`,
        '--veil-in-dur': `${220 * SLOW}ms`
      }"
    >
      <!-- 台前调度窗口条：头像窗 + 各页面窗，点击即把该窗口送到舞台 -->
      <StageStrip
        ref="stripRef"
        :order="stripOrder"
        :hidden-key="phase === 'out' ? route : null"
        :busy="busy"
        @pick="switchTo"
      />

      <!-- 舞台 -->
      <div ref="mainEl" class="main-area" :inert="busy">
        <TopBar
          :title="currentTitle"
          @open-cms="openCMS"
        />

        <div class="page-scroll">
          <HomeView         v-if="route === 'home'"   @open-cms="openCMS" />
          <EducationView    v-else-if="route === 'edu'" />
          <ProjectsView     v-else-if="route === 'proj'" />
          <CompetitionsView v-else-if="route === 'comp'" />
          <HonorsView       v-else-if="route === 'honor'" />
          <AvatarView       v-else-if="route === 'avatar'" />
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
}
/* 飞行期间舞台要盖在窗口条之上（条是 45） */
.stage-busy .main-area { z-index: 46; }

/* 白色窗口面：内容是可见的，先让窗口带着内容缩小 120ms，再被白面盖住，
   提交瞬间用不透明的白面藏住换页，最后在放大过程中揭开新页 */
.main-area::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: #fff;
  opacity: 0;
  pointer-events: none;
  transition: opacity 200ms linear;
}
.stage-out .main-area::after {
  opacity: 1;
  transition: opacity var(--veil-dur, 60ms) linear var(--veil-delay, 140ms);
}
.stage-in .main-area::after {
  opacity: 0;
  transition: opacity var(--veil-in-dur, 220ms) linear var(--veil-in-delay, 60ms);
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

@media (prefers-reduced-motion: reduce) {
  .main-area::after { transition-duration: 0ms !important; transition-delay: 0ms !important; }
}
</style>
