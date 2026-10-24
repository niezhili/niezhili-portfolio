<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { navItems } from './data/content.js'
import Sidebar from './components/Sidebar.vue'
import IconRail from './components/IconRail.vue'
import TopBar from './components/TopBar.vue'
import PasscodeModal from './components/PasscodeModal.vue'
import CMSWindow from './components/CMSWindow.vue'
import { isSessionUnlocked, markSessionUnlocked } from './lib/biometric.js'
import HomeView from './views/HomeView.vue'
import EducationView from './views/EducationView.vue'
import ProjectsView from './views/ProjectsView.vue'
import CompetitionsView from './views/CompetitionsView.vue'
import HonorsView from './views/HonorsView.vue'

// 支持 ?v=proj 之类深链，方便直接分享到某一页（键名与 navItems 一致）
function initialRoute() {
  try {
    const v = new URLSearchParams(window.location.search).get('v')
    if (v && navItems.some(n => n.key === v)) return v
  } catch (e) { /* ignore */ }
  return 'home'
}

const route = ref(initialRoute())

// 台前调度式侧栏：常态只留 56px 缩略条，鼠标进入左侧地带才浮起完整面板。
// 面板是浮层（absolute + 更高 z-index），主区域宽度不变，页面不重排、不跳滚动位置。
// 开发环境可用 ?sb=1 直接打开面板（截图/联调用），生产构建忽略该参数
const __sbParam = new URLSearchParams(location.search).get('sb')
const sidebarOpen = ref(import.meta.env.DEV && !!__sbParam)
// 面板浮起时内容的表现：overlay = 原样被覆盖；shrink = 整体后退缩小（更像台前调度）
const asideMode = ref(__sbParam === 'push' ? 'shrink' : 'overlay')
let openTimer = null
let closeTimer = null

function enterAside() {
  clearTimeout(closeTimer)
  if (sidebarOpen.value) return
  clearTimeout(openTimer)
  openTimer = setTimeout(() => { sidebarOpen.value = true }, 180)
}
function leaveAside() {
  clearTimeout(openTimer)
  clearTimeout(closeTimer)
  closeTimer = setTimeout(() => { sidebarOpen.value = false }, 420)
}
function onNav(key) {
  navigate(key)
  clearTimeout(closeTimer)
  sidebarOpen.value = false
}
const showPasscode = ref(false)
const showCMS = ref(false)

// auto-scale
const stageEl = ref(null)
const scale = ref(1)
const offset = ref({ x: 0, y: 0 })

function computeScale() {
  const W = window.innerWidth
  const H = window.innerHeight
  // never scale up beyond the 1280×800 design — only shrink on narrow screens,
  // so the canvas always keeps a visible margin of breathing room around it
  const s = Math.min(1, W / 1280, H / 800)
  scale.value = s
  // center
  const scaledW = 1280 * s
  const scaledH = 800 * s
  offset.value = {
    x: Math.round((W - scaledW) / 2),
    y: Math.round((H - scaledH) / 2)
  }
}

onMounted(() => {
  computeScale()
  window.addEventListener('resize', computeScale)
})

onBeforeUnmount(() => window.removeEventListener('resize', computeScale))

// current page title (e.g. 项目经历) — shown centered in the top bar
const currentTitle = computed(() => navItems.find(n => n.key === route.value)?.label || '')

function navigate(key) { route.value = key }
function openCMS() {
  // 本次会话已验证过 → 直接进入，不再要求指纹/密码
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
  route.value = 'home'
}
</script>

<template>
  <div ref="stageEl" class="canvas-stage">
    <div
      class="canvas-root"
      :class="[{ 'aside-open': sidebarOpen }, asideMode]"
      :style="{
        transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`
      }"
    >
      <!-- 贴边缩略条（常驻）+ hover 触达区 -->
      <div
        class="rail-zone"
        :class="{ 'rail-hidden': sidebarOpen }"
        @mouseenter="enterAside"
        @mouseleave="leaveAside"
      >
        <IconRail :route="route" @navigate="onNav" />
      </div>

      <!-- 浮起的完整面板：覆盖在内容之上，不改变主区域宽度 -->
      <Transition name="panel">
        <div
          v-if="sidebarOpen"
          class="panel-wrap"
          @mouseenter="enterAside"
          @mouseleave="leaveAside"
        >
          <Sidebar :route="route" @navigate="onNav" />
        </div>
      </Transition>

      <!-- 面板浮起时轻微压暗内容，聚焦前景 -->
      <div class="dim" :class="{ on: sidebarOpen }" />

      <!-- Main area -->
      <div class="main-area">
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

.rail-zone {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 88px;
  z-index: 40;
  transition: opacity 0.16s ease;
}
.rail-zone.rail-hidden { opacity: 0; }

.panel-wrap {
  position: absolute;
  top: 16px;
  left: 16px;
  bottom: 16px;
  width: 280px;
  z-index: 45;
}
.canvas-root .main-area {
  transform-origin: left center;
  transition: left 0.28s cubic-bezier(0.4, 0, 0.2, 1),
              transform 0.34s cubic-bezier(0.32, 0, 0, 1),
              opacity 0.24s ease;
}
.canvas-root.shrink.aside-open .main-area {
  transform: translateX(208px) scale(0.82);
}

.panel-enter-active, .panel-leave-active {
  transition: opacity 0.22s ease, transform 0.28s cubic-bezier(0.32, 0, 0, 1);
}
.panel-enter-from, .panel-leave-to {
  opacity: 0;
  transform: translateX(-14px) scale(0.97);
}

.dim {
  position: absolute;
  top: 16px;
  left: 96px;
  right: 16px;
  bottom: 16px;
  border-radius: var(--r-card);
  background: rgba(13, 13, 26, 0.06);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.24s ease;
  z-index: 20;
}
.dim.on { opacity: 1; }

.main-area {
  position: absolute;
  top: 16px;
  left: 96px;
  right: 16px;
  bottom: 16px;
  display: flex;
  flex-direction: column;
  padding: var(--pad-main);
  gap: 22px;
  transition: left 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.page-scroll {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  /* breathing room so hover-scaled cards (scale 1.02) aren't clipped —
     padding + equal negative margin keeps the visual layout unchanged */
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
