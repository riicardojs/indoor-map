"use client";

import { useCallback, useEffect, useState } from "react";
import type { MallData } from "@/lib/mall-types";

export function useMallData() {
  const [data, setData] = useState<MallData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => {
    setError(null);
    setData(null);
    setAttempt((n) => n + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/mall")
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return (await res.json()) as MallData;
      })
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) setError("Falha ao carregar dados do shopping");
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  return { data, error, loading: !data && !error, retry };
}
