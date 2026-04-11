/**
 * TurnoLink — AI Image Prompt Generator v2.0
 *
 * Generates optimized prompts for DALL-E, Stable Diffusion, Midjourney
 * based on the TurnoLink brand system with REAL UI descriptions.
 *
 * Usage:
 *   const { generateImagePrompt } = require('./prompt-generator');
 *   const result = generateImagePrompt({
 *     businessType: 'barbería',
 *     contentType: 'instagram_post',
 *     message: 'Reservá tu turno online',
 *   });
 *   console.log(result.prompt);
 */

const brandSystem = require('./turnolink-brand-system.json');

// ─── Real UI Screen Descriptions (for accurate mockups) ───

const uiScreens = {
  dashboard_laptop: 'MacBook-style silver laptop showing SaaS dashboard: left sidebar with teal TurnoLink logo and navigation menu items with small line icons, main content area has a full-width teal gradient header card with white greeting text and decorative translucent circular orbs, below that 4 colorful stats cards in a row (blue gradient card showing number 12 with calendar icon, emerald green gradient card with trending arrow icon, violet purple gradient card with clock icon, amber-to-orange gradient card showing number 5 with users icon — all with large bold white numbers and white icons), below the stats two white cards with subtle borders showing appointment list with colored avatar circles and status badges (amber for pending, blue for confirmed, green for completed) and a customer list with gradient avatars',

  dashboard_mobile: 'iPhone-style smartphone with borderless display showing mobile version of the same dashboard: bottom navigation bar with 5 small teal icons, scrollable content with teal gradient greeting card at top, 2x2 grid of colorful stats cards (blue, emerald, violet, amber gradients with white numbers), booking list below with avatar circles and colored status badges, clean white background with DM Sans font',

  booking_page_mobile: 'iPhone-style smartphone showing a clean booking page: business logo and name at top, grid of service cards each with a photo, service name in bold, price in teal, duration with clock icon, and a teal gradient "Reservar" button with arrow icon. Below: interactive calendar with teal-highlighted selected date, time slot buttons organized in a grid grouped by morning/afternoon/night with sun and moon icons, rounded-xl button style',

  calendar_view: 'Weekly calendar interface with hourly time grid, color-coded appointment blocks — amber blocks for pending bookings, blue for confirmed, emerald green for completed — each block has a 3px colored left border, customer name, service name, and tiny status badge. Clean white background, DM Sans font, Lucide line icons',

  public_page_desktop: 'Wide browser window showing a public booking page: hero section with cover photo and logo overlay, business name, star rating badges, contact buttons for WhatsApp and phone. Below: responsive grid of service cards with 16:9 photos, bold names, teal prices, gradient booking buttons. Calendar component with teal-highlighted dates and time slot grid',
};

const uiCompositions = {
  laptop_phone: `${uiScreens.dashboard_laptop}, beside it a ${uiScreens.dashboard_mobile}, both devices on a clean white surface with soft drop shadows`,

  laptop_phone_booking: `${uiScreens.dashboard_laptop}, beside it a ${uiScreens.booking_page_mobile}, showing the business owner view and client booking view side by side`,

  phone_only_dashboard: uiScreens.dashboard_mobile,

  phone_only_booking: uiScreens.booking_page_mobile,

  laptop_only: uiScreens.dashboard_laptop,

  triple_device: `${uiScreens.dashboard_laptop} center-left, ${uiScreens.booking_page_mobile} right and slightly forward, tablet behind showing ${uiScreens.calendar_view}, all floating with soft shadows on clean teal-to-white gradient surface`,
};

// ─── Industry Visual Context ───

const industryVisuals = {
  // Belleza
  'peluquería': {
    setting: 'modern hair salon interior with large mirrors, styling chairs, warm lighting',
    props: 'hair tools, scissors, blow dryer, styling products on shelf',
    mood: 'trendy, welcoming, stylish',
    audience: 'women 25-45',
  },
  'barbería': {
    setting: 'classic-modern barbershop with leather chairs, exposed brick, warm Edison bulbs',
    props: 'straight razor, barber pole, hot towel, beard oil bottles',
    mood: 'masculine, premium, confident',
    audience: 'men 20-40',
  },
  'estética': {
    setting: 'clean minimalist beauty clinic with white walls, soft pink accents, treatment bed',
    props: 'skincare products, LED light therapy device, soft towels',
    mood: 'luxurious, serene, professional',
    audience: 'women 25-50',
  },
  'uñas': {
    setting: 'chic nail studio with organized polish wall, manicure station, ring light',
    props: 'nail polish bottles, UV lamp, nail art tools, hand model',
    mood: 'colorful, creative, Instagram-worthy',
    audience: 'women 18-40',
  },
  'spa': {
    setting: 'tranquil spa environment with bamboo, candles, stone elements, warm dim lighting',
    props: 'essential oils, hot stones, towel rolls, zen garden',
    mood: 'peaceful, rejuvenating, premium',
    audience: 'adults 30-55',
  },
  'pestañas': {
    setting: 'modern lash studio with treatment bed, magnifying lamp, soft ambient lighting',
    props: 'lash extension trays, tweezers, eye pads, before/after results',
    mood: 'glamorous, detail-oriented, transformative',
    audience: 'women 20-40',
  },

  // Salud
  'consultorio': {
    setting: 'bright modern medical office with clean desk, diplomas on wall, natural light',
    props: 'stethoscope, tablet with patient records, comfortable chair',
    mood: 'trustworthy, professional, caring',
    audience: 'patients all ages',
  },
  'odontólogo': {
    setting: 'modern dental clinic with dental chair, clean surfaces, blue/teal accents',
    props: 'dental mirror, X-ray display, bright overhead lamp',
    mood: 'clean, precise, reassuring',
    audience: 'patients all ages',
  },
  'psicólogo': {
    setting: 'cozy therapy office with comfortable couch, warm lighting, bookshelf, plants',
    props: 'notebook, comfortable seating, soft textures, calming art',
    mood: 'safe, warm, empathetic',
    audience: 'adults 25-55',
  },
  'nutricionista': {
    setting: 'bright wellness office with healthy food displays, measuring tools, natural light',
    props: 'fresh fruits, meal plan charts, body composition scale',
    mood: 'healthy, motivating, scientific',
    audience: 'adults 20-50',
  },
  'kinesiólogo': {
    setting: 'rehabilitation clinic with exercise equipment, treatment table, clean space',
    props: 'resistance bands, foam roller, anatomy charts',
    mood: 'active, recovery-focused, professional',
    audience: 'adults 25-65',
  },

  // Profesionales
  'abogado': {
    setting: 'elegant law office with wooden desk, law books, framed certificates',
    props: 'legal documents, leather agenda, fountain pen, scales of justice',
    mood: 'authoritative, trustworthy, sophisticated',
    audience: 'professionals 30-60',
  },
  'contador': {
    setting: 'modern accounting office with dual monitors, organized desk, city view',
    props: 'financial reports, calculator, tax documents, coffee mug',
    mood: 'precise, reliable, organized',
    audience: 'business owners 25-55',
  },

  // Deportes
  'cancha': {
    setting: 'professional sports facility with synthetic turf, LED floodlights, scoreboard',
    props: 'soccer ball, padel racket, sports bag, water bottles',
    mood: 'energetic, competitive, social',
    audience: 'men 20-45',
  },
  'gimnasio': {
    setting: 'modern gym with free weights, machines, rubber floor, motivational wall',
    props: 'dumbbells, kettlebells, exercise mat, protein shaker',
    mood: 'powerful, motivating, intense',
    audience: 'adults 18-45',
  },
  'yoga': {
    setting: 'serene yoga studio with wooden floor, natural light, minimal decoration',
    props: 'yoga mat, blocks, incense, meditation cushion',
    mood: 'peaceful, mindful, balanced',
    audience: 'women 25-50',
  },
  'entrenador': {
    setting: 'outdoor training park or modern home gym with functional equipment',
    props: 'TRX bands, battle ropes, timer, training plan clipboard',
    mood: 'dynamic, personal, results-driven',
    audience: 'adults 25-45',
  },

  // Hospedaje
  'hotel': {
    setting: 'boutique hotel reception with modern design, key cards, ambient lighting',
    props: 'room keys, luggage, reception bell, welcome drink',
    mood: 'welcoming, luxurious, discreet',
    audience: 'couples 25-50',
  },
  'cabaña': {
    setting: 'rustic-modern cabin surrounded by nature, wooden deck, mountain/lake view',
    props: 'campfire, hammock, wine glasses, cozy blanket',
    mood: 'escapist, romantic, natural',
    audience: 'couples and families',
  },

  // Espacios
  'coworking': {
    setting: 'open-plan coworking space with standing desks, meeting pods, coffee bar',
    props: 'laptops, whiteboards, coffee cups, potted plants',
    mood: 'collaborative, innovative, productive',
    audience: 'freelancers and startups 25-40',
  },
};

// ─── Content Type Templates ───

const contentTemplates = {
  instagram_post: {
    aspect: '1:1 square composition (1080x1080)',
    style: 'eye-catching social media post, vibrant yet professional, clean layout with breathing room',
    guidelines: 'Strong visual hook, clear focal point, room for text overlay at bottom third',
    deviceLayout: 'laptop_phone',
  },
  instagram_story: {
    aspect: '9:16 vertical composition (1080x1920)',
    style: 'full-screen immersive story format, vertical framing, dynamic angles',
    guidelines: 'Top third for branding, center for main visual, bottom for CTA swipe-up area',
    deviceLayout: 'phone_only_dashboard',
  },
  instagram_reel_cover: {
    aspect: '9:16 vertical thumbnail, high contrast, single focal point',
    style: 'thumbnail-optimized with clear subject, minimal background clutter',
    guidelines: 'Must read well at small size, device or face front-center',
    deviceLayout: 'phone_only_booking',
  },
  facebook_ad: {
    aspect: '1.91:1 horizontal (1200x628)',
    style: 'professional ad creative, clean layout, product-benefit focused, split composition',
    guidelines: 'Left side: device mockup with real UI, right side: space for headline. Less than 20% text in image.',
    deviceLayout: 'laptop_phone_booking',
  },
  landing_hero: {
    aspect: '16:9 widescreen (1920x1080)',
    style: 'hero section background, gradient overlay compatible, cinematic depth, wide angle',
    guidelines: 'Left-aligned content space, right side visual weight with devices. Gradient-friendly.',
    deviceLayout: 'triple_device',
  },
  email_header: {
    aspect: '3:1 horizontal banner (600x200)',
    style: 'clean email header, centered branding, simple background, lightweight',
    guidelines: 'Minimal, loads fast, works with white email body below',
    deviceLayout: 'phone_only_booking',
  },
  blog_cover: {
    aspect: '16:9 (1200x675)',
    style: 'editorial style cover image, conceptual, slightly abstract, muted tones',
    guidelines: 'Space for title overlay, muted background, professional tone',
    deviceLayout: 'laptop_only',
  },
  mockup: {
    aspect: 'flexible, product-focused',
    style: 'device mockup showcase, floating screens, isometric or perspective view, premium presentation',
    guidelines: 'Show real UI elements: dashboard with stats, calendar, booking list. Clean desk or gradient background.',
    deviceLayout: 'triple_device',
  },
  whatsapp_status: {
    aspect: '9:16 vertical (1080x1920)',
    style: 'casual but branded, quick-read format, personal touch',
    guidelines: 'Simple message, branded colors, feels like a friend sharing a tip',
    deviceLayout: 'phone_only_dashboard',
  },
};

// ─── Prompt Builder ───

function generateImagePrompt(input) {
  const {
    businessType = 'peluquería',
    contentType = 'instagram_post',
    message = '',
    includeUI = false,
    mood: customMood = null,
    style: customStyle = null,
    darkMode = false,
    deviceLayout: customLayout = null,
  } = input;

  const businessKey = businessType.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const industry = findIndustry(businessKey);
  const template = contentTemplates[contentType] || contentTemplates.instagram_post;
  const brand = brandSystem;

  const layers = [];

  // Layer 1: Scene context (industry or generic)
  if (industry) {
    layers.push(industry.setting);
  } else {
    layers.push(`modern professional business environment, clean and organized workspace`);
  }

  // Layer 2: Device mockup with REAL UI description
  if (includeUI) {
    const layoutKey = customLayout || template.deviceLayout || 'laptop_phone';
    const composition = uiCompositions[layoutKey];
    if (composition) {
      layers.push(composition);
    } else {
      layers.push(uiCompositions.laptop_phone);
    }
  }

  // Layer 3: Industry props (only if no UI or as subtle background detail)
  if (industry?.props) {
    if (includeUI) {
      layers.push(`subtle background elements: ${industry.props}`);
    } else {
      layers.push(industry.props);
    }
  }

  // Layer 4: Content type composition
  layers.push(template.aspect);
  layers.push(template.style);

  // Layer 5: Brand visual identity
  const colorScheme = darkMode
    ? `dark mode interface on dark background (#0A1518), teal (#3F8697) accents glowing, dark cards (#1A1A1A) with subtle borders`
    : `clean white and teal (#3F8697) color scheme, white cards with subtle shadows, soft teal gradients`;
  layers.push(colorScheme);
  layers.push('DM Sans font throughout the interface');

  // Layer 6: Lighting
  layers.push(brand.image_generation.lighting);

  // Layer 7: Composition rules
  layers.push(brand.image_generation.composition);

  // Layer 8: Mood
  const mood = customMood || industry?.mood || 'professional, modern, welcoming';
  layers.push(`mood: ${mood}`);

  // Layer 9: Render quality
  const renderStyle = customStyle || 'Photorealistic UI render with actual interface data visible on screens, not wireframes';
  layers.push(renderStyle);
  layers.push('4K resolution, sharp details, professional commercial photography quality, award-winning ad creative');

  // Layer 10: Message context
  if (message) {
    layers.push(`the overall scene communicates: "${message}"`);
  }

  // Compose final prompt
  const prompt = layers.filter(Boolean).join('. ');

  // Build negative prompt
  const negativePrompt = brand.image_generation.negative_prompt;

  // Build metadata
  const metadata = {
    businessType,
    contentType,
    industry: industry ? businessType : 'generic',
    audience: industry?.audience || 'business owners',
    suggestedCTA: pickCTA(message),
    aspectRatio: template.aspect,
    deviceLayout: customLayout || template.deviceLayout,
    darkMode,
  };

  return {
    prompt,
    negativePrompt,
    metadata,
    guidelines: template.guidelines,
  };
}

// ─── Helpers ───

function findIndustry(key) {
  if (industryVisuals[key]) return industryVisuals[key];

  const aliases = {
    'barberia': 'barbería',
    'peluqueria': 'peluquería',
    'estetica': 'estética',
    'unas': 'uñas',
    'pestanas': 'pestañas',
    'consultorio medico': 'consultorio',
    'medico': 'consultorio',
    'doctor': 'consultorio',
    'dentista': 'odontólogo',
    'odontologo': 'odontólogo',
    'psicologo': 'psicólogo',
    'terapia': 'psicólogo',
    'nutricion': 'nutricionista',
    'kinesiologia': 'kinesiólogo',
    'fisioterapia': 'kinesiólogo',
    'cancha de futbol': 'cancha',
    'cancha de padel': 'cancha',
    'futbol': 'cancha',
    'padel': 'cancha',
    'gym': 'gimnasio',
    'crossfit': 'gimnasio',
    'personal trainer': 'entrenador',
    'entrenamiento': 'entrenador',
    'pilates': 'yoga',
    'cabana': 'cabaña',
    'cabanas': 'cabaña',
    'alquiler temporario': 'cabaña',
    'hotel por horas': 'hotel',
    'albergue': 'hotel',
    'oficina': 'coworking',
    'sala de reuniones': 'coworking',
    'nail': 'uñas',
    'nails': 'uñas',
    'lash': 'pestañas',
    'lashes': 'pestañas',
    'masajes': 'spa',
    'masaje': 'spa',
    'depilacion': 'estética',
    'cosmetologia': 'estética',
  };

  const normalized = key.toLowerCase();
  for (const [alias, target] of Object.entries(aliases)) {
    if (normalized.includes(alias)) {
      return industryVisuals[target];
    }
  }

  return null;
}

function pickCTA(message) {
  const ctas = brandSystem.marketing_context.cta_examples;
  if (!message) return ctas[0];

  const lower = message.toLowerCase();
  if (lower.includes('reserv') || lower.includes('turno')) return 'Reservá tu turno online';
  if (lower.includes('cobr') || lower.includes('pag')) return 'Activá cobro automático';
  if (lower.includes('gratis') || lower.includes('pru')) return 'Probalo 14 días gratis';
  if (lower.includes('agenda') || lower.includes('digital')) return 'Digitalizá tu agenda hoy';
  if (lower.includes('24') || lower.includes('siemp')) return 'Tu negocio abierto 24/7';
  return ctas[Math.floor(Math.random() * ctas.length)];
}

// ─── Batch Generator ───

function generateBatch(businessType, messages = []) {
  const types = ['instagram_post', 'instagram_story', 'facebook_ad'];
  const results = [];

  for (const contentType of types) {
    for (const message of messages) {
      results.push({
        contentType,
        message,
        ...generateImagePrompt({ businessType, contentType, message, includeUI: true }),
      });
    }
  }

  return results;
}

// ─── Examples ───

const examples = [
  {
    name: 'Promo barbería',
    input: {
      businessType: 'barbería',
      contentType: 'instagram_post',
      message: 'Reservá tu corte sin esperar — turnos online 24/7',
      includeUI: true,
    },
  },
  {
    name: 'Turnos online estética',
    input: {
      businessType: 'estética',
      contentType: 'instagram_story',
      message: 'Tus clientas reservan solas mientras dormís',
      includeUI: true,
    },
  },
  {
    name: 'Agenda digital peluquería',
    input: {
      businessType: 'peluquería',
      contentType: 'facebook_ad',
      message: 'Dejá de perder turnos por WhatsApp',
      includeUI: true,
    },
  },
];

// ─── CLI Mode ───

if (require.main === module) {
  console.log('=== TurnoLink Prompt Generator v2.0 — Ejemplos ===\n');

  for (const example of examples) {
    const result = generateImagePrompt(example.input);
    console.log(`--- ${example.name} ---`);
    console.log(`Input: ${JSON.stringify(example.input, null, 2)}`);
    console.log(`\nPrompt:\n${result.prompt}`);
    console.log(`\nNegative:\n${result.negativePrompt}`);
    console.log(`\nMetadata: ${JSON.stringify(result.metadata, null, 2)}`);
    console.log(`Guidelines: ${result.guidelines}`);
    console.log('\n');
  }
}

// ─── Exports ───

module.exports = {
  generateImagePrompt,
  generateBatch,
  examples,
  industryVisuals,
  contentTemplates,
  uiScreens,
  uiCompositions,
};
