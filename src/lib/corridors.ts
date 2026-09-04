import { isRecommendable } from "@/lib/ranking";
import type { Borough, Restaurant } from "@/types/restaurant";

export type CulinaryCorridor = {
  id: string;
  nameZh: string;
  nameEn: string;
  borough: Borough;
  neighborhoods: string[];
};

export const CULINARY_CORRIDORS: CulinaryCorridor[] = [
  {
    id: "sunnyside",
    nameZh: "Sunnyside",
    nameEn: "Sunnyside",
    borough: "Queens",
    neighborhoods: ["Sunnyside"],
  },
  {
    id: "woodside",
    nameZh: "Woodside",
    nameEn: "Woodside",
    borough: "Queens",
    neighborhoods: ["Woodside"],
  },
  {
    id: "jackson-heights",
    nameZh: "Jackson Heights",
    nameEn: "Jackson Heights",
    borough: "Queens",
    neighborhoods: ["Jackson Heights"],
  },
  {
    id: "elmhurst",
    nameZh: "Elmhurst",
    nameEn: "Elmhurst",
    borough: "Queens",
    neighborhoods: ["Elmhurst"],
  },
  {
    id: "astoria",
    nameZh: "Astoria",
    nameEn: "Astoria",
    borough: "Queens",
    neighborhoods: ["Astoria"],
  },
  {
    id: "harlem",
    nameZh: "Harlem",
    nameEn: "Harlem",
    borough: "Manhattan",
    neighborhoods: ["Harlem", "East Harlem", "West Harlem"],
  },
  {
    id: "bed-stuy",
    nameZh: "Bed-Stuy",
    nameEn: "Bedford-Stuyvesant",
    borough: "Brooklyn",
    neighborhoods: ["Bed-Stuy", "Bedford-Stuyvesant"],
  },
  {
    id: "crown-heights",
    nameZh: "Crown Heights",
    nameEn: "Crown Heights",
    borough: "Brooklyn",
    neighborhoods: ["Crown Heights"],
  },
  {
    id: "south-brooklyn",
    nameZh: "南布鲁克林",
    nameEn: "South Brooklyn",
    borough: "Brooklyn",
    neighborhoods: [
      "South Brooklyn",
      "Brighton Beach",
      "Bensonhurst",
      "Gravesend",
      "Sheepshead Bay",
      "Homecrest",
    ],
  },
  {
    id: "belmont",
    nameZh: "Belmont",
    nameEn: "Belmont",
    borough: "Bronx",
    neighborhoods: ["Belmont"],
  },
];

function neighborhoodKey(value: string): string {
  return value.trim().toLowerCase();
}

export type CorridorStat = CulinaryCorridor & {
  restaurantCount: number;
  countryCodes: string[];
};

export function computeCorridorStats(
  restaurants: Restaurant[],
): CorridorStat[] {
  return CULINARY_CORRIDORS.map((corridor) => {
    const keys = new Set(corridor.neighborhoods.map(neighborhoodKey));
    const matches = restaurants.filter(
      (restaurant) =>
        isRecommendable(restaurant) &&
        restaurant.borough === corridor.borough &&
        keys.has(neighborhoodKey(restaurant.neighborhood)),
    );

    return {
      ...corridor,
      restaurantCount: matches.length,
      countryCodes: [
        ...new Set(matches.flatMap((restaurant) => restaurant.countryCodes)),
      ].sort(),
    };
  });
}

export function computeBoroughStats(restaurants: Restaurant[]): Array<{
  borough: Borough;
  restaurantCount: number;
}> {
  const recommendable = restaurants.filter(isRecommendable);
  const boroughs: Borough[] = [
    "Manhattan",
    "Brooklyn",
    "Queens",
    "Bronx",
    "Staten Island",
  ];

  return boroughs.map((borough) => ({
    borough,
    restaurantCount: recommendable.filter(
      (restaurant) => restaurant.borough === borough,
    ).length,
  }));
}
