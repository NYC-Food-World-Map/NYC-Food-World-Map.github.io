import { googleMapsSearchUrl } from "@/lib/google-maps";
import { CLASSIFICATION_LABEL, STATUS_LABEL } from "@/lib/labels";
import type { Restaurant } from "@/types/restaurant";

type RestaurantCardProps = {
  restaurant: Restaurant;
};

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const mapsUrl = googleMapsSearchUrl(restaurant);

  return (
    <article className="rounded-xl bg-[color:var(--card)] p-4 shadow-sm ring-1 ring-[color:var(--line)]">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="text-lg font-semibold text-[color:var(--foreground)]">
          {restaurant.name}
        </h3>
        <div className="flex flex-wrap gap-2">
          {restaurant.isExample ? (
            <span className="rounded-full bg-[color:var(--accent-soft)] px-2 py-1 text-xs font-medium text-[color:var(--accent-ink)]">
              示例数据
            </span>
          ) : null}
          <span className="rounded-full bg-[color:var(--chip)] px-2 py-1 text-xs font-medium text-[color:var(--foreground)]">
            {CLASSIFICATION_LABEL[restaurant.classification]}
          </span>
          <span className="rounded-full bg-[color:var(--chip)] px-2 py-1 text-xs font-medium text-[color:var(--foreground)]">
            {STATUS_LABEL[restaurant.status]}
          </span>
        </div>
      </div>
      <p className="mt-2 text-sm text-[color:var(--muted)]">
        {restaurant.borough} · {restaurant.neighborhood}
        {restaurant.address ? ` · ${restaurant.address}` : " · 地址待核验"}
      </p>
      <p className="mt-3 text-base leading-relaxed text-[color:var(--foreground)]">
        {restaurant.descriptionZh}
      </p>
      {restaurant.ratings && restaurant.ratings.length > 0 ? (
        <ul className="mt-3 space-y-1 text-sm">
          {restaurant.ratings.map((rating) => (
            <li key={`${rating.source}-${rating.checkedAt}`}>
              {rating.source}：{rating.score}/{rating.scale}
              {typeof rating.reviewCount === "number"
                ? `，${rating.reviewCount} 条评价`
                : ""}
              {rating.url ? (
                <>
                  {" "}
                  <a
                    href={rating.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[color:var(--primary)] underline decoration-[color:var(--accent)] underline-offset-2"
                  >
                    来源
                  </a>
                </>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-[color:var(--muted)]">暂无分平台评分。</p>
      )}
      <p className="mt-3 text-sm text-[color:var(--muted)]">
        最后核验：{restaurant.lastVerifiedAt}
      </p>
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex min-h-11 items-center rounded-full bg-[color:var(--accent)] px-4 py-2 text-sm font-medium text-white no-underline hover:bg-[color:var(--accent-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]"
      >
        在 Google 地图中查看
      </a>
    </article>
  );
}
