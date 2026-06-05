"use client";

import { useEffect, useState } from "react";
import { Periodo } from "@/types";
import { obtenerPeriodos, obtenerPeriodoActivo } from "@/services/firebase/periodos";

export function usePeriodos(userId: string | undefined) {
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [periodoActivo, setPeriodoActivo] = useState<Periodo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetch = async () => {
      try {
        const [todos, activo] = await Promise.all([
          obtenerPeriodos(userId),
          obtenerPeriodoActivo(userId),
        ]);
        setPeriodos(todos);
        setPeriodoActivo(activo);
      } catch (err) {
        console.error("Error fetching periodos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [userId]);

  return { periodos, periodoActivo, loading };
}
