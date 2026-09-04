import {
  computeBoroughStats,
  computeCorridorStats,
} from "@/lib/corridors";
import { countries, countriesByCode, restaurants } from "@/lib/restaurant-data";

export default function RegionsPage() {
  const corridors = computeCorridorStats(restaurants);
  const boroughs = computeBoroughStats(restaurants);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl">五大区与餐饮走廊</h1>
        <p className="mt-2 max-w-3xl text-base leading-relaxed text-[color:var(--muted)]">
          以下数字全部从 <code>data/restaurants/*.json</code> 现算，关闭的餐厅不计入。没有写入数据的走廊会显示 0，而不是手写统计。
        </p>
      </div>
      <section>
        <h2 className="text-xl font-semibold">Borough</h2>
        <ul className="mt-3 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 lg:grid-cols-5">
          {boroughs.map((item) => (
            <li
              key={item.borough}
              className="rounded-xl bg-[color:var(--card)] p-4 ring-1 ring-[color:var(--line)]"
            >
              <p className="text-sm text-[color:var(--muted)]">{item.borough}</p>
              <p className="mt-1 font-serif text-3xl">{item.restaurantCount}</p>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="text-xl font-semibold">主要餐饮走廊</h2>
        <ul className="mt-3 grid list-none grid-cols-1 gap-3 p-0 md:grid-cols-2">
          {corridors.map((corridor) => (
            <li
              key={corridor.id}
              className="rounded-xl bg-[color:var(--card)] p-4 ring-1 ring-[color:var(--line)]"
            >
              <h3 className="text-lg font-semibold">
                {corridor.nameZh}
                <span className="ml-2 text-sm font-normal text-[color:var(--muted)]">
                  {corridor.borough}
                </span>
              </h3>
              <p className="mt-2 text-base">
                当前可推荐餐厅 {corridor.restaurantCount} 家
              </p>
              <p className="mt-1 text-sm text-[color:var(--muted)]">
                {corridor.countryCodes.length > 0
                  ? `涉及：${corridor.countryCodes
                      .map((code) => countriesByCode[code]?.nameZh ?? code)
                      .join("、")}`
                  : "该走廊暂无已核验餐厅。"}
              </p>
            </li>
          ))}
        </ul>
      </section>
      <p className="text-sm text-[color:var(--muted)]">
        本页收录 {countries.length} 个目标国家。走廊名单是编辑定义的匹配范围，计数不是手写数字。
      </p>
    </div>
  );
}
