import corridorsJson from '../../data/corridors.json';
import restAreasJson from '../../data/rest-areas.json';

export type Corridor = {
  slug: string; name: string; label: string; states: string[]; note: string;
};

export type RestArea = {
  id: string; name: string; corridor: string; nearest_city: string; state: string;
  lat: number | null; lon: number | null; amenities: string[];
  open: string; operator: string; source: string; source_url: string;
  verified_at: string; km_marker: string | null;
};

export const corridors = corridorsJson as Corridor[];
export const restAreas = restAreasJson as RestArea[];

export function corridorBySlug(slug: string): Corridor | undefined {
  return corridors.find((c) => c.slug === slug);
}

export function stopsForCorridor(slug: string): RestArea[] {
  return restAreas.filter((r) => r.corridor === slug);
}

export function amenityLabel(key: string): string {
  const map: Record<string, string> = {
    fuel: 'Fuel', food_court: 'Food court', toilets: 'Clean toilets',
    parking: 'Parking', ev_charging: 'EV charging', atm: 'ATM',
    first_aid: 'First aid', truck_parking: 'Truck parking',
  };
  return map[key] ?? key;
}
