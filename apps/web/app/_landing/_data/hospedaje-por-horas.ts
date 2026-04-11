import type { NicheConfig } from './types';

const ACCENT = '#F59E0B';
const PARENT_URL = '/hospedaje-por-horas';
const PARENT_LABEL = 'Hospedaje por Horas';

const SHARED_PRICING = {
  hasFree: true,
  tiers: [
    {
      name: 'Gratis',
      price: '$0',
      period: 'para siempre',
      features: ['30 reservas por mes', '1 tipo de habitación', '1 sucursal', 'Recordatorios por WhatsApp', 'Link de reservas personalizado', 'Soporte por email'],
    },
    {
      name: 'Profesional',
      price: '$14.999',
      period: '/mes',
      popular: true,
      features: ['Reservas ilimitadas', 'Hasta 10 habitaciones', '1 sucursal', 'Cobro de señas con Mercado Pago', 'Recordatorios automáticos', 'Panel de métricas', 'Control de finanzas', 'Portal de empleados (hasta 3)', 'Soporte prioritario'],
    },
    {
      name: 'Business',
      price: '$29.999',
      period: '/mes',
      features: ['Todo lo de Profesional', 'Habitaciones ilimitadas', 'Múltiples sucursales', 'Portal de empleados ilimitado', 'API e integraciones', 'Reportes avanzados', 'Control de finanzas', 'Gerente de cuenta dedicado', 'Onboarding personalizado'],
    },
  ],
};

const hospedajeConfig: NicheConfig = {
  slug: 'hospedaje-por-horas',
  label: 'Hospedaje por Horas',
  accent: ACCENT,
  url: PARENT_URL,
  subNiches: {
    'albergues-transitorios': {
      accent: ACCENT, parentNicheUrl: PARENT_URL, parentNicheLabel: PARENT_LABEL,
      seo: {
        title: 'TurnoLink para Albergues Transitorios — Gestión de Turnos y Habitaciones',
        description: 'Sistema de gestión para albergues transitorios. Turnos por hora, rotación de habitaciones y cobro automático. Empezá gratis.',
        keywords: ['sistema albergue transitorio', 'gestión habitaciones por turno', 'software albergue transitorio argentina', 'turnos albergue online', 'reservas albergue transitorio'],
      },
      pill: '🏩 Albergues Transitorios',
      heroTitle: 'Tu albergue con máxima',
      heroSubtitle: 'rotación y cero tiempos muertos.',
      painPoints: [
        { title: 'Tiempos muertos entre turnos', desc: 'Habitaciones vacías esperando al próximo turno. Cada minuto sin ocupación es plata que perdés.' },
        { title: 'Gestión manual 24/7', desc: 'Operación las 24 horas con cuadernos y planillas. Errores de disponibilidad y dobles reservas.' },
        { title: 'Sin previsibilidad', desc: 'No sabés cuánta demanda vas a tener hoy. No podés anticipar personal ni limpieza.' },
      ],
      capabilities: [
        { icon: 'Building2', title: 'Gestión de habitaciones', desc: 'Cada habitación como recurso: standard, suite, temática. Con su precio y tiempo de turno.' },
        { icon: 'Timer', title: 'Turnos configurables', desc: 'Turnos de 2, 3 o 4 horas con tiempo de limpieza entre medio. Rotación eficiente.' },
        { icon: 'CreditCard', title: 'Cobro al reservar', desc: 'El cliente paga al reservar online. Discreto, práctico y sin efectivo.' },
        { icon: 'CalendarCheck', title: 'Reservas discretas', desc: 'Link privado donde el cliente elige habitación y horario. Sin llamadas.' },
        { icon: 'Clock', title: 'Operación 24/7', desc: 'El sistema funciona las 24 horas. Reservas de madrugada sin necesidad de recepcionista.' },
        { icon: 'LayoutDashboard', title: 'Panel de ocupación', desc: 'Ocupación en tiempo real, turnos del día, facturación por habitación.' },
      ],
      subIndustries: ['Habitación standard', 'Suite', 'Habitación temática', 'Habitación con jacuzzi', 'Habitación premium'],
      pricing: SHARED_PRICING,
      testimonials: [
        { quote: 'Pasamos de gestionar 20 habitaciones con cuadernos a tener todo automatizado. La ocupación subió un 25%.', name: 'Gerardo Paz', role: 'Gerente', business: 'Albergue Los Álamos', image: 'https://randomuser.me/api/portraits/men/59.jpg' },
        { quote: 'El cobro online discreto mejoró la experiencia de nuestros clientes. Todo más profesional.', name: 'Silvia Rodríguez', role: 'Dueña', business: 'Hotel Privée', image: 'https://randomuser.me/api/portraits/women/65.jpg' },
        { quote: 'Los tiempos entre turnos se redujeron porque ahora anticipamos cuándo se desocupa cada habitación.', name: 'Ricardo Gómez', role: 'Administrador', business: 'Suites del Centro', image: 'https://randomuser.me/api/portraits/men/60.jpg' },
      ],
      faqs: [
        { q: '¿Puedo configurar tiempos de limpieza entre turnos?', a: 'Sí. Definís un buffer de 30-60 min entre turnos para limpieza y preparación.' },
        { q: '¿Las reservas son discretas?', a: 'Sí. El cliente accede por un link privado, elige y paga sin llamadas ni interacciones.' },
        { q: '¿Funciona para operación 24/7?', a: 'Sí. El sistema acepta reservas las 24 horas, incluyendo madrugada y feriados.' },
        { q: '¿Puedo tener distintos tipos de habitación?', a: 'Sí. Standard, suite, temática. Cada una con su precio y duración de turno.' },
        { q: '¿Se integra con Mercado Pago?', a: 'Sí. Cobro automático y discreto. La plata va directo a tu cuenta.' },
        { q: '¿Puedo ver la ocupación en tiempo real?', a: 'Sí. Panel con estado de cada habitación: ocupada, en limpieza, disponible.' },
      ],
      cta: { headline: 'Maximizá la rotación', subtitle: 'de tu albergue.', description: 'Creá tu cuenta gratis, configurá tus habitaciones y turnos. Reservas y cobros automáticos 24/7.' },
    },

    'hoteles-por-turno': {
      accent: ACCENT, parentNicheUrl: PARENT_URL, parentNicheLabel: PARENT_LABEL,
      seo: {
        title: 'TurnoLink para Hoteles por Turno — Gestión de Reservas por Bloque',
        description: 'Sistema de reservas para hoteles por turno. Bloques horarios, cobro automático y gestión de habitaciones. Empezá gratis.',
        keywords: ['hotel por turno sistema', 'reservas hotel por hora', 'gestión hotel por turno', 'software hotel transitorio argentina'],
      },
      pill: '🏨 Hoteles por Turno',
      heroTitle: 'Tu hotel por turno',
      heroSubtitle: 'con ocupación máxima.',
      painPoints: [
        { title: 'Habitaciones desaprovechadas', desc: 'Turnos vacíos en horas de baja demanda. Sin herramienta, no podés promocionar esos horarios.' },
        { title: 'Check-in lento', desc: 'El cliente llega y tiene que esperar en recepción. La experiencia se arruina desde el inicio.' },
        { title: 'Dobles reservas', desc: 'Sin sistema digital, a veces se asignan dos clientes a la misma habitación. Un desastre.' },
      ],
      capabilities: [
        { icon: 'Building2', title: 'Gestión de habitaciones', desc: 'Cada habitación con su categoría, precio y disponibilidad en tiempo real.' },
        { icon: 'Timer', title: 'Bloques horarios', desc: 'Turnos de 2, 4, 6 u 8 horas. Configurá según la demanda y tipo de habitación.' },
        { icon: 'CreditCard', title: 'Cobro anticipado', desc: 'El huésped paga al reservar. Check-in express sin esperas.' },
        { icon: 'Zap', title: 'Check-in express', desc: 'Ya pagó, ya eligió habitación. Solo llega y entra. Experiencia premium.' },
        { icon: 'CalendarCheck', title: 'Reservas online', desc: 'Disponibilidad en tiempo real. Sin dobles reservas, sin errores.' },
        { icon: 'LayoutDashboard', title: 'Dashboard operativo', desc: 'Estado de habitaciones, turnos activos, ingresos del día.' },
      ],
      subIndustries: ['Habitación standard', 'Habitación superior', 'Suite', 'Suite premium', 'Habitación express'],
      pricing: SHARED_PRICING,
      testimonials: [
        { quote: 'El check-in express mejoró la experiencia de nuestros huéspedes. Llegan, ya pagaron, van directo a la habitación.', name: 'Laura Mancini', role: 'Gerente', business: 'Hotel Express Center', image: 'https://randomuser.me/api/portraits/women/66.jpg' },
        { quote: 'Eliminamos las dobles reservas al 100%. El sistema controla la disponibilidad en tiempo real.', name: 'Martín Juárez', role: 'Director', business: 'Hotel del Sol', image: 'https://randomuser.me/api/portraits/men/61.jpg' },
        { quote: 'La ocupación en horarios de baja demanda subió un 30% porque ahora los huéspedes ven la disponibilidad online.', name: 'Patricia Díaz', role: 'Dueña', business: 'PD Hotel por Horas', image: 'https://randomuser.me/api/portraits/women/67.jpg' },
      ],
      faqs: [
        { q: '¿Puedo configurar turnos de distinta duración?', a: 'Sí. 2 horas, 4 horas, medio día. Cada tipo como servicio con su precio.' },
        { q: '¿Cómo funciona el check-in express?', a: 'El huésped ya pagó y eligió habitación online. Solo llega y recibe la llave.' },
        { q: '¿Puedo tener habitaciones de distinta categoría?', a: 'Sí. Standard, superior, suite. Cada una con su precio y disponibilidad.' },
        { q: '¿Funciona para reservas de último momento?', a: 'Sí. El huésped ve disponibilidad en tiempo real y puede reservar 30 minutos antes.' },
        { q: '¿Se puede gestionar la limpieza?', a: 'Sí. El buffer entre turnos te permite programar limpieza antes de la siguiente reserva.' },
        { q: '¿El cobro es discreto?', a: 'Sí. Todo online por Mercado Pago. Sin intercambio de efectivo en recepción.' },
      ],
      cta: { headline: 'Optimizá tu hotel', subtitle: 'por turno.', description: 'Creá tu cuenta gratis, configurá tus habitaciones y bloques. Reservas y cobros automáticos.' },
    },

    'hostels-por-bloque': {
      accent: ACCENT, parentNicheUrl: PARENT_URL, parentNicheLabel: PARENT_LABEL,
      seo: {
        title: 'TurnoLink para Hostels por Bloque — Reservas de Camas por Horas',
        description: 'Sistema de reservas para hostels por bloque horario. Camas y habitaciones compartidas con cobro automático. Empezá gratis.',
        keywords: ['reservas hostel por hora', 'sistema hostel por bloque', 'gestión hostel compartido', 'software hostel argentina'],
      },
      pill: '🛏️ Hostels por Bloque',
      heroTitle: 'Tu hostel con reservas',
      heroSubtitle: 'por bloque organizadas.',
      painPoints: [
        { title: 'Camas vacías', desc: 'Camas que podrían ocuparse en bloques diurnos quedan vacías porque solo vendés por noche.' },
        { title: 'Gestión de compartidos', desc: 'Habitaciones compartidas con 6, 8, 10 camas. Saber cuántas están libres a cada hora es imposible.' },
        { title: 'Pagos informales', desc: 'Viajeros que pagan en efectivo, otros por transferencia. Todo desordenado.' },
      ],
      capabilities: [
        { icon: 'Building2', title: 'Gestión de camas', desc: 'Cada cama como recurso individual. Habitación de 6 camas = 6 reservas posibles.' },
        { icon: 'Timer', title: 'Bloques flexibles', desc: 'Bloque diurno, nocturno, 12 horas, 24 horas. Vos definís los formatos.' },
        { icon: 'CreditCard', title: 'Cobro online', desc: 'El viajero paga al reservar. Sin efectivo, sin complicaciones.' },
        { icon: 'CalendarCheck', title: 'Disponibilidad en tiempo real', desc: 'Cuántas camas hay libres en cada habitación a cada hora. Siempre actualizado.' },
        { icon: 'Globe', title: 'Link de reservas', desc: 'Compartí en Google, Hostelworld o redes. Viajeros te encuentran y reservan al instante.' },
        { icon: 'LayoutDashboard', title: 'Ocupación por cama', desc: 'Qué camas se llenan más, qué horarios tienen demanda, cuánto facturás por día.' },
      ],
      subIndustries: ['Cama en habitación compartida', 'Habitación privada', 'Bloque diurno', 'Bloque nocturno', 'Estadía 24hs'],
      pricing: SHARED_PRICING,
      testimonials: [
        { quote: 'Empezamos a vender bloques diurnos y la facturación subió un 20%. Las camas ya no quedan vacías de día.', name: 'Tomás Suárez', role: 'Dueño', business: 'Hostel Urbano BA', image: 'https://randomuser.me/api/portraits/men/62.jpg' },
        { quote: 'Los viajeros reservan y pagan online. Llegamos a un nivel de organización que antes era imposible.', name: 'Carolina Estévez', role: 'Gerente', business: 'Waypoint Hostel', image: 'https://randomuser.me/api/portraits/women/69.jpg' },
        { quote: 'Gestionar 40 camas era un caos. Ahora cada cama es un recurso y sé exactamente cuáles están libres.', name: 'Marcos Giménez', role: 'Administrador', business: 'Nomad Hostel', image: 'https://randomuser.me/api/portraits/men/63.jpg' },
      ],
      faqs: [
        { q: '¿Puedo gestionar camas individuales?', a: 'Sí. Cada cama es un recurso independiente dentro de su habitación.' },
        { q: '¿Funcionan los bloques diurnos y nocturnos?', a: 'Sí. Definís los bloques: 8-20hs, 20-8hs, 24hs. Cada uno con su precio.' },
        { q: '¿Puedo tener habitaciones privadas además de compartidas?', a: 'Sí. Privadas como un solo recurso, compartidas con múltiples camas.' },
        { q: '¿El viajero ve la disponibilidad en tiempo real?', a: 'Sí. Ve cuántas camas quedan en cada habitación y bloque horario.' },
        { q: '¿Se puede cobrar por adelantado?', a: 'Sí. El viajero paga al reservar. Sin sorpresas al llegar.' },
        { q: '¿Funciona para hostels con recepción limitada?', a: 'Perfecto. El viajero reserva y paga online. No necesitás recepcionista 24/7.' },
      ],
      cta: { headline: 'Optimizá tu hostel', subtitle: 'con bloques horarios.', description: 'Creá tu cuenta gratis, cargá tus camas y bloques. Reservas y cobros automáticos.' },
    },

    'habitaciones-12hs': {
      accent: ACCENT, parentNicheUrl: PARENT_URL, parentNicheLabel: PARENT_LABEL,
      seo: {
        title: 'TurnoLink para Habitaciones 12hs — Reservas por Medio Día',
        description: 'Sistema de reservas para habitaciones de medio día. Bloques de 12 horas con cobro automático y gestión de rotación. Empezá gratis.',
        keywords: ['habitaciones 12 horas', 'hotel medio día', 'reservas habitación medio día', 'sistema hotel 12hs argentina'],
      },
      pill: '🕐 Habitaciones 12hs',
      heroTitle: 'Tus habitaciones de 12hs',
      heroSubtitle: 'con rotación perfecta.',
      painPoints: [
        { title: 'Solo 1 turno diurno y 1 nocturno', desc: 'Si no gestionás bien, perdés uno de los dos turnos. Eso es 50% de facturación menos.' },
        { title: 'Limpiar a tiempo', desc: 'El turno de día termina y el de noche empieza. Si la limpieza no está lista, todo se atrasa.' },
        { title: 'Reservas por teléfono', desc: 'El cliente llama para reservar medio día. Si no atendés, se va a otro lado.' },
      ],
      capabilities: [
        { icon: 'Timer', title: 'Bloques de 12 horas', desc: 'Turno diurno 8-20hs, turno nocturno 20-8hs. Rotación perfecta.' },
        { icon: 'Building2', title: 'Habitaciones con rotación', desc: 'Cada habitación tiene 2 turnos diarios. Maximizá la ocupación al doble.' },
        { icon: 'CreditCard', title: 'Cobro al reservar', desc: 'El huésped paga online. Sin efectivo, sin esperas.' },
        { icon: 'Clock', title: 'Buffer de limpieza', desc: 'Tiempo configurado entre turnos para que el equipo limpie y prepare.' },
        { icon: 'CalendarCheck', title: 'Reservas fáciles', desc: 'El cliente elige día, turno y habitación. En 2 minutos reserva y paga.' },
        { icon: 'LayoutDashboard', title: 'Control de ocupación', desc: 'Turno diurno y nocturno por separado. Sabé dónde tenés vacantes.' },
      ],
      subIndustries: ['Turno diurno', 'Turno nocturno', 'Habitación standard', 'Habitación premium', 'Suite 12hs'],
      pricing: SHARED_PRICING,
      testimonials: [
        { quote: 'Antes perdíamos el turno diurno porque nadie sabía que teníamos disponibilidad. Ahora se reserva online y se llena.', name: 'Adrián Molina', role: 'Gerente', business: 'Hotel Mediodía', image: 'https://randomuser.me/api/portraits/men/64.jpg' },
        { quote: 'La rotación diurno/nocturno funciona perfecta. El buffer de limpieza nos da tiempo sin estrés.', name: 'Marta Gutiérrez', role: 'Dueña', business: 'Hab Express', image: 'https://randomuser.me/api/portraits/women/70.jpg' },
        { quote: 'Duplicamos la facturación al empezar a vender los dos turnos de cada habitación online.', name: 'Fabián Cárdenas', role: 'Administrador', business: 'Doce Horas Hotel', image: 'https://randomuser.me/api/portraits/men/65.jpg' },
      ],
      faqs: [
        { q: '¿Cómo configuro los turnos diurno y nocturno?', a: 'Creás dos tipos de servicio: turno diurno (8-20hs) y nocturno (20-8hs). Cada habitación ofrece ambos.' },
        { q: '¿El buffer de limpieza se configura?', a: 'Sí. Definís 30-60 min entre turnos para limpieza. El sistema no permite reservar durante ese tiempo.' },
        { q: '¿Puedo tener precios distintos por turno?', a: 'Sí. El turno nocturno puede ser más caro que el diurno o viceversa.' },
        { q: '¿Funciona para fines de semana?', a: 'Sí. Podés tener precios diferentes para viernes, sábado y domingo.' },
        { q: '¿El cliente ve qué turnos están disponibles?', a: 'Sí. Ve el calendario con los turnos libres de cada habitación y reserva al instante.' },
        { q: '¿Se puede extender el turno?', a: 'Podés ofrecer un turno de 24hs como servicio adicional a mayor precio.' },
      ],
      cta: { headline: 'Duplicá la facturación', subtitle: 'de tus habitaciones.', description: 'Creá tu cuenta gratis, configurá turnos diurno y nocturno. Reservas y cobros automáticos.' },
    },

    'boxes-privados': {
      accent: ACCENT, parentNicheUrl: PARENT_URL, parentNicheLabel: PARENT_LABEL,
      seo: {
        title: 'TurnoLink para Boxes Privados — Reservas por Hora',
        description: 'Sistema de reservas para boxes privados por hora. Rotación rápida, cobro automático y gestión de espacios. Empezá gratis.',
        keywords: ['reservas box privado', 'box por hora', 'sistema boxes privados', 'alquiler box privado argentina'],
      },
      pill: '🚪 Boxes Privados',
      heroTitle: 'Tus boxes privados',
      heroSubtitle: 'con rotación eficiente.',
      painPoints: [
        { title: 'Rotación lenta', desc: 'Boxes que podrían tener 6 turnos por día pero solo tienen 3. Perdés la mitad del potencial.' },
        { title: 'Reservas por llamada', desc: 'El cliente quiere discreción pero tiene que llamar para reservar. Incómodo.' },
        { title: 'Sin control de tiempos', desc: 'Algunos clientes se quedan más de lo reservado. Se atrasa todo el calendario.' },
      ],
      capabilities: [
        { icon: 'Building2', title: 'Gestión de boxes', desc: 'Cada box como recurso: standard, premium, VIP. Con su equipamiento y precio.' },
        { icon: 'Timer', title: 'Turnos cortos', desc: 'Turnos de 1, 2 o 3 horas. Rotación rápida para maximizar la ocupación.' },
        { icon: 'CreditCard', title: 'Cobro discreto online', desc: 'El cliente paga por Mercado Pago al reservar. Sin intercambio de efectivo.' },
        { icon: 'CalendarCheck', title: 'Reservas privadas', desc: 'Link directo, sin registro de nombre obligatorio. Máxima discreción.' },
        { icon: 'Clock', title: 'Control de tiempo', desc: 'El sistema marca hora de inicio y fin. Sin extensiones no autorizadas.' },
        { icon: 'LayoutDashboard', title: 'Métricas de rotación', desc: 'Turnos por box, ocupación por hora, ingresos diarios.' },
      ],
      subIndustries: ['Box standard', 'Box premium', 'Box VIP', 'Box con jacuzzi', 'Box temático'],
      pricing: SHARED_PRICING,
      testimonials: [
        { quote: 'La reserva online discreta mejoró mucho la experiencia de nuestros clientes. Todo profesional.', name: 'Alejandro Moretti', role: 'Gerente', business: 'Box Privé', image: 'https://randomuser.me/api/portraits/men/66.jpg' },
        { quote: 'Pasamos de 3 a 6 turnos por box por día. La rotación mejoró un 100% con el sistema.', name: 'Verónica Luna', role: 'Dueña', business: 'Luna Boxes', image: 'https://randomuser.me/api/portraits/women/71.jpg' },
        { quote: 'El cobro anticipado eliminó los problemas de efectivo. Todo más limpio y organizado.', name: 'Fernando Ríos', role: 'Administrador', business: 'Ríos Privados', image: 'https://randomuser.me/api/portraits/men/67.jpg' },
      ],
      faqs: [
        { q: '¿Las reservas son anónimas?', a: 'Podés configurar el mínimo de datos necesarios. Solo se requiere un medio de pago.' },
        { q: '¿Puedo configurar turnos cortos de 1 hora?', a: 'Sí. Turnos de 1, 2 o 3 horas según la demanda y tipo de box.' },
        { q: '¿Cómo evito que se queden más tiempo?', a: 'El sistema controla hora de inicio y fin. Podés configurar alertas antes de que termine el turno.' },
        { q: '¿El cobro es discreto?', a: 'Sí. Todo online por Mercado Pago. Ningún dato sensible queda expuesto.' },
        { q: '¿Puedo tener distintos tipos de box?', a: 'Sí. Standard, premium, VIP. Cada uno con su equipamiento, fotos y precio.' },
        { q: '¿Funciona para operación 24/7?', a: 'Sí. Reservas las 24 horas sin necesidad de personal en recepción.' },
      ],
      cta: { headline: 'Maximizá la rotación', subtitle: 'de tus boxes.', description: 'Creá tu cuenta gratis, configurá tus boxes y turnos. Reservas y cobros automáticos 24/7.' },
    },
  },
};

export default hospedajeConfig;
