"use client";

import { useEffect, useState } from "react";

const CURRENT = process.env.NEXT_PUBLIC_APP_VERSION ?? "0";
const INTERVAL = 60_000;

export function useVersionCheck() {
  const [newVersion, setNewVersion] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      try {
        const res = await fetch("/api/version", { cache: "no-store" });
        const { version } = await res.json();
        if (!cancelled && version && version !== CURRENT) setNewVersion(true);
      } catch {}
    };

    // Chequeo inmediato al montar (no esperar el primer intervalo)
    check();

    const id = setInterval(check, INTERVAL);

    // Re-chequear cuando la app vuelve a primer plano (clave en PWA/móvil)
    const onVisible = () => {
      if (document.visibilityState === "visible") check();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return newVersion;
}
