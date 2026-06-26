# Stay — 04 Journey Map

| | |
|---|---|
| **Producto** | Stay |
| **Documento** | 04 Journey Map |
| **Versión** | v0.1 |
| **Estado** | Draft |
| **Owner** | RUN72 |
| **Última actualización** | Junio 2026 |

> No es un customer journey de marketing: es el **ciclo completo de la relación** hotel–huésped.
> Cada momento responde las 9 preguntas y **emite un evento** que alimenta Engines / CRM /
> conocimiento. Propuestas a **validar en el piloto (Palacio Paz + Trufa)**. Guía: *Journey Map Playbook*.

**Convención de eventos:** `stay.<área>.<verbo_pasado>`.

---

## 1. Pre-stay (reserva confirmada → pre-arrival)
| Pregunta | Respuesta |
|---|---|
| Huésped quiere | Prepararse para el viaje, resolver dudas |
| Hotel quiere | Empezar la relación **antes** de la llegada |
| Oportunidad Stay | Identificar al huésped OTA antes del check-in y abrir canal directo |
| Entry Point | WhatsApp / Email (mensaje de pre-arrival) |
| Datos | Contacto, fechas, **origen (OTA)**, preferencias |
| Acción Stay | Bienvenida directa + pre-check-in + ofertas (Trufa, spa) |
| Valor huésped | Llega con todo resuelto, bienvenida cálida |
| Valor hotel | Primer contacto **directo** (no mediado por OTA) + upsell |
| **Evento** | `stay.guest.preidentified` → CRM, Campaign Engine |

## 2. Check-in
| Pregunta | Respuesta |
|---|---|
| Huésped quiere | Entrar rápido, sin fricción |
| Hotel quiere | Identificar formalmente y dar la bienvenida |
| Oportunidad Stay | **Confirmar identidad + opt-in + alta en Guest Club** (el linchpin del modelo) |
| Entry Point | QR en recepción / NFC |
| Datos | Identidad confirmada, **consentimiento de relación directa** |
| Acción Stay | Alta en Guest Club + acceso digital a toda la estadía |
| Valor huésped | Check-in ágil + todo en un solo lugar |
| Valor hotel | Huésped **identificado y opt-in** |
| **Evento** | `stay.guest.identified` → CRM, Wallet (credencial), Analytics |

## 3. Habitación
| Pregunta | Respuesta |
|---|---|
| Huésped quiere | Comodidad, pedir cosas fácil |
| Hotel quiere | Más consumo in-house, info al huésped |
| Oportunidad Stay | Punto de contacto persistente en la habitación |
| Entry Point | NFC / QR en la habitación |
| Datos | Servicios consultados, pedidos, preferencias |
| Acción Stay | Menú digital (servicios, room service, spa, Trufa) |
| Valor huésped | Todo a un tap |
| Valor hotel | Más consumo + datos de preferencia |
| **Evento** | `stay.room.engaged` → CRM, Analytics |

## 4. Desayuno
| Pregunta | Respuesta |
|---|---|
| Huésped quiere | Desayunar bien |
| Hotel quiere | Conocer preferencias, fidelizar |
| Oportunidad Stay | Micro-momento de relación + preferencias |
| Entry Point | QR en la mesa |
| Datos | Preferencias gastronómicas, horarios |
| Acción Stay | Preferencias + feedback rápido |
| Valor huésped | Experiencia personalizada |
| Valor hotel | Datos para personalizar |
| **Evento** | `stay.experience.logged` (breakfast) → CRM, Analytics |

## 5. Trufa (restaurante)
| Pregunta | Respuesta |
|---|---|
| Huésped quiere | Buena cena, reservar mesa, beneficios |
| Hotel quiere | Aumentar consumo F&B + reseñas |
| Oportunidad Stay | Cross-sell del restaurante atado a la relación |
| Entry Point | QR en mesa / Wallet |
| Datos | Consumo, reserva, gustos |
| Acción Stay | Reserva/menú + **beneficio del Guest Club** en Trufa |
| Valor huésped | Beneficio por ser parte del club |
| Valor hotel | Más ingresos F&B + datos |
| **Evento** | `stay.experience.logged` (trufa) · `stay.reward.redeemed` → Wallet, CRM |

## 6. Room service
| Pregunta | Respuesta |
|---|---|
| Huésped quiere | Pedir cómodo desde la habitación |
| Hotel quiere | Cumplir rápido, vender más |
| Oportunidad Stay | Pedido digital trackeado |
| Entry Point | NFC/QR habitación → WhatsApp |
| Datos | Pedido, horario, repetición |
| Acción Stay | Pedido digital + notificación a staff |
| Valor huésped | Pedido sin fricción |
| Valor hotel | Operación + datos de consumo |
| **Evento** | `stay.service.requested` (roomservice) → Notification Engine, CRM |

## 7. Spa
| Pregunta | Respuesta |
|---|---|
| Huésped quiere | Relajarse, reservar |
| Hotel quiere | Vender servicios premium |
| Oportunidad Stay | Upsell + experiencia premium |
| Entry Point | QR / WhatsApp |
| Datos | Reserva, preferencias |
| Acción Stay | Reserva de spa + beneficio club |
| Valor huésped | Acceso simple + beneficio |
| Valor hotel | Ingresos premium |
| **Evento** | `stay.booking.made` (spa) → CRM, Campaign Engine |

## 8. Checkout
| Pregunta | Respuesta |
|---|---|
| Huésped quiere | Irse sin fricción |
| Hotel quiere | Cerrar bien, reseña, sembrar la recompra |
| Oportunidad Stay | Convertir la estadía en relación duradera + reseña |
| Entry Point | WhatsApp / QR / Wallet |
| Datos | Satisfacción, reseña, **consentimiento post-stay** |
| Acción Stay | Checkout digital + pedido de reseña + incentivo de reserva directa futura |
| Valor huésped | Salida ágil + incentivo para volver directo |
| Valor hotel | Reseña (Google/TripAdvisor) + semilla de reserva directa |
| **Evento** | `stay.review.requested` · `stay.directbooking.incentive_sent` → Review Engine, Campaign |

## 9. Post-stay (el corazón del modelo)
| Pregunta | Respuesta |
|---|---|
| Huésped quiere | Recordar la buena experiencia, volver |
| Hotel quiere | **Recompra DIRECTA** (no OTA), relación duradera |
| Oportunidad Stay | Convertir al ex-huésped OTA en reserva directa |
| Entry Point | WhatsApp / Email / Wallet |
| Datos | Recompra, **atribución**, engagement |
| Acción Stay | Campañas de recompra directa + beneficios del club + contenido |
| Valor huésped | Beneficios reales por reservar directo |
| Valor hotel | **Reserva directa = OTA Revenue Recaptured + Direct Guest Relationship Rate ↑** |
| **Evento** | `stay.directbooking.confirmed` → CRM, Analytics (North Star + Business Outcome) |

---

## Lo que el journey anticipa (puntero a `05 Product Engines` — no se diseña acá)

**Engines que emergen de los eventos:**
- **Guest Identity Engine** *(nuevo, sobre Guest Profiles de Tips+)* — identificar y unificar al huésped a través de momentos y estadías.
- **Experience / Moment Engine** *(nuevo)* — registrar cada interacción como evento/experiencia.
- **Entry Point Engine** *(nuevo)* — abstrae NFC/QR/WiFi/WhatsApp/Wallet como canales intercambiables.
- **Direct Booking / Recapture Engine** *(nuevo)* — incentivo + **atribución** de la reserva directa (alimenta North Star y Business Outcome).
- **Reutilizables (Tips+):** Campaign Engine · Notification Engine · Review Engine · Wallet/Rewards · CRM/Guest Profile · Analytics / Event Tracking.

**Core Entities anticipadas (para `06`):** Guest · Stay (estadía) · Moment/Interaction · Property (hotel/org) · Reward · Booking (directa) · Event.

---

## Para pasar a Frozen (faltante)
- [ ] Confirmar/ajustar momentos y eventos con el Founder.
- [ ] Validar los Entry Points reales en el piloto (Palacio Paz + Trufa).
- [ ] Aprobación del Founder → **Frozen v1.0** → habilita `05 Product Engines`.
