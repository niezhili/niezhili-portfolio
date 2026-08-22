<script setup>
import { competitionStats, competitions } from '../data/content.js'
</script>

<template>
  <div class="page">
    <header class="page-head">
      <div class="eyebrow">COMPETITIONS</div>
      <h1 class="page-title">竞赛经历</h1>
    </header>

    <div class="stats-row">
      <div v-for="s in competitionStats" :key="s.num" class="stat glass">
        <div class="num">{{ s.num }}</div>
        <div class="label">{{ s.label }}</div>
      </div>
    </div>

    <div class="cards">
      <article v-for="c in competitions" :key="c.title" class="card glass">
        <div class="card-head">
          <div>
            <h2 class="title">{{ c.title }}</h2>
            <div class="sub">{{ c.sub }}</div>
          </div>
          <span class="tag" :class="c.tag.color">{{ c.tag.text }}</span>
        </div>
        <p class="desc">{{ c.desc }}</p>
      </article>
    </div>
  </div>
</template>

<style scoped>
.page { display: flex; flex-direction: column; gap: 18px; }

.page-head { display: flex; flex-direction: column; gap: 4px; padding: 0 4px; }
.eyebrow { font-size: 11px; font-weight: 600; letter-spacing: 0.14em; color: var(--blue-500); text-transform: uppercase; }
.page-title { font-family: var(--font-display); font-size: 26px; font-weight: 600; color: var(--ink-1); margin: 0; letter-spacing: -0.01em; }

.stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.stat { padding: 22px 24px; }
.num { font-family: var(--font-display); font-size: 28px; font-weight: 600; color: var(--accent-red); line-height: 1; }
.stat:nth-child(2) .num { color: var(--accent-black); }
.stat:nth-child(3) .num { color: var(--accent-gray); }
.label { margin-top: 6px; font-size: 12px; color: var(--ink-3); }

.cards { display: flex; flex-direction: column; gap: 14px; }
.card { padding: 22px 28px; }
.card-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 10px; }
.title { margin: 0; font-family: var(--font-display); font-size: 18px; font-weight: 600; color: var(--ink-1); }
.sub { margin: 4px 0 0; font-size: 12px; color: var(--ink-3); }
.desc { margin: 0; font-size: 13px; color: var(--ink-2); line-height: 1.6; }
.tag.red { background: var(--accent-red); }
.tag.gray { background: var(--accent-gray); }
</style>
