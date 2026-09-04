import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadRestaurantsFromRegionFiles } from "../src/lib/dataset-io";
import { CULINARY_CORRIDORS } from "../src/lib/corridors";
import { ISO_NUMERIC_TO_ALPHA2 } from "../src/lib/iso-numeric-map";
import { readJsonFile } from "../src/lib/research-update";

async function main() {
  const root = process.cwd();
  const countries = await readJsonFile(path.join(root, "data/countries.json"));
  const restaurants = await loadRestaurantsFromRegionFiles(root);
  const worldAtlas = await readJsonFile(
    path.join(root, "src/data/world-countries-110m.json"),
  );
  const [css, app, d3Array, d3Geo, topojson] = await Promise.all([
    readFile(path.join(root, "scripts/standalone.css"), "utf8"),
    readFile(path.join(root, "scripts/standalone-app.js"), "utf8"),
    readFile(path.join(root, "node_modules/d3-array/dist/d3-array.min.js"), "utf8"),
    readFile(path.join(root, "node_modules/d3-geo/dist/d3-geo.min.js"), "utf8"),
    readFile(
      path.join(root, "node_modules/topojson-client/dist/topojson-client.min.js"),
      "utf8",
    ),
  ]);

  const payload = JSON.stringify({
    countries,
    restaurants,
    worldAtlas,
    isoNumeric: ISO_NUMERIC_TO_ALPHA2,
    corridors: CULINARY_CORRIDORS,
  });

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>纽约 · 美食世界地图</title>
  <style>
${css}
  </style>
</head>
<body class="map-mode">
  <a class="sr-only" href="#app">跳到主要内容</a>
  <header class="app-header">
    <div class="header-inner">
      <p class="brand-title">纽约 · 美食世界地图</p>
      <p class="brand-verified" id="site-verified"></p>
    </div>
  </header>
  <main id="app"></main>
  <script>
window.STANDALONE_DATA = ${payload};
  </script>
  <script>${d3Array}</script>
  <script>${d3Geo}</script>
  <script>${topojson}</script>
  <script>
${app}
  </script>
</body>
</html>
`;

  const outDir = path.join(root, "standalone");
  await mkdir(outDir, { recursive: true });
  const outFile = path.join(outDir, "纽约世界美食地图.html");
  await writeFile(outFile, html, "utf8");
  await writeFile(path.join(outDir, "index.html"), html, "utf8");
  const bytes = Buffer.byteLength(html);
  console.log(`已生成可双击打开的文件：${outFile}`);
  console.log(`大小：${(bytes / 1024).toFixed(0)} KB`);
}

void main();
