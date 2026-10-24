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
  { key: 'comp', label: '竞赛经历', dot: 'blue-1' },
  { key: 'honor', label: '荣誉墙', dot: 'blue-1' }
]

export const heroTags = ['智能镜负责人', '专利 4 项 · 软著 1 项', '国家级一等奖', 'IEEE 会议论文', '图软实习 · 驻场交付']

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
    badge: '驻场实习',
    title: '公交智能化双项目',
    desc: '福安智能调度系统 + 福鼎电子站牌，驻场负责进度与交付。',
    meta: '进度管理 · 验收交付'
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
  },
  // 技能清单：熟练度自评口径来自本人确认，只列可验证的工具与场景
  skills: [
    { group: '项目管理', items: ['钉钉敏捷 Sprint', 'Jira / Confluence', '看板管理', '验收与周报文档'] },
    { group: 'AI 辅助研发', items: ['Cursor', 'Windsurf', 'GitHub Copilot', 'Claude Code'] },
    { group: '编程语言', items: ['Python', 'C / C++'] },
    { group: '硬件与嵌入式', items: ['树莓派 Raspberry Pi', 'ESP32', '传感器 / 继电器调试'] },
    { group: '知识管理', items: ['Obsidian', 'Notion', 'Markdown / LaTeX'] }
  ],
  // 组织与领导力经历
  orgs: [
    { role: '副社长', name: '「AI+创客」社团', desc: '管理 20+ 人团队，组织 10+ 场技术活动（分享会、黑客马拉松），建立 5+ 个知识库与标准化活动流程' },
    { role: '宣传委员', name: '科创社', desc: '全权负责参赛作品展示材料撰写与排版，统筹物理实验项目开发节奏与技术对接分工' },
    { role: '学员', name: '「蓝色空间」科技创新培养计划', desc: '学校科技创新人才培养计划学员' },
    { role: '学员', name: '「名师工作室」', desc: '跟随导师参与科研项目与创新实践' },
    { role: '学习委员', name: '班级', desc: '日常事务统筹与学术资料结构化整理' }
  ]
}

// 项目经历 · 编辑目录条目
// 每条的阅读顺序对应面试官的判断路径：
//   sub（够不够格）→ insight（有没有判断力）→ points（能力边界）→ result（可否验证）→ attachments（原件）
// points 多行文本，每行一条要点；weight 为含金量分值（0-100），列表按此降序
export const projects = [
  {
    title: '智能镜 Smart Mirror',
    sub: '国家级大创 202511057032 · 负责人 1/3 · 2025.03–2026.05',
    tag: { text: '项目负责人', color: 'black' },
    period: '2025.03 – 2026.05',
    role: '项目负责人（排名 1/3）',
    insight: '通用智能镜已经饱和，真正的缺口是国际学生认汉字——把镜子从「信息屏」改成「学习工具」。',
    points: '收敛到「笔顺跟读」单一核心场景，砍掉日程、天气等通用功能\n针对镜面成像重做界面层级：镜像反射下的字号、对比度与信息密度单独调过\n拉通软硬件三方：React/Electron 前端 + Python/JS 双后端 + 树莓派，跟进两轮原型迭代',
    result: '大创结题验收通过 · 软著 1 项（2026SR0902267）· 发明专利受理 1 项 · 春萌计划同期结题',
    weight: 92,
    attachments: [
      { name: '大创立项公示', kind: 'pdf', path: '/assets/projects/proj-dachuang-approval.pdf', preview: '' },
      { name: '大创结题验收通知', kind: 'pdf', path: '/assets/projects/proj-dachuang-closure.pdf', preview: '' },
      { name: '春萌立项通知', kind: 'pdf', path: '/assets/projects/proj-chunmeng-approval.pdf', preview: '' },
      { name: '春萌结题通知', kind: 'pdf', path: '/assets/projects/proj-chunmeng-closure.pdf', preview: '' }
    ]
  },
  {
    title: '福安智能调度系统 · 交付',
    sub: '实习 · 杭州图软科技 · 驻场进度负责人 · 2026.07–至今',
    tag: { text: '驻场实习', color: 'black' },
    period: '2026.07 – 至今',
    role: '驻场项目进度负责人（实习）',
    insight: '项目经理离场后交付不能停——进度卡住先穷尽自查，再沿权力链升级：同级催不动就向上，向上无效就借力拿合同的人。',
    points: '协调公交公司、甲方中标公司、研发与实施共 5 方，用钉钉 AI 表格看板管理 Sprint 与周报，10+ 并行任务每日扫卡点\n车载视频连不上先自查两轮：通道数干扰与车位网络两个假设分别做控制变量实测，穷尽后上报总工定位白名单根因，沉淀排障文档\n白名单跨组织阻塞走三级升级：移动负责人 → 上一级催办 → 借力业主公交公司施压，配置很快落地\n200+ 台车载设备 IP 批量配置：先要全量车辆线路数据做路线规划，To-Do 逐台打勾、两人并行，配不了的跳过并记录后置处理\n初验前 2 周盘点发现文档缺齐，识别「文档依赖页面」的阻塞链，调整团队优先级、按验收日期倒排销项\n初验通过后主动重启节奏：文档收尾与业主新需求（登记 → 评估 → 排期）双线并行',
    result: '调度中心联通 · 3 辆公交车 + 1 条线路全流程测试通过 · 初验通过',
    weight: 90,
    attachments: []
  },
  {
    title: '多模态门禁识别系统',
    sub: '浙江省物理实验与科技创新竞赛 · 核心成员 · 2025',
    tag: { text: '省级二等奖', color: 'black' },
    period: '2025',
    role: '核心成员 · 方案与硬件',
    insight: '门禁真正的痛点是「腾不出手」，不是识别率——把开门的动作压到走过去这一下。',
    points: '定下 Wi-Fi CSI 步态 + 红外传感双模态方案，解决单模态的误触发\n负责硬件选型与联调，完成「一走即通」原型',
    result: '浙江省物理实验与科技创新竞赛二等奖',
    weight: 85,
    attachments: []
  },
  {
    title: '福鼎电子站牌更新 · 交付',
    sub: '实习 · 杭州图软科技 · 项目前期负责人 · 2026.08–至今',
    tag: { text: '驻场实习', color: 'black' },
    period: '2026.08 – 至今',
    role: '项目前期负责人（实习）',
    insight: '接手的是被原供应商做砸的项目——先立问题基线再定交付节奏；拿一手数据定义问题，不坐在办公室猜。',
    points: '梳理原供应商交付问题基线（设备报错率高、外观工艺与渲染图不符），输出问题清单作为整改依据\n与结构工程师分工完成 32 个站点勘察：针对竖排站名识别差、透视畸变做拍摄约束与方向纠正，用正确站点清单做 AI 记忆纠错\n1 天完成全部站点信息数字化，开发同学据此快速录入\n据此制定分阶段交付排期：首批 7 个站点优先安装，施工分批推进、每日核对完成量\n管理与施工方协作的同时亲手调试设备，把验收标准落在实测过的细节上',
    result: '32 站点勘察 1 天数字化交付 · 首批 7 站优先安装 · 施工分批推进中',
    weight: 84,
    attachments: []
  },
  {
    title: '7点烧烤 · 语音点单记账 App',
    sub: '个人自研 · iOS + Android 双端 · 2026',
    tag: { text: '自研产品', color: 'black' },
    period: '2026',
    role: '独立产品 · 需求 / 设计 / 开发全包',
    insight: '识别不是这个产品的差异化——摊主真正的痛点在「菜名能不能对上」和「错一单要不要吵架」，工程力全部投到业务层。',
    points: 'build vs buy：语音识别直接用系统键盘自带能力，不自研引擎；把工程力挪到菜名映射与兜底机制\n对钱的严谨：有未命中行时总额不计算、不可落单，必须人工处理完才出总价——宁可未命中，不许错认\n业务映射：别名词库（烤腰子 = 大腰子/腰子）+ 48 道菜 110 条语料测试，验证「语音文本 → 菜品」匹配层\n营业日口径 12:00–12:00：摊位跨零点营业，凌晨订单必须算进前一天，否则老板第二天对账会错\n砍需求保 MVP：删售罄标记、批量导入、挂账、作废功能，订单状态机收敛为 OPEN/PAID\nv1.6 删掉识别确认页，保存直落单、未命中行留在明细内处理，支撑「录入 < 20 秒」目标',
    result: 'PRD v1.0 → v1.6 十次修订 · 真实烧烤摊实测验证',
    outputs: ['PRD v1.6（含修订记录）', '16 张原型导出图', '菜品匹配语料测试报告', 'iOS / Android 双端代码'],
    weight: 82,
    attachments: []
  },
  {
    title: 'Lazy To Do · AI 捕捉式待办 App',
    sub: '个人自研 · Flutter + Kotlin · 已出 APK · 2026',
    tag: { text: '自研产品', color: 'black' },
    period: '2026',
    role: '独立产品 · 需求 / 设计 / 开发全包',
    insight: '建了待办也不看是提醒的失效，不是用户的错——强制力要「划不掉但不烦人」，靠存在感不靠轰炸。',
    points: '人机分工：AI 分类结果一律进「待确认队列」，人工确认才生效——AI 提效、人兜底\n核心差异化：强制提醒三级分级（L0 静默 / L1 普通通知 / L2 常驻不可划），完成是唯一出口，但无重弹、无全屏\n越用越准：用户每次改类型作为反馈回灌 AI，分类纠错随使用收敛\n方案评估：灵动岛评估后「不做」——Android 无公开 API，给出常驻通知 / 悬浮胶囊 / 焦点通知三级替代\n预期管理进文案：同步时效写进 UI（「录音内容最迟 25 分钟内出现」）',
    result: 'PRD v0.5 · 5 屏交互原型 · 可安装 APK',
    outputs: ['PRD v0.5（含数据模型与版本规划）', '5 屏交互原型', 'Flutter / Kotlin 双端代码', '可安装 APK'],
    weight: 78,
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
    period: '2025',
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
    period: '2025',
    role: '作品展示与评委问答',
    points: '携校级一等奖作品晋级杭州分赛区\n完成作品展示与评委问答环节',
    result: '中美青年创客大赛杭州分赛区优胜奖',
    weight: 62,
    attachments: []
  },
  {
    title: '中国大学生计算机设计大赛 · 校赛',
    sub: '个人作品 · 树莓派智能书法镜',
    tag: { text: '校级二等奖', color: 'gray' },
    period: '2025',
    role: '作品设计与开发',
    points: '以《"以镜鉴字"——基于树莓派的智能书法镜》参加浙江科技大学校赛\n校赛获奖后进入浙江省级赛',
    result: '浙江科技大学校赛二等奖',
    weight: 48,
    attachments: []
  },
  {
    title: '物理实验与科技创新校内选拔赛',
    sub: '个人作品 · 基于大模型的多语言智镜',
    tag: { text: '校级三等奖', color: 'gray' },
    period: '2025',
    role: '作品设计与开发',
    points: '以《基于大模型的多语言智镜》参加校内选拔赛',
    result: '浙江科技大学物理实验与科技创新校内选拔赛三等奖',
    weight: 46,
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
  { key: 'comp',     label: '竞赛经历', active: false, dot: 'blue-1' },
  { key: 'honor',    label: '荣誉墙',   active: false, dot: 'blue-1' },
  { key: 'ai',       label: 'AI 设置',  active: false, dot: 'blue-5' }
]
