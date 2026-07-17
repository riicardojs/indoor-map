import {
  ArrowUpDown,
  Baby,
  Banknote,
  Briefcase,
  DoorOpen,
  Footprints,
  Gamepad2,
  Info,
  Lamp,
  Shirt,
  Smartphone,
  Sparkles,
  Store,
  Toilet,
  TrendingUp,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import type { AmenityType } from "@/lib/mall-types";

export const categoryIcons: Record<string, LucideIcon> = {
  shirt: Shirt,
  "utensils-crossed": UtensilsCrossed,
  smartphone: Smartphone,
  briefcase: Briefcase,
  sparkles: Sparkles,
  "gamepad-2": Gamepad2,
  lamp: Lamp,
  store: Store,
};

export const amenityIcons: Record<AmenityType, LucideIcon> = {
  banheiro: Toilet,
  escada: Footprints,
  escada_rolante: TrendingUp,
  elevador: ArrowUpDown,
  entrada: DoorOpen,
  caixa_eletronico: Banknote,
  fraldario: Baby,
  informacoes: Info,
};

export const amenityLabels: Record<AmenityType, string> = {
  banheiro: "Banheiro",
  escada: "Escada",
  escada_rolante: "Escada rolante",
  elevador: "Elevador",
  entrada: "Entrada",
  caixa_eletronico: "Caixa eletrônico",
  fraldario: "Fraldário",
  informacoes: "Informações",
};
