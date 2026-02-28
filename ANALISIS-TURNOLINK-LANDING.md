# ANALISIS TECNICO Y ESTRATEGICO COMPLETO — TURNOLINK
## Documento de trabajo para redefinicion de landing page
### Fecha: 2026-02-23

---

# PARTE 1: ANALISIS TECNICO DEL SISTEMA

---

## 1. ARQUITECTURA GENERAL

| Componente | Tecnologia | Detalle |
|------------|-----------|---------|
| **Backend** | NestJS 10.3 (Node.js) | API RESTful con 21 modulos, 80+ endpoints |
| **Frontend** | Next.js 14.1.0 (App Router) | SSR, standalone mode, responsive |
| **Base de datos** | PostgreSQL + Prisma ORM | 44 modelos, relaciones complejas |
| **Pagos** | Mercado Pago OAuth 2.0 | Sandbox + produccion, webhooks |
| **Autenticacion** | JWT + Refresh Tokens + 2FA TOTP | Multi-tenant con aislamiento total |
| **Notificaciones** | Email (Resend) + Web Push + WhatsApp | Event-driven, desacoplado |
| **Encriptacion** | AES-256-GCM | Credenciales de pago cifradas |
| **Deployment** | PM2 + standalone build | API (3001) + Web (3000) |
| **Seguridad** | Helmet, CORS, Rate Limiting, RBAC | 3 niveles de throttling |

---

## 2. MODELOS DE BASE DE DATOS (44 modelos)

### Modelos Core de Negocio
- **Tenant** — Entidad raiz multi-tenant (slug unico, settings JSON, branding)
- **User** — Usuarios con roles (OWNER, STAFF, SUPER_ADMIN, PROFESSIONAL)
- **Branch** — Sucursales con horarios, servicios y empleados independientes
- **Employee** — Personal con especialidades, bio, imagen, asignacion a sucursales
- **Service** — Catalogo con precio, duracion, variaciones, imagenes, categorias
- **ServiceCategory** — Organizacion de servicios por categorias
- **Booking** — Reservas (por hora Y por dia) con depositos
- **Customer** — Base de clientes con historial y estadisticas
- **Schedule** — Horarios semanales (por tenant y por sucursal)
- **BlockedDate** — Fechas bloqueadas (feriados, vacaciones)

### Modelos de Pago
- **DepositPayment** — Pagos de sena con preferenceId, paymentId, estado, montos
- **MercadoPagoCredential** — Tokens OAuth cifrados con AES-256-GCM
- **Payment** — Pagos de e-commerce
- **SubscriptionPayment** — Pagos recurrentes de suscripcion

### Modelos de Suscripcion SaaS
- **SubscriptionPlan** — Planes con limites (sucursales, empleados, servicios, reservas/mes)
- **Subscription** — Estado de suscripcion (TRIALING, ACTIVE, PAST_DUE, CANCELLED)

### Modelos de Perfiles Profesionales
- **ProfessionalProfile** — Perfiles con categoria, skills, certificaciones, disponibilidad
- **ProfessionalExperience** — Historial laboral
- **TalentProposal** — Propuestas de trabajo (PENDING, ACCEPTED, REJECTED, EXPIRED)

### Modelos de E-Commerce
- **Product, ProductCategory, ProductImage, ProductVariant**
- **Cart, CartItem, Order, OrderItem, OrderStatusHistory**
- **Coupon, CouponUsage, WishlistItem**

### Modelos de Branding y Personalizacion
- **TenantBranding** — Colores, tipografia, imagenes, estilos, SEO, configuracion de tienda

### Modelos de Seguridad y Auditoria
- **TotpSecret** — 2FA con codigos de respaldo
- **AuditLog** — Registro de auditoria (INFO, WARNING, CRITICAL)
- **SecurityAlert** — Alertas de seguridad (logins fallidos, actividad sospechosa)
- **AdminSession, AdminRateLimit** — Gestion de sesiones admin

### Modelos de Notificaciones
- **Notification** — Notificaciones genericas (tipo, canal, destinatario, estado)
- **PushSubscription** — Suscripciones web push

---

## 3. CONFIGURACIONES DISPONIBLES DEL SISTEMA

### 3.1 Reservas por Hora (bookingMode: "HOURLY")
- Calendario con seleccion de fecha
- Slots de tiempo agrupados por periodo (Manana/Tarde/Noche)
- `minAdvanceBookingHours` — Horas minimas de anticipacion (1-24)
- `maxAdvanceBookingDays` — Dias maximos de anticipacion (7-365)
- `bookingBuffer` — Minutos de descanso entre reservas (0-60)
- `smartTimeSlots` — Generacion inteligente de slots cada 15/30 min
- Soporte para horarios que cruzan medianoche (negocios 24h)

### 3.2 Reservas por Dia (bookingMode: "DAILY")
- Calendario de rango con check-in y check-out
- `dailyCheckInTime` — Hora de ingreso (ej: "14:00")
- `dailyCheckOutTime` — Hora de salida (ej: "10:00")
- `dailyMinNights` — Minimo de noches (1+)
- `dailyMaxNights` — Maximo de noches (1-365)
- `dailyClosedDays` — Dias sin check-in permitido (0=Dom, 6=Sab)
- Calculo automatico: totalPrice = precioNoche x noches
- Visualizacion de disponibilidad por dia (verde/rojo/gris)

### 3.3 Reservas 24/7
- El sistema permite configurar horarios que cubren las 24 horas
- Slots que cruzan medianoche son soportados nativamente
- El cliente puede reservar desde cualquier dispositivo, a cualquier hora
- Sin necesidad de personal atendiendo — autoservicio total

### 3.4 Check-in / Check-out
- Configurable por tenant (dailyCheckInTime, dailyCheckOutTime)
- Validacion automatica de fechas (checkout > checkin)
- Calculo automatico de noches y precio total
- Verificacion de disponibilidad para todo el rango de estadia
- Dias cerrados bloqueados automaticamente

### 3.5 Cobro de Senas (Depositos)
- `requireDeposit` — Activar/desactivar cobro de sena
- `depositPercentage` — Porcentaje del total (1-100%)
- `depositMode` — "simulated" (testing) o "mercadopago" (produccion)
- Integracion Mercado Pago OAuth 2.0 con sandbox y produccion
- Webhook automatico para confirmar pagos
- Preferencia de pago con expiracion de 24 horas
- Referencia externa unica por reserva
- Estados: PENDING → APPROVED/REJECTED/CANCELLED/EXPIRED
- Confirmacion automatica de reserva al aprobar pago

### 3.6 Autogestion Interna
- Dashboard completo para crear reservas manualmente
- Las reservas desde dashboard saltan validaciones de tiempo minimo
- CRUD completo de servicios, empleados, sucursales, clientes
- Gestion de horarios semanales con toggle por dia
- Bloqueo de fechas especificas (feriados, vacaciones)
- Asignacion de empleados a servicios y sucursales
- Vista semanal y mensual de turnos con estadisticas

### 3.7 Configuracion de Disponibilidad
- **Nivel tenant**: Horarios semanales (7 dias, start/end, activo/inactivo)
- **Nivel sucursal**: Horarios independientes por sucursal
- **Fechas bloqueadas**: Por tenant y por sucursal (con razon opcional)
- **Buffer entre turnos**: Configurable en minutos
- **Anticipacion**: Minima en horas, maxima en dias
- **Validacion en tiempo real**: Previene overbooking con deteccion de solapamiento

### 3.8 Multi-Sucursal
- Sucursales con slug, direccion, telefono, email independientes
- Horarios propios por sucursal
- Servicios asignables por sucursal (con override de precio)
- Empleados asignables por sucursal
- Fechas bloqueadas independientes
- Selector de sucursal en flujo de reserva publica

### 3.9 Personalizacion Visual (Branding)
- Colores: primario, secundario, acento, fondo, texto
- Tipografia: fuente principal y de encabezados
- Imagenes: logo, cover, favicon, banner
- Estilos: minimal, modern, elegant, fresh, vibrant
- Modo oscuro configurable
- Hero personalizable

### 3.10 Variaciones de Servicios
- Grupos de opciones (seleccion unica o multiple)
- Modificadores de precio (absoluto o porcentual)
- Modificadores de duracion (en minutos)
- Galeria de imagenes por servicio

### 3.11 Sistema de Suscripciones SaaS
- 3 planes: Gratis / Profesional / Negocio
- Limites configurables: sucursales, empleados, servicios, clientes, reservas/mes
- Features flags por plan (whatsapp, mercadopago, reports)
- Trial de 14 dias
- Billing mensual y anual

### 3.12 Reportes y Metricas Profesionales
- **Dashboard con estadisticas en tiempo real**:
  - Total de reservas (semanal/mensual)
  - Reservas pendientes, confirmadas, completadas
  - Tasa de no-show (ausencias)
  - Tasa de cancelacion
- **Metricas de clientes**:
  - Total de clientes
  - Historial de reservas por cliente
  - Ultima visita
  - Frecuencia de reservas
- **Metricas de servicios**:
  - Servicios mas reservados
  - Ingresos por servicio
  - Duracion promedio
- **Metricas de empleados**:
  - Ocupacion por empleado
  - Reservas asignadas
- **Metricas de ingresos**:
  - Senas cobradas
  - Estado de pagos (aprobados, pendientes, rechazados)
  - Ingresos por periodo
- **Audit logs**:
  - Registro completo de acciones (INFO, WARNING, CRITICAL)
  - Alertas de seguridad automaticas
  - Tracking de sesiones admin
- **Exportacion de datos**:
  - Base de clientes
  - Historial de reservas
  - Registro de pagos

### 3.13 Notificaciones Multicanal
- **Email**: Confirmacion de reserva, cancelacion, recordatorio (via Resend)
- **Push**: Notificaciones web push (nueva reserva, cancelacion, recordatorio)
- **WhatsApp**: Links directos para chat y confirmacion
- **Arquitectura event-driven**: Desacoplado del flujo principal

### 3.14 Seguridad Avanzada
- JWT con refresh tokens
- 2FA/TOTP obligatorio para operaciones sensibles (cobros)
- Cifrado AES-256-GCM para credenciales de pago
- Rate limiting en 3 niveles
- Helmet con CSP directives
- CORS configurable
- Aislamiento total multi-tenant

### 3.15 Sistema de Resenas y Reputacion
- Calificacion y feedback de clientes
- Promedio de calificacion visible en pagina publica
- Gestion de resenas desde dashboard

---

## 4. FLUJO COMPLETO DE RESERVA (FRONTEND)

### Flujo del Cliente (Pagina Publica)

```
PASO 1: SELECCION DE SUCURSAL (si aplica)
├── Multiples sucursales → Carrusel de ubicaciones
└── Sucursal unica → Auto-seleccion

PASO 2: SELECCION DE SERVICIO
├── Grid/lista de servicios disponibles
├── Nombre, descripcion, precio, duracion
├── Galeria de imagenes
├── Variaciones (opciones con modificadores de precio/duracion)
└── Click → siguiente paso

PASO 3: FECHA Y HORA
├── MODO HORARIO:
│   ├── Calendario: seleccion de fecha
│   ├── Fetch de disponibilidad en tiempo real
│   ├── Slots agrupados: Manana / Tarde / Noche
│   └── Seleccion de horario disponible
│
└── MODO DIARIO:
    ├── Calendario de rango: check-in → check-out
    ├── Fetch de disponibilidad diaria
    ├── Visualizacion verde/rojo por dia
    └── Calculo automatico: noches x precio

PASO 4: DATOS DEL CLIENTE
├── Nombre (requerido)
├── Telefono (requerido)
├── Email (configurable: requerido u opcional)
├── Notas (opcional, max 500 chars)
└── Validacion con react-hook-form + zod

PASO 5: PAGO DE SENA (si esta configurado)
├── Calculo automatico del deposito
├── MODO MERCADO PAGO:
│   ├── Creacion de preferencia de pago
│   ├── Redireccion a checkout de Mercado Pago
│   ├── Expiracion de 24 horas
│   └── Retorno con estado (success/failure/pending)
│
└── MODO SIMULADO (testing):
    └── Confirmacion automatica

PASO 6: CONFIRMACION
├── Reserva creada con estado PENDING
├── Si sena aprobada → CONFIRMED automaticamente
├── Detalle completo: fecha, hora, servicio, precio
└── Notificacion al negocio (email + push)
```

### Flujo del Negocio (Dashboard)

```
GESTION DE TURNOS:
├── Vista semanal: grilla 7 columnas (Lun-Dom)
├── Vista mensual: calendario con indicadores
├── Estadisticas: total, pendientes, confirmados, completados
├── Acciones por estado:
│   ├── PENDING → Confirmar + WhatsApp / Cancelar
│   ├── CONFIRMED → WhatsApp / Completar / Marcar No-Show
│   └── Links directos: WhatsApp chat, llamada telefonica
└── Colores: Amber(pending), Blue(confirmed), Green(completed), Red(cancelled)

MAQUINA DE ESTADOS:
PENDING → CONFIRMED (sena pagada o manual)
CONFIRMED → COMPLETED (servicio entregado)
PENDING/CONFIRMED → CANCELLED (cancelacion)
CONFIRMED → NO_SHOW (ausencia)
```

---

## 5. DIFERENCIALES TECNICOS REALES vs. UN SIMPLE "TURNERO"

| Caracteristica | Turnero basico | TurnoLink |
|---------------|---------------|-----------|
| Reservas | Solo por hora | Por hora Y por dia (alojamiento) |
| Sucursales | Una sola | Multi-sucursal con config independiente |
| Pagos | No tiene | Mercado Pago OAuth + senas automaticas |
| Seguridad pagos | N/A | AES-256-GCM + 2FA obligatorio |
| Disponibilidad | Horario fijo | Motor configurable: buffer, anticipacion, 24/7 |
| Variaciones | No tiene | Modificadores de precio y duracion |
| Multi-tenant | No tiene | Aislamiento total por tenant |
| Notificaciones | Email basico | Email + Push + WhatsApp (event-driven) |
| Branding | Generico | Colores, tipografia, logo, estilos personalizables |
| Empleados | No tiene | Asignacion a servicios y sucursales |
| Clientes | No tiene | Base de datos con historial y estadisticas |
| Reportes | No tiene | Metricas profesionales, auditoria, alertas |
| SaaS | No aplica | Planes, limites, billing, trial |
| 2FA | No tiene | TOTP con codigos de respaldo |
| API publica | No tiene | Endpoints publicos para integracion |
| Resenas | No tiene | Sistema de calificacion y feedback |
| E-Commerce | No tiene | Productos, carrito, ordenes, cupones |
| Profesionales | No tiene | Marketplace de talento con propuestas |
| Internacionalizacion | No tiene | Espanol, ingles, portugues |
| Modo oscuro | No tiene | Configurable por tenant |

---

# PARTE 2: ANALISIS DE LA LANDING ACTUAL

---

## 6. ESTADO ACTUAL DE LA LANDING

### Estructura actual:
1. **Header** — Logo, navegacion, CTAs, selector de idioma
2. **Hero** — Titulo, subtitulo, dual CTA, mockups de producto
3. **Problema-Solucion** — Dolores vs soluciones (animado)
4. **Features** — 6 caracteristicas (carrusel mobile, grid desktop)
5. **Journey Mobile** — 7 pasos del flujo de reserva
6. **Testimonios** — 3 citas de clientes
7. **Pricing** — 3 planes (Gratis/Profesional/Negocio)
8. **FAQ** — 7 preguntas frecuentes
9. **CTA Final** — Banner de cierre
10. **Footer** — Links, legal, idioma, WhatsApp flotante

### Mensajes actuales:

**Titulo Hero:**
> "Tu agenda llena, sin contestar el telefono"

**Subtitulo:**
> "Sistema de reservas online para barberias, spas y consultorios. Tus clientes reservan 24/7, tu te enfocas en atenderlos."

**CTAs:**
- Primario: "Comienza gratis ahora"
- Secundario: "Ver tienda de ejemplo"

### Metadata SEO actual:
```
title: 'TurnoLink - Sistema de Turnos Online'
description: 'Reserva turnos online de forma rapida y sencilla'
keywords: ['turnos', 'reservas', 'barberia', 'spa', 'citas', 'turnolink']
```

---

## 7. DIAGNOSTICO: QUE ESTA LIMITANDO EL POSICIONAMIENTO

### 7.1 Enfoque demasiado estrecho en industria
- **"barberias, spas y consultorios"** — Solo 3 industrias mencionadas
- Crea percepcion de "no es para mi" en otros rubros
- Limita el mercado total direccionable (TAM)
- Excluye: fitness, coaching, fotografia, salones, consultorias, alquileres, espacios

### 7.2 Beneficio operativo en vez de transformacional
- Mensaje principal: "no contestar el telefono" = dolor operativo chico
- Falta: impacto en ingresos, crecimiento, escala, competitividad
- No transmite la robustez real del sistema
- No diferencia de un Google Calendar compartido

### 7.3 No comunica el motor de configuracion
- El sistema tiene un motor configurable potente (hora/dia/buffer/24h/senas)
- La landing no menciona la flexibilidad del sistema
- No muestra que sirve para modelos de negocio diferentes

### 7.4 No comunica el cobro de senas
- Uno de los diferenciales mas fuertes (Mercado Pago integrado)
- Reduce no-shows dramaticamente
- Genera ingreso anticipado
- Solo aparece mencionado tangencialmente

### 7.5 No comunica reportes y metricas
- El sistema tiene metricas profesionales, auditoria, alertas
- La landing no menciona control de datos ni inteligencia de negocio

### 7.6 SEO debil
- Keywords genericas y solo en espanol
- Meta description pasiva ("reserva turnos...")
- Sin long-tail keywords
- Sin CTAs en meta description

---

## 8. QUE DEBE ELIMINARSE

- "barberias, spas y consultorios" como foco principal
- "sin contestar el telefono" como mensaje primario (puede ser secundario)
- Cualquier referencia que limite a estetica o belleza como unico vertical
- Testimonios que solo mencionen un rubro especifico (si los hay)
- Lenguaje que suene a "turnero simple"

## 9. QUE PUEDE REUTILIZARSE

- **Componentes tecnicos**: Todo el sistema de componentes (botones, cards, modales, carruseles)
- **Patron problema-solucion**: La animacion rojo→verde es efectiva
- **Journey visualization**: Los 7 pasos del flujo mobile
- **Estructura de pricing**: 3 tiers con diferenciacion clara
- **FAQ accordion**: Formato funcional
- **Trust signals**: "Sin tarjeta", "5 minutos", "Soporte en espanol"
- **Hero mockups**: Carrusel de capturas del producto real
- **Responsive design**: Mobile-first, breakpoints, touch-friendly
- **WhatsApp flotante**: CTA de contacto directo
- **Footer completo**: Links, legal, idioma
- **Internacionalizacion**: Estructura i18n existente (es/en/pt)

---

# PARTE 3: NUEVA VISION Y POSICIONAMIENTO

---

## 10. REDEFINICION DEL PRODUCTO

### Vision anterior:
> "Sistema de turnos online para barberias, spas y consultorios"

### Nueva vision:
> **TurnoLink es una plataforma de digitalizacion para negocios fisicos que venden tiempo o espacio y necesitan gestionar disponibilidad y cobros en tiempo real.**

### Posicionamiento estrategico:
- NO es un "turnero" — es un **motor de disponibilidad configurable**
- NO es "para todos" — es **especialista en negocios que gestionan disponibilidad**
- NO es solo agenda — es **automatizacion de reservas + cobros + control**
- NO compite con Google Calendar — compite con **la gestion manual que frena el crecimiento**

---

## 11. CLAIM PRINCIPAL (Una linea)

### Version principal:
> **"Automatiza tu disponibilidad. Cobra antes de atender."**

### Alternativas:
- "Tu negocio abierto 24/7. Reservas y cobros en automatico."
- "Gestion de disponibilidad inteligente. Cobros automaticos. Control total."
- "Digitaliza tu negocio. Reservas, cobros y control en una sola plataforma."

---

## 12. SUBTITULO ESTRATEGICO

### Version corta:
> "Plataforma de reservas y cobros automaticos para negocios que venden tiempo o espacio."

### Version extendida:
> "TurnoLink digitaliza la gestion de disponibilidad de tu negocio. Tus clientes reservan y pagan online, 24/7, sin que vos levantes el telefono. Motor configurable para turnos por hora, estadias por dia, cobro de senas y control total desde el celular."

---

## 13. ESTRUCTURA PROPUESTA PARA LA NUEVA LANDING

---

### SECCION 1: HERO — Impacto inmediato

**Titulo:**
> "Automatiza tu disponibilidad. Cobra antes de atender."

**Subtitulo:**
> "Plataforma de reservas y cobros automaticos para negocios que venden tiempo o espacio. Tus clientes reservan y pagan online, 24/7, sin WhatsApp, sin llamadas, sin ausencias."

**CTA Primario:**
> "Empezar gratis ahora" → /register

**CTA Secundario:**
> "Ver demo en vivo" → /demo-slug

**Elementos visuales:**
- Mockup del dashboard con metricas reales
- Mockup del flujo de reserva mobile
- Badge: "Configuracion en 5 minutos"

---

### SECCION 2: PROBLEMA — El dolor real de los negocios tradicionales

**Titulo de seccion:**
> "Tu negocio pierde plata mientras vos contestas WhatsApp"

**Problemas presentados:**

| Icono | Dolor | Impacto |
|-------|-------|---------|
| WhatsApp | "Pasas horas contestando mensajes para agendar turnos" | Tiempo perdido que podrias usar para atender o crecer |
| Telefono | "Perdiste reservas porque no pudiste atender el telefono" | Ingresos que se van a la competencia |
| Ausencias | "Clientes que reservan y no aparecen, sin consecuencia" | Horarios vacios que ya no podes vender |
| Agenda | "Gestion manual con papel, Excel o Google Calendar" | Errores, solapamientos, descontrol |
| Dinero | "No cobras nada hasta que el cliente llega (si llega)" | Flujo de caja impredecible |
| Escala | "Si creces, necesitas mas gente solo para gestionar agenda" | Crecimiento limitado por procesos manuales |

**Cierre de seccion:**
> "Si tu negocio depende de disponibilidad, necesitas un sistema que trabaje por vos."

---

### SECCION 3: SOLUCION — Que hace TurnoLink

**Titulo de seccion:**
> "Una plataforma que gestiona, cobra y controla por vos"

**Pilares de solucion:**

#### 1. Reservas automaticas 24/7
- Tus clientes eligen servicio, dia y hora desde su celular
- Sin necesidad de descargar apps — funciona desde el navegador
- Disponibilidad en tiempo real — nunca mas solapamientos
- Funciona mientras dormis, atendes o descansas

#### 2. Cobro de senas automatico
- Integrado con Mercado Pago (cobro real, no simulado)
- Configurable: elegis que porcentaje cobrar
- Reduce ausencias drasticamente — el cliente pago, el cliente viene
- Confirma la reserva automaticamente al aprobar el pago
- Notificacion inmediata al negocio

#### 3. Motor de disponibilidad configurable
- **Por hora**: Turnos de 30min, 1h, o duracion personalizada
- **Por dia**: Check-in/check-out con minimo y maximo de noches
- **Buffer entre turnos**: Tiempo de preparacion configurable
- **Anticipacion**: Controla cuanto antes y hasta cuando pueden reservar
- **Dias bloqueados**: Feriados, vacaciones, mantenimiento
- **Horarios por sucursal**: Cada ubicacion con su propia configuracion

#### 4. Control total desde el dashboard
- Vista semanal y mensual de todas las reservas
- Estadisticas en tiempo real (pendientes, confirmadas, completadas)
- Base de clientes con historial completo
- Gestion de empleados asignados a servicios
- Confirmacion y cancelacion con un click
- WhatsApp directo desde cada reserva

---

### SECCION 4: DIFERENCIADORES — Por que TurnoLink no es un "turnero"

**Titulo de seccion:**
> "Esto no es una agenda online. Es la infraestructura digital de tu negocio."

**Diferenciadores:**

| Diferenciador | Detalle |
|--------------|---------|
| **Motor configurable** | No es una solucion rigida. Configuracion de hora, dia, buffer, anticipacion, senas — todo adaptable a tu modelo de negocio |
| **Cobro real integrado** | Mercado Pago con OAuth, 2FA, cifrado AES-256. No es un link de pago: es un flujo automatico con webhook y confirmacion instantanea |
| **Multi-sucursal** | Cada sucursal con sus horarios, servicios, empleados y disponibilidad. Una sola cuenta, multiples ubicaciones |
| **Disponibilidad 24/7** | Tu negocio recibe reservas y cobros las 24 horas, los 7 dias, sin personal atendiendo |
| **Reportes profesionales** | Metricas de reservas, ingresos, ocupacion, no-shows, clientes frecuentes. Datos reales para tomar decisiones de negocio |
| **Personalizacion completa** | Tu pagina de reservas con tu logo, tus colores, tu estilo. 5 estilos visuales, modo oscuro, galeria de imagenes |
| **Notificaciones inteligentes** | Email + Push + WhatsApp. Automaticas al crear, confirmar o cancelar. El negocio siempre enterado |
| **Seguridad de nivel empresarial** | JWT, 2FA/TOTP, cifrado AES-256-GCM, rate limiting, aislamiento multi-tenant, audit logs |

---

### SECCION 5: CASOS DE USO — Sin sonar generalista

**Titulo de seccion:**
> "Para negocios que venden tiempo, espacio o disponibilidad"

**Enfoque: 3 categorias conceptuales, no lista de rubros**

#### Negocios que venden tiempo
> "Si tu ingreso depende de que alguien ocupe un horario, TurnoLink gestiona esa disponibilidad por vos."
- Turnos por hora con duracion personalizada
- Asignacion de profesionales a servicios
- Buffer entre turnos para preparacion
- Cobro de sena para asegurar asistencia

#### Negocios que venden espacio
> "Si alquilas un espacio por horas o dias, TurnoLink controla la ocupacion y cobra automaticamente."
- Reservas por dia con check-in/check-out
- Minimo y maximo de noches configurable
- Disponibilidad visual por calendario
- Cobro anticipado via Mercado Pago

#### Negocios que trabajan por disponibilidad
> "Si tu operacion depende de gestionar cuando estas disponible y cuando no, TurnoLink es tu sistema operativo."
- Horarios configurables por dia de la semana
- Fechas bloqueadas (feriados, vacaciones)
- Multi-sucursal con config independiente
- Reportes de ocupacion y rendimiento

**Nota importante:** No listar rubros especificos. El concepto "vender tiempo/espacio/disponibilidad" cubre barberias, consultorios, canchas, estudios, alojamientos, espacios de coworking, etc. sin nombrarlos.

---

### SECCION 6: CONFIANZA — Seguridad, cobros, control y datos

**Titulo de seccion:**
> "Tu negocio, tus datos, tu control"

**Pilares de confianza:**

#### Seguridad
- Cifrado AES-256-GCM para credenciales de pago
- Autenticacion 2FA/TOTP para operaciones sensibles
- Aislamiento total de datos entre negocios
- Rate limiting y proteccion contra ataques
- Audit logs con trazabilidad completa

#### Cobros
- Integracion oficial con Mercado Pago
- OAuth 2.0 — vos conectas TU cuenta, tus cobros van a TU cuenta
- Sandbox para probar sin riesgo, produccion cuando estes listo
- Webhook automatico — confirmacion instantanea
- Historial completo de pagos y estados

#### Control
- Dashboard en tiempo real desde cualquier dispositivo
- Estadisticas de reservas, ingresos, ocupacion
- Gestion de empleados, servicios, sucursales
- Confirmacion/cancelacion con un click
- WhatsApp directo con cada cliente

#### Datos y Reportes
- Base de clientes con historial completo de reservas
- Metricas de rendimiento por servicio, empleado, sucursal
- Registro de auditoria con niveles de severidad
- Alertas automaticas de seguridad
- Exportacion de datos para analisis externo
- Tracking de no-shows y cancelaciones
- Metricas de ingresos y cobros por periodo

---

### SECCION 7: CTA FINAL — Cierre con autoridad

**Titulo:**
> "Tu negocio ya deberia estar cobrando mientras duerme"

**Subtitulo:**
> "Configuracion en 5 minutos. Sin tarjeta de credito. Soporte en espanol."

**CTA Primario:**
> "Empezar gratis ahora"

**CTA Secundario:**
> "Hablar con el equipo" → WhatsApp

**Trust badges:**
- "14 dias de prueba gratuita"
- "Sin compromiso — cancela cuando quieras"
- "Tus cobros van directo a tu cuenta de Mercado Pago"

---

## 14. PROPUESTA SEO

### Meta Title:
> "TurnoLink — Reservas y Cobros Automaticos para tu Negocio | Gestion de Disponibilidad 24/7"

### Meta Description:
> "Digitaliza tu negocio con TurnoLink. Sistema de reservas online con cobro de senas automatico via Mercado Pago. Gestion de disponibilidad por hora o dia, multi-sucursal, reportes profesionales. Empieza gratis."

### Palabras clave principales:
- sistema de reservas online
- gestion de turnos automatica
- cobro de senas automatico
- reservas con Mercado Pago
- sistema de turnos para negocios
- plataforma de reservas 24/7
- software de gestion de disponibilidad
- turnos online con cobro anticipado

### Palabras clave long-tail:
- sistema de reservas online con cobro de sena
- plataforma de turnos con Mercado Pago integrado
- software de gestion de disponibilidad para negocios
- sistema de reservas por hora y por dia
- turnos online con confirmacion automatica
- gestion de turnos multi-sucursal
- cobro automatico de senas por reserva
- sistema de agenda online para negocios de servicios

### Estructura de URLs sugerida:
```
/ — Landing principal
/funcionalidades — Detalle de features
/precios — Planes y pricing
/casos-de-uso — Casos de uso por tipo de negocio
/demo — Demo interactiva
/blog — Contenido SEO (futuro)
```

---

## 15. MEJORAS VISUALES Y ESTRUCTURALES IMPLEMENTABLES CON EL STACK ACTUAL

### Implementables con Next.js + Tailwind + componentes existentes:

#### 1. Hero Section renovada
- Reemplazar titulo y subtitulo (solo texto, componente existente)
- Agregar badge animado con claim ("Cobros automaticos 24/7")
- Mantener mockup carousel pero actualizar capturas

#### 2. Seccion Problema mejorada
- Reutilizar componente `problem-solution-section.tsx`
- Expandir de 3-4 problemas a 6 problemas (grid 2x3 o 3x2)
- Mantener animacion rojo→verde

#### 3. Seccion Solucion nueva
- Crear componente con 4 pilares (grid 2x2)
- Iconos de Lucide (ya disponibles en el proyecto)
- Animacion scroll-reveal (ya implementada)

#### 4. Seccion Diferenciadores
- Grid de 4 cards con icono + titulo + descripcion
- Reutilizar pattern de feature cards existente
- Highlight en "cobro de senas" y "motor configurable"

#### 5. Seccion Casos de Uso
- 3 tabs o cards horizontales
- Sin nombrar rubros — conceptos: tiempo / espacio / disponibilidad
- Icono abstracto por cada concepto

#### 6. Seccion Confianza
- 4 columnas: Seguridad / Cobros / Control / Datos
- Iconos + lista de bullets
- Background diferenciado (gradiente oscuro)

#### 7. CTA Final mejorado
- Banner full-width con gradiente
- Titulo fuerte + subtitulo + dual CTA
- Trust badges debajo de los CTAs

#### 8. Mejoras tecnicas
- Actualizar metadata SEO en `layout.tsx`
- Agregar structured data (JSON-LD) para SaaS
- Optimizar imagenes con `next/image` (ya en uso)
- Mejorar Core Web Vitals con lazy loading de secciones pesadas
- Agregar og:image personalizado para social sharing

#### 9. Mejoras de conversion
- Agregar social proof numerico (si hay datos reales)
- Agregar video demo corto (embebido YouTube/Vimeo)
- Agregar comparativa visual "Antes vs Despues"
- Sticky CTA en mobile (barra inferior fija)

#### 10. Internacionalizacion
- Migrar textos hardcodeados de landing a sistema i18n existente
- Completar traducciones en en.json y pt.json

---

## 16. RESUMEN EJECUTIVO

### El sistema TurnoLink es SIGNIFICATIVAMENTE mas robusto de lo que la landing actual comunica:

| Lo que la landing dice | Lo que el sistema realmente hace |
|----------------------|-------------------------------|
| "Turnos para barberias" | Motor configurable de disponibilidad para cualquier negocio |
| "Reserva online" | Reservas por hora Y por dia con check-in/check-out |
| "Sin contestar el telefono" | Automatizacion 24/7 con cobros, confirmaciones y notificaciones |
| (No lo menciona) | Cobro de senas automatico con Mercado Pago |
| (No lo menciona) | Multi-sucursal con configuracion independiente |
| (No lo menciona) | Reportes y metricas profesionales |
| (No lo menciona) | Seguridad de nivel empresarial (2FA, cifrado, audit logs) |
| (No lo menciona) | Variaciones de servicios con modificadores de precio |
| (No lo menciona) | Marketplace de talento profesional |
| (No lo menciona) | E-commerce integrado |

### La landing actual vende el 20% de lo que el producto realmente ofrece.

### La nueva landing debe comunicar que TurnoLink es la infraestructura digital completa para negocios que gestionan disponibilidad — no un simple turnero.

---

*Documento generado el 2026-02-23 como base para la redefinicion estrategica de TurnoLink.*
*Siguiente paso: Validar estructura propuesta antes de generar codigo.*
