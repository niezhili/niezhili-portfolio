<script setup>
import { navItems } from '../data/content.js'
import { siteData } from '../store/siteData.js'

defineProps({ route: String })
const emit = defineEmits(['navigate'])
</script>

<template>
  <aside class="icon-rail glass">
    <div class="avatar-sm"><img :src="siteData.avatar" alt="个人头像" /></div>

    <nav class="rail-nav">
      <button
        v-for="item in navItems"
        :key="item.key"
        class="rail-item"
        :class="{ active: route === item.key }"
        :title="item.label"
        @click="emit('navigate', item.key)"
      >
        <span class="nav-dot" :class="item.dot" />
      </button>
    </nav>
  </aside>
</template>

<style scoped>
.icon-rail {
  position: absolute;
  top: 16px;
  left: 16px;
  bottom: 16px;
  width: 76px;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: center;
  animation: slideIn 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}
@keyframes slideIn { from { opacity: 0; } to { opacity: 1; } }

.avatar-sm {
  width: 44px;
  height: 44px;
  border-radius: var(--r-dot);
  background: #fff;
  box-shadow: 0 4px 10px rgba(31, 31, 89, 0.18);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.avatar-sm img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.rail-nav {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 8px;
}

.rail-item {
  width: 44px;
  height: 44px;
  border: none;
  background: transparent;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease;
}
.rail-item:hover { background: rgba(255, 255, 255, 0.5); }
.rail-item.active { background: #fff; box-shadow: 0 4px 10px rgba(31, 31, 89, 0.1); }
</style>
