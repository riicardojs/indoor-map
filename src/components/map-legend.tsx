"use client";

import { useState } from "react";
import { ChevronUp, MapPin, Square } from "lucide-react";
import type { AmenityType, Zone } from "@/lib/mall-types";
import { amenityIcons, amenityLabels } from "@/lib/mall-icons";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const LEGEND_AMENITIES: AmenityType[] = [
  "entrada",
  "escada",
  "escada_rolante",
  "elevador",
  "banheiro",
  "caixa_eletronico",
  "informacoes",
];

export function MapLegend({ zones }: { zones: Zone[] }) {
  const [open, setOpen] = useState(true);

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="pointer-events-auto w-56 rounded-xl bg-slate-900/90 text-slate-100 shadow-xl backdrop-blur"
    >
      <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-2.5 text-xs font-bold uppercase tracking-widest">
        Legenda
        <ChevronUp
          className={`size-4 text-slate-400 transition-transform ${open ? "" : "rotate-180"}`}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="max-h-72 space-y-1.5 overflow-y-auto px-4 pb-3.5">
          {zones.map((zone) => (
            <div key={zone.id} className="flex items-center gap-2.5 text-xs text-slate-200">
              <span
                className="flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-white/80 text-[8px] font-extrabold text-white"
                style={{ backgroundColor: zone.color }}
              >
                {zone.initials}
              </span>
              {zone.name}
            </div>
          ))}
          {LEGEND_AMENITIES.map((type) => {
            const Icon = amenityIcons[type];
            return (
              <div key={type} className="flex items-center gap-2.5 text-xs text-slate-200">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                  <Icon className="size-3" />
                </span>
                {amenityLabels[type]}
              </div>
            );
          })}
          <div className="flex items-center gap-2.5 text-xs text-slate-200">
            <Square className="size-5 shrink-0 rounded-sm fill-slate-100 text-slate-300" />
            Lojas
          </div>
          <div className="flex items-center gap-2.5 text-xs text-slate-200">
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
              <MapPin className="size-3" />
            </span>
            Você está aqui
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
