import type { NicheConfig } from './types';

const ACCENT = '#8B5CF6';
const PARENT_URL = '/espacios-flexibles';
const PARENT_LABEL = 'Espacios Flexibles';

const SHARED_PRICING = {
  hasFree: true,
  tiers: [
    {
      name: 'Gratis',
      price: '$0',
      period: 'para siempre',
      features: ['30 reservas por mes', '1 espacio', '1 sucursal', 'Recordatorios por WhatsApp', 'Link de reservas personalizado', 'Soporte por email'],
    },
    {
      name: 'Profesional',
      price: '$14.999',
      period: '/mes',
      popular: true,
      features: ['Reservas ilimitadas', 'Hasta 5 espacios', '1 sucursal', 'Cobro de señas con Mercado Pago', 'Recordatorios automáticos', 'Panel de métricas', 'Control de finanzas', 'Portal de empleados (hasta 3)', 'Soporte prioritario'],
    },
    {
      name: 'Business',
      price: '$29.999',
      period: '/mes',
      features: ['Todo lo de Profesional', 'Espacios ilimitados', 'Múltiples sucursales', 'Portal de empleados ilimitado', 'API e integraciones', 'Reportes avanzados', 'Control de finanzas', 'Gerente de cuenta dedicado', 'Onboarding personalizado'],
    },
  ],
};

const espaciosConfig: NicheConfig = {
  slug: 'espacios-flexibles',
  label: 'Espacios Flexibles',
  accent: ACCENT,
  url: PARENT_URL,
  subNiches: {
    coworking: {
      accent: ACCENT, parentNicheUrl: PARENT_URL, parentNicheLabel: PARENT_LABEL,
      seo: {
        title: 'TurnoLink para Coworking — Reservas de Escritorios Online',
        description: 'Sistema de reservas para espacios de coworking. Hot desks, escritorios fijos y membresías con cobro automático. Empezá gratis.',
        keywords: ['reservas coworking online', 'sistema coworking', 'hot desk reservas', 'software coworking argentina', 'gestión coworking'],
      },
      pill: '💻 Coworking',
      heroTitle: 'Tu coworking con',
      heroSubtitle: 'escritorios siempre ocupados.',
      painPoints: [
        { title: 'Escritorios vacíos', desc: 'Tenés 20 puestos y 10 están vacíos. Sin reserva por hora, perdés ocupación en horarios de baja demanda.' },
        { title: 'Control de acceso', desc: 'No sabés quién está en el espacio, cuántas horas usa ni si pagó. Todo informal.' },
        { title: 'Membresías sin control', desc: 'Vendés membresías mensuales pero no controlás cuántas horas usa cada miembro.' },
      ],
      capabilities: [
        { icon: 'Building2', title: 'Gestión de puestos', desc: 'Hot desk, escritorio fijo, puesto premium. Cada uno con su precio por hora o día.' },
        { icon: 'CreditCard', title: 'Cobro por hora o día', desc: 'Pago al reservar por Mercado Pago. Sin efectivo, sin deudas.' },
        { icon: 'CalendarCheck', title: 'Reservas flexibles', desc: 'Por hora, medio día o día completo. El usuario elige lo que necesita.' },
        { icon: 'Users', title: 'Base de miembros', desc: 'Historial de uso, membresía activa, horas consumidas. Todo registrado.' },
        { icon: 'Globe', title: 'Link de reservas', desc: 'Profesionales te encuentran online y reservan su escritorio sin llamar.' },
        { icon: 'LayoutDashboard', title: 'Métricas de ocupación', desc: 'Qué puestos se usan más, en qué horarios, cuánto facturás por día.' },
      ],
      subIndustries: ['Hot desk', 'Escritorio fijo', 'Puesto premium', 'Escritorio día completo', 'Membresía mensual', 'Pase diario'],
      pricing: SHARED_PRICING,
      testimonials: [
        { quote: 'La ocupación de hot desks subió un 40% cuando habilitamos reservas por hora online.', name: 'Ignacio Vélez', role: 'Director', business: 'Hub Coworking', image: 'https://randomuser.me/api/portraits/men/80.jpg' },
        { quote: 'Ahora sé exactamente cuántas horas usa cada miembro. Puedo optimizar membresías y precios.', name: 'Camila Reyes', role: 'Gerente', business: 'WorkSpace BA', image: 'https://randomuser.me/api/portraits/women/82.jpg' },
        { quote: 'Los freelancers reservan su escritorio desde el celular. Llegan y ya tienen todo listo.', name: 'Tomás Aguirre', role: 'Dueño', business: 'Nómade Cowork', image: 'https://randomuser.me/api/portraits/men/81.jpg' },
      ],
      faqs: [
        { q: '¿Puedo ofrecer hot desks y escritorios fijos?', a: 'Sí. Cada tipo como recurso independiente con su propio precio y disponibilidad.' },
        { q: '¿Funciona con membresías mensuales?', a: 'Sí. Creás pases mensuales con un límite de horas o días y el sistema lleva el conteo.' },
        { q: '¿Los usuarios pueden reservar por hora?', a: 'Sí. Bloques de 1 hora, medio día o día completo. El usuario elige.' },
        { q: '¿Puedo ver la ocupación en tiempo real?', a: 'Sí. Panel con puestos libres, ocupados y reservados. Todo en tiempo real.' },
        { q: '¿Se puede cobrar por hora?', a: 'Sí. Definís el precio por hora y el sistema calcula el total según el bloque reservado.' },
        { q: '¿Funciona para eventos en el coworking?', a: 'Sí. Podés reservar zonas para eventos, workshops o presentaciones.' },
      ],
      cta: { headline: 'Llenà tu coworking', subtitle: 'con reservas inteligentes.', description: 'Creá tu cuenta gratis, cargá tus puestos y empezá a recibir reservas con cobro automático.' },
    },

    'oficinas-por-hora': {
      accent: ACCENT, parentNicheUrl: PARENT_URL, parentNicheLabel: PARENT_LABEL,
      seo: {
        title: 'TurnoLink para Oficinas por Hora — Reservas y Cobro Online',
        description: 'Sistema de reservas para oficinas por hora. Oficinas privadas para reuniones y trabajo con cobro automático. Empezá gratis.',
        keywords: ['alquiler oficina por hora', 'reservas oficina temporal', 'oficina por hora argentina', 'sistema reservas oficina'],
      },
      pill: '🏬 Oficinas por Hora',
      heroTitle: 'Tus oficinas siempre',
      heroSubtitle: 'generando ingresos.',
      painPoints: [
        { title: 'Oficinas vacías entre inquilinos', desc: 'Tenés oficinas libres que podrían alquilarse por hora pero no tenés sistema para ofrecerlas.' },
        { title: 'Reservas por teléfono', desc: 'El profesional llama, pregunta disponibilidad, va y viene. Cuando confirma, ya pasó el momento.' },
        { title: 'Sin cobro anticipado', desc: 'Reservan, usan la oficina y después hay que cobrar. A veces se van sin pagar.' },
      ],
      capabilities: [
        { icon: 'Building2', title: 'Oficinas como recurso', desc: 'Oficina A, B, C. Cada una con su capacidad, equipamiento y precio por hora.' },
        { icon: 'CreditCard', title: 'Cobro al reservar', desc: 'El profesional paga al momento de reservar. Sin deudas, sin problemas.' },
        { icon: 'Timer', title: 'Bloques flexibles', desc: 'Por hora, medio día o día completo. Flexibilidad total para el usuario.' },
        { icon: 'CalendarCheck', title: 'Disponibilidad real', desc: 'El profesional ve qué oficinas están libres y reserva al instante.' },
        { icon: 'Globe', title: 'Presencia online', desc: 'Que te encuentren en Google. Profesionales buscando oficina te reservan directo.' },
        { icon: 'LayoutDashboard', title: 'Rentabilidad por oficina', desc: 'Horas ocupadas, ingresos generados y ocupación por cada oficina.' },
      ],
      subIndustries: ['Oficina individual', 'Oficina para 2-4', 'Oficina grupal', 'Despacho ejecutivo', 'Consultorio temporal'],
      pricing: SHARED_PRICING,
      testimonials: [
        { quote: 'Mis oficinas que estaban vacías ahora se alquilan por hora. Facturan más que con un inquilino fijo.', name: 'Alejandra Ponce', role: 'Propietaria', business: 'Ponce Offices', image: 'https://randomuser.me/api/portraits/women/83.jpg' },
        { quote: 'Los profesionales reservan y pagan online. Llegan, usan la oficina y se van. Sin complicaciones.', name: 'Martín Bustos', role: 'Gerente', business: 'FlexOffice BA', image: 'https://randomuser.me/api/portraits/men/82.jpg' },
        { quote: 'La ocupación subió un 60% cuando empezamos a ofrecer reservas por hora con link online.', name: 'Daniela Córdoba', role: 'Directora', business: 'Smart Offices', image: 'https://randomuser.me/api/portraits/women/84.jpg' },
      ],
      faqs: [
        { q: '¿Puedo tener oficinas de distinto tamaño?', a: 'Sí. Individual, para 2-4, grupal. Cada una con su equipamiento y precio.' },
        { q: '¿El cobro es por hora?', a: 'Sí. Definís precio por hora y el sistema calcula según el bloque reservado.' },
        { q: '¿Funciona para profesionales que necesitan consultorio?', a: 'Perfecto. Psicólogos, abogados y terapeutas que necesitan un espacio profesional por hora.' },
        { q: '¿El profesional ve la disponibilidad en tiempo real?', a: 'Sí. Ve qué oficinas están libres, en qué horarios y reserva al instante.' },
        { q: '¿Puedo incluir café y WiFi?', a: 'Sí. Los amenities aparecen en la ficha de cada oficina.' },
        { q: '¿Se puede reservar para varios días seguidos?', a: 'Sí. El profesional elige las fechas y horarios que necesita.' },
      ],
      cta: { headline: 'Monetizá tus oficinas', subtitle: 'por hora.', description: 'Creá tu cuenta gratis, cargá tus oficinas y empezá a recibir reservas con cobro automático.' },
    },

    'salas-de-reuniones': {
      accent: ACCENT, parentNicheUrl: PARENT_URL, parentNicheLabel: PARENT_LABEL,
      seo: {
        title: 'TurnoLink para Salas de Reuniones — Reservas por Hora',
        description: 'Sistema de reservas para salas de reuniones. Meetings, capacitaciones y workshops con cobro automático. Empezá gratis.',
        keywords: ['reservas sala reuniones', 'alquiler sala meeting', 'sala reuniones por hora', 'sistema reservas sala argentina'],
      },
      pill: '🤝 Salas de Reuniones',
      heroTitle: 'Tus salas de reuniones',
      heroSubtitle: 'siempre en uso.',
      painPoints: [
        { title: 'Salas vacías', desc: 'Tenés salas equipadas que pasan horas vacías. Sin sistema de reserva fácil, nadie las aprovecha.' },
        { title: 'Dobles reservas', desc: 'Dos equipos llegan a la misma sala al mismo horario. Sin sistema centralizado, pasa seguido.' },
        { title: 'Sin cobro', desc: 'Las salas se usan gratis internamente y nadie lleva la cuenta. Si alquilás a externos, cobrás informal.' },
      ],
      capabilities: [
        { icon: 'Building2', title: 'Salas como recurso', desc: 'Sala chica (4 personas), mediana (8), grande (20). Cada una con su equipamiento.' },
        { icon: 'Timer', title: 'Reservas por hora', desc: 'Bloques de 1, 2 o 4 horas. El usuario reserva lo que necesita.' },
        { icon: 'CreditCard', title: 'Cobro automático', desc: 'Para clientes externos, cobro al reservar. Para internos, registro de uso.' },
        { icon: 'CalendarCheck', title: 'Calendario compartido', desc: 'Todos ven qué salas están libres. Sin dobles reservas, sin conflictos.' },
        { icon: 'Zap', title: 'Equipamiento incluido', desc: 'Proyector, pizarra, videoconferencia. Todo detallado en la ficha de la sala.' },
        { icon: 'LayoutDashboard', title: 'Uso por sala', desc: 'Horas de uso, reservas por día, salas más demandadas.' },
      ],
      subIndustries: ['Sala de reuniones', 'Sala de capacitación', 'Sala de directorio', 'Sala de workshops', 'Sala de entrevistas'],
      pricing: SHARED_PRICING,
      testimonials: [
        { quote: 'Las dobles reservas de salas eran un clásico. Con TurnoLink, nunca más pasó.', name: 'Germán Arias', role: 'Office manager', business: 'TechHub BA', image: 'https://randomuser.me/api/portraits/men/83.jpg' },
        { quote: 'Empezamos a alquilar nuestras salas a externos por hora. Es ingreso extra sin esfuerzo.', name: 'Verónica Olmos', role: 'Directora', business: 'Centro de Negocios Olmos', image: 'https://randomuser.me/api/portraits/women/85.jpg' },
        { quote: 'Ahora sé cuántas horas se usa cada sala. Pude optimizar el espacio y reducir costos.', name: 'Santiago Berón', role: 'Gerente', business: 'Berón Business Center', image: 'https://randomuser.me/api/portraits/men/84.jpg' },
      ],
      faqs: [
        { q: '¿Puedo tener salas de distinto tamaño?', a: 'Sí. Cada sala con su capacidad, equipamiento y precio diferenciado.' },
        { q: '¿Funciona para uso interno y externo?', a: 'Sí. Para internos podés tener reservas gratuitas y para externos con cobro.' },
        { q: '¿Se evitan las dobles reservas?', a: 'Sí. El sistema controla la disponibilidad en tiempo real. Si está ocupada, nadie más puede reservar.' },
        { q: '¿Puedo incluir equipamiento en la ficha?', a: 'Sí. Proyector, TV, pizarra, videoconferencia. Todo visible al reservar.' },
        { q: '¿Los externos pagan al reservar?', a: 'Sí. Cobro automático por Mercado Pago al momento de confirmar la reserva.' },
        { q: '¿Puedo ver estadísticas de uso?', a: 'Sí. Horas de uso por sala, reservas por semana y salas más demandadas.' },
      ],
      cta: { headline: 'Optimizá el uso', subtitle: 'de tus salas.', description: 'Creá tu cuenta gratis, cargá tus salas y que se reserven con cobro automático.' },
    },

    'boxes-profesionales': {
      accent: ACCENT, parentNicheUrl: PARENT_URL, parentNicheLabel: PARENT_LABEL,
      seo: {
        title: 'TurnoLink para Boxes Profesionales — Reservas por Turno',
        description: 'Sistema de reservas para boxes profesionales. Consultorios compartidos por turno con cobro automático. Empezá gratis.',
        keywords: ['box profesional por turno', 'consultorio compartido reservas', 'alquiler box profesional', 'sistema boxes profesionales argentina'],
      },
      pill: '💼 Boxes Profesionales',
      heroTitle: 'Tus boxes profesionales',
      heroSubtitle: 'siempre ocupados.',
      painPoints: [
        { title: 'Boxes vacíos entre turnos', desc: 'Tenés 5 boxes y 2 están vacíos la mitad del día. Plata que se pierde.' },
        { title: 'Profesionales que se superponen', desc: 'Sin sistema, dos profesionales creen que tienen el mismo box a la misma hora.' },
        { title: 'Cobro desordenado', desc: 'Algunos pagan por mes, otros por turno, algunos deben. Todo descontrolado.' },
      ],
      capabilities: [
        { icon: 'Building2', title: 'Boxes por recurso', desc: 'Cada box con su equipamiento, capacidad y precio por turno.' },
        { icon: 'Timer', title: 'Turnos por hora', desc: 'Bloques de 1, 2 o 4 horas. El profesional reserva lo que necesita.' },
        { icon: 'CreditCard', title: 'Cobro por turno', desc: 'El profesional paga al reservar. Cobro claro y ordenado.' },
        { icon: 'CalendarCheck', title: 'Sin superposiciones', desc: 'Cada box tiene su calendario. Imposible que dos profesionales se crucen.' },
        { icon: 'Users', title: 'Base de profesionales', desc: 'Quién usa qué box, cuántas horas por semana, historial de pagos.' },
        { icon: 'LayoutDashboard', title: 'Rentabilidad', desc: 'Ingresos por box, horas vacías, profesionales más activos.' },
      ],
      subIndustries: ['Consultorio psicológico', 'Consultorio médico', 'Box de kinesiología', 'Box de nutrición', 'Box terapéutico'],
      pricing: SHARED_PRICING,
      testimonials: [
        { quote: 'Mis 6 boxes están ocupados el 90% del tiempo. Antes era el 60%. TurnoLink me ayudó a llenar los huecos.', name: 'Marcela Domínguez', role: 'Dueña', business: 'Centro Profesional MD', image: 'https://randomuser.me/api/portraits/women/86.jpg' },
        { quote: 'Los profesionales reservan su box desde el celular. Sin llamadas, sin conflictos de horario.', name: 'Roberto Sánchez', role: 'Administrador', business: 'Sánchez Boxes', image: 'https://randomuser.me/api/portraits/men/85.jpg' },
        { quote: 'El cobro automático por turno simplificó todo. Antes perseguía a los profesionales para que pagaran.', name: 'Laura Giménez', role: 'Gerente', business: 'Espacio Profesional LG', image: 'https://randomuser.me/api/portraits/women/87.jpg' },
      ],
      faqs: [
        { q: '¿Funciona para distintos profesionales?', a: 'Sí. Psicólogos, kinesiólogos, nutricionistas. Cada uno reserva el box que necesita.' },
        { q: '¿Puedo cobrar por turno y por mes?', a: 'Sí. Creás tarifas por turno y paquetes mensuales con un límite de horas.' },
        { q: '¿Se evitan las superposiciones?', a: 'Sí. Si un box está reservado, nadie más puede reservar ese horario.' },
        { q: '¿Puedo ver cuántas horas usa cada profesional?', a: 'Sí. Historial completo de reservas, horas y pagos por profesional.' },
        { q: '¿Los boxes tienen distinto equipamiento?', a: 'Sí. Camilla, escritorio, equipamiento médico. Todo detallado en la ficha del box.' },
        { q: '¿Funciona para centros con muchos boxes?', a: 'Sí. Sin límite de boxes con el plan Business.' },
      ],
      cta: { headline: 'Llenà tus boxes', subtitle: 'profesionales.', description: 'Creá tu cuenta gratis, cargá tus boxes y que los profesionales reserven con cobro automático.' },
    },

    'estudios-compartidos': {
      accent: ACCENT, parentNicheUrl: PARENT_URL, parentNicheLabel: PARENT_LABEL,
      seo: {
        title: 'TurnoLink para Estudios Compartidos — Reservas por Hora',
        description: 'Sistema de reservas para estudios compartidos. Fotografía, podcast, diseño con cobro automático. Empezá gratis.',
        keywords: ['alquiler estudio compartido', 'reservas estudio fotográfico', 'estudio podcast por hora', 'software estudio compartido argentina'],
      },
      pill: '🎨 Estudios Compartidos',
      heroTitle: 'Tu estudio compartido',
      heroSubtitle: 'siempre en uso.',
      painPoints: [
        { title: 'Estudio vacío muchas horas', desc: 'Tu estudio podría generar ingresos 12 horas al día pero solo lo usás 4. El resto está vacío.' },
        { title: 'Coordinación entre usuarios', desc: 'Fotógrafos, podcasters, diseñadores. Coordinar quién usa el estudio y cuándo es un lío.' },
        { title: 'Equipamiento sin control', desc: 'No sabés quién usa qué equipo ni en qué estado lo deja.' },
      ],
      capabilities: [
        { icon: 'Building2', title: 'Espacios y sets', desc: 'Set de fotos, cabina de podcast, mesa de edición. Cada espacio como recurso.' },
        { icon: 'Timer', title: 'Bloques por hora', desc: 'Reservas de 1, 2, 4 u 8 horas. Flexibilidad total para cada creativo.' },
        { icon: 'CreditCard', title: 'Cobro por uso', desc: 'El creativo paga al reservar. Sin deudas, sin efectivo.' },
        { icon: 'CalendarCheck', title: 'Calendario compartido', desc: 'Todos ven la disponibilidad. Sin conflictos entre usuarios.' },
        { icon: 'Users', title: 'Base de creativos', desc: 'Quién usa el estudio, cuántas horas, qué equipamiento necesita.' },
        { icon: 'Globe', title: 'Atraer nuevos usuarios', desc: 'Link profesional para que creativos te encuentren y reserven online.' },
      ],
      subIndustries: ['Estudio fotográfico', 'Cabina de podcast', 'Estudio de video', 'Estudio de diseño', 'Sala de edición'],
      pricing: SHARED_PRICING,
      testimonials: [
        { quote: 'Mi estudio fotográfico genera ingresos 10 horas al día. Antes solo lo usaba yo 4 horas.', name: 'Paula Montero', role: 'Fotógrafa', business: 'Studio PM', image: 'https://randomuser.me/api/portraits/women/88.jpg' },
        { quote: 'Los podcasters reservan la cabina online y llegan listos para grabar. Todo fluido.', name: 'Diego Ávalos', role: 'Dueño', business: 'PodStudio BA', image: 'https://randomuser.me/api/portraits/men/86.jpg' },
        { quote: 'Creativos de distintas disciplinas comparten el estudio sin conflictos. TurnoLink coordina todo.', name: 'Lucía Bermúdez', role: 'Directora', business: 'Creative Hub', image: 'https://randomuser.me/api/portraits/women/89.jpg' },
      ],
      faqs: [
        { q: '¿Puedo tener distintos tipos de espacio?', a: 'Sí. Set fotográfico, cabina de podcast, sala de edición. Cada uno con su precio.' },
        { q: '¿Funciona para alquiler de equipamiento?', a: 'Sí. Creás servicios adicionales como "uso de flashes", "micrófono profesional", etc.' },
        { q: '¿Los creativos ven la disponibilidad?', a: 'Sí. Calendario en tiempo real con todos los espacios y sus horarios libres.' },
        { q: '¿Puedo poner reglas de uso?', a: 'Sí. Las reglas aparecen al reservar y el usuario las acepta antes de confirmar.' },
        { q: '¿El cobro es por hora?', a: 'Sí. Precio por hora multiplicado por las horas reservadas. Se cobra al instante.' },
        { q: '¿Puedo vender pases mensuales?', a: 'Sí. Pases con un límite de horas por mes a un precio especial.' },
      ],
      cta: { headline: 'Monetizá tu estudio', subtitle: 'compartido.', description: 'Creá tu cuenta gratis, cargá tus espacios y que los creativos reserven con cobro automático.' },
    },
  },
};

export default espaciosConfig;
