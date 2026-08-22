<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['close', 'success'])

const PASSCODE = '051014'

const code = ref('')
const error = ref('')
const shaking = ref(false)

const dots = computed(() => Array.from({ length: 6 }, (_, i) => i < code.value.length))

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
    emit('success')
  } else {
    error.value = '密码错误，请重试'
    shaking.value = true
    setTimeout(() => {
      code.value = ''
      shaking.value = false
    }, 500)
  }
}

const remaining = computed(() => Math.max(0, 6 - code.value.length))

const keys = ['1','2','3','4','5','6','7','8','9','','0','del']
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

      <h2 class="title">内容管理 · 身份验证</h2>
      <p class="sub">请输入 6 位管理密码以编辑内容</p>

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

      <button class="forgot">忘记密码?</button>
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

.dots { display: flex; gap: 14px; margin-bottom: 12px; }
.dots.shake { animation: shake 0.4s ease; }
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-8px); }
  40% { transform: translateX(8px); }
  60% { transform: translateX(-5px); }
  80% { transform: translateX(5px); }
}
.dot.err { border-color: #ff3b30; }
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

.forgot {
  margin-top: 14px;
  border: none;
  background: transparent;
  color: var(--blue-500);
  font-size: 12px;
  font-weight: 500;
}
.forgot:hover { text-decoration: underline; }
</style>
