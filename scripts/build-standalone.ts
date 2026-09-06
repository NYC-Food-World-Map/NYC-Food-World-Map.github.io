import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadRestaurantsFromRegionFiles } from "../src/lib/dataset-io";
import { CULINARY_CORRIDORS } from "../src/lib/corridors";
import { ISO_NUMERIC_TO_ALPHA2 } from "../src/lib/iso-numeric-map";
import { readJsonFile } from "../src/lib/research-update";

/** Public feedback inbox for the header mail dialog (mailto). */
const CONTACT_EMAIL = "eatevero@gmail.com";

/** GoatCounter site code → https://{code}.goatcounter.com */
const GOATCOUNTER_CODE = "nycfoodworldmap";

const SITE_ORIGIN = "https://nyc-food-world-map.github.io";

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
    goatcounterCode: GOATCOUNTER_CODE,
  });

  const goatcounterSnippet = GOATCOUNTER_CODE
    ? `
  <link rel="canonical" href="${SITE_ORIGIN}/">
  <script
    data-goatcounter="https://${GOATCOUNTER_CODE}.goatcounter.com/count"
    data-goatcounter-settings='{"path":"/","allow_local":false}'
    async
    src="https://gc.zgo.at/count.js"></script>`
    : "";

  const mailCta = CONTACT_EMAIL
    ? `<p class="feedback-email">Email: <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></p>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>NYC · World Food Map</title>
  <style>
${css}
  </style>${goatcounterSnippet}
</head>
<body class="map-mode lang-en">
  <a class="sr-only" id="skip-link" href="#app">Skip to main content</a>
  <header class="app-header">
    <div class="header-inner">
      <div class="header-brand">
        <p class="brand-title" id="site-title">NYC · World Food Map</p>
        <p class="brand-verified" id="site-verified"></p>
        <p class="brand-visits" id="site-visits" hidden></p>
      </div>
      <div class="header-actions">
        <div class="lang-toggle" role="group" aria-label="Language / 语言" data-lang="en">
          <button type="button" class="lang-side is-active" data-set-lang="en" aria-pressed="true">EN</button>
          <span class="lang-slash" aria-hidden="true"></span>
          <button type="button" class="lang-side" data-set-lang="zh" aria-pressed="false">中文</button>
        </div>
        <button type="button" class="header-mail-btn" id="feedback-open-btn" data-open-feedback aria-haspopup="dialog" aria-controls="feedback-dialog" aria-label="留言反馈" title="留言反馈">
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
            <path fill="none" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round" d="M3.5 6.5h17v11h-17z"/>
            <path fill="none" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round" d="M3.5 6.5 12 13l8.5-6.5"/>
          </svg>
        </button>
      </div>
    </div>
  </header>
  <main id="app"></main>
  <div id="chip-tooltip" class="chip-tooltip" hidden role="tooltip"></div>
  <div id="feedback-dialog" class="feedback-dialog" hidden>
    <div class="feedback-backdrop" data-close-feedback></div>
    <div class="feedback-panel" role="dialog" aria-modal="true" aria-labelledby="feedback-title" tabindex="-1">
      <button type="button" class="feedback-close" id="feedback-close-btn" data-close-feedback aria-label="关闭">×</button>
      <h2 id="feedback-title">欢迎给我们留言！</h2>
      <p class="feedback-lede" id="feedback-lede">如果你有强烈推荐的某国餐厅、愿意补充「暂无餐厅」国家的好店，或对地图有任何建议，都非常欢迎写信告诉我们，我们一定认真听取，十分感谢！</p>
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
  const mapHref = "./" + encodeURIComponent("纽约世界美食地图.html");
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>NYC · World Food Map</title>
  <link rel="canonical" href="${SITE_ORIGIN}/">
  <meta http-equiv="refresh" content="0;url=${mapHref}">
  <script>location.replace(${JSON.stringify(mapHref)});</script>
</head>
<body>
  <p><a href="${mapHref}">Open the map</a></p>
</body>
</html>
`;
  await writeFile(outFile, html, "utf8");
  await writeFile(indexFile, indexHtml, "utf8");
  const bytes = Buffer.byteLength(html);
  console.log(`已生成可双击打开的文件：${outFile}`);
  console.log(`已写入网站入口（跳转）：${indexFile}`);
  console.log(`大小：${(bytes / 1024).toFixed(0)} KB`);
}

void main();
