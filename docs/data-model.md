# 数据模型

内容数据放在仓库根目录的 `data/`，页面只读取校验后的结果。餐厅始终是纽约市的店；JSON 按**菜系所属大洲**拆分，不是按美国州拆分。

## Country

| 字段 | 说明 |
| --- | --- |
| `code` | ISO 3166-1 alpha-2，例如 `GE` |
| `nameZh` | 中文名 |
| `nameEn` | 英文名 |
| `flag` | 旗帜 emoji |
| `region` | `欧洲` / `非洲` / `加勒比 / 拉美` / `亚洲` / `北美` / `大洋洲` |
| `cuisineTier` | `niche`（小众菜系）或 `mainstream`（大众菜系） |

当前目录共 199 个国家：原先 55 国为 `niche`，其余为 `mainstream`。列表页和地图默认筛选小众菜系。国家目录由 `scripts/generate-countries.py` 生成。

## Restaurant

每个大洲一个文件，全部存放纽约餐厅：

| 文件 | 大洲 |
| --- | --- |
| `data/restaurants/europe.json` | 欧洲 |
| `data/restaurants/africa.json` | 非洲 |
| `data/restaurants/caribbean-latin-america.json` | 加勒比 / 拉美 |
| `data/restaurants/asia.json` | 亚洲（含中东与中亚） |
| `data/restaurants/north-america.json` | 北美 |
| `data/restaurants/oceania.json` | 大洋洲 |

网站通过 `src/lib/restaurant-data.ts` 分别 import 这 6 个文件；校验脚本也会逐个读取。一家餐厅的 `countryCodes` 必须同属一个大洲。

| 字段 | 说明 |
| --- | --- |
| `id` | 稳定 ID，建议使用小写短横线 |
| `countryCodes` | 至少一个国家代码；一家店可以属于多个同大洲国家 |
| `name` | 对外显示名称 |
| `classification` | `specialist` 或 `regional` |
| `classificationNote` | 可选，人工说明为什么这样分类 |
| `status` | `open` / `temporarily_closed` / `closed` / `unverified` |
| `borough` | 纽约五大区之一 |
| `neighborhood` | 社区名 |
| `address` | 可选；缺可靠地址时不要编造 |
| `latitude` / `longitude` | 必须成对出现；没有可靠来源就省略 |
| `descriptionZh` | 中文说明 |
| `ratings` | 可选，按平台分条，不计算平均分 |
| `sources` | 至少一条，必须含 URL 和核验日期 |
| `lastVerifiedAt` | `YYYY-MM-DD` |
| `verificationNote` | 可选人工备注 |
| `isExample` | 可选，示例 fixture 为 `true` |

`closed` 餐厅保留在 JSON 中，但默认不进入推荐列表。展示层每个国家最多取 3 家 `open` 或 `unverified` 餐厅，排序见 `src/lib/ranking.ts`。

运行时校验由 Zod 完成，入口是 `src/lib/restaurant-schema.ts` 和 `npm run data:validate`。
