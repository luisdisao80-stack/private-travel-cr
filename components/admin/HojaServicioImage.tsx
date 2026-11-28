// Versión satori (next/og ImageResponse) de la hoja de servicio. Mismo diseño
// que lib/hoja-servicio.ts renderHojaHtml, pero solo con flexbox e inline
// styles, que es lo único que satori entiende (no hay grid, ni <ul>, ni ::before).
import type { CSSProperties } from "react";
import { HOJA_COLORS as c, type HojaModel } from "@/lib/hoja-servicio";

const col: CSSProperties = { display: "flex", flexDirection: "column" };
const row: CSSProperties = { display: "flex", flexDirection: "row" };

const card: CSSProperties = {
  ...col,
  background: c.card,
  borderRadius: 18,
  padding: "24px 28px",
  borderLeft: `8px solid ${c.gold}`,
};
const k: CSSProperties = { fontSize: 20, letterSpacing: 3, color: c.gold, textTransform: "uppercase" };
const v: CSSProperties = { fontSize: 36, fontWeight: 700, marginTop: 8, lineHeight: 1.2 };
const s: CSSProperties = { fontSize: 26, color: c.text3, marginTop: 6, lineHeight: 1.3 };

export function HojaServicioImage({ m, logoSrc }: { m: HojaModel; logoSrc: string }) {
  return (
    <div
      style={{
        ...col,
        width: "100%",
        height: "100%",
        background: c.bg,
        color: c.text,
        padding: "56px 64px 48px",
        fontFamily: "Inter",
      }}
    >
      {/* Encabezado */}
      <div
        style={{
          ...row,
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `2px solid ${c.gold}`,
          paddingBottom: 28,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} alt="" style={{ height: 150, width: 343 }} />
        <div style={{ ...col, alignItems: "flex-end" }}>
          <div style={{ fontSize: 30, letterSpacing: 4, color: c.gold, fontWeight: 700 }}>HOJA DE SERVICIO</div>
          <div style={{ fontSize: 26, marginTop: 10, color: c.text2, textTransform: "capitalize" }}>{m.fechaTexto}</div>
          <div style={{ fontSize: 22, marginTop: 6, color: c.muted }}>{`Reserva ${m.orden}`}</div>
        </div>
      </div>

      {/* Chofer */}
      <div style={{ ...row, alignItems: "baseline", margin: "34px 0 10px", fontSize: 26, color: c.muted }}>
        <span>Chofer:</span>
        <span style={{ color: "#fff", fontSize: 34, marginLeft: 10, fontWeight: 700 }}>{m.chofer}</span>
      </div>

      {/* Datos */}
      <div style={{ ...col, marginTop: 26, gap: 22 }}>
        <div style={{ ...row, gap: 22 }}>
          <div style={{ ...card, width: 300, flexShrink: 0 }}>
            <div style={k}>Pickup</div>
            <div style={{ ...v, fontSize: 56 }}>{m.hora}</div>
          </div>
          <div style={{ ...card, flex: 1 }}>
            <div style={k}>Cliente</div>
            <div style={v}>{m.cliente}</div>
            <div style={s}>{`${m.pax} pasajero${m.pax === 1 ? "" : "s"} · ${m.vehiculo}`}</div>
          </div>
        </div>
        <div style={card}>
          <div style={k}>Recoger en</div>
          <div style={v}>{m.recoger}</div>
          <div style={s}>{m.zonaOrigen}</div>
        </div>
        <div style={card}>
          <div style={k}>Llevar a</div>
          <div style={v}>{m.llevar}</div>
          <div style={s}>{`${m.zonaDestino}${m.duracion ? ` · aprox. ${m.duracion}` : ""}`}</div>
        </div>
      </div>

      {/* Importante */}
      {m.extras.length > 0 && (
        <div style={{ ...col, marginTop: 24, background: c.card2, borderRadius: 18, padding: "22px 28px" }}>
          <div style={{ ...k, marginBottom: 10 }}>Importante</div>
          {m.extras.map((e, i) => (
            <div key={i} style={{ ...row, fontSize: 27, lineHeight: 1.45 }}>
              <span style={{ color: c.gold, width: 30, flexShrink: 0, paddingLeft: 6 }}>•</span>
              <span style={{ flex: 1 }}>{e}</span>
            </div>
          ))}
        </div>
      )}

      {/* Pago + neto */}
      <div style={{ ...row, marginTop: 30, gap: 22 }}>
        <div
          style={{
            ...col,
            flex: 1,
            borderRadius: 18,
            padding: "24px 28px",
            fontSize: 30,
            fontWeight: 700,
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            background: m.pagado ? c.okBg : c.noBg,
            color: m.pagado ? c.okText : c.noText,
            border: `2px solid ${m.pagado ? c.okBorder : c.noBorder}`,
          }}
        >
          <div>{m.pagado ? "SERVICIO PAGADO" : "PAGO PENDIENTE"}</div>
          <div>{m.pagado ? "No cobrar nada al cliente" : "Confirmar con Diego antes de salir"}</div>
        </div>
        {m.neto ? (
          <div style={{ ...col, flex: 1, background: c.gold, color: c.bg, borderRadius: 18, padding: "24px 28px", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontSize: 22, letterSpacing: 3, fontWeight: 700 }}>NETO CHOFER</div>
            <div style={{ fontSize: 64, fontWeight: 800, marginTop: 2 }}>{`$${m.neto}`}</div>
          </div>
        ) : (
          <div style={{ ...col, flex: 1, background: c.plantaBg, color: c.text2, borderRadius: 18, padding: "24px 28px", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontSize: 22, letterSpacing: 3, fontWeight: 700, color: c.gold }}>CHOFER DE PLANTA</div>
            <div style={{ fontSize: 34, fontWeight: 800, marginTop: 10 }}>Sin pago por servicio</div>
          </div>
        )}
      </div>

      <div style={{ ...row, justifyContent: "center", marginTop: 34, color: c.faint, fontSize: 20, letterSpacing: 1 }}>
        Private Travel CR · Cualquier duda, llamar a Diego · No compartir esta hoja con el cliente
      </div>
    </div>
  );
}
