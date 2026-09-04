import type {
  Classification,
  CuisineTier,
  RestaurantStatus,
} from "@/types/restaurant";

export const CLASSIFICATION_LABEL: Record<Classification, string> = {
  specialist: "专门菜系",
  regional: "区域兼营",
};

export const CUISINE_TIER_LABEL: Record<CuisineTier, string> = {
  niche: "小众菜系",
  mainstream: "大众菜系",
};

export const STATUS_LABEL: Record<RestaurantStatus, string> = {
  open: "营业中",
  unverified: "待核验",
  temporarily_closed: "暂时关闭",
  closed: "已关闭",
};

export function formatDate(value: string): string {
  return value;
}
