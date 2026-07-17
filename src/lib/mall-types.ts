export type Point = { x: number; y: number };

export type AmenityType =
  | "banheiro"
  | "escada"
  | "escada_rolante"
  | "elevador"
  | "entrada"
  | "caixa_eletronico"
  | "fraldario"
  | "informacoes";

export interface StreetDecor {
  path: string;
  width: number;
  label: string;
  labelPos: Point;
}

export interface FloorDecor {
  streets?: StreetDecor[];
}

export interface Floor {
  id: string;
  name: string;
  level: number;
  outline: string;
  decor: FloorDecor;
}

export interface Zone {
  id: string;
  floorId: string;
  name: string;
  color: string;
  initials: string;
  marker: Point;
  area: [number, number][];
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface Store {
  id: string;
  name: string;
  number: string;
  floorId: string;
  categoryId: string;
  zoneId: string | null;
  polygon: [number, number][];
  labelPos: Point;
  description: string;
  hours: string;
  phone: string;
  logoInitials: string;
}

export interface Amenity {
  id: string;
  type: AmenityType;
  floorId: string;
  position: Point;
}

export interface Landmark {
  id: string;
  name: string;
  floorId: string;
  position: Point;
}

export interface MallData {
  floors: Floor[];
  categories: Category[];
  zones: Zone[];
  stores: Store[];
  amenities: Amenity[];
  landmarks: Landmark[];
}
