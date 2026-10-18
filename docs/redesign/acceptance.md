# RUN · Rediseño Nubi — Tabla de aceptación A01–A50

Rama `feat/run-nubi-redesign`. Estado del preview local (`npm run dev`) y build de producción.
Leyenda: ✅ aprobado · ⚠️ parcial / a confirmar en revisión · ⛔ bloqueado (requiere credenciales o acceso externo) · ❌ no implementado (decisión/omisión declarada).

| ID | Estado | Evidencia / nota |
| --- | --- | --- |
| A01 | ✅ | Hero: rótulo "SOFTWARE A MEDIDA · AGENTES DE IA · AUTOMATIZACIÓN" + H1, visibles sin scroll. |
| A02 | ✅ | Sin promesa universal de 72h en marketing/metadata/Runit. Express conserva sus 72h aparte. |
| A03 | ✅ | /servicios, /trabajos, /blog, /labs, /contacto, /como-trabajamos, detalles: H1+descripción+CTA. |
| A04 | ✅ | Footer usa rutas completas (no anclas de Inicio). |
| A05 | ✅ | Anclas legacy top/servicios/proceso/ideal/experiencia/propiedad/faq/cotizar presentes; scroll-margin-top 120/88. |
| A06 | ✅ | Menú móvil: aria-expanded/controls, hidden cuando cerrado, Escape + foco restaurado. |
| A07 | ⚠️ | Verificado 375 (móvil) y desktop; `overflow-x:hidden`. Falta barrido formal 320/1024/1440. |
| A08 | ⚠️ | Tipografía en rem/clamp; zoom 200% no medido formalmente. |
| A09 | ✅ | WordReveal visible sin JS (CSS `:not([data-ready])`); confirmado que las 3 líneas del H1 quedan en transform identidad. |
| A10 | ✅ | reduced-motion detiene gradiente, reveal, flotación del icono y Lenis. |
| A11 | ⚠️ | Paleta sobre negro de alto contraste; focus-visible presente. No medido con herramienta. |
| A12 | ✅ | FAQ con `<details>/<summary>` nativo (teclado + múltiples abiertas). |
| A13 | ✅ | Demo operación: filtros, cambio de estado y reinicio sobre 3 registros. |
| A14 | ✅ | Demo agente: consulta vs solicitud pendiente de aprobación; sin "aprobado automáticamente". |
| A15 | ✅ | Demo integración: fallo, reintento y evento repetido sin duplicar pedido. |
| A16 | ✅ | Todas las demos muestran "Demo interactiva · Datos ficticios" y no llaman a sistemas reales. |
| A17 | ✅ | Runit abre panel real; fallback mantiene los 4 accesos. Verificado en navegador. |
| A18 | ✅ | /api/assistant no escribe leads, no envía emails, no crea presupuestos. Respuesta en vivo verificada. |
| A19 | ✅ | Scan por botones (6 preguntas) y chat comparten el scoring determinista de lib/radar. |
| A20 | ✅ | Audio: pide micrófono solo al pulsar; si no hay soporte, ofrece texto. |
| A21 | ✅ | Mapa: H1, vista Lista accesible, zoom funcional, CTA directo a /contacto?origen=mapa-ejemplo. Export PNG usa getNodesBounds (todos los nodos). |
| A22 | ✅ | Contacto bloquea envío en cliente (required) y servidor (validación + 400 con mapa de errores); foco al resumen. |
| A23 | ⚠️ | /api/contact inserta en project_inquiries y no toca Express; bandeja admin lista. Falta enviar una consulta real de prueba en preview. |
| A24 | ✅ | Idempotencia por idempotency_key (unique); reintento devuelve el mismo id (23505 → select). |
| A25 | ✅ | Reenvío de aviso desde /admin/consultas sin reinsertar la consulta. |
| A26 | ✅ | analytics.ts solo admite props route/solutionId/demoId/location; nunca nombre/email/problema/conversación. |
| A27 | ✅ | ConsentManager: el Pixel solo carga con consentimiento de Marketing; revocar lo quita. Banner verificado. |
| A28 | ✅ | /cotizar y /api/leads intactos (Express). |
| A29 | ✅ | Chat Express y su cálculo de precios en servidor intactos. |
| A30 | ⛔ | Pago/activación: requiere sandbox Mercado Pago y prueba en vivo. Express no fue modificado. |
| A31 | ✅ | Guards de Hub/admin intactos (requireAdmin / hub-guard). |
| A32 | ✅ | cases.ts: casos client sin evidencia/permiso no se publican; las 3 demos sí. |
| A33 | ✅ | Títulos sin duplicar marca (plantilla "%s · RUN"); canonical por ruta; origen único www.run72.app. |
| A34 | ✅ | sitemap excluye y robots bloquea admin/hub/pago/cotizar/proyecto/mapas privados/api. |
| A35 | ✅ | `npm run typecheck` 0 errores · `npm run lint` 0 errores (warnings documentados) · `npm run build` exit 0 (94 rutas). |
| A36 | ⚠️ | Capturas desktop (Home, Servicios, Labs, Contacto, Mapa, OG) y móvil (Home) tomadas en el preview. |
| A37 | ✅ | Cero errores de consola de la app en los recorridos probados. |
| A38 | ⚠️ | LCP/CLS objetivo, no medidos con Lighthouse aún. |
| A39 | ✅ | Marca RUN en header, footer, metadata, schema, Runit y shell legacy; run72.app e históricos intactos. |
| A40 | ✅ | Tokens --m- (incluye #FFD873) y gradiente radial del CTA en marketing.css. |
| A41 | ✅ | Switzer (FFL) + Geist Mono (OFL) desde /public/fonts con LICENSES; marketing no usa Space Grotesk/Inter. |
| A42 | ✅ | Home: Hero→Principio→Capacidades→Proceso→Trabajos→Cierre→Footer. |
| A43 | ✅ | Proceso sticky desktop 100dvh/500dvh con 4 estados + botones; móvil/reduced-motion lista completa. |
| A44 | ✅ | Filas de trabajos: miniatura emergente + foco; en touch (`hover:none`) la miniatura se muestra. |
| A45 | ✅ | Lenis activo, desactivado con reduced-motion; scroll real (no secuestra foco), anclas vía scrollTo. |
| A46 | ✅ | Trabajos: 3 demos rotuladas + filtros Todos/Software/IA/Automatización; fichas sin clientes ni métricas. |
| A47 | ⚠️ | Comparación por composición hecha desde la auditoría del documento; no hay captura lado a lado de Nubi en vivo en esta entrega. |
| A48 | ✅ | Icono RUN (SVG) y footer atmosférico (SVG) sin GPU; ningún cargador bloquea. |
| A49 | ✅ | Cotizador accesible desde footer ("Cotizador · RUN Express"), Contacto y Runit; lógica Express intacta. |
| A50 | ✅ | /agents y /llms.txt listan solo contenido público publicado y canónico. |

## Pendientes declarados para después del preview
- **Lenis + proceso sticky**: confirmar en revisión manual que el scroll suave no interfiere con el proceso en equipos lentos.
- **A47 fidelidad lado a lado**: capturar Nubi y RUN al mismo viewport (1363×936 / 1440×900) y documentar diferencias.
- **A30 pagos**: probar checkout y activación en sandbox de Mercado Pago.
- **A38 performance**: medir LCP/CLS/INP en laboratorio y campo.
- **Shell de /runit-scan y /mapa/ejemplo**: hoy usan el Navbar legacy (ya con marca RUN); unificar con el header de marketing para identidad total.
- **Políticas**: revisar y versionar Privacidad/Términos para los nuevos tratamientos antes del uso público (el desarrollo no depende de esa revisión).

## Archivos y rutas nuevas (resumen)
Rutas públicas nuevas: `/servicios` (+3), `/trabajos` (+3), `/blog` (+3), `/labs` (+4), `/contacto`, `/como-trabajamos`, `/agents`, `/llms.txt`, OG en `/opengraph-image`.
APIs nuevas: `/api/contact`, `/api/assistant`, `/api/admin/inquiries` (+[id]).
Tabla nueva: `project_inquiries` (migración aditiva aplicada).
