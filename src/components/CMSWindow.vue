<script setup>
import { ref, computed, reactive } from 'vue'
import { cmsNav } from '../data/content.js'
import { siteData, publish as publishUpdate, resetToDefaults } from '../store/siteData.js'

const emit = defineEmits(['close', 'publish'])

function now() { return new Date().toTimeString().slice(0, 5) }

const active = ref('profile')
const savedAt = ref(now())

// ---------- Section schema: what the editor shows per nav item ----------
// field: { key, label, type?: 'textarea' | 'csv' }  — key may be nested ('tag.text')
const sections = {
  profile: {
    label: '个人资料',
    groups: [
      { title: '个人简介', path: 'hero', fields: [
        { key: 'bio', label: '一句话简介', type: 'textarea' },
        { key: 'tags', label: '亮点标签（逗号分隔）', type: 'csv' }
      ]},
      { title: '数据亮点', path: 'stats', fields: [
        { key: 'num', label: '数字' },
        { key: 'label', label: '说明' }
      ]},
      { title: '主页侧栏小卡片', path: 'sideProjects', fields: [
        { key: 'badge', label: '角标' },
        { key: 'title', label: '名称' },
        { key: 'desc', label: '描述', type: 'textarea' },
        { key: 'meta', label: '标签行' }
      ]}
    ]
  },
  edu: {
    label: '教育经历',
    groups: [
      { title: '教育信息', path: 'education.main', fields: [
        { key: 'period', label: '时间段' },
        { key: 'degree', label: '学历专业' },
        { key: 'sub', label: '副标题' },
        { key: 'desc', label: '描述', type: 'textarea' },
        { key: 'courses', label: '核心课程（逗号分隔）', type: 'csv' }
      ]},
      { title: '持续学习', path: 'education.ongoing.rows', fields: [
        { key: 'tag', label: '标签' },
        { key: 'text', label: '内容' }
      ]}
    ]
  },
  proj: {
    label: '项目经历',
    groups: [
      { title: '主页主打项目', path: 'featured', fields: [
        { key: 'badge', label: '角色勋章' },
        { key: 'period', label: '时间' },
        { key: 'title', label: '项目名称' },
        { key: 'desc', label: '项目描述', type: 'textarea' },
        { key: 'footTags', label: '底部标签行' }
      ]},
      { title: '项目列表', path: 'projects', fields: [
        { key: 'title', label: '项目名称' },
        { key: 'sub', label: '副标题' },
        { key: 'tag.text', label: '角标文字' },
        { key: 'tag.color', label: '角标配色（black/red/gray）' },
        { key: 'desc', label: '描述', type: 'textarea' }
      ]}
    ]
  },
  comp: {
    label: '竞赛经历',
    groups: [
      { title: '竞赛数据', path: 'competitionStats', fields: [
        { key: 'num', label: '数字' },
        { key: 'label', label: '说明' }
      ]},
      { title: '竞赛列表', path: 'competitions', fields: [
        { key: 'title', label: '名称' },
        { key: 'sub', label: '副标题' },
        { key: 'tag.text', label: '角标文字' },
        { key: 'tag.color', label: '角标配色（red/gray）' },
        { key: 'desc', label: '描述', type: 'textarea' }
      ]}
    ]
  },
  honor: {
    label: '荣誉墙',
    groups: [
      { title: '荣誉列表', path: 'honors', fields: [
        { key: 'eyebrow', label: '分类（英文）' },
        { key: 'title', label: '名称' },
        { key: 'desc', label: '描述', type: 'textarea' },
        { key: 'accent', label: '配色（red/black/blue/gray）' }
      ]}
    ]
  }
}

const current = computed(() => sections[active.value])

// ---------- Path helpers ----------
function getPath(obj, path) {
  return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj)
}
function setPath(obj, path, val) {
  const keys = path.split('.')
  const last = keys.pop()
  const target = keys.reduce((o, k) => (o[k] = o[k] || {}), obj)
  target[last] = val
}

function fieldValue(item, f) {
  const v = getPath(item, f.key)
  if (f.type === 'csv') return Array.isArray(v) ? v.join('，') : ''
  return v == null ? '' : v
}
function setFieldValue(item, f, val) {
  if (f.type === 'csv') {
    setPath(item, f.key, val.split(/[,，、]/).map(s => s.trim()).filter(Boolean))
  } else {
    setPath(item, f.key, val)
  }
}

// ---------- List add / remove ----------
function makeItem(fields) {
  const item = {}
  for (const f of fields) {
    setPath(item, f.key, f.type === 'csv' ? [] : '')
  }
  return item
}
function addItem(g) { getPath(siteData, g.path).push(makeItem(g.fields)) }
function removeItem(g, idx) { getPath(siteData, g.path).splice(idx, 1) }

// ---------- Sync log ----------
const logs = reactive([{ time: now(), text: '进入编辑', ok: true }])
function log(text, ok = false) {
  logs.unshift({ time: now(), text, ok })
  if (logs.length > 6) logs.length = 6
}

function setActive(k) { active.value = k }

function save() {
  savedAt.value = now()
  log('保存草稿')
}

function handlePublish() {
  publishUpdate()
  savedAt.value = now()
  log('发布更新 · 前端已同步', true)
  emit('publish')
}

function handleReset() {
  resetToDefaults()
  savedAt.value = now()
  log('恢复默认内容', true)
}

// preview helpers
function pvVal(item, f) {
  const v = getPath(item, f.key)
  if (f.type === 'csv') return Array.isArray(v) && v.length ? v.join(' · ') : '—'
  return v || '—'
}
function pvLine(v) {
  return String(v || '').replace(/\s+/g, ' ').slice(0, 60)
}
</script>

<template>
  <div class="overlay" @click.self="emit('close')">
    <div class="cms-window glass">
      <!-- Top bar -->
      <div class="cms-top">
        <div class="top-left">
          <h3 class="cms-title">内容管理后台</h3>
          <p class="cms-sub">Content CMS · 编辑文字内容，实时同步至前台</p>
        </div>
        <div class="top-right">
          <button class="icon-btn" @click="emit('close')" aria-label="关闭">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
          <button class="btn-primary" @click="handlePublish">发布更新</button>
        </div>
      </div>

      <!-- 3-col body -->
      <div class="cms-body">
        <!-- Nav col -->
        <div class="cms-nav glass">
          <div class="nav-head">
            <div class="block-label">内容导航</div>
          </div>
          <div class="nav-list">
            <button
              v-for="item in cmsNav"
              :key="item.key"
              class="nav-row"
              :class="{ active: active === item.key }"
              @click="setActive(item.key)"
            >
              <span class="row-dot" :class="item.dot" />
              {{ item.label }}
            </button>
          </div>
          <div class="sync-status">
            <span class="dot green" /> 前端已同步 · {{ savedAt }}
          </div>
        </div>

        <!-- Editor col -->
        <div class="editor glass">
          <div class="editor-head">
            <span class="crumb">正在编辑 · {{ current.label }}</span>
            <span class="muted">最近保存 · {{ savedAt }}</span>
          </div>

          <div class="editor-scroll">
            <div v-for="g in current.groups" :key="g.path" class="group">
              <div class="group-label">{{ g.title }}</div>

              <!-- Object group -->
              <template v-if="!Array.isArray(getPath(siteData, g.path))">
                <div v-for="f in g.fields" :key="f.key" class="field">
                  <label>{{ f.label }}</label>
                  <textarea
                    v-if="f.type === 'textarea'"
                    rows="3"
                    class="text-input textarea"
                    :value="fieldValue(getPath(siteData, g.path), f)"
                    @input="setFieldValue(getPath(siteData, g.path), f, $event.target.value)"
                  />
                  <input
                    v-else
                    class="text-input"
                    :value="fieldValue(getPath(siteData, g.path), f)"
                    @input="setFieldValue(getPath(siteData, g.path), f, $event.target.value)"
                  />
                </div>
              </template>

              <!-- List group -->
              <template v-else>
                <div v-for="(item, idx) in getPath(siteData, g.path)" :key="idx" class="item-card">
                  <div class="item-head">
                    <span>条目 {{ idx + 1 }}</span>
                    <button class="del-btn" @click="removeItem(g, idx)">删除</button>
                  </div>
                  <div v-for="f in g.fields" :key="f.key" class="field">
                    <label>{{ f.label }}</label>
                    <textarea
                      v-if="f.type === 'textarea'"
                      rows="3"
                      class="text-input textarea"
                      :value="fieldValue(item, f)"
                      @input="setFieldValue(item, f, $event.target.value)"
                    />
                    <input
                      v-else
                      class="text-input"
                      :value="fieldValue(item, f)"
                      @input="setFieldValue(item, f, $event.target.value)"
                    />
                  </div>
                </div>
                <button class="add-btn" @click="addItem(g)">+ 添加条目</button>
              </template>
            </div>
          </div>

          <div class="editor-foot">
            <button class="btn-ghost" @click="save">保存草稿</button>
            <button class="btn-ghost danger" @click="handleReset">恢复默认</button>
            <span class="muted">编辑实时生效 · 点击右上角「发布更新」同步前台</span>
          </div>
        </div>

        <!-- Preview col -->
        <div class="preview glass">
          <div class="block-label">实时预览 · LIVE PREVIEW</div>

          <div class="preview-card">
            <div class="pv-head">{{ current.label }}</div>
            <template v-for="g in current.groups" :key="g.path">
              <div class="pv-group">{{ g.title }}</div>

              <template v-if="!Array.isArray(getPath(siteData, g.path))">
                <div v-for="f in g.fields" :key="f.key" class="pv-row">
                  <span class="pv-k">{{ f.label }}</span>
                  <span class="pv-v">{{ pvLine(pvVal(getPath(siteData, g.path), f)) }}</span>
                </div>
              </template>
              <template v-else>
                <div v-for="(item, i) in getPath(siteData, g.path)" :key="i" class="pv-item">
                  <div class="pv-title">{{ getPath(item, g.fields[0].key) || '（未命名）' }}</div>
                  <div class="pv-sub">{{ pvLine(pvVal(item, g.fields[g.fields.length - 1])) }}</div>
                </div>
              </template>
            </template>
          </div>

          <div class="sync-log glass">
            <div class="log-title">同步日志</div>
            <div v-for="(l, i) in logs" :key="i" class="log-row">
              <span class="dot" :class="l.ok ? 'green' : 'gray'" />
              <span class="time">{{ l.time }}</span>
              <span>{{ l.text }}</span>
            </div>
            <p class="log-foot">左侧编辑 → 此处实时预览 → 发布后前台同步更新</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: absolute;
  inset: 0;
  background: var(--overlay);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: var(--z-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
}

.cms-window {
  width: 1100px;
  height: 680px;
  background: #fff;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 30px 80px rgba(31, 31, 89, 0.4);
  animation: pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes pop { from { transform: scale(0.94); opacity: 0; } to { transform: scale(1); opacity: 1; } }

.cms-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px;
  border-bottom: 1px solid #eef0f6;
  background: #fff;
}
.cms-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 600;
  color: var(--ink-1);
}
.cms-sub {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--ink-3);
}
.top-right { display: flex; align-items: center; gap: 10px; }
.icon-btn {
  width: 30px; height: 30px;
  border: 1px solid #e5e7ef;
  background: #fff;
  border-radius: 10px;
  color: var(--ink-3);
  display: flex; align-items: center; justify-content: center;
}
.icon-btn:hover { background: #f5f7fb; color: var(--ink-1); }

.cms-body {
  flex: 1;
  display: grid;
  grid-template-columns: 220px 1fr 300px;
  gap: 16px;
  padding: 16px;
  background: #f6f8fc;
  overflow: hidden;
}

.cms-nav, .editor, .preview {
  background: #fff;
  border-radius: 14px;
  border: 1px solid #eef0f6;
  padding: 18px;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.cms-nav { gap: 4px; }
.block-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.12em;
  color: var(--ink-4);
  text-transform: uppercase;
  margin-bottom: 10px;
}
.nav-list { display: flex; flex-direction: column; gap: 4px; flex: 1; }
.nav-row {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 36px;
  padding: 0 10px;
  border: none;
  background: transparent;
  border-radius: 10px;
  color: var(--ink-2);
  font-size: 13px;
  text-align: left;
}
.nav-row:hover { background: #f5f7fb; }
.nav-row.active {
  background: #fff;
  color: var(--ink-1);
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(31, 31, 89, 0.08);
}
.row-dot {
  width: 6px; height: 6px; border-radius: var(--r-dot);
  background: var(--blue-500);
}
.row-dot.blue-1 { background: #C9D6FF; }
.row-dot.blue-2 { background: #93B1FF; }
.row-dot.blue-3 { background: #5783FF; }
.row-dot.blue-4 { background: #2D5BFF; }
.row-dot.blue-5 { background: var(--blue-500); }

.sync-status {
  display: flex; align-items: center; gap: 6px;
  font-size: 11px; color: var(--ink-3);
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid #f0f1f5;
}
.dot { width: 6px; height: 6px; border-radius: var(--r-dot); flex-shrink: 0; }
.dot.green { background: var(--green); }
.dot.gray  { background: #c8ccd6; }

.editor-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}
.crumb { font-size: 12px; color: var(--blue-500); font-weight: 600; }
.muted { font-size: 11px; color: var(--ink-4); }

.editor-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 6px;
}
.editor-scroll::-webkit-scrollbar { width: 6px; }
.editor-scroll::-webkit-scrollbar-thumb { background: #dfe3ec; border-radius: 3px; }

.group { margin-bottom: 18px; }
.group-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--ink-3);
  text-transform: uppercase;
  margin-bottom: 10px;
  padding-bottom: 6px;
  border-bottom: 1px solid #f0f1f5;
}

.field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
.field label {
  font-size: 11px;
  font-weight: 600;
  color: var(--ink-3);
  letter-spacing: 0.04em;
}
.text-input {
  width: 100%;
  height: 36px;
  padding: 0 12px;
  border: 1px solid #e5e7ef;
  border-radius: 10px;
  background: #f8f9fc;
  font-size: 13px;
  color: var(--ink-1);
  font-family: inherit;
  outline: none;
  transition: border 0.15s ease;
}
.text-input:focus { border-color: var(--blue-500); background: #fff; }
.textarea { height: auto; padding: 10px 12px; resize: vertical; line-height: 1.5; }

.item-card {
  background: #f8f9fc;
  border: 1px solid #eef0f6;
  border-radius: 12px;
  padding: 12px 14px;
  margin-bottom: 10px;
}
.item-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  font-weight: 600;
  color: var(--ink-4);
  margin-bottom: 10px;
}
.del-btn {
  border: none;
  background: transparent;
  color: var(--accent-red);
  font-size: 11px;
  font-weight: 600;
}
.del-btn:hover { text-decoration: underline; }

.add-btn {
  width: 100%;
  height: 36px;
  border: 1px dashed #c8ccd6;
  border-radius: 10px;
  background: transparent;
  color: var(--ink-3);
  font-size: 12px;
  font-weight: 600;
}
.add-btn:hover { border-color: var(--blue-500); color: var(--blue-500); }

.editor-foot {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f1f5;
}
.btn-ghost {
  height: 32px;
  padding: 0 14px;
  border: 1px solid #e5e7ef;
  background: #fff;
  border-radius: 10px;
  color: var(--ink-2);
  font-size: 12px;
  font-weight: 600;
}
.btn-ghost:hover { background: #f5f7fb; }
.btn-ghost.danger { color: var(--accent-red); }
.btn-ghost.danger:hover { background: #fff2f1; }

.preview { overflow-y: auto; }
.preview-card {
  background: linear-gradient(135deg, #eef3ff 0%, #dfe9ff 100%);
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 14px;
}
.pv-head {
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 600;
  color: var(--ink-1);
  margin-bottom: 12px;
}
.pv-group {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: var(--blue-500);
  text-transform: uppercase;
  margin: 12px 0 6px;
}
.pv-row {
  display: flex;
  gap: 8px;
  font-size: 11px;
  padding: 3px 0;
  line-height: 1.45;
}
.pv-k { color: var(--ink-4); flex-shrink: 0; min-width: 72px; }
.pv-v { color: var(--ink-2); word-break: break-all; }
.pv-item { padding: 4px 0 2px; }
.pv-title { font-size: 12px; font-weight: 600; color: var(--ink-1); }
.pv-sub { font-size: 11px; color: var(--ink-3); line-height: 1.45; margin-top: 2px; }

.sync-log { background: #fff !important; border: 1px solid #eef0f6; padding: 12px; }
.log-title { font-size: 12px; font-weight: 600; color: var(--ink-2); margin-bottom: 10px; }
.log-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px; color: var(--ink-3);
  padding: 6px 0;
  border-bottom: 1px dashed #f0f1f5;
}
.log-row:last-of-type { border-bottom: none; }
.log-row .time { color: var(--ink-4); }
.log-foot { margin: 10px 0 0; font-size: 10px; color: var(--ink-4); }
</style>
