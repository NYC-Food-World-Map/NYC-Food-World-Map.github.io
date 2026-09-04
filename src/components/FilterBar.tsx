"use client";

import { BOROUGHS, CLASSIFICATIONS, CUISINE_TIERS, REGIONS } from "@/types/restaurant";
import type { FilterState } from "@/lib/filters";
import { CLASSIFICATION_LABEL, CUISINE_TIER_LABEL } from "@/lib/labels";

type FilterBarProps = {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  countryCount: number;
  restaurantCount: number;
};

const selectClassName =
  "min-h-11 w-full rounded-lg border border-[color:var(--line)] bg-[color:var(--card)] px-3 text-base text-[color:var(--foreground)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]";

export function FilterBar({
  filters,
  onChange,
  countryCount,
  restaurantCount,
}: FilterBarProps) {
  return (
    <form
      className="grid gap-3 rounded-2xl bg-[color:var(--panel)] p-4 ring-1 ring-[color:var(--line)] sm:grid-cols-2 lg:grid-cols-3"
      onSubmit={(event) => event.preventDefault()}
    >
      <label className="block text-sm font-medium text-[color:var(--foreground)]">
        搜索国家或餐厅
        <input
          type="search"
          value={filters.query}
          onChange={(event) =>
            onChange({ ...filters, query: event.target.value })
          }
          placeholder="例如：格鲁吉亚、意大利、Sunnyside"
          className={`${selectClassName} mt-1`}
        />
      </label>
      <label className="block text-sm font-medium text-[color:var(--foreground)]">
        小众 / 大众菜系
        <select
          value={filters.cuisineTier}
          onChange={(event) =>
            onChange({
              ...filters,
              cuisineTier: event.target.value as FilterState["cuisineTier"],
            })
          }
          className={`${selectClassName} mt-1`}
        >
          <option value="all">全部菜系</option>
          {CUISINE_TIERS.map((tier) => (
            <option key={tier} value={tier}>
              {CUISINE_TIER_LABEL[tier]}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-medium text-[color:var(--foreground)]">
        大区
        <select
          value={filters.region}
          onChange={(event) =>
            onChange({
              ...filters,
              region: event.target.value as FilterState["region"],
            })
          }
          className={`${selectClassName} mt-1`}
        >
          <option value="all">全部大区</option>
          {REGIONS.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-medium text-[color:var(--foreground)]">
        Borough
        <select
          value={filters.borough}
          onChange={(event) =>
            onChange({
              ...filters,
              borough: event.target.value as FilterState["borough"],
            })
          }
          className={`${selectClassName} mt-1`}
        >
          <option value="all">全部 Borough</option>
          {BOROUGHS.map((borough) => (
            <option key={borough} value={borough}>
              {borough}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-medium text-[color:var(--foreground)]">
        菜系分类
        <select
          value={filters.classification}
          onChange={(event) =>
            onChange({
              ...filters,
              classification: event.target
                .value as FilterState["classification"],
            })
          }
          className={`${selectClassName} mt-1`}
        >
          <option value="all">专门菜系与区域兼营</option>
          {CLASSIFICATIONS.map((classification) => (
            <option key={classification} value={classification}>
              {CLASSIFICATION_LABEL[classification]}
            </option>
          ))}
        </select>
      </label>
      <p className="self-end text-sm text-[color:var(--muted)]">
        当前显示 {countryCount} 个国家，{restaurantCount} 家推荐餐厅。
      </p>
    </form>
  );
}
