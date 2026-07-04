# AI 中转站聚合平台 — UI 实现提示词

## 美学原则

- **深色科技风**：以 `#0a0e1a` 为页面主背景，`#111827` 为卡片背景，营造专业技术氛围
- **信息层次清晰**：通过颜色深浅、字号大小、间距递进建立视觉层次
- **数据可读性优先**：价格、模型名等数据用 JetBrains Mono 等宽字体，便于横向对比
- **克制使用色彩**：主体为灰蓝系，仅在关键操作和数据高亮处使用蓝/青/绿色
- **微交互**：卡片悬停时边框变蓝 + 轻微上移，过渡 200ms ease-out

## 技术栈

- Astro 5.x 静态站点 + React 18 Islands（仅交互组件用 React）
- Tailwind CSS 3.x（所有样式用 Tailwind 工具类）
- lucide-react 图标库
- 数据源：JSON 文件，构建时读取

## 配色速查

```
背景: bg-[#0a0e1a]          卡片: bg-[#111827]
边框: border-[#1e293b]      主色: blue-500 / blue-400
强调: cyan-500              成功: emerald-500
主文字: slate-100           次文字: slate-400
弱文字: slate-500           价格高亮: emerald-400
```

## 页面实现任务

### 1. 首页 (/)

**Hero 区域：**
- 大标题 "AI 中转站导航" + 副标题描述
- GitHub 链接按钮（ghost 样式）
- 简洁的背景装饰（渐变光晕）

**工具栏：**
- 搜索框（左侧，占主要宽度）
- 模型筛选下拉（多选）
- 排序下拉
- 结果计数文字

**卡片网格：**
- `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5`
- 每张卡片：站名 + 评分 → 描述 → 模型标签行 → 底部价格区间 + 模型数
- 卡片可勾选（对比功能），左上角复选框

### 2. 详情页 (/stations/[slug])

- 顶部信息卡片：站名、描述、官网按钮、评分、更新时间
- 定价表格：模型名 | 输入价格 | 输出价格 | 计费单位
- 模型标签云
- 特性列表
- 面包屑导航

### 3. 对比页 (/compare)

- 顶部：已选中转站数 + 清空按钮
- 对比表格：维度为行，站点为列
- 模型覆盖矩阵
- 最低价格绿色高亮
- 空状态引导

## 组件清单

| 组件 | 类型 | 说明 |
|------|------|------|
| Layout | .astro | 全局布局：nav + footer + slot |
| Navbar | .astro | 顶部导航栏 |
| Footer | .astro | 底部信息 |
| StationCard | .astro | 中转站卡片（纯展示） |
| StationGrid | .astro | 卡片网格容器 |
| SearchToolbar | React | 搜索+筛选+排序工具栏（client:load） |
| PricingTable | .astro | 定价表格 |
| ModelBadge | .astro | 模型标签 |
| FeatureBadge | .astro | 特性标签 |
| CompareTable | React | 对比表格（client:load） |
| CompareCheckbox | React | 卡片勾选框（client:idle） |
| EmptyState | .astro | 空状态提示 |
