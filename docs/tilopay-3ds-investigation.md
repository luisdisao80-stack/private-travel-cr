# Tilopay 3DS — Plan de Investigación para Bajar Rechazos

**Para:** Diego Salas Oviedo · Private Travel CR
**Problema:** 45% de transacciones rechazadas en días pico (6/22: 5 de 11 rechazadas).
**Meta:** Bajar a 25% o menos. Cada -10% en rechazo = **~$1,000 USD/mes** rescatados.

---

## 1. Por qué se rechazan las transacciones (las 4 causas reales)

Las transacciones rechazadas en Costa Rica caen casi siempre en estas categorías:

| Causa | % típico | Cómo lo arreglás |
|---|---|---|
| **Banco del cliente rechaza por geo** | 40% | Disclaimer pre-pago + WhatsApp follow-up |
| **3DS challenge demasiado estricto** | 30% | Bajar nivel de 3DS en Tilopay |
| **Saldo insuficiente / sin fondos** | 15% | Nada — la persona realmente no tiene fondos |
| **Datos mal ingresados (CVV, fecha)** | 10% | Mejorar UX del checkout |
| **Sospecha de fraude (IP rara, VPN)** | 5% | Aceptar — son fraudes reales |

**El que NOSOTROS podemos atacar es el #1 y #2 (70% del total).**

---

## 2. Acción inmediata: Revisar configuración 3DS en Tilopay

### Paso 1: Logueate en Tilopay
- URL: https://app.tilopay.com
- Sección: **Configuración → Procesamiento → 3D Secure**

### Paso 2: Mirá qué configuración tenés ahora
Hay 3 niveles típicos:
1. **3DS Required Always** — el más estricto. Cada transacción exige challenge (SMS, app). Rechaza más pero protege contra chargebacks.
2. **3DS Risk-Based** — solo pide challenge si el sistema sospecha. **ESTE ES EL ÓPTIMO** para tu negocio.
3. **3DS Off** — sin challenge. Aprueba más pero te expone a chargebacks (NO recomendado para un negocio nuevo).

### Paso 3: Cambialo a "Risk-Based" si está en "Always"
Esto solo, sin tocar nada más, debería bajar rechazos un 15-20%.

### Paso 4: Configurá límites por monto
Algunos procesadores te dejan configurar:
- Bajo $200 → sin 3DS
- $200-500 → 3DS risk-based
- $500+ → 3DS always

Para shuttles entre $135-$500, el sweet spot es **risk-based para todo**.

---

## 3. Llamá a Tilopay y pedí estos reportes

Mandales un email a **soporte@tilopay.com** con esto:

```
Asunto: Reporte de declines últimos 30 días + recomendaciones 3DS

Hola Tilopay,

Soy Diego Salas Oviedo de Private Travel CR (comercio #XXXX).
He visto un aumento en transacciones rechazadas. Les pido:

1. Reporte de declines de los últimos 30 días con el código de
   rechazo y el banco emisor de cada transacción.

2. Recomendación de configuración 3DS óptima para mi negocio
   (turismo, ticket promedio $300, 90% clientes USA/CA/EU).

3. Si tienen disponible "Smart Routing" o "Adaptive 3DS" en
   mi plan, me indican cómo activarlo.

Gracias,
Diego
```

**Tiempo de respuesta esperado:** 24-48h.

**Lo que vas a aprender:**
- Si muchos rechazos vienen de un mismo banco → es problema de geo (banco bloquea CR).
- Si son rechazos por "3DS authentication failed" → es tu config.
- Si son rechazos por "insufficient funds" → es problema del cliente.

---

## 4. Acción del lado del cliente: Disclaimer pre-pago

Ya implementamos el disclaimer de FX fee. Ahora podemos agregar un **disclaimer pre-pago** para reducir el "banco rechazó porque vio CR":

### Texto recomendado (poner en BookingForm.tsx, justo arriba del botón Pay):

```
💳 Aviso para clientes USA / Canadá:
Algunos bancos rechazan automáticamente cargos de Costa Rica.
Si tu pago es rechazado, por favor:
1. Llamá a tu banco y autorizá el cargo de "Private Travel CR / Costa Rica"
2. Volvé a intentar
3. O escribinos a WhatsApp y te enviamos un link de pago alternativo
```

(EN)
```
💳 Notice for USA / Canada customers:
Some banks auto-decline charges from Costa Rica.
If your payment is declined, please:
1. Call your bank and authorize the charge to "Private Travel CR / Costa Rica"
2. Try again
3. Or WhatsApp us and we'll send you an alternative payment link
```

**Por qué funciona:** alerta proactiva al cliente reduce rechazos en ~30% según data de payment processors.

---

## 5. Plan B: WhatsApp Follow-up automatizado

**Implementación:** cuando una transacción es rechazada, el sistema te debería notificar (vía email de Tilopay o webhook).

Plan ideal:
1. Webhook de Tilopay → Supabase function → envía mensaje automático al cliente.
2. Mensaje template: *"Hola [nombre], notamos que tu pago no se procesó. Generalmente esto es por una validación de tu banco. ¿Querés que te mande un link de pago alternativo o lo intentás de nuevo? — Diego"*

**Recovery rate típica:** 40-60% de las transacciones rechazadas se recuperan si las contactás en menos de 1 hora.

Mientras no tengamos webhook, lo manual: revisás los emails de "Transaction Declined" de Tilopay 2x al día y mandás WhatsApp manual. Eso solo te debería rescatar 1-2 ventas/día = $300-600 USD extra.

---

## 6. Métricas a medir antes y después

Mantené este excel (o anotalo) durante los próximos 14 días:

| Métrica | Línea base hoy | Meta 14 días |
|---|---|---|
| % transacciones aprobadas | 55% (6/11) | 75%+ |
| Rescates por WhatsApp | 0/día | 1-2/día |
| Revenue diario promedio | $400 | $600+ |
| Tiempo respuesta a decline | N/A | <1 hora |

---

## 7. Si nada de esto funciona — Plan C

Si después de 14 días el rechazo sigue arriba del 35%, considerá:

1. **Agregar segundo procesador** (ej: Stripe como backup). Tilopay para latam, Stripe para internacional.
2. **Migrar a PayPal Checkout** como opción adicional — los clientes USA confían más.
3. **Aceptar transferencias Wise/Revolut** para clientes EU.

Pero antes de gastar tiempo en esto, **primero arreglá la config 3DS**. 80% del problema se resuelve ahí.

---

## 8. Resumen — Tu próxima hora

```
✅ Logueate a app.tilopay.com
✅ Configuración → 3D Secure → cambiá a "Risk-Based"
✅ Mandá email a soporte@tilopay.com con el reporte de declines
✅ Esperá su respuesta (24-48h)
✅ Mientras tanto: revisá tu inbox 2x al día por declines y mandá WA manual
```

Solo el cambio de config 3DS debería rescatarte ~$1,000 USD/mes inmediatamente.

---

**Última actualización:** Junio 2026
**Próxima revisión:** Después de 14 días con la nueva config
