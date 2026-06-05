"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePeriodos } from "@/hooks/usePeriodos";
import { useConfig } from "@/hooks/useConfig";
import { crearMovimiento } from "@/services/firebase/movimientos";
import { asignarPeriodoId } from "@/services/firebase/periodos";
import { COLORS } from "@/constants/colors";
import { TipoMovimiento } from "@/types";

export default function CargarPage() {
  const { user } = useAuth();
  const { periodos, periodoActivo } = usePeriodos(user?.uid);
  const { config } = useConfig(user?.uid);

  const [tipo, setTipo] = useState<TipoMovimiento>("Gasto");
  const [categoria, setCategoria] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [medioPago, setMedioPago] = useState("Mercado Pago");
  const [observaciones, setObservaciones] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const categoriasFiltradas = config?.categorias.filter((c) => {
    if (tipo === "Gasto") return c.tipo === "Gasto";
    if (tipo === "Ingreso") return c.tipo === "Ingreso";
    return false;
  }) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!user?.uid) throw new Error("Usuario no autenticado");
      if (!categoria) throw new Error("Selecciona una categoría");
      if (!monto) throw new Error("Ingresa un monto");
      if (!periodoActivo) throw new Error("No hay período activo");

      const timestampCarga = new Date();
      const periodoId = await asignarPeriodoId(timestampCarga, periodos);

      await crearMovimiento(user.uid, {
        id: "",
        timestampCarga,
        fecha,
        tipo,
        categoria,
        descripcion: descripcion.trim(),
        monto: parseFloat(monto),
        medioPago,
        observaciones,
        periodoId,
        userId: user.uid,
      });

      // Reset form
      setDescripcion("");
      setMonto("");
      setCategoria("");
      setError("");
      alert("Movimiento guardado ✅");
    } catch (err: any) {
      setError(err.message || "Error al guardar");
    } finally {
      setLoading(false);
    }
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
      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>
            Nuevo
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700 }}>Movimiento</h1>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Tipo */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 10, color: COLORS.muted, marginBottom: 6, letterSpacing: 1, textTransform: "uppercase" }}>
              Tipo
            </label>
            <div style={{ display: "flex", gap: 6 }}>
              {(["Gasto", "Ingreso", "Move", "CompraUSD"] as TipoMovimiento[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setTipo(t);
                    setCategoria("");
                  }}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 20,
                    fontSize: 11,
                    border: `1px solid ${tipo === t ? COLORS.accent : COLORS.muted}`,
                    background: tipo === t ? COLORS.accent : "transparent",
                    color: tipo === t ? COLORS.bg : COLORS.muted,
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Categoría */}
          {(tipo === "Gasto" || tipo === "Ingreso") && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 10, color: COLORS.muted, marginBottom: 6, letterSpacing: 1, textTransform: "uppercase" }}>
                Categoría
              </label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {categoriasFiltradas.map((c) => (
                  <button
                    key={c.nombre}
                    type="button"
                    onClick={() => setCategoria(c.nombre)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 20,
                      fontSize: 11,
                      border: `1px solid ${categoria === c.nombre ? COLORS.accent : COLORS.border}`,
                      background: categoria === c.nombre ? COLORS.accentDim : "transparent",
                      color: categoria === c.nombre ? COLORS.accent : COLORS.text,
                      cursor: "pointer",
                      fontWeight: 700,
                    }}
                  >
                    {c.nombre}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Descripción */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 10, color: COLORS.muted, marginBottom: 6, letterSpacing: 1, textTransform: "uppercase" }}>
              Descripción
            </label>
            <input
              type="text"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              style={{
                width: "100%",
                background: COLORS.surfaceAlt,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 6,
                padding: "10px 12px",
                color: COLORS.text,
                fontSize: 13,
                boxSizing: "border-box",
              }}
              disabled={loading}
            />
          </div>

          {/* Monto */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 10, color: COLORS.muted, marginBottom: 6, letterSpacing: 1, textTransform: "uppercase" }}>
              Monto
            </label>
            <input
              type="number"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              placeholder="0"
              style={{
                width: "100%",
                background: COLORS.surfaceAlt,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 6,
                padding: "10px 12px",
                color: COLORS.text,
                fontSize: 13,
                boxSizing: "border-box",
              }}
              disabled={loading}
            />
          </div>

          {/* Fecha */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 10, color: COLORS.muted, marginBottom: 6, letterSpacing: 1, textTransform: "uppercase" }}>
              Fecha
            </label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              style={{
                width: "100%",
                background: COLORS.surfaceAlt,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 6,
                padding: "10px 12px",
                color: COLORS.text,
                fontSize: 13,
                boxSizing: "border-box",
              }}
              disabled={loading}
            />
          </div>

          {/* Medio de pago */}
          {(tipo === "Gasto" || tipo === "Ingreso") && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 10, color: COLORS.muted, marginBottom: 6, letterSpacing: 1, textTransform: "uppercase" }}>
                Medio de pago
              </label>
              <div style={{ display: "flex", gap: 6 }}>
                {config?.mediosPago.map((m) => (
                  <button
                    key={m.nombre}
                    type="button"
                    onClick={() => setMedioPago(m.nombre)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 20,
                      fontSize: 11,
                      border: `1px solid ${medioPago === m.nombre ? COLORS.accent : COLORS.border}`,
                      background: medioPago === m.nombre ? COLORS.accentDim : "transparent",
                      color: medioPago === m.nombre ? COLORS.accent : COLORS.text,
                      cursor: "pointer",
                      fontWeight: 700,
                    }}
                  >
                    {m.nombre}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Observaciones */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 10, color: COLORS.muted, marginBottom: 6, letterSpacing: 1, textTransform: "uppercase" }}>
              Observaciones (opcional)
            </label>
            <input
              type="text"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              style={{
                width: "100%",
                background: COLORS.surfaceAlt,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 6,
                padding: "10px 12px",
                color: COLORS.text,
                fontSize: 13,
                boxSizing: "border-box",
              }}
              disabled={loading}
            />
          </div>

          {error && (
            <div style={{ background: COLORS.redDim, border: `1px solid ${COLORS.red}`, borderRadius: 6, padding: 12, marginBottom: 16, fontSize: 12, color: COLORS.red }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              background: COLORS.accent,
              color: COLORS.bg,
              border: "none",
              borderRadius: 6,
              padding: "12px 18px",
              fontSize: 11,
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            {loading ? "GUARDANDO..." : "CONFIRMAR"}
          </button>
        </form>
      </div>
    </div>
  );
}
