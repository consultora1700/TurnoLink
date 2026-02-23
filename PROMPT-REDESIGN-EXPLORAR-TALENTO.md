# Prompt para nueva sesión de Claude Code

Copia todo lo de abajo y pegalo como primer mensaje en una nueva sesión:

---

## Tarea: Rediseño UX/UI de `/explorar-talento`

Necesito que rediseñes visualmente el archivo `apps/web/app/explorar-talento/page.tsx` (es el ÚNICO archivo a modificar). La funcionalidad (API, filtros, paginación, dialog, auth) NO debe cambiar. Solo mejoramos la UI usando el sistema de diseño que ya existe en `globals.css`.

### Instrucciones

1. Primero lee estos 2 archivos para entender el contexto:
   - `apps/web/app/explorar-talento/page.tsx` (archivo a modificar)
   - `apps/web/app/globals.css` (sistema de diseño con clases a reutilizar)

2. Luego reescribe `page.tsx` completo aplicando estos cambios sección por sección:

### Cambios por sección

**Header (mejorar):**
- Agregar `bg-gradient-radial` sutil encima del backdrop-blur
- Botón register: cambiar gradient genérico → clases `btn-brand btn-shine` (consistencia con landing)

**Hero (rediseño completo):**
- Fondo: Cambiar `from-blue-600 via-indigo-600 to-purple-700` → clase `bg-gradient-primary` (brand pink/magenta)
- Overlay: Agregar div con `bg-dots` + opacity baja
- Animaciones de carga: usar clases `hero-title`, `hero-subtitle`, `hero-cta`, `hero-trust` en los elementos correspondientes
- Badge "Bolsa de talento abierta": agregar clase `glass` + animación `hero-trust`
- Título: Envolver "talento profesional" en `<span className="text-shimmer">talento profesional</span>`
- Subtítulo: Cambiar copy a "Conecta con profesionales verificados listos para potenciar tu negocio"
- Search input: Agregar estilo `glass` (bg-white/70 backdrop-blur), mayor shadow, clase `hero-cta`
- Trust signals NUEVOS debajo del search: "✓ Perfiles verificados · ✓ Contacto directo · ✓ 100% gratis" con clase `hero-trust`

**Stats counters (NUEVA SECCIÓN entre hero y filtros):**
- Franja con 3 contadores: Total perfiles (de `meta.total`), Especialidades (valor hardcoded "25+"), Perfiles activos (hardcoded "Actualizados semanalmente")
- Clase `animate-counter` para efecto pop al scroll
- Background `bg-gradient-soft`
- Grid: `grid-cols-1 sm:grid-cols-3`

**Filtros (mejorar):**
- Envolver en card con `glass-card` + `rounded-2xl p-4`
- Agregar `animate-on-scroll`

**Grid de cards (mejorar):**
- Card: agregar `hover-lift` (reemplaza hover custom) + `glass-card`
- Stagger: Agregar `testimonial-animate` a cada card, con `style={{ animationDelay: '${index * 0.1}s' }}` para las primeras 6
- Avatar: Agregar `ring-2 ring-transparent group-hover:ring-brand-400 transition-all` (si no existe ring-brand-400 usa ring-pink-400)
- OpenToWork badge: Agregar `pulse-glow` solo al dot verde (un span circular de 6x6 antes del texto)
- Botón "Ver perfil": Cambiar `variant="ghost"` → texto con icono ArrowRight que se mueve: `group-hover:translate-x-1 transition-transform`
- Mantener `h-full flex flex-col mt-auto`

**Dialog detalle (mejorar conversión):**
- Avatar en header: Agregar ring decorativo `ring-2 ring-pink-200`
- Sección blur para no-auth: Después de skills, si `!isLoggedIn`, mostrar div con `relative` que contiene el experience timeline con un overlay `absolute inset-0 backdrop-blur-sm bg-background/60 flex items-center justify-center` con texto "Registrate para ver más" y botón
- CTA section: Botón principal con clases `btn-brand btn-shine` en vez de gradient genérico
- Agregar texto: "Accede a perfiles completos, certificaciones y envía propuestas directas"
- Trust: "Gratis · Sin tarjeta de crédito · Registrate en 30 segundos"

**Sección "Por qué TurnoLink" (NUEVA — antes del CTA Footer, solo si `!isLoggedIn`):**
- 3 cards con iconos Shield, Zap, MessageCircle: "Perfiles verificados", "Contacto directo", "Sin compromiso"
- Clases `glass-card` + `animate-on-scroll`
- Grid `grid-cols-1 sm:grid-cols-3`
- Título de sección con `section-title`

**CTA Footer (rediseño):**
- Cambiar gradient blue → `bg-gradient-primary`
- Agregar `cta-section-animate` al section
- Agregar overlay `bg-dots` con opacity
- Botón: `bg-white text-pink-700` (en vez de text-indigo-700)
- Mejores textos orientados a acción

**Footer (mejorar):**
- Agregar `animate-on-scroll`
- Agregar enlaces a `/suscripcion`

### Imports adicionales necesarios
Agregar a los imports de lucide-react: `Shield`, `Zap`, `MessageCircle`, `CheckCircle`, `Eye`, `Lock`, `TrendingUp`

### Reglas
- NO cambiar ningún API call, state, ni lógica de filtros/paginación
- NO crear archivos nuevos
- NO agregar dependencias nuevas
- Mantener responsive (mobile-first)
- Escribir el archivo COMPLETO (no edits parciales)

### Después de escribir el archivo:
```bash
cd /var/www/turnolink/backend/apps/web && npm run build && pm2 restart web --update-env
```
