"use client";

import { useCallback, useRef, useState } from "react";
import type { Point } from "@/lib/mall-types";

export const VIEW_W = 1000;
export const VIEW_H = 700;
const MIN_SCALE = 0.5;
const MAX_SCALE = 4;

const TILT_RAD = (55 * Math.PI) / 180;
const SPIN_RAD = (15 * Math.PI) / 180;

export interface Viewport {
  scale: number;
  tx: number;
  ty: number;
}

function clampViewport(v: Viewport): Viewport {
  const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, v.scale));
  const tx = Math.min(VIEW_W - 60, Math.max(-VIEW_W * scale + 60, v.tx));
  const ty = Math.min(VIEW_H - 60, Math.max(-VIEW_H * scale + 60, v.ty));
  return { scale, tx, ty };
}

/**
 * Converte um delta em pixels de tela para unidades do viewBox.
 * No modo 2.5D compensa (aproximadamente) o achatamento do rotateX
 * e o giro do rotateZ aplicados no wrapper.
 */
function screenDeltaToMap(
  dx: number,
  dy: number,
  pxToUnit: number,
  is25d: boolean
): [number, number] {
  const ux = dx * pxToUnit;
  const uy = dy * pxToUnit;
  if (!is25d) return [ux, uy];
  const uy2 = uy / Math.cos(TILT_RAD);
  const c = Math.cos(SPIN_RAD);
  const s = Math.sin(SPIN_RAD);
  return [c * ux - s * uy2, s * ux + c * uy2];
}

export function useMapViewport(is25d: boolean) {
  const [viewport, setViewport] = useState<Viewport>({ scale: 0.9, tx: 50, ty: 35 });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchDist = useRef<number | null>(null);
  const dragging = useRef(false);
  const moved = useRef(false);

  const pxToUnit = useCallback(() => {
    const rect = containerRef.current?.getBoundingClientRect();
    return rect && rect.width > 0 ? VIEW_W / rect.width : 1;
  }, []);

  const zoomBy = useCallback((factor: number) => {
    setViewport((v) => {
      const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, v.scale * factor));
      const k = scale / v.scale;
      // Mantém o centro do viewBox fixo ao dar zoom.
      const cx = VIEW_W / 2;
      const cy = VIEW_H / 2;
      return clampViewport({
        scale,
        tx: cx - (cx - v.tx) * k,
        ty: cy - (cy - v.ty) * k,
      });
    });
  }, []);

  const centerOn = useCallback((point: Point, targetScale?: number) => {
    setViewport((v) => {
      const scale = Math.min(
        MAX_SCALE,
        Math.max(MIN_SCALE, targetScale ?? Math.max(v.scale, 1.6))
      );
      return clampViewport({
        scale,
        tx: VIEW_W / 2 - point.x * scale,
        ty: VIEW_H / 2 - point.y * scale,
      });
    });
  }, []);

  const reset = useCallback(() => {
    setViewport({ scale: 0.9, tx: 50, ty: 35 });
  }, []);

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      zoomBy(e.deltaY < 0 ? 1.15 : 1 / 1.15);
    },
    [zoomBy]
  );

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    dragging.current = true;
    moved.current = false;
    pinchDist.current = null;
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      const prev = pointers.current.get(e.pointerId);
      if (!prev) return;
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      const pts = Array.from(pointers.current.values());
      if (pts.length >= 2) {
        // Pinch: zoom pela variação da distância entre os dois toques.
        const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        if (pinchDist.current != null && pinchDist.current > 0) {
          const factor = d / pinchDist.current;
          if (Math.abs(factor - 1) > 0.01) zoomBy(factor);
        }
        pinchDist.current = d;
        moved.current = true;
        return;
      }

      const dx = e.clientX - prev.x;
      const dy = e.clientY - prev.y;
      if (Math.abs(dx) + Math.abs(dy) > 1) moved.current = true;
      const [ux, uy] = screenDeltaToMap(dx, dy, pxToUnit(), is25d);
      setViewport((v) => clampViewport({ ...v, tx: v.tx + ux, ty: v.ty + uy }));
    },
    [is25d, pxToUnit, zoomBy]
  );

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size === 0) dragging.current = false;
    pinchDist.current = null;
  }, []);

  /** true se o último gesto foi um arraste (para não tratar como clique). */
  const wasDrag = useCallback(() => moved.current, []);

  return {
    viewport,
    containerRef,
    zoomBy,
    centerOn,
    reset,
    wasDrag,
    handlers: { onWheel, onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp },
  };
}
