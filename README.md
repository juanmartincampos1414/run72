# RUN72 — Landing Page

Premium landing page para **RUN72**: *Tu negocio listo en 72 horas.*

Diseño dark, estética startup tecnológica (estilo Stripe / Linear / Vercel), gradientes futuristas, glassmorphism sutil y animaciones suaves. Mobile-first, optimizada para conversión hacia **"Cotizar mi proyecto"**.

## Stack

- **Next.js 16** (App Router, Turbopack)
- **TypeScript** (strict)
- **TailwindCSS v4** (design tokens en `app/globals.css`)
- **Framer Motion** (animaciones de entrada y scroll)
- SEO: metadata, Open Graph, JSON-LD, `robots.ts`, `sitemap.ts`
- Accesibilidad AA: foco visible, `skip link`, `prefers-reduced-motion`, semántica y `aria` labels

## Scripts

```bash
npm install      # instalar dependencias
npm run dev      # desarrollo  → http://localhost:3000
npm run build    # build de producción
npm run start    # servir el build
```

## Estructura

```
app/
  layout.tsx          # metadata, fuentes, SEO, JSON-LD
  page.tsx            # composición de secciones
  globals.css         # design tokens + utilidades (gradientes, glass, grid)
  robots.ts / sitemap.ts
components/
  Navbar.tsx          # nav sticky con glass al hacer scroll + menú mobile
  Logo.tsx            # isologo + wordmark
  icons/index.tsx     # set de iconos SVG
  ui/                 # Button, QuoteButton, SectionHeading, Reveal, CountUp
  sections/           # Hero, Problem, Services, HowItWorks, IdealFor,
                      # Credentials, ProjectsLaunched, FinalCTA, Footer
lib/
  content.ts          # TODO el copy y la data (single source of truth)
  cn.ts               # helper de className
public/logo.png       # isologo RUN72
```

## Conversión y cotizador

Toda la landing converge en un único punto de conversión: `<QuoteButton>`
([components/ui/QuoteButton.tsx](components/ui/QuoteButton.tsx)), usado por el
Navbar, el Hero y el CTA final.

El destino se define en `QUOTE` dentro de [`lib/content.ts`](lib/content.ts).
Hoy abre un email pre-armado como **fallback funcional**. Cuando el cotizador
web multi-paso esté listo, sólo hay que cambiar `QUOTE.href` a su ruta
(p. ej. `"/cotizar"`) y `QUOTE.isFallbackEmail = false`: todos los CTAs
apuntarán automáticamente al nuevo flujo. No hay referencias a WhatsApp.

## Personalización rápida

Todo el contenido vive en [`lib/content.ts`](lib/content.ts).

> **Importante:** actualizá los datos de contacto placeholder en `SITE`
> (`email`, `whatsapp`, `whatsappLabel`, `linkedin`) con los valores reales
> antes de publicar. Los botones "Cotizar mi proyecto" y "WhatsApp" se generan
> a partir de esos valores.

Los colores de marca se definen como tokens en `app/globals.css`
(`--color-brand-cyan`, `--color-brand-blue`, `--color-brand-violet`).
