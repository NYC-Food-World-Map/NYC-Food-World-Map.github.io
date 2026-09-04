import { RestaurantList } from "@/components/RestaurantList";
import { CUISINE_TIER_LABEL } from "@/lib/labels";
import type { Country, Restaurant } from "@/types/restaurant";

type CountryDetailPanelProps = {
  country?: Country;
  restaurants: Restaurant[];
  compact?: boolean;
};

export function CountryDetailPanel({
  country,
  restaurants,
  compact = false,
}: CountryDetailPanelProps) {
  const shell = compact
    ? "country-detail-enter p-4"
    : "country-detail-enter rounded-2xl bg-[color:var(--panel)] p-5 ring-1 ring-[color:var(--line)]";

  if (!country) {
    return (
      <aside className={shell}>
        <h2 className="font-serif text-2xl">选择一个国家</h2>
        <p className="mt-2 text-base text-[color:var(--muted)]">
          点击地图上的收录国家，或使用国家列表，查看最多 3 家推荐餐厅。
        </p>
      </aside>
    );
  }

  return (
    <aside className={shell} aria-live="polite">
      <h2 className={`font-serif ${compact ? "text-xl" : "text-2xl"}`}>
        <span aria-hidden="true" className="mr-2">
          {country.flag}
        </span>
        {country.nameZh}
      </h2>
      <p className="mt-1 text-sm text-[color:var(--muted)]">
        {country.nameEn} · {CUISINE_TIER_LABEL[country.cuisineTier]} ·{" "}
        {country.region} · {restaurants.length} 家推荐
      </p>
      <div className="mt-4">
        <RestaurantList restaurants={restaurants} />
      </div>
    </aside>
  );
}
