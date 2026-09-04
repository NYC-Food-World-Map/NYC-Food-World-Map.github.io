"use client";

import { useMemo, useState } from "react";
import { CountryCard } from "@/components/CountryCard";
import { FilterBar } from "@/components/FilterBar";
import {
  EMPTY_FILTERS,
  buildCountryList,
  countVisibleRestaurants,
  type FilterState,
} from "@/lib/filters";
import { CUISINE_TIER_LABEL } from "@/lib/labels";
import type { Country, Restaurant } from "@/types/restaurant";

type CountryListViewProps = {
  countries: Country[];
  restaurants: Restaurant[];
  showExampleBanner: boolean;
};

export function CountryListView({
  countries,
  restaurants,
  showExampleBanner,
}: CountryListViewProps) {
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);

  const items = useMemo(
    () => buildCountryList(countries, restaurants, filters),
    [countries, restaurants, filters],
  );

  const withRestaurants = items.filter((item) => item.restaurants.length > 0);
  const emptyCountries = items.filter((item) => item.restaurants.length === 0);
  const restaurantCount = countVisibleRestaurants(items);

  return (
    <div className="space-y-5">
      {showExampleBanner ? (
        <div className="rounded-xl bg-[color:var(--accent-soft)] px-4 py-3 text-sm text-[color:var(--accent-ink)]">
          当前页面含示例占位数据，只用于演示筛选、排序和地图交互，不能当作纽约真实餐厅推荐。
        </div>
      ) : null}
      <FilterBar
        filters={filters}
        onChange={setFilters}
        countryCount={items.length}
        restaurantCount={restaurantCount}
      />
      <div className="grid gap-4">
        {withRestaurants.map((item) => (
          <CountryCard
            key={item.country.code}
            country={item.country}
            restaurants={item.restaurants}
          />
        ))}
      </div>
      {emptyCountries.length > 0 ? (
        <section className="rounded-2xl bg-[color:var(--panel)] p-4 ring-1 ring-[color:var(--line)] sm:p-5">
          <h2 className="font-serif text-2xl">
            暂无已确认餐厅
            <span className="ml-2 font-sans text-base font-normal text-[color:var(--muted)]">
              {emptyCountries.length} 个国家
            </span>
          </h2>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            {filters.cuisineTier === "all"
              ? "这些国家目前没有可确认的专门餐厅，不会用相邻国家菜系补足。"
              : `当前筛选为${CUISINE_TIER_LABEL[filters.cuisineTier]}。没有可靠结果时保持空白。`}
          </p>
          <ul className="mt-4 grid list-none grid-cols-1 gap-2 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {emptyCountries.map((item) => (
              <li
                key={item.country.code}
                className="rounded-xl bg-[color:var(--card)] px-3 py-3 text-sm ring-1 ring-[color:var(--line)]"
              >
                <p className="font-medium">
                  <span aria-hidden="true" className="mr-1">
                    {item.country.flag}
                  </span>
                  {item.country.nameZh}
                  <span className="ml-1 font-normal text-[color:var(--muted)]">
                    {item.country.nameEn}
                  </span>
                </p>
                <p className="mt-1 text-[color:var(--muted)]">
                  暂无可确认的专门餐厅
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
