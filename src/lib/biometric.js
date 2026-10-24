// 触控 ID（指纹）解锁 — 基于 WebAuthn 平台认证器，仅本机 localhost 场景使用
// 注册一次后凭据 ID 存 localStorage；verify() 唤起系统 Touch ID，本地校验通过即放行
// 说明：本应用无后端，指纹门禁是体验层门槛，6 位密码始终是兜底主钥匙

const CRED_KEY = 'portfolio-biometric-cred'
const SESSION_KEY = 'portfolio-cms-unlocked'

// ---------- base64url ↔ ArrayBuffer ----------
function b64uToBuf(s) {
  const pad = '='.repeat((4 - (s.length % 4)) % 4)
  const b64 = atob((s + pad).replace(/-/g, '+').replace(/_/g, '/'))
  const buf = new Uint8Array(b64.length)
  for (let i = 0; i < b64.length; i++) buf[i] = b64.charCodeAt(i)
  return buf.buffer
}

function bufToB64u(buf) {
  const bytes = new Uint8Array(buf)
  let s = ''
  for (const b of bytes) s += String.fromCharCode(b)
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

// ---------- 能力检测：WebAuthn + 本机指纹认证器 + 安全上下文 ----------
export async function biometricAvailable() {
  try {
    if (!window.PublicKeyCredential || !window.isSecureContext) return false
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
  } catch {
    return false
  }
}

let lastBioError = ''

// 最近一次 WebAuthn 失败原因（错误名 + 信息），供界面提示
export function getLastBioError() {
  return lastBioError
}

// 当前页面地址不适合指纹：IP 形式的 host（如 127.0.0.1）不能作为 WebAuthn RP ID
export function hostWarning() {
  const h = location.hostname
  if (h === 'localhost' || h === '::1' || h === '[::1]') return ''
  const isIp = /^\d{1,3}(\.\d{1,3}){3}$/.test(h)
  if (isIp || h.includes(':')) {
    return `当前地址 ${location.host} 无法注册 / 验证指纹（浏览器不接受 IP 域），请改用 http://localhost:5173 打开`
  }
  return ''
}

export function hasRegistration() {
  try {
    return !!localStorage.getItem(CRED_KEY)
  } catch {
    return false
  }
}

// 注册：唤起 Touch ID 录入；成功 true，取消/失败 false（需在用户点击等手势内调用）
export async function registerBiometric() {
  try {
    const cred = await navigator.credentials.create({
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        rp: { id: location.hostname, name: 'Portfolio CMS' },
        user: {
          id: crypto.getRandomValues(new Uint8Array(16)),
          name: 'local-admin',
          displayName: '本机管理员'
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' }, // ES256
          { alg: -257, type: 'public-key' } // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
          residentKey: 'preferred'
        },
        timeout: 60000,
        attestation: 'none'
      }
    })
    localStorage.setItem(CRED_KEY, bufToB64u(cred.rawId))
    lastBioError = ''
    return true
  } catch (e) {
    lastBioError = `${e?.name || 'Error'}: ${e?.message || e}`
    console.warn('[biometric] 注册失败', lastBioError)
    return false
  }
}

// 验证：唤起 Touch ID；本机校验通过 true，取消/失败 false
export async function verifyBiometric() {
  const id = (() => {
    try {
      return localStorage.getItem(CRED_KEY)
    } catch {
      return null
    }
  })()
  if (!id) return false
  try {
    await navigator.credentials.get({
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        allowCredentials: [{ id: b64uToBuf(id), type: 'public-key' }],
        userVerification: 'required',
        timeout: 60000
      }
    })
    lastBioError = ''
    return true
  } catch (e) {
    lastBioError = `${e?.name || 'Error'}: ${e?.message || e}`
    console.warn('[biometric] 验证失败', lastBioError)
    return false
  }
}

export function clearRegistration() {
  try {
    localStorage.removeItem(CRED_KEY)
  } catch {
    /* ignore */
  }
}

// ---------- 会话级免验证：本次浏览器会话内解锁一次即可 ----------
export function isSessionUnlocked() {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1'
  } catch {
    return false
  }
}

export function markSessionUnlocked() {
  try {
    sessionStorage.setItem(SESSION_KEY, '1')
  } catch {
    /* ignore */
  }
}
