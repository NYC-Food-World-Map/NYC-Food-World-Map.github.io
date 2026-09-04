# 维护说明

## 日常开发

```bash
npm install
npm run dev
```

浏览器打开 http://localhost:3000。这是网页开发服务器，不是桌面程序。

## 改数据前

1. 不要在 React 组件里写死餐厅名单。
2. 改 `data/countries.json` 或 `data/restaurants/*.json` 后运行 `npm run data:validate`。
3. 怀疑重复时运行 `npm run data:duplicates`。脚本只报告，不删除。
4. ChatGPT 更新必须先 preview，再 `--confirm`。

## 排序与展示

推荐列表逻辑在 `src/lib/ranking.ts`：

1. `specialist` 先于 `regional`
2. `open` 先于 `unverified`
3. 两边都有评论数时，评论更多者优先
4. 缺少评分不会被当成差评
5. 每个国家最多展示 3 家
6. `closed` 和 `temporarily_closed` 不进入推荐

原始 JSON 可以保留超过 3 家，便于以后改排序或恢复历史。

## 地图

世界地图使用本地 TopoJSON（`src/data/world-countries-110m.json`）和 `src/lib/iso-numeric-map.ts`。不要把 ISO 映射写进页面组件。低分辨率地图上不明显的国家，用地图页下拉框选择。

## 发布检查

```bash
npm run lint
npm run test
npm run build
```

不要通过关闭 TypeScript 或删测试来通过 CI。
