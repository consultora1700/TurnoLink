import type { NicheConfig } from './types';

const ACCENT = '#06B6D4';
const PARENT_URL = '/alquiler-temporario';
const PARENT_LABEL = 'Alquiler Temporario';

const SHARED_PRICING = {
  hasFree: false,
  tiers: [
    {
      name: 'Dueño Pro',
      price: '$9.990',
      period: '/mes',
      features: ['Reservas ilimitadas', '1 propiedad', 'Cobro de señas con Mercado Pago', 'Recordatorios por WhatsApp', 'Link de reservas personalizado', 'Soporte por email'],
    },
    {
      name: 'Profesional',
      price: '$14.999',
      period: '/mes',
      popular: true,
      features: ['Todo lo de Dueño Pro', 'Hasta 5 propiedades', 'Recordatorios automáticos', 'Panel de métricas', 'Control de finanzas', 'Portal de empleados (hasta 3)', 'Soporte prioritario'],
    },
    {
      name: 'Business',
      price: '$29.999',
      period: '/mes',
      features: ['Todo lo de Profesional', 'Propiedades ilimitadas', 'Múltiples sucursales', 'Portal de empleados ilimitado', 'API e integraciones', 'Reportes avanzados', 'Control de finanzas', 'Gerente de cuenta dedicado', 'Onboarding personalizado'],
    },
  ],
};

const alquilerConfig: NicheConfig = {
  slug: 'alquiler-temporario',
  label: 'Alquiler Temporario',
  accent: ACCENT,
  url: PARENT_URL,
  subNiches: {
    'casas-quinta': {
      accent: ACCENT, parentNicheUrl: PARENT_URL, parentNicheLabel: PARENT_LABEL,
      seo: {
        title: 'TurnoLink para Casas Quinta — Reservas por Día y Cobro de Señas',
        description: 'Sistema de reservas para casas quinta. Alquiler por día, cobro de señas automático y calendario de disponibilidad. Probá 14 días gratis.',
        keywords: ['alquiler casa quinta online', 'reservas casa quinta', 'sistema reservas quinta', 'alquiler quinta por día argentina', 'señas quinta alquiler'],
      },
      pill: '🏡 Casas Quinta',
      heroTitle: 'Tu quinta siempre alquilada,',
      heroSubtitle: 'sin dolores de cabeza.',
      painPoints: [
        { title: 'Cancelaciones de último momento', desc: 'Reservan el fin de semana y cancelan el viernes. Sin seña, perdés el mejor día de facturación.' },
        { title: 'WhatsApp todo el día', desc: '"¿Está libre tal fecha? ¿Tiene pileta? ¿Cuántos entran?" Las mismas preguntas todo el día, todos los días.' },
        { title: 'Dobles reservas', desc: 'Sin calendario centralizado, a veces confirmás dos familias para el mismo fin de semana. Un desastre.' },
      ],
      capabilities: [
        { icon: 'CalendarCheck', title: 'Calendario de disponibilidad', desc: 'Tu huésped ve qué fechas están libres y reserva al instante. Sin ir y venir de mensajes.' },
        { icon: 'CreditCard', title: 'Seña obligatoria', desc: 'Sin seña no hay reserva. El huésped paga un porcentaje al reservar por Mercado Pago.' },
        { icon: 'Globe', title: 'Link para compartir', desc: 'En Marketplace, Instagram, Google y grupos de WhatsApp. Reservas desde cualquier canal.' },
        { icon: 'Bell', title: 'Recordatorios al huésped', desc: 'Antes de la fecha, el huésped recibe indicaciones de cómo llegar y reglas de la quinta.' },
        { icon: 'Shield', title: 'Políticas de cancelación', desc: 'Definí cuántos días antes puede cancelar sin perder la seña. Protegé tu ingreso.' },
        { icon: 'LayoutDashboard', title: 'Métricas de ocupación', desc: 'Días más reservados, ingresos por mes, tasa de cancelación. Todo claro.' },
      ],
      subIndustries: ['Quinta con pileta', 'Quinta con quincho', 'Quinta para eventos', 'Quinta familiar', 'Quinta con parque', 'Quinta para fiestas'],
      pricing: SHARED_PRICING,
      testimonials: [
        { quote: 'Las señas eliminaron las cancelaciones de fin de semana. Ahora solo vienen los que realmente van a venir.', name: 'Néstor Ferreyra', role: 'Dueño', business: 'Quinta Los Eucaliptos', image: 'https://randomuser.me/api/portraits/men/68.jpg' },
        { quote: 'Antes pasaba horas respondiendo las mismas preguntas. Ahora todo está en el link y las familias reservan solas.', name: 'Claudia Mansilla', role: 'Propietaria', business: 'Quinta La Tranquilidad', image: 'https://randomuser.me/api/portraits/women/72.jpg' },
        { quote: 'El calendario online eliminó las dobles reservas. Nunca más dos familias el mismo fin de semana.', name: 'Alejandro Bustos', role: 'Administrador', business: 'Quintas del Sur', image: 'https://randomuser.me/api/portraits/men/69.jpg' },
      ],
      faqs: [
        { q: '¿Puedo bloquear días que no alquilo?', a: 'Sí. Bloqueás feriados, mantenimiento o uso personal desde el calendario.' },
        { q: '¿Cuánto seña puedo cobrar?', a: 'Lo definís vos. Puede ser 30%, 50% o el total. Se cobra al momento de reservar.' },
        { q: '¿Funciona para reservas de varios días?', a: 'Sí. El huésped elige fecha de ingreso y egreso. El sistema calcula el total y la seña.' },
        { q: '¿Puedo poner reglas de la quinta?', a: 'Sí. Las reglas aparecen al reservar y se envían en el recordatorio previo a la fecha.' },
        { q: '¿Puedo tener varias quintas?', a: 'Sí. Con el plan Profesional gestionás hasta 5 propiedades desde una sola cuenta.' },
        { q: '¿Se integra con Mercado Pago?', a: 'Sí. Cobro automático directo a tu cuenta. Sin intermediarios.' },
      ],
      cta: { headline: 'Alquilá tu quinta', subtitle: 'sin complicaciones.', description: 'Creá tu cuenta gratis, cargá tu quinta y empezá a recibir reservas con señas automáticas.' },
    },

    cabanas: {
      accent: ACCENT, parentNicheUrl: PARENT_URL, parentNicheLabel: PARENT_LABEL,
      seo: {
        title: 'TurnoLink para Cabañas — Reservas Online y Gestión de Complejos',
        description: 'Sistema de reservas para complejos de cabañas. Gestión centralizada, cobro de señas y calendario online. Probá 14 días gratis.',
        keywords: ['reservas cabañas online', 'sistema reservas complejo cabañas', 'gestión cabañas', 'software cabañas argentina', 'alquiler cabañas señas'],
      },
      pill: '🛖 Cabañas',
      heroTitle: 'Tu complejo de cabañas',
      heroSubtitle: 'siempre reservado.',
      painPoints: [
        { title: 'Múltiples cabañas, un solo teléfono', desc: 'Gestionás 8, 10, 12 cabañas y respondés todo por WhatsApp. Es insostenible.' },
        { title: 'Temporada alta caótica', desc: 'En vacaciones te llueven consultas y no das abasto. Perdés reservas por no responder a tiempo.' },
        { title: 'Cancelaciones en temporada', desc: 'Reservan para enero y cancelan en diciembre. Sin seña, ese período queda vacío.' },
      ],
      capabilities: [
        { icon: 'Building2', title: 'Gestión de cabañas', desc: 'Cada cabaña como recurso: capacidad, amenities, precio. Todo configurable.' },
        { icon: 'CreditCard', title: 'Señas por reserva', desc: 'El huésped paga seña al reservar. Sin seña no hay reserva confirmada.' },
        { icon: 'CalendarCheck', title: 'Calendario centralizado', desc: 'Todas las cabañas en un solo calendario. Disponibilidad en tiempo real.' },
        { icon: 'Globe', title: 'Link de reservas', desc: 'Un solo link para todo el complejo. El huésped elige cabaña y fechas.' },
        { icon: 'Bell', title: 'Comunicación automática', desc: 'Confirmación, recordatorio y check-in: todo automático por WhatsApp.' },
        { icon: 'LayoutDashboard', title: 'Ocupación del complejo', desc: 'Qué cabañas están ocupadas, cuáles disponibles, ingresos del mes.' },
      ],
      subIndustries: ['Cabaña para 2', 'Cabaña familiar', 'Cabaña premium', 'Cabaña con jacuzzi', 'Cabaña pet friendly'],
      pricing: SHARED_PRICING,
      testimonials: [
        { quote: 'Administramos 12 cabañas y antes era un caos de WhatsApp. Ahora el huésped reserva y paga la seña online.', name: 'Valeria Torres', role: 'Dueña', business: 'Cabañas del Lago', image: 'https://randomuser.me/api/portraits/women/73.jpg' },
        { quote: 'En temporada alta ya no perdemos reservas. Los huéspedes ven la disponibilidad y reservan solos.', name: 'Daniel Pereyra', role: 'Gerente', business: 'Complejo Pinos del Sur', image: 'https://randomuser.me/api/portraits/men/70.jpg' },
        { quote: 'Las señas redujeron las cancelaciones un 90%. El cambio fue inmediato.', name: 'Lorena Guzmán', role: 'Administradora', business: 'Mountain Lodge Cabañas', image: 'https://randomuser.me/api/portraits/women/74.jpg' },
      ],
      faqs: [
        { q: '¿Puedo gestionar varias cabañas?', a: 'Sí. Cada cabaña tiene su ficha con fotos, capacidad, amenities y precio.' },
        { q: '¿Funciona para temporada alta y baja?', a: 'Sí. Definís precios de temporada alta, baja y media. El sistema aplica automáticamente.' },
        { q: '¿El huésped elige qué cabaña quiere?', a: 'Sí. Ve las cabañas disponibles con descripción y elige la que prefiere.' },
        { q: '¿Puedo cobrar precios distintos por cabaña?', a: 'Sí. Cabaña para 2 un precio, familiar otro, premium otro. Todo diferenciado.' },
        { q: '¿Funciona para estadías de una semana?', a: 'Sí. El huésped elige check-in y check-out. Sin límite de días.' },
        { q: '¿Puedo enviar instrucciones de llegada?', a: 'Sí. El recordatorio previo incluye dirección, indicaciones y reglas del complejo.' },
      ],
      cta: { headline: 'Gestioná tu complejo', subtitle: 'de cabañas sin estrés.', description: 'Creá tu cuenta gratis, cargá tus cabañas y recibí reservas con señas automáticas.' },
    },

    'departamentos-temporarios': {
      accent: ACCENT, parentNicheUrl: PARENT_URL, parentNicheLabel: PARENT_LABEL,
      seo: {
        title: 'TurnoLink para Departamentos Temporarios — Reservas y Cobros Online',
        description: 'Sistema de reservas para departamentos temporarios. Alquiler por día o semana con cobro automático. Probá 14 días gratis.',
        keywords: ['alquiler departamento temporario online', 'reservas depto temporario', 'sistema reservas departamento', 'alquiler temporario argentina'],
      },
      pill: '🏢 Departamentos Temporarios',
      heroTitle: 'Tus departamentos',
      heroSubtitle: 'siempre alquilados.',
      painPoints: [
        { title: 'Períodos vacíos', desc: 'Entre un huésped y otro pasan días sin reserva. Sin presencia online, nadie sabe que está libre.' },
        { title: 'Gestión de múltiples deptos', desc: 'Tenés 3, 5, 10 departamentos. Gestionar disponibilidad, limpieza y pagos es un trabajo full-time.' },
        { title: 'Plataformas que cobran mucho', desc: 'Airbnb cobra 15-20% de comisión. Querés un canal propio pero sin sistema es imposible.' },
      ],
      capabilities: [
        { icon: 'Building2', title: 'Multi-propiedad', desc: 'Gestioná todos tus departamentos desde un solo lugar. Cada uno con su ficha y precio.' },
        { icon: 'CreditCard', title: 'Canal propio de reservas', desc: 'Cobrá directo por Mercado Pago. Sin comisiones de plataformas intermediarias.' },
        { icon: 'CalendarCheck', title: 'Calendario sincronizado', desc: 'Disponibilidad en tiempo real. Sin dobles reservas ni errores.' },
        { icon: 'Globe', title: 'Link de reservas', desc: 'Tu propio canal de reservas en redes, Google y Marketplace.' },
        { icon: 'Bell', title: 'Check-in automático', desc: 'Instrucciones de llegada, código de acceso y reglas enviadas automáticamente.' },
        { icon: 'LayoutDashboard', title: 'Rentabilidad por depto', desc: 'Ocupación, ingresos y gastos por cada departamento. Sabé cuál rinde más.' },
      ],
      subIndustries: ['Monoambiente', 'Un dormitorio', 'Dos dormitorios', 'Loft', 'Penthouse', 'Departamento amoblado'],
      pricing: SHARED_PRICING,
      testimonials: [
        { quote: 'Dejé de depender de Airbnb. Ahora recibo reservas directas y me ahorro el 15% de comisión.', name: 'Mariano Fuentes', role: 'Inversor', business: 'MF Temporarios', image: 'https://randomuser.me/api/portraits/men/71.jpg' },
        { quote: 'Gestiono 8 departamentos desde la app. Antes era un Excel enorme lleno de errores.', name: 'Silvina Montero', role: 'Administradora', business: 'BA Temp Apartments', image: 'https://randomuser.me/api/portraits/women/75.jpg' },
        { quote: 'La ocupación subió un 20% porque ahora la gente me encuentra en Google y reserva directo.', name: 'Pablo Arancibia', role: 'Propietario', business: 'Palermo Suites', image: 'https://randomuser.me/api/portraits/men/72.jpg' },
      ],
      faqs: [
        { q: '¿Puedo gestionar varios departamentos?', a: 'Sí. Cada departamento tiene su ficha, calendario y precio. Todo desde una cuenta.' },
        { q: '¿Reemplaza Airbnb?', a: 'Es un canal complementario. Tenés tu propio link de reservas sin comisiones de intermediarios.' },
        { q: '¿Funciona para alquiler por día y por semana?', a: 'Sí. El huésped elige las fechas y el sistema calcula el total automáticamente.' },
        { q: '¿Puedo cobrar seña al reservar?', a: 'Sí. Definís el porcentaje de seña. Se cobra al momento de reservar.' },
        { q: '¿Se pueden enviar instrucciones de check-in?', a: 'Sí. Código de acceso, dirección y reglas se envían automáticamente antes de la llegada.' },
        { q: '¿Puedo tener precios por temporada?', a: 'Sí. Alta, baja y media. El sistema aplica el precio correcto según las fechas.' },
      ],
      cta: { headline: 'Tu canal directo', subtitle: 'de reservas.', description: 'Creá tu cuenta gratis, cargá tus deptos y empezá a recibir reservas sin intermediarios.' },
    },

    'campos-recreativos': {
      accent: ACCENT, parentNicheUrl: PARENT_URL, parentNicheLabel: PARENT_LABEL,
      seo: {
        title: 'TurnoLink para Campos Recreativos — Reservas por Día',
        description: 'Sistema de reservas para campos recreativos. Eventos, estadías y actividades al aire libre con cobro automático. Probá 14 días gratis.',
        keywords: ['reservas campo recreativo', 'alquiler campo eventos', 'sistema reservas campo', 'campo recreativo argentina'],
      },
      pill: '🌾 Campos Recreativos',
      heroTitle: 'Tu campo recreativo',
      heroSubtitle: 'reservado todos los fines de semana.',
      painPoints: [
        { title: 'Solo se alquila boca a boca', desc: 'Sin presencia online, solo te contactan los que ya te conocen. Perdés un mercado enorme.' },
        { title: 'Reservas sin compromiso', desc: 'Te dicen "dale, lo reservo" pero después no depositan ni confirman. Incertidumbre total.' },
        { title: 'Eventos que se cancelan', desc: 'Un cumpleaños de 50 personas cancelado a última hora. Sin seña, no recuperás nada.' },
      ],
      capabilities: [
        { icon: 'CalendarCheck', title: 'Calendario de eventos', desc: 'Cada día muestra si está libre u ocupado. Los clientes ven y reservan al instante.' },
        { icon: 'CreditCard', title: 'Seña para confirmar', desc: 'Sin seña no hay reserva. Eliminá la incertidumbre del "te confirmo después".' },
        { icon: 'Globe', title: 'Presencia online', desc: 'Link profesional con fotos, capacidad, amenities y precios. Que te encuentren y reserven.' },
        { icon: 'Users', title: 'Gestión de eventos', desc: 'Cumpleaños, jornadas empresariales, reuniones familiares. Cada tipo con su precio.' },
        { icon: 'Bell', title: 'Comunicación automática', desc: 'Confirmación, recordatorio e indicaciones de llegada. Todo automático.' },
        { icon: 'Shield', title: 'Políticas claras', desc: 'Reglas del campo, capacidad máxima y políticas de cancelación visibles al reservar.' },
      ],
      subIndustries: ['Eventos familiares', 'Jornadas empresariales', 'Cumpleaños', 'Casamientos', 'Retiros', 'Campamentos'],
      pricing: SHARED_PRICING,
      testimonials: [
        { quote: 'Antes solo me alquilaban los conocidos. Ahora me encuentran en Google y los fines de semana están todos reservados.', name: 'Hugo Montoya', role: 'Propietario', business: 'Campo Los Aromos', image: 'https://randomuser.me/api/portraits/men/73.jpg' },
        { quote: 'La seña eliminó las reservas fantasma. Solo vienen los que realmente pagaron.', name: 'Estela Gutiérrez', role: 'Dueña', business: 'El Remanso Campo', image: 'https://randomuser.me/api/portraits/women/76.jpg' },
        { quote: 'Gestiono todo desde el celular. Veo las reservas, los pagos y la ocupación en un solo lugar.', name: 'Carlos Leiva', role: 'Administrador', business: 'Campo Verde Recreación', image: 'https://randomuser.me/api/portraits/men/74.jpg' },
      ],
      faqs: [
        { q: '¿Puedo diferenciar tipos de evento?', a: 'Sí. Cumpleaños, empresarial, casamiento. Cada uno con su precio y duración.' },
        { q: '¿Funciona para alquiler de un solo día?', a: 'Sí. El cliente elige el día, paga la seña y queda confirmado.' },
        { q: '¿Puedo mostrar fotos del campo?', a: 'Sí. Tu ficha incluye descripción, fotos, amenities y reglas del espacio.' },
        { q: '¿La seña es configurable?', a: 'Sí. Definís el monto o porcentaje. Puede ser 30%, 50% o el total.' },
        { q: '¿Puedo poner capacidad máxima?', a: 'Sí. La capacidad aparece en la ficha para que el cliente sepa cuántos entran.' },
        { q: '¿Funciona para estadías de más de un día?', a: 'Sí. El cliente elige fecha de inicio y fin. El sistema calcula el total.' },
      ],
      cta: { headline: 'Alquilá tu campo', subtitle: 'todos los fines de semana.', description: 'Creá tu cuenta gratis, cargá tu campo con fotos y precios. Reservas con seña automática.' },
    },

    'salones-por-dia': {
      accent: ACCENT, parentNicheUrl: PARENT_URL, parentNicheLabel: PARENT_LABEL,
      seo: {
        title: 'TurnoLink para Salones de Fiestas — Reservas y Señas Online',
        description: 'Sistema de reservas para salones de fiestas y eventos. Calendario online, cobro de señas y gestión de fechas. Probá 14 días gratis.',
        keywords: ['reservas salón fiestas', 'alquiler salón eventos', 'sistema reservas salón', 'salón de fiestas online argentina', 'señas salón eventos'],
      },
      pill: '🎪 Salones por Día',
      heroTitle: 'Tu salón siempre reservado,',
      heroSubtitle: 'tus fines de semana asegurados.',
      painPoints: [
        { title: 'Fechas que se pierden', desc: 'Un sábado sin reserva es plata que no vuelve. Sin presencia online, perdés fechas valiosas.' },
        { title: 'Señas que no llegan', desc: 'El cliente dice que va a depositar y nunca lo hace. Mientras, rechazás otras consultas.' },
        { title: 'Consultas repetitivas', desc: '"¿Cuánto sale? ¿Tiene fecha para tal mes? ¿Cuántas personas entran?" Las mismas preguntas todo el día.' },
      ],
      capabilities: [
        { icon: 'CalendarCheck', title: 'Calendario de fechas', desc: 'Tus clientes ven qué fechas están libres y reservan al instante con seña.' },
        { icon: 'CreditCard', title: 'Seña automática', desc: 'Se cobra al reservar. Sin seña, la fecha no se bloquea. Cero incertidumbre.' },
        { icon: 'Globe', title: 'Ficha del salón', desc: 'Fotos, capacidad, amenities y precios visibles. El cliente tiene toda la info antes de reservar.' },
        { icon: 'Bell', title: 'Confirmación y recordatorio', desc: 'Confirmación inmediata y recordatorio antes del evento con instrucciones.' },
        { icon: 'Shield', title: 'Políticas de cancelación', desc: 'Definí plazos de cancelación claros. Si cancela tarde, la seña queda.' },
        { icon: 'LayoutDashboard', title: 'Ocupación y facturación', desc: 'Fechas reservadas, ingresos por mes, tipos de evento más populares.' },
      ],
      subIndustries: ['Cumpleaños', 'Casamientos', 'Bautismos', 'Eventos empresariales', 'Fiestas de 15', 'Graduaciones'],
      pricing: SHARED_PRICING,
      testimonials: [
        { quote: 'Las señas automáticas fueron un antes y después. Ya no persigo clientes para que depositen.', name: 'Graciela Peralta', role: 'Dueña', business: 'Salón La Fiesta', image: 'https://randomuser.me/api/portraits/women/77.jpg' },
        { quote: 'Los sábados estaban reservados 3 meses antes. El link en redes atrajo muchos clientes nuevos.', name: 'Roberto Villalba', role: 'Gerente', business: 'Gran Salón VIP', image: 'https://randomuser.me/api/portraits/men/76.jpg' },
        { quote: 'Ya no respondo las mismas preguntas todo el día. Todo está en el link y la gente reserva sola.', name: 'Sandra Molina', role: 'Propietaria', business: 'Salón Sandra Eventos', image: 'https://randomuser.me/api/portraits/women/78.jpg' },
      ],
      faqs: [
        { q: '¿Puedo cobrar señas distintas según el tipo de evento?', a: 'Sí. Cumpleaños $50.000, casamiento $150.000. Cada tipo con su seña.' },
        { q: '¿El cliente ve fotos del salón?', a: 'Sí. Tu ficha incluye fotos, capacidad, amenities y todo lo que necesita saber.' },
        { q: '¿Puedo bloquear fechas de mantenimiento?', a: 'Sí. Bloqueás cualquier fecha que no esté disponible para alquiler.' },
        { q: '¿Funciona para distintos tipos de evento?', a: 'Sí. Creás servicios para cumpleaños, casamientos, empresariales, cada uno con su precio.' },
        { q: '¿La confirmación es instantánea?', a: 'Sí. Al pagar la seña, el cliente recibe confirmación inmediata con los detalles.' },
        { q: '¿Puedo ofrecer servicios adicionales?', a: 'Sí. Catering, DJ, decoración. Como servicios extra al momento de reservar.' },
      ],
      cta: { headline: 'Llenà las fechas', subtitle: 'de tu salón.', description: 'Creá tu cuenta gratis, cargá tu salón y recibí reservas con señas automáticas.' },
    },

    quinchos: {
      accent: ACCENT, parentNicheUrl: PARENT_URL, parentNicheLabel: PARENT_LABEL,
      seo: {
        title: 'TurnoLink para Quinchos — Alquiler por Día con Señas Online',
        description: 'Sistema de reservas para quinchos en alquiler. Reservas por día, cobro de señas y calendario online. Probá 14 días gratis.',
        keywords: ['alquiler quincho online', 'reservas quincho', 'quincho para eventos', 'alquiler quincho parrilla argentina'],
      },
      pill: '🔥 Quinchos',
      heroTitle: 'Tu quincho alquilado',
      heroSubtitle: 'todos los fines de semana.',
      painPoints: [
        { title: 'Fines de semana vacíos', desc: 'Tu quincho es un recurso que solo genera plata cuando está alquilado. Cada fin de semana libre es pérdida.' },
        { title: 'Reservas informales', desc: '"Dale, lo reservo" por WhatsApp pero después no confirman ni depositan.' },
        { title: 'Limpieza y orden', desc: 'Algunos inquilinos dejan el quincho destruido. Sin reglas claras ni depósito, no tenés herramienta.' },
      ],
      capabilities: [
        { icon: 'CalendarCheck', title: 'Calendario visible', desc: 'Tus clientes ven las fechas disponibles y reservan en segundos.' },
        { icon: 'CreditCard', title: 'Seña + depósito', desc: 'Cobrá seña para confirmar y un depósito de garantía por posibles daños.' },
        { icon: 'Globe', title: 'Link de reservas', desc: 'Compartí en Marketplace, Instagram y grupos de barrio.' },
        { icon: 'Bell', title: 'Reglas al reservar', desc: 'El inquilino ve las reglas del quincho antes de confirmar. Sin sorpresas.' },
        { icon: 'Shield', title: 'Protección', desc: 'Políticas de cancelación y garantía por daños. Todo claro desde el inicio.' },
        { icon: 'LayoutDashboard', title: 'Ingresos mensuales', desc: 'Cuánto facturaste, cuántos días estuvo alquilado, próximas reservas.' },
      ],
      subIndustries: ['Quincho con parrilla', 'Quincho con pileta', 'Quincho para eventos', 'Quincho familiar', 'Quincho empresarial'],
      pricing: SHARED_PRICING,
      testimonials: [
        { quote: 'Antes alquilaba el quincho 2 fines de semana por mes. Ahora son 4 porque la gente lo encuentra online.', name: 'Raúl Méndez', role: 'Propietario', business: 'Quincho Don Raúl', image: 'https://randomuser.me/api/portraits/men/77.jpg' },
        { quote: 'La seña filtró a los que reservan sin compromiso. Ahora solo vienen los que pagaron.', name: 'María Inés Soria', role: 'Dueña', business: 'Quincho MI', image: 'https://randomuser.me/api/portraits/women/79.jpg' },
        { quote: 'Las reglas del quincho aparecen al reservar. El inquilino sabe qué puede y qué no antes de pagar.', name: 'Jorge Cáceres', role: 'Propietario', business: 'El Quincho de Jorge', image: 'https://randomuser.me/api/portraits/men/78.jpg' },
      ],
      faqs: [
        { q: '¿Puedo cobrar seña y depósito de garantía?', a: 'Sí. La seña confirma la reserva y el depósito protege contra daños.' },
        { q: '¿Funciona para quincho de uso diario?', a: 'Sí. El cliente elige el día, paga y queda reservado. Ideal para almuerzos y cenas.' },
        { q: '¿Puedo poner reglas del quincho?', a: 'Sí. Las reglas son visibles al reservar. El inquilino las acepta antes de confirmar.' },
        { q: '¿Funciona para un solo quincho?', a: 'Perfecto. El plan Gratis es ideal para un solo espacio.' },
        { q: '¿Puedo poner fotos del quincho?', a: 'Sí. Fotos, capacidad, amenities y descripción completa.' },
        { q: '¿El pago es por Mercado Pago?', a: 'Sí. Seña y depósito se cobran automáticamente. Sin efectivo.' },
      ],
      cta: { headline: 'Alquilá tu quincho', subtitle: 'sin esfuerzo.', description: 'Creá tu cuenta gratis, cargá tu quincho y recibí reservas con señas automáticas.' },
    },

    'espacios-para-eventos': {
      accent: ACCENT, parentNicheUrl: PARENT_URL, parentNicheLabel: PARENT_LABEL,
      seo: {
        title: 'TurnoLink para Espacios de Eventos — Reservas Online',
        description: 'Sistema de reservas para espacios de eventos al aire libre. Jardines, terrazas y rooftops con cobro automático. Probá 14 días gratis.',
        keywords: ['alquiler espacio eventos', 'reservas jardín eventos', 'terraza para eventos', 'espacio al aire libre eventos argentina'],
      },
      pill: '🎉 Espacios para Eventos',
      heroTitle: 'Tu espacio de eventos',
      heroSubtitle: 'siempre reservado.',
      painPoints: [
        { title: 'Estacionalidad', desc: 'En primavera y verano tenés demanda. En invierno, el espacio está vacío. Sin promoción, no llenás.' },
        { title: 'Consultas sin cierre', desc: 'La gente consulta pero no reserva. Sin seña inmediata, la consulta se enfría.' },
        { title: 'Coordinación compleja', desc: 'Catering, DJ, decoración, armado. Coordinar todo por WhatsApp es un laberinto.' },
      ],
      capabilities: [
        { icon: 'CalendarCheck', title: 'Calendario de disponibilidad', desc: 'Fechas libres y ocupadas. El cliente elige y reserva al instante.' },
        { icon: 'CreditCard', title: 'Seña para cerrar', desc: 'Convertí consultas en reservas con cobro de seña inmediato al confirmar.' },
        { icon: 'Globe', title: 'Vitrina online', desc: 'Fotos del espacio, capacidad, amenities y testimonios. Tu mejor herramienta de venta.' },
        { icon: 'Users', title: 'Tipos de evento', desc: 'Casamientos, corporativos, cumpleaños. Cada tipo con su setup y precio.' },
        { icon: 'Bell', title: 'Comunicación automatizada', desc: 'Confirmación, recordatorio y checklist pre-evento. Todo sin intervención manual.' },
        { icon: 'LayoutDashboard', title: 'Métricas del espacio', desc: 'Eventos realizados, ingresos, tipos más populares y ocupación estacional.' },
      ],
      subIndustries: ['Jardines', 'Terrazas', 'Rooftops', 'Patios', 'Galerías', 'Espacios al aire libre'],
      pricing: SHARED_PRICING,
      testimonials: [
        { quote: 'Los casamientos se reservan con 6 meses de anticipación. El calendario online me permite gestionar todo sin drama.', name: 'Ana Belén Córdoba', role: 'Dueña', business: 'Jardín del Sol Eventos', image: 'https://randomuser.me/api/portraits/women/80.jpg' },
        { quote: 'La seña convierte consultas en reservas. Antes el 70% de las consultas no cerraban.', name: 'Matías Quiroga', role: 'Director', business: 'Terraza Q Eventos', image: 'https://randomuser.me/api/portraits/men/79.jpg' },
        { quote: 'En invierno ofrezco descuentos y los promociono con el link. La ocupación en meses fríos mejoró un 50%.', name: 'Celeste Mansilla', role: 'Gerente', business: 'Cielo Abierto Eventos', image: 'https://randomuser.me/api/portraits/women/81.jpg' },
      ],
      faqs: [
        { q: '¿Puedo tener precios por temporada?', a: 'Sí. Primavera-verano un precio, otoño-invierno otro. El sistema aplica automáticamente.' },
        { q: '¿Funciona para distintos tipos de evento?', a: 'Sí. Casamiento, corporativo, cumpleaños. Cada uno con su capacidad, setup y precio.' },
        { q: '¿Puedo mostrar fotos del espacio?', a: 'Sí. Galería de fotos, video, descripción y testimonios de eventos anteriores.' },
        { q: '¿La seña se cobra al instante?', a: 'Sí. Al confirmar la reserva, el pago se procesa por Mercado Pago inmediatamente.' },
        { q: '¿Puedo ofrecer servicios extra?', a: 'Sí. Catering, DJ, decoración, iluminación. Como opciones adicionales al reservar.' },
        { q: '¿Funciona para reservas con mucha anticipación?', a: 'Sí. El calendario permite reservar con meses de anticipación sin problemas.' },
      ],
      cta: { headline: 'Llenà la agenda', subtitle: 'de tu espacio de eventos.', description: 'Creá tu cuenta gratis, cargá tu espacio y recibí reservas con señas automáticas.' },
    },
  },
};

export default alquilerConfig;
