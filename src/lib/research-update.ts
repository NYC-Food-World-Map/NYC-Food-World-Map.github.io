import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  loadRestaurantsFromRegionFiles,
  writeRestaurantsByRegion,
} from "@/lib/dataset-io";
import { findDuplicateCandidates } from "@/lib/duplicates";
import {
  researchUpdateSchema,
  restaurantSchema,
} from "@/lib/restaurant-schema";
import { validateDataset } from "@/lib/validate-dataset";
import type {
  Country,
  ResearchUpdate,
  Restaurant,
  Source,
} from "@/types/restaurant";

export type FieldDiff = {
  field: string;
  before: unknown;
  after: unknown;
};

export type ChangeSummary =
  | {
      operation: "upsert";
      restaurantId: string;
      name: string;
      kind: "create" | "update" | "unchanged";
      diffs: FieldDiff[];
    }
  | {
      operation: "mark_closed";
      restaurantId: string;
      name?: string;
      kind: "close" | "already_closed" | "missing";
      diffs: FieldDiff[];
    };

const PRESERVE_IF_OMITTED: Array<keyof Restaurant> = [
  "classificationNote",
  "verificationNote",
  "descriptionZh",
  "isExample",
];

function jsonEqual(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function diffRestaurant(
  before: Partial<Restaurant>,
  after: Restaurant,
): FieldDiff[] {
  const keys = new Set([
    ...Object.keys(before),
    ...Object.keys(after),
  ]) as Set<keyof Restaurant>;

  const diffs: FieldDiff[] = [];
  for (const key of keys) {
    if (!jsonEqual(before[key], after[key])) {
      diffs.push({
        field: String(key),
        before: before[key],
        after: after[key],
      });
    }
  }
  return diffs;
}

function mergeSources(existing: Source[], incoming: Source[]): Source[] {
  const byUrl = new Map<string, Source>();
  for (const source of [...existing, ...incoming]) {
    byUrl.set(source.url, source);
  }
  return [...byUrl.values()];
}

export function mergeRestaurantRecord(
  existing: Restaurant | undefined,
  incoming: Restaurant,
): Restaurant {
  if (!existing) {
    return restaurantSchema.parse(incoming);
  }

  const merged: Restaurant = { ...existing };
  const incomingRecord = incoming as unknown as Record<string, unknown>;

  for (const [key, value] of Object.entries(incomingRecord)) {
    if (value !== undefined) {
      (merged as unknown as Record<string, unknown>)[key] = value;
    }
  }

  for (const field of PRESERVE_IF_OMITTED) {
    if (!(field in incomingRecord) && existing[field] !== undefined) {
      (merged as unknown as Record<string, unknown>)[field] = existing[field];
    }
  }

  return restaurantSchema.parse(merged);
}

export function applyResearchUpdate(
  restaurants: Restaurant[],
  update: ResearchUpdate,
): { restaurants: Restaurant[]; summaries: ChangeSummary[] } {
  const next = [...restaurants];
  const summaries: ChangeSummary[] = [];

  for (const change of update.changes) {
    if (change.operation === "upsert") {
      const index = next.findIndex(
        (restaurant) => restaurant.id === change.restaurant.id,
      );
      const existing = index >= 0 ? next[index] : undefined;
      const merged = mergeRestaurantRecord(existing, change.restaurant);

      if (!existing) {
        next.push(merged);
        summaries.push({
          operation: "upsert",
          restaurantId: merged.id,
          name: merged.name,
          kind: "create",
          diffs: diffRestaurant(
            {
              id: merged.id,
              countryCodes: [],
              name: "",
              classification: merged.classification,
              status: merged.status,
              borough: merged.borough,
              neighborhood: "",
              descriptionZh: "",
              sources: [],
              lastVerifiedAt: merged.lastVerifiedAt,
            },
            merged,
          ).filter((diff) => diff.field !== "id"),
        });
        continue;
      }

      const diffs = diffRestaurant(existing, merged);
      next[index] = merged;
      summaries.push({
        operation: "upsert",
        restaurantId: merged.id,
        name: merged.name,
        kind: diffs.length === 0 ? "unchanged" : "update",
        diffs,
      });
      continue;
    }

    const index = next.findIndex(
      (restaurant) => restaurant.id === change.restaurantId,
    );
    if (index < 0) {
      summaries.push({
        operation: "mark_closed",
        restaurantId: change.restaurantId,
        kind: "missing",
        diffs: [],
      });
      continue;
    }

    const existing = next[index];
    const closed: Restaurant = restaurantSchema.parse({
      ...existing,
      status: "closed",
      sources: mergeSources(existing.sources, change.evidence),
      lastVerifiedAt: change.evidence
        .map((source) => source.checkedAt)
        .sort()
        .at(-1),
      verificationNote: existing.verificationNote,
    });

    next[index] = closed;
    summaries.push({
      operation: "mark_closed",
      restaurantId: existing.id,
      name: existing.name,
      kind: existing.status === "closed" ? "already_closed" : "close",
      diffs: diffRestaurant(existing, closed),
    });
  }

  return { restaurants: next, summaries };
}

export function formatChangeSummaries(summaries: ChangeSummary[]): string {
  if (summaries.length === 0) {
    return "没有变更。";
  }

  const lines: string[] = [];
  for (const summary of summaries) {
    if (summary.operation === "upsert") {
      lines.push(
        `[${summary.kind}] ${summary.name} (${summary.restaurantId})`,
      );
    } else {
      lines.push(
        `[${summary.kind}] ${summary.name ?? "未知餐厅"} (${summary.restaurantId})`,
      );
    }

    if (summary.diffs.length === 0) {
      lines.push("  无字段变化");
      continue;
    }

    for (const diff of summary.diffs) {
      lines.push(
        `  ${diff.field}: ${JSON.stringify(diff.before)} → ${JSON.stringify(diff.after)}`,
      );
    }
  }

  return lines.join("\n");
}

export async function readJsonFile<T>(filePath: string): Promise<T> {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

export function parseResearchUpdate(input: unknown): ResearchUpdate {
  return researchUpdateSchema.parse(input);
}

export type MergeOptions = {
  countries: Country[];
  restaurants: Restaurant[];
  update: ResearchUpdate;
  confirm: boolean;
  restaurantsPath?: string;
  restaurantsRoot?: string;
};

export async function mergeResearchUpdate(
  options: MergeOptions,
): Promise<{
  wrote: boolean;
  summaries: ChangeSummary[];
  restaurants: Restaurant[];
  duplicateCount: number;
  writtenFiles: string[];
}> {
  const parsedUpdate = parseResearchUpdate(options.update);
  const { restaurants, summaries } = applyResearchUpdate(
    options.restaurants,
    parsedUpdate,
  );

  const validation = validateDataset(options.countries, restaurants);
  if (!validation.ok) {
    throw new Error(
      `合并后数据未通过校验：\n${validation.issues
        .map((issue) => `- ${issue.path}: ${issue.message}`)
        .join("\n")}`,
    );
  }

  const duplicates = findDuplicateCandidates(restaurants);

  if (!options.confirm) {
    return {
      wrote: false,
      summaries,
      restaurants,
      duplicateCount: duplicates.length,
      writtenFiles: [],
    };
  }

  const writtenFiles: string[] = [];

  if (options.restaurantsPath) {
    await mkdir(path.dirname(options.restaurantsPath), { recursive: true });
    await writeFile(
      options.restaurantsPath,
      `${JSON.stringify(restaurants, null, 2)}\n`,
      "utf8",
    );
    writtenFiles.push(options.restaurantsPath);
    const written = JSON.parse(
      await readFile(options.restaurantsPath, "utf8"),
    ) as unknown;
    const afterWrite = validateDataset(options.countries, written);
    if (!afterWrite.ok) {
      throw new Error("写入后复检失败，请用 Git 回滚餐厅数据文件。");
    }
  } else {
    writtenFiles.push(
      ...(await writeRestaurantsByRegion(restaurants, options.countries, {
        root: options.restaurantsRoot,
      })),
    );
    const written = await loadRestaurantsFromRegionFiles(options.restaurantsRoot);
    const afterWrite = validateDataset(options.countries, written);
    if (!afterWrite.ok) {
      throw new Error("写入后复检失败，请用 Git 回滚 data/restaurants/*.json。");
    }
  }

  return {
    wrote: true,
    summaries,
    restaurants,
    duplicateCount: duplicates.length,
    writtenFiles,
  };
}
