import path from "node:path";
import { loadRestaurantsFromRegionFiles } from "../src/lib/dataset-io";
import { countriesFileSchema } from "../src/lib/restaurant-schema";
import { findDuplicateCandidates } from "../src/lib/duplicates";
import {
  applyResearchUpdate,
  formatChangeSummaries,
  parseResearchUpdate,
  readJsonFile,
} from "../src/lib/research-update";
import { validateDataset } from "../src/lib/validate-dataset";

function usage(): never {
  console.error(
    "用法：npm run data:preview -- <research-update.json>\n这是 dry run，不会修改 data/restaurants/*.json。",
  );
  process.exit(1);
}

async function main() {
  const fileArg = process.argv.slice(2).find((arg) => !arg.startsWith("-"));
  if (!fileArg) {
    usage();
  }

  const updatePath = path.resolve(fileArg);
  const countries = countriesFileSchema.parse(
    await readJsonFile(path.join(process.cwd(), "data/countries.json")),
  );
  const restaurants = await loadRestaurantsFromRegionFiles();
  const update = parseResearchUpdate(await readJsonFile(updatePath));
  const { restaurants: next, summaries } = applyResearchUpdate(
    restaurants,
    update,
  );
  const validation = validateDataset(countries, next);
  const duplicates = findDuplicateCandidates(next);

  console.log(`预览文件：${updatePath}`);
  console.log(`生成日期：${update.generatedAt}`);
  console.log("模式：dry run（不会写入正式数据）");
  console.log("");
  console.log(formatChangeSummaries(summaries));
  console.log("");
  console.log(
    validation.ok
      ? "预览数据通过校验。"
      : `预览数据未通过校验：\n${validation.issues
          .map((issue) => `- ${issue.path}: ${issue.message}`)
          .join("\n")}`,
  );
  console.log(`可能重复组数：${duplicates.length}`);
}

void main();
