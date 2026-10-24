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
const sidebarCollapsed = ref(false)
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
// as the expand button when the sidebar is collapsed
const currentTitle = computed(() => navItems.find(n => n.key === route.value)?.label || '')

function navigate(key) { route.value = key }
function toggleSidebar() { sidebarCollapsed.value = !sidebarCollapsed.value }
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
      :style="{
        transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`
      }"
    >
      <!-- Sidebar (expanded) -->
      <Sidebar
        v-if="!sidebarCollapsed"
        :route="route"
        @navigate="navigate"
      />

      <!-- Icon rail (collapsed) -->
      <IconRail
        v-else
        :route="route"
        @navigate="navigate"
      />

      <!-- Main area -->
      <div class="main-area">
        <TopBar
          :collapsed="sidebarCollapsed"
          :title="currentTitle"
          @toggle-sidebar="toggleSidebar"
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

.main-area {
  position: absolute;
  top: 16px;
  left: 312px;
  right: 16px;
  bottom: 16px;
  display: flex;
  flex-direction: column;
  padding: var(--pad-main);
  gap: 22px;
  transition: left 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.canvas-root:has(.icon-rail) .main-area { left: 108px; }

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
