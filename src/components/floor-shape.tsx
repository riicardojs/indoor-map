"use client";

import type { Amenity, Floor, Point, Store, Zone } from "@/lib/mall-types";
import { amenityIcons, amenityLabels } from "@/lib/mall-icons";

// Contra-transformação 2D aproximada do wrapper 2.5D
// (inverso achatado de rotateX(55°) rotateZ(-15°)) para manter
// rótulos e ícones "de pé" e legíveis.
const COUNTER_25D = "rotate(15deg) scaleY(1.7434)";

function counterStyle(is25d: boolean): React.CSSProperties {
  return is25d
    ? { transform: COUNTER_25D, transformBox: "fill-box", transformOrigin: "center" }
    : {};
}

function pointsAttr(polygon: [number, number][]) {
  return polygon.map((p) => p.join(",")).join(" ");
}

interface FloorShapeProps {
  floor: Floor;
  stores: Store[];
  zones: Zone[];
  amenities: Amenity[];
  selectedStoreId: string | null;
  activeCategoryIds: Set<string>;
  is25d: boolean;
  scale: number;
  userPosition: Point | null;
  placing: boolean;
  onStoreClick: (store: Store) => void;
  onZoneClick: (zone: Zone) => void;
}

export function FloorShape({
  floor,
  stores,
  zones,
  amenities,
  selectedStoreId,
  activeCategoryIds,
  is25d,
  scale,
  userPosition,
  placing,
  onStoreClick,
  onZoneClick,
}: FloorShapeProps) {
  const showNumbers = scale >= 2.1;
  const filtering = activeCategoryIds.size > 0;

  return (
    <g className="floor-enter">
      {/* Ruas do entorno */}
      {(floor.decor.streets ?? []).map((street) => (
        <g key={street.label}>
          <path
            d={street.path}
            fill="none"
            stroke="#4b5563"
            strokeWidth={street.width}
            strokeLinecap="round"
          />
          <path
            d={street.path}
            fill="none"
            stroke="#9ca3af"
            strokeWidth={2}
            strokeDasharray="14 12"
          />
          <g style={{ ...counterStyle(is25d), pointerEvents: "none" }}>
            <rect
              x={street.labelPos.x - street.label.length * 3.4 - 8}
              y={street.labelPos.y - 10}
              width={street.label.length * 6.8 + 16}
              height={20}
              rx={10}
              fill="#111827"
              opacity={0.85}
            />
            <text
              x={street.labelPos.x}
              y={street.labelPos.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={11}
              fontWeight={600}
              fill="#f9fafb"
            >
              {street.label}
            </text>
          </g>
        </g>
      ))}

      {/* Laje do andar */}
      <path
        d={floor.outline}
        fill="#d9dadf"
        stroke="#aeb2bc"
        strokeWidth={4}
        style={{ filter: "drop-shadow(0 14px 18px rgba(0,0,0,0.45))" }}
      />

      {/* Piso colorido das alas */}
      {zones.map((zone) => (
        <polygon
          key={zone.id}
          points={pointsAttr(zone.area)}
          fill={zone.color}
          opacity={0.42}
        />
      ))}

      {/* Boxes */}
      {stores.map((store) => {
        const selected = store.id === selectedStoreId;
        const dimmed = filtering && !activeCategoryIds.has(store.categoryId);
        return (
          <g key={store.id} style={{ opacity: dimmed ? 0.25 : 1, transition: "opacity 200ms" }}>
            {is25d && (
              <polygon
                points={pointsAttr(store.polygon)}
                transform="translate(3, 5)"
                fill="#8e929c"
              />
            )}
            <polygon
              points={pointsAttr(store.polygon)}
              fill={selected ? "#bfdbfe" : "#fafafa"}
              stroke={selected ? "#2563eb" : "#c6c8ce"}
              strokeWidth={selected ? 2.5 : 1}
              strokeLinejoin="round"
              style={{ cursor: placing ? "crosshair" : "pointer" }}
              onClick={(e) => {
                if (placing) return;
                e.stopPropagation();
                onStoreClick(store);
              }}
            />
            {showNumbers && (
              <g style={{ ...counterStyle(is25d), pointerEvents: "none" }}>
                <text
                  x={store.labelPos.x}
                  y={store.labelPos.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={6.5}
                  fontWeight={700}
                  fill="#475569"
                >
                  {store.number}
                </text>
              </g>
            )}
          </g>
        );
      })}

      {/* Amenidades (pins azuis) */}
      {amenities.map((a) => {
        const Icon = amenityIcons[a.type];
        if (!Icon) return null;
        return (
          <foreignObject
            key={a.id}
            x={a.position.x - 11}
            y={a.position.y - 11}
            width={22}
            height={22}
            style={{ ...counterStyle(is25d), pointerEvents: "none", overflow: "visible" }}
          >
            <div
              title={amenityLabels[a.type]}
              className="flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 border-white bg-blue-600 text-white shadow-md"
            >
              <Icon size={11} strokeWidth={2.4} aria-label={amenityLabels[a.type]} />
            </div>
          </foreignObject>
        );
      })}

      {/* Pins das alas */}
      {zones.map((zone) => (
        <g
          key={`marker-${zone.id}`}
          style={{ ...counterStyle(is25d), cursor: "pointer" }}
          onClick={(e) => {
            e.stopPropagation();
            onZoneClick(zone);
          }}
        >
          <text
            x={zone.marker.x + 18}
            y={zone.marker.y}
            dominantBaseline="central"
            fontSize={12}
            fontWeight={800}
            fill="#ffffff"
            stroke="#111827"
            strokeWidth={3}
            paintOrder="stroke"
          >
            {zone.name}
          </text>
          <circle
            cx={zone.marker.x}
            cy={zone.marker.y}
            r={13}
            fill={zone.color}
            stroke="#ffffff"
            strokeWidth={3}
            style={{ filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.4))" }}
          />
          <text
            x={zone.marker.x}
            y={zone.marker.y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={9}
            fontWeight={800}
            fill="#ffffff"
          >
            {zone.initials}
          </text>
        </g>
      ))}

      {/* Você está aqui */}
      {userPosition && (
        <g style={{ pointerEvents: "none" }}>
          <circle
            cx={userPosition.x}
            cy={userPosition.y}
            r={14}
            fill="#3b82f6"
            opacity={0.25}
            className="pulse-ring"
          />
          <circle
            cx={userPosition.x}
            cy={userPosition.y}
            r={14}
            fill="#3b82f6"
            opacity={0.25}
            className="pulse-ring pulse-ring-delayed"
          />
          <g style={counterStyle(is25d)}>
            <circle
              cx={userPosition.x}
              cy={userPosition.y}
              r={11}
              fill="#ffffff"
              style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.45))" }}
            />
            <circle cx={userPosition.x} cy={userPosition.y} r={7} fill="#2563eb" />
            <rect
              x={userPosition.x - 52}
              y={userPosition.y + 18}
              width={104}
              height={20}
              rx={10}
              fill="#2563eb"
            />
            <text
              x={userPosition.x}
              y={userPosition.y + 28}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={9.5}
              fontWeight={800}
              fill="#ffffff"
            >
              VOCÊ ESTÁ AQUI
            </text>
          </g>
        </g>
      )}
    </g>
  );
}
