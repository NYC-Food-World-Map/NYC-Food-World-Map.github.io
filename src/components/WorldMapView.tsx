"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CountryDetailPanel } from "@/components/CountryDetailPanel";
import { WorldCuisineMap } from "@/components/WorldCuisineMap";
import { countryMatchesQuery, EMPTY_FILTERS } from "@/lib/filters";
import { CUISINE_TIER_LABEL } from "@/lib/labels";
import { selectTopRestaurantsForCountry } from "@/lib/ranking";
import { CUISINE_TIERS } from "@/types/restaurant";
import type { Country, CuisineTier, Restaurant } from "@/types/restaurant";

type WorldMapViewProps = {
  countries: Country[];
  restaurants: Restaurant[];
};

function firstCountryCode(
  countryList: Country[],
  restaurants: Restaurant[],
): string | undefined {
  return (
    countryList.find((country) =>
      restaurants.some((restaurant) =>
        restaurant.countryCodes.includes(country.code),
      ),
    )?.code ?? countryList[0]?.code
  );
}

function countriesForTier(
  countries: Country[],
  cuisineTier: CuisineTier | "all",
): Country[] {
  return cuisineTier === "all"
    ? countries
    : countries.filter((country) => country.cuisineTier === cuisineTier);
}

export function WorldMapView({ countries, restaurants }: WorldMapViewProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [cuisineTier, setCuisineTier] = useState<CuisineTier | "all">(
    EMPTY_FILTERS.cuisineTier,
  );
  const [focusNonce, setFocusNonce] = useState(0);

  const tierCountries = useMemo(
    () => countriesForTier(countries, cuisineTier),
    [countries, cuisineTier],
  );

  const visibleCountries = useMemo(
    () =>
      tierCountries.filter((country) => countryMatchesQuery(country, query)),
    [query, tierCountries],
  );

  const highlightedCodes = useMemo(
    () => new Set(visibleCountries.map((country) => country.code)),
    [visibleCountries],
  );

  const [selectedCode, setSelectedCode] = useState<string | undefined>(() =>
    firstCountryCode(countriesForTier(countries, EMPTY_FILTERS.cuisineTier), restaurants),
  );

  const restaurantCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const country of countries) {
      counts[country.code] = selectTopRestaurantsForCountry(
        restaurants,
        country.code,
      ).length;
    }
    return counts;
  }, [countries, restaurants]);

  const selectedCountry =
    countries.find((country) => country.code === selectedCode) ??
    visibleCountries[0];

  const selectedRestaurants = selectedCountry
    ? selectTopRestaurantsForCountry(restaurants, selectedCountry.code)
    : [];

  const countryOptions = useMemo(() => {
    if (
      selectedCountry &&
      !tierCountries.some((country) => country.code === selectedCountry.code)
    ) {
      return [...tierCountries, selectedCountry].sort((a, b) =>
        a.nameZh.localeCompare(b.nameZh, "zh"),
      );
    }
    return tierCountries;
  }, [selectedCountry, tierCountries]);

  const selectCountry = (code: string) => {
    const country = countries.find((item) => item.code === code);
    if (!country) return;
    if (cuisineTier !== "all" && country.cuisineTier !== cuisineTier) {
      setCuisineTier("all");
    }
    setQuery(country.nameZh);
    setSelectedCode(code);
    setFocusNonce((value) => value + 1);
  };

  useEffect(() => {
    panelRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [selectedCountry?.code]);

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-[color:var(--map-bg)] md:flex-row">
      <div className="relative min-h-0 min-w-0 flex-1">
        <WorldCuisineMap
          countries={countries}
          highlightedCodes={highlightedCodes}
          restaurantCounts={restaurantCounts}
          selectedCode={selectedCountry?.code}
          focusNonce={focusNonce}
          onSelect={selectCountry}
        />
        <div className="pointer-events-none absolute inset-x-3 top-3 z-20 md:inset-x-auto md:left-3 md:right-auto md:w-[min(22rem,calc(100%-1.5rem))]">
          <div className="pointer-events-auto grid grid-cols-2 gap-2 rounded-2xl bg-[color:var(--card)]/90 p-3 shadow-sm ring-1 ring-[color:var(--line)] backdrop-blur">
            <label className="col-span-2 block text-xs font-medium">
              筛选国家
              <span className="relative mt-1 block">
                <input
                  type="search"
                  value={query}
                  onChange={(event) => {
                    const next = event.target.value;
                    setQuery(next);
                    const matches = countriesForTier(countries, cuisineTier).filter(
                      (country) => countryMatchesQuery(country, next),
                    );
                    if (
                      selectedCode &&
                      matches.some((country) => country.code === selectedCode)
                    ) {
                      return;
                    }
                    setSelectedCode(firstCountryCode(matches, restaurants));
                  }}
                  placeholder="点击地图或输入国家名"
                  className="min-h-10 w-full rounded-lg border border-[color:var(--line)] bg-[color:var(--card)] px-2 pr-14 text-sm"
                />
                {query ? (
                  <button
                    type="button"
                    className="absolute top-1/2 right-1 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-medium text-[color:var(--muted)]"
                    onClick={() => setQuery("")}
                  >
                    清除
                  </button>
                ) : null}
              </span>
            </label>
            <label className="block text-xs font-medium">
              小众 / 大众菜系
              <select
                value={cuisineTier}
                onChange={(event) => {
                  const next = event.target.value as CuisineTier | "all";
                  setCuisineTier(next);
                  const nextCountries = countriesForTier(countries, next);
                  if (
                    selectedCode &&
                    nextCountries.some((country) => country.code === selectedCode)
                  ) {
                    return;
                  }
                  setQuery("");
                  setSelectedCode(firstCountryCode(nextCountries, restaurants));
                }}
                className="mt-1 min-h-10 w-full rounded-lg border border-[color:var(--line)] bg-[color:var(--card)] px-2 text-sm"
              >
                <option value="all">全部菜系</option>
                {CUISINE_TIERS.map((tier) => (
                  <option key={tier} value={tier}>
                    {CUISINE_TIER_LABEL[tier]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-medium">
              跳转到国家
              <select
                value={selectedCountry?.code ?? ""}
                onChange={(event) => selectCountry(event.target.value)}
                className="mt-1 min-h-10 w-full rounded-lg border border-[color:var(--line)] bg-[color:var(--card)] px-2 text-sm"
              >
                {countryOptions.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.flag} {country.nameZh} ·{" "}
                    {restaurantCounts[country.code] ?? 0} 家
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>
      <aside className="relative z-20 max-h-[36vh] min-h-0 shrink-0 overflow-hidden px-3 pb-3 md:h-full md:max-h-none md:w-[min(24rem,34%)] md:py-3 md:pr-3 md:pl-0">
        <div
          ref={panelRef}
          className="h-full overflow-y-auto rounded-2xl bg-[color:var(--panel)]/95 shadow-lg ring-1 ring-[color:var(--line)] backdrop-blur"
        >
          <CountryDetailPanel
            key={selectedCountry?.code ?? "none"}
            country={selectedCountry}
            restaurants={selectedRestaurants}
            compact
          />
        </div>
      </aside>
    </div>
  );
}
