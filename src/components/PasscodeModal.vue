<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  biometricAvailable,
  hasRegistration,
  registerBiometric,
  verifyBiometric,
  clearRegistration,
  hostWarning,
  getLastBioError
} from '../lib/biometric.js'

const emit = defineEmits(['close', 'success'])

const PASSCODE = '051014'

// mode: 'bio' 指纹验证 | 'keypad' 密码键盘 | 'setup' 启用指纹引导
const mode = ref('keypad')
const code = ref('')
const error = ref('')
const shaking = ref(false)

const bioWorking = ref(false)
const bioStatus = ref('')
const hasReg = ref(false) // 已注册指纹（控制「重置指纹」入口）
const bioReady = ref(false) // 可用且已注册（keypad 里显示指纹快捷按钮）
const bioCanSetup = ref(false) // 可用且未注册（密码通过后引导启用）
const hostWarn = ref('') // 当前 host 不适合指纹（如 127.0.0.1）时的提示

const dots = computed(() => Array.from({ length: 6 }, (_, i) => i < code.value.length))
const remaining = computed(() => Math.max(0, 6 - code.value.length))
const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del']

onMounted(async () => {
  const avail = await biometricAvailable()
  hasReg.value = hasRegistration()
  hostWarn.value = hostWarning()
  if (!avail) return
  if (hasReg.value) {
    bioReady.value = true
    mode.value = 'bio'
    runBio() // 打开即自动唤起 Touch ID，零点击
  } else {
    bioCanSetup.value = true
  }
})

// ---------- 指纹 ----------
async function runBio() {
  bioWorking.value = true
  bioStatus.value = '等待触控 ID…'
  const ok = await verifyBiometric()
  bioWorking.value = false
  if (ok) {
    emit('success')
  } else {
    // 取消或未通过 → 回退密码键盘，绝不锁死；显示真实原因便于排查
    const err = getLastBioError()
    bioStatus.value = err ? '验证未通过 · ' + err.slice(0, 90) : '未通过或已取消'
    mode.value = 'keypad'
  }
}

function startBio() {
  mode.value = 'bio'
  runBio()
}

async function enableBio() {
  const ok = await registerBiometric()
  if (ok) {
    hasReg.value = true
    bioReady.value = true
    bioCanSetup.value = false
    emit('success')
  } else {
    error.value = hostWarn.value || '指纹注册未完成 · ' + (getLastBioError() || '请重试').slice(0, 90)
    mode.value = 'keypad'
  }
}

function skipSetup() {
  emit('success')
}

async function resetBio() {
  clearRegistration()
  hasReg.value = false
  bioReady.value = false
  bioCanSetup.value = await biometricAvailable()
  mode.value = 'keypad'
  error.value = ''
}

// ---------- 密码键盘 ----------
function pressKey(k) {
  if (shaking.value) return
  error.value = ''
  if (k === 'del') {
    code.value = code.value.slice(0, -1)
  } else if (code.value.length < 6) {
    code.value += k
    if (code.value.length === 6) autoVerify()
  }
}

function autoVerify() {
  if (code.value === PASSCODE) {
    code.value = ''
    if (bioCanSetup.value) {
      mode.value = 'setup' // 密码通过后引导启用指纹（仅一次）
    } else {
      emit('success')
    }
  } else {
    error.value = '密码错误，请重试'
    shaking.value = true
    setTimeout(() => {
      code.value = ''
      shaking.value = false
    }, 500)
  }
}
</script>

<template>
  <div class="overlay" @click.self="emit('close')">
    <div class="modal glass">
      <!-- Lock badge -->
      <div class="lock-badge">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M6 10V8a6 6 0 1112 0v2M5 10h14a1 1 0 011 1v8a1 1 0 01-1 1H5a1 1 0 01-1-1v-8a1 1 0 011-1z"
            stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>

      <!-- 指纹验证视图 -->
      <template v-if="mode === 'bio'">
        <h2 class="title">内容管理 · 指纹验证</h2>
        <p class="sub">{{ bioStatus || '使用触控 ID 解锁' }}</p>
        <button class="bio-btn" :class="{ working: bioWorking }" :disabled="bioWorking" @click="runBio" aria-label="指纹验证">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"/>
            <path d="M14 13.12c0 2.38 0 6.38-1 8.88"/>
            <path d="M17.29 21.02c.12-.6.43-2.3.5-3.02"/>
            <path d="M2 12a10 10 0 0 1 18-6"/>
            <path d="M2 16h.01"/>
            <path d="M21.8 16c.2-2 .131-5.354 0-6"/>
            <path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2"/>
            <path d="M8.65 22c.21-.66.45-1.32.57-2"/>
            <path d="M9 6.8a6 6 0 0 1 9 5.2v2"/>
          </svg>
        </button>
        <div class="alt-links">
          <button class="link" @click="mode = 'keypad'">使用密码解锁</button>
        </div>
      </template>

      <!-- 启用指纹引导（密码验证通过后、未注册时出现一次） -->
      <template v-else-if="mode === 'setup'">
        <h2 class="title">启用指纹解锁</h2>
        <p class="sub">密码验证已通过 · 下次进入可直接用触控 ID</p>

        <template v-if="hostWarn">
          <div class="warn-box">{{ hostWarn }}</div>
          <div class="setup-actions">
            <button class="setup-btn no" @click="skipSetup">暂不 · 直接进入</button>
          </div>
        </template>
        <template v-else>
          <div class="setup-actions">
            <button class="setup-btn yes" @click="enableBio">立即启用</button>
            <button class="setup-btn no" @click="skipSetup">暂不 · 直接进入</button>
          </div>
          <div class="hint" :class="{ err: !!error }">{{ error }}</div>
        </template>
      </template>

      <!-- 密码键盘视图 -->
      <template v-else>
        <h2 class="title">内容管理 · 身份验证</h2>
        <p class="sub">请输入 6 位管理密码以编辑内容</p>

        <button v-if="bioReady" class="bio-alt" @click="startBio">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"/>
            <path d="M14 13.12c0 2.38 0 6.38-1 8.88"/>
            <path d="M17.29 21.02c.12-.6.43-2.3.5-3.02"/>
            <path d="M2 12a10 10 0 0 1 18-6"/>
            <path d="M2 16h.01"/>
            <path d="M21.8 16c.2-2 .131-5.354 0-6"/>
            <path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2"/>
            <path d="M8.65 22c.21-.66.45-1.32.57-2"/>
            <path d="M9 6.8a6 6 0 0 1 9 5.2v2"/>
          </svg>
          使用指纹解锁
        </button>

        <div class="dots" :class="{ shake: shaking }">
          <span v-for="(filled, i) in dots" :key="i" class="dot" :class="{ filled }" />
        </div>
        <div class="hint" :class="{ err: !!error }">
          {{ error || (code.length ? `已输入 ${code.length} 位，还差 ${remaining} 位` : '') }}
        </div>

        <!-- Keypad -->
        <div class="keypad">
          <button
            v-for="(k, i) in keys"
            :key="i"
            class="key"
            :class="{ ghost: k === '' }"
            :disabled="k === ''"
            @click="pressKey(k)"
          >
            <template v-if="k === 'del'">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 5h12a2 2 0 012 2v10a2 2 0 01-2 2H9l-7-7 7-7zM14 9l5 5M19 9l-5 5"
                  stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </template>
            <template v-else>{{ k }}</template>
          </button>
        </div>
      </template>

      <div class="foot-links">
        <button v-if="hasReg" class="forgot" @click="resetBio">重置指纹</button>
        <button class="forgot">忘记密码?</button>
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

.modal {
  position: relative;
  width: 420px;
  padding: 48px 40px 32px;
  background: #fff;
  border-radius: var(--r-modal);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 20px 50px rgba(31, 31, 89, 0.3);
  animation: pop 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
  min-height: 480px;
}
@keyframes pop { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }

.lock-badge {
  position: absolute;
  top: -28px;
  left: 50%;
  transform: translateX(-50%);
  width: 56px; height: 56px;
  border-radius: var(--r-dot);
  background: var(--accent-black);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(29, 29, 31, 0.45), inset 0 1px 2px rgba(255, 255, 255, 0.25);
}

.title {
  margin: 0 0 8px;
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 600;
  color: var(--ink-1);
}
.sub {
  margin: 0 0 24px;
  font-size: 13px;
  color: var(--ink-3);
}

/* ---------- 指纹 ---------- */
.bio-btn {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  border: 1.5px solid var(--glass-stroke);
  background: rgba(255, 255, 255, 0.6);
  color: var(--ink-2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 18px;
  transition: all 0.15s ease;
}
.bio-btn:hover:not(:disabled) { background: #fff; color: var(--blue-500); transform: scale(1.04); }
.bio-btn:disabled { cursor: default; }
.bio-btn.working {
  color: var(--blue-500);
  animation: pulse 1.2s ease infinite;
}
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(87, 131, 255, 0.3); }
  50% { box-shadow: 0 0 0 14px rgba(87, 131, 255, 0); }
}

.alt-links { margin-top: 4px; }
.link {
  border: none;
  background: transparent;
  color: var(--blue-500);
  font-size: 12px;
  font-weight: 500;
}
.link:hover { text-decoration: underline; }

.bio-alt {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 16px;
  padding: 8px 14px;
  border: 1px solid var(--glass-stroke);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  font-weight: 600;
  color: var(--ink-2);
  transition: all 0.12s ease;
}
.bio-alt:hover { background: #fff; color: var(--blue-500); }

.setup-actions { display: flex; gap: 10px; margin-bottom: 12px; }
.setup-btn {
  height: 40px;
  padding: 0 18px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
}
.setup-btn.yes { border: none; background: var(--blue-500); color: #fff; }
.setup-btn.yes:hover { filter: brightness(1.06); }
.setup-btn.no { border: 1px solid #e5e7ef; background: #fff; color: var(--ink-2); }
.setup-btn.no:hover { background: #f5f7fb; }

.warn-box {
  background: #fff8ec;
  border: 1px solid #f5d48a;
  color: #8a5a00;
  font-size: 12px;
  line-height: 1.5;
  padding: 10px 14px;
  border-radius: 10px;
  margin-bottom: 16px;
  text-align: left;
}

/* ---------- 密码键盘 ---------- */
.dots { display: flex; gap: 14px; margin-bottom: 12px; }
.dots.shake { animation: shake 0.4s ease; }
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-8px); }
  40% { transform: translateX(8px); }
  60% { transform: translateX(-5px); }
  80% { transform: translateX(5px); }
}
.dot {
  width: 14px; height: 14px;
  border-radius: var(--r-dot);
  border: 1.5px solid var(--ink-4);
  background: transparent;
  transition: all 0.15s ease;
}
.dot.filled {
  background: var(--accent-black);
  border-color: var(--accent-black);
  transform: scale(1.1);
}
.hint { font-size: 12px; color: var(--ink-4); margin-bottom: 24px; min-height: 18px; }
.hint.err { color: #ff3b30; }

.keypad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  width: 100%;
  margin-bottom: 20px;
}
.key {
  height: 48px;
  border: 1px solid var(--glass-stroke);
  background: rgba(255, 255, 255, 0.6);
  border-radius: 14px;
  font-size: 18px;
  font-weight: 500;
  color: var(--ink-1);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.1s ease;
}
.key:hover:not(:disabled) { background: #fff; transform: translateY(-1px); }
.key:active:not(:disabled) { transform: scale(0.97); }
.key.ghost { visibility: hidden; }

.foot-links { display: flex; gap: 18px; margin-top: auto; padding-top: 14px; }
.forgot {
  border: none;
  background: transparent;
  color: var(--blue-500);
  font-size: 12px;
  font-weight: 500;
}
.forgot:hover { text-decoration: underline; }
</style>
