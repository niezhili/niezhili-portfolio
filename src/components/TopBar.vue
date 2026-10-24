<script setup>
import { siteData } from '../store/siteData.js'

defineProps({ title: String })
const emit = defineEmits(['open-cms'])
</script>

<template>
  <header class="topbar">
    <!-- 侧栏常驻为贴边缩略条，页面标题居中作为上下文提示 -->
    <div class="left">
      <div class="page-title"><span class="dot" />{{ title }}</div>
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
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 32px;
  flex-shrink: 0;
}

.left, .right { display: flex; align-items: center; gap: 12px; }

/* Current page title — absolutely centered in the top bar */
.page-title {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--ink-1);
  letter-spacing: 0.02em;
  white-space: nowrap;
}
.page-title .dot {
  width: 6px; height: 6px; border-radius: var(--r-dot);
  background: var(--blue-500);
  box-shadow: 0 0 0 3px rgba(10, 132, 255, 0.18);
}

.updated {
  font-size: 12px;
  color: var(--ink-3);
  font-weight: 500;
}

</style>
