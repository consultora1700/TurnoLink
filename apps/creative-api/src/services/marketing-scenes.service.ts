// =============================================================================
// Marketing Scenes Service
// 14 HTML scenes that render as professional marketing images via Playwright
// =============================================================================

export interface SceneParams {
  businessName: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl?: string;
  services?: string[];
  title?: string;
  subtitle?: string;
  cta?: string;
  description?: string;
}

export interface SceneInfo {
  id: string;
  name: string;
  description: string;
  category: 'product' | 'promo';
  format: 'post' | 'story' | 'banner';
  width: number;
  height: number;
}

export interface SceneOutput {
  html: string;
  width: number;
  height: number;
  name: string;
  description: string;
}

// Helper: generate CSS color variations
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 63, g: 134, b: 151 };
}

function lighten(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  const lr = Math.min(255, r + Math.round((255 - r) * amount));
  const lg = Math.min(255, g + Math.round((255 - g) * amount));
  const lb = Math.min(255, b + Math.round((255 - b) * amount));
  return `rgb(${lr}, ${lg}, ${lb})`;
}

function darken(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  const dr = Math.round(r * (1 - amount));
  const dg = Math.round(g * (1 - amount));
  const db = Math.round(b * (1 - amount));
  return `rgb(${dr}, ${dg}, ${db})`;
}

function withAlpha(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Common HTML head with Inter font and reset
function htmlHead(width: number, height: number, extraStyles: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  width: ${width}px;
  height: ${height}px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  overflow: hidden;
  -webkit-font-smoothing: antialiased;
}
${extraStyles}
</style>
</head>
<body>`;
}

const htmlFoot = `</body></html>`;

// SVG Icons (inline, no external deps)
const ICONS = {
  calendar: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  chart: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
  bell: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
  users: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  dollar: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
  clock: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  check: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  star: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  smartphone: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>`,
  mail: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
  zap: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  shield: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  user: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  arrowUp: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>`,
  scissors: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>`,
};

function starRating(count: number, color: string): string {
  return Array.from({ length: count }, () =>
    `<span style="color:${color};display:inline-flex;">${ICONS.star.replace('width="24"', 'width="18"').replace('height="24"', 'height="18"')}</span>`
  ).join('');
}

// =========================================================================
// SCENE 1: Dashboard Overview (1080×1080)
// =========================================================================
function dashboardOverview(p: SceneParams): SceneOutput {
  const title = p.title || 'Controlá tu negocio desde un solo lugar';
  const subtitle = p.subtitle || p.tagline || 'Dashboard inteligente en tiempo real';
  const w = 1080, h = 1080;
  const css = `
    .scene { width:${w}px; height:${h}px; background: linear-gradient(135deg, ${p.primaryColor} 0%, ${darken(p.primaryColor, 0.3)} 100%); display:flex; flex-direction:column; padding:60px; color:#fff; position:relative; overflow:hidden; }
    .bg-shape { position:absolute; border-radius:50%; opacity:0.08; background:#fff; }
    .bg-shape-1 { width:500px; height:500px; top:-100px; right:-100px; }
    .bg-shape-2 { width:300px; height:300px; bottom:-50px; left:-50px; }
    .header { display:flex; justify-content:space-between; align-items:center; margin-bottom:40px; position:relative; z-index:1; }
    .brand { font-size:28px; font-weight:800; letter-spacing:-0.5px; }
    .badge { background:${withAlpha('#fff', 0.2)}; padding:8px 20px; border-radius:40px; font-size:14px; font-weight:600; backdrop-filter:blur(4px); }
    .title { font-size:38px; font-weight:800; line-height:1.2; margin-bottom:12px; position:relative; z-index:1; }
    .subtitle { font-size:18px; opacity:0.85; margin-bottom:40px; position:relative; z-index:1; }
    .stats { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; margin-bottom:30px; position:relative; z-index:1; }
    .stat-card { background:${withAlpha('#fff', 0.15)}; backdrop-filter:blur(10px); border-radius:16px; padding:24px; border:1px solid ${withAlpha('#fff', 0.1)}; }
    .stat-icon { width:40px; height:40px; border-radius:10px; background:${withAlpha('#fff', 0.2)}; display:flex; align-items:center; justify-content:center; margin-bottom:14px; color:#fff; }
    .stat-value { font-size:32px; font-weight:800; margin-bottom:4px; }
    .stat-label { font-size:13px; opacity:0.7; font-weight:500; }
    .stat-change { font-size:12px; color:${p.accentColor}; font-weight:600; margin-top:6px; display:flex; align-items:center; gap:2px; }
    .chart-area { flex:1; background:${withAlpha('#fff', 0.1)}; border-radius:16px; padding:24px; position:relative; z-index:1; border:1px solid ${withAlpha('#fff', 0.08)}; }
    .chart-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; }
    .chart-title { font-size:16px; font-weight:700; }
    .chart-pills { display:flex; gap:8px; }
    .pill { padding:4px 12px; border-radius:20px; font-size:11px; font-weight:600; }
    .pill-active { background:${withAlpha('#fff', 0.25)}; }
    .pill-inactive { background:${withAlpha('#fff', 0.08)}; opacity:0.6; }
    .chart-bars { display:flex; align-items:flex-end; gap:12px; height:140px; padding-top:10px; }
    .bar-group { flex:1; display:flex; flex-direction:column; align-items:center; gap:6px; }
    .bar { width:100%; border-radius:6px 6px 0 0; transition:height 0.3s; }
    .bar-label { font-size:10px; opacity:0.6; font-weight:500; }
  `;

  const barHeights = [60, 85, 45, 95, 70, 110, 80];
  const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  const html = `${htmlHead(w, h, css)}
<div class="scene">
  <div class="bg-shape bg-shape-1"></div>
  <div class="bg-shape bg-shape-2"></div>
  <div class="header">
    <div class="brand">${p.businessName}</div>
    <div class="badge">Dashboard</div>
  </div>
  <div class="title">${title}</div>
  <div class="subtitle">${subtitle}</div>
  <div class="stats">
    <div class="stat-card">
      <div class="stat-icon">${ICONS.calendar}</div>
      <div class="stat-value">47</div>
      <div class="stat-label">Turnos hoy</div>
      <div class="stat-change">${ICONS.arrowUp.replace('width="24"', 'width="12"').replace('height="24"', 'height="12"')} +12%</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">${ICONS.users}</div>
      <div class="stat-value">1,284</div>
      <div class="stat-label">Clientes activos</div>
      <div class="stat-change">${ICONS.arrowUp.replace('width="24"', 'width="12"').replace('height="24"', 'height="12"')} +8%</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">${ICONS.dollar}</div>
      <div class="stat-value">$38.5K</div>
      <div class="stat-label">Ingresos mes</div>
      <div class="stat-change">${ICONS.arrowUp.replace('width="24"', 'width="12"').replace('height="24"', 'height="12"')} +23%</div>
    </div>
  </div>
  <div class="chart-area">
    <div class="chart-header">
      <div class="chart-title">Turnos esta semana</div>
      <div class="chart-pills">
        <div class="pill pill-active">Semana</div>
        <div class="pill pill-inactive">Mes</div>
      </div>
    </div>
    <div class="chart-bars">
      ${barHeights.map((h, i) => `
        <div class="bar-group">
          <div class="bar" style="height:${h}px; background:linear-gradient(180deg, ${withAlpha('#fff', 0.4)} 0%, ${withAlpha('#fff', 0.15)} 100%);"></div>
          <div class="bar-label">${days[i]}</div>
        </div>
      `).join('')}
    </div>
  </div>
</div>
${htmlFoot}`;

  return { html, width: w, height: h, name: 'Dashboard Overview', description: 'Vista del dashboard con estadísticas clave y gráfico semanal' };
}

// =========================================================================
// SCENE 2: Booking Calendar (1080×1080)
// =========================================================================
function bookingCalendar(p: SceneParams): SceneOutput {
  const title = p.title || 'Turnos organizados, clientes felices';
  const subtitle = p.subtitle || p.tagline || 'Calendario inteligente que trabaja por vos';
  const w = 1080, h = 1080;
  const css = `
    .scene { width:${w}px; height:${h}px; background:#f8fafc; display:flex; flex-direction:column; padding:50px; position:relative; overflow:hidden; }
    .accent-bar { position:absolute; top:0; left:0; right:0; height:6px; background:linear-gradient(90deg, ${p.primaryColor}, ${p.secondaryColor}, ${p.accentColor}); }
    .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:30px; }
    .title { font-size:36px; font-weight:800; color:#1e293b; line-height:1.2; max-width:600px; }
    .subtitle { font-size:16px; color:#64748b; margin-top:8px; }
    .brand-badge { background:${p.primaryColor}; color:#fff; padding:10px 24px; border-radius:40px; font-size:14px; font-weight:700; }
    .calendar { flex:1; background:#fff; border-radius:20px; box-shadow:0 4px 30px rgba(0,0,0,0.06); padding:28px; display:flex; flex-direction:column; }
    .cal-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; padding-bottom:16px; border-bottom:2px solid #f1f5f9; }
    .cal-month { font-size:20px; font-weight:700; color:#1e293b; }
    .cal-nav { display:flex; gap:8px; }
    .cal-nav-btn { width:36px; height:36px; border-radius:10px; background:#f1f5f9; display:flex; align-items:center; justify-content:center; font-size:14px; color:#64748b; font-weight:600; }
    .cal-days-header { display:grid; grid-template-columns:60px repeat(5,1fr); gap:4px; margin-bottom:10px; }
    .cal-day-name { text-align:center; font-size:12px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px; padding:8px 0; }
    .cal-body { flex:1; display:grid; grid-template-columns:60px repeat(5,1fr); grid-template-rows:repeat(8,1fr); gap:4px; }
    .cal-time { font-size:11px; color:#94a3b8; font-weight:500; display:flex; align-items:flex-start; padding-top:4px; justify-content:center; }
    .cal-slot { border-radius:8px; font-size:11px; font-weight:600; padding:4px 8px; display:flex; align-items:center; overflow:hidden; white-space:nowrap; }
    .slot-booked { background:${withAlpha(p.primaryColor, 0.12)}; color:${p.primaryColor}; border-left:3px solid ${p.primaryColor}; }
    .slot-available { background:#f0fdf4; color:#16a34a; border-left:3px solid #22c55e; }
    .slot-break { background:#fef3c7; color:#d97706; border-left:3px solid #f59e0b; }
    .slot-empty { background:transparent; }
    .footer-text { text-align:center; margin-top:20px; font-size:13px; color:#94a3b8; }
    .footer-text span { color:${p.primaryColor}; font-weight:700; }
  `;

  const times = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];
  const dayNames = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

  // Generate slots — mix of booked, available, break
  const slots: string[][] = [
    ['booked:María G.', 'available', 'booked:Lucas P.', 'booked:Ana R.', 'available'],
    ['booked:Carlos M.', 'booked:Julia F.', 'available', 'booked:Pedro S.', 'booked:Sol K.'],
    ['available', 'booked:Martín D.', 'booked:Laura V.', 'available', 'booked:Diego L.'],
    ['break', 'break', 'break', 'break', 'break'],
    ['booked:Camila N.', 'available', 'booked:Tomás B.', 'available', 'booked:Valentina R.'],
    ['available', 'booked:Sofía H.', 'available', 'booked:Mateo C.', 'available'],
    ['booked:Facundo T.', 'booked:Mía J.', 'booked:Nicolás A.', 'available', 'booked:Emma L.'],
    ['available', 'available', 'booked:Lautaro G.', 'booked:Florencia M.', 'available'],
  ];

  function renderSlot(s: string): string {
    if (s.startsWith('booked:')) {
      return `<div class="cal-slot slot-booked">${s.replace('booked:', '')}</div>`;
    } else if (s === 'available') {
      return `<div class="cal-slot slot-available">Disponible</div>`;
    } else if (s === 'break') {
      return `<div class="cal-slot slot-break">Almuerzo</div>`;
    }
    return `<div class="cal-slot slot-empty"></div>`;
  }

  const html = `${htmlHead(w, h, css)}
<div class="scene">
  <div class="accent-bar"></div>
  <div class="header">
    <div>
      <div class="title">${title}</div>
      <div class="subtitle">${subtitle}</div>
    </div>
    <div class="brand-badge">${p.businessName}</div>
  </div>
  <div class="calendar">
    <div class="cal-header">
      <div class="cal-month">Marzo 2026</div>
      <div class="cal-nav">
        <div class="cal-nav-btn">‹</div>
        <div class="cal-nav-btn">›</div>
      </div>
    </div>
    <div class="cal-days-header">
      ${dayNames.map(d => `<div class="cal-day-name">${d}</div>`).join('')}
    </div>
    <div class="cal-body">
      ${times.map((time, row) => `
        <div class="cal-time">${time}</div>
        ${slots[row].map(s => renderSlot(s)).join('')}
      `).join('')}
    </div>
  </div>
  <div class="footer-text">Gestionado con <span>${p.businessName}</span></div>
</div>
${htmlFoot}`;

  return { html, width: w, height: h, name: 'Booking Calendar', description: 'Calendario semanal con turnos y disponibilidad en tiempo real' };
}

// =========================================================================
// SCENE 3: Service Cards (1080×1080)
// =========================================================================
function serviceCards(p: SceneParams): SceneOutput {
  const title = p.title || 'Mostrá tus servicios profesionalmente';
  const subtitle = p.subtitle || p.tagline || 'Cada servicio con su precio, duración y detalle';
  const w = 1080, h = 1080;

  const services = p.services && p.services.length > 0
    ? p.services.slice(0, 4)
    : ['Corte de pelo', 'Coloración', 'Tratamiento capilar', 'Brushing'];

  const serviceData = [
    { name: services[0] || 'Servicio 1', duration: '45 min', price: '$3.500', icon: ICONS.scissors },
    { name: services[1] || 'Servicio 2', duration: '90 min', price: '$8.000', icon: ICONS.star.replace('fill="currentColor"', 'fill="none" stroke="currentColor" stroke-width="2"') },
    { name: services[2] || 'Servicio 3', duration: '60 min', price: '$5.500', icon: ICONS.shield },
    { name: services[3] || 'Servicio 4', duration: '30 min', price: '$2.500', icon: ICONS.zap },
  ];

  const css = `
    .scene { width:${w}px; height:${h}px; background:linear-gradient(180deg, #ffffff 0%, ${lighten(p.primaryColor, 0.92)} 100%); display:flex; flex-direction:column; padding:60px; position:relative; overflow:hidden; }
    .deco { position:absolute; width:200px; height:200px; border-radius:50%; background:${withAlpha(p.primaryColor, 0.06)}; }
    .deco-1 { top:-60px; right:-40px; width:300px; height:300px; }
    .deco-2 { bottom:-80px; left:-60px; width:250px; height:250px; }
    .header { text-align:center; margin-bottom:50px; position:relative; z-index:1; }
    .brand-tag { display:inline-block; background:${p.primaryColor}; color:#fff; padding:6px 18px; border-radius:30px; font-size:13px; font-weight:700; margin-bottom:16px; letter-spacing:0.5px; }
    .title { font-size:36px; font-weight:800; color:#1e293b; line-height:1.2; }
    .subtitle { font-size:16px; color:#64748b; margin-top:8px; }
    .cards { display:grid; grid-template-columns:repeat(2,1fr); gap:24px; flex:1; position:relative; z-index:1; }
    .card { background:#ffffff; border-radius:20px; padding:32px; box-shadow:0 4px 20px rgba(0,0,0,0.06); display:flex; flex-direction:column; border:1px solid #f1f5f9; transition:transform 0.2s; }
    .card:nth-child(1) { border-top:4px solid ${p.primaryColor}; }
    .card:nth-child(2) { border-top:4px solid ${p.secondaryColor}; }
    .card:nth-child(3) { border-top:4px solid ${p.accentColor}; }
    .card:nth-child(4) { border-top:4px solid ${darken(p.primaryColor, 0.2)}; }
    .card-icon { width:52px; height:52px; border-radius:14px; display:flex; align-items:center; justify-content:center; margin-bottom:20px; }
    .card:nth-child(1) .card-icon { background:${withAlpha(p.primaryColor, 0.1)}; color:${p.primaryColor}; }
    .card:nth-child(2) .card-icon { background:${withAlpha(p.secondaryColor, 0.1)}; color:${p.secondaryColor}; }
    .card:nth-child(3) .card-icon { background:${withAlpha(p.accentColor, 0.1)}; color:${p.accentColor}; }
    .card:nth-child(4) .card-icon { background:${withAlpha(p.primaryColor, 0.08)}; color:${darken(p.primaryColor, 0.2)}; }
    .card-name { font-size:20px; font-weight:700; color:#1e293b; margin-bottom:8px; }
    .card-meta { display:flex; align-items:center; gap:12px; margin-bottom:auto; }
    .meta-item { display:flex; align-items:center; gap:4px; font-size:13px; color:#64748b; font-weight:500; }
    .meta-icon { width:14px; height:14px; }
    .card-price { font-size:28px; font-weight:800; color:${p.primaryColor}; margin-top:20px; }
    .card-book { margin-top:12px; background:${p.primaryColor}; color:#fff; padding:10px 20px; border-radius:10px; text-align:center; font-size:14px; font-weight:700; }
  `;

  const html = `${htmlHead(w, h, css)}
<div class="scene">
  <div class="deco deco-1"></div>
  <div class="deco deco-2"></div>
  <div class="header">
    <div class="brand-tag">${p.businessName}</div>
    <div class="title">${title}</div>
    <div class="subtitle">${subtitle}</div>
  </div>
  <div class="cards">
    ${serviceData.map(s => `
      <div class="card">
        <div class="card-icon">${s.icon}</div>
        <div class="card-name">${s.name}</div>
        <div class="card-meta">
          <div class="meta-item">${ICONS.clock.replace('width="24"', 'width="14"').replace('height="24"', 'height="14"')} ${s.duration}</div>
        </div>
        <div class="card-price">${s.price}</div>
        <div class="card-book">Reservar</div>
      </div>
    `).join('')}
  </div>
</div>
${htmlFoot}`;

  return { html, width: w, height: h, name: 'Service Cards', description: 'Cards de servicios con precios, duración e íconos profesionales' };
}

// =========================================================================
// SCENE 4: Mobile Booking (1080×1920 story)
// =========================================================================
function mobileBooking(p: SceneParams): SceneOutput {
  const title = p.title || 'Reservá en segundos';
  const subtitle = p.subtitle || 'Desde el celular, sin llamar';
  const w = 1080, h = 1920;
  const css = `
    .scene { width:${w}px; height:${h}px; background:linear-gradient(180deg, ${p.primaryColor} 0%, ${darken(p.primaryColor, 0.4)} 100%); display:flex; flex-direction:column; align-items:center; justify-content:center; padding:80px 60px; position:relative; overflow:hidden; }
    .bg-circle { position:absolute; border-radius:50%; background:${withAlpha('#fff', 0.05)}; }
    .bg-c1 { width:600px; height:600px; top:-200px; right:-200px; }
    .bg-c2 { width:400px; height:400px; bottom:-100px; left:-100px; }
    .top-text { text-align:center; margin-bottom:50px; position:relative; z-index:1; }
    .title { font-size:46px; font-weight:900; color:#fff; line-height:1.15; margin-bottom:12px; }
    .subtitle { font-size:20px; color:${withAlpha('#fff', 0.8)}; font-weight:500; }
    .phone-frame { width:380px; background:#1a1a1a; border-radius:44px; padding:12px; box-shadow:0 30px 80px rgba(0,0,0,0.4); position:relative; z-index:1; }
    .phone-notch { width:140px; height:28px; background:#1a1a1a; border-radius:0 0 16px 16px; position:absolute; top:12px; left:50%; transform:translateX(-50%); z-index:2; }
    .phone-screen { background:#fff; border-radius:34px; overflow:hidden; }
    .screen-header { background:${p.primaryColor}; padding:50px 24px 24px; color:#fff; }
    .screen-brand { font-size:18px; font-weight:800; margin-bottom:4px; }
    .screen-subtitle { font-size:12px; opacity:0.8; }
    .screen-steps { padding:20px; }
    .step-item { display:flex; align-items:center; gap:16px; padding:18px 16px; border-radius:14px; margin-bottom:12px; background:#f8fafc; }
    .step-number { width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:800; color:#fff; flex-shrink:0; }
    .step-1 .step-number { background:${p.primaryColor}; }
    .step-2 .step-number { background:${p.secondaryColor}; }
    .step-3 .step-number { background:${p.accentColor}; }
    .step-text { font-size:14px; font-weight:600; color:#1e293b; }
    .step-desc { font-size:11px; color:#64748b; margin-top:2px; }
    .screen-cta { margin:8px 20px 20px; background:${p.primaryColor}; color:#fff; padding:16px; border-radius:14px; text-align:center; font-size:16px; font-weight:700; }
    .bottom-text { margin-top:50px; text-align:center; color:${withAlpha('#fff', 0.7)}; font-size:16px; font-weight:500; position:relative; z-index:1; }
    .bottom-text strong { color:#fff; font-weight:700; }
    .swipe-indicator { margin-top:20px; display:flex; flex-direction:column; align-items:center; color:${withAlpha('#fff', 0.5)}; font-size:13px; position:relative; z-index:1; }
    .swipe-arrow { width:30px; height:30px; border-left:2px solid ${withAlpha('#fff', 0.5)}; border-top:2px solid ${withAlpha('#fff', 0.5)}; transform:rotate(45deg); margin-bottom:8px; }
  `;

  const html = `${htmlHead(w, h, css)}
<div class="scene">
  <div class="bg-circle bg-c1"></div>
  <div class="bg-circle bg-c2"></div>
  <div class="top-text">
    <div class="title">${title}</div>
    <div class="subtitle">${subtitle}</div>
  </div>
  <div class="phone-frame">
    <div class="phone-notch"></div>
    <div class="phone-screen">
      <div class="screen-header">
        <div class="screen-brand">${p.businessName}</div>
        <div class="screen-subtitle">Reservar turno</div>
      </div>
      <div class="screen-steps">
        <div class="step-item step-1">
          <div class="step-number">1</div>
          <div><div class="step-text">Elegí un servicio</div><div class="step-desc">Corte, color, tratamiento...</div></div>
        </div>
        <div class="step-item step-2">
          <div class="step-number">2</div>
          <div><div class="step-text">Elegí horario</div><div class="step-desc">Disponibilidad en tiempo real</div></div>
        </div>
        <div class="step-item step-3">
          <div class="step-number">3</div>
          <div><div class="step-text">Confirmá tu turno</div><div class="step-desc">Recibís confirmación al instante</div></div>
        </div>
      </div>
      <div class="screen-cta">${p.cta || 'Reservar ahora'}</div>
    </div>
  </div>
  <div class="bottom-text">Probá <strong>${p.businessName}</strong> gratis</div>
  <div class="swipe-indicator">
    <div class="swipe-arrow"></div>
    Deslizá para más
  </div>
</div>
${htmlFoot}`;

  return { html, width: w, height: h, name: 'Mobile Booking', description: 'Flujo de reserva mobile en formato story con frame de teléfono' };
}

// =========================================================================
// SCENE 5: Client Notifications (1080×1080)
// =========================================================================
function clientNotifications(p: SceneParams): SceneOutput {
  const title = p.title || 'Tus clientes siempre informados';
  const subtitle = p.subtitle || p.tagline || 'Notificaciones automáticas en cada paso';
  const w = 1080, h = 1080;
  const css = `
    .scene { width:${w}px; height:${h}px; background:linear-gradient(135deg, ${lighten(p.primaryColor, 0.9)} 0%, #fff 50%, ${lighten(p.accentColor, 0.92)} 100%); display:flex; flex-direction:column; padding:60px; position:relative; overflow:hidden; }
    .header { text-align:center; margin-bottom:40px; position:relative; z-index:1; }
    .brand-tag { display:inline-block; background:${p.primaryColor}; color:#fff; padding:6px 18px; border-radius:30px; font-size:13px; font-weight:700; margin-bottom:16px; }
    .title { font-size:36px; font-weight:800; color:#1e293b; line-height:1.2; }
    .subtitle { font-size:16px; color:#64748b; margin-top:8px; }
    .notifications { display:flex; flex-direction:column; gap:20px; max-width:700px; margin:0 auto; flex:1; justify-content:center; position:relative; z-index:1; }
    .notif { background:#fff; border-radius:20px; padding:28px 32px; box-shadow:0 4px 25px rgba(0,0,0,0.06); display:flex; gap:20px; align-items:flex-start; border-left:5px solid transparent; }
    .notif-1 { border-left-color:${p.primaryColor}; }
    .notif-2 { border-left-color:${p.accentColor}; }
    .notif-3 { border-left-color:${p.secondaryColor}; }
    .notif-icon { width:52px; height:52px; border-radius:14px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .notif-1 .notif-icon { background:${withAlpha(p.primaryColor, 0.1)}; color:${p.primaryColor}; }
    .notif-2 .notif-icon { background:${withAlpha(p.accentColor, 0.1)}; color:${p.accentColor}; }
    .notif-3 .notif-icon { background:${withAlpha(p.secondaryColor, 0.1)}; color:${p.secondaryColor}; }
    .notif-content { flex:1; }
    .notif-title { font-size:16px; font-weight:700; color:#1e293b; margin-bottom:4px; }
    .notif-body { font-size:13px; color:#64748b; line-height:1.5; }
    .notif-time { font-size:11px; color:#94a3b8; margin-top:8px; font-weight:500; }
    .footer-cta { text-align:center; margin-top:auto; padding-top:30px; position:relative; z-index:1; }
    .cta-btn { display:inline-block; background:${p.primaryColor}; color:#fff; padding:14px 40px; border-radius:14px; font-size:16px; font-weight:700; }
  `;

  const html = `${htmlHead(w, h, css)}
<div class="scene">
  <div class="header">
    <div class="brand-tag">${p.businessName}</div>
    <div class="title">${title}</div>
    <div class="subtitle">${subtitle}</div>
  </div>
  <div class="notifications">
    <div class="notif notif-1">
      <div class="notif-icon">${ICONS.check}</div>
      <div class="notif-content">
        <div class="notif-title">Turno confirmado</div>
        <div class="notif-body">Tu turno para Corte de pelo fue confirmado para el Lunes 3 de Marzo a las 10:00 hs.</div>
        <div class="notif-time">Hace 2 minutos</div>
      </div>
    </div>
    <div class="notif notif-2">
      <div class="notif-icon">${ICONS.bell}</div>
      <div class="notif-content">
        <div class="notif-title">Recordatorio 24h</div>
        <div class="notif-body">Recordá que mañana tenés turno a las 10:00 hs. ¡Te esperamos!</div>
        <div class="notif-time">Ayer a las 10:00</div>
      </div>
    </div>
    <div class="notif notif-3">
      <div class="notif-icon">${ICONS.mail}</div>
      <div class="notif-content">
        <div class="notif-title">Email con detalles</div>
        <div class="notif-body">Se envió un email con la dirección, horario y detalles de tu próximo turno.</div>
        <div class="notif-time">Hace 1 hora</div>
      </div>
    </div>
  </div>
  <div class="footer-cta">
    <div class="cta-btn">${p.cta || 'Conocé más'}</div>
  </div>
</div>
${htmlFoot}`;

  return { html, width: w, height: h, name: 'Client Notifications', description: 'Notificaciones automáticas: confirmación, recordatorio y email' };
}

// =========================================================================
// SCENE 6: Professional Profile (1080×1080)
// =========================================================================
function professionalProfile(p: SceneParams): SceneOutput {
  const title = p.title || 'Encontrá al profesional ideal';
  const subtitle = p.subtitle || p.tagline || 'Perfiles verificados con calificaciones reales';
  const w = 1080, h = 1080;
  const css = `
    .scene { width:${w}px; height:${h}px; background:linear-gradient(180deg, ${p.primaryColor} 0%, ${darken(p.primaryColor, 0.35)} 50%, #1e293b 100%); display:flex; flex-direction:column; align-items:center; padding:60px; position:relative; overflow:hidden; }
    .bg-shape { position:absolute; border-radius:50%; opacity:0.06; background:#fff; }
    .bg-s1 { width:500px; height:500px; top:-150px; left:-100px; }
    .header { text-align:center; margin-bottom:40px; position:relative; z-index:1; color:#fff; }
    .title { font-size:36px; font-weight:800; line-height:1.2; margin-bottom:10px; }
    .subtitle { font-size:16px; opacity:0.8; }
    .profile-card { background:#fff; border-radius:24px; padding:40px; width:550px; box-shadow:0 20px 60px rgba(0,0,0,0.3); position:relative; z-index:1; }
    .avatar { width:100px; height:100px; border-radius:50%; background:linear-gradient(135deg, ${p.primaryColor}, ${p.secondaryColor}); display:flex; align-items:center; justify-content:center; color:#fff; margin:0 auto 20px; font-size:36px; font-weight:800; }
    .profile-name { text-align:center; font-size:24px; font-weight:800; color:#1e293b; margin-bottom:4px; }
    .profile-category { text-align:center; font-size:14px; color:${p.primaryColor}; font-weight:600; margin-bottom:12px; }
    .profile-rating { text-align:center; display:flex; align-items:center; justify-content:center; gap:8px; margin-bottom:24px; }
    .rating-stars { display:flex; gap:2px; }
    .rating-text { font-size:14px; color:#64748b; font-weight:500; }
    .profile-services { display:flex; flex-wrap:wrap; gap:8px; justify-content:center; margin-bottom:24px; }
    .service-tag { background:${withAlpha(p.primaryColor, 0.08)}; color:${p.primaryColor}; padding:6px 16px; border-radius:20px; font-size:13px; font-weight:600; }
    .profile-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-bottom:24px; padding:20px 0; border-top:1px solid #f1f5f9; border-bottom:1px solid #f1f5f9; }
    .pstat { text-align:center; }
    .pstat-value { font-size:22px; font-weight:800; color:#1e293b; }
    .pstat-label { font-size:11px; color:#94a3b8; font-weight:500; margin-top:2px; }
    .profile-cta { background:${p.primaryColor}; color:#fff; padding:16px; border-radius:14px; text-align:center; font-size:16px; font-weight:700; }
    .brand-footer { text-align:center; margin-top:auto; padding-top:30px; color:${withAlpha('#fff', 0.5)}; font-size:14px; font-weight:500; position:relative; z-index:1; }
  `;

  const services = p.services && p.services.length > 0
    ? p.services.slice(0, 4)
    : ['Corte', 'Coloración', 'Brushing', 'Tratamiento'];

  const html = `${htmlHead(w, h, css)}
<div class="scene">
  <div class="bg-shape bg-s1"></div>
  <div class="header">
    <div class="title">${title}</div>
    <div class="subtitle">${subtitle}</div>
  </div>
  <div class="profile-card">
    <div class="avatar">MC</div>
    <div class="profile-name">María Castillo</div>
    <div class="profile-category">Estilista profesional</div>
    <div class="profile-rating">
      <div class="rating-stars">${starRating(5, '#f59e0b')}</div>
      <div class="rating-text">4.9 (127 reseñas)</div>
    </div>
    <div class="profile-services">
      ${services.map(s => `<div class="service-tag">${s}</div>`).join('')}
    </div>
    <div class="profile-stats">
      <div class="pstat"><div class="pstat-value">5</div><div class="pstat-label">Años exp.</div></div>
      <div class="pstat"><div class="pstat-value">1.2K</div><div class="pstat-label">Clientes</div></div>
      <div class="pstat"><div class="pstat-value">98%</div><div class="pstat-label">Satisfacción</div></div>
    </div>
    <div class="profile-cta">${p.cta || 'Contactar'}</div>
  </div>
  <div class="brand-footer">Verificado por ${p.businessName}</div>
</div>
${htmlFoot}`;

  return { html, width: w, height: h, name: 'Professional Profile', description: 'Card de perfil profesional con rating, servicios y estadísticas' };
}

// =========================================================================
// SCENE 7: Hero Promo (1080×1080)
// =========================================================================
function heroPromo(p: SceneParams): SceneOutput {
  const title = p.title || p.businessName;
  const subtitle = p.subtitle || p.tagline || 'La mejor forma de gestionar tu negocio';
  const desc = p.description || 'Turnos online, gestión de clientes, y mucho más. Todo en un solo lugar.';
  const w = 1080, h = 1080;
  const css = `
    .scene { width:${w}px; height:${h}px; background:linear-gradient(135deg, ${p.primaryColor} 0%, ${p.secondaryColor} 50%, ${darken(p.primaryColor, 0.3)} 100%); display:flex; flex-direction:column; justify-content:center; padding:80px; color:#fff; position:relative; overflow:hidden; }
    .shape { position:absolute; border-radius:50%; }
    .shape-1 { width:400px; height:400px; background:${withAlpha(p.accentColor, 0.15)}; top:-100px; right:-100px; }
    .shape-2 { width:300px; height:300px; background:${withAlpha('#fff', 0.05)}; bottom:-80px; left:-80px; }
    .shape-3 { width:200px; height:200px; background:${withAlpha(p.accentColor, 0.1)}; top:40%; left:-50px; }
    .shape-4 { width:150px; height:150px; border:3px solid ${withAlpha('#fff', 0.1)}; top:20%; right:10%; }
    .content { position:relative; z-index:1; }
    .eyebrow { display:inline-block; background:${withAlpha('#fff', 0.2)}; color:#fff; padding:8px 20px; border-radius:30px; font-size:14px; font-weight:700; margin-bottom:30px; backdrop-filter:blur(4px); }
    .title { font-size:58px; font-weight:900; line-height:1.05; margin-bottom:20px; letter-spacing:-1px; }
    .subtitle { font-size:22px; opacity:0.9; margin-bottom:16px; font-weight:600; line-height:1.4; }
    .desc { font-size:17px; opacity:0.7; line-height:1.6; max-width:700px; margin-bottom:40px; }
    .cta-row { display:flex; gap:16px; }
    .cta-primary { background:#fff; color:${p.primaryColor}; padding:18px 40px; border-radius:14px; font-size:18px; font-weight:800; }
    .cta-secondary { background:${withAlpha('#fff', 0.15)}; color:#fff; padding:18px 40px; border-radius:14px; font-size:18px; font-weight:700; border:2px solid ${withAlpha('#fff', 0.3)}; }
  `;

  const html = `${htmlHead(w, h, css)}
<div class="scene">
  <div class="shape shape-1"></div>
  <div class="shape shape-2"></div>
  <div class="shape shape-3"></div>
  <div class="shape shape-4"></div>
  <div class="content">
    <div class="eyebrow">#1 en gestión comercial</div>
    <div class="title">${title}</div>
    <div class="subtitle">${subtitle}</div>
    <div class="desc">${desc}</div>
    <div class="cta-row">
      <div class="cta-primary">${p.cta || 'Empezar gratis'}</div>
      <div class="cta-secondary">Ver demo</div>
    </div>
  </div>
</div>
${htmlFoot}`;

  return { html, width: w, height: h, name: 'Hero Promo', description: 'Imagen hero tipo landing con título, subtítulo, CTA y shapes decorativas' };
}

// =========================================================================
// SCENE 8: Feature Highlight (1080×1080)
// =========================================================================
function featureHighlight(p: SceneParams): SceneOutput {
  const title = p.title || 'Todo lo que necesitás';
  const subtitle = p.subtitle || p.tagline || `${p.businessName} simplifica la gestión de tu negocio`;
  const w = 1080, h = 1080;
  const css = `
    .scene { width:${w}px; height:${h}px; background:#fff; display:flex; flex-direction:column; padding:60px; position:relative; overflow:hidden; }
    .top-bar { position:absolute; top:0; left:0; right:0; height:5px; background:linear-gradient(90deg, ${p.primaryColor}, ${p.secondaryColor}, ${p.accentColor}); }
    .header { text-align:center; margin-bottom:50px; }
    .brand-tag { display:inline-flex; align-items:center; gap:8px; background:${withAlpha(p.primaryColor, 0.08)}; color:${p.primaryColor}; padding:8px 20px; border-radius:30px; font-size:14px; font-weight:700; margin-bottom:20px; }
    .title { font-size:40px; font-weight:800; color:#1e293b; line-height:1.2; }
    .subtitle { font-size:17px; color:#64748b; margin-top:10px; }
    .features { display:grid; grid-template-columns:repeat(3,1fr); gap:32px; flex:1; align-content:start; }
    .feature { text-align:center; padding:32px 20px; border-radius:20px; background:#f8fafc; border:1px solid #f1f5f9; }
    .feature-icon { width:64px; height:64px; border-radius:18px; display:flex; align-items:center; justify-content:center; margin:0 auto 20px; }
    .f1 .feature-icon { background:linear-gradient(135deg, ${p.primaryColor}, ${lighten(p.primaryColor, 0.2)}); color:#fff; }
    .f2 .feature-icon { background:linear-gradient(135deg, ${p.secondaryColor}, ${lighten(p.secondaryColor, 0.2)}); color:#fff; }
    .f3 .feature-icon { background:linear-gradient(135deg, ${p.accentColor}, ${lighten(p.accentColor, 0.2)}); color:#fff; }
    .feature-title { font-size:18px; font-weight:700; color:#1e293b; margin-bottom:10px; }
    .feature-desc { font-size:14px; color:#64748b; line-height:1.6; }
    .bottom { text-align:center; margin-top:auto; padding-top:30px; }
    .bottom-cta { display:inline-block; background:${p.primaryColor}; color:#fff; padding:16px 40px; border-radius:14px; font-size:16px; font-weight:700; }
  `;

  const html = `${htmlHead(w, h, css)}
<div class="scene">
  <div class="top-bar"></div>
  <div class="header">
    <div class="brand-tag">${p.businessName}</div>
    <div class="title">${title}</div>
    <div class="subtitle">${subtitle}</div>
  </div>
  <div class="features">
    <div class="feature f1">
      <div class="feature-icon">${ICONS.calendar}</div>
      <div class="feature-title">Agenda online</div>
      <div class="feature-desc">Tus clientes reservan 24/7 desde cualquier dispositivo. Sin llamadas ni WhatsApp.</div>
    </div>
    <div class="feature f2">
      <div class="feature-icon">${ICONS.chart}</div>
      <div class="feature-title">Métricas en tiempo real</div>
      <div class="feature-desc">Dashboard con ingresos, turnos y clientes. Tomá decisiones basadas en datos.</div>
    </div>
    <div class="feature f3">
      <div class="feature-icon">${ICONS.bell}</div>
      <div class="feature-title">Recordatorios auto</div>
      <div class="feature-desc">Reducí el ausentismo con recordatorios automáticos por email y notificación.</div>
    </div>
  </div>
  <div class="bottom">
    <div class="bottom-cta">${p.cta || 'Probá gratis'}</div>
  </div>
</div>
${htmlFoot}`;

  return { html, width: w, height: h, name: 'Feature Highlight', description: 'Tres features principales con íconos, título y descripción' };
}

// =========================================================================
// SCENE 9: Testimonial Card (1080×1080)
// =========================================================================
function testimonialCard(p: SceneParams): SceneOutput {
  const title = p.title || 'Lo que dicen nuestros clientes';
  const w = 1080, h = 1080;
  const css = `
    .scene { width:${w}px; height:${h}px; background:linear-gradient(135deg, ${lighten(p.primaryColor, 0.88)} 0%, #fff 50%, ${lighten(p.secondaryColor, 0.9)} 100%); display:flex; flex-direction:column; align-items:center; justify-content:center; padding:80px; position:relative; overflow:hidden; }
    .quote-marks { position:absolute; font-size:300px; font-weight:900; color:${withAlpha(p.primaryColor, 0.06)}; line-height:1; top:40px; left:50px; font-family:Georgia,serif; }
    .content { position:relative; z-index:1; text-align:center; max-width:800px; }
    .header-text { font-size:16px; color:${p.primaryColor}; font-weight:700; margin-bottom:40px; text-transform:uppercase; letter-spacing:2px; }
    .quote { font-size:30px; font-weight:600; color:#1e293b; line-height:1.5; margin-bottom:40px; font-style:italic; }
    .divider { width:60px; height:4px; background:${p.primaryColor}; border-radius:4px; margin:0 auto 30px; }
    .author { display:flex; flex-direction:column; align-items:center; gap:12px; }
    .author-avatar { width:64px; height:64px; border-radius:50%; background:linear-gradient(135deg, ${p.primaryColor}, ${p.secondaryColor}); display:flex; align-items:center; justify-content:center; color:#fff; font-size:24px; font-weight:800; }
    .author-name { font-size:18px; font-weight:700; color:#1e293b; }
    .author-role { font-size:14px; color:#64748b; }
    .author-rating { display:flex; gap:2px; margin-top:4px; }
    .brand-footer { position:absolute; bottom:40px; left:0; right:0; text-align:center; color:#94a3b8; font-size:14px; font-weight:500; }
    .brand-footer strong { color:${p.primaryColor}; }
  `;

  const html = `${htmlHead(w, h, css)}
<div class="scene">
  <div class="quote-marks">&ldquo;</div>
  <div class="content">
    <div class="header-text">${title}</div>
    <div class="quote">"Desde que uso ${p.businessName}, mis clientes reservan solos y yo puedo enfocarme en lo que importa. Reduje el ausentismo un 40% y mis ingresos crecieron un 25%."</div>
    <div class="divider"></div>
    <div class="author">
      <div class="author-avatar">LG</div>
      <div class="author-name">Laura González</div>
      <div class="author-role">Dueña de estética — Buenos Aires</div>
      <div class="author-rating">${starRating(5, '#f59e0b')}</div>
    </div>
  </div>
  <div class="brand-footer">Cliente de <strong>${p.businessName}</strong></div>
</div>
${htmlFoot}`;

  return { html, width: w, height: h, name: 'Testimonial Card', description: 'Testimonio de cliente con quote, foto, nombre y rating 5 estrellas' };
}

// =========================================================================
// SCENE 10: Pricing Table (1080×1080)
// =========================================================================
function pricingTable(p: SceneParams): SceneOutput {
  const title = p.title || 'Planes que se adaptan a vos';
  const subtitle = p.subtitle || 'Sin sorpresas. Cancelá cuando quieras.';
  const w = 1080, h = 1080;
  const css = `
    .scene { width:${w}px; height:${h}px; background:#f8fafc; display:flex; flex-direction:column; padding:50px; position:relative; overflow:hidden; }
    .header { text-align:center; margin-bottom:40px; }
    .brand-tag { display:inline-block; background:${p.primaryColor}; color:#fff; padding:6px 18px; border-radius:30px; font-size:13px; font-weight:700; margin-bottom:16px; }
    .title { font-size:38px; font-weight:800; color:#1e293b; }
    .subtitle { font-size:16px; color:#64748b; margin-top:8px; }
    .plans { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; flex:1; align-items:start; }
    .plan { background:#fff; border-radius:20px; padding:32px 28px; box-shadow:0 4px 20px rgba(0,0,0,0.04); border:2px solid #f1f5f9; display:flex; flex-direction:column; height:100%; }
    .plan-featured { border-color:${p.primaryColor}; box-shadow:0 8px 40px ${withAlpha(p.primaryColor, 0.15)}; position:relative; transform:scale(1.03); }
    .plan-badge { position:absolute; top:-14px; left:50%; transform:translateX(-50%); background:${p.primaryColor}; color:#fff; padding:4px 16px; border-radius:20px; font-size:12px; font-weight:700; white-space:nowrap; }
    .plan-name { font-size:20px; font-weight:700; color:#1e293b; margin-bottom:8px; }
    .plan-price { display:flex; align-items:baseline; gap:4px; margin-bottom:6px; }
    .plan-amount { font-size:42px; font-weight:900; color:#1e293b; }
    .plan-period { font-size:14px; color:#94a3b8; font-weight:500; }
    .plan-desc { font-size:13px; color:#64748b; margin-bottom:24px; line-height:1.4; }
    .plan-features { list-style:none; display:flex; flex-direction:column; gap:12px; margin-bottom:auto; padding-bottom:24px; }
    .plan-feature { display:flex; align-items:center; gap:10px; font-size:14px; color:#475569; }
    .plan-check { width:20px; height:20px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .check-primary { background:${withAlpha(p.primaryColor, 0.1)}; color:${p.primaryColor}; }
    .check-accent { background:${withAlpha(p.accentColor, 0.1)}; color:${p.accentColor}; }
    .plan-cta { padding:14px; border-radius:12px; text-align:center; font-size:15px; font-weight:700; margin-top:20px; }
    .cta-outline { border:2px solid ${p.primaryColor}; color:${p.primaryColor}; background:transparent; }
    .cta-filled { background:${p.primaryColor}; color:#fff; border:2px solid ${p.primaryColor}; }
  `;

  const checkIcon = ICONS.check.replace('width="24"', 'width="12"').replace('height="24"', 'height="12"');

  const html = `${htmlHead(w, h, css)}
<div class="scene">
  <div class="header">
    <div class="brand-tag">${p.businessName}</div>
    <div class="title">${title}</div>
    <div class="subtitle">${subtitle}</div>
  </div>
  <div class="plans">
    <div class="plan">
      <div class="plan-name">Starter</div>
      <div class="plan-price"><span class="plan-amount">$0</span><span class="plan-period">/mes</span></div>
      <div class="plan-desc">Ideal para empezar</div>
      <div class="plan-features">
        <div class="plan-feature"><div class="plan-check check-primary">${checkIcon}</div> Hasta 50 turnos/mes</div>
        <div class="plan-feature"><div class="plan-check check-primary">${checkIcon}</div> 1 profesional</div>
        <div class="plan-feature"><div class="plan-check check-primary">${checkIcon}</div> Recordatorios email</div>
        <div class="plan-feature"><div class="plan-check check-primary">${checkIcon}</div> Página de reservas</div>
      </div>
      <div class="plan-cta cta-outline">Empezar gratis</div>
    </div>
    <div class="plan plan-featured">
      <div class="plan-badge">MÁS POPULAR</div>
      <div class="plan-name">Profesional</div>
      <div class="plan-price"><span class="plan-amount">$29</span><span class="plan-period">/mes</span></div>
      <div class="plan-desc">Para negocios en crecimiento</div>
      <div class="plan-features">
        <div class="plan-feature"><div class="plan-check check-accent">${checkIcon}</div> Turnos ilimitados</div>
        <div class="plan-feature"><div class="plan-check check-accent">${checkIcon}</div> 5 profesionales</div>
        <div class="plan-feature"><div class="plan-check check-accent">${checkIcon}</div> Recordatorios SMS + email</div>
        <div class="plan-feature"><div class="plan-check check-accent">${checkIcon}</div> Dashboard analytics</div>
        <div class="plan-feature"><div class="plan-check check-accent">${checkIcon}</div> Página personalizada</div>
      </div>
      <div class="plan-cta cta-filled">${p.cta || 'Elegir plan'}</div>
    </div>
    <div class="plan">
      <div class="plan-name">Enterprise</div>
      <div class="plan-price"><span class="plan-amount">$79</span><span class="plan-period">/mes</span></div>
      <div class="plan-desc">Múltiples sucursales</div>
      <div class="plan-features">
        <div class="plan-feature"><div class="plan-check check-primary">${checkIcon}</div> Todo de Profesional</div>
        <div class="plan-feature"><div class="plan-check check-primary">${checkIcon}</div> Sucursales ilimitadas</div>
        <div class="plan-feature"><div class="plan-check check-primary">${checkIcon}</div> Profesionales ilimitados</div>
        <div class="plan-feature"><div class="plan-check check-primary">${checkIcon}</div> API access</div>
        <div class="plan-feature"><div class="plan-check check-primary">${checkIcon}</div> Soporte prioritario</div>
      </div>
      <div class="plan-cta cta-outline">Contactar ventas</div>
    </div>
  </div>
</div>
${htmlFoot}`;

  return { html, width: w, height: h, name: 'Pricing Table', description: 'Tabla de 3 planes con features, precios y CTA destacado' };
}

// =========================================================================
// SCENE 11: Story Promo (1080×1920 story)
// =========================================================================
function storyPromo(p: SceneParams): SceneOutput {
  const title = p.title || p.businessName;
  const subtitle = p.subtitle || p.tagline || 'Reservá tu turno online';
  const w = 1080, h = 1920;
  const css = `
    .scene { width:${w}px; height:${h}px; background:linear-gradient(180deg, ${p.primaryColor} 0%, ${darken(p.primaryColor, 0.25)} 40%, ${darken(p.secondaryColor, 0.3)} 100%); display:flex; flex-direction:column; align-items:center; justify-content:space-between; padding:100px 70px; color:#fff; position:relative; overflow:hidden; }
    .bg-shape { position:absolute; border-radius:50%; background:${withAlpha('#fff', 0.04)}; }
    .bg-1 { width:800px; height:800px; top:-300px; left:-200px; }
    .bg-2 { width:600px; height:600px; bottom:-200px; right:-200px; }
    .top { text-align:center; position:relative; z-index:1; }
    .logo-ring { width:120px; height:120px; border-radius:50%; border:4px solid ${withAlpha('#fff', 0.3)}; display:flex; align-items:center; justify-content:center; margin:0 auto 30px; font-size:40px; font-weight:900; background:${withAlpha('#fff', 0.1)}; backdrop-filter:blur(8px); }
    .title { font-size:62px; font-weight:900; line-height:1.05; letter-spacing:-1.5px; margin-bottom:16px; }
    .subtitle { font-size:24px; opacity:0.85; font-weight:500; line-height:1.4; }
    .middle { position:relative; z-index:1; display:flex; flex-direction:column; align-items:center; gap:20px; }
    .feature-pill { background:${withAlpha('#fff', 0.15)}; padding:14px 30px; border-radius:50px; font-size:18px; font-weight:600; backdrop-filter:blur(4px); display:flex; align-items:center; gap:10px; border:1px solid ${withAlpha('#fff', 0.1)}; }
    .pill-icon { color:${p.accentColor}; display:flex; }
    .bottom { text-align:center; position:relative; z-index:1; }
    .cta-btn { background:#fff; color:${p.primaryColor}; padding:22px 60px; border-radius:60px; font-size:22px; font-weight:800; margin-bottom:30px; display:inline-block; }
    .swipe { display:flex; flex-direction:column; align-items:center; gap:8px; opacity:0.6; }
    .swipe-arrow { width:24px; height:24px; border-right:3px solid #fff; border-bottom:3px solid #fff; transform:rotate(225deg); }
    .swipe-text { font-size:14px; font-weight:500; }
  `;

  const html = `${htmlHead(w, h, css)}
<div class="scene">
  <div class="bg-shape bg-1"></div>
  <div class="bg-shape bg-2"></div>
  <div class="top">
    <div class="logo-ring">${title.charAt(0)}</div>
    <div class="title">${title}</div>
    <div class="subtitle">${subtitle}</div>
  </div>
  <div class="middle">
    <div class="feature-pill"><span class="pill-icon">${ICONS.calendar.replace('width="24"', 'width="20"').replace('height="24"', 'height="20"')}</span> Reservas 24/7</div>
    <div class="feature-pill"><span class="pill-icon">${ICONS.bell.replace('width="24"', 'width="20"').replace('height="24"', 'height="20"')}</span> Recordatorios automáticos</div>
    <div class="feature-pill"><span class="pill-icon">${ICONS.smartphone.replace('width="24"', 'width="20"').replace('height="24"', 'height="20"')}</span> Desde cualquier dispositivo</div>
  </div>
  <div class="bottom">
    <div class="cta-btn">${p.cta || 'Empezar gratis'}</div>
    <div class="swipe">
      <div class="swipe-arrow"></div>
      <div class="swipe-text">Deslizá para más</div>
    </div>
  </div>
</div>
${htmlFoot}`;

  return { html, width: w, height: h, name: 'Story Promo', description: 'Story vertical con gradiente, CTA e indicador swipe up' };
}

// =========================================================================
// SCENE 12: Before/After (1080×1080)
// =========================================================================
function beforeAfter(p: SceneParams): SceneOutput {
  const title = p.title || 'La transformación digital de tu negocio';
  const w = 1080, h = 1080;
  const css = `
    .scene { width:${w}px; height:${h}px; display:flex; flex-direction:column; overflow:hidden; }
    .header { background:${p.primaryColor}; padding:30px 50px; text-align:center; color:#fff; }
    .title { font-size:30px; font-weight:800; }
    .comparison { flex:1; display:grid; grid-template-columns:1fr 1fr; }
    .side { padding:36px 40px; display:flex; flex-direction:column; }
    .before { background:#fef2f2; }
    .after { background:#f0fdf4; }
    .side-label { display:inline-flex; align-items:center; justify-content:center; padding:8px 24px; border-radius:30px; font-size:14px; font-weight:800; margin-bottom:28px; text-transform:uppercase; letter-spacing:1px; align-self:flex-start; }
    .before .side-label { background:#fee2e2; color:#dc2626; }
    .after .side-label { background:#dcfce7; color:#16a34a; }
    .items { display:flex; flex-direction:column; gap:18px; flex:1; }
    .item { display:flex; align-items:flex-start; gap:14px; }
    .item-icon { width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:20px; }
    .before .item-icon { background:#fee2e2; color:#dc2626; }
    .after .item-icon { background:#dcfce7; color:#16a34a; }
    .item-text { font-size:15px; font-weight:600; color:#374151; line-height:1.4; }
    .item-desc { font-size:12px; color:#6b7280; margin-top:2px; }
    .divider { position:absolute; left:50%; top:80px; bottom:0; width:4px; background:linear-gradient(180deg, ${p.primaryColor}, ${p.accentColor}); transform:translateX(-50%); z-index:1; }
    .vs-badge { position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); width:50px; height:50px; border-radius:50%; background:${p.primaryColor}; color:#fff; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:900; z-index:2; box-shadow:0 4px 15px ${withAlpha(p.primaryColor, 0.4)}; }
    .footer { background:#fff; padding:20px 50px; text-align:center; }
    .footer-text { font-size:14px; color:#64748b; }
    .footer-text strong { color:${p.primaryColor}; }
    .footer-cta { display:inline-block; background:${p.primaryColor}; color:#fff; padding:10px 30px; border-radius:10px; font-size:14px; font-weight:700; margin-top:10px; }
    .scene-inner { position:relative; flex:1; display:flex; flex-direction:column; }
  `;

  const html = `${htmlHead(w, h, css)}
<div class="scene">
  <div class="header">
    <div class="title">${title}</div>
  </div>
  <div class="scene-inner">
    <div class="divider"></div>
    <div class="vs-badge">VS</div>
    <div class="comparison">
      <div class="side before">
        <div class="side-label">Sin ${p.businessName}</div>
        <div class="items">
          <div class="item">
            <div class="item-icon">✗</div>
            <div><div class="item-text">Agenda en papel</div><div class="item-desc">Errores, tachaduras, confusión</div></div>
          </div>
          <div class="item">
            <div class="item-icon">✗</div>
            <div><div class="item-text">Llamadas todo el día</div><div class="item-desc">Perdés tiempo y clientes</div></div>
          </div>
          <div class="item">
            <div class="item-icon">✗</div>
            <div><div class="item-text">Clientes que no vienen</div><div class="item-desc">Sin recordatorios, alto ausentismo</div></div>
          </div>
          <div class="item">
            <div class="item-icon">✗</div>
            <div><div class="item-text">Sin datos del negocio</div><div class="item-desc">Decisiones a ciegas</div></div>
          </div>
          <div class="item">
            <div class="item-icon">✗</div>
            <div><div class="item-text">Horario limitado</div><div class="item-desc">Solo reservan cuando atendés</div></div>
          </div>
        </div>
      </div>
      <div class="side after">
        <div class="side-label">Con ${p.businessName}</div>
        <div class="items">
          <div class="item">
            <div class="item-icon">✓</div>
            <div><div class="item-text">Agenda digital</div><div class="item-desc">Organizada, visual, sin errores</div></div>
          </div>
          <div class="item">
            <div class="item-icon">✓</div>
            <div><div class="item-text">Reservas online 24/7</div><div class="item-desc">Tus clientes reservan solos</div></div>
          </div>
          <div class="item">
            <div class="item-icon">✓</div>
            <div><div class="item-text">Recordatorios automáticos</div><div class="item-desc">-40% ausentismo garantizado</div></div>
          </div>
          <div class="item">
            <div class="item-icon">✓</div>
            <div><div class="item-text">Dashboard con métricas</div><div class="item-desc">Datos reales para crecer</div></div>
          </div>
          <div class="item">
            <div class="item-icon">✓</div>
            <div><div class="item-text">Disponible siempre</div><div class="item-desc">Reservas a cualquier hora</div></div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="footer">
    <div class="footer-text">Más de <strong>500 negocios</strong> ya hicieron el cambio</div>
    <div class="footer-cta">${p.cta || 'Empezar ahora'}</div>
  </div>
</div>
${htmlFoot}`;

  return { html, width: w, height: h, name: 'Before/After', description: 'Comparación visual: sin vs con TurnoLink — transformación digital' };
}

// =========================================================================
// SCENE 13: Stats Banner (1200×628)
// =========================================================================
function statsBanner(p: SceneParams): SceneOutput {
  const title = p.title || 'Resultados que hablan por sí solos';
  const w = 1200, h = 628;
  const css = `
    .scene { width:${w}px; height:${h}px; background:linear-gradient(135deg, ${p.primaryColor} 0%, ${darken(p.primaryColor, 0.25)} 50%, ${p.secondaryColor} 100%); display:flex; flex-direction:column; justify-content:center; padding:50px 70px; color:#fff; position:relative; overflow:hidden; }
    .bg-dots { position:absolute; inset:0; background-image:radial-gradient(${withAlpha('#fff', 0.07)} 1px, transparent 1px); background-size:24px 24px; }
    .content { position:relative; z-index:1; }
    .top-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:40px; }
    .brand { font-size:24px; font-weight:800; }
    .title { font-size:32px; font-weight:800; line-height:1.2; max-width:500px; }
    .stats { display:grid; grid-template-columns:repeat(4,1fr); gap:30px; }
    .stat { text-align:center; padding:24px 16px; background:${withAlpha('#fff', 0.1)}; border-radius:16px; backdrop-filter:blur(4px); border:1px solid ${withAlpha('#fff', 0.1)}; }
    .stat-icon { margin:0 auto 12px; width:44px; height:44px; border-radius:12px; background:${withAlpha('#fff', 0.15)}; display:flex; align-items:center; justify-content:center; color:#fff; }
    .stat-value { font-size:36px; font-weight:900; margin-bottom:4px; }
    .stat-label { font-size:13px; opacity:0.75; font-weight:500; }
    .footer-row { display:flex; justify-content:space-between; align-items:center; margin-top:30px; }
    .cta-btn { background:#fff; color:${p.primaryColor}; padding:12px 30px; border-radius:10px; font-size:15px; font-weight:700; }
    .url-text { font-size:14px; opacity:0.6; }
  `;

  const html = `${htmlHead(w, h, css)}
<div class="scene">
  <div class="bg-dots"></div>
  <div class="content">
    <div class="top-row">
      <div class="brand">${p.businessName}</div>
      <div class="title">${title}</div>
    </div>
    <div class="stats">
      <div class="stat">
        <div class="stat-icon">${ICONS.calendar.replace('width="24"', 'width="22"').replace('height="24"', 'height="22"')}</div>
        <div class="stat-value">+50K</div>
        <div class="stat-label">Turnos gestionados</div>
      </div>
      <div class="stat">
        <div class="stat-icon">${ICONS.users.replace('width="24"', 'width="22"').replace('height="24"', 'height="22"')}</div>
        <div class="stat-value">2.5K</div>
        <div class="stat-label">Negocios activos</div>
      </div>
      <div class="stat">
        <div class="stat-icon">${ICONS.star.replace('width="24"', 'width="22"').replace('height="24"', 'height="22"').replace('fill="currentColor"', 'fill="white"')}</div>
        <div class="stat-value">98%</div>
        <div class="stat-label">Satisfacción</div>
      </div>
      <div class="stat">
        <div class="stat-icon">${ICONS.clock.replace('width="24"', 'width="22"').replace('height="24"', 'height="22"')}</div>
        <div class="stat-value">24/7</div>
        <div class="stat-label">Disponible</div>
      </div>
    </div>
    <div class="footer-row">
      <div class="cta-btn">${p.cta || 'Probá gratis'}</div>
      <div class="url-text">turnolink.com</div>
    </div>
  </div>
</div>
${htmlFoot}`;

  return { html, width: w, height: h, name: 'Stats Banner', description: 'Banner horizontal con estadísticas impactantes y gradiente' };
}

// =========================================================================
// SCENE 14: Launch Announcement (1080×1080)
// =========================================================================
function launchAnnouncement(p: SceneParams): SceneOutput {
  const title = p.title || 'Reservas Online';
  const subtitle = p.subtitle || 'Tus clientes ahora pueden reservar desde el celular, 24/7';
  const desc = p.description || 'Sistema de turnos inteligente con confirmación automática, recordatorios y seguimiento en tiempo real.';
  const w = 1080, h = 1080;
  const css = `
    .scene { width:${w}px; height:${h}px; background:#0f172a; display:flex; flex-direction:column; padding:60px; color:#fff; position:relative; overflow:hidden; }
    .glow { position:absolute; width:500px; height:500px; border-radius:50%; filter:blur(120px); opacity:0.3; }
    .glow-1 { background:${p.primaryColor}; top:-150px; right:-100px; }
    .glow-2 { background:${p.secondaryColor}; bottom:-200px; left:-100px; }
    .top-bar { display:flex; justify-content:space-between; align-items:center; margin-bottom:50px; position:relative; z-index:1; }
    .brand { font-size:22px; font-weight:800; }
    .new-badge { background:${p.accentColor}; color:#fff; padding:8px 20px; border-radius:30px; font-size:13px; font-weight:800; letter-spacing:1px; text-transform:uppercase; }
    .content { position:relative; z-index:1; flex:1; display:flex; flex-direction:column; justify-content:center; }
    .label { color:${p.accentColor}; font-size:15px; font-weight:700; margin-bottom:16px; text-transform:uppercase; letter-spacing:2px; }
    .title { font-size:52px; font-weight:900; line-height:1.1; margin-bottom:20px; letter-spacing:-1px; }
    .title span { background:linear-gradient(135deg, ${p.primaryColor}, ${p.accentColor}); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
    .subtitle { font-size:20px; color:#94a3b8; line-height:1.5; margin-bottom:16px; }
    .desc { font-size:15px; color:#64748b; line-height:1.6; margin-bottom:40px; max-width:700px; }
    .feature-row { display:flex; gap:16px; margin-bottom:40px; flex-wrap:wrap; }
    .feature-chip { background:${withAlpha(p.primaryColor, 0.15)}; border:1px solid ${withAlpha(p.primaryColor, 0.3)}; color:${lighten(p.primaryColor, 0.4)}; padding:10px 20px; border-radius:12px; font-size:14px; font-weight:600; display:flex; align-items:center; gap:8px; }
    .chip-dot { width:8px; height:8px; border-radius:50%; background:${p.accentColor}; }
    .cta-row { display:flex; gap:16px; align-items:center; }
    .cta-primary { background:linear-gradient(135deg, ${p.primaryColor}, ${p.secondaryColor}); color:#fff; padding:18px 40px; border-radius:14px; font-size:18px; font-weight:800; }
    .cta-link { color:${p.primaryColor}; font-size:16px; font-weight:600; }
  `;

  const html = `${htmlHead(w, h, css)}
<div class="scene">
  <div class="glow glow-1"></div>
  <div class="glow glow-2"></div>
  <div class="top-bar">
    <div class="brand">${p.businessName}</div>
    <div class="new-badge">NUEVO</div>
  </div>
  <div class="content">
    <div class="label">Nuevo Feature</div>
    <div class="title"><span>${title}</span></div>
    <div class="subtitle">${subtitle}</div>
    <div class="desc">${desc}</div>
    <div class="feature-row">
      <div class="feature-chip"><div class="chip-dot"></div> Confirmación instantánea</div>
      <div class="feature-chip"><div class="chip-dot"></div> Recordatorios automáticos</div>
      <div class="feature-chip"><div class="chip-dot"></div> Dashboard en tiempo real</div>
    </div>
    <div class="cta-row">
      <div class="cta-primary">${p.cta || 'Activar ahora'}</div>
      <div class="cta-link">Saber más →</div>
    </div>
  </div>
</div>
${htmlFoot}`;

  return { html, width: w, height: h, name: 'Launch Announcement', description: 'Anuncio de nuevo feature con badge NUEVO, gradientes y dark theme' };
}

// =========================================================================
// Registry & Public API
// =========================================================================

const SCENE_REGISTRY: Record<string, {
  fn: (p: SceneParams) => SceneOutput;
  info: SceneInfo;
}> = {
  dashboardOverview: {
    fn: dashboardOverview,
    info: { id: 'dashboardOverview', name: 'Dashboard Overview', description: 'Vista del dashboard con estadísticas y gráfico semanal', category: 'product', format: 'post', width: 1080, height: 1080 },
  },
  bookingCalendar: {
    fn: bookingCalendar,
    info: { id: 'bookingCalendar', name: 'Booking Calendar', description: 'Calendario semanal con turnos y disponibilidad', category: 'product', format: 'post', width: 1080, height: 1080 },
  },
  serviceCards: {
    fn: serviceCards,
    info: { id: 'serviceCards', name: 'Service Cards', description: 'Cards de servicios con precios y duración', category: 'product', format: 'post', width: 1080, height: 1080 },
  },
  mobileBooking: {
    fn: mobileBooking,
    info: { id: 'mobileBooking', name: 'Mobile Booking', description: 'Flujo de reserva mobile en formato story', category: 'product', format: 'story', width: 1080, height: 1920 },
  },
  clientNotifications: {
    fn: clientNotifications,
    info: { id: 'clientNotifications', name: 'Client Notifications', description: 'Notificaciones automáticas de turnos', category: 'product', format: 'post', width: 1080, height: 1080 },
  },
  professionalProfile: {
    fn: professionalProfile,
    info: { id: 'professionalProfile', name: 'Professional Profile', description: 'Card de perfil profesional con rating y servicios', category: 'product', format: 'post', width: 1080, height: 1080 },
  },
  heroPromo: {
    fn: heroPromo,
    info: { id: 'heroPromo', name: 'Hero Promo', description: 'Imagen hero con título, subtítulo y CTA', category: 'promo', format: 'post', width: 1080, height: 1080 },
  },
  featureHighlight: {
    fn: featureHighlight,
    info: { id: 'featureHighlight', name: 'Feature Highlight', description: 'Tres features con íconos y descripción', category: 'promo', format: 'post', width: 1080, height: 1080 },
  },
  testimonialCard: {
    fn: testimonialCard,
    info: { id: 'testimonialCard', name: 'Testimonial Card', description: 'Testimonio de cliente con quote y rating', category: 'promo', format: 'post', width: 1080, height: 1080 },
  },
  pricingTable: {
    fn: pricingTable,
    info: { id: 'pricingTable', name: 'Pricing Table', description: 'Tabla de planes con precios y features', category: 'promo', format: 'post', width: 1080, height: 1080 },
  },
  storyPromo: {
    fn: storyPromo,
    info: { id: 'storyPromo', name: 'Story Promo', description: 'Story vertical con gradiente y CTA', category: 'promo', format: 'story', width: 1080, height: 1920 },
  },
  beforeAfter: {
    fn: beforeAfter,
    info: { id: 'beforeAfter', name: 'Before/After', description: 'Comparación: sin vs con la plataforma', category: 'promo', format: 'post', width: 1080, height: 1080 },
  },
  statsBanner: {
    fn: statsBanner,
    info: { id: 'statsBanner', name: 'Stats Banner', description: 'Banner horizontal con estadísticas impactantes', category: 'promo', format: 'banner', width: 1200, height: 628 },
  },
  launchAnnouncement: {
    fn: launchAnnouncement,
    info: { id: 'launchAnnouncement', name: 'Launch Announcement', description: 'Anuncio de nuevo feature con dark theme', category: 'promo', format: 'post', width: 1080, height: 1080 },
  },
};

export function listScenes(): SceneInfo[] {
  return Object.values(SCENE_REGISTRY).map((entry) => entry.info);
}

export function getScene(sceneId: string): SceneInfo | null {
  return SCENE_REGISTRY[sceneId]?.info || null;
}

export function generateSceneHtml(
  sceneId: string,
  params: SceneParams
): { html: string; width: number; height: number } | null {
  const entry = SCENE_REGISTRY[sceneId];
  if (!entry) return null;
  const output = entry.fn(params);
  return { html: output.html, width: output.width, height: output.height };
}
