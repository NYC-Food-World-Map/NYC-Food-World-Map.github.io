import { z } from "zod";
import {
  BOROUGHS,
  CLASSIFICATIONS,
  CUISINE_TIERS,
  REGIONS,
  RESTAURANT_STATUSES,
  SOURCE_TYPES,
} from "@/types/restaurant";

export const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "日期必须是 YYYY-MM-DD");

export const httpUrlSchema = z
  .string()
  .url("必须是有效 URL")
  .refine(
    (value) => value.startsWith("http://") || value.startsWith("https://"),
    "URL 必须以 http:// 或 https:// 开头",
  );

export const countryCodeSchema = z
  .string()
  .regex(/^[A-Z]{2}$/, "国家代码必须是 ISO 3166-1 alpha-2");

export const regionSchema = z.enum(REGIONS);
export const cuisineTierSchema = z.enum(CUISINE_TIERS);
export const boroughSchema = z.enum(BOROUGHS);
export const classificationSchema = z.enum(CLASSIFICATIONS);
export const restaurantStatusSchema = z.enum(RESTAURANT_STATUSES);
export const sourceTypeSchema = z.enum(SOURCE_TYPES);

export const countrySchema = z.object({
  code: countryCodeSchema,
  nameZh: z.string().min(1),
  nameEn: z.string().min(1),
  flag: z.string().min(1),
  region: regionSchema,
  cuisineTier: cuisineTierSchema,
});

export const ratingSchema = z
  .object({
    source: z.string().min(1),
    score: z.number(),
    scale: z.number().positive(),
    reviewCount: z.number().int().nonnegative().optional(),
    checkedAt: dateStringSchema,
    url: httpUrlSchema.optional(),
  })
  .superRefine((rating, ctx) => {
    if (rating.score < 0 || rating.score > rating.scale) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `评分 ${rating.score} 超出量表 0–${rating.scale}`,
        path: ["score"],
      });
    }
  });

export const sourceSchema = z.object({
  type: sourceTypeSchema,
  title: z.string().min(1),
  url: httpUrlSchema,
  checkedAt: dateStringSchema,
});

export const restaurantSchema = z
  .object({
    id: z.string().min(1),
    countryCodes: z.array(countryCodeSchema).min(1, "countryCodes 不能为空"),
    name: z.string().min(1),
    classification: classificationSchema,
    classificationNote: z.string().min(1).optional(),
    status: restaurantStatusSchema,
    borough: boroughSchema,
    neighborhood: z.string().min(1),
    address: z.string().min(1).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    descriptionZh: z.string().min(1),
    ratings: z.array(ratingSchema).optional(),
    sources: z.array(sourceSchema).min(1, "每家餐厅至少需要一条可追溯来源"),
    lastVerifiedAt: dateStringSchema,
    verificationNote: z.string().min(1).optional(),
    isExample: z.boolean().optional(),
  })
  .superRefine((restaurant, ctx) => {
    const hasLatitude = restaurant.latitude !== undefined;
    const hasLongitude = restaurant.longitude !== undefined;
    if (hasLatitude !== hasLongitude) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "经纬度必须成对出现，不能只写其中一个",
        path: ["latitude"],
      });
    }
  });

export const countriesFileSchema = z.array(countrySchema).min(1);
export const restaurantsFileSchema = z.array(restaurantSchema);

export const upsertChangeSchema = z.object({
  operation: z.literal("upsert"),
  restaurant: restaurantSchema,
});

export const markClosedChangeSchema = z.object({
  operation: z.literal("mark_closed"),
  restaurantId: z.string().min(1),
  evidence: z.array(sourceSchema).min(1),
});

export const researchChangeSchema = z.discriminatedUnion("operation", [
  upsertChangeSchema,
  markClosedChangeSchema,
]);

export const researchUpdateSchema = z.object({
  generatedAt: dateStringSchema,
  changes: z.array(researchChangeSchema).min(1),
});
