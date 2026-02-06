# 价值投资选股评分系统

基于本杰明·格雷厄姆价值投资理念的股票评分系统，使用 Next.js 构建。

## 功能特性

- 📊 **多维度评分体系**：包含安全边际、公司质量、股东回报四大类共15项指标
- 🤖 **ML动态权重**：基于A股历史数据机器学习优化的评分权重
- 💾 **历史记录管理**：保存评分历史，支持查询和导出
- 🎨 **现代化UI**：使用 shadcn/ui 组件库，支持深色模式
- 🔐 **用户认证**：基于 NextAuth.js 的用户系统
- 📤 **CSV上传**：支持批量导入股票数据进行评分
- 📥 **结果导出**：一键导出评分结果为CSV文件

## 评分指标

### 安全边际指标（60分）
- 估值合理性(PEG+PB) - 15分
- 负债安全性 - 15分
- 流动性安全边际 - 10分
- 现金安全边际 - 10分
- 资产安全性(NCAV) - 10分

### 公司质量指标（92分）
- 盈利质量(现金比率+核心占比) - 15分
- 资本回报率(ROIC) - 12分
- 去杠杆后ROE - 12分
- 市赚率(PR) - 12分
- 有形市净率 - 10分
- 资本配置纪律 - 7分
- 现金流稳定性 - 12分

### 股东回报指标（25分）
- 股息收益率 - 8分
- 总股东回报率(分红+回购) - 8分
- 可持续增长率 - 9分

### 风险调整（0~-30分）
- 资不抵债检测
- 商誉过高检测
- 应收账款异常检测
- 净利润与现金流双亏检测
- 等8项财务风险检查

## 快速开始

### 本地开发

1. **克隆项目**
```bash
cd /Users/yanhui/Downloads/value-investment-scorer
```

2. **安装依赖**
```bash
npm install
```

3. **初始化数据库**
```bash
npx prisma generate
npx prisma db push
```

4. **启动开发服务器**
```bash
npm run dev
```

5. **访问应用**
打开浏览器访问 [http://localhost:3000](http://localhost:3000)

### 部署到 Vercel

1. **推送代码到 GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

2. **在 Vercel 导入项目**
- 访问 [vercel.com](https://vercel.com)
- 点击 "New Project"
- 导入你的 GitHub 仓库
- Vercel 会自动检测 Next.js 并配置

3. **配置环境变量**（可选）
在 Vercel 项目设置中添加：
- `DATABASE_URL`（如需使用生产数据库，推荐 PostgreSQL）
- `NEXTAUTH_SECRET`（生成随机字符串）
- `NEXTAUTH_URL`（你的域名）

## CSV文件格式

### 必需字段
- 公司名称 / company_name
- 当前股价 / stock_price
- 市值 / market_cap
- 总股本 / total_shares
- 市盈率(P/E) / pe_ratio
- 市净率(P/B) / pb_ratio

### 推荐字段
- 净利润 / net_income
- 经营现金流 / operating_cash_flow
- 总资产 / total_assets
- 总负债 / total_liabilities
- 净资产收益率(ROE) / roe
- 等...

### 示例CSV格式
```csv
公司名称,当前股价,市值,总股本,市盈率(P/E),市净率(P/B),净利润,经营现金流,总资产,总负债,净资产收益率
贵州茅台,1680.50,2100000,1250,28.5,9.2,720000,650000,2800000,800000,28.5
```

## 技术栈

- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **组件**: shadcn/ui (Radix UI)
- **数据库**: SQLite (开发) / PostgreSQL (生产推荐)
- **ORM**: Prisma
- **认证**: NextAuth.js
- **CSV解析**: PapaParse
- **部署**: Vercel

## 项目结构

```
value-investment-scorer/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/          # API 路由
│   │   ├── auth/         # 认证页面
│   │   └── ...
│   ├── components/       # React 组件
│   │   ├── ui/           # shadcn/ui 基础组件
│   │   ├── dashboard.tsx
│   │   ├── csv-uploader.tsx
│   │   └── ...
│   └── lib/              # 工具函数
│       ├── scoring/      # 评分逻辑
│       ├── auth.ts       # 认证配置
│       ├── prisma.ts     # 数据库客户端
│       └── utils.ts
├── prisma/
│   └── schema.prisma     # 数据库模型
└── package.json
```

## 使用说明

1. **注册/登录**
   - 首次使用输入邮箱和密码即可自动注册
   - 之后使用相同凭据登录

2. **上传CSV**
   - 点击"上传评分"标签
   - 选择评分模式（推荐使用ML动态加权）
   - 拖拽或选择CSV文件
   - 点击"开始评分"

3. **查看结果**
   - 自动跳转到"评分结果"标签
   - 查看每只股票的详细评分
   - 点击"查看详细评分"展开所有指标
   - 点击"导出结果"下载CSV

4. **历史记录**
   - 点击"历史记录"标签
   - 查看所有历史评分记录
   - 支持分页浏览和删除

## 评分建议等级

- **强烈建议关注**（得分率 ≥77%）：优质价值股，深度安全边际
- **具备安全边际**（得分率 62-77%）：值得深入研究
- **符合价值投资标准**（得分率 44-62%）：可关注
- **部分达标**（得分率 26-44%）：需谨慎评估
- **不符合标准**（得分率 <26%）：不建议投资

## 常见问题

**Q: CSV文件有哪些要求？**
A: 支持中英文列名，数值字段支持千分位逗号。必需字段包括：公司名称、当前股价、市值、市盈率、市净率。

**Q: ML加权评分和原始评分有什么区别？**
A: ML加权评分使用机器学习优化的权重，更准确地反映各指标的重要性，满分100分。原始评分使用简单相加，满分165分。

**Q: 如何理解财务风险调整？**
A: 系统会自动检测8项财务风险（如资不抵债、商誉过高等），发现问题会扣分，最低可扣至-5分。

**Q: 可以在没有数据的情况下试用吗？**
A: 可以！项目包含测试数据模板，你可以基于模板创建自己的CSV文件。

## 许可证

MIT

## 贡献

欢迎提交 Issue 和 Pull Request！
