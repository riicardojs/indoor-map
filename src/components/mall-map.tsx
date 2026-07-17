"use client";

import { useEffect, useMemo, useState } from "react";
import { Box, LayoutGrid, Minus, Navigation, Plus, Search, Square, X } from "lucide-react";
import type { Landmark, Point, Store, Zone } from "@/lib/mall-types";
import { useMallData } from "@/hooks/use-mall-data";
import { useMapViewport } from "@/hooks/use-map-viewport";
import { MapCanvas } from "@/components/map-canvas";
import { FloorSwitcher } from "@/components/floor-switcher";
import { SearchPanel } from "@/components/search-panel";
import { StoreDetailPanel } from "@/components/store-detail-panel";
import { MapLegend } from "@/components/map-legend";
import { LocateMe } from "@/components/locate-me";
import { MapSkeleton } from "@/components/map-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";

const STORAGE_KEY = "voce-esta-aqui";

function centroid(polygon: [number, number][]): Point {
  const sum = polygon.reduce((acc, [x, y]) => ({ x: acc.x + x, y: acc.y + y }), { x: 0, y: 0 });
  return { x: sum.x / polygon.length, y: sum.y / polygon.length };
}

export function MallMap() {
  const { data, error, loading, retry } = useMallData();

  const [activeFloorId, setActiveFloorId] = useState("terreo");
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [activeCategoryIds, setActiveCategoryIds] = useState<Set<string>>(new Set());
  const [mode25d, setMode25d] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [userPositions, setUserPositions] = useState<Record<string, Point>>({});

  const is25d = mode25d && !placing;
  const viewportApi = useMapViewport(is25d);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUserPositions(JSON.parse(raw));
    } catch {
      // dados corrompidos: ignora
    }
  }, []);

  useEffect(() => {
    if (Object.keys(userPositions).length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userPositions));
    }
  }, [userPositions]);

  const categoriesById = useMemo(
    () => new Map((data?.categories ?? []).map((c) => [c.id, c])),
    [data]
  );
  const zonesById = useMemo(() => new Map((data?.zones ?? []).map((z) => [z.id, z])), [data]);

  const activeFloor = data?.floors.find((f) => f.id === activeFloorId) ?? null;
  const floorStores = useMemo(
    () => (data?.stores ?? []).filter((s) => s.floorId === activeFloorId),
    [data, activeFloorId]
  );
  const floorZones = useMemo(
    () => (data?.zones ?? []).filter((z) => z.floorId === activeFloorId),
    [data, activeFloorId]
  );
  const floorAmenities = useMemo(
    () => (data?.amenities ?? []).filter((a) => a.floorId === activeFloorId),
    [data, activeFloorId]
  );
  const selectedStore = data?.stores.find((s) => s.id === selectedStoreId) ?? null;

  if (loading) return <MapSkeleton />;

  if (error || !data || !activeFloor) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-[#33415f] p-6">
        <div className="max-w-sm rounded-2xl bg-slate-900/90 p-6 text-center text-slate-100 shadow-xl">
          <p className="text-base font-semibold">Falha ao carregar dados do shopping</p>
          <p className="mt-1.5 text-sm text-slate-400">
            Verifique se o banco local está em execução (supabase start) e tente novamente.
          </p>
          <Button onClick={retry} className="mt-4 bg-blue-600 text-white hover:bg-blue-700">
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  function selectStore(store: Store, center: boolean) {
    setActiveFloorId(store.floorId);
    setSelectedStoreId(store.id);
    setDetailOpen(true);
    if (center) viewportApi.centerOn(centroid(store.polygon), 2.4);
  }

  function toggleCategory(categoryId: string | null) {
    setActiveCategoryIds((prev) => {
      if (categoryId === null) return new Set();
      const next = new Set(prev);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  }

  function selectLandmark(landmark: Landmark) {
    setActiveFloorId(landmark.floorId);
    setUserPositions((prev) => ({ ...prev, [landmark.floorId]: landmark.position }));
    viewportApi.centerOn(landmark.position, 1.4);
  }

  function placePosition(point: Point) {
    setUserPositions((prev) => ({ ...prev, [activeFloorId]: point }));
    setPlacing(false);
  }

  function focusZone(zone: Zone) {
    setActiveFloorId(zone.floorId);
    viewportApi.centerOn(centroid(zone.area), 1.6);
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="absolute inset-0 overflow-hidden bg-[#33415f]">
        <MapCanvas
          floor={activeFloor}
          stores={floorStores}
          zones={floorZones}
          amenities={floorAmenities}
          selectedStoreId={selectedStoreId}
          activeCategoryIds={activeCategoryIds}
          is25d={is25d}
          placing={placing}
          userPosition={userPositions[activeFloorId] ?? null}
          viewportApi={viewportApi}
          onStoreClick={(store) => selectStore(store, false)}
          onZoneClick={focusZone}
          onPlacePosition={placePosition}
        />

        {/* Painel lateral esquerdo (estilo quiosque) */}
        <div className="absolute left-4 top-4 z-10 flex w-48 flex-col gap-2.5">
          <div className="rounded-xl bg-slate-900/90 px-4 py-3 shadow-xl backdrop-blur">
            <h1 className="text-2xl font-extrabold uppercase tracking-wide text-white">
              {activeFloor.name}
            </h1>
          </div>

          <div className="flex w-fit flex-col rounded-xl bg-slate-900/90 shadow-xl backdrop-blur">
            <button
              onClick={() => viewportApi.zoomBy(1.3)}
              aria-label="Aproximar"
              className="flex h-10 w-11 items-center justify-center rounded-t-xl text-slate-100 hover:bg-white/10"
            >
              <Plus className="size-4" />
            </button>
            <div className="h-px bg-white/10" />
            <button
              onClick={() => viewportApi.zoomBy(1 / 1.3)}
              aria-label="Afastar"
              className="flex h-10 w-11 items-center justify-center rounded-b-xl text-slate-100 hover:bg-white/10"
            >
              <Minus className="size-4" />
            </button>
          </div>

          <FloorSwitcher
            floors={data.floors}
            activeFloorId={activeFloorId}
            onChange={(id) => setActiveFloorId(id)}
          />

          <div className="flex flex-col rounded-xl bg-slate-900/90 p-1.5 shadow-xl backdrop-blur">
            <button
              onClick={() => setCategoriesOpen((v) => !v)}
              aria-expanded={categoriesOpen}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-200 transition-colors hover:bg-white/10"
            >
              <LayoutGrid className="size-4 shrink-0 text-blue-400" />
              Categorias
            </button>
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-200 transition-colors hover:bg-white/10"
            >
              <Search className="size-4 shrink-0 text-blue-400" />
              Buscar loja
            </button>
            <LocateMe
              floors={data.floors}
              landmarks={data.landmarks}
              onSelectLandmark={selectLandmark}
              onStartPlacing={() => setPlacing(true)}
            />
            <button
              onClick={() => setMode25d((m) => !m)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-200 transition-colors hover:bg-white/10"
            >
              {mode25d ? (
                <Square className="size-4 shrink-0 text-blue-400" />
              ) : (
                <Box className="size-4 shrink-0 text-blue-400" />
              )}
              {mode25d ? "Visão 2D" : "Visão 2.5D"}
            </button>
          </div>

          {categoriesOpen && (
            <div className="flex flex-wrap gap-1.5 rounded-xl bg-slate-900/90 p-3 shadow-xl backdrop-blur">
              <button onClick={() => toggleCategory(null)}>
                <Badge
                  variant={activeCategoryIds.size === 0 ? "default" : "outline"}
                  className={`cursor-pointer rounded-full ${
                    activeCategoryIds.size === 0
                      ? "bg-blue-600 text-white hover:bg-blue-600"
                      : "border-white/20 text-slate-200"
                  }`}
                >
                  Todas
                </Badge>
              </button>
              {data.categories.map((cat) => {
                const active = activeCategoryIds.has(cat.id);
                return (
                  <button key={cat.id} onClick={() => toggleCategory(cat.id)}>
                    <Badge
                      variant={active ? "default" : "outline"}
                      className={`cursor-pointer rounded-full ${
                        active
                          ? "border-transparent text-slate-900"
                          : "border-white/20 text-slate-200"
                      }`}
                      style={active ? { backgroundColor: cat.color } : undefined}
                    >
                      {cat.name}
                    </Badge>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Bússola */}
        <div className="absolute right-4 top-4 z-10 flex size-14 flex-col items-center justify-center rounded-full bg-slate-900/80 text-slate-100 shadow-xl backdrop-blur">
          <span className="text-[10px] font-bold leading-none">N</span>
          <Navigation className="size-5 fill-slate-100" />
        </div>

        {/* Aviso do modo "tocar no mapa" */}
        {placing && (
          <div className="pointer-events-none absolute inset-x-0 top-4 z-20 flex justify-center px-4">
            <div className="pointer-events-auto flex items-center gap-3 rounded-full bg-blue-600 py-2 pl-4 pr-2 text-sm font-semibold text-white shadow-xl">
              Toque no mapa para marcar sua posição
              <button
                onClick={() => setPlacing(false)}
                aria-label="Cancelar"
                className="flex size-6 items-center justify-center rounded-full bg-white/20 hover:bg-white/30"
              >
                <X className="size-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Legenda (inferior direita) */}
        <div className="absolute bottom-4 right-4 z-10">
          <MapLegend zones={floorZones} />
        </div>

        {/* Dica de uso (inferior centro) */}
        <div className="pointer-events-none absolute inset-x-0 bottom-4 z-0 hidden justify-center md:flex">
          <div className="rounded-xl bg-slate-900/80 px-4 py-2 text-center text-xs text-slate-300 shadow-xl backdrop-blur">
            🖐️ Arraste para mover o mapa
            <br />
            Use o scroll ou pince para dar zoom
          </div>
        </div>

        <SearchPanel
          open={searchOpen}
          onOpenChange={setSearchOpen}
          floors={data.floors}
          stores={data.stores}
          categoriesById={categoriesById}
          onSelectStore={(store) => selectStore(store, true)}
        />

        <StoreDetailPanel
          store={selectedStore}
          category={selectedStore ? categoriesById.get(selectedStore.categoryId) ?? null : null}
          zone={selectedStore?.zoneId ? zonesById.get(selectedStore.zoneId) ?? null : null}
          floor={
            selectedStore
              ? data.floors.find((f) => f.id === selectedStore.floorId) ?? null
              : null
          }
          open={detailOpen}
          onOpenChange={setDetailOpen}
          onViewOnMap={() => {
            if (!selectedStore) return;
            setDetailOpen(false);
            setActiveFloorId(selectedStore.floorId);
            viewportApi.centerOn(centroid(selectedStore.polygon), 2.4);
          }}
        />
      </div>
    </TooltipProvider>
  );
}
