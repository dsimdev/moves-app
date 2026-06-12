// Desbloqueo biométrico local (WebAuthn / platform authenticator).
// Funciona como candado de UI sobre una sesión de Firebase ya activa: NO reemplaza
// la autenticación de Firebase ni verifica firmas en un servidor; solo exige una
// verificación biométrica del dispositivo (huella en Android) para revelar la app.

const KEY = "finmoves_biometric";

type BioConfig = { credentialId: string; uid: string };

export function biometricSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.PublicKeyCredential !== "undefined" &&
    !!navigator.credentials
  );
}

// Indica si el dispositivo tiene un autenticador de plataforma (sensor de huella, etc.)
export async function platformAuthenticatorAvailable(): Promise<boolean> {
  if (!biometricSupported()) return false;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

export function getBiometric(): BioConfig | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as BioConfig) : null;
  } catch {
    return null;
  }
}

export function isBiometricEnabledFor(uid: string | undefined): boolean {
  const cfg = getBiometric();
  return !!cfg && !!uid && cfg.uid === uid;
}

export function clearBiometric(): void {
  localStorage.removeItem(KEY);
}

function randomChallenge(): Uint8Array<ArrayBuffer> {
  const a = new Uint8Array(new ArrayBuffer(32));
  crypto.getRandomValues(a);
  return a;
}

function bufToB64(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

function b64ToBuf(b64: string): Uint8Array<ArrayBuffer> {
  const bin = atob(b64);
  const out = new Uint8Array(new ArrayBuffer(bin.length));
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

// Registra el autenticador de plataforma y guarda el credentialId localmente.
export async function registerBiometric(uid: string, email: string): Promise<void> {
  const cred = (await navigator.credentials.create({
    publicKey: {
      challenge: randomChallenge(),
      rp: { name: "FinMoves" },
      user: {
        id: new TextEncoder().encode(uid),
        name: email,
        displayName: email,
      },
      pubKeyCredParams: [
        { type: "public-key", alg: -7 },
        { type: "public-key", alg: -257 },
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "required",
      },
      timeout: 60000,
    },
  })) as PublicKeyCredential | null;

  if (!cred) throw new Error("No se pudo registrar la huella");
  const credentialId = bufToB64(cred.rawId);
  localStorage.setItem(KEY, JSON.stringify({ credentialId, uid } satisfies BioConfig));
}

// Pide verificación biométrica. Devuelve true si el usuario la pasó.
export async function verifyBiometric(): Promise<boolean> {
  const cfg = getBiometric();
  if (!cfg) return false;
  try {
    await navigator.credentials.get({
      publicKey: {
        challenge: randomChallenge(),
        allowCredentials: [
          { type: "public-key", id: b64ToBuf(cfg.credentialId), transports: ["internal"] },
        ],
        userVerification: "required",
        timeout: 60000,
      },
    });
    return true;
  } catch {
    return false;
  }
}
