# AI 中转站聚合平台 — 设计系统

## 设计理念

本项目是一个 AI 中转站信息聚合与对比平台，面向开发者和 AI 应用使用者。设计风格追求"简洁、科技、可信赖"，以深色模式为主基调，强调数据可读性和信息密度，同时保持视觉舒适度。

---

## 配色系统

### 主色调

| 色彩角色 | 色值 | 用途 |
|---------|------|------|
| 主背景 | `#0a0e1a` | 页面主背景 |
| 次背景 | `#111827` | 卡片、面板背景 |
| 边框 | `#1e293b` | 分割线、卡片边框 |
| 主色 | `#3b82f6` (blue-500) | 主操作、链接、强调 |
| 主色悬停 | `#2563eb` (blue-600) | 悬停状态 |
| 主色浅 | `#1e3a5f` | 主色背景变体 |
| 强调色 | `#06b6d4` (cyan-500) | 数据高亮、活跃状态 |
| 成功 | `#10b981` (emerald-500) | 可用状态、最低价格高亮 |
| 警告 | `#f59e0b` (amber-500) | 警告提示 |
| 错误 | `#ef4444` (red-500) | 不可用状态、错误 |

### 文字色

| 色彩角色 | 色值 | 用途 |
|---------|------|------|
| 主文字 | `#f1f5f9` (slate-100) | 标题、正文 |
| 次文字 | `#94a3b8` (slate-400) | 描述、辅助信息 |
| 弱文字 | `#64748b` (slate-500) | 时间戳、占位符 |
| 主色文字 | `#60a5fa` (blue-400) | 链接、价格 |

### 浅色模式（可选支持）

| 色彩角色 | 色值 |
|---------|------|
| 主背景 | `#f8fafc` (slate-50) |
| 次背景 | `#ffffff` |
| 边框 | `#e2e8f0` (slate-200) |
| 主文字 | `#0f172a` (slate-900) |
| 次文字 | `#64748b` (slate-500) |

---

## 字体系统

### 字体族

- **UI 文字**: `Inter`, `-apple-system`, `BlinkMacSystemFont`, `"Segoe UI"`, `Roboto`, `"Helvetica Neue"`, `Arial`, `sans-serif`
- **等宽/数据**: `"JetBrains Mono"`, `"Fira Code"`, `"Cascadia Code"`, `Consolas`, `monospace`
- **中文**: `Inter` 不含中文，回退到 `"PingFang SC"`, `"Microsoft YaHei"`, `"Noto Sans SC"`, `sans-serif`

### 字号层级

| 层级 | Tailwind | px | 行高 | 字重 | 用途 |
|------|----------|-----|------|------|------|
| Display | `text-4xl` | 36px | 1.1 | 800 | 首页 Hero 标题 |
| H1 | `text-3xl` | 30px | 1.2 | 700 | 页面主标题 |
| H2 | `text-2xl` | 24px | 1.3 | 700 | 区块标题 |
| H3 | `text-xl` | 20px | 1.4 | 600 | 卡片标题 |
| Body | `text-base` | 16px | 1.5 | 400 | 正文 |
| Small | `text-sm` | 14px | 1.5 | 400 | 辅助文字 |
| Caption | `text-xs` | 12px | 1.4 | 400 | 标签、时间戳 |
| Data | `text-sm font-mono` | 14px | 1.4 | 500 | 价格、数据值 |

---

## 间距系统

基于 4px 基础单位：

| 名称 | Tailwind | px | 用途 |
|------|----------|-----|------|
| xs | `gap-1` | 4px | 紧凑间距（标签间） |
| sm | `gap-2` | 8px | 组件内元素间距 |
| md | `gap-4` | 16px | 卡片内间距、表单字段间 |
| lg | `gap-6` | 24px | 区块间距 |
| xl | `gap-8` | 32px | 页面区块间距 |
| 2xl | `gap-12` | 48px | 大区块间距 |

### 容器

- 最大宽度: `max-w-7xl` (1280px)
- 两侧内边距: `px-4` (移动端) / `px-6` (平板) / `px-8` (桌面)
- 卡片内边距: `p-5` (20px)
- 卡片间距: `gap-5` (20px)

---

## 圆角系统

| 名称 | Tailwind | px | 用途 |
|------|----------|-----|------|
| sm | `rounded` | 4px | 小元素（标签、badge） |
| md | `rounded-lg` | 8px | 按钮、输入框 |
| lg | `rounded-xl` | 12px | 卡片 |
| full | `rounded-full` | - | 头像、图标按钮 |

---

## 阴影系统

| 名称 | Tailwind 值 | 用途 |
|------|------------|------|
| 卡片 | `shadow-lg shadow-black/20` | 卡片默认 |
| 悬停 | `shadow-xl shadow-black/30` | 卡片悬停 |
| 浮层 | `shadow-2xl shadow-black/40` | 弹窗、下拉 |

---

## 组件风格

### 卡片 (StationCard)

- 背景: `bg-[#111827]` 次背景
- 边框: `border border-[#1e293b]`
- 圆角: `rounded-xl` (12px)
- 内边距: `p-5`
- 悬停: `hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10` + `transition-all duration-200`
- 布局: 垂直排列 — 顶部站名+评分，中间描述，底部模型标签+价格

### 按钮

- 主按钮: `bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors`
- 次按钮: `bg-transparent border border-slate-700 hover:border-slate-500 text-slate-300 rounded-lg px-4 py-2 text-sm font-medium transition-colors`
- 文字按钮: `text-blue-400 hover:text-blue-300 text-sm`

### 标签 (Badge)

- 模型标签: `bg-slate-800 text-slate-300 rounded px-2 py-0.5 text-xs font-mono`
- 特性标签: `bg-cyan-500/10 text-cyan-400 rounded px-2 py-0.5 text-xs`
- 评分标签: `bg-amber-500/10 text-amber-400 rounded px-2 py-0.5 text-xs font-medium`

### 输入框

- `bg-[#0a0e1a] border border-slate-700 focus:border-blue-500 rounded-lg px-4 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors`

### 表格

- 表头: `bg-[#0a0e1a] text-slate-400 text-xs uppercase tracking-wider`
- 行: `border-t border-slate-800 hover:bg-slate-800/30`
- 单元格: `px-4 py-3 text-sm`
- 价格高亮: `text-emerald-400 font-medium`

### 导航栏

- 背景: `bg-[#0a0e1a]/80 backdrop-blur-md border-b border-slate-800`
- 高度: `h-16` (64px)
- 内容: 左侧 Logo + 站名，右侧导航链接 + GitHub 图标

---

## 动画/过渡

| 名称 | 时长 | 缓动 | 用途 |
|------|------|------|------|
| 快速 | 150ms | `ease-out` | 按钮悬停、颜色变化 |
| 正常 | 200ms | `ease-out` | 卡片悬停、边框变化 |
| 慢速 | 300ms | `ease-in-out` | 页面过渡、展开收起 |

---

## 响应式断点

遵循 Tailwind 默认断点：

- `sm`: 640px (大手机)
- `md`: 768px (平板竖屏)
- `lg`: 1024px (平板横屏/小笔记本)
- `xl`: 1280px (桌面)
- `2xl`: 1536px (大屏)

网格列数：
- 移动端 (< md): 1 列
- 平板 (md - lg): 2 列
- 桌面 (>= lg): 3 列
