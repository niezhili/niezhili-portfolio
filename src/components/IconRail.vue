<script setup>
import { profile, navItems } from '../data/content.js'

defineProps({ route: String })
const emit = defineEmits(['navigate'])
</script>

<template>
  <aside class="icon-rail">
    <div class="avatar-sm"><img :src="profile.avatar" :alt="profile.name" /></div>

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
  top: 0;
  left: 0;
  width: 76px;
  height: 100%;
  padding: 24px 16px;
  background: rgba(255, 255, 255, 0.35);
  border-right: 1px solid var(--glass-stroke);
  backdrop-filter: blur(16px) saturate(140%);
  -webkit-backdrop-filter: blur(16px) saturate(140%);
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
