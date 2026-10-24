<script setup>
import { siteData } from '../store/siteData.js'

// 自研产品：独立完成的个人产品，按 weight 降序展示
const products = [...(siteData.products || [])].sort((a, b) => (b.weight || 0) - (a.weight || 0))
const pad = n => String(n).padStart(2, '0')
function lines(p) {
  return String(p.points || '').split('\n').map(s => s.trim()).filter(Boolean)
}
const outputs = p => (Array.isArray(p.outputs) ? p.outputs : [])
</script>

<template>
  <div class="page">
    <div class="head">
      <span class="eyebrow">SELF-BUILT PRODUCTS · {{ pad(products.length) }}</span>
      <span class="hint">从需求到代码独立完成 · 只写可验证的事实</span>
    </div>

    <article v-for="(p, i) in products" :key="p.title" class="prod glass">
      <header class="prod-head">
        <span class="num">{{ pad(i + 1) }}</span>
        <div class="head-main">
          <h2 class="title">{{ p.title }}</h2>
          <p class="sub">{{ p.sub }}</p>
        </div>
        <span class="tag" :class="p.tag?.color">{{ p.tag?.text }}</span>
      </header>

      <div class="meta">
        <span v-if="p.period" class="meta-item">{{ p.period }}</span>
        <span v-if="p.role" class="meta-item">{{ p.role }}</span>
      </div>

      <div v-if="p.insight" class="block">
        <div class="block-label">产品判断</div>
        <p class="insight">{{ p.insight }}</p>
      </div>

      <div class="block">
        <div class="block-label">关键决策</div>
        <ul class="pts">
          <li v-for="l in lines(p)" :key="l">{{ l }}</li>
        </ul>
      </div>

      <div v-if="outputs(p).length" class="block">
        <div class="block-label">产出物</div>
        <div class="chips">
          <span v-for="o in outputs(p)" :key="o" class="chip">{{ o }}</span>
        </div>
      </div>

      <div v-if="p.result" class="result-row">
        <span class="result">{{ p.result }}</span>
      </div>
    </article>
  </div>
</template>

<style scoped>
.page { display: flex; flex-direction: column; gap: 18px; }

.head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(31, 31, 89, 0.18);
}
.eyebrow {
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.16em;
  color: var(--blue-500);
}
.hint { font-size: 11px; color: var(--ink-3); }

.prod { padding: 22px 26px 18px; }

.prod-head {
  display: flex;
  align-items: baseline;
  gap: 16px;
}
.num {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 24px;
  font-weight: 700;
  color: var(--blue-500);
  line-height: 1;
}
.head-main { flex: 1; min-width: 0; }
.title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 19px;
  font-weight: 600;
  color: var(--ink-1);
  line-height: 1.25;
}
.sub {
  margin: 3px 0 0;
  font-size: 12px;
  color: var(--ink-3);
}
.tag {
  flex: none;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: var(--r-pill);
}
.tag.red { color: var(--accent-red); background: rgba(255, 59, 48, 0.1); }
.tag.black { color: var(--accent-black); background: rgba(29, 29, 31, 0.08); }
.tag.gray { color: var(--accent-gray-text); background: rgba(255, 255, 255, 0.45); }

.meta {
  display: flex;
  gap: 14px;
  margin: 10px 0 2px 40px;
  font-size: 11.5px;
  color: var(--ink-3);
}
.meta-item + .meta-item::before {
  content: '·';
  margin-right: 14px;
  color: var(--ink-4);
}

.block { margin: 14px 0 0 40px; }
.block-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.14em;
  color: var(--blue-500);
  margin-bottom: 7px;
}
.insight {
  margin: 0;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--ink-1);
  line-height: 1.55;
}
.pts {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.pts li {
  position: relative;
  padding-left: 16px;
  font-size: 12.5px;
  color: var(--ink-2);
  line-height: 1.55;
}
.pts li::before {
  content: '';
  position: absolute;
  left: 2px;
  top: 0.62em;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--blue-500);
  opacity: 0.55;
}

.chips { display: flex; flex-wrap: wrap; gap: 8px; }
.chip {
  font-size: 11.5px;
  color: var(--ink-2);
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(31, 31, 89, 0.1);
  padding: 5px 12px;
  border-radius: var(--r-chip);
}

.result-row {
  margin: 16px 0 0 40px;
  padding: 10px 0 2px;
  border-top: 1px solid rgba(31, 31, 89, 0.12);
}
.result {
  font-size: 12px;
  font-weight: 600;
  color: var(--blue-600);
}
</style>
