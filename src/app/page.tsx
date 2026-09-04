import { WorldMapView } from "@/components/WorldMapView";
import { countries, restaurants } from "@/lib/restaurant-data";

export default function HomePage() {
  return <WorldMapView countries={countries} restaurants={restaurants} />;
}
