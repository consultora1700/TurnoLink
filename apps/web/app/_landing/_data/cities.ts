export interface CityData {
  slug: string;
  name: string;
  province: string;
  /** Demonym for copy, e.g. "porteños" */
  demonym: string;
  /** Hero headline */
  headline: string;
  subtitle: string;
  description: string;
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  /** Top industries in this city (for internal links) */
  topIndustries: { label: string; href: string; icon: string; desc: string }[];
  /** Local pain points */
  painPoints: string[];
  /** Local stats/facts for credibility */
  localFacts: string[];
  faqs: { q: string; a: string }[];
}

export const CITIES: Record<string, CityData> = {
  'buenos-aires': {
    slug: 'buenos-aires',
    name: 'Buenos Aires',
    province: 'CABA',
    demonym: 'porteños',
    headline: 'Turnos online en Buenos Aires',
    subtitle: 'La agenda de tu negocio, automatizada.',
    description: 'Más de 40 industrias usan TurnoLink en Buenos Aires para gestionar sus reservas, cobrar señas con Mercado Pago y reducir los no-show. Empezá gratis.',
    seo: {
      title: 'Turnos Online en Buenos Aires — Sistema de Reservas para Negocios',
      description: 'Sistema de turnos online para negocios en Buenos Aires. Reservas 24/7, cobro de señas con Mercado Pago, recordatorios automáticos. Para peluquerías, consultorios, canchas, spas y más. Empezá gratis.',
      keywords: ['turnos online buenos aires', 'sistema de reservas buenos aires', 'agenda digital buenos aires', 'turnos peluquería buenos aires', 'reservas online caba', 'software turnos capital federal'],
    },
    topIndustries: [
      { label: 'Peluquerías & Barberías', href: '/belleza', icon: '✂️', desc: 'Agenda por profesional, cobro de señas y recordatorios automáticos.' },
      { label: 'Consultorios Médicos', href: '/salud', icon: '🩺', desc: 'Turnos por especialidad, formularios pre-consulta y fichas de pacientes.' },
      { label: 'Canchas & Clubes', href: '/deportes', icon: '⚽', desc: 'Reservas de canchas, turnos fijos y cobro automático.' },
      { label: 'Centros de Estética', href: '/belleza/centros-de-estetica', icon: '💆', desc: 'Gestión de tratamientos, packs y promociones.' },
      { label: 'Tiendas Online', href: '/mercado', icon: '🛍️', desc: 'Catálogo digital, pedidos por WhatsApp y control de stock.' },
      { label: 'Espacios de Coworking', href: '/espacios-flexibles', icon: '🏢', desc: 'Reservas de salas, escritorios y espacios por hora.' },
    ],
    painPoints: [
      'Clientes que reservan por WhatsApp y no aparecen — perdés el horario y la plata.',
      'Pasás horas respondiendo mensajes en vez de atender tu negocio.',
      'Agenda en papel o Excel que se llena de errores y turnos superpuestos.',
    ],
    localFacts: [
      'Buenos Aires concentra la mayor cantidad de negocios de servicios del país.',
      'El 73% de los consumidores porteños prefiere reservar online antes que llamar.',
      'Los negocios con reserva online tienen un 40% menos de no-show.',
    ],
    faqs: [
      { q: '¿TurnoLink funciona para cualquier tipo de negocio en Buenos Aires?', a: 'Sí. Tenemos más de 40 rubros configurables: peluquerías, consultorios, canchas deportivas, centros de estética, estudios de grabación, espacios de coworking, tiendas y mucho más.' },
      { q: '¿Mis clientes pueden reservar desde el celular?', a: 'Sí. Tu página de reservas es 100% responsive. Tus clientes reservan desde cualquier dispositivo, 24/7, sin necesidad de descargar ninguna app.' },
      { q: '¿Cómo cobro las señas?', a: 'Conectás tu cuenta de Mercado Pago en 2 minutos. Cuando tu cliente reserva, paga la seña automáticamente y la plata va directo a tu cuenta.' },
      { q: '¿Puedo usar TurnoLink si tengo más de una sucursal?', a: 'Sí. Con el plan Business podés gestionar múltiples locales, cada uno con sus propios profesionales, servicios y horarios.' },
      { q: '¿Es gratis?', a: 'Sí, tenés un plan Gratis permanente con 30 reservas por mes. Los planes pagos arrancan en $14.999/mes y tienen 14 días de prueba sin tarjeta.' },
      { q: '¿Mandan recordatorios automáticos a mis clientes?', a: 'Sí. TurnoLink envía recordatorios por WhatsApp y email antes de cada turno, reduciendo drásticamente los no-show.' },
    ],
  },
  cordoba: {
    slug: 'cordoba',
    name: 'Córdoba',
    province: 'Córdoba',
    demonym: 'cordobeses',
    headline: 'Turnos online en Córdoba',
    subtitle: 'Tu negocio cordobés, en piloto automático.',
    description: 'Negocios de Córdoba capital y alrededores usan TurnoLink para automatizar reservas, cobrar señas y crecer sin perder tiempo en el teléfono.',
    seo: {
      title: 'Turnos Online en Córdoba — Sistema de Reservas para Negocios',
      description: 'Sistema de turnos online para negocios en Córdoba. Reservas 24/7, cobro con Mercado Pago, recordatorios automáticos. Para peluquerías, consultorios, canchas y más. Empezá gratis.',
      keywords: ['turnos online córdoba', 'sistema de reservas córdoba', 'agenda digital córdoba', 'turnos peluquería córdoba', 'reservas online córdoba capital', 'software turnos córdoba'],
    },
    topIndustries: [
      { label: 'Peluquerías & Barberías', href: '/belleza', icon: '✂️', desc: 'Agenda por profesional, cobro de señas y recordatorios automáticos.' },
      { label: 'Consultorios Médicos', href: '/salud', icon: '🩺', desc: 'Turnos por especialidad y fichas de pacientes.' },
      { label: 'Canchas de Fútbol & Pádel', href: '/deportes', icon: '⚽', desc: 'Reservas de canchas con cobro automático.' },
      { label: 'Centros de Estética', href: '/belleza/centros-de-estetica', icon: '💆', desc: 'Gestión de tratamientos y packs.' },
      { label: 'Tiendas & Mercados', href: '/mercado', icon: '🛍️', desc: 'Catálogo digital con pedidos por WhatsApp.' },
      { label: 'Alquiler Temporario', href: '/alquiler-temporario', icon: '🏡', desc: 'Reservas de cabañas y departamentos en Sierras.' },
    ],
    painPoints: [
      'Clientes que te escriben por Instagram a las 11 de la noche preguntando si hay turno.',
      'Turnos que se cancelan de último momento y no podés cubrir el horario.',
      'Libreta o agenda de papel que ya no escala con tu crecimiento.',
    ],
    localFacts: [
      'Córdoba es la segunda ciudad con más emprendimientos de servicios en Argentina.',
      'El sector de belleza y bienestar creció un 35% en los últimos 2 años en la provincia.',
      'Los negocios con reserva digital retienen un 60% más de clientes recurrentes.',
    ],
    faqs: [
      { q: '¿TurnoLink funciona para negocios en Córdoba capital y alrededores?', a: 'Sí. TurnoLink es 100% online, funciona para cualquier negocio sin importar la ubicación. Negocios en Córdoba capital, Villa Carlos Paz, Alta Gracia y toda la provincia lo usan.' },
      { q: '¿Puedo cobrar señas con Mercado Pago?', a: 'Sí. Conectás tu cuenta de Mercado Pago y las señas se cobran automáticamente cuando el cliente reserva.' },
      { q: '¿Sirve para canchas de fútbol y pádel?', a: 'Sí. Tenemos un módulo específico para deportes con reserva por cancha, horarios fijos, turnos recurrentes y cobro automático.' },
      { q: '¿Mis clientes necesitan descargar una app?', a: 'No. Todo funciona desde el navegador. Tu cliente accede a tu link personalizado y reserva en segundos.' },
      { q: '¿Tiene costo?', a: 'Hay un plan Gratis permanente. Los planes pagos arrancan en $14.999/mes con 14 días de prueba gratis.' },
    ],
  },
  rosario: {
    slug: 'rosario',
    name: 'Rosario',
    province: 'Santa Fe',
    demonym: 'rosarinos',
    headline: 'Turnos online en Rosario',
    subtitle: 'Automatizá tus reservas, crecé sin límites.',
    description: 'Negocios rosarinos confían en TurnoLink para gestionar turnos, cobrar señas y crecer de forma profesional.',
    seo: {
      title: 'Turnos Online en Rosario — Sistema de Reservas para Negocios',
      description: 'Sistema de turnos online para negocios en Rosario. Reservas 24/7, cobro con Mercado Pago, recordatorios por WhatsApp. Para peluquerías, consultorios, canchas y más.',
      keywords: ['turnos online rosario', 'sistema de reservas rosario', 'agenda digital rosario', 'turnos peluquería rosario', 'reservas online rosario santa fe'],
    },
    topIndustries: [
      { label: 'Peluquerías & Barberías', href: '/belleza', icon: '✂️', desc: 'Agenda por profesional con cobro de señas.' },
      { label: 'Consultorios & Centros de Salud', href: '/salud', icon: '🩺', desc: 'Turnos médicos con fichas digitales.' },
      { label: 'Canchas & Complejos Deportivos', href: '/deportes', icon: '⚽', desc: 'Reservas de canchas 24/7.' },
      { label: 'Spas & Centros de Estética', href: '/belleza/centros-de-estetica', icon: '💆', desc: 'Tratamientos, packs y promociones.' },
      { label: 'Tiendas & Comercios', href: '/mercado', icon: '🛍️', desc: 'Catálogo online con pedidos por WhatsApp.' },
      { label: 'Hospedaje por Horas', href: '/hospedaje-por-horas', icon: '🏨', desc: 'Reservas de habitaciones y turnos de alojamiento.' },
    ],
    painPoints: [
      'Perdés clientes porque no contestás WhatsApp a tiempo.',
      'Los no-show te cuestan turnos que podrían estar facturando.',
      'Manejás todo con agenda de papel o notas en el celular.',
    ],
    localFacts: [
      'Rosario es la tercera ciudad más grande de Argentina con un ecosistema emprendedor en crecimiento.',
      'El 68% de los rosarinos busca reservar servicios online antes de llamar por teléfono.',
      'Los negocios con sistema de turnos digital reducen los no-show hasta un 50%.',
    ],
    faqs: [
      { q: '¿TurnoLink funciona para negocios en Rosario?', a: 'Sí. TurnoLink es 100% online y funciona para cualquier negocio de servicios en Rosario y alrededores.' },
      { q: '¿Cómo ayuda a reducir los turnos perdidos?', a: 'Con recordatorios automáticos por WhatsApp, cobro de señas y políticas de cancelación configurables.' },
      { q: '¿Es difícil de configurar?', a: 'No. En 5 minutos creás tu cuenta, cargás tus servicios y compartís tu link de reservas.' },
      { q: '¿Cuánto cuesta?', a: 'Hay un plan Gratis permanente. Los planes pagos arrancan en $14.999/mes con 14 días de prueba.' },
    ],
  },
  mendoza: {
    slug: 'mendoza',
    name: 'Mendoza',
    province: 'Mendoza',
    demonym: 'mendocinos',
    headline: 'Turnos online en Mendoza',
    subtitle: 'Tu negocio mendocino, siempre disponible.',
    description: 'Negocios de Mendoza automatizan sus reservas con TurnoLink. Turnos 24/7, cobro con Mercado Pago y cero WhatsApp.',
    seo: {
      title: 'Turnos Online en Mendoza — Sistema de Reservas para Negocios',
      description: 'Sistema de turnos online para negocios en Mendoza. Reservas 24/7, cobro automático, recordatorios por WhatsApp. Para peluquerías, consultorios, bodegas, alojamientos y más.',
      keywords: ['turnos online mendoza', 'sistema de reservas mendoza', 'agenda digital mendoza', 'turnos peluquería mendoza', 'reservas online mendoza'],
    },
    topIndustries: [
      { label: 'Peluquerías & Barberías', href: '/belleza', icon: '✂️', desc: 'Agenda por profesional con señas automáticas.' },
      { label: 'Consultorios Médicos', href: '/salud', icon: '🩺', desc: 'Turnos por especialidad y formularios pre-consulta.' },
      { label: 'Canchas Deportivas', href: '/deportes', icon: '⚽', desc: 'Reservas de canchas y cobro automático.' },
      { label: 'Alquiler Temporario', href: '/alquiler-temporario', icon: '🏡', desc: 'Cabañas, departamentos y alojamientos turísticos.' },
      { label: 'Hospedaje por Horas', href: '/hospedaje-por-horas', icon: '🏨', desc: 'Hoteles y alojamientos por turnos.' },
      { label: 'Tiendas & Bodegas', href: '/mercado', icon: '🍷', desc: 'Catálogo online de productos regionales.' },
    ],
    painPoints: [
      'Turistas que quieren reservar desde otra provincia y no pueden contactarte fuera de horario.',
      'Temporada alta que te desborda y no das abasto con las consultas.',
      'Cancelaciones de último momento sin forma de recuperar el horario.',
    ],
    localFacts: [
      'Mendoza recibe más de 3 millones de turistas al año, muchos buscando reservar online.',
      'El turismo y la gastronomía mendocina impulsan la demanda de reservas digitales.',
      'Los negocios con reserva online capturan un 45% más de clientes de otras provincias.',
    ],
    faqs: [
      { q: '¿Sirve para negocios turísticos en Mendoza?', a: 'Sí. Alojamientos, bodegas, tours y experiencias pueden usar TurnoLink para gestionar reservas y cobros automáticos.' },
      { q: '¿Funciona con Mercado Pago?', a: 'Sí. Conectás tu cuenta en 2 minutos y las señas se cobran automáticamente.' },
      { q: '¿Puedo gestionar temporada alta y baja?', a: 'Sí. Configurás horarios, disponibilidad y precios diferentes según la temporada.' },
      { q: '¿Es gratis?', a: 'Hay un plan Gratis permanente. Los planes pagos tienen 14 días de prueba sin tarjeta.' },
    ],
  },
  tucuman: {
    slug: 'tucuman',
    name: 'Tucumán',
    province: 'Tucumán',
    demonym: 'tucumanos',
    headline: 'Turnos online en Tucumán',
    subtitle: 'Profesionalizá tu negocio tucumano.',
    description: 'Negocios de San Miguel de Tucumán y alrededores usan TurnoLink para automatizar sus reservas y cobrar señas sin esfuerzo.',
    seo: {
      title: 'Turnos Online en Tucumán — Sistema de Reservas para Negocios',
      description: 'Sistema de turnos online para negocios en Tucumán. Reservas 24/7, cobro con Mercado Pago, recordatorios automáticos. Para peluquerías, consultorios, canchas y más.',
      keywords: ['turnos online tucumán', 'sistema de reservas tucumán', 'agenda digital tucumán', 'turnos peluquería tucumán', 'reservas online tucumán'],
    },
    topIndustries: [
      { label: 'Peluquerías & Barberías', href: '/belleza', icon: '✂️', desc: 'Agenda digital con cobro de señas.' },
      { label: 'Consultorios Médicos', href: '/salud', icon: '🩺', desc: 'Turnos médicos con recordatorios.' },
      { label: 'Canchas Deportivas', href: '/deportes', icon: '⚽', desc: 'Reservas de canchas y cobro automático.' },
      { label: 'Centros de Estética', href: '/belleza/centros-de-estetica', icon: '💆', desc: 'Tratamientos y packs de sesiones.' },
      { label: 'Tiendas & Comercios', href: '/mercado', icon: '🛍️', desc: 'Catálogo digital y pedidos online.' },
      { label: 'Espacios de Eventos', href: '/espacios-flexibles', icon: '🏢', desc: 'Reservas de salones y espacios.' },
    ],
    painPoints: [
      'Clientes que llaman en horarios incómodos para preguntar si hay turno.',
      'No-show que te cuestan tiempo y dinero todos los meses.',
      'Competencia que ya tiene reservas online y vos seguís con el cuaderno.',
    ],
    localFacts: [
      'Tucumán es el centro económico del NOA con un mercado de servicios en expansión.',
      'Los negocios con reserva online cierran un 35% más de turnos por mes.',
      'El cobro de señas reduce los no-show hasta un 60%.',
    ],
    faqs: [
      { q: '¿TurnoLink funciona para negocios en Tucumán?', a: 'Sí. Funciona 100% online para cualquier negocio de servicios en Tucumán y el NOA.' },
      { q: '¿Necesito conexión a internet permanente?', a: 'Solo para la configuración inicial. Tus clientes reservan desde su celular y vos recibís las notificaciones.' },
      { q: '¿Cuánto cuesta?', a: 'Hay un plan Gratis permanente. Planes pagos desde $14.999/mes con 14 días de prueba.' },
    ],
  },
  'la-plata': {
    slug: 'la-plata',
    name: 'La Plata',
    province: 'Buenos Aires',
    demonym: 'platenses',
    headline: 'Turnos online en La Plata',
    subtitle: 'Tu negocio platense, siempre abierto.',
    description: 'Negocios de La Plata automatizan sus reservas con TurnoLink. Cobro con Mercado Pago, recordatorios por WhatsApp y agenda 24/7.',
    seo: {
      title: 'Turnos Online en La Plata — Sistema de Reservas para Negocios',
      description: 'Sistema de turnos online para negocios en La Plata. Reservas 24/7, cobro de señas, recordatorios automáticos. Para peluquerías, consultorios, canchas y más.',
      keywords: ['turnos online la plata', 'sistema de reservas la plata', 'agenda digital la plata', 'turnos peluquería la plata', 'reservas online la plata'],
    },
    topIndustries: [
      { label: 'Peluquerías & Barberías', href: '/belleza', icon: '✂️', desc: 'Agenda por profesional con señas.' },
      { label: 'Consultorios Médicos', href: '/salud', icon: '🩺', desc: 'Turnos por especialidad.' },
      { label: 'Canchas de Fútbol & Pádel', href: '/deportes', icon: '⚽', desc: 'Reservas y cobro automático.' },
      { label: 'Centros de Estética', href: '/belleza/centros-de-estetica', icon: '💆', desc: 'Tratamientos y promociones.' },
      { label: 'Tiendas & Comercios', href: '/mercado', icon: '🛍️', desc: 'Catálogo digital online.' },
      { label: 'Espacios Flexibles', href: '/espacios-flexibles', icon: '🏢', desc: 'Coworkings y salas de reuniones.' },
    ],
    painPoints: [
      'WhatsApp saturado con consultas de turnos que podrías automatizar.',
      'Clientes universitarios que quieren reservar a cualquier hora.',
      'Competencia directa que ya ofrece reserva online.',
    ],
    localFacts: [
      'La Plata tiene una de las poblaciones universitarias más grandes del país.',
      'Los millennials y centennials platenses prefieren reservar desde el celular.',
      'El sector servicios crece un 20% anual en la región.',
    ],
    faqs: [
      { q: '¿Funciona para negocios en La Plata y alrededores?', a: 'Sí. TurnoLink funciona 100% online para cualquier negocio en La Plata, City Bell, Gonnet, Ensenada y toda la zona.' },
      { q: '¿Mis clientes pueden reservar sin descargar nada?', a: 'Sí. Reservan desde el navegador de su celular en segundos.' },
      { q: '¿Es gratis?', a: 'Sí, hay un plan Gratis permanente. Planes pagos con 14 días de prueba.' },
    ],
  },
  'mar-del-plata': {
    slug: 'mar-del-plata',
    name: 'Mar del Plata',
    province: 'Buenos Aires',
    demonym: 'marplatenses',
    headline: 'Turnos online en Mar del Plata',
    subtitle: 'Temporada alta todo el año.',
    description: 'Negocios marplatenses usan TurnoLink para gestionar reservas, especialmente en temporada alta cuando la demanda explota.',
    seo: {
      title: 'Turnos Online en Mar del Plata — Sistema de Reservas para Negocios',
      description: 'Sistema de turnos online para negocios en Mar del Plata. Reservas 24/7, cobro con Mercado Pago. Ideal para temporada alta. Para peluquerías, consultorios, alojamientos y más.',
      keywords: ['turnos online mar del plata', 'sistema de reservas mar del plata', 'turnos peluquería mar del plata', 'reservas online mar del plata', 'agenda digital mar del plata'],
    },
    topIndustries: [
      { label: 'Peluquerías & Barberías', href: '/belleza', icon: '✂️', desc: 'Agenda por profesional con señas.' },
      { label: 'Consultorios Médicos', href: '/salud', icon: '🩺', desc: 'Turnos médicos con recordatorios.' },
      { label: 'Canchas & Complejos', href: '/deportes', icon: '⚽', desc: 'Reservas de canchas y deportes.' },
      { label: 'Alojamientos Temporarios', href: '/alquiler-temporario', icon: '🏡', desc: 'Departamentos y casas de veraneo.' },
      { label: 'Hospedaje por Horas', href: '/hospedaje-por-horas', icon: '🏨', desc: 'Hoteles y alojamientos por turno.' },
      { label: 'Spas & Centros de Relax', href: '/belleza/spa-relax', icon: '💆', desc: 'Masajes, tratamientos y wellness.' },
    ],
    painPoints: [
      'Temporada alta que te desborda y perdés reservas por no contestar a tiempo.',
      'Turistas de otras ciudades que quieren reservar con anticipación.',
      'Baja temporada donde necesitás llenar agenda y no tenés herramientas.',
    ],
    localFacts: [
      'Mar del Plata recibe más de 8 millones de turistas al año.',
      'En temporada alta, la demanda de servicios de belleza y gastronomía se triplica.',
      'Los negocios con reserva online capturan el 70% de los turistas que planifican desde otra ciudad.',
    ],
    faqs: [
      { q: '¿Sirve para manejar la temporada alta?', a: 'Sí. TurnoLink escala automáticamente. Tus clientes reservan solos, pagan la seña y vos te enfocás en atender.' },
      { q: '¿Puedo ajustar precios por temporada?', a: 'Sí. Configurás precios especiales, promociones y disponibilidad diferenciada por temporada.' },
      { q: '¿Es gratis?', a: 'Hay un plan Gratis permanente. Planes pagos con 14 días de prueba.' },
    ],
  },
  salta: {
    slug: 'salta',
    name: 'Salta',
    province: 'Salta',
    demonym: 'salteños',
    headline: 'Turnos online en Salta',
    subtitle: 'Tu negocio salteño, digitalizado.',
    description: 'Negocios de Salta capital y el NOA gestionan sus reservas con TurnoLink. Turnos 24/7, cobro automático y cero complicaciones.',
    seo: {
      title: 'Turnos Online en Salta — Sistema de Reservas para Negocios',
      description: 'Sistema de turnos online para negocios en Salta. Reservas 24/7, cobro con Mercado Pago, recordatorios automáticos. Empezá gratis.',
      keywords: ['turnos online salta', 'sistema de reservas salta', 'agenda digital salta', 'turnos peluquería salta', 'reservas online salta'],
    },
    topIndustries: [
      { label: 'Peluquerías & Barberías', href: '/belleza', icon: '✂️', desc: 'Agenda digital con señas automáticas.' },
      { label: 'Consultorios Médicos', href: '/salud', icon: '🩺', desc: 'Turnos por especialidad.' },
      { label: 'Canchas Deportivas', href: '/deportes', icon: '⚽', desc: 'Reservas y cobro automático.' },
      { label: 'Alojamientos Turísticos', href: '/alquiler-temporario', icon: '🏡', desc: 'Cabañas, hostels y departamentos.' },
      { label: 'Tiendas Regionales', href: '/mercado', icon: '🛍️', desc: 'Productos locales con catálogo online.' },
      { label: 'Centros de Estética', href: '/belleza/centros-de-estetica', icon: '💆', desc: 'Tratamientos y promociones.' },
    ],
    painPoints: [
      'Turistas que quieren reservar desde otras provincias y no encuentran tu negocio online.',
      'Competencia local que ya tiene reserva digital y te saca clientes.',
      'Gestión manual que te limita a las horas que podés atender el teléfono.',
    ],
    localFacts: [
      'Salta es una de las capitales turísticas del NOA con millones de visitantes anuales.',
      'El sector gastronómico y hotelero salteño crece un 25% cada año.',
      'Los negocios digitalizados facturan un 30% más que los que dependen solo del boca a boca.',
    ],
    faqs: [
      { q: '¿Funciona para negocios turísticos en Salta?', a: 'Sí. Alojamientos, tours, gastronomía y servicios de bienestar pueden gestionar todas sus reservas con TurnoLink.' },
      { q: '¿Puedo cobrar en pesos?', a: 'Sí. Todo el sistema opera en pesos argentinos con Mercado Pago.' },
      { q: '¿Es gratis empezar?', a: 'Sí. Plan Gratis permanente con 30 reservas por mes.' },
    ],
  },
  'santa-fe': {
    slug: 'santa-fe',
    name: 'Santa Fe',
    province: 'Santa Fe',
    demonym: 'santafesinos',
    headline: 'Turnos online en Santa Fe',
    subtitle: 'Automatizá las reservas de tu negocio.',
    description: 'Negocios de la ciudad de Santa Fe profesionalizan su operación con TurnoLink. Reservas 24/7, señas con Mercado Pago y recordatorios automáticos.',
    seo: {
      title: 'Turnos Online en Santa Fe — Sistema de Reservas para Negocios',
      description: 'Sistema de turnos online para negocios en Santa Fe. Reservas 24/7, cobro con Mercado Pago, recordatorios automáticos. Empezá gratis.',
      keywords: ['turnos online santa fe', 'sistema de reservas santa fe', 'agenda digital santa fe', 'turnos peluquería santa fe', 'reservas online santa fe'],
    },
    topIndustries: [
      { label: 'Peluquerías & Barberías', href: '/belleza', icon: '✂️', desc: 'Agenda por profesional con señas.' },
      { label: 'Consultorios Médicos', href: '/salud', icon: '🩺', desc: 'Turnos médicos con fichas.' },
      { label: 'Canchas Deportivas', href: '/deportes', icon: '⚽', desc: 'Reservas y cobro automático.' },
      { label: 'Centros de Estética', href: '/belleza/centros-de-estetica', icon: '💆', desc: 'Tratamientos y promociones.' },
      { label: 'Tiendas', href: '/mercado', icon: '🛍️', desc: 'Catálogo digital online.' },
      { label: 'Espacios de Coworking', href: '/espacios-flexibles', icon: '🏢', desc: 'Salas y escritorios por hora.' },
    ],
    painPoints: [
      'Agenda manual que te limita y genera errores.',
      'Clientes que no aparecen y perdés el horario.',
      'Competencia que ya ofrece reserva online.',
    ],
    localFacts: [
      'Santa Fe capital tiene un ecosistema de servicios en constante crecimiento.',
      'El 65% de los consumidores santafesinos prefiere reservar digitalmente.',
      'Los negocios con turnos online retienen más clientes recurrentes.',
    ],
    faqs: [
      { q: '¿Funciona en Santa Fe ciudad?', a: 'Sí. TurnoLink funciona 100% online para cualquier negocio en Santa Fe capital y alrededores.' },
      { q: '¿Cuánto cuesta?', a: 'Plan Gratis permanente. Planes pagos desde $14.999/mes con prueba de 14 días.' },
      { q: '¿Mandan recordatorios?', a: 'Sí. Recordatorios automáticos por WhatsApp y email.' },
    ],
  },
  neuquen: {
    slug: 'neuquen',
    name: 'Neuquén',
    province: 'Neuquén',
    demonym: 'neuquinos',
    headline: 'Turnos online en Neuquén',
    subtitle: 'Tu negocio patagónico, digitalizado.',
    description: 'Negocios de Neuquén capital y la región automatizan sus reservas con TurnoLink.',
    seo: {
      title: 'Turnos Online en Neuquén — Sistema de Reservas para Negocios',
      description: 'Sistema de turnos online para negocios en Neuquén. Reservas 24/7, cobro con Mercado Pago, recordatorios automáticos. Empezá gratis.',
      keywords: ['turnos online neuquén', 'sistema de reservas neuquén', 'agenda digital neuquén', 'turnos peluquería neuquén', 'reservas online neuquén'],
    },
    topIndustries: [
      { label: 'Peluquerías & Barberías', href: '/belleza', icon: '✂️', desc: 'Agenda digital con señas.' },
      { label: 'Consultorios Médicos', href: '/salud', icon: '🩺', desc: 'Turnos por especialidad.' },
      { label: 'Canchas Deportivas', href: '/deportes', icon: '⚽', desc: 'Reservas de canchas.' },
      { label: 'Alquiler Temporario', href: '/alquiler-temporario', icon: '🏡', desc: 'Cabañas y alojamientos.' },
      { label: 'Tiendas & Comercios', href: '/mercado', icon: '🛍️', desc: 'Catálogo online.' },
      { label: 'Centros de Estética', href: '/belleza/centros-de-estetica', icon: '💆', desc: 'Tratamientos y packs.' },
    ],
    painPoints: [
      'Clientes que no pueden reservar fuera de horario comercial.',
      'Temporada de esquí y turismo que satura tu agenda.',
      'Gestión manual que frena tu crecimiento.',
    ],
    localFacts: [
      'Neuquén es polo económico de la Patagonia con alto poder adquisitivo.',
      'El turismo de nieve y aventura impulsa la demanda de reservas digitales.',
      'La región creció un 40% en emprendimientos de servicios.',
    ],
    faqs: [
      { q: '¿Funciona en Neuquén y la región?', a: 'Sí. Para negocios en Neuquén capital, Cipolletti, Plottier y toda la comarca.' },
      { q: '¿Es gratis?', a: 'Plan Gratis permanente. Planes pagos con 14 días de prueba.' },
    ],
  },
  'bahia-blanca': {
    slug: 'bahia-blanca',
    name: 'Bahía Blanca',
    province: 'Buenos Aires',
    demonym: 'bahienses',
    headline: 'Turnos online en Bahía Blanca',
    subtitle: 'Modernizá la gestión de tu negocio.',
    description: 'Negocios bahienses usan TurnoLink para automatizar reservas, cobrar señas y crecer profesionalmente.',
    seo: {
      title: 'Turnos Online en Bahía Blanca — Sistema de Reservas',
      description: 'Sistema de turnos online para negocios en Bahía Blanca. Reservas 24/7, cobro con Mercado Pago, recordatorios automáticos. Empezá gratis.',
      keywords: ['turnos online bahía blanca', 'sistema de reservas bahía blanca', 'agenda digital bahía blanca', 'turnos peluquería bahía blanca'],
    },
    topIndustries: [
      { label: 'Peluquerías & Barberías', href: '/belleza', icon: '✂️', desc: 'Agenda por profesional.' },
      { label: 'Consultorios Médicos', href: '/salud', icon: '🩺', desc: 'Turnos médicos digitales.' },
      { label: 'Canchas Deportivas', href: '/deportes', icon: '⚽', desc: 'Reservas automáticas.' },
      { label: 'Centros de Estética', href: '/belleza/centros-de-estetica', icon: '💆', desc: 'Tratamientos y packs.' },
      { label: 'Tiendas', href: '/mercado', icon: '🛍️', desc: 'Catálogo online.' },
      { label: 'Espacios Flexibles', href: '/espacios-flexibles', icon: '🏢', desc: 'Coworkings y salas.' },
    ],
    painPoints: [
      'WhatsApp colapsado con consultas de disponibilidad.',
      'No-show que te cuestan tiempo y plata.',
      'Herramientas genéricas que no se adaptan a tu rubro.',
    ],
    localFacts: [
      'Bahía Blanca es centro de servicios del sur bonaerense.',
      'El ecosistema emprendedor bahiense crece con fuerza cada año.',
      'Los negocios con reservas digitales cierran más turnos.',
    ],
    faqs: [
      { q: '¿Funciona en Bahía Blanca?', a: 'Sí. TurnoLink funciona 100% online para cualquier negocio en Bahía Blanca y la zona.' },
      { q: '¿Es gratis?', a: 'Plan Gratis permanente. Planes pagos desde $14.999/mes.' },
    ],
  },
};

/** Get all city slugs for generateStaticParams */
export function getCitySlugs(): string[] {
  return Object.keys(CITIES);
}

/** Get city data by slug */
export function getCityData(slug: string): CityData | null {
  return CITIES[slug] || null;
}
