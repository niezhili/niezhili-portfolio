// Centralized portfolio content — single source of truth for all views.

export const profile = {
  avatarChar: '聂',
  avatar: '/assets/avatar.png',
  name: '聂志理',
  nameEn: 'NIE ZHILI',
  roles: ['产品经理', '项目经理'],
  email: 'work4niezhili@163.com',
  city: '杭州 · 浙江',
  year: '2027届通信工程'
}

export const navItems = [
  { key: 'home', label: '主页', dot: 'blue-5' },
  { key: 'edu',  label: '教育经历', dot: 'blue-4' },
  { key: 'proj', label: '项目经历', dot: 'blue-3' },
  { key: 'comp', label: '竞赛经历', dot: 'blue-2' },
  { key: 'honor', label: '荣誉墙', dot: 'blue-1' }
]

export const heroTags = ['智能镜负责人', '专利 4 项 · 软著 1 项', '国家级一等奖', 'IEEE 会议论文', '福安项目']

export const stats = [
  { num: '5+', label: '主导项目' },
  { num: '4',  label: '项专利（1 项授权）' },
  { num: '1',  label: '篇 IEEE 会议论文' }
]

export const featured = {
  badge: 'LEAD · 项目负责人',
  period: '2024 – 2025',
  title: '智能镜产品设计',
  desc: '主导智能镜产品从 0 到 1：需求调研、功能定义、交互设计与开发跟进，协同软硬件团队推进落地。',
  imageAlt: '智能镜产品预览',
  footTags: '需求分析 · 交互设计 · 项目管理 · 专利 ×4 · 软著 ×1'
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
    desc: '主修通信原理、嵌入式系统与信号处理，方向偏软硬件结合；在校期间主导国家级大创智能镜项目，获专利 4 项（1 项授权）、软件著作权 1 项，国家级竞赛一等奖 1 项，并参与 IEEE ICSSE 2026 会议论文 1 篇。',
    courses: ['通信原理', '嵌入式系统', '信号处理', '数字电路', '数据结构', '计算机网络']
  },
  ongoing: {
    title: '持续学习',
    status: 'ONGOING',
    rows: [
      { tag: '已录用', text: 'IEEE ICSSE 2026 · PI-TEAL 教学模型论文（第 5 作者，IEEE 版权已签署）' },
      { tag: '备考中', text: '无人机测评认证 · 错题总结复盘，持续巩固薄弱知识点' },
      { tag: 'B1',    text: '英语学习 · 拉丁词根词积累与口语对话训练' },
      { tag: '方法论', text: '产品经理方法论 · 需求分析与项目管理实践' }
    ]
  }
}

// 项目经历 · 手风琴列表条目（与竞赛经历同款逻辑）
// period/role/points/result 为展开详情；weight 与竞赛同标尺；attachments 为过程材料
export const projects = [
  {
    title: '智能镜 Smart Mirror',
    sub: '2025 – 2026 · 国家级大创 + 校级春萌双立项',
    tag: { text: '项目负责人', color: 'black' },
    period: '2025.03 – 2026.05',
    role: '项目负责人（排名 1/3）',
    points: '主持国家级大创项目（编号 202511057032），2026 年结题验收通过\n主导需求分析、功能定义与交互设计，推进软硬件协同开发与原型迭代\n搭建 React/Electron 前端 + Python/JS 双后端 + 树莓派嵌入式架构',
    result: '国家级大创结题通过 · 软件著作权 1 项 + 发明专利受理 1 项',
    weight: 92,
    attachments: [
      { name: '大创立项公示', kind: 'pdf', path: '/assets/projects/proj-dachuang-approval.pdf', preview: '' },
      { name: '大创结题验收通知', kind: 'pdf', path: '/assets/projects/proj-dachuang-closure.pdf', preview: '' },
      { name: '春萌立项通知', kind: 'pdf', path: '/assets/projects/proj-chunmeng-approval.pdf', preview: '' },
      { name: '春萌结题通知', kind: 'pdf', path: '/assets/projects/proj-chunmeng-closure.pdf', preview: '' }
    ]
  },
  {
    title: '多模态门禁识别系统',
    sub: '竞赛项目 · 团队核心成员',
    tag: { text: '省级二等奖', color: 'black' },
    period: '2025',
    role: '核心成员 · 方案与硬件',
    points: '参与整体方案设计与硬件选型验证\n推进 Wi-Fi CSI 步态识别与红外传感双模态原型联调',
    result: '浙江省物理实验与科技创新竞赛二等奖',
    weight: 85,
    attachments: []
  },
  {
    title: '福安公交车队项目',
    sub: '在职项目 · 2026 · 200 辆设备实施规模',
    tag: { text: '进行中', color: 'gray' },
    period: '2026 · 进行中',
    role: '设备准入与进度管理',
    points: '负责 200 辆公交设备与视频准入验证\n对接调度中心完成联通\n通过数据表持续跟踪车队接入进度\n3 辆公交车 + 1 条线路完成全流程调试',
    result: '车队接入推进中 · 调度中心已联通',
    weight: 75,
    attachments: []
  }
]

export const competitionStats = [
  { num: '01', label: '国家级竞赛奖项' },
  { num: '05', label: '知识产权产出' },
  { num: '01', label: 'IEEE 会议论文' }
]

// 竞赛经历 · 手风琴列表条目
// period/role/points/result 为展开详情（points 多行文本，每行一条要点）
// attachments 为过程材料（照片/PDF/Word/PPT），由 CMS 拖拽上传或手动添加
// weight 为含金量分值（0-100），与荣誉墙同一标尺；新增条目后自动按 weight 降序重排
export const competitions = [
  {
    title: '全国大学生物理实验竞赛',
    sub: '团队作品 · 负责 Wi-Fi 感知实验设计',
    tag: { text: '国家级一等奖', color: 'red' },
    period: '2025',
    role: '实验方案设计与数据处理',
    points: '围绕 Wi-Fi 电磁波菲涅耳区主题设计实验方案\n搭建基于 Wi-Fi 信号强度的菲涅耳区演示装置\n完成数据采集与分析，撰写参赛作品材料',
    result: '第十一届全国大学生物理实验竞赛一等奖',
    weight: 96,
    attachments: []
  },
  {
    title: 'Wi-Fi 无线感知课题组 · 两项赛项',
    sub: '团队作品 · 负责实验设计、数据处理与硬件选型',
    tag: { text: '国家级一等奖', color: 'red' },
    period: '2025',
    role: '实验方案设计 / 数据处理 / 硬件选型',
    points: '作品一：基于 Wi-Fi 信号强度的电磁波菲涅耳区可视化实验装置（国赛参赛作品）\n作品二：Wi-Fi CSI 步态识别 + 红外传感多模态门禁识别系统（省赛参赛作品）\n完成数据采集与分析、硬件选型验证与参赛材料撰写',
    result: '国家级一等奖（菲涅耳区实验）+ 省级二等奖（多模态门禁）\nIEEE ICSSE 2026 会议论文 1 篇（第 5 作者）',
    weight: 90,
    attachments: []
  },
  {
    title: '浙江省物理实验与科技创新竞赛',
    sub: '团队作品 · 多模态门禁识别系统',
    tag: { text: '省级二等奖', color: 'black' },
    period: '2025',
    role: '系统方案与感知模块设计',
    points: '基于 Wi-Fi 无线感知和红外传感设计多模态门禁识别系统\n完成"一走即通"作品的原型制作与测试',
    result: '浙江省物理实验与科技创新竞赛二等奖',
    weight: 77,
    attachments: []
  },
  {
    title: '中国大学生计算机设计大赛',
    sub: '个人作品 · 树莓派智能书法镜',
    tag: { text: '省级三等奖', color: 'black' },
    period: '2025',
    role: '作品设计与开发',
    points: '设计"以镜鉴字"树莓派智能书法镜方案\n完成镜面显示与字体矫正功能开发',
    result: '第 18 届计算机设计大赛浙江省级赛三等奖',
    weight: 71,
    attachments: []
  },
  {
    title: '中美青年创客大赛',
    sub: '团队作品 · 校级一等奖',
    tag: { text: '校级一等奖', color: 'gray' },
    period: '2026',
    role: '创意方案与原型制作',
    points: '参与创客主题方案构思与打磨\n完成参赛作品原型制作与路演展示',
    result: '中美青年创客大赛校级一等奖',
    weight: 68,
    attachments: []
  },
  {
    title: '三创赛',
    sub: '团队作品 · 校级一等奖',
    tag: { text: '校级一等奖', color: 'gray' },
    period: '2026',
    role: '商业计划书与路演答辩',
    points: '参与项目商业模式设计\n撰写参赛计划书并完成校级路演答辩',
    result: '三创赛校级一等奖',
    weight: 64,
    attachments: []
  },
  {
    title: '中美青年创客大赛 · 杭州分赛区',
    sub: '团队作品 · 优胜奖',
    tag: { text: '分赛区优胜', color: 'gray' },
    period: '2026',
    role: '作品展示与评委问答',
    points: '携校级一等奖作品晋级杭州分赛区\n完成作品展示与评委问答环节',
    result: '中美青年创客大赛杭州分赛区优胜奖',
    weight: 62,
    attachments: []
  },
  {
    title: '无人机测评认证',
    sub: '个人认证 · 2026 · 错题复盘笔记',
    tag: { text: '备考中', color: 'gray' },
    period: '2026 · 进行中',
    role: '独立备考',
    points: '系统备考无人机测评考试\n建立并持续维护错题总结笔记，按知识模块复盘薄弱点',
    result: '备考中 · 目标取得测评认证',
    weight: 52,
    attachments: []
  }
]

// 荣誉墙 · 证书照片墙条目 — image 指向 /assets/honors/ 下的压缩版，留空则显示占位框
// weight 为含金量分值（0-100）：CMS 每次新增条目后按 weight 降序自动重排，此处默认顺序即降序
export const honors = [
  {
    eyebrow: 'NATIONAL COMPETITION',
    title: '全国大学生物理实验竞赛 · 一等奖',
    desc: '作品《基于 Wi-Fi 的电磁波菲涅耳区实验》获第十一届全国大学生物理实验竞赛一等奖。',
    accent: 'red',
    image: '/assets/honors/physics-national-first.jpg',
    weight: 96
  },
  {
    eyebrow: 'IEEE CONFERENCE PAPER',
    title: 'IEEE ICSSE 2026 · 会议论文',
    desc: '《Exploration and Practice of the PI-TEAL Teaching Model》被 IEEE ICSSE 2026 录用，IEEE 版权已签署（Paper 120，第 5 作者）。',
    accent: 'blue',
    image: '/assets/honors/paper-icsse2026-pi-teal.jpg',
    weight: 90
  },
  {
    eyebrow: 'INTELLECTUAL PROPERTY',
    title: '实用新型专利 · 授权',
    desc: '《一种具有脱离报警功能的登山扣》获国家知识产权局实用新型专利授权（ZL 2025 2 1528414.1）。',
    accent: 'black',
    image: '/assets/honors/patent-carabiner.jpg',
    weight: 88
  },
  {
    eyebrow: 'SOFTWARE COPYRIGHT',
    title: '软件著作权 · 智能镜子系统 V2.0',
    desc: '《基于树莓派的智能镜子系统 V2.0》经中国版权保护中心登记（登记号 2026SR0902267，证书号 软著登字第 18116548 号）。',
    accent: 'black',
    image: '/assets/honors/software-copyright-mirror.jpg',
    weight: 80
  },
  {
    eyebrow: 'PROVINCIAL COMPETITION',
    title: '浙江省物理实验与科技创新竞赛 · 二等奖',
    desc: '作品《一"走"即通——基于 Wi-Fi 无线感知和红外传感的多模态门禁识别系统》获省级二等奖。',
    accent: 'blue',
    image: '/assets/honors/physics-zj-second.jpg',
    weight: 77
  },
  {
    eyebrow: 'PROVINCIAL COMPETITION',
    title: '中国大学生计算机设计大赛 · 省三等奖',
    desc: '作品《"以镜鉴字"——基于树莓派的智能书法镜》获第 18 届计算机设计大赛浙江省级赛三等奖。',
    accent: 'blue',
    image: '/assets/honors/cs-design-zj-third.jpg',
    weight: 71
  },
  {
    eyebrow: 'MAKER COMPETITION',
    title: '中美青年创客大赛 · 校级一等奖',
    desc: '浙江科技大学中美青年创客大赛一等奖，作品《"以镜鉴字"基于树莓派的智能书法镜》。',
    accent: 'red',
    image: '/assets/honors/maker-zust-first.jpg',
    weight: 68
  },
  {
    eyebrow: 'E-COMMERCE CHALLENGE',
    title: '三创赛 · 校级一等奖',
    desc: '第十六届全国大学生电子商务"创新、创意及创业"挑战赛浙江科技大学校级赛一等奖。',
    accent: 'black',
    image: '/assets/honors/sanchuang-ecommerce-first.jpg',
    weight: 64
  },
  {
    eyebrow: 'MAKER COMPETITION',
    title: '中美青年创客大赛杭州分赛区 · 优胜奖',
    desc: '杭州分赛区主赛道优胜奖，参赛项目《基于树莓派的汉字学习镜》。',
    accent: 'gray',
    image: '/assets/honors/maker-hangzhou-winning.jpg',
    weight: 62
  },
  {
    eyebrow: 'INTELLECTUAL PROPERTY',
    title: '发明专利 · 受理（电梯镜系统）',
    desc: '《一种多维度人机交互的电梯镜系统》发明专利申请获国家知识产权局受理（2025.05）。',
    accent: 'gray',
    image: '/assets/honors/patent-elevator-mirror.jpg',
    weight: 60
  },
  {
    eyebrow: 'INTELLECTUAL PROPERTY',
    title: '发明专利 · 受理（菲涅耳区教学系统）',
    desc: '《一种基于 Wi-Fi 的电磁波及菲涅耳区可视化教学实验系统》发明专利申请获受理（2026.02）。',
    accent: 'gray',
    image: '/assets/honors/patent-wifi-fresnel.jpg',
    weight: 58
  },
  {
    eyebrow: 'INTELLECTUAL PROPERTY',
    title: '实用新型专利 · 受理',
    desc: '《一种基于无线感知与红外传感的门禁装置》专利申请获国家知识产权局受理（2026.04）。',
    accent: 'gray',
    image: '/assets/honors/patent-door-access.jpg',
    weight: 55
  },
  {
    eyebrow: 'SCHOLARSHIP',
    title: '优秀学生奖学金 · 三等奖',
    desc: '2024–2025 学年优秀学生三等奖，学业与竞赛综合表现获校级认可。',
    accent: 'gray',
    image: '/assets/honors/scholarship-third-2024.jpg',
    weight: 52
  },
  {
    eyebrow: 'LANGUAGE CERTIFICATE',
    title: 'CET-4 · 465 分',
    desc: '全国大学英语四级考试 465 分（听力 128 / 阅读 171 / 写作与翻译 166），2023 年 12 月。',
    accent: 'gray',
    image: '/assets/honors/cet4-465.jpg',
    weight: 45
  },
  {
    eyebrow: 'LANGUAGE CERTIFICATE',
    title: '普通话水平测试 · 二级乙等',
    desc: '普通话水平测试 84.5 分，二级乙等（2026 年 3 月，浙江省教育考试院认定）。',
    accent: 'gray',
    image: '/assets/honors/mandarin-level2b.jpg',
    weight: 42
  }
]

export const cmsNav = [
  { key: 'profile',  label: '个人资料', active: false, dot: 'blue-5' },
  { key: 'photos',   label: '照片库',   active: false, dot: 'blue-5' },
  { key: 'edu',      label: '教育经历', active: false, dot: 'blue-4' },
  { key: 'proj',     label: '项目经历', active: true,  dot: 'blue-3' },
  { key: 'comp',     label: '竞赛经历', active: false, dot: 'blue-2' },
  { key: 'honor',    label: '荣誉墙',   active: false, dot: 'blue-1' },
  { key: 'ai',       label: 'AI 设置',  active: false, dot: 'blue-5' }
]
