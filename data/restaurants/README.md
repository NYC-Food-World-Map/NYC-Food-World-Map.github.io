# 按大洲拆分的纽约餐厅数据

餐厅都是**纽约市**的店，JSON 按菜系所属大洲拆开，方便之后把意大利、日本等大众菜系补进对应文件。

| 文件 | 大洲 |
| --- | --- |
| `europe.json` | 欧洲 |
| `africa.json` | 非洲 |
| `caribbean-latin-america.json` | 加勒比 / 拉美 |
| `asia.json` | 亚洲（含中东与中亚） |
| `north-america.json` | 北美 |
| `oceania.json` | 大洋洲 |

空的大洲也保留 `[]`，网站会分别读取这 6 个文件。

新增餐厅时：

1. 按 `countryCodes` 对应国家的 `region` 写入上述文件
2. 必须填写纽约 `borough`
3. 一家店的国家必须同属一个大洲；跨大洲兼营会校验失败
