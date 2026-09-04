export const REGIONS = [
  "欧洲",
  "非洲",
  "加勒比 / 拉美",
  "亚洲",
  "北美",
  "大洋洲",
] as const;

export type Region = (typeof REGIONS)[number];

export const REGION_FILE_SLUG: Record<Region, string> = {
  欧洲: "europe",
  非洲: "africa",
  "加勒比 / 拉美": "caribbean-latin-america",
  亚洲: "asia",
  北美: "north-america",
  大洋洲: "oceania",
};

export const FILE_SLUG_TO_REGION: Record<string, Region> = Object.fromEntries(
  Object.entries(REGION_FILE_SLUG).map(([region, slug]) => [slug, region]),
) as Record<string, Region>;

export const CUISINE_TIERS = ["niche", "mainstream"] as const;

export type CuisineTier = (typeof CUISINE_TIERS)[number];

export const BOROUGHS = [
  "Manhattan",
  "Brooklyn",
  "Queens",
  "Bronx",
  "Staten Island",
] as const;

export type Borough = (typeof BOROUGHS)[number];

export const CLASSIFICATIONS = ["specialist", "regional"] as const;

export type Classification = (typeof CLASSIFICATIONS)[number];

export const RESTAURANT_STATUSES = [
  "open",
  "temporarily_closed",
  "closed",
  "unverified",
] as const;

export type RestaurantStatus = (typeof RESTAURANT_STATUSES)[number];

export const SOURCE_TYPES = [
  "official",
  "google_maps",
  "yelp",
  "reservation",
  "media",
  "other",
] as const;

export type SourceType = (typeof SOURCE_TYPES)[number];

export type Country = {
  code: string;
  nameZh: string;
  nameEn: string;
  flag: string;
  region: Region;
  cuisineTier: CuisineTier;
};

export type Rating = {
  source: string;
  score: number;
  scale: number;
  reviewCount?: number;
  checkedAt: string;
  url?: string;
};

export type Source = {
  type: SourceType;
  title: string;
  url: string;
  checkedAt: string;
};

export type Restaurant = {
  id: string;
  countryCodes: string[];
  name: string;
  classification: Classification;
  classificationNote?: string;
  status: RestaurantStatus;
  borough: Borough;
  neighborhood: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  descriptionZh: string;
  ratings?: Rating[];
  sources: Source[];
  lastVerifiedAt: string;
  verificationNote?: string;
  isExample?: boolean;
};

export type UpsertChange = {
  operation: "upsert";
  restaurant: Restaurant;
};

export type MarkClosedChange = {
  operation: "mark_closed";
  restaurantId: string;
  evidence: Source[];
};

export type ResearchChange = UpsertChange | MarkClosedChange;

export type ResearchUpdate = {
  generatedAt: string;
  changes: ResearchChange[];
};
