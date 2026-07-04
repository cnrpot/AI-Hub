# AI Hub — AI 中转站信息聚合平台

一个开源的 AI API 中转站信息聚合与对比平台，帮助开发者快速浏览、筛选、对比各家 AI API 中转服务的模型支持、价格和特性。

## 功能

- 中转站列表展示：卡片形式展示所有收录的中转站
- 搜索与筛选：按名称/描述搜索，按模型分类筛选，多种排序方式
- 中转站详情页：完整定价表格、模型列表、特性展示
- 多站对比：并排对比多个中转站的模型覆盖和价格，最低价格高亮
- SEO 友好：独立页面 meta 标签、sitemap
- 响应式设计：移动端、平板、桌面端适配
- 深色模式：科技感深色主题

## 技术栈

- [Astro 5](https://astro.build) — 静态站点生成器
- [React 18](https://react.dev) — 交互组件（Islands 架构）
- [Tailwind CSS 3](https://tailwindcss.com) — 样式
- [lucide-react](https://lucide.dev) — 图标
- 数据源：JSON 文件（`data/stations.json`）

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

开发服务器默认运行在 `http://localhost:4321`。

## 部署

本项目为纯前端静态站点，构建后 `dist/` 目录包含所有静态文件，可部署到任何静态文件服务器。

### Nginx 示例

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Cloudflare Pages / Vercel

- 构建命令：`npm run build`
- 输出目录：`dist`

## 如何贡献

欢迎通过 Pull Request 添加新的中转站信息或更新现有数据。详见 [CONTRIBUTING.md](./CONTRIBUTING.md)。

## 许可证

[MIT License](./LICENSE)
