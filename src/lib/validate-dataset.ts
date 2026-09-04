import { ZodError } from "zod";
import {
  countriesFileSchema,
  restaurantsFileSchema,
} from "@/lib/restaurant-schema";
import type { Country, Restaurant } from "@/types/restaurant";

export type ValidationIssue = {
  path: string;
  message: string;
};

export type DatasetValidation = {
  ok: boolean;
  issues: ValidationIssue[];
  countryCount: number;
  restaurantCount: number;
};

function issuesFromZod(error: ZodError, prefix: string): ValidationIssue[] {
  return error.issues.map((issue) => ({
    path: `${prefix}${issue.path.length ? `.${issue.path.join(".")}` : ""}`,
    message: issue.message,
  }));
}

export function validateDataset(
  countriesInput: unknown,
  restaurantsInput: unknown,
): DatasetValidation {
  const issues: ValidationIssue[] = [];
  let countries: Country[] = [];
  let restaurants: Restaurant[] = [];

  const countriesResult = countriesFileSchema.safeParse(countriesInput);
  if (!countriesResult.success) {
    issues.push(...issuesFromZod(countriesResult.error, "countries"));
  } else {
    countries = countriesResult.data;
  }

  const restaurantsResult = restaurantsFileSchema.safeParse(restaurantsInput);
  if (!restaurantsResult.success) {
    issues.push(...issuesFromZod(restaurantsResult.error, "restaurants"));
  } else {
    restaurants = restaurantsResult.data;
  }

  const seenCountryCodes = new Set<string>();

  for (const country of countries) {
    if (seenCountryCodes.has(country.code)) {
      issues.push({
        path: `countries.${country.code}`,
        message: `国家代码重复：${country.code}`,
      });
    }
    seenCountryCodes.add(country.code);
  }

  const countryByCode = Object.fromEntries(
    countries.map((country) => [country.code, country]),
  );
  const seenRestaurantIds = new Set<string>();
  for (const restaurant of restaurants) {
    if (seenRestaurantIds.has(restaurant.id)) {
      issues.push({
        path: `restaurants.${restaurant.id}`,
        message: `餐厅 ID 重复：${restaurant.id}`,
      });
    }
    seenRestaurantIds.add(restaurant.id);

    if (restaurant.countryCodes.length === 0) {
      issues.push({
        path: `restaurants.${restaurant.id}.countryCodes`,
        message: "countryCodes 不能为空",
      });
    }

    const regions = new Set<string>();
    for (const code of restaurant.countryCodes) {
      const country = countryByCode[code];
      if (!country) {
        issues.push({
          path: `restaurants.${restaurant.id}.countryCodes`,
          message: `未知国家代码：${code}`,
        });
        continue;
      }
      regions.add(country.region);
    }

    if (regions.size > 1) {
      issues.push({
        path: `restaurants.${restaurant.id}.countryCodes`,
        message: `一家餐厅不能同时属于多个大洲：${[...regions].join("、")}`,
      });
    }
  }

  return {
    ok: issues.length === 0,
    issues,
    countryCount: countries.length,
    restaurantCount: restaurants.length,
  };
}

export function formatValidationReport(result: DatasetValidation): string {
  const header = [
    `国家：${result.countryCount}`,
    `餐厅：${result.restaurantCount}`,
    result.ok ? "校验通过。" : `发现 ${result.issues.length} 个问题：`,
  ];

  if (result.ok) {
    return header.join("\n");
  }

  return [
    ...header,
    ...result.issues.map((issue) => `- ${issue.path}: ${issue.message}`),
  ].join("\n");
}
