<script setup>
import { siteData } from '../store/siteData.js'
const education = siteData.education
</script>

<template>
  <div class="page">
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

    <section v-if="(education.skills || []).length" class="skills glass">
      <div class="card-head">
        <h2 class="sec-title">技能清单</h2>
        <span class="status">SKILLS</span>
      </div>
      <div v-for="g in education.skills" :key="g.group" class="skill-group">
        <span class="skill-name">{{ g.group }}</span>
        <div class="chips">
          <span v-for="s in g.items" :key="s" class="chip">{{ s }}</span>
        </div>
      </div>
    </section>

    <section v-if="(education.orgs || []).length" class="orgs glass">
      <div class="card-head">
        <h2 class="sec-title">组织与领导力</h2>
        <span class="status">LEADERSHIP</span>
      </div>
      <ul class="org-rows">
        <li v-for="o in education.orgs" :key="o.name" class="org-row">
          <span class="org-role">{{ o.role }}</span>
          <span class="org-main">
            <span class="org-name">{{ o.name }}</span>
            <span class="org-desc">{{ o.desc }}</span>
          </span>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.page { display: flex; flex-direction: column; gap: 18px; }

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
.row-tag.tone-3 { background: var(--accent-gray); }
.row-text { font-size: 13px; color: var(--ink-2); }

.skill-group {
  display: flex;
  align-items: baseline;
  gap: 14px;
  padding: 9px 0;
}
.skill-group + .skill-group { border-top: 1px solid rgba(31, 31, 89, 0.08); }
.skill-name {
  flex: none;
  width: 88px;
  font-size: 12px;
  font-weight: 600;
  color: var(--ink-1);
}
.chips { display: flex; flex-wrap: wrap; gap: 7px; }
.chip {
  font-size: 11.5px;
  color: var(--ink-2);
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(31, 31, 89, 0.1);
  padding: 4px 11px;
  border-radius: var(--r-chip);
}

.org-rows { list-style: none; margin: 10px 0 0; padding: 0; }
.org-row {
  display: flex;
  align-items: baseline;
  gap: 14px;
  padding: 9px 0;
}
.org-row + .org-row { border-top: 1px solid rgba(31, 31, 89, 0.08); }
.org-role {
  flex: none;
  width: 64px;
  font-size: 11px;
  font-weight: 600;
  color: var(--blue-600);
}
.org-main { display: flex; flex-direction: column; gap: 2px; }
.org-name { font-size: 13px; font-weight: 600; color: var(--ink-1); }
.org-desc { font-size: 12px; color: var(--ink-3); line-height: 1.5; }
</style>
