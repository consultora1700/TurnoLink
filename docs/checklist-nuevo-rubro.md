# Checklist: Agregar un Rubro Nuevo

Guía paso a paso para agregar un rubro nuevo al sistema. Cada punto debe completarse para que el rubro funcione correctamente en todo el sistema.

> **Regla de oro**: el `key` del rubro (ej: `inmobiliarias`) debe ser idéntico en los 14 archivos.

---

## Paso 1 — Backend: Terminología

- [ ] **`apps/api/src/common/utils/rubro-terms.ts`** → agregar a `RUBRO_TERMS`
  - `bookingSingular` / `bookingPlural` (Turno, Consulta, Visita, Clase, Reserva, Sesión)
  - `serviceSingular` / `servicePlural` (Servicio, Consulta, Propiedad, Clase, Habitación)
  - `employeeSingular` / `employeePlural` (Profesional, Asesor, Instructor, Barbero)
  - `depositLabel` (Seña, Depósito, Adelanto)
  - `bookAction` / `bookingVerb` (Reservar, Agendar, Inscribirse, Comprar)
  - `emoji` (💇, 🩺, 🏢, 💪, etc.)

Esto afecta: notificaciones, WhatsApp, emails, respuestas API.

---

## Paso 2 — Frontend: Config maestra (3 Records en 1 archivo)

**Archivo**: `apps/web/lib/tenant-config.ts`

### A) RUBROS array
- [ ] Agregar entrada con:
  - `key`: identificador kebab-case
  - `label`: nombre visible en registro
  - `suggestedTerminology`: { singular, plural } para label de clientes
  - `suggestedFichas`: módulos de ficha habilitados (datosPersonales, fichaClinica, fichaBelleza, fichaFitness, notasSeguimiento, derivaciones)

### B) RUBRO_TERMS Record
- [ ] Agregar entrada con todo lo del Paso 1 + campos extra frontend:
  - `attendVerb` (atender, dictar, recibir, asesorar)
  - `notesPlaceholder` (placeholder contextual para notas de reserva)
  - `credentialsLabel` / `credentialsPlaceholder` (matrícula, certificaciones)
  - `specialtyExamples` (ejemplos de especialidades)

### C) RUBRO_UI_CONFIG Record
- [ ] Agregar entrada con:
  - `allowedFichas`: módulos de ficha permitidos
  - `amenitiesLabel` / `amenitiesDescription`: texto de amenidades (null para ocultar)
  - `terminologyPreset`: preset de terminology.ts (o string vacío)
  - `operationTabLabel`: label del tab principal en sidebar (Turnos, Consultas, Visitas, Ventas)

---

## Paso 3 — Catálogos de apoyo

- [ ] **`apps/web/lib/amenities-catalog.ts`** → `AMENITIES_BY_RUBRO`
  - Lista de amenidades con id, label, icon (Lucide icon name)
  - Array vacío si no aplica

- [ ] **`apps/web/lib/rubro-labels.ts`** → `RUBRO_LABELS_MAP`
  - Labels para notas de sesión/seguimiento
  - noteTitle, dateLabel, titlePlaceholder, observationsLabel, observationsPlaceholder
  - notesLabel, notesPlaceholder, progressLabel, progressPlaceholder
  - tasksLabel, tasksPlaceholder, referralPlaceholder
  - Copiar DEFAULT si no necesita personalización

---

## Paso 4 — Registro y Onboarding

- [ ] **`apps/web/app/(auth)/register/page.tsx`**:
  - `RUBRO_ICONS`: ícono Lucide para el selector de registro
  - `RUBRO_SUBTEXTS`: subtexto opcional bajo el nombre
  - `FEATURED_RUBRO_KEYS`: agregar si es rubro destacado (top 9-10)
  - `LANDING_TO_RUBRO`: mapeo si el slug de landing difiere del key

- [ ] **`apps/web/components/onboarding/onboarding-tour.tsx`**:
  - `INDUSTRIES` array: id, label, icon, layout, gradient
  - `TOUR_RUBRO_MAP`: mapeo de tour industry → rubro key

---

## Paso 5 — Backend: Defaults de registro

**Archivo**: `apps/api/src/modules/auth/auth.service.ts`

- [ ] `RUBRO_LAYOUT`: layout de página pública
  - `service_first` (servicios), `product_grid` (solo mercado/catálogo)

- [ ] `RUBRO_HIDDEN_SECTIONS`: secciones ocultas en sidebar al registrarse
  - Incluir TALENTO, ADVANCED, CATALOGO según corresponda
  - Ocultar /especialidades, /formularios, /videollamadas si no aplican

- [ ] `INDUSTRY_CONFIG`: configuración principal
  - `rubro`: key del rubro
  - `plan`: slug del plan (debe existir en seed-industry-plans)
  - `bookingMode`: 'HOURLY' (default) o 'DAILY' (hospedaje/alquiler)

- [ ] `RUBRO_DEFAULTS`: defaults de tenant
  - `clientLabelSingular` / `clientLabelPlural`
  - `enabledFichas`: fichas habilitadas por defecto

---

## Paso 6 — Ejemplos de onboarding

**Archivo**: `apps/api/src/modules/auth/onboarding-examples.ts`

- [ ] `PLACEHOLDER_IMAGES`: path a imagen SVG placeholder
- [ ] `SERVICE_RUBROS`: 4 servicios de ejemplo
  - name, description, price (ARS), duration (minutos)
- [ ] Crear SVG en `apps/web/public/placeholders/tu-rubro.svg`

---

## Paso 7 — Planes y precios

- [ ] **`apps/api/src/prisma/seed-industry-plans.ts`**
  - Asignar a grupo existente (agregar industry slug al array `industries`)
  - O crear grupo nuevo con sus planes
  - Configurar `limitLabels` con terminología del rubro

---

## Paso 8 — UI específica de páginas

- [ ] **`apps/web/components/dashboard/sidebar.tsx`** → `SERVICE_ICON_BY_RUBRO`
  - Ícono Lucide para el menú "Servicios" (Scissors, Stethoscope, Building2, etc.)

- [ ] **`apps/web/app/(dashboard)/presupuestos/page.tsx`** → `QUOTE_EXAMPLES`
  - titlePlaceholder, notesPlaceholder, itemExamples

- [ ] **`apps/web/app/(dashboard)/especialidades/page.tsx`** → `SPECIALTY_PLACEHOLDERS`
  - Ejemplos de especialidades para el rubro

- [ ] **`apps/web/app/(dashboard)/formularios/page.tsx`** → `FORM_PLACEHOLDERS`
  - Placeholders de formularios personalizados

- [ ] **`apps/web/app/(dashboard)/servicios/page.tsx`** → `RUBROS_SIN_PROFESIONAL`
  - Agregar si los servicios de este rubro NO requieren asignar profesional

- [ ] **`apps/web/lib/terminology.ts`** → `TERMINOLOGY_PRESETS` (opcional)
  - Solo si necesita preset de terminología para página pública

---

## Paso 9 — Verificación

- [ ] Crear cuenta test con el rubro nuevo
- [ ] Verificar terminología en: Dashboard, Servicios, Turnos, Clientes, Empleados
- [ ] Verificar sidebar: ícono correcto, secciones visibles/ocultas
- [ ] Verificar onboarding: ejemplos de servicios cargados
- [ ] Verificar página pública de reservas: terminología, amenidades
- [ ] Verificar Fidelización: terminología adaptada
- [ ] Verificar Presupuestos: placeholders correctos
- [ ] Verificar Configuración: fichas y amenidades
- [ ] Build exitoso: `pnpm build:web` + `pnpm build:api`
- [ ] Deploy: `pm2 restart web` + `pm2 restart turnolink-api`

---

## Referencia rápida: Archivos a tocar

| # | Archivo | Qué agregar |
|---|---------|-------------|
| 1 | `api/common/utils/rubro-terms.ts` | Terminología backend |
| 2 | `web/lib/tenant-config.ts` | RUBROS + RUBRO_TERMS + RUBRO_UI_CONFIG |
| 3 | `web/lib/amenities-catalog.ts` | Amenidades |
| 4 | `web/lib/rubro-labels.ts` | Labels de notas/sesiones |
| 5 | `web/(auth)/register/page.tsx` | Ícono + subtexto registro |
| 6 | `web/onboarding/onboarding-tour.tsx` | Tour de onboarding |
| 7 | `api/modules/auth/auth.service.ts` | 4 maps de defaults |
| 8 | `api/modules/auth/onboarding-examples.ts` | Servicios ejemplo |
| 9 | `web/public/placeholders/` | SVG placeholder |
| 10 | `api/prisma/seed-industry-plans.ts` | Plan/grupo |
| 11 | `web/dashboard/sidebar.tsx` | Ícono sidebar |
| 12 | `web/dashboard/presupuestos/page.tsx` | Ejemplos presupuesto |
| 13 | `web/dashboard/especialidades/page.tsx` | Ejemplos especialidades |
| 14 | `web/dashboard/formularios/page.tsx` | Placeholders formularios |
| 15 | `web/dashboard/servicios/page.tsx` | Sin profesional (si aplica) |
| 16 | `web/lib/terminology.ts` | Preset público (opcional) |
