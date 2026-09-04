import { mkdir, readdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { writeRestaurantsByRegion } from "../src/lib/dataset-io";
import { googleMapsSearchUrl } from "../src/lib/google-maps";
import {
  countriesFileSchema,
  httpUrlSchema,
  restaurantSchema,
  restaurantsFileSchema,
} from "../src/lib/restaurant-schema";
import {
  BOROUGHS,
  REGION_FILE_SLUG,
  REGIONS,
  SOURCE_TYPES,
  type Borough,
  type Country,
  type Restaurant,
  type SourceType,
} from "../src/types/restaurant";

type ResearchSource = {
  type: SourceType;
  title: string;
  url: string;
  checkedAt: string;
};

type ResearchRestaurant = {
  name: string;
  classification: "specialist" | "regional";
  status: "open" | "unverified" | "temporarily_closed" | "closed";
  score?: number;
  scale?: number;
  reviewCount?: number;
  addressText?: string;
  note?: string;
  borough?: Borough;
  neighborhood?: string;
  sourceUrl?: string;
  evidenceUrls?: string[];
  checkedAt?: string;
  descriptionZh?: string;
  providedSources?: ResearchSource[];
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

function isBorough(value: unknown): value is Borough {
  return (
    typeof value === "string" && (BOROUGHS as readonly string[]).includes(value)
  );
}

function sourceTypeForUrl(url: string): SourceType {
  if (url.includes("google.com/maps")) return "google_maps";
  if (
    url.includes("eater.com") ||
    url.includes("nyctourism") ||
    url.includes("sharedbowl")
  ) {
    return "media";
  }
  return "official";
}

function asOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function asOptionalNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function isSourceType(value: unknown): value is SourceType {
  return (
    typeof value === "string" &&
    (SOURCE_TYPES as readonly string[]).includes(value)
  );
}

function usableUrl(value: unknown, fallback?: string): string | undefined {
  if (typeof value === "string" && httpUrlSchema.safeParse(value).success) {
    return value;
  }
  if (fallback && httpUrlSchema.safeParse(fallback).success) {
    return fallback;
  }
  return undefined;
}

function normalizeRestaurant(item: Record<string, unknown>): ResearchRestaurant {
  const nestedRating = Array.isArray(item.ratings)
    ? (item.ratings[0] as Record<string, unknown> | undefined)
    : undefined;
  const rating =
    asOptionalNumber(item.score) ??
    asOptionalNumber(item.googleMapsRating) ??
    asOptionalNumber(nestedRating?.score);
  const evidence = asOptionalString(item.cuisineEvidenceUrl);
  const providedSources = Array.isArray(item.sources)
    ? item.sources.flatMap((source) => {
        const record = source as Record<string, unknown>;
        const url = usableUrl(record.url);
        const checkedAt = asOptionalString(record.checkedAt);
        if (!url || !checkedAt || !isSourceType(record.type)) return [];
        return [
          {
            type: record.type,
            title: asOptionalString(record.title) ?? "Source",
            url,
            checkedAt,
          },
        ];
      })
    : undefined;
  const nestedMapsUrl = usableUrl(nestedRating?.url);
  return {
    name: String(item.name ?? ""),
    classification: item.classification as ResearchRestaurant["classification"],
    status: item.status as ResearchRestaurant["status"],
    score: rating,
    scale:
      asOptionalNumber(item.scale) ??
      asOptionalNumber(nestedRating?.scale) ??
      (rating === undefined ? undefined : 5),
    reviewCount:
      asOptionalNumber(item.reviewCount) ??
      asOptionalNumber(item.googleMapsReviewCount) ??
      asOptionalNumber(nestedRating?.reviewCount),
    addressText:
      asOptionalString(item.addressText) ?? asOptionalString(item.address),
    note: asOptionalString(item.note),
    borough: isBorough(item.borough) ? item.borough : undefined,
    neighborhood: asOptionalString(item.neighborhood),
    sourceUrl:
      usableUrl(item.sourceUrl) ??
      nestedMapsUrl ??
      providedSources?.find((source) => source.type === "google_maps")?.url,
    evidenceUrls: evidence ? [evidence] : undefined,
    checkedAt:
      asOptionalString(item.checkedAt) ??
      asOptionalString(nestedRating?.checkedAt),
    descriptionZh: asOptionalString(item.descriptionZh),
    providedSources,
  };
}

function normalizeResearchFile(raw: unknown): ResearchFile {
  const data = raw as {
    generatedAt?: string;
    countries?: Array<Record<string, unknown>>;
  };
  if (!data.generatedAt || !Array.isArray(data.countries)) {
    throw new Error("不是国家菜单研究格式。");
  }
  return {
    generatedAt: data.generatedAt,
    countries: data.countries.map((country) => ({
      countryCode: String(country.countryCode ?? country.code ?? ""),
      countryZh: String(
        country.countryZh ?? country.nameZh ?? country.countryNameZh ?? "",
      ),
      restaurants: Array.isArray(country.restaurants)
        ? country.restaurants.map((item) =>
            normalizeRestaurant(item as Record<string, unknown>),
          )
        : [],
    })),
  };
}

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
  if (
    /\bbronx\b|\b104\d{2}\b|\bhughes ave\b|\blydig ave\b|\be 18[0-9]th\b/.test(
      text,
    )
  ) {
    return "Bronx";
  }
  if (/^\d{1,3}-\d{1,3}\s/.test(text)) return "Queens";
  if (
    /\bqueens\b|\b113\d{2}\b|\b111\d{2}\b|\b114\d{2}\b|\b116\d{2}\b|\bhorace harding\b|\bhillside ave\b|\bwhitney ave\b|\b63rd dr\b|\bfresh pond\b/.test(
      text,
    )
  ) {
    return "Queens";
  }
  if (/\bmanhattan ave\b/.test(text)) return "Brooklyn";
  if (
    /\bbrooklyn\b|\b112\d{2}\b|\bconey island\b|\bavenue u\b|\bsterling pl\b|\bmyrtle ave\b|\balbee\b|\bprospect park\b|\bbogart st\b|\bstrickland\b|\batlantic ave\b|\bputnam ave\b|\bnewel st\b|\bbeard st\b|\b16th ave\b/.test(
      text,
    )
  ) {
    return "Brooklyn";
  }
  if (/\b65th st\b/.test(text) && !/\b[ew] 65th\b/.test(text)) {
    return "Brooklyn";
  }
  if (/\b5th ave\b/.test(text) && parseInt(text, 10) >= 4000) {
    return "Brooklyn";
  }
  if (/\b86th st\b/.test(text)) return "Brooklyn";
  if (/\bgrand ave\b/.test(text)) return "Brooklyn";
  if (
    /\bmanhattan\b|\b100\d{2}\b|\bbleecker\b|\bbowery\b|\bmadison ave\b|\blexington\b|\bdelancey\b|\bcleveland pl\b|\bpell st\b|\bbayard\b|\beldridge\b|\btimes square\b|\bcedar st\b|\bwater st\b|\bamsterdam\b|\bavenue a\b|\bavenue c\b|\borchard st\b|\bludlow\b|\bmacdougal\b|\bbeekman\b|\bprince st\b|\bold slip\b|\bessex st\b|\bhudson st\b|\bbroome st\b|\blafayette\b|\blaguardia\b|\b7th ave s\b/.test(
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

async function loadExistingRestaurants(root: string): Promise<Restaurant[]> {
  const collected: Restaurant[] = [];
  for (const region of REGIONS) {
    const filePath = path.join(
      root,
      "data/restaurants",
      `${REGION_FILE_SLUG[region]}.json`,
    );
    let raw: unknown;
    try {
      raw = JSON.parse(await readFile(filePath, "utf8")) as unknown;
    } catch {
      continue;
    }
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
  const borough = item.borough ?? inferBorough(addressText);
  if (!borough) return undefined;

  const address = completeAddress(addressText, borough);
  const checkedAt = item.checkedAt ?? generatedAt;
  const matched = existing.find((restaurant) => {
    const sameRecord =
      normalizeKey(restaurant.name, restaurant.address ?? "") ===
      normalizeKey(item.name, addressText);
    if (sameRecord) return true;
    return (
      slugify(restaurant.name) === slugify(item.name) &&
      restaurant.countryCodes.includes(country.countryCode)
    );
  });

  const searchUrl = googleMapsSearchUrl({
    name: item.name,
    address,
  });
  const mapsUrl = item.sourceUrl?.includes("google.com/maps")
    ? (usableUrl(item.sourceUrl) ?? searchUrl)
    : searchUrl;
  const extraSources = [
    ...(item.sourceUrl &&
    !item.sourceUrl.includes("google.com/maps") &&
    usableUrl(item.sourceUrl)
      ? [
          {
            type: sourceTypeForUrl(item.sourceUrl),
            title: "Cuisine evidence",
            url: item.sourceUrl,
            checkedAt,
          },
        ]
      : []),
    ...(item.evidenceUrls ?? []).flatMap((url) => {
      const safe = usableUrl(url);
      if (!safe) return [];
      return [
        {
          type: sourceTypeForUrl(safe),
          title:
            sourceTypeForUrl(safe) === "official"
              ? "Official site"
              : "Cuisine evidence",
          url: safe,
          checkedAt,
        },
      ];
    }),
  ];

  const restaurant: Restaurant = {
    id: matched?.id ?? `${slugify(item.name)}-${slugify(addressText) || "nyc"}`,
    countryCodes: [country.countryCode],
    name: matched?.name ?? item.name,
    classification: item.classification,
    classificationNote: item.note ?? matched?.classificationNote,
    status: item.status,
    borough: matched?.borough ?? borough,
    neighborhood: item.neighborhood ?? matched?.neighborhood ?? "待核验",
    address: matched?.address ?? address,
    descriptionZh:
      item.descriptionZh ??
      matched?.descriptionZh ??
      `${country.countryZh}菜在纽约 ${borough} 的${item.classification === "specialist" ? "专门店" : "区域兼营店"}。${item.note ?? ""}`.trim(),
    ratings:
      typeof item.score === "number" && typeof item.scale === "number"
        ? [
            {
              source: "Google Maps",
              score: item.score,
              scale: item.scale,
              reviewCount: item.reviewCount,
              checkedAt,
              url: mapsUrl,
            },
          ]
        : matched?.ratings,
    sources: [
      ...(matched?.sources ?? []),
      ...(item.providedSources ?? [
        {
          type: "google_maps" as const,
          title: "Google Maps listing",
          url: mapsUrl,
          checkedAt,
        },
      ]),
      ...extraSources,
    ],
    lastVerifiedAt: checkedAt,
    verificationNote: matched?.verificationNote,
  };

  const uniqueSources = new Map(
    restaurant.sources.map((source) => [source.url, source]),
  );
  restaurant.sources = [...uniqueSources.values()];
  const parsed = restaurantSchema.safeParse(restaurant);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new Error(issue?.message ?? "记录无法通过校验");
  }
  return parsed.data;
}

function convertResearchFile(
  raw: ResearchFile,
  countriesByCode: Record<string, Country>,
  existing: Restaurant[],
  skipCodes: Set<string>,
): { imported: Restaurant[]; skipped: string[] } {
  const skipped: string[] = [];
  const byKey = new Map<string, Restaurant>();

  for (const country of raw.countries) {
    if (!country.countryCode || skipCodes.has(country.countryCode)) continue;
    if (!countriesByCode[country.countryCode]) {
      skipped.push(`未知国家 ${country.countryCode}`);
      continue;
    }
    for (const item of country.restaurants) {
      try {
        const converted = toRestaurant(
          item,
          country,
          raw.generatedAt,
          existing,
        );
        if (!converted) {
          skipped.push(
            `${country.countryZh} / ${item.name}（缺少可判断 Borough 的地址）`,
          );
          continue;
        }
        const key = normalizeKey(converted.name, converted.address ?? "");
        const previous = byKey.get(key);
        if (previous) {
          mergeSharedVenue(previous, converted);
          continue;
        }
        byKey.set(key, converted);
      } catch (error) {
        const message = error instanceof Error ? error.message : "导入失败";
        skipped.push(`${country.countryZh} / ${item.name}（${message}）`);
      }
    }
  }

  return { imported: [...byKey.values()], skipped };
}

function mergeSharedVenue(target: Restaurant, extra: Restaurant) {
  target.countryCodes = [
    ...new Set([...target.countryCodes, ...extra.countryCodes]),
  ].sort();
  if (extra.classification === "specialist") {
    target.classification = "specialist";
  }
  if (extra.classificationNote && !target.classificationNote) {
    target.classificationNote = extra.classificationNote;
  }
}

async function listResearchSlugs(root: string, requested?: string): Promise<string[]> {
  const restaurantsDir = path.join(root, "data/restaurants");
  if (requested && requested !== "all") {
    return [requested];
  }
  const files = await readdir(restaurantsDir);
  const slugs: string[] = [];
  for (const file of files) {
    if (!file.endsWith(".json")) continue;
    const raw = JSON.parse(
      await readFile(path.join(restaurantsDir, file), "utf8"),
    ) as unknown;
    if (
      raw &&
      typeof raw === "object" &&
      !Array.isArray(raw) &&
      Array.isArray((raw as { countries?: unknown }).countries)
    ) {
      slugs.push(file.replace(/\.json$/i, ""));
    }
  }
  return slugs;
}

async function main() {
  const requested = process.argv[2] ?? "all";
  const root = process.cwd();
  const archiveDir = path.join(root, "data/research");
  const slugs = await listResearchSlugs(root, requested);
  if (slugs.length === 0) {
    throw new Error("没有找到待导入的国家菜单研究文件。");
  }

  await mkdir(archiveDir, { recursive: true });

  const countries = countriesFileSchema.parse(
    JSON.parse(await readFile(path.join(root, "data/countries.json"), "utf8")),
  ) as Country[];
  const countriesByCode = Object.fromEntries(
    countries.map((country) => [country.code, country]),
  );
  const existing = await loadExistingRestaurants(root);
  const updatedCodes = new Set<string>();
  const skipped: string[] = [];
  const byKey = new Map<string, Restaurant>();
  const archivedThisRun = new Set<string>();

  for (const slug of slugs) {
    const researchPath = path.join(root, "data/restaurants", `${slug}.json`);
    const archivePath = path.join(archiveDir, `${slug}-menu.json`);
    const original = JSON.parse(await readFile(researchPath, "utf8")) as unknown;
    await writeFile(archivePath, `${JSON.stringify(original, null, 2)}\n`, "utf8");
    archivedThisRun.add(`${slug}-menu.json`);
    const raw = normalizeResearchFile(original);
    for (const country of raw.countries) {
      if (country.countryCode) updatedCodes.add(country.countryCode);
    }
    const converted = convertResearchFile(
      raw,
      countriesByCode,
      existing,
      new Set(),
    );
    skipped.push(...converted.skipped);
    for (const restaurant of converted.imported) {
      const key = normalizeKey(restaurant.name, restaurant.address ?? "");
      const previous = byKey.get(key);
      if (previous) {
        mergeSharedVenue(previous, restaurant);
        continue;
      }
      byKey.set(key, restaurant);
    }
    console.log(`已归档研究文件：${archivePath}`);
  }

  const existingCodes = new Set(
    existing.flatMap((restaurant) => restaurant.countryCodes),
  );
  try {
    const archiveFiles = await readdir(archiveDir);
    for (const file of archiveFiles) {
      if (!file.endsWith("-menu.json") || archivedThisRun.has(file)) {
        continue;
      }
      const archiveRaw = normalizeResearchFile(
        JSON.parse(await readFile(path.join(archiveDir, file), "utf8")) as unknown,
      );
      const skipFromArchive = new Set(
        countries
          .filter(
            (country) =>
              updatedCodes.has(country.code) || existingCodes.has(country.code),
          )
          .map((country) => country.code),
      );
      const recovered = convertResearchFile(
        archiveRaw,
        countriesByCode,
        existing,
        skipFromArchive,
      );
      skipped.push(...recovered.skipped);
      for (const restaurant of recovered.imported) {
        const key = normalizeKey(restaurant.name, restaurant.address ?? "");
        const previous = byKey.get(key);
        if (previous) {
          mergeSharedVenue(previous, restaurant);
          continue;
        }
        byKey.set(key, restaurant);
      }
    }
  } catch {
    // 没有其他归档时跳过。
  }

  const imported = [...byKey.values()];
  const importedCodes = new Set(imported.flatMap((item) => item.countryCodes));
  const kept = existing.filter(
    (restaurant) =>
      !restaurant.countryCodes.some(
        (code) => updatedCodes.has(code) || importedCodes.has(code),
      ),
  );
  const next = [...kept, ...imported];
  await writeRestaurantsByRegion(next, countries, { root });

  const catalogSlugs = new Set(Object.values(REGION_FILE_SLUG));
  for (const slug of slugs) {
    if (catalogSlugs.has(slug)) continue;
    await unlink(path.join(root, "data/restaurants", `${slug}.json`));
    console.log(`已移除额外研究文件：data/restaurants/${slug}.json`);
  }

  console.log(`导入餐厅：${imported.length}`);
  console.log(`保留其他原有餐厅：${kept.length}`);
  console.log(`合计：${next.length}`);
  if (skipped.length) {
    console.log("跳过：");
    for (const line of [...new Set(skipped)]) console.log(`- ${line}`);
  }
}

void main();
