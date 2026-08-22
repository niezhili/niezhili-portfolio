<script setup>
import { profile, heroTags, stats, featured, sideProjects } from '../data/content.js'
import { siteData } from '../store/siteData.js'
import featImg from '../assets/feat-smart-mirror.png'
const emit = defineEmits(['open-cms'])
</script>

<template>
  <div class="home">
    <!-- Hero + stats row -->
    <div class="hero-row">
      <section class="hero glass">
        <div class="eyebrow">PORTFOLIO · {{ profile.year }}</div>
        <h1 class="name">{{ profile.name }}</h1>
        <p class="bio">用产品思维连接技术与业务 —— 通信工程背景的产品 / 项目经理</p>
        <div class="tags">
          <span v-for="t in heroTags" :key="t" class="chip">{{ t }}</span>
        </div>
      </section>

      <aside class="stats">
        <div v-for="s in stats" :key="s.num" class="stat glass">
          <div class="stat-num">{{ s.num }}</div>
          <div class="stat-label">{{ s.label }}</div>
        </div>
      </aside>
    </div>

    <!-- Featured + side -->
    <div class="featured-row">
      <section class="featured glass">
        <div class="featured-head">
          <span class="tag">{{ siteData.featured.badge }}</span>
          <span class="period">{{ siteData.featured.period }}</span>
        </div>
        <h2 class="feat-title">{{ siteData.featured.title }}</h2>
        <p class="feat-desc">{{ siteData.featured.desc }}</p>
        <div class="feat-img">
          <img :src="featImg" :alt="featured.imageAlt" />
        </div>
        <div class="feat-foot">{{ featured.footTags }}</div>
      </section>

      <aside class="side-stack">
        <div v-for="p in sideProjects" :key="p.title" class="side-card glass">
          <span class="tag outline">{{ p.badge }}</span>
          <h3 class="side-title">{{ p.title }}</h3>
          <p class="side-desc">{{ p.desc }}</p>
          <div class="side-meta">{{ p.meta }}</div>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.home { display: flex; flex-direction: column; gap: 24px; }

.hero-row { display: grid; grid-template-columns: 1fr 220px; gap: 16px; }
.hero { padding: 28px 32px; }
.eyebrow {
  font-size: 11px; font-weight: 600; letter-spacing: 0.14em;
  color: var(--blue-500); text-transform: uppercase;
}
.name {
  margin: 12px 0 10px;
  font-family: var(--font-display);
  font-size: 44px;
  font-weight: 600;
  color: var(--ink-1);
  letter-spacing: -0.02em;
  line-height: 1;
}
.bio { margin: 0 0 18px; font-size: 13px; color: var(--ink-2); }
.tags { display: flex; flex-wrap: wrap; gap: 8px; }

.stats { display: flex; flex-direction: column; gap: 12px; }
.stat {
  padding: 14px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.stat-num {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 600;
  color: var(--blue-500);
  line-height: 1;
}
.stat-label { font-size: 12px; color: var(--ink-3); font-weight: 500; }

.featured-row { display: grid; grid-template-columns: 1fr 260px; gap: 16px; }
.featured { padding: 22px 26px; }
.featured-head {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 14px;
}
.period { font-size: 12px; color: var(--ink-3); font-weight: 500; }
.feat-title {
  margin: 0 0 8px;
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 600;
  color: var(--ink-1);
}
.feat-desc { margin: 0 0 16px; font-size: 12px; color: var(--ink-2); line-height: 1.55; }
.feat-img {
  height: 200px;
  border-radius: 16px;
  overflow: hidden;
  background: linear-gradient(135deg, #d8e4ff 0%, #b8cfff 100%);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.feat-img img { width: 100%; height: 100%; object-fit: cover; }
.feat-foot { font-size: 11px; color: var(--ink-3); letter-spacing: 0.04em; }

.side-stack { display: flex; flex-direction: column; gap: 12px; }
.side-card { padding: 18px 20px; }
.side-title {
  margin: 12px 0 6px;
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 600;
  color: var(--ink-1);
}
.side-desc { margin: 0 0 10px; font-size: 12px; color: var(--ink-2); line-height: 1.5; }
.side-meta { font-size: 11px; color: var(--ink-3); }
</style>
