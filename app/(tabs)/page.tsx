"use client";

import { COLORS } from "@/constants/colors";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "firebase/auth";
import { auth } from "@/services/firebase/config";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <div
      style={{
        fontFamily: "'IBM Plex Mono', monospace",
        background: COLORS.bg,
        color: COLORS.text,
        minHeight: "100vh",
        padding: "24px 20px",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: 4, textTransform: "uppercase", marginBottom: 4 }}>
              Finanzas App
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -1 }}>
              Dashboard
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: COLORS.red,
              color: COLORS.bg,
              border: "none",
              borderRadius: 6,
              padding: "10px 18px",
              fontSize: 11,
              letterSpacing: 2,
              textTransform: "uppercase",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Logout
          </button>
        </div>

        <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 20 }}>
          <div style={{ fontSize: 14, color: COLORS.muted, marginBottom: 12 }}>
            Conectado como: <span style={{ color: COLORS.accent }}>{user?.email}</span>
          </div>
          <p style={{ color: COLORS.text, lineHeight: 1.6 }}>
            🚀 Estructura base lista. Próximas pantallas:<br/>
            • Cargar movimientos<br/>
            • Resumen de períodos<br/>
            • Reserva USD<br/>
            • Configuración
          </p>
        </div>
      </div>
    </div>
  );
}
