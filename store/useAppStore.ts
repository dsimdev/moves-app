import { create } from "zustand";
import { Cotizacion } from "@/types";
import type { TipoCambioRef } from "@/types";

interface AppStore {
  cotizacion: Cotizacion | null;
  setCotizacion: (c: Cotizacion | null) => void;

  ultimoMedioPago: string;
  setUltimoMedioPago: (m: string) => void;

  tipoCambioRef: TipoCambioRef;
  setTipoCambioRef: (t: TipoCambioRef) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  cotizacion: null,
  setCotizacion: (c) => set({ cotizacion: c }),

  ultimoMedioPago: "Mercado Pago",
  setUltimoMedioPago: (m) => set({ ultimoMedioPago: m }),

  tipoCambioRef: "blue",
  setTipoCambioRef: (t) => set({ tipoCambioRef: t }),
}));
