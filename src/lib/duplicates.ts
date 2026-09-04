import type { Restaurant } from "@/types/restaurant";

export type DuplicateKind =
  | "same_id"
  | "same_name_and_address"
  | "similar_name_same_address"
  | "same_address_different_name"
  | "similar_name_different_location";

export type DuplicateMatch = {
  kind: DuplicateKind;
  leftId: string;
  rightId: string;
  leftName: string;
  rightName: string;
  note: string;
};

function stripExamplePrefix(name: string): string {
  return name.replace(/^\[示例\]\s*/u, "");
}

export function normalizeName(name: string): string {
  return stripExamplePrefix(name)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeAddress(address?: string): string {
  if (!address) {
    return "";
  }

  return address
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\bstreet\b/g, "st")
    .replace(/\bavenue\b/g, "ave")
    .replace(/\bboulevard\b/g, "blvd")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function levenshtein(a: string, b: string): number {
  if (a === b) {
    return 0;
  }

  if (a.length === 0) {
    return b.length;
  }

  if (b.length === 0) {
    return a.length;
  }

  const row = Array.from({ length: b.length + 1 }, (_, index) => index);

  for (let i = 1; i <= a.length; i += 1) {
    let previous = i - 1;
    row[0] = i;

    for (let j = 1; j <= b.length; j += 1) {
      const current = row[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + cost);
      previous = current;
    }
  }

  return row[b.length];
}

export function namesAreSimilar(left: string, right: string): boolean {
  const a = normalizeName(left);
  const b = normalizeName(right);

  if (!a || !b) {
    return false;
  }

  if (a === b) {
    return true;
  }

  const distance = levenshtein(a, b);
  const maxLen = Math.max(a.length, b.length);
  return distance <= 2 || distance / maxLen <= 0.18;
}

function pairKey(leftId: string, rightId: string): string {
  return [leftId, rightId].sort().join("::");
}

export function findDuplicateCandidates(
  restaurants: Restaurant[],
): DuplicateMatch[] {
  const matches: DuplicateMatch[] = [];
  const seen = new Set<string>();

  const push = (match: DuplicateMatch) => {
    const key = `${match.kind}:${pairKey(match.leftId, match.rightId)}`;
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    matches.push(match);
  };

  for (let i = 0; i < restaurants.length; i += 1) {
    for (let j = i + 1; j < restaurants.length; j += 1) {
      const left = restaurants[i];
      const right = restaurants[j];

      if (left.id === right.id) {
        push({
          kind: "same_id",
          leftId: left.id,
          rightId: right.id,
          leftName: left.name,
          rightName: right.name,
          note: "ID 重复，不能并存。",
        });
        continue;
      }

      const leftName = normalizeName(left.name);
      const rightName = normalizeName(right.name);
      const leftAddress = normalizeAddress(left.address);
      const rightAddress = normalizeAddress(right.address);
      const sameAddress = Boolean(leftAddress) && leftAddress === rightAddress;
      const similarName = namesAreSimilar(left.name, right.name);
      const sameBorough = left.borough === right.borough;
      const sameNeighborhood =
        left.neighborhood.trim().toLowerCase() ===
        right.neighborhood.trim().toLowerCase();

      if (leftName && leftName === rightName && sameAddress) {
        push({
          kind: "same_name_and_address",
          leftId: left.id,
          rightId: right.id,
          leftName: left.name,
          rightName: right.name,
          note: "标准化名称与地址相同，很可能是重复记录。",
        });
        continue;
      }

      if (similarName && sameAddress) {
        push({
          kind: "similar_name_same_address",
          leftId: left.id,
          rightId: right.id,
          leftName: left.name,
          rightName: right.name,
          note: "地址相同且名称接近，请人工确认是否同一家店。",
        });
        continue;
      }

      if (sameAddress && leftName !== rightName) {
        push({
          kind: "same_address_different_name",
          leftId: left.id,
          rightId: right.id,
          leftName: left.name,
          rightName: right.name,
          note: "同一地址出现不同店名，请确认是否更名、共享铺位或录入错误。",
        });
        continue;
      }

      if (similarName && !sameAddress) {
        const locationNote =
          sameBorough && sameNeighborhood
            ? "名称接近且社区相同，但地址不同。"
            : "名称接近但地址或行政区不同，更可能是连锁分店，不要自动合并。";

        push({
          kind: "similar_name_different_location",
          leftId: left.id,
          rightId: right.id,
          leftName: left.name,
          rightName: right.name,
          note: locationNote,
        });
      }
    }
  }

  return matches;
}

export function formatDuplicateReport(matches: DuplicateMatch[]): string {
  if (matches.length === 0) {
    return "未发现可能重复的餐厅。";
  }

  const lines = [`发现 ${matches.length} 组可能重复记录（只报告，不自动删除）：`, ""];

  for (const match of matches) {
    lines.push(`- [${match.kind}] ${match.leftName} (${match.leftId}) ↔ ${match.rightName} (${match.rightId})`);
    lines.push(`  ${match.note}`);
  }

  return lines.join("\n");
}
