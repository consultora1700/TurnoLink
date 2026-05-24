# PROMPT PARA CLAUDE EN EL VPS DE COLMEN (colmen.com.ar)

> Copiá y pegá todo lo que sigue como primer mensaje a Claude en el VPS donde corre **colmen.com.ar**.
> Está escrito para que Claude actúe sin tener que preguntar: ya trae el contexto, las decisiones tomadas y la verificación esperada.

---

## Contexto (leé primero)

Venimos de separar dos productos que vivían en el mismo dominio (turnolink.com.ar):

- **TurnoLink** (turnolink.com.ar): sistema de **turnos y reservas por bloque** (hora, día, noche). Para cuando el negocio vende "ocupar un espacio por un tiempo".
- **Colmen** (colmen.com.ar — *este VPS*): **tiendas online, gastronomía, inmobiliarias (venta / alquiler tradicional por mes), mercado multi-tenant**. Para cuando el negocio vende "un producto o un inmueble", no un bloque de tiempo.

Reglas acordadas con el usuario:

| Vertical | Queda en |
|---|---|
| belleza, salud, deportes, turnos-profesionales | TurnoLink |
| alquiler-temporario, hospedaje-por-horas, espacios-flexibles | TurnoLink (son reservas por hora/día) |
| gastronomia, mercado, tiendas-online | **Colmen** |
| **inmobiliarias** (compra-venta, alquiler mensual tradicional) | **Colmen — NUEVO, no existe todavía** |
| `/integrar`, `/explorar-talento` | Solo TurnoLink — **quitar de Colmen si existen** |
| `/register` | Cada marca tiene el suyo (UI independiente, misma API si aplica) |

El VPS de TurnoLink ya fue limpiado: se eliminaron `mercado` y `gastronomia` del código, sitemap, metadata y footer. Este VPS de Colmen tiene que hacer el inverso **y** arreglar los bugs SEO del informe que sigue.

---

## Bugs SEO confirmados en colmen.com.ar (por curl)

Informe ejecutivo (2026-04-21):

### CRÍTICOS — arreglar primero

1. **Canonical apunta a turnolink.com.ar en casi todas las landings.**
   URLs afectadas (hay `<link rel="canonical" href="https://turnolink.com.ar/...">` cuando debería ser `https://colmen.com.ar/...`):
   - `/salud`, `/belleza`, `/mercado`, `/gastronomia`, `/deportes`
   - `/hospedaje-por-horas`, `/alquiler-temporario`, `/espacios-flexibles`
   - `/explorar-talento`, `/salud/psicologos`, `/salud/odontologos`
   - `/register`, `/integrar`
   - Están OK: `/`, `/turnos-online`, `/turnos-online/buenos-aires`, `/smash-house`
   - **Nota**: las URLs de TurnoLink-only (`/belleza`, `/salud`, `/deportes`, `/turnos-profesionales`, `/alquiler-temporario`, `/hospedaje-por-horas`, `/espacios-flexibles`, `/explorar-talento`, `/integrar`) no deberían existir en Colmen. Ver acción #3 abajo.

2. **robots.txt bloquea las verticales a todos los bots excepto Googlebot.**
   Hay un bloque `User-Agent: *` con Disallows masivos y un bloque `User-Agent: Googlebot` que permite todo — resultado: Bing, DuckDuckGo, Brave, Yandex no rastrean nada. Es un bug legacy de cuando colmen y turnolink compartían código.

3. **Identidad de marca confusa en titles.** Ej.: "TurnoLink para Salud … | Colmen" en un sitio que vive en colmen.com.ar. Decisión tomada: **marca principal = Colmen** en este dominio. Reescribir titles sacando "TurnoLink" de las que se quedan (gastronomia, mercado, tiendas-online, inmobiliarias).

### ALTOS

4. **og:image vacío** en todas las verticales (solo `/`, `/register`, `/ayuda`, `/integrar` tienen). Corto plazo: fallback global.
5. **meta descriptions pasadas de 165 chars** en casi todas — Google las trunca y se pierde la CTA. Cortar a ≤160.
6. **Falta H1** en `/register` y `/explorar-talento`. `/smash-house` tiene 2 H1, dejar 1.
7. **/ayuda y /integrar heredan la description genérica del home** — darles la suya.

### MEDIOS

8. **Sitemap con lastmod falso** — todas las URLs con el mismo timestamp (la hora de generación). Google ignora la señal. Ver la solución aplicada en TurnoLink (más abajo) y portearla.
9. **/smash-house title desaprovechado** (37 chars, podría llevar 70+).

---

## Qué tiene que hacer Claude en este VPS

Ejecutá en este orden. Marcá cada tarea con TaskCreate → in_progress → completed a medida que avanzás. No pidas confirmación para cada paso; sí pará y preguntá si te topás con algo que este brief no cubre (por ejemplo, si el layout de archivos no coincide con lo que se describe acá).

### Fase 1 — Limpieza de verticales que NO son de Colmen

Colmen se queda SOLO con: `gastronomia`, `mercado`, `tiendas-online` (si existe), `inmobiliarias` (crear). El resto son de TurnoLink y hay que sacarlas.

1. Hacer backup antes de borrar:
   ```bash
   mkdir -p /var/www/<ruta-colmen>/_turnolink-exit-2026-04-21
   ```
   Mover (no eliminar) estos directorios, si existen, al backup:
   - `apps/web/app/_landing/belleza/`
   - `apps/web/app/_landing/salud/`
   - `apps/web/app/_landing/deportes/`
   - `apps/web/app/_landing/turnos-profesionales/`
   - `apps/web/app/_landing/alquiler-temporario/`
   - `apps/web/app/_landing/hospedaje-por-horas/`
   - `apps/web/app/_landing/espacios-flexibles/`
   - `apps/web/app/belleza/` `apps/web/app/salud/` `apps/web/app/deportes/`
   - `apps/web/app/turnos-profesionales/` `apps/web/app/alquiler-temporario/`
   - `apps/web/app/hospedaje-por-horas/` `apps/web/app/espacios-flexibles/`
   - `apps/web/app/explorar-talento/` (y su layout)
   - `apps/web/app/integrar/`

2. Buscar referencias rotas en el resto del código:
   ```
   Grep "belleza|salud|deportes|turnos-profesionales|alquiler-temporario|hospedaje-por-horas|espacios-flexibles|explorar-talento|integrar" apps/web
   ```
   Limpiar:
   - `apps/web/app/sitemap.ts` (sacar esos slugs del array INDUSTRIES)
   - `apps/web/app/robots.ts` (sacar esos paths del Disallow si están)
   - `apps/web/app/_landing/_data/niche-registry.ts` (quitar los imports)
   - `apps/web/app/_landing/_data/cities.ts` (reemplazar links a esas verticales por verticales de Colmen o por `/`)
   - Footer(s): reemplazar enlaces a esas verticales por las de Colmen
   - Cualquier `layout.tsx` con metadata que cite esas verticales

3. Redirects 301 desde los paths viejos de Colmen hacia el equivalente en TurnoLink (para no dejar 404 a los usuarios viejos). Agregar en `next.config.js` → `async redirects()`:
   ```js
   { source: '/belleza',              destination: 'https://turnolink.com.ar/belleza',              permanent: true },
   { source: '/salud/:path*',         destination: 'https://turnolink.com.ar/salud/:path*',         permanent: true },
   { source: '/deportes',             destination: 'https://turnolink.com.ar/deportes',             permanent: true },
   { source: '/turnos-profesionales', destination: 'https://turnolink.com.ar/turnos-profesionales', permanent: true },
   { source: '/alquiler-temporario',  destination: 'https://turnolink.com.ar/alquiler-temporario',  permanent: true },
   { source: '/hospedaje-por-horas',  destination: 'https://turnolink.com.ar/hospedaje-por-horas',  permanent: true },
   { source: '/espacios-flexibles',   destination: 'https://turnolink.com.ar/espacios-flexibles',   permanent: true },
   { source: '/explorar-talento',     destination: 'https://turnolink.com.ar/explorar-talento',     permanent: true },
   { source: '/integrar',             destination: 'https://turnolink.com.ar/integrar',             permanent: true },
   ```
   (Nota: `/belleza/:path*` también si existen subrutas.)

### Fase 2 — Arreglo de canonical (CRÍTICO #1)

Buscar dónde se construye el canonical. Probablemente:
- Una constante `SITE_URL` / `BASE_URL` en `apps/web/app/_landing/_components/seo-schemas.tsx`, `apps/web/app/_landing/_components/seo.ts` u otro helper, que todavía apunta a `https://turnolink.com.ar`.
- `NEXT_PUBLIC_APP_URL` o `NEXT_PUBLIC_SITE_URL` en `.env`/`.env.production`.

Acción:
1. `grep -r "turnolink.com.ar" apps/web/` — confirmar todas las ocurrencias.
2. Reemplazar por `https://colmen.com.ar` en todas las fuentes de canonical (tanto constantes hardcodeadas como ENV).
3. Confirmar que `.env.production` tenga `NEXT_PUBLIC_APP_URL=https://colmen.com.ar`.
4. `curl -s https://colmen.com.ar/gastronomia | grep canonical` después del deploy debe devolver `https://colmen.com.ar/gastronomia`.

### Fase 3 — robots.txt (CRÍTICO #2)

Archivo probablemente en `apps/web/app/robots.ts`. Reemplazar por un único bloque limpio (sin el legacy bloqueo de verticales y sin el workaround Googlebot):

```ts
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://colmen.com.ar';
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/'],
        disallow: [
          '/admin/',
          '/api/',
          '/embed/',
          '/login',
          '/forgot-password',
          '/reset-password',
          '/verificar-email',
          '/verificar-cuenta',
          '/mi-perfil',
          '/mi-suscripcion',
          '/clientes/',
          '/configuracion/',
          '/suscripcion/',
          '/reportes/',
          '/finanzas/',
          '/portal-empleado/',
          '/checkout/',
          '/pedido/',
          '/_next/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
```

Verificar después del deploy: `curl -s https://colmen.com.ar/robots.txt` — un solo bloque User-Agent: *, sin `Disallow: /gastronomia` ni equivalentes.

### Fase 4 — Identidad de marca en titles (CRÍTICO #3)

Decisión tomada: **marca = Colmen** en este dominio.

1. En `apps/web/app/layout.tsx` (raíz), verificar/setear:
   ```ts
   title: { default: '<title del home>', template: '%s | Colmen' },
   ```
2. En cada landing vertical que queda (`_landing/gastronomia/page.tsx`, `_landing/mercado/page.tsx`, `_landing/tiendas-online/page.tsx` si existe, `_landing/inmobiliarias/page.tsx` cuando se cree):
   - El title del page NO debe terminar con "| Colmen" — el template lo agrega solo.
   - Sacar la palabra "TurnoLink" de cualquier title, description y openGraph de Colmen.
   - Ejemplo: "Colmen para Gastronomía — Pedidos, mesas y delivery".

3. Home (`/`): title + description que hablen de Colmen como plataforma (no de TurnoLink). Sugerencia:
   - title: `'Plataforma de Comercios: Tienda, Gastronomía e Inmobiliarias | Colmen'`
   - description (≤160 chars): `'Vendé online, gestioná pedidos, mesas, reservas de inmuebles y tu tienda desde un solo lugar. Plataforma todo-en-uno para comercios. Probá 14 días gratis.'`

4. Verificar post-deploy:
   ```bash
   for u in "" gastronomia mercado; do
     curl -s "https://colmen.com.ar/$u" | grep -oE '<title>[^<]+</title>'
   done
   ```
   Ningún resultado debe tener "TurnoLink", y "| Colmen" debe aparecer **una sola vez** (no duplicado).

### Fase 5 — Crear vertical `/inmobiliarias` (NUEVO)

Usar `_landing/gastronomia/` como template (estructura). Crear:
- `apps/web/app/_landing/inmobiliarias/page.tsx` (metadata + JSON-LD + BreadcrumbListJsonLd + FaqJsonLd)
- `apps/web/app/_landing/inmobiliarias/inmobiliarias-landing.tsx` (componente UI)
- `apps/web/app/_landing/inmobiliarias/inmobiliarias-faqs.ts` (6–8 FAQs)
- `apps/web/app/inmobiliarias/page.tsx` si la arquitectura usa este patrón

**Angular del producto** (importante para el copy, no confundir con alquiler temporario):
- Compra y venta de inmuebles
- Alquiler tradicional por mes (no por día/noche)
- Tasaciones
- Cartera de propiedades
- Gestión de contactos / leads
- NO es alquiler temporario ni vacacional — eso es TurnoLink.

Keywords sugeridas: `inmobiliaria online`, `software inmobiliaria argentina`, `gestión cartera propiedades`, `CRM inmobiliario`, `publicar propiedades`, `tasación online`, `alquileres mensuales sistema`, `venta inmuebles plataforma`.

Agregar el slug a `sitemap.ts` (INDUSTRIES) y a niche-registry si aplica.

### Fase 6 — og:image fallback (ALTO #4)

En `apps/web/app/layout.tsx` metadata raíz, agregar:
```ts
openGraph: {
  // ... existente
  images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Colmen' }],
},
twitter: {
  // ... existente
  images: ['/og-image.jpg'],
},
```
Cada landing vertical puede sobreescribir con su propia imagen. Si `/og-image.jpg` no existe en `public/`, generar una (o copiar la de TurnoLink como placeholder temporal y luego re-brandear).

### Fase 7 — Meta descriptions a ≤160 chars (ALTO #5)

Para cada landing de Colmen, reescribir la description con:
- Keyword principal al principio
- Call to action al final ("14 días gratis", "probá hoy")
- Máximo 160 caracteres (contar con `wc -m` o similar)

URLs a revisar (se conservan en Colmen): `/`, `/gastronomia`, `/mercado`, `/turnos-online`, `/turnos-online/buenos-aires`, `/smash-house`, `/salud/psicologos` y `/salud/odontologos` SI se deciden mantener (probablemente NO, son de TurnoLink → ya están en Fase 1 para eliminar).

### Fase 8 — H1 faltantes (ALTO #6)

- `/register`: agregar un `<h1>` con el mensaje principal ("Crear cuenta en Colmen" o similar).
- `/smash-house`: tiene 2 H1 — dejar solo 1 (el más descriptivo de la propuesta del negocio).
- `/explorar-talento` queda eliminado (Fase 1), no aplica.

### Fase 9 — Descriptions únicas para /ayuda e /integrar (ALTO #7)

`/integrar` queda eliminado (Fase 1). Para `/ayuda`, setear su propia description. Ejemplo:
```
'Centro de ayuda de Colmen: guías rápidas, tutoriales, FAQs y soporte para comercios. Gestioná tienda, pedidos y reservas sin trabarte.'
```

### Fase 10 — Sitemap con lastmod real (MEDIO #8)

Portear la solución aplicada en TurnoLink VPS al `sitemap.ts` de Colmen. Patrón:

```ts
import { execSync } from 'child_process';

const BUILD_TIME_ISO = new Date().toISOString();
const gitDateCache = new Map<string, string>();

function resolveRepoRoot(): string | null {
  try {
    return execSync('git rev-parse --show-toplevel', { encoding: 'utf-8', timeout: 2000 }).trim() || null;
  } catch { return null; }
}
const REPO_ROOT = resolveRepoRoot();

function gitLastMod(relPath: string): string {
  const cached = gitDateCache.get(relPath);
  if (cached) return cached;
  if (!REPO_ROOT) { gitDateCache.set(relPath, BUILD_TIME_ISO); return BUILD_TIME_ISO; }
  try {
    const out = execSync(`git log -1 --format=%aI -- "${relPath}"`, {
      cwd: REPO_ROOT, encoding: 'utf-8', timeout: 2000,
    }).trim();
    const iso = out || BUILD_TIME_ISO;
    gitDateCache.set(relPath, iso);
    return iso;
  } catch {
    gitDateCache.set(relPath, BUILD_TIME_ISO);
    return BUILD_TIME_ISO;
  }
}
```
Usar `gitLastMod('apps/web/app/page.tsx')` (etc.) en lugar de `new Date().toISOString()` para cada entrada estática. Las URLs dinámicas de tenants siguen usando su `updatedAt` de la API.

Verificación post-deploy: `curl -s https://colmen.com.ar/sitemap.xml | grep -c lastmod` y chequear que los `<lastmod>` NO sean todos iguales.

### Fase 11 — /smash-house title (MEDIO #9)

Cambiar de `"Smash House - Reservar Turno | Colmen"` a algo como `"Smash House Buenos Aires — Smash Burgers Artesanales"` (el template le suma "| Colmen" solo). Buscar archivo con ese title — probablemente un tenant público renderizado desde DB, no un archivo estático. Si es de DB: actualizar el registro. Si es estático: editar el archivo.

### Fase 12 — Build + deploy + verificación

1. Build local:
   ```bash
   pnpm --filter web build
   ```
   Arreglar cualquier error de TypeScript que haya quedado del borrado de archivos.

2. Deploy zero-downtime (si este VPS usa el mismo patrón que TurnoLink):
   ```bash
   ./scripts/deploy.sh
   ```
   Si no hay script, describime el setup (pm2 / systemd / docker) y te indico.

3. Batería de verificaciones post-deploy:
   ```bash
   # Canonical en todas las verticales de Colmen
   for u in "" gastronomia mercado inmobiliarias tiendas-online; do
     echo "=== /$u ==="
     curl -s "https://colmen.com.ar/$u" | grep -oE 'rel="canonical" href="[^"]*"'
     curl -s "https://colmen.com.ar/$u" | grep -oE '<title>[^<]+</title>'
   done

   # Redirects 301 a TurnoLink
   for u in belleza salud deportes turnos-profesionales alquiler-temporario hospedaje-por-horas espacios-flexibles explorar-talento integrar; do
     echo -n "/$u → "; curl -sI -o /dev/null -w "%{http_code} %{redirect_url}\n" "https://colmen.com.ar/$u"
   done

   # robots.txt sin bloqueos legacy
   curl -s https://colmen.com.ar/robots.txt

   # sitemap con lastmod diversos
   curl -s https://colmen.com.ar/sitemap.xml | grep -E '<loc>|<lastmod>' | head -40
   ```

4. Después de verificar OK:
   - Submitear el sitemap actualizado en Google Search Console: https://search.google.com/search-console → propiedad colmen.com.ar → Sitemaps → agregar `sitemap.xml`.
   - "Solicitar indexación" de `/`, `/gastronomia`, `/mercado`, `/inmobiliarias` (nueva).
   - Pedir a Google que re-rastree el robots.txt (en SC → Configuración → robots.txt → probar).

### Entregable final

Cuando termines, contame:
1. Qué se eliminó (lista de paths movidos al backup).
2. Qué se arregló (uno por cada bug CRÍTICO/ALTO/MEDIO del informe).
3. Qué se creó nuevo (landing inmobiliarias, redirects, etc.).
4. Resultado de la batería de curl de la Fase 12 punto 3.
5. Confirmación de que `pnpm --filter web build` pasó sin errores.

Si algo no está donde este brief dice que debería estar (distinto layout de archivos, otro nombre de proyecto, etc.), pará y preguntá en vez de adivinar.

---

## Handoff disponible en el VPS de TurnoLink

En `/var/www/turnolink/backend/_colmen-handoff-2026-04-21/` quedaron los archivos originales de gastronomia y mercado por si sirven de referencia. Son los mismos que este VPS de Colmen ya tiene, pero por las dudas.

En `/var/www/turnolink/backend/INFORME-SEO-COLMEN.txt` está el informe completo original (18 URLs auditadas, cada issue con severidad y esfuerzo).

Fin del prompt.
