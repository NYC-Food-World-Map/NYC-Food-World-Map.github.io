import { RestaurantList } from "@/components/RestaurantList";
import { CUISINE_TIER_LABEL } from "@/lib/labels";
import type { Country, Restaurant } from "@/types/restaurant";

type CountryCardProps = {
  country: Country;
  restaurants: Restaurant[];
};

export function CountryCard({ country, restaurants }: CountryCardProps) {
  return (
    <section
      aria-labelledby={`country-${country.code}`}
      className="rounded-2xl bg-[color:var(--panel)] p-4 ring-1 ring-[color:var(--line)] sm:p-5"
    >
      <header className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2
          id={`country-${country.code}`}
          className="font-serif text-2xl text-[color:var(--foreground)]"
        >
          <span aria-hidden="true" className="mr-2">
            {country.flag}
          </span>
          {country.nameZh}
          <span className="ml-2 text-base font-sans font-normal text-[color:var(--muted)]">
            {country.nameEn}
          </span>
        </h2>
        <p className="text-sm text-[color:var(--muted)]">
          {CUISINE_TIER_LABEL[country.cuisineTier]} · {country.region} · {restaurants.length} 家推荐
        </p>
      </header>
      <RestaurantList restaurants={restaurants} />
    </section>
  );
}
