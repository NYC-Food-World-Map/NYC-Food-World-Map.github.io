import type { Restaurant } from "@/types/restaurant";

const CLASSIFICATION_RANK: Record<Restaurant["classification"], number> = {
  specialist: 0,
  regional: 1,
};

const STATUS_RANK: Record<"open" | "unverified", number> = {
  open: 0,
  unverified: 1,
};

export const MAX_RESTAURANTS_PER_COUNTRY = 3;

export function isRecommendable(
  restaurant: Restaurant,
): restaurant is Restaurant & { status: "open" | "unverified" } {
  return restaurant.status === "open" || restaurant.status === "unverified";
}

export function maxReviewCount(restaurant: Restaurant): number | null {
  const counts = (restaurant.ratings ?? [])
    .map((rating) => rating.reviewCount)
    .filter((count): count is number => typeof count === "number");

  if (counts.length === 0) {
    return null;
  }

  return Math.max(...counts);
}

export function compareRestaurants(a: Restaurant, b: Restaurant): number {
  const classificationDiff =
    CLASSIFICATION_RANK[a.classification] - CLASSIFICATION_RANK[b.classification];
  if (classificationDiff !== 0) {
    return classificationDiff;
  }

  if (isRecommendable(a) && isRecommendable(b)) {
    const statusDiff = STATUS_RANK[a.status] - STATUS_RANK[b.status];
    if (statusDiff !== 0) {
      return statusDiff;
    }
  }

  const aReviews = maxReviewCount(a);
  const bReviews = maxReviewCount(b);
  if (aReviews !== null && bReviews !== null && aReviews !== bReviews) {
    return bReviews - aReviews;
  }

  return a.name.localeCompare(b.name, "en");
}

export function restaurantsForCountry(
  restaurants: Restaurant[],
  countryCode: string,
): Restaurant[] {
  return restaurants.filter((restaurant) =>
    restaurant.countryCodes.includes(countryCode),
  );
}

export function selectTopRestaurantsForCountry(
  restaurants: Restaurant[],
  countryCode: string,
  limit = MAX_RESTAURANTS_PER_COUNTRY,
): Restaurant[] {
  return restaurantsForCountry(restaurants, countryCode)
    .filter(isRecommendable)
    .sort(compareRestaurants)
    .slice(0, limit);
}
