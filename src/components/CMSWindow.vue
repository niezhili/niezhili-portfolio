<script setup>
import { ref, computed } from 'vue'
import { cmsNav } from '../data/content.js'
import { siteData, publish as publishUpdate } from '../store/siteData.js'
import cmsCover from '../assets/cms-cover.png'
import cmsPreview from '../assets/cms-preview.png'

const emit = defineEmits(['close', 'publish'])

const active = ref('proj')
const savedAt = ref('11:20')

// Bind directly to the shared persistent store — edits update the
// live preview AND the front pages, and survive page refresh.
const form = siteData.featured

const previewName = computed(() => form.title || '项目名称')
const previewDesc = computed(() => form.desc || '项目描述将显示在主页及子页对应区域。')

function setActive(k) { active.value = k }
function save() { savedAt.value = new Date().toTimeString().slice(0, 5) }
function handlePublish() {
  publishUpdate()
  emit('publish')
}
</script>

<template>
  <div class="overlay" @click.self="emit('close')">
    <div class="cms-window glass">
      <!-- Top bar -->
      <div class="cms-top">
        <div class="top-left">
          <h3 class="cms-title">内容管理后台</h3>
          <p class="cms-sub">Content CMS · 编辑文字、图片与文档，实时同步至前台</p>
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
            <span class="crumb">正在编辑 · 项目经历 / 智能镜</span>
            <span class="muted">最近保存 · {{ savedAt }}</span>
          </div>

          <div class="field">
            <label>项目名称</label>
            <input v-model="form.title" class="text-input" />
          </div>

          <div class="row-2">
            <div class="field">
              <label>角色勋章</label>
              <input v-model="form.badge" class="text-input" />
            </div>
            <div class="field">
              <label>时间</label>
              <input v-model="form.period" class="text-input" />
            </div>
          </div>

          <div class="field">
            <label>项目描述</label>
            <textarea v-model="form.desc" class="text-input textarea" rows="3" />
          </div>

          <div class="field">
            <label>配图管理</label>
            <div class="upload-row">
              <div class="uploaded">
                <img :src="cmsCover" alt="cover" />
              </div>
              <div class="upload-card">
                <span class="plus">+</span>
                <span class="muted-sm">上传图片</span>
              </div>
              <div class="upload-card">
                <span class="plus">+</span>
                <span class="muted-sm">上传图片</span>
              </div>
            </div>
          </div>

          <div class="field">
            <label>文档附件</label>
            <div class="doc-row">
              <div class="doc-card">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9l-6-6z"
                    stroke="var(--blue-500)" stroke-width="1.6" stroke-linejoin="round"/>
                </svg>
                <span>智能镜结题报告.pdf</span>
                <span class="link">替换</span>
              </div>
              <div class="doc-card placeholder">
                <span class="plus">+</span>
                <span class="muted-sm">上传文档</span>
              </div>
            </div>
          </div>

          <div class="editor-foot">
            <button class="btn-ghost" @click="save">保存草稿</button>
            <span class="muted">编辑后点击右上角「发布更新」，改动将同步至前台</span>
          </div>
        </div>

        <!-- Preview col -->
        <div class="preview glass">
          <div class="block-label">实时预览 · LIVE PREVIEW</div>

          <div class="preview-card">
            <div class="row-between">
              <span class="tag black">{{ form.badge }}</span>
              <span class="muted-sm">{{ form.period }}</span>
            </div>
            <h4 class="pv-title">{{ previewName }}</h4>
            <p class="pv-desc">{{ previewDesc }}</p>
            <div class="pv-img">
              <img :src="cmsPreview" alt="preview" />
            </div>
          </div>

          <div class="sync-log glass">
            <div class="log-title">同步日志</div>
            <div class="log-row">
              <span class="dot green" />
              <span class="time">11:32</span>
              <span>发布成功 · 前端已更新</span>
            </div>
            <div class="log-row">
              <span class="dot gray" />
              <span class="time">11:20</span>
              <span>保存草稿</span>
            </div>
            <div class="log-row">
              <span class="dot gray" />
              <span class="time">10:58</span>
              <span>更新配图 ×1</span>
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
.row-dot.black { background: var(--accent-black); }
.row-dot.red   { background: var(--accent-red); }
.row-dot.gray  { background: var(--accent-gray); }

.sync-status {
  display: flex; align-items: center; gap: 6px;
  font-size: 11px; color: var(--ink-3);
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid #f0f1f5;
}
.dot { width: 6px; height: 6px; border-radius: var(--r-dot); }
.dot.green { background: var(--green); }
.dot.gray  { background: #c8ccd6; }

.editor-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.crumb { font-size: 12px; color: var(--blue-500); font-weight: 600; }
.muted { font-size: 11px; color: var(--ink-4); }

.field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
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
.textarea { height: auto; padding: 10px 12px; resize: none; }

.row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

.upload-row { display: flex; gap: 8px; }
.uploaded, .upload-card {
  width: 88px; height: 64px;
  border-radius: 10px;
  background: #f5f7fb;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  font-size: 11px; color: var(--ink-3); gap: 2px;
  overflow: hidden;
}
.uploaded img { width: 100%; height: 100%; object-fit: cover; }
.upload-card { border: 1px dashed #c8ccd6; background: #f8f9fc; cursor: pointer; }
.upload-card:hover { border-color: var(--blue-500); color: var(--blue-500); }
.plus { font-size: 18px; line-height: 1; color: var(--ink-4); }
.upload-card:hover .plus { color: var(--blue-500); }
.muted-sm { font-size: 10px; }

.doc-row { display: flex; gap: 8px; }
.doc-card {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 12px;
  background: #f5f7fb;
  border-radius: 10px;
  font-size: 12px; color: var(--ink-2);
}
.doc-card.placeholder {
  background: #f8f9fc;
  border: 1px dashed #c8ccd6;
  cursor: pointer;
  color: var(--ink-3);
}
.doc-card.placeholder:hover { border-color: var(--blue-500); }
.link { color: var(--blue-500); font-size: 11px; font-weight: 600; margin-left: 6px; }

.editor-foot {
  display: flex; align-items: center; gap: 12px;
  margin-top: auto;
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

.preview { overflow-y: auto; }
.preview-card {
  background: linear-gradient(135deg, #eef3ff 0%, #dfe9ff 100%);
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 14px;
}
.row-between { display: flex; align-items: center; justify-content: space-between; }
.pv-title { margin: 10px 0 6px; font-family: var(--font-display); font-size: 16px; font-weight: 600; color: var(--ink-1); }
.pv-desc { margin: 0 0 10px; font-size: 12px; color: var(--ink-2); line-height: 1.5; }
.pv-img {
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}
.pv-img img { width: 100%; height: 100%; object-fit: cover; }

.sync-log { background: #fff !important; border: 1px solid #eef0f6; padding: 12px; }
.log-title { font-size: 12px; font-weight: 600; color: var(--ink-2); margin-bottom: 10px; }
.log-row {
  display: flex; align-items: center; gap: 8px;
  font-size: 11px; color: var(--ink-3);
  padding: 6px 0;
  border-bottom: 1px dashed #f0f1f5;
}
.log-row:last-of-type { border-bottom: none; }
.log-row .time { color: var(--ink-4); }
.log-foot { margin: 10px 0 0; font-size: 10px; color: var(--ink-4); }
</style>
