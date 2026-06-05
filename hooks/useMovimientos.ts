"use client";

import { useEffect, useState } from "react";
import { Movimiento } from "@/types";
import { obtenerMovimientos } from "@/services/firebase/movimientos";

export function useMovimientos(userId: string | undefined, periodoId?: string) {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetch = async () => {
      try {
        const data = await obtenerMovimientos(userId, periodoId);
        setMovimientos(data);
      } catch (err) {
        console.error("Error fetching movimientos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [userId, periodoId]);

  return { movimientos, loading };
}
