import countriesJson from "../../data/countries.json";
import europeRestaurantsJson from "../../data/restaurants/europe.json";
import africaRestaurantsJson from "../../data/restaurants/africa.json";
import caribbeanRestaurantsJson from "../../data/restaurants/caribbean-latin-america.json";
import asiaRestaurantsJson from "../../data/restaurants/asia.json";
import northAmericaRestaurantsJson from "../../data/restaurants/north-america.json";
import oceaniaRestaurantsJson from "../../data/restaurants/oceania.json";
import {
  countriesFileSchema,
  restaurantsFileSchema,
} from "@/lib/restaurant-schema";
import { selectTopRestaurantsForCountry } from "@/lib/ranking";
import type { Country, Region, Restaurant } from "@/types/restaurant";

export const countries: Country[] = countriesFileSchema.parse(countriesJson);

/**
 * 按菜系大洲分别读取纽约餐厅。文件始终存在（可为空数组），
 * 这样之后补意大利、日本等大众菜系时只需写入对应大洲 JSON。
 */
export const restaurantsByRegion: Record<Region, Restaurant[]> = {
  欧洲: restaurantsFileSchema.parse(europeRestaurantsJson),
  非洲: restaurantsFileSchema.parse(africaRestaurantsJson),
  "加勒比 / 拉美": restaurantsFileSchema.parse(caribbeanRestaurantsJson),
  亚洲: restaurantsFileSchema.parse(asiaRestaurantsJson),
  北美: restaurantsFileSchema.parse(northAmericaRestaurantsJson),
  大洋洲: restaurantsFileSchema.parse(oceaniaRestaurantsJson),
};

export const restaurants: Restaurant[] = Object.values(restaurantsByRegion).flat();

export const countriesByCode: Record<string, Country> = Object.fromEntries(
  countries.map((country) => [country.code, country]),
);

export const nicheCountries = countries.filter(
  (country) => country.cuisineTier === "niche",
);

export const mainstreamCountries = countries.filter(
  (country) => country.cuisineTier === "mainstream",
);

export function getCountry(code: string): Country | undefined {
  return countriesByCode[code];
}

export function hasExampleData(items: Restaurant[] = restaurants): boolean {
  return items.some((restaurant) => restaurant.isExample);
}

export function recommendableCountForCountry(
  countryCode: string,
  allRestaurants: Restaurant[] = restaurants,
): number {
  return selectTopRestaurantsForCountry(allRestaurants, countryCode).length;
}
