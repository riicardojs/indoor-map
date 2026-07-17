"use client";

import type { Floor } from "@/lib/mall-types";

interface FloorSwitcherProps {
  floors: Floor[];
  activeFloorId: string;
  onChange: (floorId: string) => void;
}

export function FloorSwitcher({ floors, activeFloorId, onChange }: FloorSwitcherProps) {
  const ordered = [...floors].sort((a, b) => b.level - a.level);
  return (
    <div className="flex flex-col gap-1 rounded-xl bg-slate-900/90 p-1.5 shadow-xl backdrop-blur">
      {ordered.map((floor) => {
        const active = floor.id === activeFloorId;
        return (
          <button
            key={floor.id}
            onClick={() => onChange(floor.id)}
            aria-pressed={active}
            className={`rounded-lg px-3 py-2 text-left text-sm font-semibold transition-colors ${
              active ? "bg-blue-600 text-white shadow-md" : "text-slate-200 hover:bg-white/10"
            }`}
          >
            {floor.name}
          </button>
        );
      })}
    </div>
  );
}
