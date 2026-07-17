"use client";

import { Clock, MapPin, Phone } from "lucide-react";
import type { Category, Floor, Store, Zone } from "@/lib/mall-types";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

interface StoreDetailPanelProps {
  store: Store | null;
  category: Category | null;
  zone: Zone | null;
  floor: Floor | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onViewOnMap: () => void;
}

function DetailBody({
  store,
  category,
  zone,
  floor,
}: {
  store: Store;
  category: Category | null;
  zone: Zone | null;
  floor: Floor | null;
}) {
  return (
    <div className="space-y-4 px-4 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        {zone && (
          <Badge className="border-transparent text-white" style={{ backgroundColor: zone.color }}>
            {zone.name}
          </Badge>
        )}
        {category && (
          <Badge
            className="border-transparent text-slate-800"
            style={{ backgroundColor: category.color }}
          >
            {category.name}
          </Badge>
        )}
        <Badge variant="outline">Loja {store.number}</Badge>
        {floor && <Badge variant="outline">{floor.name}</Badge>}
      </div>
      <p className="leading-relaxed text-muted-foreground">{store.description}</p>
      <div className="space-y-2.5 rounded-xl border bg-muted/50 p-3">
        <div className="flex items-center gap-2.5">
          <Clock className="size-4 shrink-0 text-muted-foreground" />
          <span>{store.hours}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <Phone className="size-4 shrink-0 text-muted-foreground" />
          <a href={`tel:${store.phone.replace(/\D/g, "")}`} className="hover:underline">
            {store.phone}
          </a>
        </div>
      </div>
    </div>
  );
}

export function StoreDetailPanel({
  store,
  category,
  zone,
  floor,
  open,
  onOpenChange,
  onViewOnMap,
}: StoreDetailPanelProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  if (!store) return null;

  const viewButton = (
    <Button onClick={onViewOnMap} className="w-full bg-blue-600 hover:bg-blue-700">
      <MapPin className="size-4" />
      Ver no mapa
    </Button>
  );

  if (isDesktop) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="sm:max-w-sm">
          <SheetHeader>
            <SheetTitle className="text-xl">{store.name}</SheetTitle>
            <SheetDescription>Detalhes da loja</SheetDescription>
          </SheetHeader>
          <DetailBody store={store} category={category} zone={zone} floor={floor} />
          <SheetFooter>{viewButton}</SheetFooter>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-xl">{store.name}</DrawerTitle>
          <DrawerDescription>Detalhes da loja</DrawerDescription>
        </DrawerHeader>
        <DetailBody store={store} category={category} zone={zone} floor={floor} />
        <DrawerFooter>{viewButton}</DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
