import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { countries, restaurants, restaurantsByRegion } from "@/lib/restaurant-data";
import {
  applyResearchUpdate,
  mergeResearchUpdate,
  parseResearchUpdate,
} from "@/lib/research-update";
import { restaurantSchema } from "@/lib/restaurant-schema";
import { validateDataset } from "@/lib/validate-dataset";
import type { Restaurant, ResearchUpdate } from "@/types/restaurant";
import exampleUpdateJson from "../../data/research-updates.example.json";

function sampleRestaurant(overrides: Partial<Restaurant> = {}): Restaurant {
  return {
    id: "fixture-one",
    countryCodes: ["GE"],
    name: "Fixture One",
    classification: "specialist",
    status: "open",
    borough: "Queens",
    neighborhood: "Sunnyside",
    address: "1 Example St, Queens, NY 11104",
    descriptionZh: "测试餐厅",
    sources: [
      {
        type: "other",
        title: "Fixture source",
        url: "https://example.com/fixture-one",
        checkedAt: "2026-09-02",
      },
    ],
    lastVerifiedAt: "2026-09-02",
    ...overrides,
  };
}

describe("schema validation", () => {
  it("accepts the checked-in countries and restaurants files", () => {
    const result = validateDataset(countries, restaurants);
    expect(result.ok).toBe(true);
    expect(result.countryCount).toBe(199);
    expect(result.restaurantCount).toBe(256);
    expect(restaurantsByRegion["欧洲"]).toHaveLength(77);
    expect(restaurantsByRegion["非洲"]).toHaveLength(27);
    expect(restaurantsByRegion["加勒比 / 拉美"]).toHaveLength(69);
    expect(restaurantsByRegion["亚洲"]).toHaveLength(74);
    expect(restaurantsByRegion["北美"]).toHaveLength(6);
    expect(restaurantsByRegion["大洋洲"]).toHaveLength(3);
    expect(
      countries.filter((country) => country.cuisineTier === "niche"),
    ).toHaveLength(55);
  });

  it("rejects duplicate restaurant IDs", () => {
    const duplicated = [
      sampleRestaurant(),
      sampleRestaurant({ name: "Fixture One Duplicate" }),
    ];
    const result = validateDataset(countries, duplicated);
    expect(result.ok).toBe(false);
    expect(result.issues.some((issue) => issue.message.includes("重复"))).toBe(
      true,
    );
  });

  it("rejects unknown country codes and empty countryCodes", () => {
    const unknown = sampleRestaurant({ countryCodes: ["XX"] });
    expect(validateDataset(countries, [unknown]).ok).toBe(false);

    const parsed = validateDataset(countries, [
      {
        ...sampleRestaurant(),
        countryCodes: [],
      } as unknown as Restaurant,
    ]);
    expect(parsed.ok).toBe(false);
  });

  it("does not delete extra restaurants when a country has more than 3", () => {
    const extras = [1, 2, 3, 4].map((index) =>
      sampleRestaurant({
        id: `fixture-ge-${index}`,
        name: `Fixture ${index}`,
      }),
    );
    const result = validateDataset(countries, extras);
    expect(result.ok).toBe(true);
    expect(result.restaurantCount).toBe(4);
  });

  it("requires borough", () => {
    const missingBorough = {
      ...sampleRestaurant(),
      borough: undefined,
    };
    expect(restaurantSchema.safeParse(missingBorough).success).toBe(false);
  });

  it("rejects restaurants whose countries span multiple continents", () => {
    const mixed = sampleRestaurant({
      id: "mixed-continents",
      countryCodes: ["GE", "NG"],
    });
    const result = validateDataset(countries, [mixed]);
    expect(result.ok).toBe(false);
    expect(
      result.issues.some((issue) => issue.message.includes("多个大洲")),
    ).toBe(true);
  });
});

describe("research update dry run", () => {
  it("parses the example update file", () => {
    const update = parseResearchUpdate(exampleUpdateJson);
    expect(update.changes).toHaveLength(3);
  });

  it("previews creates, updates and closures without writing", async () => {
    const seed: Restaurant[] = [
      sampleRestaurant({
        id: "example-kartuli-sunnyside",
        name: "[示例] Kartuli Table",
        descriptionZh: "旧说明",
      }),
      sampleRestaurant({
        id: "example-lagos-kitchen-bronx",
        name: "[示例] Lagos Kitchen",
        countryCodes: ["NG"],
        borough: "Bronx",
        neighborhood: "Concourse",
      }),
    ];
    const dir = await mkdtemp(path.join(os.tmpdir(), "food-map-"));
    const target = path.join(dir, "restaurants.json");
    await writeFile(target, JSON.stringify(seed, null, 2));

    const update = parseResearchUpdate(exampleUpdateJson);
    const applied = applyResearchUpdate(seed, update);
    expect(applied.summaries.some((item) => item.kind === "create")).toBe(true);
    expect(applied.summaries.some((item) => item.kind === "update")).toBe(true);
    expect(applied.summaries.some((item) => item.kind === "close")).toBe(true);

    const result = await mergeResearchUpdate({
      countries,
      restaurants: seed,
      update,
      confirm: false,
      restaurantsPath: target,
    });

    expect(result.wrote).toBe(false);
    const onDisk = await readFile(target, "utf8");
    expect(JSON.parse(onDisk)).toEqual(seed);
  });

  it("does not write without --confirm", async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), "food-map-"));
    const target = path.join(dir, "restaurants.json");
    await mkdir(dir, { recursive: true });
    await writeFile(target, JSON.stringify(restaurants, null, 2));

    const update: ResearchUpdate = {
      generatedAt: "2026-10-01",
      changes: [
        {
          operation: "upsert",
          restaurant: sampleRestaurant({ id: "brand-new" }),
        },
      ],
    };

    const result = await mergeResearchUpdate({
      countries,
      restaurants,
      update,
      confirm: false,
      restaurantsPath: target,
    });

    expect(result.wrote).toBe(false);
    expect(JSON.parse(await readFile(target, "utf8"))).toEqual(restaurants);
  });

  it("writes only after confirm", async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), "food-map-"));
    const target = path.join(dir, "restaurants.json");
    await writeFile(target, JSON.stringify(restaurants, null, 2));

    const update: ResearchUpdate = {
      generatedAt: "2026-10-01",
      changes: [
        {
          operation: "upsert",
          restaurant: sampleRestaurant({ id: "brand-new" }),
        },
      ],
    };

    const result = await mergeResearchUpdate({
      countries,
      restaurants,
      update,
      confirm: true,
      restaurantsPath: target,
    });

    expect(result.wrote).toBe(true);
    const written = JSON.parse(await readFile(target, "utf8")) as Restaurant[];
    expect(written.some((restaurant) => restaurant.id === "brand-new")).toBe(
      true,
    );
  });
});
