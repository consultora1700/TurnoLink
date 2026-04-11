/**
 * TurnoLink — Prompt TXT Generator v3.0
 * With EXACT menu icons, floating promo badges, and all screens
 */
const { generateImagePrompt } = require('./prompt-generator');
const fs = require('fs');

// ─── EXACT SIDEBAR MENU (from sidebar.tsx) ───
// These are the real Lucide icon names used in the codebase

const SIDEBAR_DESCRIPTION = `Left sidebar (w-64) with white/light background and subtle right border. At top: TurnoLink logo (teal colored, h-16). Below logo, collapsible navigation sections with small chevron arrows:

SECTION "General":
  - "Dashboard" with LayoutDashboard icon
  - "Reportes" with BarChart3 icon

SECTION "Turnos" (expanded):
  - "Autogestion" with CalendarCheck icon
  - "Turnos" with Calendar icon
  - "Servicios" with Scissors icon
  - "Empleados" with UserCog icon
  - "Especialidades" with GraduationCap icon
  - "Formularios" with ClipboardList icon
  - "Sucursales" with Building2 icon
  - "Clientes" with Users icon
  - "Horarios" with Clock icon

SECTION "Configuracion":
  - "General" with Settings icon
  - "Pagos" with CreditCard icon
  - "Videollamadas" with Video icon
  - "Seguridad" with Shield icon

SECTION "Cuenta":
  - "Mi Suscripcion" with Crown icon
  - "Verificar Email" with Mail icon
  - "Resenas" with Star icon
  - "Desarrolladores" with Code2 icon

BOTTOM:
  - "Ver mi pagina" with ExternalLink icon
  - "Ayuda" with HelpCircle icon

Active item: teal background (#3F8697) with white text and shadow-sm. Inactive items: muted grey text, hover:bg-muted. All icons are thin Lucide line-style, h-4 w-4. Section titles: text-[11px] uppercase tracking-wider muted color.`;

const MOBILE_NAV_DESCRIPTION = `Bottom fixed navigation bar (h-16) with 5 items in a row:
  1. "Inicio" with Home icon
  2. "Turnos" with Calendar icon
  3. "Servicios" with Scissors icon
  4. "Clientes" with Users icon
  5. "Menu" with Menu (hamburger) icon
Active item: teal (#3F8697) text + bg-primary/10 circle behind icon. Inactive: muted grey. Icons h-5 w-5, labels text-[10px] below each icon.`;

const EMPLOYEE_SIDEBAR_DESCRIPTION = `Left sidebar with TurnoLink logo at top. Navigation sections:

SECTION "Mi Portal":
  - "Mi Agenda" with CalendarDays icon
  - "Mi Disponibilidad" with Clock icon
  - "Mi Perfil" with UserCircle icon
  - "Mis Clientes" with Users icon

SECTION "Gestion" (only for OWNER/MANAGER):
  - "Mi Equipo" with UsersRound icon
  - "Auditoria" with FileText icon

Same styling: active=teal bg with white text, Lucide line icons h-4 w-4.`;

const EMPLOYEE_MOBILE_NAV = `Bottom navigation bar (h-16) with 5 items:
  1. "Agenda" with CalendarDays icon
  2. "Horarios" with Clock icon
  3. "Perfil" with UserCircle icon
  4. "Clientes" with Users icon
  5. "Menu" with Menu icon`;

// ─── FLOATING PROMO BADGES (from landing pages) ───

const FLOATING_BADGES = `Floating promotional glass badges around the device mockups (dark glass style: bg-black/90 backdrop-blur-xl, border white/10, rounded-xl, shadow-xl, subtle floating animation):

TOP-LEFT BADGE: green TrendingUp icon (h-4.5) + bold white text "-80% ausencias" + small muted text "Con cobro de senas"

TOP-RIGHT BADGE: filled yellow Star icon (h-4.5) inside yellow/20 circular bg + bold white text "4.8 Resenas" + small muted text "Verificadas por clientes"

BOTTOM-RIGHT BADGE: small review card with 5 tiny filled yellow stars in a row + quoted text in white/60 italic "Excelente servicio, reservo siempre desde aca" + tiny name "Sofia M. - Clienta verificada" in white/30

OPTIONAL BOTTOM-LEFT BADGE: teal Zap icon + bold white text "+500 negocios" + muted text "Usan TurnoLink"`;

const TRUST_BADGES = `Below the hero section, three small trust badges in a horizontal row with subtle grey text and matching icons:
  - Zap icon + "Confirmacion Inmediata"
  - Shield icon + "100% Seguro"
  - Heart icon + "Reserva tu turno"`;

const METRICS_STRIP = `Scrolling metrics strip with large bold numbers and subtle labels:
  "-80%" in pink accent + "Menos ausencias"
  "+500" + "Negocios activos"
  "+25K" + "Reservas gestionadas"
  "+35%" in pink accent + "Ticket promedio"`;

// ─── HEADER BAR DESCRIPTION ───

const HEADER_DESCRIPTION = `Top header bar: sticky, semi-transparent background (white/80) with backdrop-blur-md, subtle bottom border. Right side: notification Bell icon with small teal animated pulse badge showing unread count, Sun/Moon theme toggle button, user Avatar circle (h-10 w-10, teal/10 background with User icon in teal).`;

// ─── SCREEN DESCRIPTIONS ───

const screens = {

  dashboard_full: {
    label: 'DASHBOARD PRINCIPAL — Vista completa del negocio',
    description: `MacBook-style silver laptop showing TurnoLink SaaS dashboard.

${SIDEBAR_DESCRIPTION}

${HEADER_DESCRIPTION}

Main content area:
(1) Full-width greeting card with teal gradient background (from #3F8697 via teal/90 to teal-600), white text: Sparkles icon + "Buenos dias, Maria" in bold + "Lunes 17 de Marzo, 2026" in white/70. Decorative: two translucent white circular orbs (white at 10% opacity) at top-right and bottom-left corners, subtle grid pattern overlay at 10% opacity.

(2) Row of 4 stats cards (equal width):
  - BLUE gradient (from-blue-500 to-blue-600): Calendar icon (white, 80% opacity) + "Hoy" label + large "12" in white bold text-3xl + subtitle "turnos" in white/70
  - EMERALD gradient (from-emerald-500 to-emerald-600): TrendingUp icon + "Esta Semana" + "48" + "turnos"
  - VIOLET gradient (from-violet-500 to-violet-600): Clock icon + "Este Mes" + "187" + "turnos"
  - AMBER-ORANGE gradient (from-amber-500 to-orange-500): Users icon + "Clientes" + "234" + "clientes registrados"
  Each card: rounded-xl, shadow-md, border-0, decorative white/10 circular blur at top-right corner.

(3) Two white cards side by side below stats:
  LEFT CARD "Proximos Turnos": blue Calendar icon (h-8) in blue/10 circle background, title in bold, "Ver todos" ghost button with arrow. List of 5 bookings: each row has gradient avatar circle (h-10 w-10) with customer first letter, customer name bold, service name in muted smaller text, date "dd/MM - HH:MM", colored status badge (PENDING=amber pill, CONFIRMED=blue pill, COMPLETED=emerald pill). First row has subtle blue-50/30 highlight.
  RIGHT CARD "Clientes Recientes": amber icon in amber/10 circle. List of customers: gradient avatars (cycling amber, emerald, violet, slate gradients), customer name bold, phone number muted, teal booking count badge.
  Both cards: bg-white/80 backdrop-blur-sm, border, shadow-sm, rounded-xl.`,
    contentType: 'mockup',
    deviceLayout: 'laptop_only',
  },

  dashboard_mobile: {
    label: 'DASHBOARD MOVIL — App en celular',
    description: `iPhone-style borderless smartphone showing TurnoLink mobile dashboard.

${MOBILE_NAV_DESCRIPTION}

Scrollable white background content:
- Teal gradient greeting card "Buenos dias" with Sparkles icon at top (same gradient and orbs as desktop but stacked vertically)
- 2x2 grid of stats cards: blue gradient "12" (Calendar icon), emerald "48" (TrendingUp), violet "187" (Clock), amber-orange "234" (Users) — all with large white bold numbers and white icons at 80% opacity
- Below: "Proximos Turnos" card with booking list — circular gradient avatars (h-10), customer names, service names, colored status badges (amber=Pendiente, blue=Confirmado, green=Completado)
- DM Sans font throughout, clean white background, teal (#3F8697) accents`,
    contentType: 'instagram_story',
    deviceLayout: 'phone_only_dashboard',
  },

  dashboard_with_badges: {
    label: 'DASHBOARD + FLOATING BADGES — Para marketing/landing',
    description: `MacBook-style silver laptop slightly angled showing TurnoLink dashboard (sidebar with LayoutDashboard, Calendar, Scissors, Users, Clock menu items + teal gradient greeting card + 4 colorful stats cards blue/emerald/violet/amber + booking list + customer list). Beside it an iPhone showing the mobile version (bottom nav with Home/Calendar/Scissors/Users/Menu icons, same stats in 2x2 grid).

${FLOATING_BADGES}

Both devices on clean white-to-teal subtle gradient surface with soft drop shadows. DM Sans font.`,
    contentType: 'instagram_post',
    deviceLayout: 'laptop_phone',
  },

  booking_page_full: {
    label: 'PAGINA DE RESERVAS PUBLICA — Lo que ven los clientes',
    description: `Wide browser window showing TurnoLink public booking page for a real business.

Hero section: full-width cover photo with semi-transparent dark overlay gradient from top. Centered: round business logo (h-16, rounded with shadow-xl), business name in large bold white text below logo.
Reputation display: filled Star icon (amber-400) + "4.8" in bold + bullet separator + "142 opiniones" text. Next to it: Users icon + "23" bold + "Esta semana" subtitle.
${TRUST_BADGES}
Contact buttons row: green WhatsApp button, blue Phone button, MapPin Location button, Instagram camera button — all with icons and rounded-lg style.

Below hero: responsive grid of service cards (3 columns on desktop, 1 on mobile):
Each service card: rounded-2xl, subtle border, shadow, overflow-hidden.
  - 16:9 service photo at top with duration badge overlay (bottom-left: black/60 backdrop-blur pill "45 min")
  - Content below: service name in text-xl bold, muted description (2 lines), teal price "$2.500" (large bold), Clock icon + duration
  - Teal gradient "Reservar" button with right ArrowRight icon at bottom
  - Promo pricing (optional): original price strikethrough in grey, new price in bold, red discount badge "-20%"
  - Hover effect: subtle scale + shadow increase

DM Sans font, clean white background, teal (#3F8697) accent color throughout.`,
    contentType: 'landing_hero',
    deviceLayout: 'laptop_only',
  },

  booking_page_with_badges: {
    label: 'PAGINA DE RESERVAS + FLOATING BADGES — Para ads',
    description: `iPhone-style smartphone showing TurnoLink public booking page: business hero with logo and cover photo, "4.8" star rating with filled amber Star icon, grid of service cards with photos and teal "Reservar" buttons, trust badges (Zap "Confirmacion Inmediata", Shield "100% Seguro", Heart icon).

${FLOATING_BADGES}

Phone floating on clean white surface with soft shadow. DM Sans font.`,
    contentType: 'instagram_post',
    deviceLayout: 'phone_only_booking',
  },

  booking_calendar: {
    label: 'CALENDARIO DE RESERVAS — Seleccion de fecha y hora',
    description: `iPhone-style smartphone showing TurnoLink booking flow step by step.

Top: selected service mini card with photo thumbnail, name "Corte + Barba" bold, price "$2.500" in teal, Scissors icon + "45 min" duration.

Below: interactive calendar month view. ChevronLeft and ChevronRight navigation arrows flanking "Marzo 2026" centered. Weekday headers row (L M M J V S D) in text-xs font-medium. Calendar grid of day cells (h-10 each, rounded-md):
  - Today: teal border ring
  - Selected date: filled teal (#3F8697) background with white number
  - Available dates: normal dark text, hover:bg-muted
  - Unavailable dates: 40% opacity with tiny diagonal strikethrough line
  - Past dates: 30% opacity, cursor-not-allowed

Below calendar: time slot selection.
3 period filter tabs (grid-cols-3):
  - "Manana" with sunrise icon in amber color (active: bg-slate-900 dark text on white)
  - "Tarde" with sun icon in orange
  - "Noche" with moon icon in indigo
  Active tab: dark background (slate-900) with white text and shadow. Inactive: slate-100 bg with slate-600 text. Each tab shows available count badge.

Time slots grid (grid-cols-3, gap-2):
  - Slot buttons: rounded-xl, py-2.5 px-3, text "09:00", "09:30", "10:00", "10:30" etc.
  - Selected slot: bg-slate-900 text-white, border-2 border-slate-900
  - Available slot: bg-white, border-2 border-slate-200, hover:border-slate-400
  - Text: text-[13px] font-medium

DM Sans font, clean white background, minimal and elegant.`,
    contentType: 'instagram_story',
    deviceLayout: 'phone_only_booking',
  },

  booking_confirmation: {
    label: 'CONFIRMACION DE RESERVA — Formulario del cliente',
    description: `iPhone-style smartphone showing TurnoLink booking confirmation screen.

Booking summary card at top: rounded-xl border, showing:
  - Service: "Corte + Barba" bold with Scissors icon
  - Employee: "Carlos M." with UserCircle icon
  - Date: "Lun 17 de Marzo" with Calendar icon
  - Time: "10:30" with Clock icon
  - Duration: "45 min"
  - Price: "$2.500" in large teal bold text

Below: customer form with labeled inputs:
  - "Nombre completo" input field (rounded-lg, border, px-3 py-2) with text "Maria Garcia" filled
  - "Telefono" input with country flag prefix +54
  - "Email" input with mail placeholder
  - "Notas (opcional)" textarea, shorter height
  All inputs: rounded-lg, subtle border, clean label above in text-sm font-medium

Large full-width teal gradient button at bottom: "Confirmar Reserva" with CheckCircle icon, rounded-lg, shadow.

DM Sans font, clean white background.`,
    contentType: 'instagram_story',
    deviceLayout: 'phone_only_booking',
  },

  turnos_week: {
    label: 'GESTION DE TURNOS — Vista semanal del calendario',
    description: `MacBook-style laptop showing TurnoLink booking management page.

Header banner: indigo-to-violet-to-purple gradient (from-indigo-600 via-violet-600 to-purple-600), two decorative white/10 blur orbs at corners. Content: Calendar icon in white/20 rounded container + "Turnos" large bold white title + "Nuevo Turno" button (white bg, indigo text).
Stats bar (4 metrics in white/10 boxes): Layers icon + "48 Esta Semana", Clock icon + "8 Pendientes", CheckCircle2 icon + "32 Confirmados", Star icon + "8 Completados". Numbers in text-2xl bold white.

Below: Week/Month toggle buttons (active=white bg with indigo-600 text and shadow, inactive=slate text), date navigation ChevronLeft/ChevronRight + centered date range text + "Hoy" button.

Main calendar: 7-column grid (Lun through Dom). Each column is a day card:
  - Header: day name uppercase small + large date number. Today's column: indigo-50 highlight bg.
  - Content area (min-h-180px, scrollable): color-coded booking blocks stacked vertically
    - PENDING blocks: amber-50 bg, 3px amber-500 left border, "10:00 Maria G. - Corte" text, tiny amber "Pendiente" badge
    - CONFIRMED blocks: blue-50 bg, 3px blue-500 left border, blue "Confirmado" badge
    - COMPLETED blocks: emerald-50 bg, 3px emerald-500 left border, emerald "Completado" badge
    - CANCELLED blocks: red-50 bg, 3px red-500 left border, red "Cancelado" badge
  Each block: rounded-lg, text-sm, customer name + service name + time

${SIDEBAR_DESCRIPTION.split('\n').slice(0,3).join('\n')}
(sidebar visible at left with full navigation)

DM Sans font, Lucide icons throughout.`,
    contentType: 'mockup',
    deviceLayout: 'laptop_only',
  },

  turnos_mobile: {
    label: 'TURNOS MOVIL — Agenda del dia en celular',
    description: `iPhone-style smartphone showing TurnoLink bookings on mobile.

Indigo gradient header: Calendar icon + "Turnos" title white + mini stats "12 total, 3 pendientes".

Horizontal scrollable day selector: 7 pill buttons in a row.
  - Each pill: day abbreviation "LUN" small + date number "17" large + colored dot if has bookings
  - Selected pill: indigo-600 bg, white text, scale-105, shadow-lg
  - Unselected pills: white bg, border border-slate-200, slate text

Below: chronological booking cards for selected day:
  Each card: rounded-lg, subtle border, colored left border (3px):
  - Time block: "10:00 - 10:45" bold
  - Gradient avatar circle (h-10) with customer initial letter
  - Customer name bold text-sm
  - Service name in muted text-xs
  - Status badge right-aligned: colored pill with status text

${EMPLOYEE_MOBILE_NAV.split('\n').slice(0,2).join('\n')}
(bottom nav bar visible)

DM Sans font, clean white background.`,
    contentType: 'instagram_story',
    deviceLayout: 'phone_only_dashboard',
  },

  autogestion: {
    label: 'AUTOGESTION — Agenda diaria tipo timeline',
    description: `MacBook-style laptop showing TurnoLink Autogestion (self-management) page.

Header: teal-to-cyan-to-blue gradient (from-teal-600 via-cyan-600 to-blue-600) with CalendarCheck icon in white/20 container + "Autogestion" large white bold + two action buttons: "Atender Ahora" (glass style: white/20 bg, border white/30) and "Nuevo Turno" (white bg, teal text).
Stats bar: 4 white/10 boxes with counts (Total, Pendientes, Confirmados, Completados).

Main content: horizontal day selector pills at top (same style as turnos mobile: selected=indigo bg white text, unselected=white with border).

Below: vertical hourly timeline from 09:00 to 20:00. Each hour has a thin grey separator line with hour label at left. Booking cards placed at their time positions:
  - Amber cards at 10:00: "Maria G. - Corte + Barba - 45min" with amber left border
  - Blue card at 11:00: confirmed booking with blue left border
  - Emerald card at 14:00: completed booking with green left border
  - Empty slots between bookings: subtle dashed border on hover, clickable

Sidebar visible at left with full menu (LayoutDashboard, BarChart3, CalendarCheck active with teal bg, Calendar, Scissors, UserCog, Users, Clock icons).

DM Sans font.`,
    contentType: 'mockup',
    deviceLayout: 'laptop_only',
  },

  servicios: {
    label: 'SERVICIOS — Catalogo de servicios del negocio',
    description: `MacBook-style laptop showing TurnoLink Services management page.

Header with gradient and Scissors icon in white/20 container + "Servicios" white bold + "Nuevo Servicio" button (white bg).
Stats: total services count + active count.

Main: responsive grid of 6 service cards (3 columns, 2 rows). Each card: rounded-xl, shadow-soft, hover:-translate-y-1 + shadow increase.
  - Top: 16:9 service photo (high quality salon/clinic/gym photo), bottom-left overlay: black/60 backdrop-blur pill "45 min" duration
  - Content below photo: service name in text-lg bold, Timer icon + duration badge, large price "$2.500" in teal bold
  - Brief description (2 lines, text-sm muted, line-clamp-2)
  - One card shows PROMO pricing: original "$3.000" with strikethrough grey line, promo "$2.400" in bold green, red badge "-20%"
  - Action buttons row at bottom: Edit (Pencil icon), Delete (Trash icon in red)
  - Some cards show amenity tags: small pills listing included items

Sidebar visible at left (Scissors item active with teal bg).

DM Sans font, clean white cards on light background.`,
    contentType: 'mockup',
    deviceLayout: 'laptop_only',
  },

  empleados: {
    label: 'EMPLEADOS — Gestion del equipo',
    description: `MacBook-style laptop showing TurnoLink Employees management page.

Header: indigo-to-purple-to-teal gradient with Users (UserCog) icon in white/20 container + "Empleados" white bold + "Agregar Empleado" button (white bg, indigo text).
Stats: 2 boxes — "Total: 6" + "Activos: 5".

Grid of 6 employee cards (3 columns). Each card: rounded-xl, shadow-soft.
  - Top section: employee photo (rounded-xl) or gradient avatar circle (h-14 w-14) with initial letter, name bold, specialty badge pill (e.g. "Colorista", "Barbero"), active status badge (emerald "Activo" or slate "Inactivo")
  - One card shows inactive employee with opacity-60
  - Content: bio text (2 lines), Award icon + "Mat. 12345" credentials, Phone icon + phone number, Mail icon + email
  - Action buttons: Pencil Edit icon, Clock Schedule icon, Trash Delete icon (red tint)

Sidebar at left (UserCog item active with teal bg).

DM Sans font, Lucide line icons.`,
    contentType: 'mockup',
    deviceLayout: 'laptop_only',
  },

  clientes: {
    label: 'CLIENTES — Base de datos de clientes',
    description: `MacBook-style laptop showing TurnoLink Clients management page.

Header: teal-to-cyan gradient with Users icon in white/20 container + "Clientes" white bold.
Stats: 3 boxes — "Total: 234", "Turnos: 1.2K", "Promedio: 5.1 turnos/cliente".

Controls bar: large Search input with magnifying glass icon at left + Grid/List view toggle buttons (LayoutGrid and List icons) at right.

Main: grid of client cards (3 columns). Each card: rounded-xl, subtle border, shadow.
  - Top: gradient avatar circle (h-12) with customer initial — cycling through 6 gradient color pairs (amber-to-orange, emerald-to-emerald, violet-to-violet, blue-to-blue, teal-to-teal, slate-to-slate)
  - Name bold, teal booking count badge "12 turnos" (bg-primary/10 text-primary rounded-full)
  - Phone: green Phone icon in bg-green-100 circle + phone number
  - Email: blue Mail icon in bg-blue-100 circle + email
  - Last booking: violet Calendar icon in bg-violet-100 circle + "15/03/2026"
  - Contact buttons: green WhatsApp button, blue Call button
  - Hover: shows ChevronRight arrow indicator

Sidebar at left (Users item active with teal bg).

DM Sans font.`,
    contentType: 'mockup',
    deviceLayout: 'laptop_only',
  },

  horarios: {
    label: 'HORARIOS — Configuracion de horarios semanales',
    description: `MacBook-style laptop showing TurnoLink Schedule configuration page.

Header: amber-to-orange-to-red gradient with Clock icon in white/20 container + "Horarios" white bold.
Stats: 2 boxes — CheckCircle2 icon + "5 dias activos", Coffee icon + "2 dias libres".

Tab buttons: "Por Turnos" (Clock icon, active) + "Por Dias" (CalendarDays icon, inactive). Active: white bg shadow indigo-600 text. Inactive: slate text.

Main card "Horario Semanal": 7 rows, one per day of week:
  - LUNES: blue circle icon + "Lunes" bold + "Abierto" green text + time inputs "09:00" [a] "18:00" + green toggle switch ON
  - MARTES: violet icon + "Martes" + same pattern
  - MIERCOLES: emerald icon + same
  - JUEVES: teal icon + same
  - VIERNES: cyan icon + same
  - SABADO: amber icon + "Sabado" + "09:00" [a] "14:00" (shorter hours)
  - DOMINGO: slate icon + "Domingo" + "Cerrado" red text + toggle switch OFF + greyed out time inputs (opacity-50)
  Each row has distinct subtle color coding matching its icon color.

Tips card at bottom: amber-to-orange gradient background (light), Sun icon in gradient circle + "Consejo" bold + advice text about client booking patterns.

Sidebar at left (Clock item active with teal bg).

DM Sans font.`,
    contentType: 'mockup',
    deviceLayout: 'laptop_only',
  },

  reportes: {
    label: 'REPORTES — Analytics y metricas del negocio',
    description: `MacBook-style laptop showing TurnoLink Reports analytics page.

Header: BarChart3 icon in violet/10 circle container + "Reportes" bold title + "Profesional" plan badge (violet bg, white text, rounded-full) + "Marzo 2026" month badge.

KPI cards row (4 cards):
  - "Total Turnos" with number "187" large bold + green TrendingUp arrow + "+12%" in green text
  - "Ingresos" with "$468.500" large bold + green trend + "+8%"
  - "Tasa Completados" with "87%" large bold + emerald indicator circle
  - "Clientes Nuevos" with "23" large bold + blue trend arrow + "+15%"
  Each KPI card: white bg, border, rounded-xl, colored icon in matching bg circle at top-right.

Charts section (2 columns):
  LEFT: "Turnos por Estado" — colorful donut/pie chart with 4 segments: amber (Pendientes 15%), blue (Confirmados 42%), emerald (Completados 35%), red (Cancelados 8%). Legend below with colored dots + labels + counts.
  RIGHT: "Turnos por Dia" — vertical bar chart with blue bars for each day (Mon-Sun), varying heights showing daily volume, subtle trend line overlay. X-axis: day abbreviations, Y-axis: count numbers.

Bottom section (2 columns):
  LEFT: "Top Servicios" — ranked list with position numbers, service names, booking count, percentage progress bar (teal filled).
  RIGHT: "Top Clientes" — ranked list with gradient avatars, customer names, booking counts, small teal badges.

Sidebar at left (BarChart3 item active with teal bg).

DM Sans font, clean data visualization style.`,
    contentType: 'mockup',
    deviceLayout: 'laptop_only',
  },

  sucursales: {
    label: 'SUCURSALES — Gestion multi-sede',
    description: `MacBook-style laptop showing TurnoLink Branches page.

Header: teal-to-cyan-to-blue gradient with Building2 icon + "Sucursales" white bold + "Nueva Sucursal" button.
Stats: 2 boxes — "Total: 3" + "Activas: 3".

Grid of 3 branch cards. Each card: rounded-xl, shadow-soft.
  - Top: large gradient avatar circle (h-14) with branch initial + branch name bold "Centro" + slug "/centro" in muted text
  - First card has amber "Principal" badge
  - Emerald "Activa" status badge
  - MapPin icon + address text
  - Phone icon + phone number
  - Quick stats grid (2 cols): Scissors icon + "12 servicios", Users icon + "4 empleados"
  - Management buttons row (3 buttons): "Servicios" (Scissors), "Empleados" (Users), "Horarios" (Clock)
  - Action buttons: Pencil Edit + Trash Delete (delete disabled on main branch)

Sidebar at left (Building2 item active with teal bg).

DM Sans font, Lucide icons.`,
    contentType: 'mockup',
    deviceLayout: 'laptop_only',
  },

  suscripcion: {
    label: 'SUSCRIPCION — Planes y facturacion',
    description: `MacBook-style laptop showing TurnoLink Subscription page.

Current plan card (highlighted with teal border): "Profesional" in teal badge, "$4.990/mes" large bold, "Mensual" billing badge, feature checklist with green CheckCircle icons: "Hasta 3 empleados", "Cobro automatico con Mercado Pago", "Calendario completo", "Portal de empleados", "Reportes basicos". Days remaining indicator.

Plan comparison grid (3 columns):
  - "Gratis" card: grey theme, "$0", basic features with Check/X icons, "Plan Actual" or "Downgrade" button
  - "Profesional" card: teal theme with teal border (current plan highlighted), "$4.990/mes", more features checked, "Plan Actual" badge
  - "Negocio" card: violet theme, "$9.990/mes", all features checked + "Auditoria", "Roles avanzados", "Soporte prioritario", "Upgrade" violet button
  Popular badge on middle card: "Popular" teal pill at top.

Billing history table below: columns Date | Monto | Estado | Descarga. Status badges: "Pagado" in emerald, "Pendiente" in amber. Download PDF icon button.

Sidebar at left (Crown item active with teal bg).

DM Sans font.`,
    contentType: 'mockup',
    deviceLayout: 'laptop_only',
  },

  videollamadas: {
    label: 'VIDEOLLAMADAS — Integracion Zoom y Google Meet',
    description: `MacBook-style laptop showing TurnoLink Video Calls integration page.

Header: indigo-to-blue-to-cyan gradient with Video icon + "Videollamadas" white bold.

Main: 2-column grid of provider cards + info card.

LEFT CARD "Zoom": h-1 blue gradient top border, blue Video icon in blue/10 circle (h-12 w-12), "Zoom" title bold, description text, "Conectar Zoom" blue button (blue-600 bg, white text, rounded-lg).

RIGHT CARD "Google Meet": h-1 green gradient top border, green Video icon in green/10 circle, "Google Meet" title, description, "Conectar Google Meet" green button.

BOTTOM CARD "Como funciona": h-1 grey gradient top border, numbered steps list (1-4) explaining the integration flow. Each step has a number badge and description.

One card shows CONNECTED state: emerald h-1 top border, "Conectado" emerald badge, account email display, connection date, red "Desconectar" button with AlertTriangle icon.

Sidebar at left (Video item active with teal bg).

DM Sans font.`,
    contentType: 'mockup',
    deviceLayout: 'laptop_only',
  },

  portal_agenda: {
    label: 'PORTAL EMPLEADO — Mi agenda personal',
    description: `MacBook-style laptop showing TurnoLink Employee Portal agenda page.

${EMPLOYEE_SIDEBAR_DESCRIPTION}
(CalendarDays "Mi Agenda" active with teal bg)

${HEADER_DESCRIPTION}

Main content:
Title: "Mi Agenda" h1 bold + "Gestiona tus turnos y reservas" subtitle muted.

Stats row (4 cards):
  - "Hoy: 6" with primary colored icon
  - "Esta Semana: 24" with blue icon
  - "Completados: 92%" with emerald TrendingUp icon
  - "Proximo: Maria G. 10:30" with Clock icon and customer detail

Navigation: ChevronLeft + "Hoy" button + ChevronRight + centered date text "Lunes 17 de Marzo" + Day/Week/Month tab buttons + status filter Dropdown.

Bookings list: each row is a card with:
  - Clock icon + "10:00 - 10:45" time
  - "Corte + Barba" service name bold
  - User icon + "Maria Garcia" customer name
  - Status badge (amber "Pendiente", blue "Confirmado", etc.)
  - Action buttons right-aligned: "Confirmar" (emerald outlined button for pending), "Completar" (emerald for confirmed), red X cancel button (ghost style)

DM Sans font.`,
    contentType: 'mockup',
    deviceLayout: 'laptop_only',
  },

  portal_disponibilidad: {
    label: 'PORTAL EMPLEADO — Mi disponibilidad',
    description: `MacBook-style laptop showing TurnoLink Employee Portal availability editor.

${EMPLOYEE_SIDEBAR_DESCRIPTION}
(Clock "Mi Disponibilidad" active with teal bg)

Main content: weekly schedule editor card.
7 rows (one per day): day name label + toggle switch + start time input "09:00" + "a" text + end time input "18:00". Active days have colored left border accents. Inactive days: greyed out toggle OFF, time inputs at opacity-50.

Below: "Fechas Bloqueadas" section. Date input + reason text input + "Bloquear" button. List of blocked dates: each row with red-50 background, date, reason text, Trash delete icon button.

Preview card at bottom: "Asi te ven los clientes" — mini calendar preview showing available dates in teal and blocked dates greyed out.

DM Sans font.`,
    contentType: 'mockup',
    deviceLayout: 'laptop_only',
  },

  portal_equipo: {
    label: 'PORTAL EMPLEADO — Gestion de equipo (OWNER/MANAGER)',
    description: `MacBook-style laptop showing TurnoLink Employee Portal team management page.

${EMPLOYEE_SIDEBAR_DESCRIPTION}
(UsersRound "Mi Equipo" active with teal bg)

Team members table/list: each row shows:
  - Gradient avatar circle with initial
  - Employee name bold
  - Role badge: "OWNER" in teal pill, "MANAGER" in violet pill, "STAFF" in blue pill, "VIEWER" in slate pill
  - Last access date in muted text
  - Status: emerald "Activo" badge
  - Actions: role change dropdown, red "Revocar" button

Below: "Invitar Empleado" section card:
  - Email input field
  - Role selector dropdown (STAFF, MANAGER, VIEWER options)
  - "Enviar Invitacion" teal gradient button with Mail icon

Pending invitations list: email, assigned role pill, expiry date, "Reenviar" button + "Cancelar" red button.

DM Sans font.`,
    contentType: 'mockup',
    deviceLayout: 'laptop_only',
  },

  landing_hero: {
    label: 'LANDING PAGE — Hero section principal',
    description: `Wide browser showing TurnoLink main landing page.

Dark background (#0A1518) with subtle glowing gradient orbs (teal/blue at 5-8% opacity, large blurred circles).

Centered content:
  - Pill badge at top: "La plataforma de gestion para negocios de servicios" — glass style with white/80 text, white/8 border, white/6 bg, rounded-full
  - Massive heading: "Tu operacion completa," in white (86px font-size, -3.8px letter-spacing, DM Sans), second line "en una sola plataforma" in white/60
  - Two CTA buttons side by side:
    - PRIMARY: teal (#3F8697) solid bg, white text, "Empezar gratis ahora" + ArrowRight icon, rounded-lg, shadow
    - SECONDARY: glass effect (white/10 bg, white/20 border, backdrop-blur), white/80 text, "Hablar con ventas" + ArrowRight icon
  - Trust signals row below: small white/40 text items with tiny icons:
    - Scissors icon + "Belleza"
    - HeartPulse icon + "Salud"
    - Dumbbell icon + "Deportes"
    - Briefcase icon + "Profesionales"
    - "Configuracion en 5 min" text

${METRICS_STRIP}

DM Sans font, premium dark SaaS aesthetic similar to Stripe/Linear.`,
    contentType: 'landing_hero',
    deviceLayout: 'laptop_only',
  },

  // ─── DARK MODE VARIANTS ───
  dashboard_dark: {
    label: 'DASHBOARD DARK MODE — Vista nocturna completa',
    description: `MacBook-style laptop showing TurnoLink dashboard in DARK MODE.

Background: #0A1518 very dark teal-black. Sidebar: dark bg (#0A1518) with teal TurnoLink logo (light version), navigation items in off-white/70 muted text, active item has teal bg. Menu items same as light mode: LayoutDashboard, BarChart3, CalendarCheck, Calendar, Scissors, UserCog, Users, Clock, Settings, Crown icons.

Header: dark semi-transparent with backdrop-blur, notification Bell with teal pulse badge, Moon icon active in theme toggle.

Main: teal gradient greeting card (same gradient, pops against dark bg). 4 stats cards maintain their vibrant gradients (blue, emerald, violet, amber-orange) — the colorful cards CONTRAST beautifully against the dark background.

Below: dark cards (#1A1A1A bg, #333 borders) for "Proximos Turnos" and "Clientes Recientes". Avatar circles and status badges (amber-300, blue-300, emerald-300 for dark mode) glow against dark surface.

All text in off-white (#FAFAFA). DM Sans font. Premium dark SaaS aesthetic.`,
    contentType: 'mockup',
    deviceLayout: 'laptop_only',
    darkMode: true,
  },

  booking_dark: {
    label: 'BOOKING PAGE DARK MODE — Reservas de noche',
    description: `iPhone-style smartphone showing TurnoLink public booking page in DARK MODE.

Dark background (#0A1518). Service cards: dark card bg (#1A1A1A) with #333 subtle borders, rounded-2xl. Service photos pop against dark surface. Service names in off-white, prices in teal (#3F8697), duration in muted white/50. Teal gradient "Reservar" buttons GLOW against dark — subtle teal shadow effect.

Calendar section: dark bg, date numbers in off-white, selected date in filled teal glowing, unavailable dates very faded (white at 20% opacity). Time slot buttons: dark bg (#1A1A1A) with lighter borders (#333), selected slot in teal with glow effect.

Trust badges in white/40 text: Zap, Shield, Heart icons.

${EMPLOYEE_MOBILE_NAV.replace(/teal/g, 'teal glowing')}

DM Sans font. Premium nighttime aesthetic, ideal for stories nocturnas.`,
    contentType: 'instagram_story',
    deviceLayout: 'phone_only_booking',
    darkMode: true,
  },
};

// ─── MARKETING PROMPTS ───

const marketingPrompts = [
  { contentType: 'instagram_post', message: 'Deja de perder turnos por WhatsApp', includeUI: true, label: 'IG POST — Laptop + Phone + Floating badges', deviceLayout: 'laptop_phone' },
  { contentType: 'instagram_post', message: 'Tu negocio abierto 24/7', includeUI: true, label: 'IG POST — Solo booking movil + badges', deviceLayout: 'phone_only_booking' },
  { contentType: 'facebook_ad', message: 'Reservas online en 5 minutos — empeza gratis', includeUI: true, label: 'FACEBOOK AD — Vista dueno + vista cliente', deviceLayout: 'laptop_phone_booking' },
  { contentType: 'mockup', message: 'Calendario, cobros y clientes en un solo lugar', includeUI: true, label: 'MOCKUP TRIPLE DEVICE — Showcase premium', deviceLayout: 'triple_device' },
  { contentType: 'whatsapp_status', message: 'Tu negocio abierto 24/7 sin atender WhatsApp', includeUI: true, label: 'WHATSAPP STATUS — Estado rapido' },
  { contentType: 'email_header', message: 'Probalo 14 dias gratis', includeUI: true, label: 'EMAIL HEADER — Banner de email' },
];

const industryPrompts = [
  { businessType: 'barbería', contentType: 'instagram_post', message: 'Reserva tu corte sin esperar — turnos online 24/7', label: 'BARBERIA — Instagram Post' },
  { businessType: 'estética', contentType: 'instagram_story', message: 'Tus clientas reservan solas mientras dormis', label: 'ESTETICA — Instagram Story' },
  { businessType: 'peluquería', contentType: 'facebook_ad', message: 'Deja de perder turnos por WhatsApp', label: 'PELUQUERIA — Facebook Ad' },
  { businessType: 'consultorio', contentType: 'instagram_post', message: 'Agenda medica digital — tus pacientes reservan online', label: 'CONSULTORIO — Instagram Post' },
  { businessType: 'odontólogo', contentType: 'landing_hero', message: 'Tu consultorio dental abierto 24/7', label: 'ODONTOLOGO — Landing Hero' },
  { businessType: 'cancha', contentType: 'instagram_post', message: 'Reserva tu cancha desde el celular', label: 'CANCHA — Instagram Post' },
  { businessType: 'spa', contentType: 'instagram_story', message: 'Regala relax — turnos online para tu spa', label: 'SPA — Instagram Story' },
  { businessType: 'uñas', contentType: 'instagram_post', message: 'Turnos para unas sin espera', label: 'UNAS — Instagram Post' },
  { businessType: 'psicólogo', contentType: 'facebook_ad', message: 'Gestiona tus sesiones sin estres', label: 'PSICOLOGO — Facebook Ad' },
  { businessType: 'gimnasio', contentType: 'instagram_story', message: 'Clases y turnos desde el celular', label: 'GIMNASIO — Instagram Story' },
  { businessType: 'yoga', contentType: 'instagram_post', message: 'Reserva tu clase en segundos', label: 'YOGA — Instagram Post' },
  { businessType: 'hotel', contentType: 'facebook_ad', message: 'Reservas sin llamar', label: 'HOTEL — Facebook Ad' },
];

// ─── BUILD TXT ───

let o = '';
const brand = require('./turnolink-brand-system.json');

o += '================================================================\n';
o += '\n';
o += '   TURNOLINK — PROMPTS DE GENERACION DE IMAGENES v3.0\n';
o += '   Con menu EXACTO, iconos Lucide reales, floating badges\n';
o += '\n';
o += '   Uso: Copiar PROMPT en DALL-E 3, Midjourney o Stable Diffusion\n';
o += '   Fecha: 2026-03-17\n';
o += '\n';
o += '================================================================\n\n\n';

// Negative
o += '------------------------------------------------------------\n';
o += '  NEGATIVE PROMPT (usar para TODOS)\n';
o += '------------------------------------------------------------\n\n';
o += brand.image_generation.negative_prompt + '\n\n\n';

// Quick ref
o += '------------------------------------------------------------\n';
o += '  REFERENCIA: MENU EXACTO DEL SIDEBAR\n';
o += '------------------------------------------------------------\n\n';
o += '  NEGOCIO (admin):\n';
o += '  General:        Dashboard (LayoutDashboard) | Reportes (BarChart3)\n';
o += '  Turnos:         Autogestion (CalendarCheck) | Turnos (Calendar)\n';
o += '                  Servicios (Scissors) | Empleados (UserCog)\n';
o += '                  Especialidades (GraduationCap) | Formularios (ClipboardList)\n';
o += '                  Sucursales (Building2) | Clientes (Users) | Horarios (Clock)\n';
o += '  Configuracion:  General (Settings) | Pagos (CreditCard)\n';
o += '                  Videollamadas (Video) | Seguridad (Shield)\n';
o += '  Cuenta:         Mi Suscripcion (Crown) | Verificar Email (Mail)\n';
o += '                  Resenas (Star) | Desarrolladores (Code2)\n';
o += '  Bottom:         Ver mi pagina (ExternalLink) | Ayuda (HelpCircle)\n';
o += '\n';
o += '  MOVIL (bottom nav 5 items):\n';
o += '  Inicio (Home) | Turnos (Calendar) | Servicios (Scissors)\n';
o += '  Clientes (Users) | Menu (Menu hamburger)\n';
o += '\n';
o += '  EMPLEADO (sidebar):\n';
o += '  Mi Agenda (CalendarDays) | Mi Disponibilidad (Clock)\n';
o += '  Mi Perfil (UserCircle) | Mis Clientes (Users)\n';
o += '  Mi Equipo (UsersRound) | Auditoria (FileText)\n';
o += '\n';
o += '  COLORES DE ESTADO:\n';
o += '  Pendiente=AMBAR | Confirmado=AZUL | Completado=ESMERALDA\n';
o += '  Cancelado=ROJO | No Asistio=SLATE/GRIS\n';
o += '\n';
o += '  FLOATING BADGES (para promos):\n';
o += '  - TrendingUp verde + "-80% ausencias" + "Con cobro de senas"\n';
o += '  - Star amarilla filled + "4.8 Resenas" + "Verificadas por clientes"\n';
o += '  - 5 mini Star amarillas + quote cliente + "Sofia M. Verificada"\n';
o += '  - Zap teal + "+500 negocios" + "Usan TurnoLink"\n';
o += '\n';
o += '  TRUST BADGES (bajo el hero publico):\n';
o += '  Zap + "Confirmacion Inmediata"\n';
o += '  Shield + "100% Seguro"\n';
o += '  Heart + "Reserva tu turno"\n';
o += '\n\n';

// Section 1: Screens
const screenKeys = Object.keys(screens);
o += '================================================================\n';
o += '  SECCION 1: PANTALLAS POR FUNCIONALIDAD (' + screenKeys.length + ' prompts)\n';
o += '================================================================\n\n';

screenKeys.forEach((key, i) => {
  const screen = screens[key];
  const layers = [];
  layers.push(screen.description);

  if (!screen.darkMode) {
    layers.push('Clean white and teal (#3F8697) color scheme, white cards with subtle soft shadows, rounded-xl corners');
  } else {
    layers.push('Dark mode: background #0A1518, dark cards #1A1A1A, teal (#3F8697) accents glowing, subtle #333 borders');
  }
  layers.push(brand.image_generation.lighting);
  layers.push(brand.image_generation.composition);
  layers.push('Photorealistic UI render with actual interface data visible on screens, not wireframes');
  layers.push('4K resolution, ultra sharp, professional commercial photography, award-winning SaaS product shot');

  const prompt = layers.join('. ');
  const template = require('./prompt-generator').contentTemplates[screen.contentType] || {};

  o += '--- ' + (i + 1) + '. ' + screen.label + ' ---\n\n';
  o += 'Key:     ' + key + '\n';
  o += 'Formato: ' + (template.aspect || 'flexible') + '\n';
  o += 'Modo:    ' + (screen.darkMode ? 'DARK MODE' : 'Light') + '\n';
  if (template.guidelines) o += 'Tips:    ' + template.guidelines + '\n';
  o += '\nPROMPT:\n' + prompt + '\n\n\n';
});

// Section 2: Marketing
o += '================================================================\n';
o += '  SECCION 2: MARKETING GENERAL (' + marketingPrompts.length + ' prompts)\n';
o += '================================================================\n\n';

marketingPrompts.forEach((p, i) => {
  const result = generateImagePrompt({
    businessType: 'plataforma de turnos',
    contentType: p.contentType,
    message: p.message,
    includeUI: p.includeUI,
    deviceLayout: p.deviceLayout,
  });
  o += '--- ' + (i + 1) + '. ' + p.label + ' ---\n\n';
  o += 'Tamano: ' + result.metadata.aspectRatio + '\n';
  o += 'CTA:    ' + result.metadata.suggestedCTA + '\n';
  o += '\nPROMPT:\n' + result.prompt + '\n\n\n';
});

// Section 3: Industry
o += '================================================================\n';
o += '  SECCION 3: POR INDUSTRIA (' + industryPrompts.length + ' prompts)\n';
o += '================================================================\n\n';

industryPrompts.forEach((p, i) => {
  const result = generateImagePrompt({
    businessType: p.businessType,
    contentType: p.contentType,
    message: p.message,
    includeUI: true,
  });
  o += '--- ' + (i + 1) + '. ' + p.label + ' ---\n\n';
  o += 'Tamano:    ' + result.metadata.aspectRatio + '\n';
  o += 'Audiencia: ' + result.metadata.audience + '\n';
  o += 'CTA:       ' + result.metadata.suggestedCTA + '\n';
  o += '\nPROMPT:\n' + result.prompt + '\n\n\n';
});

// Tips
o += '================================================================\n';
o += '  TIPS PROFESIONALES\n';
o += '================================================================\n\n';
o += '  DALL-E 3: Pegar directo. Si la UI sale con texto raro agregar:\n';
o += '  "no text on screens, only visual UI elements and colored blocks"\n\n';
o += '  Midjourney: Agregar --no [negative] --ar 1:1 --v 6.1 --style raw\n\n';
o += '  Stable Diffusion: SDXL/Juggernaut XL, CFG 7-8, Steps 30-40\n\n';
o += '  PRO TIP: Superponer screenshots reales en Figma/Canva sobre\n';
o += '  el mockup generado = resultado profesional perfecto.\n\n';
o += '================================================================\n';

// Write
fs.writeFileSync(__dirname + '/turnolink-prompts.txt', o);

const total = screenKeys.length + marketingPrompts.length + industryPrompts.length;
console.log('turnolink-prompts.txt generado');
console.log('Tamano: ' + (Buffer.byteLength(o) / 1024).toFixed(1) + ' KB');
console.log('Seccion 1 (Pantallas):  ' + screenKeys.length);
console.log('Seccion 2 (Marketing):  ' + marketingPrompts.length);
console.log('Seccion 3 (Industria):  ' + industryPrompts.length);
console.log('TOTAL: ' + total + ' prompts');
