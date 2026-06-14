import { storage } from "@/services/firebase/firebase";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

// Sube un comprobante a users/{uid}/comprobantes/... y devuelve URL + path.
// El path es independiente del id del movimiento (se genera al vuelo), así se
// puede subir antes de crear el documento.
export async function uploadComprobante(uid: string, file: File): Promise<{ url: string; path: string }> {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `users/${uid}/comprobantes/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const r = ref(storage, path);
  await uploadBytes(r, file, { contentType: file.type || "image/jpeg" });
  const url = await getDownloadURL(r);
  return { url, path };
}

// Borra un comprobante por su path. Best-effort (ignora si ya no existe).
export async function deleteComprobante(path: string | undefined): Promise<void> {
  if (!path) return;
  try { await deleteObject(ref(storage, path)); } catch { /* ya no existe / sin permiso */ }
}
