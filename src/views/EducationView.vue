<script setup>
import { siteData } from '../store/siteData.js'
const education = siteData.education
</script>

<template>
  <div class="page">
    <header class="page-head">
      <div class="eyebrow">EDUCATION</div>
      <h1 class="page-title">教育经历</h1>
    </header>

    <section class="main-card glass">
      <div class="card-head">
        <span class="tag">{{ education.main.period }}</span>
        <span class="degree">{{ education.main.degree }}</span>
      </div>
      <p class="sub">{{ education.main.sub }}</p>
      <p class="desc">{{ education.main.desc }}</p>

      <div class="divider">
        <span>核心课程</span>
      </div>
      <div class="courses">
        <span v-for="c in education.main.courses" :key="c" class="chip">{{ c }}</span>
      </div>
    </section>

    <section class="ongoing glass">
      <div class="card-head">
        <h2 class="sec-title">{{ education.ongoing.title }}</h2>
        <span class="status">{{ education.ongoing.status }}</span>
      </div>
      <ul class="rows">
        <li v-for="(r, i) in education.ongoing.rows" :key="i" class="row">
          <span class="row-tag" :class="`tone-${i}`">{{ r.tag }}</span>
          <span class="row-text">{{ r.text }}</span>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.page { display: flex; flex-direction: column; gap: 18px; }

.page-head { display: flex; flex-direction: column; gap: 4px; padding: 0 4px; }
.eyebrow { font-size: 11px; font-weight: 600; letter-spacing: 0.14em; color: var(--blue-500); text-transform: uppercase; }
.page-title { font-family: var(--font-display); font-size: 26px; font-weight: 600; color: var(--ink-1); margin: 0; letter-spacing: -0.01em; }

.main-card, .ongoing { padding: 22px 28px; }

.card-head {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 10px;
}
.degree { font-family: var(--font-display); font-size: 16px; font-weight: 600; color: var(--ink-1); }

.sub { margin: 0 0 6px; font-size: 14px; font-weight: 600; color: var(--ink-1); }
.desc { margin: 0; font-size: 13px; color: var(--ink-2); line-height: 1.6; }

.divider {
  display: flex; align-items: center; gap: 12px;
  margin: 18px 0 12px;
  font-size: 12px; color: var(--ink-3); font-weight: 600;
}
.divider::after {
  content: ''; flex: 1; height: 1px; background: rgba(0, 0, 0, 0.06);
}
.courses { display: flex; flex-wrap: wrap; gap: 8px; }

.sec-title { margin: 0; font-family: var(--font-display); font-size: 18px; font-weight: 600; color: var(--ink-1); }
.status {
  font-size: 10px; font-weight: 700; letter-spacing: 0.16em;
  color: var(--blue-500);
}

.rows { list-style: none; margin: 12px 0 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
.row { display: flex; align-items: center; gap: 12px; }
.row-tag {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 56px; height: 24px; padding: 0 12px;
  border-radius: 12px;
  font-size: 11px; font-weight: 600;
  color: #fff;
}
.row-tag.tone-0 { background: var(--accent-gray); }
.row-tag.tone-1 { background: var(--blue-500); }
.row-tag.tone-2 { background: var(--accent-black); }
.row-text { font-size: 13px; color: var(--ink-2); }
</style>
