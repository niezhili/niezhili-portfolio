// Centralized portfolio content — single source of truth for all views.

export const profile = {
  avatarChar: '聂',
  avatar: new URL('../assets/avatar.png', import.meta.url).href,
  name: '聂志理',
  nameEn: 'NIE ZHILI',
  roles: ['产品经理', '项目经理'],
  email: 'work4niezhili@163.com',
  city: '杭州 · 浙江',
  year: '2027届通信工程'
}

export const navItems = [
  { key: 'home', label: '主页', dot: 'blue', eyebrow: '主页 / Home' },
  { key: 'edu',  label: '教育经历', dot: 'gray',  eyebrow: '教育经历 / Education' },
  { key: 'proj', label: '项目经历', dot: 'black', eyebrow: '项目经历 / Projects' },
  { key: 'comp', label: '竞赛经历', dot: 'red', eyebrow: '竞赛经历 / Competitions' },
  { key: 'honor', label: '荣誉墙', dot: 'red', eyebrow: '荣誉墙 / Honors' }
]

export const heroTags = ['智能镜负责人', '3 项知识产权', '国家级一等奖', '福安项目']

export const stats = [
  { num: '5+', label: '主导项目' },
  { num: '3',  label: '项知识产权' },
  { num: '1',  label: '项国家级奖项' }
]

export const featured = {
  badge: 'LEAD · 项目负责人',
  period: '2024 – 2025',
  title: '智能镜产品设计',
  desc: '主导智能镜产品从 0 到 1：需求调研、功能定义、交互设计与开发跟进，协同软硬件团队推进落地。',
  imageAlt: '智能镜产品预览',
  footTags: '需求分析 · 交互设计 · 项目管理 · 知识产权 ×3'
}

export const sideProjects = [
  {
    badge: '国家级一等奖',
    title: '智能门禁系统',
    desc: '参与方案设计与开发实现，斩获国家级竞赛一等奖。',
    meta: '嵌入式 · 团队协作'
  },
  {
    badge: '进行中',
    title: '福安公交车队接入',
    desc: '负责 200 辆公交设备与视频准入验证、调度中心对接。',
    meta: '准入验证 · 进度管理'
  }
]

export const education = {
  main: {
    period: '2023 – 2027',
    degree: '本科 · 通信工程',
    sub: '通信工程专业 · 2027 届毕业生',
    desc: '主修通信原理、嵌入式系统与信号处理，方向偏软硬件结合；在校期间主导智能镜项目并完成 3 项知识产权，获国家级竞赛一等奖。',
    courses: ['通信原理', '嵌入式系统', '信号处理', '数字电路', '数据结构', '计算机网络']
  },
  ongoing: {
    title: '持续学习',
    status: 'ONGOING',
    rows: [
      { tag: '备考中', text: '无人机测评认证 · 错题总结复盘，持续巩固薄弱知识点' },
      { tag: 'B1',    text: '英语学习 · 拉丁词根词积累与口语对话训练' },
      { tag: '方法论', text: '产品经理方法论 · 需求分析与项目管理实践' }
    ]
  }
}

export const projects = [
  {
    title: '智能镜 Smart Mirror',
    sub: '2024 – 至今 · 产品 3 项知识产权',
    desc: '智能化妆镜产品项目。负责需求分析、原型设计与项目全流程推进，完成从 0 到 1 的产品落地，累计产出 3 项知识产权。',
    tag: { text: '项目负责人', color: 'black' }
  },
  {
    title: '智能门禁系统',
    sub: '竞赛项目 · 团队核心成员',
    desc: '基于人脸识别的智能门禁系统，参与整体方案设计与硬件选型验证，作品最终斩获国家级竞赛一等奖。',
    tag: { text: '国家级一等奖', color: 'red' }
  },
  {
    title: '福安公交车队项目',
    sub: '在职项目 · 2026 · 200 辆车队规模',
    desc: '负责 200 辆公交设备与视频准入验证，对接调度中心完成联通，通过数据表持续跟踪车队接入完成情况。',
    tag: { text: '进行中', color: 'gray' }
  }
]

export const competitionStats = [
  { num: '01', label: '国家级竞赛奖项' },
  { num: '03', label: '知识产权产出' },
  { num: '备考中', label: '无人机测评认证' }
]

export const competitions = [
  {
    title: '智能门禁 · 国家级竞赛',
    sub: '团队作品 · 负责系统方案与硬件选型',
    desc: '基于人脸识别的智能门禁系统作品，从方案设计、原型验证到现场答辩全程参与，最终在国家级竞赛中斩获一等奖。',
    tag: { text: '国家级一等奖', color: 'red' }
  },
  {
    title: '无人机测评认证',
    sub: '个人认证 · 2026 · 错题复盘笔记',
    desc: '系统备考无人机测评考试，建立并持续维护错题总结笔记，按知识模块复盘薄弱点，稳步推进认证目标。',
    tag: { text: '备考中', color: 'gray' }
  }
]

export const honors = [
  {
    eyebrow: 'COMPETITION',
    title: '国家级竞赛一等奖',
    desc: '智能门禁系统作品获国家级竞赛一等奖，负责系统方案设计与硬件选型。',
    accent: 'red'
  },
  {
    eyebrow: 'INTELLECTUAL PROPERTY',
    title: '知识产权 × 3',
    desc: '智能镜项目累计产出 3 项知识产权，覆盖软件著作权与专利成果。',
    accent: 'black'
  },
  {
    eyebrow: 'LEADERSHIP',
    title: '智能镜项目负责人',
    desc: '主导智能镜产品从 0 到 1 落地，负责需求分析、原型设计与全流程推进。',
    accent: 'blue'
  },
  {
    eyebrow: 'CERTIFICATION',
    title: '无人机测评认证',
    desc: '系统备考中，持续维护错题总结笔记，按模块复盘薄弱知识点。',
    accent: 'gray'
  }
]

export const cmsNav = [
  { key: 'profile',  label: '个人资料', active: false, dot: 'blue' },
  { key: 'edu',      label: '教育经历', active: false, dot: 'gray' },
  { key: 'proj',     label: '项目经历', active: true,  dot: 'black' },
  { key: 'comp',     label: '竞赛经历', active: false, dot: 'red' },
  { key: 'honor',    label: '荣誉墙',   active: false, dot: 'red' }
]
