import path from "node:path";
import { loadRestaurantsFromRegionFiles } from "../src/lib/dataset-io";
import { readJsonFile } from "../src/lib/research-update";
import {
  formatValidationReport,
  validateDataset,
} from "../src/lib/validate-dataset";

async function main() {
  const root = process.cwd();
  const countries = await readJsonFile(path.join(root, "data/countries.json"));
  const restaurants = await loadRestaurantsFromRegionFiles(root);
  const result = validateDataset(countries, restaurants);
  console.log(formatValidationReport(result));

  if (!result.ok) {
    process.exit(1);
  }
}

void main();
