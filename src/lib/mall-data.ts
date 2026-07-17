import "server-only";
import { supabase } from "@/lib/supabase";
import type {
  Amenity,
  AmenityType,
  Category,
  Floor,
  FloorDecor,
  Landmark,
  MallData,
  Point,
  Store,
  Zone,
} from "@/lib/mall-types";

type FloorRow = { id: string; name: string; level: number; outline: string; decor: FloorDecor };
type CategoryRow = { id: string; name: string; color: string; icon: string };
type ZoneRow = {
  id: string;
  floor_id: string;
  name: string;
  color: string;
  initials: string;
  marker: Point;
  area: { points: [number, number][] };
};
type StoreRow = {
  id: string;
  name: string;
  number: string;
  floor_id: string;
  category_id: string;
  zone_id: string | null;
  polygon: { points: [number, number][] };
  label_pos: Point;
  description: string;
  hours: string;
  phone: string;
  logo_initials: string;
};
type AmenityRow = { id: string; type: string; floor_id: string; position: Point };
type LandmarkRow = { id: string; name: string; floor_id: string; position: Point };

export async function getMallData(): Promise<MallData> {
  const [floors, categories, zones, stores, amenities, landmarks] = await Promise.all([
    supabase.from("floors").select("*").order("level"),
    supabase.from("categories").select("*").order("name"),
    supabase.from("zones").select("*"),
    supabase.from("stores").select("*").order("number"),
    supabase.from("amenities").select("*"),
    supabase.from("landmarks").select("*"),
  ]);

  const failed = [floors, categories, zones, stores, amenities, landmarks].find((r) => r.error);
  if (failed?.error) throw new Error(failed.error.message);

  return {
    floors: (floors.data as FloorRow[]).map(
      (f): Floor => ({
        id: f.id,
        name: f.name,
        level: f.level,
        outline: f.outline,
        decor: f.decor ?? {},
      })
    ),
    categories: (categories.data as CategoryRow[]).map(
      (c): Category => ({ id: c.id, name: c.name, color: c.color, icon: c.icon })
    ),
    zones: (zones.data as ZoneRow[]).map(
      (z): Zone => ({
        id: z.id,
        floorId: z.floor_id,
        name: z.name,
        color: z.color,
        initials: z.initials,
        marker: z.marker,
        area: z.area.points,
      })
    ),
    stores: (stores.data as StoreRow[]).map(
      (s): Store => ({
        id: s.id,
        name: s.name,
        number: s.number,
        floorId: s.floor_id,
        categoryId: s.category_id,
        zoneId: s.zone_id,
        polygon: s.polygon.points,
        labelPos: s.label_pos,
        description: s.description,
        hours: s.hours,
        phone: s.phone,
        logoInitials: s.logo_initials,
      })
    ),
    amenities: (amenities.data as AmenityRow[]).map(
      (a): Amenity => ({
        id: a.id,
        type: a.type as AmenityType,
        floorId: a.floor_id,
        position: a.position,
      })
    ),
    landmarks: (landmarks.data as LandmarkRow[]).map(
      (l): Landmark => ({ id: l.id, name: l.name, floorId: l.floor_id, position: l.position })
    ),
  };
}
