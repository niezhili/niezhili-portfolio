# 聂志理 · Portfolio App

Vue 3 + Vite reproduction of the Apple Liquid Glass Blue portfolio design.

## Stack

- Vue 3 (Composition API, `<script setup>`)
- Vite 5
- Native CSS (no Tailwind / no UI lib) — design tokens in `src/styles/design-tokens.css`
- Google Fonts: Instrument Sans (display) + Inter (body)

## Run

```bash
cd portfolio-app
npm install
npm run dev      # http://127.0.0.1:5173
npm run build    # production build into dist/
```

## Canvas behavior

- Fixed `1280 × 800` canvas, auto-scaled to fit the browser window with `transform: scale()`.
- Sidebar collapses to a `76px` icon rail; honor page exposes an "展开侧栏" pill to expand it.
- Top bar's `内容管理` blue pill opens the passcode modal; any 6-digit code unlocks the CMS editor; `发布更新` returns to home.
- CMS editor edits update the right-side live preview in real time.
- **Data persistence**: CMS edits are saved to `localStorage` (key `portfolio-cms-data`) and survive refresh. Edits to the featured project sync live to the home page and the projects page; `发布更新` stamps the `最近更新` date in the top bar. To reset content to defaults, run `resetToDefaults()` from `src/store/siteData.js` in the browser console.

## Structure

```
src/
  main.js
  App.vue                     # shell + auto-scale + routing state
  data/content.js             # all copy in one place
  store/siteData.js           # reactive store + localStorage persistence
  components/
    Sidebar.vue               # 280px expanded
    IconRail.vue              # 76px collapsed
    TopBar.vue
    PasscodeModal.vue         # 420px lock screen
    CMSWindow.vue             # 1100×680 editor + live preview
  views/
    HomeView.vue              # hero, stats, featured + side cards
    EducationView.vue         # main card + ongoing
    ProjectsView.vue          # 3 project cards
    CompetitionsView.vue      # 3 stat boxes + 2 cards
    HonorsView.vue            # 2×2 honor grid
  styles/
    design-tokens.css         # colors, radii, fonts, z
    global.css                # glass utility + canvas-stage
  assets/                     # exported PNGs (feat-smart-mirror, cms-cover, cms-preview)
```
