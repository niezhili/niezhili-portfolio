<script setup>
import { ref, computed, reactive, watch, onMounted, onBeforeUnmount } from 'vue'
import { cmsNav } from '../data/content.js'
import { siteData, publish as publishUpdate, resetToDefaults } from '../store/siteData.js'
import { fileToJpegBlob, blobToDataUrl, recognizeCertificate, recognizeCompetitionMaterial, recognizeProjectMaterial } from '../lib/aiVision.js'

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
        { key: 'title', label: '名称' },
        { key: 'sub', label: '副标题（级别 · 角色 · 时间）' },
        { key: 'insight', label: '我的判断（一句话）', type: 'textarea' },
        { key: 'tag.text', label: '角标文字' },
        { key: 'tag.color', label: '角标配色（red/black/gray）' },
        { key: 'period', label: '时间' },
        { key: 'role', label: '我的角色' },
        { key: 'points', label: '要点（每行一条）', type: 'textarea' },
        { key: 'result', label: '成果' },
        { key: 'weight', label: '含金量分值（0-100，越大越靠前）' }
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
        { key: 'tag.color', label: '角标配色（red/black/gray）' },
        { key: 'period', label: '时间' },
        { key: 'role', label: '我的角色' },
        { key: 'points', label: '要点（每行一条）', type: 'textarea' },
        { key: 'result', label: '成果' },
        { key: 'weight', label: '含金量分值（0-100，越大越靠前）' }
      ]}
    ]
  },
  photos: {
    label: '照片库',
    groups: []
  },
  ai: {
    label: 'AI 设置',
    groups: []
  },
  honor: {
    label: '荣誉墙',
    groups: [
      { title: '荣誉列表', path: 'honors', fields: [
        { key: 'eyebrow', label: '分类（英文）' },
        { key: 'title', label: '名称' },
        { key: 'image', label: '图片路径（/assets/honors/xxx.jpg，留空显示占位）' },
        { key: 'desc', label: '描述', type: 'textarea' },
        { key: 'accent', label: '配色（red/black/blue/gray）' },
        { key: 'weight', label: '含金量分值（0-100，越大越靠前）' }
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
function addItem(g) {
  getPath(siteData, g.path).push(makeItem(g.fields))
  if (g.path === 'honors') sortByWeight()
}
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

// ---------- 含金量排序：weight 降序，同分保持原相对顺序 ----------
function sortByWeight() {
  const list = siteData.honors
  const withIdx = list.map((item, i) => ({ item, i }))
  withIdx.sort((a, b) => (Number(b.item.weight) || 0) - (Number(a.item.weight) || 0) || a.i - b.i)
  list.splice(0, list.length, ...withIdx.map(x => x.item))
}

// ---------- AI 设置（独立分区）· Key/模型存本机文件，经 /api/ai-settings 读写 ----------
const aiKey = ref('')
const aiModel = ref('glm-5.3-flash')
const aiHydrated = ref(false)
const aiBusy = ref(false)
const aiStatus = ref('')
const dragging = ref(false)

// 启动时从本机文件恢复配置（换端口/换浏览器/隐私窗口均不丢失）
onMounted(async () => {
  try {
    const res = await fetch('/api/ai-settings')
    const data = await res.json()
    if (data.ok) {
      if (data.key) aiKey.value = data.key
      if (data.model) aiModel.value = data.model
    }
  } catch (e) { /* 开发服务器不可用时静默 */ }
  aiHydrated.value = true
})

// 防抖自动保存：粘贴后无需失焦，稍候即写入本机文件
let aiSaveTimer = null
watch([aiKey, aiModel], () => {
  if (!aiHydrated.value) return
  clearTimeout(aiSaveTimer)
  aiSaveTimer = setTimeout(async () => {
    try {
      await fetch('/api/ai-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: aiKey.value.trim(), model: aiModel.value.trim() })
      })
    } catch (e) { /* 保存失败静默，下次修改会重试 */ }
  }, 500)
})

function onDragOver(e) { e.preventDefault(); dragging.value = true }
function onDragLeave() { dragging.value = false }
function onDrop(e) {
  e.preventDefault()
  dragging.value = false
  handleHonorFiles(e.dataTransfer?.files)
}
function onBrowse(e) {
  handleHonorFiles(e.target.files)
  e.target.value = '' // 允许重复选择同一文件
}

// 拖到 dropzone 之外时阻止浏览器直接打开文件
function preventNav(e) { e.preventDefault() }
onMounted(() => {
  window.addEventListener('dragover', preventNav)
  window.addEventListener('drop', preventNav)
})
onBeforeUnmount(() => {
  window.removeEventListener('dragover', preventNav)
  window.removeEventListener('drop', preventNav)
})

async function handleHonorFiles(fileList) {
  const files = Array.from(fileList || [])
  if (!files.length) return
  const accepted = files.filter(f => f.type.startsWith('image/') || f.type === 'application/pdf')
  for (const f of files) {
    if (!accepted.includes(f)) log(`跳过 ${f.name} · 仅支持图片 / PDF`)
  }
  if (!accepted.length) return
  if (!aiKey.value.trim()) {
    log('未配置 API Key · 仅上传图片，不识别 · 可在左侧「AI 设置」中配置')
  }
  aiBusy.value = true
  try {
    for (let i = 0; i < accepted.length; i++) {
      aiStatus.value = `${i + 1}/${accepted.length} · ${accepted[i].name}`
      await addHonorFromFile(accepted[i])
    }
  } finally {
    aiBusy.value = false
    aiStatus.value = ''
  }
}

async function addHonorFromFile(file) {
  let blob
  try {
    blob = await fileToJpegBlob(file)
  } catch (e) {
    log(`解析失败 · ${file.name} · ${e.message || e}`)
    return
  }
  let path
  try {
    path = await uploadHonorImage(blob)
    log(`上传成功 · ${path.split('/').pop()}`, true)
  } catch (e) {
    log(`上传失败 · ${file.name} · ${e.message || e}`)
    return
  }
  let ai = null
  if (aiKey.value.trim()) {
    try {
      const dataUrl = await blobToDataUrl(blob)
      ai = await recognizeCertificate(dataUrl, { key: aiKey.value.trim(), model: aiModel.value.trim() })
      log(`AI 识别成功 · ${ai.title || file.name}`, true)
    } catch (e) {
      log(`AI 识别失败 · ${file.name} · ${e.message || e}`)
    }
  }
  siteData.honors.push({
    eyebrow: ai?.eyebrow || 'COMPETITION',
    title: ai?.title || file.name.replace(/\.[^.]+$/, ''),
    desc: ai?.desc || '',
    accent: ai?.accent || 'gray',
    image: path,
    weight: ai?.weight ?? ''
  })
  sortByWeight() // 每次新增后按含金量重排荣誉墙
}

function uploadHonorImage(blob) {
  return fetch('/api/honor-upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/octet-stream', 'X-Ext': 'jpg' },
    body: blob
  }).then(async res => {
    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data.ok) throw new Error(data.error || `HTTP ${res.status}`)
    return data.path
  })
}

// ---------- 照片库：上传 / 前台可见 / 设为头像 / 删除 ----------
const photoDragging = ref(false)
const photoBusy = ref(false)
const photoStatus = ref('')

function onPhotoDragOver(e) { e.preventDefault(); photoDragging.value = true }
function onPhotoDragLeave() { photoDragging.value = false }
function onPhotoDrop(e) {
  e.preventDefault()
  photoDragging.value = false
  handlePhotoFiles(e.dataTransfer?.files)
}
function onPhotoBrowse(e) {
  handlePhotoFiles(e.target.files)
  e.target.value = ''
}

async function handlePhotoFiles(fileList) {
  const files = Array.from(fileList || []).filter(f => f.type.startsWith('image/'))
  if (!files.length) return
  photoBusy.value = true
  try {
    for (let i = 0; i < files.length; i++) {
      photoStatus.value = `${i + 1}/${files.length} · ${files[i].name}`
      await addPhotoFromFile(files[i])
    }
  } finally {
    photoBusy.value = false
    photoStatus.value = ''
  }
}

async function addPhotoFromFile(file) {
  let blob
  try {
    blob = await fileToJpegBlob(file)
  } catch (e) {
    log(`解析失败 · ${file.name} · ${e.message || e}`)
    return
  }
  try {
    const path = await uploadPhotoImage(blob)
    siteData.photoLibrary.push({
      src: path,
      name: file.name.replace(/\.[^.]+$/, ''),
      visible: true
    })
    log(`照片上传成功 · ${path.split('/').pop()}`, true)
  } catch (e) {
    log(`上传失败 · ${file.name} · ${e.message || e}`)
  }
}

function uploadPhotoImage(blob) {
  return fetch('/api/photo-upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/octet-stream', 'X-Ext': 'jpg' },
    body: blob
  }).then(async res => {
    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data.ok) throw new Error(data.error || `HTTP ${res.status}`)
    return data.path
  })
}

function toggleVisible(p) {
  p.visible = p.visible === false
  log(p.visible ? '照片已设为前台可见' : '照片已隐藏 · 前台不可见', true)
}

function setAvatar(p) {
  siteData.avatar = p.src
  log(`已设为头像 · ${p.name || p.src.split('/').pop()}`, true)
}

function removePhoto(idx) {
  const p = siteData.photoLibrary[idx]
  if (!p) return
  if (p.src === siteData.avatar) {
    log('当前头像不可删除 · 请先将其他照片设为头像')
    return
  }
  siteData.photoLibrary.splice(idx, 1)
  log(`照片已删除 · ${p.name || p.src.split('/').pop()}`, true)
}

const visiblePhotoCount = computed(() =>
  (siteData.photoLibrary || []).filter(p => p && p.visible !== false).length
)

// ---------- 列表材料上传（竞赛经历 / 项目经历共用）：AI 归属/建条 → 按含金量重排 ----------
const listBusy = ref({ competitions: false, projects: false })
const listStatus = ref({ competitions: '', projects: '' })
const LIST_DIR = { competitions: 'competition', projects: 'projects' }

function sortByListWeight(key) {
  const list = siteData[key]
  const withIdx = list.map((item, i) => ({ item, i }))
  withIdx.sort((a, b) => (Number(b.item.weight) || 0) - (Number(a.item.weight) || 0) || a.i - b.i)
  list.splice(0, list.length, ...withIdx.map(x => x.item))
}

function extOf(name) {
  const m = String(name).toLowerCase().match(/\.([a-z0-9]+)$/)
  return m ? m[1] : ''
}

function kindLabel(a) {
  return { image: '图片', pdf: 'PDF', doc: 'Word', ppt: 'PPT' }[a.kind] || '文件'
}

function uploadListMaterial(payload, ext, key) {
  return fetch('/api/comp-upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/octet-stream', 'X-Ext': ext, 'X-Dir': LIST_DIR[key] },
    body: payload
  }).then(async res => {
    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data.ok) throw new Error(data.error || `HTTP ${res.status}`)
    return data // { ok, path, preview }
  })
}

function onListDragOver(e) { e.preventDefault(); dragging.value = true }
function onListDragLeave() { dragging.value = false }
function onListDrop(key, e) {
  e.preventDefault()
  dragging.value = false
  handleListFiles(key, e.dataTransfer?.files)
}
function onListBrowse(key, e) {
  handleListFiles(key, e.target.files)
  e.target.value = ''
}

async function handleListFiles(key, fileList) {
  const files = Array.from(fileList || [])
  if (!files.length) return
  const accepted = files.filter(f => {
    const e = extOf(f.name)
    return f.type.startsWith('image/') || f.type === 'application/pdf' || ['doc', 'docx', 'ppt', 'pptx'].includes(e)
  })
  for (const f of files) {
    if (!accepted.includes(f)) log(`跳过 ${f.name} · 仅支持图片 / PDF / Word / PPT`)
  }
  if (!accepted.length) return
  listBusy.value[key] = true
  try {
    for (let i = 0; i < accepted.length; i++) {
      listStatus.value[key] = `${i + 1}/${accepted.length} · ${accepted[i].name}`
      await addListMaterial(key, accepted[i])
    }
  } finally {
    listBusy.value[key] = false
    listStatus.value[key] = ''
  }
}

async function addListMaterial(key, file) {
  const list = siteData[key]
  const recognize = key === 'projects' ? recognizeProjectMaterial : recognizeCompetitionMaterial
  const ext = extOf(file.name)
  const isImage = file.type.startsWith('image/')
  const isPdf = file.type === 'application/pdf' || ext === 'pdf'
  const kind = isImage ? 'image' : isPdf ? 'pdf' : ['ppt', 'pptx'].includes(ext) ? 'ppt' : 'doc'
  // 1) 上传（图片先压缩为 JPEG；PDF / Word / PPT 保留原件）
  let up
  let aiBlob = null
  try {
    if (isImage) {
      aiBlob = await fileToJpegBlob(file)
      up = await uploadListMaterial(aiBlob, 'jpg', key)
    } else {
      up = await uploadListMaterial(file, ext, key)
    }
    log(`上传成功 · ${up.path.split('/').pop()}`, true)
  } catch (e) {
    log(`上传失败 · ${file.name} · ${e.message || e}`)
    return
  }
  // 2) AI 输入图：图片用压缩图；PDF 用首页；Word/PPT 用转换出的 PDF 首页
  let aiImage = ''
  try {
    if (isImage && aiBlob) aiImage = await blobToDataUrl(aiBlob)
    else if (isPdf) aiImage = await blobToDataUrl(await fileToJpegBlob(file))
    else if (up.preview) aiImage = await blobToDataUrl(await fileToJpegBlob(await (await fetch(up.preview)).blob()))
  } catch (e) {
    console.warn('[material] AI 输入图生成失败', e)
  }
  // 3) AI 路由：归属现有条目 或 新建条目
  let ai = null
  if (aiKey.value.trim()) {
    try {
      ai = await recognize(aiImage, list.map(c => c.title), {
        key: aiKey.value.trim(),
        model: aiModel.value.trim(),
        fileName: file.name
      })
      log(ai.match ? `识别成功 · 归属「${ai.match}」` : `识别成功 · 新建「${ai.entry.title || file.name}」`, true)
    } catch (e) {
      log(`AI 识别失败 · ${file.name} · ${e.message || e}`)
    }
  } else {
    log('未配置 API Key · 按文件名新建条目 · 可在左侧「AI 设置」中配置')
  }
  // 4) 挂载材料 + 按含金量重排
  const baseName = file.name.replace(/\.[^.]+$/, '')
  const material = {
    name: (ai?.materialName || baseName).slice(0, 20),
    kind,
    path: up.path,
    preview: up.preview || ''
  }
  let target = ai?.match ? list.find(c => c.title === ai.match) : null
  if (!target) {
    const e = ai?.entry || {}
    target = {
      title: e.title || baseName,
      sub: '',
      tag: { text: e.tagText || '过程材料', color: e.tagColor || 'gray' },
      period: e.period || '',
      role: e.role || '',
      points: e.points || '',
      result: e.result || '',
      weight: e.weight || 50,
      attachments: []
    }
    list.push(target)
  }
  if (!Array.isArray(target.attachments)) target.attachments = []
  target.attachments.push(material)
  sortByListWeight(key)
}

// 手动添加材料（不走 AI，直接归属该条目）
async function onAttachBrowse(item, e) {
  const files = Array.from(e.target.files || [])
  e.target.value = ''
  if (!files.length) return
  const key = siteData.competitions.includes(item) ? 'competitions' : 'projects'
  listBusy.value[key] = true
  try {
    for (const f of files) {
      const ext = extOf(f.name)
      const isImage = f.type.startsWith('image/')
      const isPdf = f.type === 'application/pdf' || ext === 'pdf'
      const kind = isImage ? 'image' : isPdf ? 'pdf' : ['ppt', 'pptx'].includes(ext) ? 'ppt' : 'doc'
      try {
        const up = isImage
          ? await uploadListMaterial(await fileToJpegBlob(f), 'jpg', key)
          : await uploadListMaterial(f, ext, key)
        if (!Array.isArray(item.attachments)) item.attachments = []
        item.attachments.push({
          name: f.name.replace(/\.[^.]+$/, '').slice(0, 20),
          kind,
          path: up.path,
          preview: up.preview || ''
        })
        log(`添加材料 · ${item.title} · ${up.path.split('/').pop()}`, true)
      } catch (err) {
        log(`上传失败 · ${f.name} · ${err.message || err}`)
      }
    }
  } finally {
    listBusy.value[key] = false
  }
}

function removeAttachment(item, idx) {
  if (Array.isArray(item.attachments)) item.attachments.splice(idx, 1)
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
            <!-- 荣誉墙专属：拖拽上传 + AI 识别 -->
            <div
              v-if="active === 'honor'"
              class="dropzone"
              :class="{ drag: dragging, busy: aiBusy }"
              @dragover="onDragOver"
              @dragleave="onDragLeave"
              @drop="onDrop"
            >
              <template v-if="!aiBusy">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" class="dz-icon">
                  <path d="M12 16V4m0 0l-4 4m4-4l4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <div class="dz-main">拖拽证书文件到此处 · AI 自动识别生成相框</div>
                <div class="dz-sub">
                  支持图片 / PDF（取第一页）· 或
                  <label class="dz-browse">点击选择文件
                    <input type="file" multiple accept="image/*,application/pdf" @change="onBrowse" />
                  </label>
                </div>
              </template>
              <template v-else>
                <div class="dz-main">识别中… {{ aiStatus }}</div>
                <div class="dz-sub">上传 → AI 识别 → 自动按含金量插入荣誉墙</div>
              </template>
            </div>

            <!-- AI 设置：独立分区 · Key/模型自动保存到本机文件 -->
            <div v-if="active === 'ai'" class="ai-panel">
              <div class="block-label">智谱 AI 配置</div>
              <div class="ai-status-row">
                <span class="dot" :class="aiKey ? 'green' : 'gray'" />
                {{ aiKey ? `已配置 Key · 模型 ${aiModel} · 自动保存` : '未配置 Key · AI 识别功能暂不可用' }}
              </div>
              <div class="field">
                <label>智谱 API Key（保存于本机 ai-settings.local.json · 不入仓库）</label>
                <input
                  v-model="aiKey"
                  type="password"
                  class="text-input"
                  placeholder="粘贴 open.bigmodel.cn 的 API Key"
                />
              </div>
              <div class="field">
                <label>模型 ID</label>
                <input v-model="aiModel" class="text-input" placeholder="glm-5.3-flash" />
              </div>
              <p class="ai-hint">修改后约 0.5 秒自动保存，无需点击任何按钮；换端口、换浏览器、重启后依然生效。</p>
            </div>

            <!-- 竞赛经历专属：拖拽上传 → AI 归属/建条 -->
            <div
              v-if="active === 'comp'"
              class="dropzone"
              :class="{ drag: dragging, busy: listBusy.competitions }"
              @dragover="onListDragOver"
              @dragleave="onListDragLeave"
              @drop="onListDrop('competitions', $event)"
            >
              <template v-if="!listBusy.competitions">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" class="dz-icon">
                  <path d="M12 16V4m0 0l-4 4m4-4l4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <div class="dz-main">拖拽竞赛材料到此处 · AI 自动归属或新建条目</div>
                <div class="dz-sub">
                  支持图片 / PDF / Word / PPT（Office 自动转 PDF 预览）· 或
                  <label class="dz-browse">点击选择文件
                    <input type="file" multiple accept="image/*,application/pdf,.doc,.docx,.ppt,.pptx" @change="onListBrowse('competitions', $event)" />
                  </label>
                </div>
              </template>
              <template v-else>
                <div class="dz-main">处理中… {{ listStatus.competitions }}</div>
                <div class="dz-sub">上传 → AI 识别归属 → 挂到对应竞赛并按含金量重排</div>
              </template>
            </div>

            <!-- 项目经历专属：拖拽上传 → AI 归属/建条 -->
            <div
              v-if="active === 'proj'"
              class="dropzone"
              :class="{ drag: dragging, busy: listBusy.projects }"
              @dragover="onListDragOver"
              @dragleave="onListDragLeave"
              @drop="onListDrop('projects', $event)"
            >
              <template v-if="!listBusy.projects">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" class="dz-icon">
                  <path d="M12 16V4m0 0l-4 4m4-4l4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <div class="dz-main">拖拽项目材料到此处 · AI 自动归属或新建条目</div>
                <div class="dz-sub">
                  支持图片 / PDF / Word / PPT（Office 自动转 PDF 预览）· 或
                  <label class="dz-browse">点击选择文件
                    <input type="file" multiple accept="image/*,application/pdf,.doc,.docx,.ppt,.pptx" @change="onListBrowse('projects', $event)" />
                  </label>
                </div>
              </template>
              <template v-else>
                <div class="dz-main">处理中… {{ listStatus.projects }}</div>
                <div class="dz-sub">上传 → AI 识别归属 → 挂到对应项目并按含金量重排</div>
              </template>
            </div>

            <!-- 照片库专属：拖拽上传 + 可见性 / 头像管理 -->
            <template v-if="active === 'photos'">
              <div
                class="dropzone"
                :class="{ drag: photoDragging, busy: photoBusy }"
                @dragover="onPhotoDragOver"
                @dragleave="onPhotoDragLeave"
                @drop="onPhotoDrop"
              >
                <template v-if="!photoBusy">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" class="dz-icon">
                    <path d="M12 16V4m0 0l-4 4m4-4l4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                  <div class="dz-main">拖拽照片到此处 · 自动压缩保存</div>
                  <div class="dz-sub">
                    支持图片 · 或
                    <label class="dz-browse">点击选择文件
                      <input type="file" multiple accept="image/*" @change="onPhotoBrowse" />
                    </label>
                  </div>
                </template>
                <template v-else>
                  <div class="dz-main">上传中… {{ photoStatus }}</div>
                  <div class="dz-sub">压缩 → 存入照片库 → 可设为头像 / 控制前台可见</div>
                </template>
              </div>

              <div v-if="!siteData.photoLibrary.length" class="photos-empty">
                还没有照片 · 上传第一张吧
              </div>

              <div v-else class="photo-grid">
                <div
                  v-for="(p, i) in siteData.photoLibrary"
                  :key="p.src"
                  class="photo-card"
                  :class="{ current: p.src === siteData.avatar }"
                >
                  <img :src="p.src" class="photo-thumb" alt="" />
                  <div class="photo-info">
                    <div class="photo-name" :title="p.name">{{ p.name || '未命名' }}</div>
                    <div class="photo-actions">
                      <button
                        class="pill-btn"
                        :class="{ off: p.visible === false }"
                        @click="toggleVisible(p)"
                      >{{ p.visible === false ? '已隐藏' : '前台可见' }}</button>
                      <button
                        v-if="p.src !== siteData.avatar"
                        class="pill-btn primary"
                        @click="setAvatar(p)"
                      >设为头像</button>
                      <span v-else class="current-badge">当前头像</span>
                      <button class="del-btn" @click="removePhoto(i)">删除</button>
                    </div>
                  </div>
                </div>
              </div>
            </template>

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
                  <img
                    v-if="g.path === 'honors' && item.image"
                    :src="item.image"
                    class="item-thumb"
                    alt=""
                  />
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

                  <!-- 竞赛/项目条目：过程材料管理 -->
                  <div v-if="g.path === 'competitions' || g.path === 'projects'" class="att-block">
                    <div class="att-head">
                      <span class="att-title">过程材料 · {{ (item.attachments || []).length }}</span>
                      <label class="att-add">＋ 添加材料（不识别）
                        <input
                          type="file"
                          multiple
                          accept="image/*,application/pdf,.doc,.docx,.ppt,.pptx"
                          @change="onAttachBrowse(item, $event)"
                        />
                      </label>
                    </div>
                    <div v-for="(a, j) in item.attachments || []" :key="j" class="att-row">
                      <span class="att-kind">{{ kindLabel(a) }}</span>
                      <span class="att-name">{{ a.name }}</span>
                      <button class="att-del" @click="removeAttachment(item, j)">删除</button>
                    </div>
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

            <template v-if="active === 'photos'">
              <div class="pv-group">头像与照片</div>
              <div class="pv-row">
                <span class="pv-k">当前头像</span>
                <img :src="siteData.avatar" class="pv-avatar" alt="" />
              </div>
              <div class="pv-row">
                <span class="pv-k">照片总数</span>
                <span class="pv-v">{{ siteData.photoLibrary.length }} 张</span>
              </div>
              <div class="pv-row">
                <span class="pv-k">前台可见</span>
                <span class="pv-v">{{ visiblePhotoCount }} 张 · 点击侧栏头像可左右切换查看</span>
              </div>
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

/* ---------- 荣誉墙：AI 拖拽上传区 ---------- */
.dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 22px 16px;
  margin-bottom: 16px;
  border: 1.5px dashed #c8ccd6;
  border-radius: 12px;
  background: #f8f9fc;
  text-align: center;
  transition: border 0.15s ease, background 0.15s ease;
}
.dropzone.drag {
  border-color: var(--blue-500);
  background: #eef3ff;
}
.dropzone.busy {
  border-style: solid;
  border-color: var(--blue-500);
  background: #eef3ff;
}
.dz-icon { color: var(--blue-500); }
.dz-main { font-size: 13px; font-weight: 600; color: var(--ink-1); }
.dz-sub { font-size: 11px; color: var(--ink-3); }
.dz-browse { color: var(--blue-500); font-weight: 600; cursor: pointer; }
.dz-browse:hover { text-decoration: underline; }
.dz-browse input { display: none; }

.ai-panel { margin-bottom: 16px; }
.ai-status-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 10px 0 14px;
  font-size: 11px;
  font-weight: 600;
  color: var(--ink-2);
}
.ai-hint {
  margin: 12px 0 0;
  font-size: 11px;
  line-height: 1.6;
  color: var(--ink-3);
}

.item-thumb {
  width: 100%;
  height: 110px;
  object-fit: contain;
  background: #fff;
  border: 1px solid #eef0f6;
  border-radius: 8px;
  margin-bottom: 10px;
}

/* ---------- 照片库：照片卡片网格 ---------- */
.photos-empty {
  padding: 18px;
  text-align: center;
  font-size: 12px;
  color: var(--ink-4);
  border: 1px dashed #e5e7ef;
  border-radius: 12px;
}
.photo-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.photo-card {
  display: flex;
  gap: 10px;
  align-items: center;
  background: #f8f9fc;
  border: 1px solid #eef0f6;
  border-radius: 12px;
  padding: 10px;
}
.photo-card.current {
  border-color: var(--blue-500);
  background: #eef3ff;
}
.photo-thumb {
  width: 84px;
  height: 64px;
  border-radius: 10px;
  object-fit: cover;
  background: #fff;
  border: 1px solid #eef0f6;
  flex-shrink: 0;
}
.photo-info { min-width: 0; flex: 1; }
.photo-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--ink-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.photo-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  flex-wrap: wrap;
}
.pill-btn {
  height: 22px;
  padding: 0 8px;
  border: none;
  border-radius: var(--r-pill);
  background: #e3ecff;
  color: var(--blue-600);
  font-size: 10px;
  font-weight: 600;
  white-space: nowrap;
}
.pill-btn:hover { filter: brightness(0.96); }
.pill-btn.off { background: #eceef3; color: var(--ink-4); }
.pill-btn.primary { background: var(--accent-black); color: #fff; }
.pill-btn.primary:hover { background: var(--accent-black-hover); filter: none; }
.current-badge {
  height: 22px;
  padding: 0 8px;
  border-radius: var(--r-pill);
  background: var(--green);
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
}
.pv-avatar {
  width: 44px;
  height: 44px;
  border-radius: var(--r-dot);
  object-fit: cover;
  background: #fff;
  border: 1px solid #eef0f6;
}

/* ---------- 竞赛条目：过程材料管理 ---------- */
.att-block {
  margin-top: 4px;
  padding-top: 10px;
  border-top: 1px dashed #e5e7ef;
}
.att-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.att-title {
  font-size: 11px;
  font-weight: 600;
  color: var(--ink-3);
}
.att-add {
  font-size: 11px;
  font-weight: 600;
  color: var(--blue-500);
  cursor: pointer;
}
.att-add:hover { text-decoration: underline; }
.att-add input { display: none; }
.att-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 0;
  font-size: 11px;
}
.att-kind {
  flex-shrink: 0;
  padding: 1px 6px;
  border-radius: var(--r-pill);
  background: #e3ecff;
  color: var(--blue-600);
  font-weight: 600;
  font-size: 10px;
}
.att-name {
  flex: 1;
  min-width: 0;
  color: var(--ink-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.att-del {
  border: none;
  background: transparent;
  color: var(--accent-red);
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
}
.att-del:hover { text-decoration: underline; }
</style>
