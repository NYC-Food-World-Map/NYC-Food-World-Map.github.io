import {
  selectTopRestaurantsForCountry,
} from "@/lib/ranking";
import type {
  Borough,
  Classification,
  Country,
  CuisineTier,
  Region,
  Restaurant,
} from "@/types/restaurant";

export type FilterState = {
  query: string;
  cuisineTier: CuisineTier | "all";
  region: Region | "all";
  borough: Borough | "all";
  classification: Classification | "all";
};

export const EMPTY_FILTERS: FilterState = {
  query: "",
  cuisineTier: "niche",
  region: "all",
  borough: "all",
  classification: "all",
};

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function countryMatchesQuery(country: Country, query: string): boolean {
  const needle = normalize(query);
  if (!needle) {
    return true;
  }

  return [country.nameZh, country.nameEn, country.code, country.flag]
    .map(normalize)
    .some((value) => value.includes(needle));
}

export function restaurantMatchesQuery(
  restaurant: Restaurant,
  query: string,
): boolean {
  const needle = normalize(query);
  if (!needle) {
    return true;
  }

  return [restaurant.name, restaurant.neighborhood, restaurant.address ?? ""]
    .map(normalize)
    .some((value) => value.includes(needle));
}

export function restaurantMatchesFilters(
  restaurant: Restaurant,
  filters: FilterState,
): boolean {
  if (filters.borough !== "all" && restaurant.borough !== filters.borough) {
    return false;
  }

  if (
    filters.classification !== "all" &&
    restaurant.classification !== filters.classification
  ) {
    return false;
  }

  return true;
}

export type CountryListItem = {
  country: Country;
  restaurants: Restaurant[];
};

export function buildCountryList(
  countries: Country[],
  restaurants: Restaurant[],
  filters: FilterState,
): CountryListItem[] {
  const query = filters.query.trim();
  const hasNarrowingFilter =
    filters.borough !== "all" || filters.classification !== "all";

  return countries
    .filter((country) => {
      if (
        filters.cuisineTier !== "all" &&
        country.cuisineTier !== filters.cuisineTier
      ) {
        return false;
      }

      if (filters.region !== "all" && country.region !== filters.region) {
        return false;
      }

      const countryHit = countryMatchesQuery(country, query);
      const restaurantHit = restaurants.some(
        (restaurant) =>
          restaurant.countryCodes.includes(country.code) &&
          restaurantMatchesQuery(restaurant, query),
      );

      if (query && !countryHit && !restaurantHit) {
        return false;
      }

      return true;
    })
    .map((country) => {
      const matches = restaurants.filter(
        (restaurant) =>
          restaurant.countryCodes.includes(country.code) &&
          restaurantMatchesFilters(restaurant, filters) &&
          (!query ||
            countryMatchesQuery(country, query) ||
            restaurantMatchesQuery(restaurant, query)),
      );

      return {
        country,
        restaurants: selectTopRestaurantsForCountry(matches, country.code),
      };
    })
    .filter((item) => {
      if (!hasNarrowingFilter) {
        return true;
      }

      return item.restaurants.length > 0;
    });
}

export function countVisibleRestaurants(items: CountryListItem[]): number {
  const ids = new Set<string>();
  for (const item of items) {
    for (const restaurant of item.restaurants) {
      ids.add(restaurant.id);
    }
  }
  return ids.size;
}
