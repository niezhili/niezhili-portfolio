// AI 证书识别工具链：图片/PDF → 压缩 JPEG → 上传 → GLM 视觉识别
// pdfjs-dist 按需动态加载，只有拖入 PDF 时才会下载该 chunk

const MAX_SIDE = 1600
const JPEG_QUALITY = 0.82
const AI_TIMEOUT_MS = 90000

// ---------- 第一步：任意支持文件 → JPEG Blob（PDF 取第一页） ----------
export async function fileToJpegBlob(file) {
  if (file.type === 'application/pdf') return await pdfFirstPageToJpeg(file)
  const src = await loadBitmap(file)
  const { canvas } = drawScaled(src, src.width || src.naturalWidth, src.height || src.naturalHeight)
  return await canvasToBlob(canvas)
}

function loadBitmap(file) {
  return createImageBitmap(file).catch(async () => {
    // createImageBitmap 失败（如部分 HEIC/老格式）→ 退回 <img> 解码
    const url = URL.createObjectURL(file)
    const img = new Image()
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = () => reject(new Error('无法解码该图片格式'))
      img.src = url
    })
    setTimeout(() => URL.revokeObjectURL(url), 5000)
    return img
  })
}

function drawScaled(src, w, h) {
  const scale = Math.min(1, MAX_SIDE / Math.max(w, h))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(w * scale))
  canvas.height = Math.max(1, Math.round(h * scale))
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, canvas.width, canvas.height) // 透明图/PDF 垫白底
  ctx.drawImage(src, 0, 0, canvas.width, canvas.height)
  return { canvas }
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      b => (b ? resolve(b) : reject(new Error('canvas 导出失败'))),
      'image/jpeg',
      JPEG_QUALITY
    )
  })
}

// ---------- PDF：第一页渲染为 JPEG ----------
let pdfjsPromise = null
function getPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = (async () => {
      const pdfjs = await import('pdfjs-dist')
      const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url')
      pdfjs.GlobalWorkerOptions.workerSrc = worker.default
      return pdfjs
    })()
  }
  return pdfjsPromise
}

async function pdfFirstPageToJpeg(file) {
  const pdfjs = await getPdfjs()
  const data = await file.arrayBuffer()
  const pdf = await pdfjs.getDocument({ data }).promise
  try {
    const page = await pdf.getPage(1)
    const base = page.getViewport({ scale: 1 })
    const scale = Math.min(3, MAX_SIDE / Math.max(base.width, base.height))
    const viewport = page.getViewport({ scale })
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(viewport.width)
    canvas.height = Math.round(viewport.height)
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    await page.render({ canvasContext: ctx, viewport }).promise
    return await canvasToBlob(canvas)
  } finally {
    pdf.destroy()
  }
}

// ---------- 第二步：GLM 视觉识别 ----------
const PROMPT = `你是竞赛/专利证书识别助手。看图提取信息，只输出一个 JSON 对象，不要任何多余文字：
{"eyebrow":"分类英文","title":"名称","desc":"一句话描述","accent":"red|black|blue|gray","weight":整数}
规则：
1. eyebrow 只能选 COMPETITION（竞赛奖状）/ SCHOLARSHIP（奖学金）/ INTELLECTUAL PROPERTY（专利、软著）
2. title 用证书正式名称，格式如「全国大学生物理实验竞赛 · 一等奖」「实用新型专利 · 授权」「发明专利 · 受理」
3. desc 一句话概括作品/专利内容（中文）
4. accent：一等奖 red，二三等奖 blue，授权专利 black，奖学金/受理/优胜类 gray
5. weight 为含金量分值 0-100：国家级一等 90-100，国家级二等 85-89，省级一等 80-84，省级二等 75-79，省级三等 70-74，授权专利 85-95，受理发明专利 55-65，校级一等 60-69，校级二等 55-59，分赛区优胜 60-64，奖学金 50-59`

export async function recognizeCertificate(dataUrl, { key, model }) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), AI_TIMEOUT_MS)
  try {
    const res = await fetch('/zhipu-api/api/paas/v4/chat/completions', {
      method: 'POST',
      signal: ctrl.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`
      },
      body: JSON.stringify({
        model: model || 'glm-5.3-flash',
        temperature: 0.1,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: dataUrl } },
              { type: 'text', text: PROMPT }
            ]
          }
        ]
      })
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`GLM API ${res.status} ${text.slice(0, 140)}`)
    }
    const data = await res.json()
    const content = data?.choices?.[0]?.message?.content
    if (!content) throw new Error('GLM 返回为空')
    return parseRecognition(content)
  } finally {
    clearTimeout(timer)
  }
}

function parseRecognition(text) {
  const m = String(text).match(/\{[\s\S]*\}/)
  if (!m) throw new Error('GLM 未返回 JSON')
  let obj
  try {
    obj = JSON.parse(m[0])
  } catch {
    throw new Error('GLM 返回的 JSON 无法解析')
  }
  const accents = ['red', 'black', 'blue', 'gray']
  return {
    eyebrow: String(obj.eyebrow || 'COMPETITION').toUpperCase().replace(/[^A-Z ]/g, '').trim().slice(0, 30) || 'COMPETITION',
    title: String(obj.title || '').trim().slice(0, 60),
    desc: String(obj.desc || '').trim().slice(0, 120),
    accent: accents.includes(obj.accent) ? obj.accent : 'gray',
    weight: clampInt(obj.weight, 0, 100, 50)
  }
}

function clampInt(v, min, max, dflt) {
  const n = Math.round(Number(v))
  if (!Number.isFinite(n)) return dflt
  return Math.min(max, Math.max(min, n))
}

// ---------- 工具 ----------
export function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader()
    fr.onload = () => resolve(fr.result)
    fr.onerror = () => reject(new Error('FileReader 失败'))
    fr.readAsDataURL(blob)
  })
}

// ---------- 竞赛材料识别：判断归属现有条目或新建条目 ----------
export async function recognizeCompetitionMaterial(dataUrl, titles, { key, model, fileName = '' }) {
  const list = titles.length ? titles.map((t, i) => `${i + 1}. ${t}`).join('\n') : '（暂无）'
  const prompt = `你是作品集竞赛材料识别助手。用户上传了一张竞赛过程材料图片（可能是证书、答辩现场、PPT 封面或文档首页），原始文件名：${fileName || '未知'}。
现有竞赛条目列表：
${list}
请判断这张材料属于哪场竞赛，并只输出一个 JSON 对象，不要任何多余文字：
{"match":"现有条目的完整标题，若不属于任何现有条目则为 null","materialName":"材料简短名称，8字内，如 答辩现场照片","kind":"image|pdf|doc|ppt","entry":{"title":"竞赛正式名称","period":"时间，如 2025","role":"我的角色，10字内","points":"做了什么要点，用\\n分隔每条，最多3条，无把握则留空","result":"成果，如 国家级一等奖","tagText":"角标文字：国家级一等奖/省级二等奖/省级三等奖/校级一等奖/分赛区优胜/备考中 之一","tagColor":"red|black|gray","weight":0-100整数}}
规则：
1. match 判断：材料内容与某个现有条目明显同类（同名竞赛、同一作品）→ 返回该条目标题；否则 null
2. 仅当 match 为 null 时 entry 才需要填写；weight 标尺：国家级一等 90-100、省级 70-84、校级 60-69、分赛区优胜 60-64、认证/备考 50-59
3. 无把握的字段一律留空字符串或 0，不要编造`
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), AI_TIMEOUT_MS)
  try {
    const res = await fetch('/zhipu-api/api/paas/v4/chat/completions', {
      method: 'POST',
      signal: ctrl.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`
      },
      body: JSON.stringify({
        model: model || 'glm-5.3-flash',
        temperature: 0.1,
        messages: [
          {
            role: 'user',
            content: dataUrl
              ? [
                  { type: 'image_url', image_url: { url: dataUrl } },
                  { type: 'text', text: prompt }
                ]
              : [{ type: 'text', text: `${prompt}\n\n注意：本次没有图片，只根据文件名判断，没把握的字段一律留空。` }]
          }
        ]
      })
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`GLM API ${res.status} ${text.slice(0, 140)}`)
    }
    const data = await res.json()
    const content = data?.choices?.[0]?.message?.content
    if (!content) throw new Error('GLM 返回为空')
    return parseCompRecognition(content)
  } finally {
    clearTimeout(timer)
  }
}

function parseCompRecognition(text) {
  const m = String(text).match(/\{[\s\S]*\}/)
  if (!m) throw new Error('GLM 未返回 JSON')
  let obj
  try {
    obj = JSON.parse(m[0])
  } catch {
    throw new Error('GLM 返回的 JSON 无法解析')
  }
  const e = obj.entry || {}
  return {
    match: obj.match ? String(obj.match).trim() : '',
    materialName: String(obj.materialName || '').trim().slice(0, 20),
    kind: ['image', 'pdf', 'doc', 'ppt'].includes(obj.kind) ? obj.kind : '',
    entry: {
      title: String(e.title || '').trim().slice(0, 60),
      period: String(e.period || '').trim().slice(0, 30),
      role: String(e.role || '').trim().slice(0, 30),
      points: String(e.points || '').trim(),
      result: String(e.result || '').trim().slice(0, 80),
      tagText: String(e.tagText || '').trim().slice(0, 12),
      tagColor: ['red', 'black', 'gray'].includes(e.tagColor) ? e.tagColor : 'gray',
      weight: clampInt(e.weight, 0, 100, 50)
    }
  }
}

// ---------- 项目材料识别：判断归属现有项目或新建（与竞赛同构，提示词/权重标尺不同） ----------
export async function recognizeProjectMaterial(dataUrl, titles, { key, model, fileName = '' }) {
  const list = titles.length ? titles.map((t, i) => `${i + 1}. ${t}`).join('\n') : '（暂无）'
  const prompt = `你是作品集项目材料识别助手。用户上传了一张项目过程材料图片（可能是项目照片、设计稿、演示截图或文档首页），原始文件名：${fileName || '未知'}。
现有项目条目列表：
${list}
请判断这张材料属于哪个项目，并只输出一个 JSON 对象，不要任何多余文字：
{"match":"现有条目的完整标题，若不属于任何现有项目则为 null","materialName":"材料简短名称，8字内，如 界面设计稿","kind":"image|pdf|doc|ppt","entry":{"title":"项目正式名称","period":"时间，如 2024 – 至今","role":"我的角色，10字内","points":"做了什么要点，用\\n分隔每条，最多3条，无把握则留空","result":"成果，如 产品落地 · 3 项知识产权","tagText":"角标文字：项目负责人/核心成员/参与项目/进行中 之一","tagColor":"red|black|gray","weight":0-100整数}}
规则：
1. match 判断：材料内容与某个现有项目明显同类（同名项目、同一作品）→ 返回该条目标题；否则 null
2. 仅当 match 为 null 时 entry 才需要填写；weight 标尺：主导产品落地 85-95、核心成员 75-84、参与项目 60-74、进行中项目 65-80
3. 无把握的字段一律留空字符串或 0，不要编造`
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), AI_TIMEOUT_MS)
  try {
    const res = await fetch('/zhipu-api/api/paas/v4/chat/completions', {
      method: 'POST',
      signal: ctrl.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`
      },
      body: JSON.stringify({
        model: model || 'glm-5.3-flash',
        temperature: 0.1,
        messages: [
          {
            role: 'user',
            content: dataUrl
              ? [
                  { type: 'image_url', image_url: { url: dataUrl } },
                  { type: 'text', text: prompt }
                ]
              : [{ type: 'text', text: `${prompt}\n\n注意：本次没有图片，只根据文件名判断，没把握的字段一律留空。` }]
          }
        ]
      })
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`GLM API ${res.status} ${text.slice(0, 140)}`)
    }
    const data = await res.json()
    const content = data?.choices?.[0]?.message?.content
    if (!content) throw new Error('GLM 返回为空')
    return parseCompRecognition(content)
  } finally {
    clearTimeout(timer)
  }
}
