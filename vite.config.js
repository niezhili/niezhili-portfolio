import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import fs from 'node:fs'
import path from 'node:path'
import { execFile } from 'node:child_process'

// POST /api/honor-upload — 把证书图片写入 public/assets/honors/，返回可访问路径
// POST /api/photo-upload — 把照片写入 public/assets/photos/，返回可访问路径
// 请求体为原始字节流，X-Ext 指定扩展名；文件名自动生成，避免中文/特殊字符问题
function fileUploadPlugin() {
  return {
    name: 'file-upload',
    configureServer(server) {
      const handle = (subdir, prefix) => (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ ok: false, error: 'POST only' }))
          return
        }
        const chunks = []
        req.on('data', c => chunks.push(c))
        req.on('end', () => {
          try {
            if (!chunks.length) throw new Error('empty body')
            const ext = (String(req.headers['x-ext'] || 'jpg').match(/[a-z0-9]+/gi) || ['jpg']).pop()
            const dir = path.resolve(process.cwd(), 'public/assets', subdir)
            fs.mkdirSync(dir, { recursive: true })
            const name = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`
            fs.writeFileSync(path.join(dir, name), Buffer.concat(chunks))
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: true, path: `/assets/${subdir}/${name}` }))
          } catch (e) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: false, error: String(e.message || e) }))
          }
        })
      }
      server.middlewares.use('/api/honor-upload', handle('honors', 'honor'))
      server.middlewares.use('/api/photo-upload', handle('photos', 'photo'))
    }
  }
}

// POST /api/comp-upload — 竞赛过程材料上传：
// 原件写入 public/assets/competition/；Word/PPT 用 LibreOffice(soffice) 转出 PDF 预览版
// 请求体为原始字节流，X-Ext 指定扩展名；返回 { ok, path, preview }
const OFFICE_EXTS = ['doc', 'docx', 'ppt', 'pptx']

function sofficePath() {
  const app = '/Applications/LibreOffice.app/Contents/MacOS/soffice'
  return fs.existsSync(app) ? app : 'soffice'
}

function convertToPdf(absFile) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('soffice 转换超时')), 90000)
    execFile(
      sofficePath(),
      ['--headless', '--convert-to', 'pdf', '--outdir', path.dirname(absFile), absFile],
      err => {
        clearTimeout(timer)
        if (err) return reject(new Error(`soffice 转换失败: ${String(err.message || err).slice(0, 120)}`))
        const pdf = absFile.replace(/\.[^.]+$/, '.pdf')
        fs.existsSync(pdf) ? resolve(pdf) : reject(new Error('soffice 未产出 PDF'))
      }
    )
  })
}

function compUploadPlugin() {
  return {
    name: 'comp-upload',
    configureServer(server) {
      server.middlewares.use('/api/comp-upload', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ ok: false, error: 'POST only' }))
          return
        }
        const chunks = []
        req.on('data', c => chunks.push(c))
        req.on('end', async () => {
          try {
            if (!chunks.length) throw new Error('empty body')
            const ext = (String(req.headers['x-ext'] || 'jpg').match(/[a-z0-9]+/gi) || ['jpg']).pop().toLowerCase()
            // X-Dir 白名单：competition（竞赛材料）| projects（项目材料），防路径穿越
            const dirKey = ['competition', 'projects'].includes(String(req.headers['x-dir']))
              ? String(req.headers['x-dir'])
              : 'competition'
            const prefix = dirKey === 'projects' ? 'proj' : 'comp'
            const dir = path.resolve(process.cwd(), 'public/assets', dirKey)
            fs.mkdirSync(dir, { recursive: true })
            const name = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`
            const abs = path.join(dir, name)
            fs.writeFileSync(abs, Buffer.concat(chunks))
            let preview = ''
            if (OFFICE_EXTS.includes(ext)) {
              try {
                await convertToPdf(abs)
                preview = `/assets/${dirKey}/${name.replace(/\.[^.]+$/, '.pdf')}`
              } catch (e) {
                // 转换失败不阻塞上传，预览留空（前端降级为仅下载）
                console.warn('[comp-upload]', e.message)
              }
            }
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: true, path: `/assets/${dirKey}/${name}`, preview }))
          } catch (e) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: false, error: String(e.message || e) }))
          }
        })
      })
    }
  }
}

// GET  /api/ai-settings — 读取本机 AI 配置（Key/模型），文件不存在时返回空值
// POST /api/ai-settings — 保存 { key, model } 到项目根目录 ai-settings.local.json
// 该文件已被 .gitignore 忽略，Key 只存本机、不入仓库；换端口/换浏览器均不丢失
function aiSettingsPlugin() {
  const settingsFile = () => path.resolve(process.cwd(), 'ai-settings.local.json')
  return {
    name: 'ai-settings',
    configureServer(server) {
      server.middlewares.use('/api/ai-settings', (req, res) => {
        const reply = (code, obj) => {
          res.statusCode = code
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(obj))
        }
        if (req.method === 'GET') {
          try {
            const raw = JSON.parse(fs.readFileSync(settingsFile(), 'utf8'))
            reply(200, { ok: true, key: String(raw.key || ''), model: String(raw.model || '') })
          } catch {
            reply(200, { ok: true, key: '', model: '' })
          }
          return
        }
        if (req.method === 'POST') {
          const chunks = []
          req.on('data', c => chunks.push(c))
          req.on('end', () => {
            try {
              const body = JSON.parse(Buffer.concat(chunks).toString('utf8'))
              fs.writeFileSync(
                settingsFile(),
                JSON.stringify({ key: String(body.key || ''), model: String(body.model || '') }, null, 2)
              )
              reply(200, { ok: true })
            } catch (e) {
              reply(500, { ok: false, error: String(e.message || e) })
            }
          })
          return
        }
        reply(405, { ok: false, error: 'GET/POST only' })
      })
    }
  }
}

// 127.0.0.1 → localhost 301 重定向：WebAuthn（指纹解锁）不接受 IP 形式的 RP ID，
// 注册与验证必须在 http://localhost:5173 下进行
function localhostRedirectPlugin() {
  return {
    name: 'localhost-redirect',
    configureServer(server) {
      const port = server.config.server.port || 5173
      server.middlewares.use((req, res, next) => {
        const host = String(req.headers.host || '')
        if (host.startsWith('127.0.0.1')) {
          res.writeHead(301, { Location: `http://localhost:${port}${req.url || '/'}` })
          res.end()
          return
        }
        next()
      })
    }
  }
}

export default defineConfig({
  plugins: [vue(), fileUploadPlugin(), compUploadPlugin(), aiSettingsPlugin(), localhostRedirectPlugin()],
  server: {
    host: 'localhost',
    port: 5173,
    proxy: {
      // 浏览器 → 本地代理 → 智谱开放平台，避免 CORS；API Key 仅经过本机
      '/zhipu-api': {
        target: 'https://open.bigmodel.cn',
        changeOrigin: true,
        rewrite: p => p.replace(/^\/zhipu-api/, '')
      }
    }
  }
})
