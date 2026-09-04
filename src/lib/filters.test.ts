import { describe, expect, it } from "vitest";
import {
  EMPTY_FILTERS,
  buildCountryList,
  countVisibleRestaurants,
} from "@/lib/filters";
import { compareRestaurants, selectTopRestaurantsForCountry } from "@/lib/ranking";
import type { Country, Restaurant } from "@/types/restaurant";

const georgia: Country = {
  code: "GE",
  nameZh: "格鲁吉亚",
  nameEn: "Georgia",
  flag: "🇬🇪",
  region: "欧洲",
  cuisineTier: "niche",
};

const nigeria: Country = {
  code: "NG",
  nameZh: "尼日利亚",
  nameEn: "Nigeria",
  flag: "🇳🇬",
  region: "非洲",
  cuisineTier: "niche",
};

const bhutan: Country = {
  code: "BT",
  nameZh: "不丹",
  nameEn: "Bhutan",
  flag: "🇧🇹",
  region: "亚洲",
  cuisineTier: "niche",
};

const italy: Country = {
  code: "IT",
  nameZh: "意大利",
  nameEn: "Italy",
  flag: "🇮🇹",
  region: "欧洲",
  cuisineTier: "mainstream",
};

function restaurant(
  overrides: Partial<Restaurant> & Pick<Restaurant, "id" | "name">,
): Restaurant {
  return {
    countryCodes: ["GE"],
    classification: "regional",
    status: "open",
    borough: "Queens",
    neighborhood: "Sunnyside",
    descriptionZh: "测试",
    sources: [
      {
        type: "other",
        title: "source",
        url: "https://example.com/source",
        checkedAt: "2026-09-02",
      },
    ],
    lastVerifiedAt: "2026-09-02",
    ...overrides,
  };
}

const openFilters = {
  query: "",
  cuisineTier: "all" as const,
  region: "all" as const,
  borough: "all" as const,
  classification: "all" as const,
};

const fixtures: Restaurant[] = [
  restaurant({
    id: "ge-specialist",
    name: "Kartuli Specialist",
    classification: "specialist",
    borough: "Queens",
  }),
  restaurant({
    id: "ge-regional",
    name: "Kartuli Regional",
    classification: "regional",
    borough: "Brooklyn",
    neighborhood: "Brighton Beach",
  }),
  restaurant({
    id: "ge-unverified",
    name: "Kartuli Unverified",
    classification: "specialist",
    status: "unverified",
  }),
  restaurant({
    id: "ge-closed",
    name: "Kartuli Closed",
    classification: "specialist",
    status: "closed",
  }),
  restaurant({
    id: "ge-extra-1",
    name: "Extra One",
    classification: "regional",
  }),
  restaurant({
    id: "ge-extra-2",
    name: "Extra Two",
    classification: "regional",
  }),
  restaurant({
    id: "ng-open",
    name: "Lagos Kitchen",
    countryCodes: ["NG"],
    classification: "specialist",
    borough: "Bronx",
    neighborhood: "Concourse",
  }),
];

describe("filters", () => {
  const countries = [georgia, nigeria, bhutan];

  it("filters by region", () => {
    const items = buildCountryList(countries, fixtures, {
      ...openFilters,
      region: "非洲",
    });
    expect(items.map((item) => item.country.code)).toEqual(["NG"]);
  });

  it("filters by borough", () => {
    const items = buildCountryList(countries, fixtures, {
      ...openFilters,
      borough: "Bronx",
    });
    expect(items).toHaveLength(1);
    expect(items[0]?.country.code).toBe("NG");
  });

  it("filters by classification", () => {
    const items = buildCountryList(countries, fixtures, {
      ...openFilters,
      classification: "specialist",
    });
    const georgiaItem = items.find((item) => item.country.code === "GE");
    expect(
      georgiaItem?.restaurants.every(
        (item) => item.classification === "specialist",
      ),
    ).toBe(true);
  });

  it("matches country or restaurant search", () => {
    const byCountry = buildCountryList(countries, fixtures, {
      ...openFilters,
      query: "不丹",
    });
    expect(byCountry.map((item) => item.country.code)).toEqual(["BT"]);

    const byRestaurant = buildCountryList(countries, fixtures, {
      ...openFilters,
      query: "Lagos",
    });
    expect(byRestaurant.map((item) => item.country.code)).toEqual(["NG"]);
  });

  it("filters niche versus mainstream cuisine tiers", () => {
    const mixed = [georgia, nigeria, bhutan, italy];
    const niche = buildCountryList(mixed, fixtures, {
      ...openFilters,
      cuisineTier: "niche",
    });
    expect(niche.map((item) => item.country.code).sort()).toEqual([
      "BT",
      "GE",
      "NG",
    ]);

    const mainstream = buildCountryList(mixed, fixtures, {
      ...openFilters,
      cuisineTier: "mainstream",
    });
    expect(mainstream.map((item) => item.country.code)).toEqual(["IT"]);
    expect(mainstream[0]?.restaurants).toEqual([]);
  });

  it("defaults the public filter to niche cuisines", () => {
    expect(EMPTY_FILTERS.cuisineTier).toBe("niche");
  });

  it("keeps empty-state countries when no narrowing filter is applied", () => {
    const items = buildCountryList(countries, fixtures, {
      ...openFilters,
      region: "亚洲",
    });
    expect(items).toHaveLength(1);
    expect(items[0]?.restaurants).toEqual([]);
    expect(countVisibleRestaurants(items)).toBe(0);
  });
});

describe("ranking", () => {
  it("excludes closed restaurants from recommendations", () => {
    const selected = selectTopRestaurantsForCountry(fixtures, "GE");
    expect(selected.some((item) => item.id === "ge-closed")).toBe(false);
  });

  it("prefers specialist over regional and open over unverified", () => {
    const selected = selectTopRestaurantsForCountry(fixtures, "GE");
    expect(selected[0]?.id).toBe("ge-specialist");
    expect(selected.some((item) => item.id === "ge-unverified")).toBe(true);
    const specialistIndex = selected.findIndex((item) => item.id === "ge-specialist");
    const unverifiedIndex = selected.findIndex((item) => item.id === "ge-unverified");
    expect(specialistIndex).toBeLessThan(unverifiedIndex);
  });

  it("returns at most 3 restaurants and does not invent extra rows", () => {
    const selected = selectTopRestaurantsForCountry(fixtures, "GE");
    expect(selected.length).toBe(3);
  });

  it("does not treat missing ratings as a negative score", () => {
    const withRatings = restaurant({
      id: "rated",
      name: "Beta Rated",
      classification: "specialist",
      ratings: [
        {
          source: "Google Maps",
          score: 4.9,
          scale: 5,
          reviewCount: 300,
          checkedAt: "2026-09-02",
        },
      ],
    });
    const withoutRatings = restaurant({
      id: "unrated",
      name: "Alpha Unrated",
      classification: "specialist",
    });
    // 若把缺失评分当成 0 条评论，有 300 条评论的餐厅会排在前面。
    expect(compareRestaurants(withoutRatings, withRatings)).toBeLessThan(0);
  });

  it("uses review counts only when both restaurants have them", () => {
    const popular = restaurant({
      id: "popular",
      name: "Popular",
      classification: "specialist",
      ratings: [
        {
          source: "Yelp",
          score: 4,
          scale: 5,
          reviewCount: 200,
          checkedAt: "2026-09-02",
        },
      ],
    });
    const quiet = restaurant({
      id: "quiet",
      name: "Quiet",
      classification: "specialist",
      ratings: [
        {
          source: "Yelp",
          score: 5,
          scale: 5,
          reviewCount: 2,
          checkedAt: "2026-09-02",
        },
      ],
    });
    expect(compareRestaurants(popular, quiet)).toBeLessThan(0);
  });
});
