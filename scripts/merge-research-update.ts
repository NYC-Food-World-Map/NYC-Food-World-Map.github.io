import path from "node:path";
import { loadRestaurantsFromRegionFiles } from "../src/lib/dataset-io";
import { countriesFileSchema } from "../src/lib/restaurant-schema";
import {
  formatChangeSummaries,
  mergeResearchUpdate,
  parseResearchUpdate,
  readJsonFile,
} from "../src/lib/research-update";

function usage(): never {
  console.error(
    "用法：npm run data:merge -- <research-update.json> --confirm\n没有 --confirm 时不会写入 data/restaurants/*.json。",
  );
  process.exit(1);
}

async function main() {
  const args = process.argv.slice(2);
  const fileArg = args.find((arg) => !arg.startsWith("-"));
  const confirm = args.includes("--confirm");

  if (!fileArg) {
    usage();
  }

  const countries = countriesFileSchema.parse(
    await readJsonFile(path.join(process.cwd(), "data/countries.json")),
  );
  const restaurants = await loadRestaurantsFromRegionFiles();
  const update = parseResearchUpdate(await readJsonFile(path.resolve(fileArg)));

  const result = await mergeResearchUpdate({
    countries,
    restaurants,
    update,
    confirm,
  });

  console.log(formatChangeSummaries(result.summaries));
  console.log(`可能重复组数：${result.duplicateCount}`);

  if (!confirm) {
    console.log(
      "未传入 --confirm，已完成校验和 diff，没有写入 data/restaurants/*.json。",
    );
    process.exit(0);
  }

  console.log(
    `已确认写入：\n${result.writtenFiles.map((file) => `- ${file}`).join("\n")}`,
  );
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
