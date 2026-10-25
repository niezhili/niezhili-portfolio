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
npm run dev      # http://localhost:5173（127.0.0.1 会 301 跳转，供 WebAuthn 指纹使用）
npm run build    # production build into dist/
```

## Canvas behavior

- Fixed `1280 × 800` canvas, auto-scaled to fit the browser window with `transform: scale()` (capped at 1.0 — never scales up).
- Navigation imitates macOS Stage Manager: a fixed-order strip of window thumbnails on the left edge (avatar → home → education → projects → competitions → honors). The active page is pulled out of the strip and sits on the centre stage; leaving it slides the card back into its own slot.
- **Thumbnails are the real pages**, not mock bars: each card renders the actual view component at the main area's native `1104×768` and scales it down by `132/1104 ≈ 0.1196`. Thumbnails are `inert` + `pointer-events:none`, and `provide(STAGE_PREVIEW)` makes those page instances skip global keyboard/wheel listeners so one arrow key isn't handled twice.
- Home has a card like every other page — it is the only way back to the home page (treating it as a borderless "desktop" left users stranded once they opened a sub-page).
- Switching is a two-phase FLIP: 200ms shrink into the old page's slot → swap → 300ms expand from the clicked card (targets are always 132×92 cards or the 44×44 avatar slot, `sx`/`sy` are always non-uniform).
- Top bar's `内容管理` blue pill opens the passcode modal; passcode `051014` auto-verifies on the 6th digit; `发布更新` returns to home.
- **Data persistence**: all CMS edits are saved to `localStorage` (key `portfolio-cms-data-v4`); `SEED_REV` in `siteData.js` 控制一次性的增量播种（新增条目合并进旧存档，不覆盖用户上传的材料） and survive refresh; every view reads live from the store; `发布更新` stamps the `最近更新` date in the top bar; 恢复默认 resets to the `content.js` defaults.

## 代码结构

```
src/
  main.js                     # 应用入口
  App.vue                     # 页面外壳：画布自动缩放、舞台状态机（FLIP 切换）、组件编排
  data/content.js             # 全站文案数据的唯一来源（默认值）
  store/siteData.js           # 响应式数据仓库 + localStorage 持久化（v4）+ SEED_REV 增量播种
  lib/stageContext.js         # STAGE_PREVIEW：缩略图内的页面实例跳过全局输入监听
  components/
    StageStrip.vue            # 台前调度窗口条：44px 头像窗 + 132×92 页面卡；卡内渲染真实页面并整体缩放（固定顺序、梯形透视、左下角图标）
    TopBar.vue                # 顶栏：当前页标题、最近更新时间、内容管理入口（bare 模式供缩略图复用）
    PasscodeModal.vue         # 密码锁屏（420px）：6 位密码自动校验
    CMSWindow.vue             # 内容管理后台（1100×680）：schema 驱动编辑器 + 实时预览
  views/
    HomeView.vue              # 首页：hero、数据亮点、主打项目、侧栏小卡片
    EducationView.vue         # 教育经历：主卡片 + 持续学习
    ProjectsView.vue          # 项目经历：编辑目录（编号 + 大字级 + 右侧玻璃预览卡）
    CompetitionsView.vue      # 竞赛经历：数据统计 + 竞赛卡片
    HonorsView.vue            # 荣誉墙：三列瀑布流证书墙 + 灯箱放大
    AvatarView.vue            # 个人资料：舞台内大头像 + ←/→ 切换照片（原 AvatarLightbox 的舞台版）
  styles/
    design-tokens.css         # 设计令牌：颜色、圆角、字体、层级 z-index
    global.css                # 全局样式：glass 卡片、画布舞台、导航圆点（蓝色五档明度）
  assets/                     # 静态图片（头像、主打项目图）
```

**数据流**：`content.js`（默认值）→ `siteData.js`（深拷贝 + localStorage 合并）→ 各视图读取渲染；CMS 编辑器改 `siteData` → 视图实时更新 → 自动保存到 localStorage。
