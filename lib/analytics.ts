import { app } from "@/services/firebase/firebase";
import { getAnalytics, isSupported } from "firebase/analytics";

let inited = false;

// Inicializa Firebase Analytics solo en el browser y si el entorno lo soporta
// (isSupported descarta SSR, navegadores sin cookies/IndexedDB, etc.).
export async function initAnalytics() {
  if (inited || typeof window === "undefined") return;
  try {
    if (await isSupported()) {
      getAnalytics(app);
      inited = true;
    }
  } catch { /* analytics no disponible → seguimos sin métricas */ }
}
