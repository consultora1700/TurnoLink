# Prompt para crear Landing Custom de alta calidad — TurnoLink

> Copiar todo este prompt y pegarlo en una nueva conversación de Claude Code.
> Reemplazar `[NICHO]` con el profesional/industria objetivo.

---

## EL PROMPT

Necesito que crees una landing page custom de altísima calidad para **[NICHO]** en el proyecto TurnoLink, al mismo nivel que la landing de psicólogos que ya existe en `/app/landing-v2/salud/psicologos/`.

### Tu rol

Asumí simultáneamente estos roles senior para abordar cada aspecto:

1. **Senior en Marketing Digital**: Copywriting persuasivo, propuesta de valor, CTAs que convierten, storytelling que conecta emocionalmente con el profesional de [NICHO].

2. **Senior en Comercialización y Mercado**: Entendé el mercado de [NICHO] en Argentina/LATAM. Quiénes son, cuánto cobran por consulta/servicio, cuáles son sus competidores digitales, qué herramientas usan hoy (WhatsApp, cuaderno, Excel). Pricing que tenga sentido para su ticket promedio.

3. **Senior en Growth & Startup**: Estructura de landing optimizada para conversión. Cada sección tiene un propósito en el funnel: captar atención → mostrar dolor → presentar solución → demostrar valor → generar confianza → cerrar con oferta irresistible.

4. **Senior en Desarrollo de Software**: Código limpio, componentes reutilizables, tipado correcto, performance optimizada. Seguir exactamente la arquitectura del proyecto.

5. **Senior en Diseño UX/UI**: Experiencia de scroll que engancha, jerarquía visual clara, microinteracciones con propósito, responsive impecable.

6. **Investigador/Doctorado en [NICHO]**: Antes de escribir UNA sola línea de código, investigá profundamente:
   - ¿Cuáles son los 3 dolores principales de un profesional de [NICHO] en su día a día?
   - ¿Qué tareas administrativas les roban tiempo de su trabajo real?
   - ¿Cuál es la tasa de ausencias/cancelaciones en su industria?
   - ¿Cuánto pierden por mes en ingresos por mala gestión de agenda?
   - ¿Qué jerga profesional usan? (para que el copy suene auténtico)
   - ¿Qué los diferenciaría de sus colegas si tuvieran un sistema profesional?
   - ¿Cuáles son las objeciones más comunes para adoptar tecnología?

### Arquitectura de referencia

Leé COMPLETAMENTE estos archivos antes de empezar:

```
/app/landing-v2/salud/psicologos/page.tsx          → Metadata + wrapper
/app/landing-v2/salud/psicologos/psicologos-landing.tsx → Componente principal (1108 líneas, REFERENCIA PRINCIPAL)
/app/landing-v2/_components/hooks.ts                → useScrollReveal, useStaggerReveal, useImageReveal
/app/landing-v2/_components/ui.tsx                  → WordReveal, SectionTag, SectionH2, GlassLine, WHATSAPP_URL
/app/landing-v2/_components/navbar.tsx              → Navbar compartida
/app/landing-v2/_components/footer.tsx              → Footer compartido
/app/landing-v2/_components/cta-section.tsx          → CTA section compartida
/app/landing-v2/_components/industry-page.tsx        → Template genérico (NO usar, crear custom)
```

### Estructura EXACTA de secciones (15 secciones)

La landing DEBE tener estas 15 secciones en este orden:

```
1.  NAVBAR (compartido)
2.  HERO — Título impactante + subtítulo + 2 CTAs + trust badges + carrusel de imágenes + floating badges
3.  METRICS STRIP — 4 métricas numéricas con animación count-up
4.  PAIN POINTS — 3 dolores con emoji + título + descripción
5.  BEFORE/AFTER — "Un día sin/con TurnoLink" — 6 entradas timeline cada lado
6.  SHOWCASE 1 — Feature principal con carrusel de capturas (ej: ficha clínica, catálogo, etc.)
7.  SHOWCASE 2 — Segunda feature con carrusel (ej: página de reservas)
8.  SHOWCASE 3 — Tercera feature con carrusel (ej: dashboard/métricas)
9.  FEATURES — Grid 3x2 con 6 funcionalidades (icono + título + desc)
10. ROI — Cálculo económico: cuánto pierde sin sistema vs cuánto recupera con TurnoLink
11. TESTIMONIALS — 3 testimonios con métrica destacada + estrellas + quote
12. PRICING — 3 planes con features
13. FAQ — 7 preguntas frecuentes en accordion
14. CTA (compartido)
15. FOOTER (compartido)
```

### Sistema de imágenes / Capturas de pantalla

**REGLA CRÍTICA: Las imágenes NO deben repetirse entre carruseles.**

Necesitás 4 sets de imágenes (carruseles), total ~12-13 capturas únicas:

```
HERO_IMAGES (3 capturas) → Muestran vistas generales del sistema
  - Captura 1: Vista que sea DISTINTA a las otras (ej: lista de clientes, agenda mensual)
  - Captura 2: Otra vista diferente (ej: agenda semanal con turnos)
  - Captura 3: Otra vista diferente (ej: dashboard con métricas)

SHOWCASE_1_IMAGES (3-4 capturas) → Feature principal
  - Cada captura muestra una pantalla o sub-pantalla DIFERENTE
  - Si es "ficha de cliente": header, historial, detalle, notas
  - NUNCA dos capturas de la misma pantalla

SHOWCASE_2_IMAGES (3 capturas) → Segunda feature
  - Ej: página pública de reservas → vista general, modal de servicio, calendario
  - Cada una muestra un PASO diferente del flujo

SHOWCASE_3_IMAGES (3 capturas) → Tercera feature o vista general
  - Ej: dashboard, servicios configurados, reportes
  - VERIFICAR que ninguna imagen se repita con HERO_IMAGES
```

**Para tomar las capturas:**

1. Configurá un negocio de prueba en TurnoLink con datos realistas de [NICHO]
2. Usá nombres, servicios y precios que un profesional de [NICHO] realmente tendría
3. Cargá datos suficientes para que las pantallas se vean completas (no vacías)
4. Tomá capturas en resolución desktop (1440px ancho mínimo)
5. Guardá en: `/public/screenshots/[nicho-slug]/desktop/`
6. Usá nombres descriptivos: `agenda-semanal.png`, `ficha-cliente-header.png`, etc.
7. Alt texts descriptivos y específicos para SEO

**Checklist anti-duplicación de imágenes:**
- [ ] Las 3 imágenes del hero son de pantallas DISTINTAS entre sí
- [ ] Ninguna imagen del hero se repite en showcase 1, 2 o 3
- [ ] Ninguna imagen de showcase 1 se repite en showcase 2 o 3
- [ ] Cada carrusel muestra una PROGRESIÓN o diferentes áreas del sistema
- [ ] El total de imágenes únicas es >= 12

### Datos a personalizar por nicho

Investigá y adaptá CADA uno de estos datos:

```typescript
// Color accent: elegí un color que represente al nicho
const ACCENT = '#XXXXXX';

// Ruta de screenshots
const S = '/screenshots/[nicho-slug]/desktop';

// 3 Pain Points — Los 3 dolores REALES del profesional
// Investigá: ¿qué tarea administrativa les consume más tiempo?
// ¿Qué les genera más frustración? ¿Dónde pierden dinero?

// 6+6 Before/After — Día típico SIN vs CON TurnoLink
// Horarios realistas para la jornada del profesional
// "Antes" con situaciones frustrantes específicas del nicho
// "Después" con la solución concreta de TurnoLink

// 6 Features — Las 6 funcionalidades más relevantes para ESE nicho
// No todas las features son iguales para todos los nichos
// Un kinesiólogo necesita gestión de turnos recurrentes
// Un abogado necesita gestión de documentos y expedientes
// Elegí las 6 que más impactan a [NICHO]

// ROI — Cálculo económico REALISTA
// Investigá: ¿cuánto cobra una sesión/consulta de [NICHO]?
// ¿Cuál es la tasa de ausencias típica?
// ¿Cuántas consultas por semana tiene un profesional promedio?
// Hacé las cuentas reales y mostrá el ahorro mensual

// 3 Testimonios — Inventá personajes CREÍBLES
// Usá nombres argentinos realistas
// Títulos profesionales correctos (Lic., Dr., Mat., etc.)
// Métricas específicas por testimonio
// Que cada testimonio destaque un beneficio diferente

// Pricing — Usá los mismos planes de la data del nicho padre
// Importar de la data o hardcodear consistentemente

// 7 FAQs — Las 7 preguntas que un profesional de [NICHO] realmente haría
// Incluí objeciones comunes (seguridad de datos, si pacientes necesitan app, etc.)
// Respuestas concisas y que eliminen la objeción
```

### Copy / Escritura

El copy debe:
- Hablar en segunda persona singular argentino ("vos", "tenés", "podés")
- Usar jerga profesional del nicho (pero sin tecnicismos excesivos)
- Ser directo y empático — el profesional debe sentir "esto lo escribió alguien que entiende mi trabajo"
- Hero title: máximo 4 líneas, alternando peso visual (blanco/opaco)
- Pain points: que duelan de verdad — el profesional debe asentir leyendo
- Before/After: situaciones tan específicas que parezcan sacadas de su vida real
- Testimonios: que suenen como personas reales hablando, no como marketing
- FAQs: respuestas que eliminen objeciones sin sonar defensivos

### Archivos a crear

```
/app/landing-v2/[industria]/[nicho-slug]/page.tsx           → Metadata + export default
/app/landing-v2/[industria]/[nicho-slug]/[nicho]-landing.tsx → Componente principal (~1000-1100 líneas)
```

### Estructura del componente principal

```typescript
'use client';

// 1. Imports (React, Next/Image, lucide-react icons, shared components)
// 2. Constants: ACCENT, S (screenshot path)
// 3. Image sets: HERO_IMAGES, SHOWCASE_1_IMAGES, SHOWCASE_2_IMAGES, SHOWCASE_3_IMAGES
// 4. Data constants: PAIN_POINTS, BEFORE_ITEMS, AFTER_ITEMS, FEATURES, TESTIMONIALS, PRICING_TIERS, FAQS
// 5. Custom hooks: useCountUp
// 6. Helper components: AutoCycleImage (copy from psicologos, same pattern)
// 7. Main component export: [Nicho]Landing
//    - State: openIdx (FAQ), refs para scroll reveal
//    - 15 secciones en orden
// 8. Styles inline y clases lv2-*
```

### Clases CSS del proyecto (ya definidas, reutilizar)

```
lv2-section, lv2-card, lv2-pill, lv2-glass, lv2-glow-btn, lv2-glow-orb,
lv2-mockup-wrapper, lv2-icon-glow, lv2-faq-item, lv2-faq-icon,
lv2-pricing-popular, lv2-glass-line, lv2-h2, lv2-word, lv2-card-stagger,
lv2-nav-blur
```

### Componentes compartidos a importar

```typescript
import { Navbar } from '../../_components/navbar';
import { Footer } from '../../_components/footer';
import { CTASection } from '../../_components/cta-section';
import { WordReveal, SectionTag, SectionH2, WHATSAPP_URL } from '../../_components/ui';
import { useScrollReveal, useStaggerReveal, useImageReveal } from '../../_components/hooks';
```

### Verificación final

Después de crear los archivos:

1. `npm run build` — Sin errores
2. `pm2 restart web`
3. Navegar a la landing y verificar:
   - [ ] Todas las secciones cargan correctamente
   - [ ] Los carruseles ciclan automáticamente
   - [ ] Las imágenes NO se repiten entre carruseles
   - [ ] Los count-up se activan al hacer scroll
   - [ ] El FAQ accordion funciona
   - [ ] Los links de CTA van a /register
   - [ ] El botón de WhatsApp abre el chat
   - [ ] Es responsive (probar mobile, tablet, desktop)
   - [ ] El copy suena auténtico para el profesional objetivo
4. Actualizar el status en `/admin/landings` → marcar como lista

### Ejemplo de uso

Para crear la landing de Odontólogos:

```
Creá la landing custom para ODONTÓLOGOS siguiendo exactamente el prompt
en PROMPT-LANDING-CUSTOM.md.

El nicho es: odontologos
La industria padre es: salud
El accent color sugerido: #06B6D4 (cyan/turquesa — representa limpieza y salud bucal)
El path será: /app/landing-v2/salud/odontologos/

Antes de escribir código, investigá a fondo:
- ¿Cuánto cobra un odontólogo por consulta en Argentina?
- ¿Cuáles son los tratamientos más comunes que agendan?
- ¿Cuál es la tasa de ausencias en odontología?
- ¿Qué herramientas usan hoy para gestionar turnos?
- ¿Cuáles son sus principales frustraciones administrativas?

Luego creá las screenshots necesarias configurando un consultorio dental
de prueba en TurnoLink y tomando 12+ capturas únicas.
```
