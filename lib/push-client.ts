"use client";

import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/services/firebase/firebase";

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

export function pushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window &&
    !!VAPID_PUBLIC
  );
}

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const out = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export async function isPushEnabled(): Promise<boolean> {
  if (!pushSupported()) return false;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  return !!sub;
}

// Pide permiso, suscribe y guarda la suscripción en Firestore.
export async function enablePush(uid: string): Promise<boolean> {
  if (!pushSupported()) return false;
  const perm = await Notification.requestPermission();
  if (perm !== "granted") return false;
  const reg = await navigator.serviceWorker.ready;
  // Una suscripción previa pudo crearse con OTRA clave VAPID (p. ej. tras regenerarla):
  // re-suscribir con una applicationServerKey distinta lanza InvalidStateError.
  // Por eso desuscribimos siempre y recreamos con la VAPID actual.
  const existing = await reg.pushManager.getSubscription();
  if (existing) await existing.unsubscribe().catch(() => {});
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC),
  });
  await setDoc(doc(db, `users/${uid}/config/push`), { subscription: sub.toJSON(), updatedAt: Date.now() });
  return true;
}

export async function disablePush(uid: string): Promise<void> {
  if (!pushSupported()) return;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (sub) await sub.unsubscribe();
  await deleteDoc(doc(db, `users/${uid}/config/push`)).catch(() => {});
}
