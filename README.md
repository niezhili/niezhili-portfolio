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

- Fixed `1280 × 800` canvas, auto-scaled to fit the browser window with `transform: scale()` (capped at 1.0 — never scales up).
- Sidebar collapses to a `76px` icon rail; toggle from the sidebar bottom pill, the rail's `»` button, or the top bar's 展开侧栏 pill.
- Top bar's `内容管理` blue pill opens the passcode modal; passcode `051014` auto-verifies on the 6th digit; `发布更新` returns to home.
- Proximity glow: cards near the cursor light up (see `useProximityGlow.js`).
- **Data persistence**: all CMS edits are saved to `localStorage` (key `portfolio-cms-data-v2`) and survive refresh; every view reads live from the store; `发布更新` stamps the `最近更新` date in the top bar; 恢复默认 resets to the `content.js` defaults.

## 代码结构

```
src/
  main.js                     # 应用入口
  App.vue                     # 页面外壳：画布自动缩放、路由状态、组件编排
  data/content.js             # 全站文案数据的唯一来源（默认值）
  store/siteData.js           # 响应式数据仓库 + localStorage 持久化（key: portfolio-cms-data-v2）
  composables/
    useProximityGlow.js       # 鼠标接近发光效果（rAF 节流 + --glow CSS 变量）
  components/
    Sidebar.vue               # 展开侧栏（280px）：头像、导航、联系方式、收起按钮
    IconRail.vue              # 收起图标栏（76px）：圆点导航、展开按钮
    TopBar.vue                # 顶栏：面包屑、最近更新时间、内容管理入口
    PasscodeModal.vue         # 密码锁屏（420px）：6 位密码自动校验
    CMSWindow.vue             # 内容管理后台（1100×680）：schema 驱动编辑器 + 实时预览
  views/
    HomeView.vue              # 首页：hero、数据亮点、主打项目、侧栏小卡片
    EducationView.vue         # 教育经历：主卡片 + 持续学习
    ProjectsView.vue          # 项目经历：项目卡片列表
    CompetitionsView.vue      # 竞赛经历：数据统计 + 竞赛卡片
    HonorsView.vue            # 荣誉墙：2×2 荣誉网格
  styles/
    design-tokens.css         # 设计令牌：颜色、圆角、字体、层级 z-index
    global.css                # 全局样式：glass 卡片、画布舞台、导航圆点（蓝色五档明度）
  assets/                     # 静态图片（头像、主打项目图）
```

**数据流**：`content.js`（默认值）→ `siteData.js`（深拷贝 + localStorage 合并）→ 各视图读取渲染；CMS 编辑器改 `siteData` → 视图实时更新 → 自动保存到 localStorage。
