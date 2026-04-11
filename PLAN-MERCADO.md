# TurnoLink Mercado — Plan Maestro de Implementación

## Contexto

TurnoLink Mercado es un módulo de catálogo/e-commerce dentro de TurnoLink que permite a comercios, inmobiliarias y emprendedores publicar productos con dos modos de venta:

- **Modo Catálogo**: El cliente navega productos y consulta por WhatsApp. El vendedor cierra la venta personalmente.
- **Modo Tienda**: El cliente agrega al carrito, elige cantidades/variantes y paga con Mercado Pago. Orden confirmada automáticamente.

### Stack existente
- NestJS API + Next.js 14 + Prisma + PostgreSQL
- MercadoPago ya integrado (OAuth, preferences, webhooks)
- Media upload con S3/R2 + procesamiento Sharp
- Notificaciones: Email (Resend), WhatsApp, Push
- Multi-tenant: todo scoped por tenantId

### Modelos Prisma YA existentes
- `Product`, `ProductCategory`, `ProductVariant`, `ProductImage`
- `Cart`, `CartItem`
- `Order`, `OrderItem`, `OrderStatusHistory`
- `Payment`
- `Coupon`, `CouponUsage`
- `WishlistItem`
- `TenantBranding`

### Competencia directa
- Tiendanube ($$$, complejo), Shopify ($$$, overkill), Pedix (limitado), GoCatalogo (básico)
- Nuestro diferencial: simplicidad + WhatsApp nativo + Mercado Pago integrado + branding profesional + gestión de stock — todo desde $5.990/mes

---

## Fases de Implementación

### FASE 1: Backend — Products CRUD + Categories ✅/🔲
> Base del sistema. Sin productos no hay nada.

- [x] 1.1 — Verificar/ajustar modelos Prisma existentes (Product, ProductCategory, ProductVariant, ProductImage) — TODAS las tablas ya existían en DB
- [x] 1.2 — Crear módulo `products` (module, service, controller, DTOs) — COMPLETADO
  - POST /products — crear producto
  - GET /products — listar productos del tenant
  - GET /products/:id — detalle producto
  - PUT /products/:id — actualizar producto
  - DELETE /products/:id — soft delete
  - PUT /products/reorder — reordenar
  - POST /products/:id/images — subir imágenes
  - DELETE /products/:id/images/:imageId — eliminar imagen
- [x] 1.3 — Categories CRUD — integrado en ProductsController (categories/all, categories/:id, etc.)
- [x] 1.4 — Variants CRUD — integrado en ProductsController (:id/variants, :id/variants/:variantId)
- [x] 1.5 — Endpoints públicos — PublicProductsController (/public/tenants/:slug/products, /product-categories)
- [x] 1.6 — Subscription limits — checkLimit en create, stock management, stats endpoint

### FASE 2: Backend — Branding & Storefront Config ✅
> La tienda tiene que verse como la marca del cliente.

- [x] 2.1 — CRUD de TenantBranding (GET /branding, PUT /branding) — BrandingModule creado
- [x] 2.2 — Store config toggles en TenantBranding (storeEnabled, showPrices, showStock, enableWishlist, enableReviews)
- [x] 2.3 — Endpoint público de branding (GET /public/tenants/:slug/branding)
- [x] 2.4 — DTO con validación hex colors, max lengths, enum backgroundStyle

### FASE 3: Frontend Dashboard — Gestión de Productos 🔲
> El vendedor necesita cargar y gestionar sus productos.

- [x] 3.1 — Página `/catalogo` — Lista de productos con filtros, búsqueda, acciones rápidas — COMPLETADO
- [x] 3.2 — Página `/catalogo/nuevo` — Crear producto (fotos, precio, descripción, variantes, categoría, stock) — COMPLETADO
- [x] 3.3 — Página `/catalogo/[id]` — Editar producto — COMPLETADO
- [x] 3.4 — Página `/categorias-productos` — Gestionar categorías (CRUD, reordenar, drag & drop) — COMPLETADO
- [x] 3.5 — Sidebar: agregados items "Productos", "Categorías", "Pedidos", "Mi Tienda" + ocultos para non-mercado rubros
- [x] 3.6 — Dashboard stats: productos activos, stock bajo, destacados, total — Integrado en página /catalogo

### FASE 4: Frontend Dashboard — Branding & Configuración 🔲
> El vendedor personaliza su tienda.

- [x] 4.1 — Página dedicada `/mi-tienda` — COMPLETADO
  - Upload logo, banner, portada, favicon
  - Selector de colores (primario, secundario, acento, fondo, texto)
  - Tipografía (fuente cuerpo + títulos)
  - Textos: título bienvenida, subtítulo, footer
  - SEO: meta title, meta description con preview Google
  - Estilo de fondo (minimal/modern/elegant/fresh/vibrant)
  - Vista previa en tiempo real en sidebar
- [x] 4.2 — Toggle show/hide: precios, stock, wishlist, reseñas, tienda habilitada — COMPLETADO

### FASE 5: Storefront Público — Catálogo del Cliente 🔲
> Lo que ve el comprador. Tiene que ser rápido, bonito y convertir.

- [x] 5.1 — Página pública del catálogo integrada en `/:slug` (auto-detecta rubro mercado) — COMPLETADO
  - Header con branding (logo, banner, nombre, descripción, social links)
  - Filtro por categorías (pills scrollables)
  - Grid de productos (foto, nombre, precio, badge stock, descuento %, featured)
  - Búsqueda por nombre
  - Botón WhatsApp por producto (Modo Catálogo)
  - Responsive mobile-first
  - Footer con "Creado con TurnoLink Mercado"
- [x] 5.2 — Página de detalle de producto: `/:slug/producto/:productSlug` — COMPLETADO
  - Galería de fotos (carrusel con thumbnails, nav arrows)
  - Nombre, precio, precio comparativo (tachado con % descuento)
  - Selector de variantes (talle, color, etc.) con precio por variante
  - Stock disponible / Agotado
  - Descripción completa
  - Botón WhatsApp con info del producto (Modo Catálogo)
  - Productos relacionados (misma categoría)
  - Share button
- [x] 5.3 — SEO: meta tags, Open Graph con imagen del producto — COMPLETADO
- [x] 5.4 — Theme system: colores del branding aplicados dinámicamente — COMPLETADO

### FASE 6: Backend — Cart & Checkout 🔲
> El carrito y el flujo de compra (Modo Tienda).

- [ ] 6.1 — Módulo `cart` (service, controller)
  - POST /cart/items — agregar item
  - PUT /cart/items/:id — actualizar cantidad
  - DELETE /cart/items/:id — eliminar item
  - GET /cart — obtener carrito actual
  - DELETE /cart — vaciar carrito
  - Cart por sessionId (anónimo) o customerId (logueado)
  - Validación de stock al agregar
  - Expiración de carritos (24hs)
- [ ] 6.2 — Módulo `orders` (service, controller)
  - POST /orders/checkout — crear orden desde carrito
    1. Validar stock de todos los items
    2. Calcular totales (subtotal, descuento, envío, total)
    3. Crear Order + OrderItems
    4. Aplicar cupón si existe
    5. Crear Payment preference en Mercado Pago
    6. Retornar initPoint para redirect
  - GET /orders — listar órdenes del tenant
  - GET /orders/:id — detalle de orden
  - PUT /orders/:id/status — cambiar estado (PENDING → CONFIRMED → SHIPPED → DELIVERED)
  - GET /public/orders/:orderNumber — tracking público de orden
- [ ] 6.3 — Webhook Mercado Pago para órdenes
  - Recibir notificación de pago
  - Actualizar Payment status
  - Si APPROVED: confirmar orden, descontar stock, enviar emails
  - Si REJECTED/CANCELLED: liberar stock reservado
- [ ] 6.4 — Reserva de stock temporal durante checkout (15 min TTL)

### FASE 7: Frontend — Cart & Checkout 🔲
> La experiencia de compra del cliente.

- [ ] 7.1 — Componente carrito flotante/drawer
  - Badge con cantidad de items
  - Lista de items con foto, nombre, variante, cantidad, precio
  - Modificar cantidad / eliminar
  - Subtotal y total
  - Input cupón de descuento
  - Botón "Ir a pagar"
- [ ] 7.2 — Página checkout
  - Resumen de orden
  - Datos de contacto (nombre, email, teléfono)
  - Dirección de envío (si aplica)
  - Método de envío (a coordinar / retiro en local)
  - Redirect a Mercado Pago
- [ ] 7.3 — Páginas post-checkout
  - `/orden/exito` — confirmación con detalle
  - `/orden/pendiente` — pago pendiente
  - `/orden/error` — error en pago
- [ ] 7.4 — Tracking de orden pública

### FASE 8: Backend — Órdenes & Gestión 🔲
> El vendedor gestiona sus ventas.

- [ ] 8.1 — Dashboard de pedidos (API)
  - Listado con filtros (estado, fecha, monto)
  - Estadísticas: ventas hoy/semana/mes, ticket promedio, productos más vendidos
  - Exportar CSV
- [ ] 8.2 — Gestión de stock
  - Alertas stock bajo (configurable threshold)
  - Historial de movimientos de stock
  - Ajuste manual de stock
- [ ] 8.3 — Cupones (CRUD)
  - POST /coupons — crear cupón
  - GET /coupons — listar cupones
  - PUT /coupons/:id — actualizar
  - DELETE /coupons/:id — eliminar
  - POST /coupons/validate — validar cupón
  - Tipos: porcentaje, monto fijo
  - Límites: uso total, uso por cliente, monto mínimo, fechas

### FASE 9: Frontend Dashboard — Pedidos & Stock 🔲
> Páginas de gestión para el vendedor.

- [ ] 9.1 — Página `/pedidos` — Lista de órdenes con filtros y estados
- [ ] 9.2 — Página `/pedidos/[id]` — Detalle de orden con timeline y acciones
- [ ] 9.3 — Página `/stock` o integrado en `/catalogo` — Gestión de inventario
- [ ] 9.4 — Página `/cupones` — CRUD de cupones
- [ ] 9.5 — Widgets en Dashboard principal: ventas, stock bajo, pedidos pendientes

### FASE 10: Notificaciones & Emails 🔲
> Comunicación automática.

- [ ] 10.1 — Email al comprador: confirmación de orden
- [ ] 10.2 — Email al vendedor: nueva orden recibida
- [ ] 10.3 — Email al comprador: cambio de estado (enviado, entregado)
- [ ] 10.4 — WhatsApp al vendedor: nueva orden / consulta de producto
- [ ] 10.5 — Push notification: nueva orden, stock bajo
- [ ] 10.6 — Reminder: carritos abandonados (24hs) — email al comprador

### FASE 11: Funcionalidades Avanzadas 🔲
> Diferenciadores competitivos.

- [ ] 11.1 — Wishlist (favoritos) del cliente
- [ ] 11.2 — Reviews/reseñas de productos
- [ ] 11.3 — Productos destacados (featured) en portada
- [ ] 11.4 — Productos relacionados (misma categoría)
- [ ] 11.5 — Compartir producto (link directo, WhatsApp, redes)
- [ ] 11.6 — Historial de precios (para el vendedor)
- [ ] 11.7 — Productos digitales (descarga post-pago)
- [ ] 11.8 — Analytics: funnel de conversión, productos más vistos vs comprados

---

## Prioridad de Implementación

```
FASE 1 (Products CRUD)        ← EMPEZAMOS ACÁ
  ↓
FASE 2 (Branding)
  ↓
FASE 3 (Dashboard Productos)
  ↓
FASE 4 (Dashboard Branding)
  ↓
FASE 5 (Storefront Público)   ← MVP Modo Catálogo funcional
  ↓
FASE 6 (Cart & Checkout API)
  ↓
FASE 7 (Cart & Checkout UI)   ← MVP Modo Tienda funcional
  ↓
FASE 8 (Órdenes API)
  ↓
FASE 9 (Órdenes Dashboard)    ← Gestión completa
  ↓
FASE 10 (Notificaciones)
  ↓
FASE 11 (Avanzadas)           ← Diferenciación
```

## Estado Actual

**Última actualización:** 2026-03-18 (Fases 1-5 completadas)

| Fase | Estado | Notas |
|------|--------|-------|
| 1 - Products CRUD | ✅ COMPLETADO | Schema OK, módulo completo, API deployed |
| 2 - Branding | ✅ COMPLETADO | BrandingModule + public endpoint deployed |
| 3 - Dashboard Productos | ✅ COMPLETADO | Catálogo, nuevo/editar, categorías, API client, notificaciones |
| 4 - Dashboard Branding | ✅ COMPLETADO | /mi-tienda con colores, logos, tipografía, SEO, toggles, preview |
| 5 - Storefront Público | ✅ COMPLETADO | Catálogo público, detalle producto, SEO, branding dinámico |
| 6 - Cart & Checkout API | 🔲 Pendiente | |
| 7 - Cart & Checkout UI | 🔲 Pendiente | |
| 8 - Órdenes API | 🔲 Pendiente | |
| 9 - Órdenes Dashboard | 🔲 Pendiente | |
| 10 - Notificaciones | 🔲 Pendiente | |
| 11 - Avanzadas | 🔲 Pendiente | |
