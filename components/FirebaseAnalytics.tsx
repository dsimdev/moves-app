"use client";

import { useEffect } from "react";
import { initAnalytics } from "@/lib/analytics";

// Monta Analytics una vez del lado del cliente (no renderiza nada).
export function FirebaseAnalytics() {
  useEffect(() => { initAnalytics(); }, []);
  return null;
}
