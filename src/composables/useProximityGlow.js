// Proximity glow: cards near the cursor light up, intensity falls off with distance.
// Usage: const canvasEl = ref(null); useProximityGlow(canvasEl)
import { onMounted, onBeforeUnmount } from 'vue'

export function useProximityGlow(containerRef, options = {}) {
  const maxDist = options.maxDist ?? 220 // px of influence radius (screen space)
  let raf = null
  let mx = -9999
  let my = -9999
  let dirty = false

  function update() {
    const root = containerRef.value
    if (!root) return
    const cards = root.querySelectorAll('.glass')
    for (const el of cards) {
      const r = el.getBoundingClientRect()
      // distance from cursor to the card's nearest edge (0 when hovering it)
      const dx = Math.max(r.left - mx, 0, mx - r.right)
      const dy = Math.max(r.top - my, 0, my - r.bottom)
      const dist = Math.hypot(dx, dy)
      const g = Math.max(0, 1 - dist / maxDist)
      el.style.setProperty('--glow', g.toFixed(3))
    }
  }

  function onMove(e) {
    mx = e.clientX
    my = e.clientY
    if (dirty) return
    dirty = true
    raf = requestAnimationFrame(() => {
      raf = null
      dirty = false
      update()
    })
  }

  function onLeave() {
    mx = my = -9999
    update()
  }

  onMounted(() => {
    window.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseleave', onLeave)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseleave', onLeave)
    if (raf) cancelAnimationFrame(raf)
  })
}
