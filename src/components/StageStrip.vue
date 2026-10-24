<script setup>
import { ref } from 'vue'
import { profile, navItems } from '../data/content.js'
import { siteData } from '../store/siteData.js'
import AvatarLightbox from './AvatarLightbox.vue'

// 台前调度多窗口条：左侧纵向堆叠 6 扇迷你窗口（头像 + 5 个页面），
// 点击哪扇窗口，主舞台就切到哪一页。当前页窗口白底前突（像被聚焦的窗口）。
defineProps({ route: String })
const emit = defineEmits(['navigate'])

const showAvatarZoom = ref(false)

// 每扇页面窗口的迷你内容预览（不同宽度的横条模拟各自版式）
const previews = {
  home:  ['100%', '68%'],
  edu:   ['88%', '52%'],
  proj:  ['100%', '80%', '60%'],
  comp:  ['94%', '62%']
}
</script>

<template>
  <aside class="stage-strip">
    <!-- 头像窗口：个人资料 -->
    <button
      class="win win-profile"
      type="button"
      aria-label="查看头像大图"
      @click="showAvatarZoom = true"
    >
      <div class="win-head">
        <img class="win-avatar" :src="siteData.avatar" :alt="profile.name" />
        <div class="win-id">
          <div class="win-name">{{ profile.name }}</div>
          <div class="win-name-en">{{ profile.nameEn }}</div>
        </div>
      </div>
      <div class="win-sub">{{ profile.roles.join(' / ') }}</div>
    </button>

    <!-- 页面窗口：一扇一页 -->
    <button
      v-for="item in navItems"
      :key="item.key"
      class="win"
      :class="{ active: route === item.key }"
      type="button"
      @click="emit('navigate', item.key)"
    >
      <div class="win-head">
        <span class="nav-dot" :class="item.dot" />
        <span class="win-title">{{ item.label }}</span>
      </div>
      <!-- 迷你窗口预览：横条 / 荣誉墙用 2×2 小格 -->
      <div class="pv" :class="item.key === 'honor' ? 'pv-grid' : 'pv-bars'" aria-hidden="true">
        <template v-if="item.key === 'honor'">
          <i v-for="n in 4" :key="n" class="pv-cell" />
        </template>
        <template v-else>
          <i
            v-for="(w, n) in previews[item.key]"
            :key="n"
            class="pv-bar"
            :style="{ width: w }"
          />
        </template>
      </div>
    </button>

    <div class="strip-foot">Copyright 2026 · Portfolio</div>

    <AvatarLightbox
      v-if="showAvatarZoom"
      @close="showAvatarZoom = false"
    />
  </aside>
</template>

<style scoped>
.stage-strip {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 45;
}

/* 每扇窗口 = 一块梯形玻璃卡（左缘为轴，远边收窄），和台前调度的侧边缩略图一致 */
/* 六扇窗口统一尺寸：132×70。尺寸一律不随激活态变化，
   否则会出现「大小不一样」——聚焦只靠明度与投影表达 */
.win {
  box-sizing: border-box;
  width: 132px;
  height: 70px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255, 255, 255, 0.55);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(30px) saturate(140%);
  -webkit-backdrop-filter: blur(30px) saturate(140%);
  box-shadow: 0 14px 32px rgba(31, 31, 89, 0.2);
  text-align: left;
  cursor: pointer;
  overflow: hidden;
  transform-origin: left center;
  transform: perspective(700px) rotateY(22deg);
  transition: background 0.18s ease, box-shadow 0.18s ease;
}
.win:hover {
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 18px 42px rgba(31, 31, 89, 0.24);
}
/* 当前页窗口：纯白实底 + 更强投影 + 左侧蓝色标记 = 被聚焦（尺寸不变） */
.win.active {
  background: #fff;
  box-shadow: 0 20px 46px rgba(31, 31, 89, 0.28), inset 3px 0 0 var(--blue-500);
}

.win-head {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 覆盖全局 24px 彩色块：小窗口里统一成 14px 同色图标，
   否则五块深浅不一的方形色块会被读成「大小/重要程度不一致」 */
.win .nav-dot {
  width: 14px;
  height: 14px;
  border-radius: 4px;
  background: rgba(10, 132, 255, 0.42);
  box-shadow: none;
}
.win.active .nav-dot { background: var(--blue-500); }

.win-title {
  font-family: var(--font-display);
  font-size: 12.5px;
  font-weight: 500;
  color: var(--ink-2);
  letter-spacing: 0.01em;
}
.win.active .win-title {
  color: var(--ink-1);
  font-weight: 600;
}

/* 迷你内容预览条：固定高度，条数差异不改变卡片高度 */
.pv { margin-top: auto; height: 15px; }
.pv-bars {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.pv-bar {
  display: block;
  height: 3px;
  border-radius: 2px;
  flex: none;
  background: rgba(31, 31, 89, 0.12);
}
.win.active .pv-bar { background: rgba(10, 132, 255, 0.22); }

.pv-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 3px;
}
.pv-cell {
  display: block;
  border-radius: 3px;
  background: rgba(31, 31, 89, 0.12);
}
.win.active .pv-cell { background: rgba(10, 132, 255, 0.22); }

/* 头像窗口：与其他窗口同尺寸，角色行贴底 */
.win-profile .win-sub { margin-top: auto; }

.win-avatar {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  object-fit: cover;
  background: #fff;
  box-shadow: 0 4px 10px rgba(31, 31, 89, 0.18);
  flex-shrink: 0;
}
.win-id { min-width: 0; }
.win-name {
  font-family: var(--font-display);
  font-size: 12.5px;
  font-weight: 600;
  color: var(--ink-1);
  line-height: 1.2;
  white-space: nowrap;
}
.win-name-en {
  font-size: 7.5px;
  font-weight: 600;
  letter-spacing: 0.16em;
  color: var(--ink-4);
  margin-top: 1px;
  white-space: nowrap;
}

.win-sub {
  font-size: 8.5px;
  color: var(--ink-3);
  white-space: nowrap;
}
.win-sub-row {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 5px;
  font-size: 8px;
  color: var(--ink-4);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dot { width: 4px; height: 4px; border-radius: var(--r-dot); flex-shrink: 0; }
.dot.blue { background: var(--blue-500); }
.dot.gray { background: var(--accent-gray); }

.strip-foot {
  margin-top: 2px;
  padding-left: 2px;
  font-size: 8px;
  letter-spacing: 0.04em;
  color: var(--ink-4);
}
</style>
