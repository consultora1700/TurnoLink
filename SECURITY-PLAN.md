# Plan Maestro de Remediación de Seguridad — TurnoLink

> **Roles asumidos**: Senior Systems Engineer + Senior Cybersecurity Engineer + Senior QA Tester
> **Fecha inicio**: 2026-03-17
> **Estado**: EN PROGRESO

---

## Contexto del Proyecto

- **Stack**: NestJS API + Next.js 14 + Prisma + PostgreSQL
- **Monorepo**: `/var/www/turnolink/backend/` (pnpm workspaces)
- **Producción**: `turnolink.com.ar` (web) / `api.turnolink.com.ar` (API)
- **PM2**: `pm2 restart web` / `pm2 restart api`
- **Build**: `pnpm build:web` / `pnpm build:api`
- **Base de datos**: PostgreSQL local, user `turnolink_user`

### Reglas de Implementación
1. **NO romper funcionalidad existente** — cada fix debe ser quirúrgico
2. **Testear después de cada cambio** — build debe pasar
3. **Un commit por tarea** — trazabilidad total
4. **Backward compatible** — los endpoints existentes siguen funcionando
5. **Documentar cada cambio** — qué, por qué, cómo verificar

---

## FASE 1: EMERGENCIA (Semana 1)

### Tarea 1.1 — Cambiar contraseña de admin en producción
- **Estado**: ✅ COMPLETADO (2026-03-17)
- **Severidad**: CRÍTICA
- **Archivo**: Base de datos directa (SQL)
- **Qué hacer**:
  - Generar password seguro con `openssl rand -base64 32`
  - Hashear con bcrypt (cost 12) y actualizar en BD
  - Actualizar `SUPER_ADMIN_PASSWORD` en `.env`
- **Verificación**: Login con nueva contraseña funciona, vieja no
- **Riesgo si no se hace**: Cualquiera entra como admin con `admin123456`

### Tarea 1.2 — Separar JWT_SECRET de NEXTAUTH_SECRET
- **Estado**: ✅ COMPLETADO (2026-03-17)
- **Severidad**: CRÍTICA
- **Archivos**:
  - `apps/api/.env` (línea 5)
  - `apps/web/.env` (línea 6)
- **Qué hacer**:
  - Generar nuevo secret para NEXTAUTH: `openssl rand -base64 48`
  - Actualizar `apps/web/.env` con el nuevo valor
  - **NO tocar** JWT_SECRET del API (invalidaría tokens existentes)
- **Verificación**: Login web funciona, API funciona, son secrets distintos
- **Riesgo si no se hace**: Comprometer uno = comprometer ambos

### Tarea 1.3 — Validar monto de pago contra BD + Open Redirect fix
- **Estado**: ✅ COMPLETADO (2026-03-17)
- **Severidad**: CRÍTICA
- **Archivo**: `apps/api/src/modules/bookings/public-bookings.controller.ts` (líneas 360-365)
- **Archivo secundario**: `apps/api/src/modules/mercadopago/mercadopago.service.ts`
- **Qué hacer**:
  - Antes de crear preferencia MP, consultar precio real del servicio en BD
  - Comparar con el precio que viene del request
  - Si no coincide, rechazar con 400
  - Los `back_urls` deben validarse contra whitelist de dominios permitidos
- **Verificación**:
  - Intentar pago con precio manipulado → rechazado
  - Intentar back_url con dominio externo → rechazado
  - Pago normal → funciona OK
- **Riesgo si no se hace**: Atacante paga $1 por servicio de $10.000

### Tarea 1.4 — Quitar unsafe-eval del CSP + Fix frame-src/frame-ancestors
- **Estado**: ✅ COMPLETADO (2026-03-17)
- **Severidad**: CRÍTICA
- **Archivo**: `apps/web/middleware.ts` (líneas 72-73)
- **Qué hacer**:
  - Reemplazar `'unsafe-inline'` por nonces CSP para scripts necesarios
  - Eliminar `'unsafe-eval'` — si alguna lib lo necesita (ej. Google Translate), usar hash específico
  - Arreglar `frame-src` línea 79 — quitar `https:` suelto al final
  - Cambiar `frame-ancestors *` por `frame-ancestors 'self' turnolink.com.ar`
- **Verificación**:
  - Página carga sin errores en console
  - Google Maps funciona
  - MercadoPago checkout funciona
  - DevTools → no errores CSP blocking
- **Riesgo si no se hace**: XSS puede robar sesiones de usuarios
- **NOTA**: Esta es la tarea más delicada — puede romper funcionalidades si se hace mal. Ir incremental.

### Tarea 1.5 — Fix timing attack en webhook signature de MercadoPago
- **Estado**: ✅ COMPLETADO (2026-03-17)
- **Severidad**: CRÍTICA
- **Archivo**: `apps/api/src/modules/mercadopago/mercadopago.service.ts` (línea 710)
- **Qué hacer**:
  - Reemplazar `===` por `crypto.timingSafeEqual()` con buffers de igual longitud
  - Agregar protección anti-replay: almacenar webhook IDs procesados (Redis o tabla)
- **Verificación**: Webhook de MP sigue funcionando, pagos se procesan OK
- **Riesgo si no se hace**: Atacante puede forjar notificaciones de pago

### Tarea 1.6 — Fix timing attack en admin-key guard
- **Estado**: ✅ COMPLETADO (2026-03-17)
- **Severidad**: CRÍTICA
- **Archivo**: `apps/api/src/modules/admin/guards/admin-key.guard.ts` (líneas 124-139)
- **Qué hacer**:
  - Pad ambos buffers a la misma longitud antes de comparar
  - Eliminar early return en length mismatch
  - Hacer: `const maxLen = Math.max(bufA.length, bufB.length); const a = Buffer.alloc(maxLen); const b = Buffer.alloc(maxLen); bufA.copy(a); bufB.copy(b); return crypto.timingSafeEqual(a, b);`
- **Verificación**: Admin API sigue respondiendo, keys inválidas rechazadas
- **Riesgo si no se hace**: Atacante descubre longitud de admin key

### Tarea 1.7 — Eliminar contraseña hardcoded del seed
- **Estado**: ✅ COMPLETADO (2026-03-17)
- **Severidad**: CRÍTICA
- **Archivo**: `apps/api/src/prisma/seed.ts` (líneas 11-12, 93, 389-390)
- **Qué hacer**:
  - Quitar fallback `'admin123456'` — si no hay env var, throw error
  - Quitar `'demo123456'` hardcoded — generar random si es seed de dev
  - Quitar `console.log` con credenciales (línea 389-390)
- **Verificación**: `npx prisma db seed` sin env vars → error claro, no password por defecto
- **Riesgo si no se hace**: Repo leak = credenciales expuestas

---

## FASE 2: CRÍTICO (Semana 2)

### Tarea 2.1 — Hashear tokens de password reset antes de guardar en BD
- **Estado**: ✅ COMPLETADO (2026-03-17)
- **Severidad**: CRÍTICA
- **Archivo**: `apps/api/src/modules/auth/auth.service.ts` (líneas 397-432)
- **Qué hacer**:
  - Al crear reset token: `const hashedToken = crypto.createHash('sha256').update(token).digest('hex')`
  - Guardar `hashedToken` en BD, enviar `token` original por email
  - Al validar: hashear el token recibido y comparar contra BD
- **Verificación**: Flujo reset password completo funciona (solicitar → email → click → nueva contraseña)
- **Riesgo si no se hace**: DB leak = reset cualquier cuenta

### Tarea 2.2 — Excluir passwordHash de queries de usuario
- **Estado**: ✅ COMPLETADO (2026-03-17)
- **Severidad**: ALTA
- **Archivo**: `apps/api/src/modules/users/users.service.ts` (líneas 17-28)
- **Qué hacer**:
  - En `findById`: agregar `select` explícito SIN `passwordHash`
  - En `findByEmail`: agregar `select` explícito SIN `passwordHash`
  - Crear método privado `findByEmailWithPassword` solo para uso interno en auth
  - Buscar TODOS los usos de estos métodos y verificar que no necesitan el hash
- **Verificación**:
  - `GET /me` no devuelve passwordHash
  - Login sigue funcionando (usa método con password)
- **Riesgo si no se hace**: Hash de contraseñas expuesto a frontend

### Tarea 2.3 — Desactivar debug mode en NextAuth
- **Estado**: ✅ COMPLETADO (2026-03-17)
- **Severidad**: ALTA
- **Archivo**: `apps/web/lib/auth.ts` (línea 162)
- **Qué hacer**:
  - Cambiar `debug: true` a `debug: process.env.NODE_ENV !== 'production'`
- **Verificación**: Build web OK, login funciona, no hay data sensible en logs de producción
- **Riesgo si no se hace**: Sesiones y tokens visibles en logs

### Tarea 2.4 — Rate limiting en endpoint reset-password
- **Estado**: ✅ COMPLETADO (2026-03-17)
- **Severidad**: ALTA
- **Archivo**: `apps/api/src/modules/auth/auth.controller.ts` (línea 86)
- **Qué hacer**:
  - Agregar `@Throttle({ default: { limit: 3, ttl: 300000 } })` al endpoint `POST reset-password`
  - Reducir login a 3 intentos/minuto (actualmente 5)
  - Reducir register a 2/minuto (actualmente 3)
- **Verificación**: 4to intento de reset en 5 min → 429 Too Many Requests
- **Riesgo si no se hace**: Brute force de tokens de reset

### Tarea 2.5 — Validar URLs de retorno de MercadoPago (Open Redirect)
- **Estado**: ✅ COMPLETADO (2026-03-17) — implementado junto con Tarea 1.3
- **Severidad**: CRÍTICA
- **Archivo**: `apps/api/src/modules/bookings/public-bookings.controller.ts` (líneas 325, 360-365)
- **Qué hacer**:
  - Crear whitelist de dominios: `['turnolink.com.ar', 'www.turnolink.com.ar', 'localhost']`
  - Validar que `successUrl`, `failureUrl`, `pendingUrl` pertenecen a whitelist
  - Si no pasan validación, usar URLs por defecto
- **Verificación**:
  - URL con dominio externo → se usa URL por defecto
  - URL legítima → funciona normal
- **Riesgo si no se hace**: Phishing post-pago

### Tarea 2.6 — Fix frame-src y frame-ancestors en CSP
- **Estado**: ✅ COMPLETADO (2026-03-17) — implementado junto con Tarea 1.4
- **Severidad**: ALTA
- **Archivo**: `apps/web/middleware.ts` (líneas 79-80)
- **Qué hacer**:
  - Quitar `https:` suelto al final de `frame-src`
  - Cambiar `frame-ancestors *` en rutas embed por `frame-ancestors 'self' turnolink.com.ar *.turnolink.com.ar`
- **Verificación**: iframes de Google Maps y MP siguen funcionando, clickjacking bloqueado
- **Riesgo si no se hace**: Clickjacking

### Tarea 2.7 — Tokens de review con expiración y crypto seguro
- **Estado**: ✅ COMPLETADO (2026-03-17)
- **Severidad**: ALTA
- **Archivo**: `apps/api/src/modules/reviews/reviews.service.ts` (líneas 43-65)
- **Qué hacer**:
  - Agregar timestamp al payload del HMAC: `${bookingId}:${customerId}:${tenantId}:${timestamp}`
  - Validar que el token no tenga más de 30 días
  - Agregar rate limit en validación
- **Verificación**: Review con token viejo → rechazado, review con token fresco → OK
- **Riesgo si no se hace**: Reviews falsas ilimitadas

### Tarea 2.8 — Mejorar validación MIME en uploads
- **Estado**: ✅ COMPLETADO (2026-03-17)
- **Severidad**: ALTA
- **Archivo**: `apps/api/src/modules/media/media.service.ts` (líneas 71-73)
- **Qué hacer**:
  - Instalar `file-type` package para validar magic bytes
  - Después de check de MIME header, leer primeros bytes del archivo
  - Si magic bytes no coinciden con MIME declarado → rechazar
  - Sanitizar filename para prevenir path traversal (`../`)
- **Verificación**: Upload .jpg real → OK, upload .exe renombrado a .jpg → rechazado
- **Riesgo si no se hace**: Ejecución de archivos maliciosos

---

## FASE 3: ALTO (Semana 3)

### Tarea 3.1 — Reducir expiración de refresh token
- **Estado**: ✅ COMPLETADO (2026-03-17)
- **Severidad**: MEDIA
- **Archivo**: `apps/api/src/modules/auth/auth.service.ts`
- **Qué hacer**: Reducir de 30 días a 7 días
- **Verificación**: Refresh token expira a los 7 días

### Tarea 3.2 — Implementar rotación de refresh tokens
- **Estado**: ✅ COMPLETADO (2026-03-17)
- **Severidad**: MEDIA
- **Archivo**: `apps/api/src/modules/auth/auth.service.ts`
- **Qué hacer**: Al usar un refresh token, invalidar el anterior y emitir uno nuevo
- **Verificación**: Refresh → nuevo par de tokens, viejo refresh → rechazado

### Tarea 3.3 — Protección anti-replay en webhooks
- **Estado**: ✅ COMPLETADO (2026-03-17)
- **Severidad**: MEDIA
- **Archivo**: `apps/api/src/common/utils/webhook-signature.ts`
- **Qué hacer**: Almacenar webhook IDs procesados (tabla o cache) y rechazar duplicados
- **Verificación**: Webhook repetido → ignorado, webhook nuevo → procesado

### Tarea 3.4 — Eliminar dev bypass en webhook signature
- **Estado**: ✅ COMPLETADO (2026-03-17)
- **Severidad**: ALTA
- **Archivo**: `apps/api/src/common/utils/webhook-signature.ts` (líneas 14-16)
- **Qué hacer**: Eliminar `if (process.env.NODE_ENV !== 'production') return true`
- **Verificación**: En dev, webhooks sin firma → rechazados (usar firma real en tests)
- **Riesgo si no se hace**: NODE_ENV mal configurado = webhooks sin verificar

### Tarea 3.5 — Reducir límite de tamaño a uploads (20MB → 5MB)
- **Estado**: ✅ COMPLETADO (2026-03-17)
- **Severidad**: MEDIA
- **Archivo**: `apps/api/src/modules/media/media.service.ts`
- **Qué hacer**: Limitar a 5MB por archivo, validar antes de procesar con Sharp
- **Verificación**: Upload de 6MB → rechazado con 413

### Tarea 3.6 — Quitar console.log con datos sensibles en seed
- **Estado**: ✅ COMPLETADO (2026-03-17) — implementado junto con Tarea 1.7
- **Archivo**: `apps/api/src/prisma/seed.ts`

---

## FASE 4: MEDIO (Semana 4)

### Tarea 4.1 — Agregar headers de seguridad faltantes (HSTS, Permissions-Policy)
- **Estado**: ✅ COMPLETADO (2026-03-17)
- **Archivo**: `apps/web/middleware.ts`
- **Qué hacer**: Agregar `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`

### Tarea 4.2 — Reducir session maxAge (7d → 1d)
- **Estado**: ✅ COMPLETADO (2026-03-17)
- **Archivo**: `apps/web/lib/auth.ts`
- **Qué hacer**: Reducir de 7 días a 1 día

### Tarea 4.3 — Protección contra enumeración de usuarios
- **Estado**: ✅ COMPLETADO (2026-03-17)
- **Archivo**: `apps/api/src/modules/auth/auth.service.ts`
- **Qué hacer**: Login y forgot-password deben responder en tiempo constante sin importar si el email existe

### Tarea 4.4 — Soft delete awareness en queries
- **Estado**: ✅ YA ESTABA RESUELTO — middleware en prisma.service.ts ya filtra deletedAt automáticamente
- **Archivos**: Varios servicios
- **Qué hacer**: Asegurar que queries filtren registros soft-deleted

---

## Checklist de Verificación Final

- [ ] Build API: `pnpm build:api` sin errores
- [ ] Build Web: `pnpm build:web` sin errores
- [ ] Login admin funciona con nueva contraseña
- [ ] Login usuario normal funciona
- [ ] Crear reserva y pagar con MercadoPago funciona
- [ ] Reset password funciona (solicitar + confirmar)
- [ ] Upload de imagen funciona
- [ ] Webhook de MP procesa pagos correctamente
- [ ] Página pública de booking carga sin errores CSP
- [ ] Dashboard carga sin errores CSP
- [ ] Google Maps en booking funciona
- [ ] Portal de empleados funciona

---

## Registro de Cambios

| Fecha | Tarea | Estado | Notas |
|-------|-------|--------|-------|
| 2026-03-17 | Plan creado | ✅ | 25 tareas en 4 fases |
| 2026-03-17 | FASE 1 completa | ✅ | 7/7 tareas: admin password, secrets separados, MP validation, CSP, timing attacks, seed |
| 2026-03-17 | FASE 2 completa | ✅ | 8/8 tareas: hash reset tokens, password exclusion, debug off, rate limits, reviews, MIME |
| 2026-03-17 | FASE 3 completa | ✅ | 5/5: refresh token 7d + rotación, dev bypass eliminado, upload 5MB, anti-replay webhooks |
| 2026-03-17 | FASE 4 completa | ✅ | 4/4: HSTS+Permissions-Policy, session 1d, user enumeration, soft delete (ya existía) |
| 2026-03-17 | **PLAN COMPLETADO** | ✅ | **25/25 tareas implementadas y deployadas en producción** |

