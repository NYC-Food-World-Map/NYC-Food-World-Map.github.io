# ChatGPT 研究交接

本地网站不负责搜索、抓取或自动判断菜系归属。ChatGPT 完成跨来源核验后，输出一个 JSON 文件，由维护者预览再合并。

发给 ChatGPT 的完整 prompt 见 [`chatgpt-research-prompt.md`](chatgpt-research-prompt.md)。

## 完整格式

```json
{
  "generatedAt": "2026-10-01",
  "changes": []
}
```

`generatedAt` 必须是 `YYYY-MM-DD`。`changes` 是数组，目前支持两种操作。

### 1. 新增或更新：`upsert`

`restaurant` 必须能通过正式餐厅 schema。更新已有记录时，只有 JSON 里**明确出现**的字段才会覆盖；不要为了改一个评分而删掉人工维护的 `classificationNote` / `verificationNote`。

### 2. 关店：`mark_closed`

用已有 `restaurantId` 加上至少一条证据来源。合并后状态变为 `closed`，证据追加到 `sources`，记录仍保留。

## 示例：新增

```json
{
  "generatedAt": "2026-10-01",
  "changes": [
    {
      "operation": "upsert",
      "restaurant": {
        "id": "example-new-specialty-astoria",
        "countryCodes": ["AL"],
        "name": "[示例] Tirana Oven",
        "classification": "specialist",
        "status": "open",
        "borough": "Queens",
        "neighborhood": "Astoria",
        "address": "30-01 30th Ave, Astoria, NY 11102",
        "descriptionZh": "示例新增记录。",
        "sources": [
          {
            "type": "official",
            "title": "Official website",
            "url": "https://example.com/tirana-oven",
            "checkedAt": "2026-10-01"
          }
        ],
        "lastVerifiedAt": "2026-10-01"
      }
    }
  ]
}
```

## 示例：更新

```json
{
  "generatedAt": "2026-10-01",
  "changes": [
    {
      "operation": "upsert",
      "restaurant": {
        "id": "example-kartuli-sunnyside",
        "countryCodes": ["GE"],
        "name": "[示例] Kartuli Table",
        "classification": "specialist",
        "status": "open",
        "borough": "Queens",
        "neighborhood": "Sunnyside",
        "address": "41-20 Queens Blvd, Sunnyside, NY 11104",
        "descriptionZh": "更新后的说明。",
        "ratings": [
          {
            "source": "Google Maps",
            "score": 4.7,
            "scale": 5,
            "reviewCount": 140,
            "checkedAt": "2026-10-01",
            "url": "https://example.com/maps/example-kartuli-sunnyside"
          }
        ],
        "sources": [
          {
            "type": "google_maps",
            "title": "Google Maps listing",
            "url": "https://example.com/maps/example-kartuli-sunnyside",
            "checkedAt": "2026-10-01"
          }
        ],
        "lastVerifiedAt": "2026-10-01"
      }
    }
  ]
}
```

## 示例：关店

```json
{
  "generatedAt": "2026-10-01",
  "changes": [
    {
      "operation": "mark_closed",
      "restaurantId": "example-lagos-kitchen-bronx",
      "evidence": [
        {
          "type": "official",
          "title": "Closure notice",
          "url": "https://example.com/closed/lagos-kitchen",
          "checkedAt": "2026-10-01"
        }
      ]
    }
  ]
}
```

仓库中的完整样例见 `data/research-updates.example.json`。

## 本地命令

```bash
npm run data:preview -- path/to/update.json
npm run data:merge -- path/to/update.json
npm run data:merge -- path/to/update.json --confirm
```

预览和未加 `--confirm` 的合并都不会改正式数据。
