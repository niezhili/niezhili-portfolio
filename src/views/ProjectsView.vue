<script setup>
import { computed } from 'vue'
import { projects } from '../data/content.js'
import { siteData } from '../store/siteData.js'

// Card 1 (智能镜) is CMS-managed — reads live from the persistent store
const list = computed(() =>
  projects.map((p, i) =>
    i === 0
      ? { ...p, title: siteData.featured.title, desc: siteData.featured.desc }
      : p
  )
)
</script>

<template>
  <div class="page">
    <header class="page-head">
      <div class="eyebrow">PROJECTS</div>
      <h1 class="page-title">项目经历</h1>
    </header>

    <div class="cards">
      <article v-for="p in list" :key="p.title" class="card glass">
        <div class="card-head">
          <div>
            <h2 class="title">{{ p.title }}</h2>
            <div class="sub">{{ p.sub }}</div>
          </div>
          <span class="tag" :class="p.tag.color">{{ p.tag.text }}</span>
        </div>
        <p class="desc">{{ p.desc }}</p>
      </article>
    </div>
  </div>
</template>

<style scoped>
.page { display: flex; flex-direction: column; gap: 18px; }

.page-head { display: flex; flex-direction: column; gap: 4px; padding: 0 4px; }
.eyebrow { font-size: 11px; font-weight: 600; letter-spacing: 0.14em; color: var(--blue-500); text-transform: uppercase; }
.page-title { font-family: var(--font-display); font-size: 26px; font-weight: 600; color: var(--ink-1); margin: 0; letter-spacing: -0.01em; }

.cards { display: flex; flex-direction: column; gap: 14px; }
.card { padding: 22px 28px; }
.card-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 10px; }
.title { margin: 0; font-family: var(--font-display); font-size: 18px; font-weight: 600; color: var(--ink-1); }
.sub { margin: 4px 0 0; font-size: 12px; color: var(--ink-3); }
.desc { margin: 0; font-size: 13px; color: var(--ink-2); line-height: 1.6; }
.tag.blue { background: var(--blue-500); }
.tag.cyan { background: var(--cyan); }
.tag.indigo { background: var(--indigo); }
</style>
