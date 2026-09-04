import { EmptyState } from "@/components/EmptyState";
import { RestaurantCard } from "@/components/RestaurantCard";
import type { Restaurant } from "@/types/restaurant";

type RestaurantListProps = {
  restaurants: Restaurant[];
  emptyTitle?: string;
};

export function RestaurantList({
  restaurants,
  emptyTitle = "暂无可确认的专门餐厅",
}: RestaurantListProps) {
  if (restaurants.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description="没有用相邻国家菜系补足。确认来源后再写入对应大洲的 data/restaurants/{continent}.json。"
      />
    );
  }

  return (
    <ul className="grid list-none grid-cols-1 gap-3 p-0">
      {restaurants.map((restaurant) => (
        <li key={restaurant.id}>
          <RestaurantCard restaurant={restaurant} />
        </li>
      ))}
    </ul>
  );
}
