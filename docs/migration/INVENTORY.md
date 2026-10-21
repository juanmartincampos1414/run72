# RUN — Inventario de rutas y funcionalidades (base para la migración visual)

> Estado al cerrar el hero aislado. Objetivo: llevar progresivamente todo el sitio
> al nuevo lenguaje visual (hero `/hero`) **conservando** todo el trabajo funcional,
> comercial y de contenido ya construido. Esta migración es por fases; el hero vive
> aislado en `/hero` y **no** se integró todavía.

## Checkpoint y ramas

- **Base funcional estable:** rama `feat/run-nubi-redesign`, commit **`2a6d612`**
  (P0: puente hover del dropdown + teclado, evidencia Relevo; sobre leads unificados
  `9dfc033` y portfolio/numeración `41132a7`). Etiquetada como
  **`checkpoint-funcional-estable`** (recuperable con `git checkout checkpoint-funcional-estable`).
- **Rama del hero:** `feat/run-hero-scene`, creada **desde** `2a6d612`. Verificado:
  no le falta ninguna corrección funcional posterior (`git log base ^hero` = vacío) y
  **solo agrega** `app/hero/*`, `components/marketing/hero-v2/*` y la dependencia
  `three` (sin tocar ningún archivo funcional → sin regresiones).
- **Rama descartada:** `feat/run-oryzo-pilot` (piloto editorial rechazado). No se usa.

**Leyenda de estado:** ✅ verificado en vivo · 🔎 revisado por código (no reverificado
esta ronda) · ⚠️ pendiente/bloqueante.

## 1. Público — Marketing

| Ruta | Qué es | Estado |
|---|---|---|
| `/` | Home integrada (Fase 2+): hero 3D + lenguaje cálido; proceso compacto (tabs), trabajos con miniaturas reales, franja "Experiencia detrás de RUN", cierre sin repetición | ✅ (verificado en vivo) |
| `/servicios` · `/servicios/[especialidad]` | Software a medida / Agentes IA / Automatización | ✅ Fase 3 (lenguaje cálido) |
| `/soluciones` · `/soluciones/[vertical]` | Agentes por industria (restaurantes/hoteles/real estate) | ✅ Fase 3 (lenguaje cálido) |
| `/trabajos` · `/trabajos/[slug]` | Portfolio (6, numeración 01–06): 01 Aikestar, 02 Jota (operativos), 03 **Fixy** (MVP funcional · web pública), 04 Relevo (MVP en uso privado), 05 Margin, 06 Tips (MVPs no operativos). HOST fuera. Tarjetas simplificadas (imagen, nombre, descripción breve, estado, ficha). Ficha Fixy comercial y proporcional: recorrido público (pedido→matching→presupuestos) con una única nota de alcance; sin conteos técnicos ni frases internas. | ✅ |
| `/como-trabajamos` | Proceso en detalle | ✅ Fase 3 · grupo 2 (cálido) |
| `/blog` · `/blog/[slug]` | Blog | ✅ Fase 3 · grupo 2 (cálido) |
| `/labs` · `/labs/{agente,integraciones,operacion}` | Demos conceptuales (datos ficticios) | ✅ Fase 3 · grupo 2 (cálido; usabilidad conservada) |
| `/express` | RUN Express — landing comercial | ✅ Fase 3 · grupo 2 (cálido) |
| `/contacto` | Captación consultiva a medida (form + pipeline) | ✅ Fase 3 (form cálido; tel/WhatsApp consistente, acentos ember) + envío end-to-end |
| `/hero` | **Propuesta de hero 3D (aislada, esta migración)** | ✅ |
| Header (global) | Nav + dropdown Servicios (puente hover + teclado) + CTA Contacto | ✅ (dropdown; cálido en rutas migradas) |
| Banner de privacidad (global) | Consentimiento (Necesarias/Analítica/Marketing) + panel "Ajustes de privacidad" | ✅ Fase 3 (presentación cálida: fondo walnut, crema, botones sin gradiente azul/violeta, foco visible; textos/opciones/lógica y defaults intactos) |
| Footer (global) | Enlaces, RUN Express, legales, ajustes de privacidad | 🔎 |

## 2. Público — Herramientas

> Usan otro sistema de tokens (brand-*, utilidades) y/o son interactivas; se migran
> en un pase propio cuidando la usabilidad. El **mascota Runit** (launcher) tiene
> identidad visual propia (cian/índigo/violeta): recolorearla es decisión de marca,
> no un residuo del tema anterior.

| Ruta | Qué es | Estado |
|---|---|---|
| `/runit-scan` | Autodiagnóstico Runit Scan → alimenta pipeline con consentimiento | 🔎 (pendiente de migración cálida — herramienta) |
| `/mapa/ejemplo` · `/mapa/[id]` | Mapa de IA (React Flow) | 🔎 (pendiente — herramienta) |
| `/agents` | Agentes | 🔎 (pendiente — herramienta) |
| Runit (launcher global) | Asistente chat + voz (Web Speech) | 🔎 (identidad propia; pase de herramientas) |

## 3. Express / Cotizador / Pagos

| Ruta | Qué es | Estado |
|---|---|---|
| `/express` | RUN Express — landing comercial (marketing) | ✅ Fase 3 · grupo 2 (cálido) |
| `/cotizar` | Cotizador de alcance cerrado (catálogo, precios, recorrido) | 🔎 (tool con tokens brand-*; pase propio cuidando conversión) |
| `/pago` · `/proyecto/[id]` | Pago (Mercado Pago) y seguimiento | 🔎 |

## 4. Hub (clientes)

| Ruta | Qué es | Estado |
|---|---|---|
| `/hub`, `/hub/login`, `/hub/documentos`, `/hub/credenciales`, `/hub/partners` | Área de clientes | 🔎 |

## 5. Admin

| Ruta | Qué es | Estado |
|---|---|---|
| `/admin/login` | Acceso admin (allowlist Supabase) | 🔎 |
| `/admin` (Leads) | Leads Express | 🔎 |
| `/admin/consultas` | **Leads a medida** (project_inquiries): prioridad, canal, UTM, teléfono+WhatsApp, notas, filtros, CSV | 🔎 (código verificado; sin login en vivo) |
| `/admin/dashboard,/servicios,/microservicios,/faqs,/propuesta,/mapa,/hub,/configuracion` | Gestión de contenidos y herramientas | 🔎 |

## 6. API (server)

- **Leads a medida:** `/api/contact` ✅ (persiste + atribución/canal/prioridad + notificación con reintento; probado en vivo). `/api/admin/inquiries[/id]` (panel) 🔎.
- **Express:** `/api/leads[...]`, `/api/payments/{preference,webhook}`, `/api/preview/{generate,feedback}` 🔎.
- **Runit / IA:** `/api/assistant`, `/api/chat`, `/api/radar[/interpret]`, `/api/admin/{mapa,proposal}` 🔎.
- **Hub:** `/api/hub/*` 🔎. **Catálogo/config:** `/api/services`, `/api/faqs`, `/api/config/public` 🔎.
- **Reunión/eventos:** `/api/meeting`, `/api/events` 🔎.

## 7. Transversal

- **Contenidos/posicionamiento:** RUN = software a medida, agentes de IA y automatización empresarial. ✅ (textos/portfolio).
- **Separación Express ↔ a medida:** presente en términos/cotizador/nav. 🔎.
- **Contacto:** validaciones, consentimiento de privacidad, honeypot, rate-limit, idempotencia. ✅.
- **Leads:** persistencia + atribución (UTM/gclid/fbclid first-touch) + segmentación (necesidad/presupuesto/urgencia → prioridad) + notificación + panel. ✅ (flujo probado; panel por código).
- **Analítica:** eventos comerciales gateados por consentimiento, sin PII. ✅.
- **Legales/metadata/sitemap/robots/a11y:** `/terminos`, `/privacidad`, JSON-LD, sitemap, `prefers-reduced-motion`. 🔎.

## 8. Pendientes previos / bloqueantes (no los borra la migración)

- ⚠️ **Correo de marca (bloqueante de pauta):** no existe dominio de marca RUN; solo `run72.app`. Hay **dos** registros DMARC en `_dmarc.run72.app` (se ignoran → corregir a uno). En Preview, la notificación de leads cae a `hola@run72.app` desde `notificaciones@run72.app` (verificado en Resend). Identidad centralizada en env (`NEXT_PUBLIC_CONTACT_EMAIL`, `LEADS_NOTIFICATION_EMAIL`, `CONTACT_FROM_EMAIL`). **No inventar dominio nuevo ni desactivar el correo actual** hasta definir el reemplazo. Ver [[run-email-dns-state]] / [[run-email-envs]].
- ⚠️ **Fuentes `next/font/google`** (Inter + Space Grotesk en `app/layout.tsx`) causaron un fallo de build intermitente en Vercel. Conviene self-hostearlas antes de producción (hay tarea sugerida).
- 🔎 **Panel admin en vivo:** requiere credenciales Supabase del usuario; el código está verificado pero la vista no se probó logueada.

## 9. Plan de fases (resumen)

1. **Hero aislado** (esta entrega): cerrado y verificado en `/hero`. Espera aprobación visual.
2. **Home:** integrar el hero + adaptar header, servicios, trabajos, proceso y cierre; cuidar la transición hero→siguiente sección.
3. **Páginas internas:** servicios/soluciones, trabajos/fichas, contacto, Express/cotizador, blog/labs y demás. Composición propia por contenido (tipografía, jerarquía, espaciado, superficies, imágenes, movimiento), no solo color. Herramientas priorizan uso y legibilidad.
4. **Verificación integral:** navegación desktop/mobile/teclado, enlaces/anchors/CTAs, formularios, lead completo (envío→persistencia→atribución→notificación→panel), cotizador, Runit/herramientas, responsive/a11y/reduced-motion/respaldo WebGL, rendimiento.
5. **Publicación:** preview integrado + estado de verificaciones; correo de marca y recepción de leads resueltos antes de pautar. Sin producción sin aprobación.
