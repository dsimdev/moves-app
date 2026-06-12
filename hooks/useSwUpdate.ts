"use client";

import { create } from "zustand";

interface SwUpdate {
  waiting: ServiceWorker | null;
  setWaiting: (sw: ServiceWorker | null) => void;
}

// Estado compartido: el ServiceWorker "en espera" cuando hay una versión nueva lista.
export const useSwUpdate = create<SwUpdate>((set) => ({
  waiting: null,
  setWaiting: (sw) => set({ waiting: sw }),
}));
