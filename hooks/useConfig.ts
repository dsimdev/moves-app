"use client";

import { useEffect, useState } from "react";
import { ConfigUsuario } from "@/types";
import { obtenerConfig } from "@/services/firebase/config";

export function useConfig(userId: string | undefined) {
  const [config, setConfig] = useState<ConfigUsuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetch = async () => {
      try {
        const data = await obtenerConfig(userId);
        setConfig(data);
      } catch (err) {
        console.error("Error fetching config:", err);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [userId]);

  return { config, loading };
}
