<script setup>
import { siteData } from '../store/siteData.js'
const honors = siteData.honors
</script>

<template>
  <div class="page">
    <header class="page-head">
      <h1 class="page-title-large">奖项 · 知识产权 · 专业认证</h1>
    </header>

    <div class="grid">
      <article v-for="h in honors" :key="h.title" class="card glass">
        <div class="eyebrow" :class="h.accent">{{ h.eyebrow }}</div>
        <h2 class="title">{{ h.title }}</h2>
        <p class="desc">{{ h.desc }}</p>
      </article>
    </div>
  </div>
</template>

<style scoped>
.page { display: flex; flex-direction: column; gap: 18px; }

.page-head { display: flex; flex-direction: column; gap: 4px; padding: 0 4px; }
.eyebrow { font-size: 11px; font-weight: 600; letter-spacing: 0.14em; color: var(--blue-500); text-transform: uppercase; }
.page-title-large { font-family: var(--font-display); font-size: 22px; font-weight: 600; color: var(--ink-1); margin: 0; letter-spacing: -0.01em; }

.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
.card { padding: 22px 26px; display: flex; flex-direction: column; gap: 8px; }
.card .eyebrow { color: var(--blue-500); margin-bottom: 4px; }
.card .eyebrow.red { color: var(--accent-red); }
.card .eyebrow.black { color: var(--accent-black); }
.card .eyebrow.gray { color: var(--accent-gray); }
.title { margin: 0; font-family: var(--font-display); font-size: 17px; font-weight: 600; color: var(--ink-1); }
.desc { margin: 0; font-size: 12px; color: var(--ink-2); line-height: 1.55; }
</style>
