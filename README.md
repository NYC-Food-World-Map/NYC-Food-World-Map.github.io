# 纽约 · 美食世界地图

公开网站：[https://nyc-food-world-map.github.io/](https://nyc-food-world-map.github.io/)

仓库：[https://github.com/NYC-Food-World-Map/NYC-Food-World-Map.github.io](https://github.com/NYC-Food-World-Map/NYC-Food-World-Map.github.io)

访问统计使用 [GoatCounter](https://www.goatcounter.com/)（站点码 `nycfoodworldmap`）。在 GoatCounter 设置里需开启 **Allow adding visitor counts on your website**，页面才会显示累计访问。

这是一个**网站**（Next.js App Router），用浏览器打开。本地命令只用于开发、测试和构建，不是桌面应用，也不在运行时抓取 Google / Yelp。

当前第一版是静态 JSON 驱动：不需要数据库、登录或任何付费 API Key。

## 环境要求

- Node.js 20 或以上
- npm 10 或以上

## 安装与本地预览

这是一个用浏览器打开的网站，不是桌面程序。

在项目根目录：

```bash
npm install
npm run dev
```

如果本机访问 `registry.npmjs.org` 失败，可使用仓库里的 `.npmrc` 镜像，或改用：

```bash
pnpm install
pnpm dev
```

然后在浏览器打开 [http://localhost:3000](http://localhost:3000)。

## 双击打开的本地网页

不需要启动服务器时，生成一个自包含 HTML，用 Finder 双击即可：

```bash
pnpm standalone
```

生成文件：[`纽约世界美食地图.html`](纽约世界美食地图.html)（完整地图）。[`index.html`](index.html) 仅为 GitHub Pages 根路径跳转，不再重复整页内容。数据变更后重新运行上述命令即可更新。

主要页面：

- `/` 世界地图（默认首页，几乎全屏，可滚轮/按钮缩放）
- `/list` 国家列表、搜索和筛选（默认小众菜系）
- `/regions` 五大区与餐饮走廊（统计从 `data/restaurants/*.json` 现算）

生产构建：

```bash
npm run build
npm start
```

同样用浏览器访问 [http://localhost:3000](http://localhost:3000)。

## 测试、校验和构建

```bash
npm run lint
npm run test
npm run data:validate
npm run data:duplicates
npm run build
```

## 数据文件位置

| 文件 | 用途 |
| --- | --- |
| `data/countries.json` | 199 个国家；`cuisineTier` 区分小众 / 大众 |
| `data/restaurants/*.json` | 按菜系大洲拆分的**纽约**餐厅，共 6 个文件 |
| `data/sources.json` | 来源类型约定 |
| `data/research-updates.example.json` | ChatGPT 交接文件示例 |

页面代码不得内嵌餐厅名单。业务逻辑在 `src/lib/`，界面在 `src/components/`。

## 如何导入 ChatGPT 的研究结果

1. 把 [`docs/chatgpt-research-prompt.md`](docs/chatgpt-research-prompt.md) 里的 prompt 发给 ChatGPT，只改「本次任务」。
2. 把 ChatGPT 输出的 JSON 存成文件，例如 `data/research-update.json`。字段说明见 [`docs/research-handoff.md`](docs/research-handoff.md)。
2. 先预览 diff，确认没有写错国家、来源或关店证据。
3. 人工确认后再合并。

### 预览更新 diff（dry run，不会写文件）

```bash
npm run data:preview -- data/research-updates.example.json
```

或：

```bash
npm run data:preview -- data/research-update.json
```

### 确认合并

没有 `--confirm` 时**不会**写入 `data/restaurants/*.json`：

```bash
npm run data:merge -- data/research-update.json
```

确认无误后再写入：

```bash
npm run data:merge -- data/research-update.json --confirm
```

合并后用 Git 审查 diff，再提交。已关闭餐厅会保留为历史记录，不会从 JSON 里删掉。

## 如何添加国家

国家目录已覆盖 199 国。若要增补或调整小众 / 大众标记：

1. 修改 `scripts/generate-countries.py` 后重新生成 `data/countries.json`，或直接编辑该文件并填写 `cuisineTier`。
2. 运行 `npm run data:validate`。
3. 若该国应出现在世界地图上，确认 `src/lib/iso-numeric-map.ts` 已有对应数字代码。毛里求斯等小岛屿可用地图页的国家下拉框选择。

## 如何添加餐厅

优先让 ChatGPT 按交接格式输出 JSON，走预览 / 确认合并。合并后会按菜系大洲写入对应文件，餐厅本身仍是纽约店。

若直接编辑大洲文件，例如 `data/restaurants/europe.json`：

1. 6 个大洲文件始终存在；北美、大洋洲目前可以是空数组。
2. 每条记录必须有纽约 `borough`。
3. `countryCodes` 必须同属一个大洲。
4. 每个国家最多**展示** 3 家，但原始数据可以超过 3 家。
5. `sources` 不能为空，必须有 URL 和 `YYYY-MM-DD`。
6. 评分必须按平台分条保存，不要写综合平均分。
7. 缺少可靠地址或营业状态时使用 `unverified`。
8. 运行 `npm run data:validate` 和 `npm run data:duplicates`。

## 为什么不在前端抓取 Google、Yelp

本网站只展示已经人工核验的数据。自动抓取会遇到验证码、服务条款限制，也无法代替“专门菜系 / 区域兼营”的编辑判断。评分、地址和营业状态必须来自可追溯来源，不能由模型或前端脚本伪造。

## 哪些字段必须人工确认

- 这家店是否真的属于该国家菜系
- `specialist` 还是 `regional`
- `open` / `unverified` / `temporarily_closed` / `closed`
- 地址、Borough、neighborhood
- 各平台评分和评价数
- 经纬度（没有可靠来源就留空，不要编造）
- 来源 URL 和核验日期

## 部署

### Vercel

1. 把仓库推送到 GitHub / GitLab。
2. 在 Vercel 导入该仓库。
3. 构建命令：`npm run build`，输出目录保持 Next.js 默认即可。
4. 不需要配置环境变量或 API Key。

### Cloudflare Pages

两种方式：

1. **静态导出**：`STATIC_EXPORT=true npm run build`，将生成的 `out/` 作为静态站点发布。
2. **Next 适配器**：使用 Cloudflare 的 Next.js 构建支持，构建命令仍是 `npm run build`。

部署后打开的是网页 URL，不是本地程序。

## 当前数据状态

仓库里现有 256 家纽约餐厅记录，按菜系大洲分文件存放。中东与中亚计入亚洲。各洲菜单已按 2026-09-03 的研究更新；没有可靠结果时会显示“暂无可确认的专门餐厅”。继续用 ChatGPT 按 [`docs/chatgpt-research-prompt.md`](docs/chatgpt-research-prompt.md) 补充即可。

整份大洲菜单（`generatedAt` + `countries[]`）放到 `data/restaurants/<洲>.json` 后，运行：

```bash
pnpm data:import-menu -- all
```

研究原文会归档到 `data/research/`，再写成规范餐厅记录。
