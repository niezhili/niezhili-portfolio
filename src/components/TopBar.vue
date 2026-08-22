<script setup>
import { siteData } from '../store/siteData.js'

defineProps({
  collapsed: Boolean
})
const emit = defineEmits(['toggle-sidebar', 'open-cms'])
</script>

<template>
  <header class="topbar">
    <div class="left">
      <button class="pill-toggle" @click="emit('toggle-sidebar')">
        <span class="chev">{{ collapsed ? '›' : '‹' }}</span>
        {{ collapsed ? '展开侧栏' : '收起侧栏' }}
      </button>
    </div>

    <div class="right">
      <span class="updated">最近更新 · {{ siteData.lastPublishedAt }}</span>
      <button class="btn-primary" @click="emit('open-cms')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
            fill="currentColor"/>
        </svg>
        内容管理
      </button>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 32px;
  flex-shrink: 0;
}

.left, .right { display: flex; align-items: center; gap: 12px; }

.updated {
  font-size: 12px;
  color: var(--ink-3);
  font-weight: 500;
}

.pill-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 14px;
  border: 1px solid var(--glass-stroke);
  border-radius: var(--r-pill);
  background: #fff;
  color: var(--ink-2);
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(31, 31, 89, 0.08);
}
.pill-toggle .chev { font-size: 16px; color: var(--blue-500); font-weight: 700; }
.pill-toggle:hover { background: var(--blue-500); color: #fff; }
.pill-toggle:hover .chev { color: #fff; }
</style>
