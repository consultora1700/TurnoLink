# Plan: Flujo de Delivery con Página del Repartidor

> **Contexto para retomar si la sesión se cae:** Este plan continúa el trabajo de `tmux trabajo4` (sesión perdida). El frontend ya tiene los estados `READY` y `ARRIVED`, pero el backend NO los conoce y no existe la página del repartidor.

## Estado actual (lo ya hecho antes del crash)

- `apps/web/app/(dashboard)/pedidos/page.tsx:45,71,98` — UI muestra `ARRIVED`
- `apps/web/app/(dashboard)/pedidos-cocina/page.tsx:96,149,220,288,296` — cocina muestra READY/ARRIVED
- `apps/web/app/[slug]/pedido/[orderNumber]/page.tsx:44,64,81,110` — tracking público con Lottie `arrived.json`, step "Llegó", polling 10s
- Schema: `Order.status` es **String libre**, no enum (línea 1157 de `apps/api/src/prisma/schema.prisma`) → no hace falta migrar enum, solo agregar `deliveryToken`
- Falta animación `arrived.json` (usuario la consigue aparte)

## Lo que NO existe todavía

1. Backend: validación / máquina de estados con `READY` y `ARRIVED` en `apps/api/src/modules/orders/orders.service.ts`
2. Campo `deliveryToken` en `Order`
3. Endpoint público `POST /public/delivery/:token/...` (sin auth, solo token)
4. Página `app/delivery/[token]/page.tsx` (la URL temporal del repartidor)
5. Generación del token cuando el pedido pasa a `READY` o cuando se asigna a un delivery

## Diseño

### Máquina de estados (orderType = DELIVERY)
```
PENDING → CONFIRMED → PROCESSING → READY → SHIPPED → ARRIVED → DELIVERED
                                    ↑         ↑         ↑          ↑
                                comercio   repartidor repartidor repartidor
```
- Comercio controla hasta `READY`
- Al pasar a `READY` se genera `deliveryToken` (nanoid 16 chars) y se devuelve la URL `https://turnolink.com.ar/delivery/{token}`
- Repartidor abre la URL y ve 3 botones grandes (según estado): **Retiré el pedido** → SHIPPED, **Llegué** → ARRIVED, **Entregué** → DELIVERED

### Endpoint público (sin JWT, solo token)
- `GET  /public/delivery/:token` → datos mínimos (orderNumber, dirección, teléfono cliente, items resumen, estado actual)
- `POST /public/delivery/:token/advance` → avanza al siguiente estado válido

### Página del repartidor `/delivery/[token]`
- Mobile-first, fondo neutro, tipografía grande
- Header: número de pedido + estado actual
- Card cliente: nombre, teléfono (botón "Llamar" tel:), dirección (botón "Abrir en Maps")
- Lista de items (sólo nombres + cantidades, sin precios)
- Botón gigante de acción según estado actual
- Confirmación con `confirm()` antes de marcar DELIVERED (irreversible)
- Polling cada 30s por si el comercio cancela

## Pasos de ejecución

### Paso 1 — Schema Prisma
Archivo: `apps/api/src/prisma/schema.prisma`
- En model `Order`, agregar:
  - `deliveryToken String? @unique`
  - Actualizar comentario de `status` para incluir READY, ARRIVED
- Correr `pnpm prisma migrate dev --name add_delivery_token` o `prisma db push`

### Paso 2 — Servicio de orders
Archivo: `apps/api/src/modules/orders/orders.service.ts`
- Agregar helper `getNextStatuses(current: string, orderType: string | null)`
- Agregar `generateDeliveryToken(orderId)` que setea token único cuando entra a READY
- Agregar `advanceByDeliveryToken(token: string)` con validación de transiciones permitidas a un repartidor

### Paso 3 — Controller público
Crear `apps/api/src/modules/orders/public-delivery.controller.ts`:
- `@Controller('public/delivery')` sin guard JWT
- `GET :token` y `POST :token/advance`
- Registrar en `orders.module.ts`

### Paso 4 — Frontend cliente API
Archivo: `apps/web/lib/api.ts`
- Agregar `publicApi.getDeliveryByToken(token)` y `publicApi.advanceDelivery(token)`

### Paso 5 — Página del repartidor
Crear `apps/web/app/delivery/[token]/page.tsx` (client component, no usa branding del tenant — diseño universal "TurnoLink Delivery")

### Paso 6 — Mostrar URL al comercio
En `apps/web/app/(dashboard)/pedidos/page.tsx`:
- Cuando el pedido está en READY/SHIPPED/ARRIVED, mostrar botón "Copiar link del repartidor" + QR opcional

### Paso 7 — Build & deploy
- `cd /var/www/turnolink/backend && pnpm build:api && pnpm build:web`
- `pm2 restart turnolink-api && pm2 restart web`
- Smoke test: crear pedido DELIVERY → avanzar a READY → abrir URL token → marcar SHIPPED → ARRIVED → DELIVERED

## Archivos a tocar (resumen)

| # | Archivo | Acción |
|---|---|---|
| 1 | `apps/api/src/prisma/schema.prisma` | edit (Order +deliveryToken) |
| 2 | `apps/api/src/modules/orders/orders.service.ts` | edit (state machine + token) |
| 3 | `apps/api/src/modules/orders/public-delivery.controller.ts` | **new** |
| 4 | `apps/api/src/modules/orders/orders.module.ts` | edit (registrar controller) |
| 5 | `apps/web/lib/api.ts` | edit (2 métodos nuevos) |
| 6 | `apps/web/app/delivery/[token]/page.tsx` | **new** |
| 7 | `apps/web/app/(dashboard)/pedidos/page.tsx` | edit (botón copiar link) |

## Riesgos / decisiones

- **Token sin expiración**: válido hasta DELIVERED o CANCELLED. Suficiente para MVP.
- **Sin auth del repartidor**: cualquiera con la URL puede marcar. Aceptable porque el comercio decide a quién se la pasa (WhatsApp).
- **`status` sigue siendo String**: no convertimos a enum ahora, evita migración rompedora.
- **DINE_IN / TAKE_AWAY**: este flujo NO los toca, solo `orderType=DELIVERY`.
