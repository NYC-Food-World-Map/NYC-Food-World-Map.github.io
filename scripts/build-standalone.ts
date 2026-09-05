import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadRestaurantsFromRegionFiles } from "../src/lib/dataset-io";
import { CULINARY_CORRIDORS } from "../src/lib/corridors";
import { ISO_NUMERIC_TO_ALPHA2 } from "../src/lib/iso-numeric-map";
import { readJsonFile } from "../src/lib/research-update";

/** Public feedback inbox for the header mail dialog (mailto). */
const CONTACT_EMAIL = "eatevero@gmail.com";

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
    contactEmail: CONTACT_EMAIL,
  });

  const mailSubject = encodeURIComponent("纽约 · 美食世界地图｜留言");
  const mailBody = encodeURIComponent(
    "你好，我想留言：\n\n（例如：强烈推荐某国餐厅 / 补充暂无餐厅国家的店 / 其他建议）\n\n",
  );
  const mailHref = CONTACT_EMAIL
    ? `mailto:${CONTACT_EMAIL}?subject=${mailSubject}&body=${mailBody}`
    : `mailto:?subject=${mailSubject}&body=${mailBody}`;
  const mailCta = CONTACT_EMAIL
    ? `<a class="feedback-mail-btn" href="${mailHref}">发邮件给我们</a>
        <p class="feedback-email muted">${CONTACT_EMAIL}</p>`
    : `<a class="feedback-mail-btn" href="${mailHref}">打开邮件应用留言</a>`;

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
      <div class="header-brand">
        <p class="brand-title">纽约 · 美食世界地图</p>
        <p class="brand-verified" id="site-verified"></p>
      </div>
      <button type="button" class="header-mail-btn" data-open-feedback aria-haspopup="dialog" aria-controls="feedback-dialog" aria-label="留言反馈" title="留言反馈">
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
          <path fill="none" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round" d="M3.5 6.5h17v11h-17z"/>
          <path fill="none" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round" d="M3.5 6.5 12 13l8.5-6.5"/>
        </svg>
      </button>
    </div>
  </header>
  <main id="app"></main>
  <div id="chip-tooltip" class="chip-tooltip" hidden role="tooltip"></div>
  <div id="feedback-dialog" class="feedback-dialog" hidden>
    <div class="feedback-backdrop" data-close-feedback></div>
    <div class="feedback-panel" role="dialog" aria-modal="true" aria-labelledby="feedback-title" tabindex="-1">
      <button type="button" class="feedback-close" data-close-feedback aria-label="关闭">×</button>
      <h2 id="feedback-title">欢迎给我们留言！</h2>
      <p class="feedback-lede">如果你有强烈推荐的某国餐厅、愿意补充「暂无餐厅」国家的好店，或对地图有任何建议，都非常欢迎写信告诉我们，我们一定认真听取，十分感谢！</p>
      ${mailCta}
    </div>
  </div>
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

  const outFile = path.join(root, "纽约世界美食地图.html");
  const indexFile = path.join(root, "index.html");
  await writeFile(outFile, html, "utf8");
  await writeFile(indexFile, html, "utf8");
  const bytes = Buffer.byteLength(html);
  console.log(`已生成可双击打开的文件：${outFile}`);
  console.log(`已同步网站入口：${indexFile}`);
  console.log(`大小：${(bytes / 1024).toFixed(0)} KB`);
}

void main();
