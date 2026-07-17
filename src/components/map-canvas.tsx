"use client";

import { useRef } from "react";
import type { Amenity, Floor, Point, Store, Zone } from "@/lib/mall-types";
import { VIEW_H, VIEW_W, type useMapViewport } from "@/hooks/use-map-viewport";
import { FloorShape } from "@/components/floor-shape";

interface MapCanvasProps {
  floor: Floor;
  stores: Store[];
  zones: Zone[];
  amenities: Amenity[];
  selectedStoreId: string | null;
  activeCategoryIds: Set<string>;
  is25d: boolean;
  placing: boolean;
  userPosition: Point | null;
  viewportApi: ReturnType<typeof useMapViewport>;
  onStoreClick: (store: Store) => void;
  onZoneClick: (zone: Zone) => void;
  onPlacePosition: (point: Point) => void;
}

export function MapCanvas({
  floor,
  stores,
  zones,
  amenities,
  selectedStoreId,
  activeCategoryIds,
  is25d,
  placing,
  userPosition,
  viewportApi,
  onStoreClick,
  onZoneClick,
  onPlacePosition,
}: MapCanvasProps) {
  const { viewport, containerRef, handlers, wasDrag } = viewportApi;
  const innerRef = useRef<SVGGElement | null>(null);

  function handleMapClick(e: React.MouseEvent) {
    if (!placing || wasDrag() || !innerRef.current) return;
    // Só é chamado com o mapa plano (o modo "tocar no mapa" força 2D),
    // então o CTM inverso do <g> converte tela → coordenadas do mapa.
    const ctm = innerRef.current.getScreenCTM();
    if (!ctm) return;
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    if (pt.x < 0 || pt.x > VIEW_W || pt.y < 0 || pt.y > VIEW_H) return;
    onPlacePosition({ x: Math.round(pt.x), y: Math.round(pt.y) });
  }

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 touch-none overflow-hidden bg-[#33415f] ${
        placing ? "cursor-crosshair" : "cursor-grab active:cursor-grabbing"
      }`}
      {...handlers}
    >
      <div
        className="h-full w-full transition-transform duration-500 ease-out"
        style={{
          transform: is25d
            ? "perspective(1400px) rotateX(55deg) rotateZ(-15deg) scale(1.08)"
            : "none",
        }}
      >
        <svg
          className="h-full w-full"
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="xMidYMid meet"
          onClick={handleMapClick}
        >
          <g
            ref={innerRef}
            transform={`translate(${viewport.tx} ${viewport.ty}) scale(${viewport.scale})`}
          >
            <FloorShape
              key={floor.id}
              floor={floor}
              stores={stores}
              zones={zones}
              amenities={amenities}
              selectedStoreId={selectedStoreId}
              activeCategoryIds={activeCategoryIds}
              is25d={is25d}
              scale={viewport.scale}
              userPosition={userPosition}
              placing={placing}
              onStoreClick={onStoreClick}
              onZoneClick={onZoneClick}
            />
          </g>
        </svg>
      </div>
    </div>
  );
}
