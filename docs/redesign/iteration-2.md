# RUN · Rediseño — Iteración 2 (correcciones de auditoría)

Rama `feat/run-nubi-redesign`. Build de producción verde · typecheck 0 · lint 0 errores.
Leyenda: ✅ hecho · ⚠️ parcial / a confirmar · ⛔ bloqueado (externo) · ❌ no hecho.

## Respuesta a la auditoría (P0 → P2)

| Punto | Estado | Qué se hizo |
| --- | --- | --- |
| P0 Runit conversacional (voz + texto + botones, multi-turno) | ✅ | Voz real (Web Speech API) en el panel global: botón de micrófono, permiso al pulsar, escucha en vivo, detener/cancelar, error y alternativa por texto; se detiene al cerrar. Texto multi-turno con contexto y botones ya funcionaban. Traspaso de resumen a Contacto. |
| P0 Cotizador "se completa" | ⚠️ | El código del cotizador funciona (local: 13 servicios + 56 microservicios cargan desde Supabase). El "Estamos activando el cotizador" del preview era falta de variables de Supabase en el scope **Preview** de Vercel, no un bug. El mensaje de indisponibilidad ahora ofrece **Contacto** como alternativa. Falta: cargar las env de Supabase en Preview (setting de Vercel) o probar pago en sandbox. |
| P0 Migración visual (shell RUN) | ✅ | `/runit-scan`, `/mapa/ejemplo` y `/mapa/[id]` usan el shell RUN (header/footer de marketing). `Logo` es text-only: desaparece el isotipo "72" en cotizador, Hub, etc. Nombre accesible "RUN — inicio". |
| P0 Contradicción comercial 72h | ✅ | Sin promesa universal de 72h en copy público, metadata, Runit, secciones legacy. Términos: el plazo de 72h queda acotado a **RUN Express**, con distinción explícita para desarrollos a medida. FAQ "¿Realmente entregan en 72 horas?" → "¿Cuánto tarda un proyecto?" (por alcance). Constantes y contratos Express intactos. |
| P1 Enlaces heredados | ✅ | Scan/Mapa ya no usan el footer legacy con `#servicios`/`#faq` inexistentes: heredan el footer RUN con rutas reales. |
| P1 Runit sin voz | ✅ | Ver P0: voz agregada al Runit global. (El audio del Scan se mantiene aparte.) |
| P1 Mapa: textos superpuestos | ✅ | Las etiquetas de conexiones se solapaban con los títulos de área; ahora las líneas punteadas van sin etiqueta y las conexiones se listan en una leyenda legible. Intro + "datos ficticios" + vista Lista ya estaban. |
| P1 Hero con volumen y movimiento | ✅ | Escena propia `HeroScene`: profundidad (grilla en perspectiva), paneles de vidrio a distintas distancias, orbes de luz, cinta RUN volumétrica; parallax por puntero/scroll y movimiento continuo; fallback estático con reduced-motion; contenido legible con viñeta. |
| P1 Dirección de arte | ⚠️ | Hero elevado; servicios/trabajos siguen con recursos gráficos propios (gradientes/mocks). Falta material real de productos/casos. |
| P1 Trabajos reales | ❌ (requiere material) | Siguen las 3 demos rotuladas (sin inventar clientes/métricas). Incorporar Aikestar/Margin u otros requiere material y permiso verificables. |
| P1 Hub estado comercial | ⚠️ | Pendiente de prueba con sesión nueva/cuentas de test. No se modificó la lógica del Hub. |
| P2 Editorial/UI | ✅ (parcial) | "Hablar con un Runit, asistente IA" → "Hablar con Runit". Runit renderiza **negrita** sin asteriscos literales. Honeypot de Contacto con `aria-hidden`. Riqueza editorial del blog: pendiente. |

## Archivos nuevos/clave de esta iteración
- `components/marketing/HeroScene.tsx` (+ CSS `.hs-*` en `app/marketing.css`).
- `components/marketing/RunitLauncher.tsx` (voz + render de negrita).
- `components/marketing/MarketingShell.tsx` (props `withSmooth`/`withRunit`).
- `components/Logo.tsx` (text-only).
- `app/runit-scan/page.tsx`, `app/mapa/ejemplo/page.tsx`, `app/mapa/[id]/page.tsx` (shell RUN).
- `components/mapa/MapaView.tsx` (conexiones en leyenda).
- `app/terminos/page.tsx`, `app/privacidad/page.tsx` (72h acotado a Express, RUN, nuevas secciones).
- `lib/content.ts` + secciones legacy + `app/cotizar/page.tsx` (sin 72h).
- DB `faqs`: FAQ de 72h reemplazada.

## Pendientes / bloqueos declarados
- ⚠️ Cargar variables de Supabase en el **scope Preview** de Vercel para que el cotizador funcione en el preview compartible (hoy funciona en local). Setting de Vercel, no de código.
- ⛔ Probar pago/activación en sandbox de Mercado Pago (requiere credenciales de prueba).
- ⚠️ Voz: implementada y probada en estructura; la captura real de micrófono necesita prueba manual en navegador soportado (Chrome) con permiso.
- ❌ Trabajos reales y riqueza editorial del blog: requieren material aprobado; no se inventa.
- ⚠️ Comparación lado a lado con Nubi a igual viewport (incl. grabación del movimiento): pendiente de capturar.
- Revisión legal de Términos/Privacidad por responsables antes de publicar las nuevas condiciones.
