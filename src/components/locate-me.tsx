"use client";

import { useState } from "react";
import { LocateFixed, MapPin, Pointer } from "lucide-react";
import type { Floor, Landmark } from "@/lib/mall-types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface LocateMeProps {
  floors: Floor[];
  landmarks: Landmark[];
  onSelectLandmark: (landmark: Landmark) => void;
  onStartPlacing: () => void;
}

export function LocateMe({
  floors,
  landmarks,
  onSelectLandmark,
  onStartPlacing,
}: LocateMeProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="pointer-events-auto flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-200 transition-colors hover:bg-white/10"
      >
        <LocateFixed className="size-4 shrink-0 text-blue-400" />
        Onde estou?
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Onde você está?</DialogTitle>
            <DialogDescription>
              Escolha um ponto de referência ou toque diretamente no mapa.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-72 space-y-3 overflow-y-auto">
            {floors.map((floor) => {
              const items = landmarks.filter((l) => l.floorId === floor.id);
              if (items.length === 0) return null;
              return (
                <div key={floor.id}>
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    {floor.name}
                  </p>
                  <ul className="space-y-1">
                    {items.map((lm) => (
                      <li key={lm.id}>
                        <button
                          onClick={() => {
                            setOpen(false);
                            onSelectLandmark(lm);
                          }}
                          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-foreground transition-colors hover:bg-accent"
                        >
                          <MapPin className="size-4 shrink-0 text-blue-500" />
                          {lm.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setOpen(false);
              onStartPlacing();
            }}
          >
            <Pointer className="size-4" />
            Tocar no mapa
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
