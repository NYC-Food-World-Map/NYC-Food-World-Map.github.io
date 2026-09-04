import { CountryListView } from "@/components/CountryListView";
import { countries, hasExampleData, restaurants } from "@/lib/restaurant-data";

export default function ListPage() {
  return (
    <div className="space-y-4">
      <p className="max-w-3xl text-base leading-relaxed text-[color:var(--muted)]">
        按国家查看纽约五大区的专门或区域兼营餐厅。默认先看小众菜系；可切换到大众菜系或全部。每个国家最多展示
        3 家仍在营业或待核验的候选；没有可靠结果时会明确留空。
      </p>
      <CountryListView
        countries={countries}
        restaurants={restaurants}
        showExampleBanner={hasExampleData()}
      />
    </div>
  );
}
