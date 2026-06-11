# UTM Cheatsheet — Cómo etiquetar tus links para saber qué marketing funciona

**Fecha:** Junio 2026
**Para:** Diego (uso interno — esto NO se publica)

---

## Por qué importa

Cada vez que pegás un link a privatetravelcr.com en Instagram, WhatsApp, Facebook, mail, etc., podés agregarle "etiquetas" invisibles (UTM). Cuando alguien reserva habiendo entrado por ese link, **el admin te dice exactamente qué etiqueta tenía**. Sin etiquetas, todo se mezcla y no sabés qué te funciona.

**Ejemplo real:**
- Posteás una historia en Instagram con un link sin etiquetas → 2 reservas llegan → no sabés si fueron por la historia o por Google
- Posteás la misma historia con `?utm_source=instagram&utm_campaign=junio-stories` → las 2 reservas aparecen con esa etiqueta en el admin → **sabés que esa historia generó $500**

---

## Las 3 etiquetas que usás casi siempre

| Etiqueta | Qué significa | Ejemplos |
|---|---|---|
| `utm_source` | De dónde viene el link | `instagram`, `whatsapp`, `facebook`, `youtube`, `email`, `reddit` |
| `utm_medium` | Qué tipo de contenido | `post`, `story`, `bio`, `dm`, `reel`, `social`, `referral` |
| `utm_campaign` | Qué campaña específica | `junio-2026`, `promo-arenal`, `referidos-marzo` |

Las otras 2 (`utm_content` y `utm_term`) son opcionales. No las uses al principio.

---

## Plantillas copy-paste (cambiá solo lo amarillo)

### 📱 Instagram — historia (story)
```
https://privatetravelcr.com/?utm_source=instagram&utm_medium=story&utm_campaign=NOMBRE-CAMPAÑA
```
Reemplazá `NOMBRE-CAMPAÑA` por algo descriptivo y corto, ej: `junio-stories`, `promo-arenal`.

### 📱 Instagram — link en bio
```
https://privatetravelcr.com/?utm_source=instagram&utm_medium=bio&utm_campaign=bio-2026
```

### 📱 Instagram — post normal en feed
```
https://privatetravelcr.com/?utm_source=instagram&utm_medium=post&utm_campaign=NOMBRE-CAMPAÑA
```

### 🎥 Instagram / TikTok — reel
```
https://privatetravelcr.com/?utm_source=instagram&utm_medium=reel&utm_campaign=NOMBRE-CAMPAÑA
```

### 📘 Facebook — post
```
https://privatetravelcr.com/?utm_source=facebook&utm_medium=post&utm_campaign=NOMBRE-CAMPAÑA
```

### 💬 WhatsApp — link en chat individual
```
https://privatetravelcr.com/?utm_source=whatsapp&utm_medium=dm&utm_campaign=consulta-personal
```

### 💬 WhatsApp — link en grupo / status
```
https://privatetravelcr.com/?utm_source=whatsapp&utm_medium=group&utm_campaign=NOMBRE-CAMPAÑA
```

### ✉️ Email a clientes pasados (newsletter)
```
https://privatetravelcr.com/?utm_source=email&utm_medium=newsletter&utm_campaign=newsletter-junio
```

### 🤝 Para referidos de hoteles / partners
```
https://privatetravelcr.com/?utm_source=referral&utm_medium=hotel&utm_campaign=hotel-NOMBRE
```
Ejemplo: hotel Tabacón te manda clientes → usá `utm_campaign=hotel-tabacon`. Así sabés cuánto te facturan los partners.

---

## Apuntando a páginas específicas (no solo home)

Funciona igual con cualquier URL del sitio:

### Si querés mandar gente directo a SJO → La Fortuna
```
https://privatetravelcr.com/routes/sjo-la-fortuna?utm_source=instagram&utm_medium=story&utm_campaign=ruta-arenal
```

### Si querés mandar gente directo al cotizador con la ruta pre-cargada
```
https://privatetravelcr.com/book?from=SJO%20-%20Juan%20Santamaria%20Int.%20Airport&to=La%20Fortuna%20%28Arenal%29&utm_source=instagram&utm_medium=story&utm_campaign=promo-arenal
```

### Si querés mandar a un blog tuyo
```
https://privatetravelcr.com/blog/costa-rica-7-day-itinerary?utm_source=facebook&utm_medium=share&utm_campaign=itinerario-7dias
```

---

## Reglas de oro

1. **Todo en minúsculas y sin espacios.** `Instagram` y `instagram` son DIFERENTES para el sistema → siempre `instagram`.
2. **Sin tildes, sin ñ, sin caracteres raros.** `junio` no `Junio`. `arenal` no `arenál`.
3. **Usá guiones (-), no espacios.** `promo-arenal-junio` no `promo arenal junio`.
4. **Sé consistente.** Si una vez le dices `instagram` y otra `IG`, en el admin van a salir como dos canales distintos y te confunde.
5. **Una sola campaña por contexto.** Si estás haciendo "promo de junio" en Instagram, Facebook y WhatsApp, usá la MISMA `utm_campaign=promo-junio-2026` en los 3. Cambiá solo `utm_source`. Así podés comparar canales para la misma campaña.

---

## Cómo leer el admin después

En `/admin/[order]`, cada reserva nueva va a tener al final una sección:

```
📈 WHERE THIS BOOKING CAME FROM
Source:     instagram
Landed on:  /?utm_source=instagram&utm_medium=story&utm_campaign=junio-stories
UTM:        [source: instagram] [medium: story] [campaign: junio-stories]
Location:   🇺🇸 Dallas, TX, US
Device:     📱 Mobile
```

→ Esa reserva vino de tu historia de Instagram de junio. Ya lo sabés.

---

## Las 5 campañas más útiles para empezar

Sugerencias concretas para implementar esta semana:

1. **`utm_campaign=bio-instagram-2026`** — el link en tu bio de Instagram. Actualizá ahora.
2. **`utm_campaign=respuestas-reddit`** — cuando contestás preguntas en r/CostaRicaTravel, pegá el link con esa etiqueta. En 30 días sabés cuánto convierte Reddit.
3. **`utm_campaign=referidos-hoteles`** — pasale ese link a los hoteles partners (Tabacón, Nayara, etc.). Cuando un cliente reserva con esa etiqueta = vino del partner.
4. **`utm_campaign=whatsapp-status`** — si publicás status en WhatsApp con link al sitio, etiquetá. La gente de tu lista de contactos suele ser tu mejor conversor.
5. **`utm_campaign=mail-confirmacion-vuelta`** — el día que mandás email a clientes pasados pidiendo review, agregales este link con esa etiqueta. Si reservan, sabés que es un cliente repetido.

---

## Lo que NO recomiendo (no te compliques)

- ❌ No uses `utm_content` ni `utm_term` al principio — son para casos avanzados (A/B testing de copy en ads).
- ❌ No uses URL shorteners (bit.ly, etc.) que escondan los UTM — algunos los preservan, otros no. Posteá la URL completa o usa el shortener nativo de la plataforma (Instagram corta automáticamente sin perder UTMs).
- ❌ No inventes etiquetas distintas para la misma cosa cada vez. Mantené una lista fija.

---

**Cuando tengas dudas:** abrí esta guía o preguntame. Mejor empezar simple y consistente que perfecto y desorganizado.
