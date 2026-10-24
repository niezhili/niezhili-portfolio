<script setup>
import { ref } from 'vue'
import { profile, navItems } from '../data/content.js'
import { siteData } from '../store/siteData.js'
import AvatarLightbox from './AvatarLightbox.vue'

defineProps({ route: String })
const emit = defineEmits(['navigate'])

const showAvatarZoom = ref(false)
</script>

<template>
  <aside class="sidebar glass">
    <!-- Brand -->
    <div class="brand">
      <button
        class="avatar"
        type="button"
        aria-label="查看头像大图"
        @click="showAvatarZoom = true"
      >
        <img :src="siteData.avatar" :alt="profile.name" />
      </button>
      <div class="brand-text">
        <div class="name">{{ profile.name }}</div>
        <div class="name-en">{{ profile.nameEn }}</div>
        <div class="roles">
          <span class="status-dot" />
          <span class="role">{{ profile.roles.join(' / ') }}</span>
        </div>
      </div>
    </div>

    <!-- Nav -->
    <div class="nav-block">
      <div class="block-label">导航</div>
      <nav class="nav">
        <button
          v-for="item in navItems"
          :key="item.key"
          class="nav-item"
          :class="{ active: route === item.key }"
          @click="emit('navigate', item.key)"
        >
          <span class="nav-dot" :class="item.dot" />
          <span class="nav-label">{{ item.label }}</span>
        </button>
      </nav>
    </div>

    <!-- Contact -->
    <div class="contact">
      <div class="block-label">联系</div>
      <div class="contact-row">
        <span class="dot blue" /> {{ profile.email }}
      </div>
      <div class="contact-row">
        <span class="dot gray" /> {{ profile.city }}
      </div>
    </div>

    <div class="footer">Copyright 2026 · Portfolio</div>

    <AvatarLightbox
      v-if="showAvatarZoom"
      @close="showAvatarZoom = false"
    />
  </aside>
</template>

<style scoped>
.sidebar {
  position: relative;
  width: 100%;
  /* 高度随内容收缩：不再拉满画布，去掉「联系」与页脚之间的大片留白，
     缩略态（台前调度）比例更协调 */
  height: fit-content;
  padding: var(--pad-sidebar-y) var(--pad-sidebar-x);
  border-right: none;
  display: flex;
  flex-direction: column;
  gap: var(--gap-sidebar);
  /* 浮层盖在内容之上，玻璃要比常态更实，否则文字会与背后内容互相干扰 */
  background: rgba(255, 255, 255, 0.74);
  backdrop-filter: blur(30px) saturate(165%);
  -webkit-backdrop-filter: blur(30px) saturate(165%);
  border: 1px solid rgba(255, 255, 255, 0.55);
  box-shadow: 0 32px 70px rgba(31, 31, 89, 0.26);
}

.brand { display: flex; flex-direction: column; align-items: center; gap: 14px; }

.avatar {
  width: 64px;
  height: 64px;
  padding: 0;
  border: none;
  border-radius: var(--r-dot);
  background: #fff;
  box-shadow: 0 6px 16px rgba(31, 31, 89, 0.18);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  cursor: pointer;
  transition: transform 0.18s cubic-bezier(0.34, 1.4, 0.64, 1), box-shadow 0.18s ease;
}
.avatar:hover {
  transform: scale(1.08);
  box-shadow: 0 8px 20px rgba(31, 31, 89, 0.26);
}
.avatar:active { transform: scale(0.96); }
.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.name {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 600;
  color: var(--ink-1);
  line-height: 1.2;
  text-align: center;
}
.name-en {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.16em;
  color: var(--ink-4);
  margin-top: 2px;
  text-align: center;
}
.roles {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 10px;
  font-size: 12px;
  color: var(--ink-2);
}
.status-dot {
  width: 6px; height: 6px; border-radius: var(--r-dot);
  background: var(--green);
  box-shadow: 0 0 0 3px rgba(48, 209, 88, 0.2);
}

.block-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.14em;
  color: var(--ink-4);
  text-transform: uppercase;
  margin-bottom: 12px;
}

.nav { display: flex; flex-direction: column; gap: 6px; }

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 42px;
  padding: 0 12px;
  border: none;
  background: transparent;
  border-radius: 14px;
  color: var(--ink-2);
  font-size: 14px;
  font-weight: 500;
  text-align: left;
  transition: background 0.15s ease;
}
.nav-item:hover { background: rgba(255, 255, 255, 0.35); }
.nav-item.active {
  background: #fff;
  color: var(--ink-1);
  font-weight: 600;
  box-shadow: 0 4px 10px rgba(31, 31, 89, 0.1);
}

.contact {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 6px;
}
.contact-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--ink-3);
}
.dot { width: 6px; height: 6px; border-radius: var(--r-dot); flex-shrink: 0; }
.dot.blue   { background: var(--blue-500); }
.dot.gray { background: var(--accent-gray); }

.footer {
  font-size: 11px;
  color: var(--ink-4);
  letter-spacing: 0.04em;
}
</style>
