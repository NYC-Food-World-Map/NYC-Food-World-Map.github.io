import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { countriesFileSchema, restaurantsFileSchema } from "@/lib/restaurant-schema";
import {
  FILE_SLUG_TO_REGION,
  REGION_FILE_SLUG,
  REGIONS,
  type Country,
  type Region,
  type Restaurant,
} from "@/types/restaurant";

export const RESTAURANTS_DIR = "data/restaurants";

export function restaurantFileName(region: Region): string {
  return `${REGION_FILE_SLUG[region]}.json`;
}

export function restaurantFilePath(
  region: Region,
  root = process.cwd(),
): string {
  return path.join(root, RESTAURANTS_DIR, restaurantFileName(region));
}

export function regionForRestaurant(
  restaurant: Restaurant,
  countriesByCode: Record<string, Country>,
): Region {
  const regions = new Set<Region>();
  for (const code of restaurant.countryCodes) {
    const country = countriesByCode[code];
    if (!country) {
      throw new Error(`${restaurant.id} 使用了未知国家代码：${code}`);
    }
    regions.add(country.region);
  }

  if (regions.size !== 1) {
    throw new Error(
      `${restaurant.id} 的国家分属多个大洲：${[...regions].join("、")}`,
    );
  }

  return [...regions][0]!;
}

async function loadCountries(root: string): Promise<Country[]> {
  const raw = await readFile(path.join(root, "data/countries.json"), "utf8");
  return countriesFileSchema.parse(JSON.parse(raw));
}

export async function loadRestaurantsFromRegionFiles(
  root = process.cwd(),
): Promise<Restaurant[]> {
  const countries = await loadCountries(root);
  const countriesByCode = Object.fromEntries(
    countries.map((country) => [country.code, country]),
  );
  const batches = await Promise.all(
    REGIONS.map(async (region) => {
      const filePath = restaurantFilePath(region, root);
      const raw = await readFile(filePath, "utf8");
      const restaurants = restaurantsFileSchema.parse(JSON.parse(raw));
      for (const restaurant of restaurants) {
        const actual = regionForRestaurant(restaurant, countriesByCode);
        if (actual !== region) {
          throw new Error(
            `${REGION_FILE_SLUG[region]}.json 中的 ${restaurant.id} 属于${actual}，不应放在该文件`,
          );
        }
      }
      return restaurants;
    }),
  );
  return batches.flat();
}

export function groupRestaurantsByRegion(
  restaurants: Restaurant[],
  countries: Country[],
): Map<Region, Restaurant[]> {
  const countriesByCode = Object.fromEntries(
    countries.map((country) => [country.code, country]),
  );
  const grouped = new Map<Region, Restaurant[]>(
    REGIONS.map((region) => [region, []]),
  );
  for (const restaurant of restaurants) {
    const region = regionForRestaurant(restaurant, countriesByCode);
    grouped.get(region)!.push(restaurant);
  }
  return grouped;
}

export async function writeRestaurantsByRegion(
  restaurants: Restaurant[],
  countries: Country[],
  options: { root?: string } = {},
): Promise<string[]> {
  const root = options.root ?? process.cwd();
  const dir = path.join(root, RESTAURANTS_DIR);
  await mkdir(dir, { recursive: true });
  const grouped = groupRestaurantsByRegion(restaurants, countries);
  const written: string[] = [];

  for (const region of REGIONS) {
    const list = grouped.get(region) ?? [];
    const filePath = restaurantFilePath(region, root);
    await writeFile(filePath, `${JSON.stringify(list, null, 2)}\n`, "utf8");
    written.push(filePath);
  }

  return written;
}

export function regionFromFileName(name: string): Region | undefined {
  const slug = name.replace(/\.json$/i, "");
  return FILE_SLUG_TO_REGION[slug];
}
