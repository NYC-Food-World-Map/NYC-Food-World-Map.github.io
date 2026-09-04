import {
  findDuplicateCandidates,
  formatDuplicateReport,
} from "../src/lib/duplicates";
import { loadRestaurantsFromRegionFiles } from "../src/lib/dataset-io";

async function main() {
  const restaurants = await loadRestaurantsFromRegionFiles();
  const matches = findDuplicateCandidates(restaurants);
  console.log(formatDuplicateReport(matches));
}

void main();
