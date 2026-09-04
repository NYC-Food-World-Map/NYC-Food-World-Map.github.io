import type { Restaurant } from "@/types/restaurant";

export function googleMapsSearchUrl(restaurant: {
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}): string {
  const hasCoordinates =
    typeof restaurant.latitude === "number" &&
    typeof restaurant.longitude === "number" &&
    Number.isFinite(restaurant.latitude) &&
    Number.isFinite(restaurant.longitude);

  const query = hasCoordinates
    ? `${restaurant.latitude},${restaurant.longitude}`
    : [restaurant.name, restaurant.address]
        .filter((part): part is string => Boolean(part && part.trim()))
        .join(" ");

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function restaurantMapsQuery(restaurant: Restaurant): string {
  return googleMapsSearchUrl(restaurant);
}
