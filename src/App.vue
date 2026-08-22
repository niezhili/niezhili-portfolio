<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { navItems } from './data/content.js'
import Sidebar from './components/Sidebar.vue'
import IconRail from './components/IconRail.vue'
import TopBar from './components/TopBar.vue'
import PasscodeModal from './components/PasscodeModal.vue'
import CMSWindow from './components/CMSWindow.vue'
import HomeView from './views/HomeView.vue'
import EducationView from './views/EducationView.vue'
import ProjectsView from './views/ProjectsView.vue'
import CompetitionsView from './views/CompetitionsView.vue'
import HonorsView from './views/HonorsView.vue'
import { useProximityGlow } from './composables/useProximityGlow.js'

const route = ref('home')
const sidebarCollapsed = ref(false)
const showPasscode = ref(false)
const showCMS = ref(false)

// auto-scale
const stageEl = ref(null)
const canvasEl = ref(null)
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

// proximity glow — cards near the cursor light up
useProximityGlow(canvasEl)
onBeforeUnmount(() => window.removeEventListener('resize', computeScale))

const eyebrow = computed(() => navItems.find(n => n.key === route.value)?.eyebrow || '')

function navigate(key) { route.value = key }
function toggleSidebar() { sidebarCollapsed.value = !sidebarCollapsed.value }
function openCMS() {
  showPasscode.value = true
}
function onPasscodeSuccess() {
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
      ref="canvasEl"
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
        @toggle-sidebar="toggleSidebar"
      />

      <!-- Icon rail (collapsed) -->
      <IconRail
        v-else
        :route="route"
        @navigate="navigate"
        @toggle-sidebar="toggleSidebar"
      />

      <!-- Main area -->
      <div class="main-area">
        <TopBar
          :eyebrow="eyebrow"
          :collapsed="sidebarCollapsed"
          :route="route"
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
          @success="onPasscodeSuccess"
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
  top: 0;
  left: 280px;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  padding: var(--pad-main);
  gap: 22px;
  transition: left 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.canvas-root:has(.icon-rail) .main-area { left: 76px; }

.page-scroll {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 4px;
  margin-right: -4px;
}
.page-scroll::-webkit-scrollbar { width: 6px; }
.page-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.4); border-radius: 3px; }
.page-scroll::-webkit-scrollbar-track { background: transparent; }

/* Modal transitions */
.fade-enter-active, .fade-leave-active { transition: opacity 0.22s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
