# 贡献指南

感谢你对 AI Hub 项目的关注！欢迎通过以下方式贡献。

## 添加新的中转站

1. Fork 本仓库
2. 编辑 `data/stations.json` 文件
3. 按照以下格式添加新条目：

```json
{
  "name": "中转站名称",
  "slug": "中转站slug（kebab-case，用于URL）",
  "url": "https://example.com",
  "description": "简短描述（1-2句话）",
  "models": ["gpt-4o", "claude-3.5-sonnet"],
  "pricing": {
    "gpt-4o": {
      "input": 0.015,
      "output": 0.06,
      "unit": "per 1M tokens"
    }
  },
  "features": ["流式输出", "兼容 OpenAI 格式", "国内直连"],
  "rating": 4.5,
  "paymentMethods": ["支付宝", "微信"],
  "docUrl": "https://docs.example.com",
  "updatedAt": "2026-07-04"
}
```

4. 提交 Pull Request

## 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 中转站显示名称 |
| slug | string | 是 | URL 标识符（小写字母、数字、连字符） |
| url | string | 是 | 官网地址 |
| description | string | 是 | 简短描述 |
| models | string[] | 是 | 支持的模型列表 |
| pricing | object | 是 | 各模型的定价信息 |
| features | string[] | 是 | 特性标签列表 |
| rating | number | 是 | 评分（0-5） |
| paymentMethods | string[] | 是 | 支付方式列表 |
| docUrl | string | 否 | 接入文档地址 |
| updatedAt | string | 是 | 最后更新日期（YYYY-MM-DD） |

## 更新现有信息

如需更新某个中转站的信息（价格变动、新增模型等），直接修改 `data/stations.json` 中对应条目的字段即可。

## 审核流程

1. 提交 PR 后，维护者会在 3 个工作日内审核
2. 审核通过后合并并自动重新部署
3. 如有问题，会在 PR 中留言说明

## 注意事项

- 请确保提交的信息准确可靠
- 定价信息请以官方公布的价格为准
- 评分应客观反映服务质量
- 不要提交虚假或误导性信息
