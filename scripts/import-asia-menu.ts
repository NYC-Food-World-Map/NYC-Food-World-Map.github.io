import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { writeRestaurantsByRegion } from "../src/lib/dataset-io";
import { googleMapsSearchUrl } from "../src/lib/google-maps";
import {
  countriesFileSchema,
  restaurantSchema,
  restaurantsFileSchema,
} from "../src/lib/restaurant-schema";
import { REGION_FILE_SLUG, REGIONS, type Borough, type Country, type Restaurant } from "../src/types/restaurant";

type ResearchRestaurant = {
  name: string;
  classification: "specialist" | "regional";
  status: "open" | "unverified" | "temporarily_closed" | "closed";
  score?: number;
  scale?: number;
  reviewCount?: number;
  addressText?: string;
  note?: string;
};

type ResearchCountry = {
  countryCode: string;
  countryZh: string;
  restaurants: ResearchRestaurant[];
};

type ResearchFile = {
  generatedAt: string;
  countries: ResearchCountry[];
};

function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
}

function inferBorough(address: string): Borough | undefined {
  const text = address.toLowerCase();
  if (
    /\bstaten island\b|\bhylan\b|\bvictory blvd\b|\bsand ln\b|\b103\d{2}\b/.test(
      text,
    )
  ) {
    return "Staten Island";
  }
  if (/\bbronx\b|\b104\d{2}\b/.test(text)) return "Bronx";
  if (
    /\bqueens\b|\b113\d{2}\b|\b111\d{2}\b|\b114\d{2}\b|\b116\d{2}\b|\bhorace harding\b|\bhillside ave\b|\bwhitney ave\b|\b63rd dr\b/.test(
      text,
    )
  ) {
    return "Queens";
  }
  if (/^\d{1,3}-\d{1,3}\s/.test(text)) return "Queens";
  if (
    /\bbrooklyn\b|\b112\d{2}\b|\bconey island\b|\bavenue u\b|\bsterling pl\b|\bmyrtle ave\b|\balbee\b|\bprospect park\b|\bbogart st\b|\bstrickland\b|\batlantic ave\b/.test(
      text,
    )
  ) {
    return "Brooklyn";
  }
  if (/\b5th ave\b/.test(text) && parseInt(text, 10) >= 4000) {
    return "Brooklyn";
  }
  if (/\b86th st\b/.test(text)) return "Brooklyn";
  if (/\bgrand ave\b/.test(text)) return "Brooklyn";
  if (
    /\bmanhattan\b|\b100\d{2}\b|\bbleecker\b|\bbowery\b|\bmadison ave\b|\blexington\b|\bdelancey\b|\bcleveland pl\b|\bpell st\b|\bbayard\b|\beldridge\b|\btimes square\b|\bcedar st\b|\bwater st\b|\bamsterdam\b|\bavenue a\b/.test(
      text,
    )
  ) {
    return "Manhattan";
  }
  if (/\b(e|w)\s+\d{1,3}(st|nd|rd|th)\b/.test(text)) return "Manhattan";
  if (/\b\d+(st|nd|rd|th)\s+ave\b/.test(text)) return "Manhattan";
  if (/\b\d+th ave\b/.test(text) && parseInt(text, 10) < 4000) {
    return "Manhattan";
  }
  if (/\bbroadway\b/.test(text) && /^\d{1,3}-\d{1,3}\s/.test(text)) {
    return "Queens";
  }
  return undefined;
}

function completeAddress(address: string, borough: Borough): string {
  if (/new york|, ny\b|, nyc\b/i.test(address)) return address;
  const city =
    borough === "Staten Island"
      ? "Staten Island"
      : borough === "Bronx"
        ? "Bronx"
        : borough === "Brooklyn"
          ? "Brooklyn"
          : borough === "Queens"
            ? "Queens"
            : "New York";
  return `${address}, ${city}, NY`;
}

function normalizeKey(name: string, address = ""): string {
  return `${slugify(name)}|${slugify(address)}`;
}

async function loadExistingRestaurants(
  root: string,
): Promise<Restaurant[]> {
  const collected: Restaurant[] = [];
  for (const region of REGIONS) {
    const filePath = path.join(
      root,
      "data/restaurants",
      `${REGION_FILE_SLUG[region]}.json`,
    );
    const raw = JSON.parse(await readFile(filePath, "utf8")) as unknown;
    if (!Array.isArray(raw)) continue;
    collected.push(...restaurantsFileSchema.parse(raw));
  }
  return collected;
}

function toRestaurant(
  item: ResearchRestaurant,
  country: ResearchCountry,
  generatedAt: string,
  existing: Restaurant[],
): Restaurant | undefined {
  const addressText = item.addressText?.trim();
  if (!addressText) return undefined;
  const borough = inferBorough(addressText);
  if (!borough) return undefined;

  const address = completeAddress(addressText, borough);
  const matched = existing.find(
    (restaurant) =>
      normalizeKey(restaurant.name, restaurant.address ?? "") ===
        normalizeKey(item.name, addressText) ||
      slugify(restaurant.name) === slugify(item.name),
  );

  const mapsUrl = googleMapsSearchUrl({
    name: item.name,
    address,
  });

  const restaurant: Restaurant = {
    id: matched?.id ?? `${slugify(item.name)}-${slugify(addressText) || "nyc"}`,
    countryCodes: [country.countryCode],
    name: matched?.name ?? item.name,
    classification: item.classification,
    classificationNote: item.note ?? matched?.classificationNote,
    status: item.status,
    borough: matched?.borough ?? borough,
    neighborhood: matched?.neighborhood ?? "待核验",
    address: matched?.address ?? address,
    descriptionZh:
      matched?.descriptionZh ??
      `${country.countryZh}菜在纽约${borough}的${item.classification === "specialist" ? "专门店" : "区域兼营店"}。${item.note ?? ""}`.trim(),
    ratings:
      typeof item.score === "number" && typeof item.scale === "number"
        ? [
            {
              source: "Google Maps",
              score: item.score,
              scale: item.scale,
              reviewCount: item.reviewCount,
              checkedAt: generatedAt,
              url: mapsUrl,
            },
          ]
        : matched?.ratings,
    sources: [
      ...(matched?.sources ?? []),
      {
        type: "google_maps",
        title: "Google Maps listing",
        url: mapsUrl,
        checkedAt: generatedAt,
      },
    ],
    lastVerifiedAt: generatedAt,
    verificationNote: matched?.verificationNote,
  };

  const uniqueSources = new Map(
    restaurant.sources.map((source) => [source.url, source]),
  );
  restaurant.sources = [...uniqueSources.values()];
  return restaurantSchema.parse(restaurant);
}

async function main() {
  const root = process.cwd();
  const researchPath = path.join(root, "data/restaurants/asia.json");
  const archiveDir = path.join(root, "data/research");
  const archivePath = path.join(archiveDir, "asia-menu.json");
  const raw = JSON.parse(await readFile(researchPath, "utf8")) as ResearchFile;
  if (!raw.countries) {
    throw new Error("asia.json 不是亚洲菜单研究格式。");
  }

  await mkdir(archiveDir, { recursive: true });
  await writeFile(archivePath, `${JSON.stringify(raw, null, 2)}\n`, "utf8");

  const countries = countriesFileSchema.parse(
    JSON.parse(await readFile(path.join(root, "data/countries.json"), "utf8")),
  ) as Country[];
  const countriesByCode = Object.fromEntries(
    countries.map((country) => [country.code, country]),
  );
  const existing = await loadExistingRestaurants(root);
  const updatedCodes = new Set(raw.countries.map((item) => item.countryCode));
  const skipped: string[] = [];
  const byKey = new Map<string, Restaurant>();

  for (const country of raw.countries) {
    if (!countriesByCode[country.countryCode]) {
      skipped.push(`未知国家 ${country.countryCode}`);
      continue;
    }
    for (const item of country.restaurants) {
      const converted = toRestaurant(
        item,
        country,
        raw.generatedAt,
        existing,
      );
      if (!converted) {
        skipped.push(`${country.countryZh} / ${item.name}（缺少可判断 Borough 的地址）`);
        continue;
      }
      const key = normalizeKey(converted.name, converted.address ?? "");
      const previous = byKey.get(key);
      if (previous) {
        previous.countryCodes = [
          ...new Set([...previous.countryCodes, ...converted.countryCodes]),
        ].sort();
        continue;
      }
      byKey.set(key, converted);
    }
  }

  const imported = [...byKey.values()];
  const kept = existing.filter(
    (restaurant) =>
      !restaurant.countryCodes.some((code) => updatedCodes.has(code)),
  );
  const next = [...kept, ...imported];
  await writeRestaurantsByRegion(next, countries, { root });

  console.log(`已归档研究文件：${archivePath}`);
  console.log(`导入餐厅：${imported.length}`);
  console.log(`保留其他大洲原有餐厅：${kept.length}`);
  console.log(`合计：${next.length}`);
  if (skipped.length) {
    console.log("跳过：");
    for (const line of skipped) console.log(`- ${line}`);
  }
}

void main();
