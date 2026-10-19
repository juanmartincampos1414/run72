# RUN · Rediseño — Iteración 3 (auditoría comparativa Nubi ↔ RUN)

Rama `feat/run-nubi-redesign`. typecheck 0 · lint 0 errores · build OK.
Leyenda: ✅ hecho · ⚠️ parcial / a validar · ⛔ bloqueado · ❌ requiere contenido real.

## P0 — Residuos RUN72 / 72h
| Punto | Estado | Detalle |
| --- | --- | --- |
| /privacidad y /terminos con footer+nav legacy y 72h | ✅ | Migradas al shell RUN (header/footer globales). Privacidad: fecha Octubre 2026 + nuevas secciones (consultas a medida, Runit/proveedor IA, consentimiento). Términos: 72h acotado a RUN Express + distinción a-medida; "Alcance" aclara que el catálogo branding/redes/ecommerce es de RUN Express. |
| Residuos de marca RUN72 | ✅ | 46 strings RUN72→RUN (cotizador, Hub, pago, emails, admin, prompts), preservando `run72.app` y `RUN72_FLOW`. Mapa: herramienta "RUN". Nombres accesibles "RUN — inicio". |
| 72h universal fuera de Express | ✅ | Fuera de prompts de IA (Runit Scan, propuesta, mapa), email de diagnóstico y copy legacy. Se conserva sólo en RUN Express (cotizador, activación, SLA admin). |

## P1 — Visual y comercial
| Punto | Estado | Detalle |
| --- | --- | --- |
| Hero menos cargado, más aire | ✅ | Escena reducida (~25%), empujada a la derecha, veil más fuerte a la izquierda; tracking del H1 a -0.03em; la escena gana profundidad al hacer scroll (`--sy`). |
| Proceso domina el Home | ✅ | Envolvente sticky de 500dvh → 340dvh. |
| Servicios: intro centrada + aire | ✅ | Índice de servicios centrado con más espacio antes de las bandas. |
| Trabajos: portfolio real | ⚠️/❌ | Reestructurado: abre con "Software y productos reales" (Aikestar, Margin, Tips, J) con estructura completa de ficha y campos **"[Pendiente de validar]"**; demos conceptuales separadas en un bloque Labs. **Falta tu contenido real** (ver abajo). |
| Agentes por industria | ✅ | Nueva sección `/soluciones`: restaurantes, hoteles, real estate como líneas **en desarrollo / disponibles para pilotos**, con estructura comercial y CTA "Quiero evaluar un piloto". Sin presentarlas como casos de éxito. |
| Presupuesto (ticket alto) | ✅ | Rangos 3-7.5k / 7.5-15k / 15-30k / +30k en formulario, API y constraint de la tabla. RUN Express conserva sus precios en su propio cotizador. |
| CTA principal consistente | ✅ (parcial) | CTA de cierre del Home → "Contanos qué necesitás resolver". Header "Contacto". Runit como secundario. |

## Lo que NECESITA tu contenido real (no inventé nada)
Los 4 productos (Aikestar, Margin, Tips, J) están con la **estructura** lista pero los campos marcados **"[Pendiente de validar]"**:
- Contexto/problema, tipo de usuario, qué construyó RUN, funcionalidades, flujo, arquitectura/tecnologías/integraciones, decisiones, estado, evidencia/resultado verificable, capturas reales, año y rol de RUN.
- Categorías asignadas (a confirmar): Aikestar = Software+IA, Margin = Software, Tips = Software, J = IA.
Pasame esa info (o aunque sea de 1 producto) y completo las fichas sin inventar.

## Pendientes declarados
- ⚠️ Preview: las variables de Supabase ya están en scope Preview (cotizador/Contacto funcionan). MP de pagos sigue fuera del preview a propósito.
- ❌ Casos reales + capturas/video de productos: requieren tu material.
- ⚠️ Blog: ampliar con calendario editorial real (temas priorizados en la auditoría); hoy son 3 guías reales.
- ⚠️ Comparación lado a lado con Nubi (capturas + clip del hero al mismo viewport): pendiente de capturar.
- Páginas de servicio: ampliar capacidades/FAQ (hoy 4+4) en próxima pasada.
- Revisión legal de Términos/Privacidad por responsables antes de publicar.

## Rutas nuevas/modificadas en esta iteración
Nuevas: `/soluciones`, `/soluciones/{restaurantes,hoteles,real-estate}`, `/trabajos/{aikestar,margin,tips,j}`.
Modificadas: `/`, `/servicios`, `/trabajos`, `/contacto`, `/terminos`, `/privacidad`, `/mapa/ejemplo`, cotizador, Hub, emails, prompts, sitemap, nav/footer.
