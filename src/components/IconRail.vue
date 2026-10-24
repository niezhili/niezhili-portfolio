<script setup>
import { navItems } from '../data/content.js'
import { siteData } from '../store/siteData.js'

defineProps({ route: String })
const emit = defineEmits(['navigate'])
</script>

<template>
  <aside class="rail" aria-label="主导航">
    <button class="avatar-sm" type="button" aria-label="回到主页" @click="emit('navigate', 'home')">
      <img :src="siteData.avatar" alt="个人头像" />
    </button>

    <span class="rule" />

    <nav class="rail-nav">
      <button
        v-for="item in navItems"
        :key="item.key"
        class="rail-item"
        :class="{ active: route === item.key }"
        :aria-label="item.label"
        :title="item.label"
        @click="emit('navigate', item.key)"
      >
        <span class="nav-dot" :class="item.dot" />
      </button>
    </nav>

  </aside>
</template>

<style scoped>
/* 台前调度式缩略条：没有面板、没有描边，直接落在背景上 */
.rail {
  position: absolute;
  top: 16px;
  left: 16px;
  bottom: 16px;
  width: 56px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  pointer-events: none;
}
.rail > * { pointer-events: auto; }

.avatar-sm {
  width: 34px;
  height: 34px;
  padding: 0;
  border: none;
  border-radius: var(--r-dot);
  background: #fff;
  box-shadow: 0 4px 12px rgba(31, 31, 89, 0.18);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.18s cubic-bezier(0.34, 1.4, 0.64, 1);
}
.avatar-sm:hover { transform: scale(1.08); }
.avatar-sm img { width: 100%; height: 100%; object-fit: cover; display: block; }

.rule {
  width: 12px;
  height: 1px;
  background: rgba(255, 255, 255, 0.6);
}

.rail-nav { display: flex; flex-direction: column; gap: 6px; }

.rail-item {
  width: 34px;
  height: 34px;
  border: none;
  background: transparent;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.15s ease;
}
.rail-item:hover { background: rgba(255, 255, 255, 0.42); transform: scale(1.04); }
.rail-item.active {
  background: #fff;
  box-shadow: 0 4px 12px rgba(31, 31, 89, 0.14);
}
.rail-item .nav-dot {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  box-shadow: none;
}
</style>
