import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// El service worker se sirve desde aquí (no desde /public) para inyectar la versión
// del build. Así cada deploy produce un sw.js distinto → el navegador detecta la
// actualización, instala el SW nuevo y lo deja "en espera" (sin activarse solo).
// La app muestra el banner y, al confirmar, le manda SKIP_WAITING para activarlo.
export function GET() {
  const version = process.env.NEXT_PUBLIC_APP_VERSION ?? "0";

  const sw = `
const VERSION = ${JSON.stringify(version)};
const CACHE = "finmoves-" + VERSION;
const PRECACHE = ["/", "/login", "/favicon.png", "/logo5-cropped.png", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)));
  // NO skipWaiting: el SW nuevo queda en espera hasta que el usuario confirme.
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api")) return;
  if (url.pathname === "/sw.js") return;

  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); return res; })
        .catch(() => caches.match(req).then((hit) => hit || caches.match("/")))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); return res; })
        .catch(() => cached);
      return cached || network;
    })
  );
});
`.trim();

  return new NextResponse(sw, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Service-Worker-Allowed": "/",
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
