import { PrismaClient } from '../prisma';

const prisma = new PrismaClient();

interface SystemTemplate {
  name: string;
  category: string;
  width: number;
  height: number;
  layers: any[];
}

// Helper to create gradient layer
function gradientRect(x: number, y: number, w: number, h: number, startColor: string, endColor: string, direction: 'diagonal' | 'vertical' | 'horizontal' = 'diagonal', cornerRadius = 0) {
  const endX = direction === 'vertical' ? x : x + w;
  const endY = direction === 'horizontal' ? y : y + h;
  return {
    type: 'rect',
    attrs: {
      x, y, width: w, height: h, fill: startColor, cornerRadius,
      fillLinearGradient: {
        start: { x: 0, y: 0 },
        end: { x: endX === x ? 0 : w, y: endY === y ? 0 : h },
        colorStops: [
          { offset: 0, color: startColor },
          { offset: 1, color: endColor },
        ],
      },
    },
  };
}

const SYSTEM_TEMPLATES: SystemTemplate[] = [
  // ====================================================================
  // POST INSTAGRAM 1080×1080 (5 templates)
  // ====================================================================
  {
    name: 'Gradiente Profesional',
    category: 'social_post',
    width: 1080,
    height: 1080,
    layers: [
      // Background gradient
      gradientRect(0, 0, 1080, 1080, '{{primaryColor}}', '{{secondaryColor}}', 'diagonal'),
      // Decorative circle
      { type: 'circle', attrs: { x: 900, y: 180, radius: 200, fill: '#ffffff', opacity: 0.08 } },
      { type: 'circle', attrs: { x: 150, y: 900, radius: 150, fill: '#ffffff', opacity: 0.06 } },
      // Title
      {
        type: 'text',
        attrs: {
          x: 80, y: 280, text: '{{businessName}}', fontSize: 64, fontFamily: 'Arial',
          fill: '#ffffff', fontWeight: 'bold', width: 920,
          shadowColor: 'rgba(0,0,0,0.3)', shadowBlur: 10, shadowOffsetY: 4,
        },
      },
      // Subtitle
      {
        type: 'text',
        attrs: {
          x: 80, y: 440, text: '{{tagline}}', fontSize: 32, fontFamily: 'Arial',
          fill: '#ffffff', opacity: 0.9, width: 920, lineHeight: 1.5,
        },
      },
      // CTA badge
      {
        type: 'rect',
        attrs: {
          x: 80, y: 850, width: 320, height: 70, fill: '#ffffff', cornerRadius: 35,
          shadowColor: 'rgba(0,0,0,0.2)', shadowBlur: 15, shadowOffsetY: 5,
        },
      },
      {
        type: 'text',
        attrs: {
          x: 150, y: 870, text: '{{cta}}', fontSize: 24, fontFamily: 'Arial',
          fill: '{{primaryColor}}', fontWeight: 'bold',
        },
      },
    ],
  },
  {
    name: 'Foto + Overlay',
    category: 'social_post',
    width: 1080,
    height: 1080,
    layers: [
      // Base background (dark)
      { type: 'rect', attrs: { x: 0, y: 0, width: 1080, height: 1080, fill: '#1a1a2e' } },
      // Overlay gradient from bottom
      gradientRect(0, 400, 1080, 680, 'rgba(0,0,0,0)', 'rgba(0,0,0,0.85)', 'vertical'),
      // Logo area (top-right)
      {
        type: 'rect',
        attrs: { x: 860, y: 40, width: 180, height: 60, fill: '{{primaryColor}}', cornerRadius: 30, opacity: 0.9 },
      },
      {
        type: 'text',
        attrs: {
          x: 880, y: 55, text: '{{businessName}}', fontSize: 16, fontFamily: 'Arial',
          fill: '#ffffff', fontWeight: 'bold', width: 140,
        },
      },
      // Title centered
      {
        type: 'text',
        attrs: {
          x: 540, y: 620, text: '{{title}}', fontSize: 56, fontFamily: 'Arial',
          fill: '#ffffff', fontWeight: 'bold', align: 'center', width: 900,
          shadowColor: 'rgba(0,0,0,0.5)', shadowBlur: 15, shadowOffsetY: 3,
        },
      },
      // Subtitle
      {
        type: 'text',
        attrs: {
          x: 540, y: 750, text: '{{subtitle}}', fontSize: 28, fontFamily: 'Arial',
          fill: '#ffffff', opacity: 0.85, align: 'center', width: 800, lineHeight: 1.4,
        },
      },
      // CTA
      {
        type: 'rect',
        attrs: { x: 390, y: 880, width: 300, height: 60, fill: '{{accentColor}}', cornerRadius: 30 },
      },
      {
        type: 'text',
        attrs: {
          x: 540, y: 895, text: '{{cta}}', fontSize: 22, fontFamily: 'Arial',
          fill: '#ffffff', fontWeight: 'bold', align: 'center',
        },
      },
    ],
  },
  {
    name: 'Split Moderno',
    category: 'social_post',
    width: 1080,
    height: 1080,
    layers: [
      // Right side (light)
      { type: 'rect', attrs: { x: 0, y: 0, width: 1080, height: 1080, fill: '#f8f9fa' } },
      // Left side (primary)
      { type: 'rect', attrs: { x: 0, y: 0, width: 520, height: 1080, fill: '{{primaryColor}}' } },
      // Accent line
      { type: 'rect', attrs: { x: 520, y: 0, width: 6, height: 1080, fill: '{{accentColor}}' } },
      // Title (left)
      {
        type: 'text',
        attrs: {
          x: 60, y: 320, text: '{{businessName}}', fontSize: 52, fontFamily: 'Arial',
          fill: '#ffffff', fontWeight: 'bold', width: 400, lineHeight: 1.1,
        },
      },
      // Subtitle (left)
      {
        type: 'text',
        attrs: {
          x: 60, y: 520, text: '{{tagline}}', fontSize: 24, fontFamily: 'Arial',
          fill: '#ffffff', opacity: 0.85, width: 400, lineHeight: 1.5,
        },
      },
      // CTA (left)
      {
        type: 'rect',
        attrs: { x: 60, y: 750, width: 260, height: 56, fill: '#ffffff', cornerRadius: 28 },
      },
      {
        type: 'text',
        attrs: {
          x: 110, y: 763, text: '{{cta}}', fontSize: 20, fontFamily: 'Arial',
          fill: '{{primaryColor}}', fontWeight: 'bold',
        },
      },
      // Right side text
      {
        type: 'text',
        attrs: {
          x: 580, y: 450, text: '{{subtitle}}', fontSize: 28, fontFamily: 'Arial',
          fill: '#333333', width: 440, lineHeight: 1.6,
        },
      },
    ],
  },
  {
    name: 'Card Elegante',
    category: 'social_post',
    width: 1080,
    height: 1080,
    layers: [
      // Light background
      { type: 'rect', attrs: { x: 0, y: 0, width: 1080, height: 1080, fill: '#f0f0f0' } },
      // Top accent bar
      { type: 'rect', attrs: { x: 0, y: 0, width: 1080, height: 8, fill: '{{primaryColor}}' } },
      // Main card with shadow
      {
        type: 'rect',
        attrs: {
          x: 60, y: 100, width: 960, height: 880, fill: '#ffffff', cornerRadius: 24,
          shadowColor: 'rgba(0,0,0,0.12)', shadowBlur: 30, shadowOffsetY: 10,
        },
      },
      // Decorative accent circle
      { type: 'circle', attrs: { x: 540, y: 300, radius: 50, fill: '{{primaryColor}}', opacity: 0.15 } },
      // Title
      {
        type: 'text',
        attrs: {
          x: 540, y: 370, text: '{{businessName}}', fontSize: 48, fontFamily: 'Arial',
          fill: '#1a1a1a', fontWeight: 'bold', align: 'center', width: 800,
        },
      },
      // Divider
      { type: 'rect', attrs: { x: 440, y: 470, width: 200, height: 3, fill: '{{primaryColor}}' } },
      // Subtitle
      {
        type: 'text',
        attrs: {
          x: 540, y: 530, text: '{{tagline}}', fontSize: 26, fontFamily: 'Arial',
          fill: '#666666', align: 'center', width: 700, lineHeight: 1.5,
        },
      },
      // CTA
      {
        type: 'rect',
        attrs: { x: 360, y: 780, width: 360, height: 64, fill: '{{primaryColor}}', cornerRadius: 32 },
      },
      {
        type: 'text',
        attrs: {
          x: 540, y: 797, text: '{{cta}}', fontSize: 22, fontFamily: 'Arial',
          fill: '#ffffff', fontWeight: 'bold', align: 'center',
        },
      },
    ],
  },
  {
    name: 'Bold Promo',
    category: 'social_post',
    width: 1080,
    height: 1080,
    layers: [
      // Vibrant background
      { type: 'rect', attrs: { x: 0, y: 0, width: 1080, height: 1080, fill: '{{primaryColor}}' } },
      // Big decorative circle
      { type: 'circle', attrs: { x: 540, y: 400, radius: 220, fill: '#ffffff', opacity: 0.12 } },
      // Big number/title
      {
        type: 'text',
        attrs: {
          x: 540, y: 250, text: '{{title}}', fontSize: 140, fontFamily: 'Arial',
          fill: '#ffffff', fontWeight: 'bold', align: 'center',
          shadowColor: 'rgba(0,0,0,0.2)', shadowBlur: 10, shadowOffsetY: 4,
        },
      },
      // Subtitle
      {
        type: 'text',
        attrs: {
          x: 540, y: 520, text: '{{subtitle}}', fontSize: 44, fontFamily: 'Arial',
          fill: '#ffffff', fontWeight: 'bold', align: 'center',
        },
      },
      // Description
      {
        type: 'text',
        attrs: {
          x: 540, y: 660, text: '{{tagline}}', fontSize: 26, fontFamily: 'Arial',
          fill: '#ffffff', opacity: 0.9, align: 'center', width: 800, lineHeight: 1.5,
        },
      },
      // CTA badge
      {
        type: 'rect',
        attrs: { x: 330, y: 840, width: 420, height: 70, fill: '#ffffff', cornerRadius: 35 },
      },
      {
        type: 'text',
        attrs: {
          x: 540, y: 860, text: '{{cta}}', fontSize: 24, fontFamily: 'Arial',
          fill: '{{primaryColor}}', fontWeight: 'bold', align: 'center',
        },
      },
    ],
  },

  // ====================================================================
  // STORY INSTAGRAM 1080×1920 (5 templates)
  // ====================================================================
  {
    name: 'Gradiente Vertical',
    category: 'story',
    width: 1080,
    height: 1920,
    layers: [
      gradientRect(0, 0, 1080, 1920, '{{primaryColor}}', '{{secondaryColor}}', 'vertical'),
      // Decorative circles
      { type: 'circle', attrs: { x: 800, y: 300, radius: 180, fill: '#ffffff', opacity: 0.06 } },
      { type: 'circle', attrs: { x: 200, y: 1500, radius: 140, fill: '#ffffff', opacity: 0.05 } },
      // Logo area top
      {
        type: 'rect',
        attrs: { x: 390, y: 120, width: 300, height: 50, fill: 'rgba(255,255,255,0.2)', cornerRadius: 25 },
      },
      {
        type: 'text',
        attrs: {
          x: 540, y: 130, text: '{{businessName}}', fontSize: 20, fontFamily: 'Arial',
          fill: '#ffffff', fontWeight: 'bold', align: 'center',
        },
      },
      // Title (center)
      {
        type: 'text',
        attrs: {
          x: 60, y: 700, text: '{{title}}', fontSize: 72, fontFamily: 'Arial',
          fill: '#ffffff', fontWeight: 'bold', width: 960, lineHeight: 1.15,
          shadowColor: 'rgba(0,0,0,0.3)', shadowBlur: 15, shadowOffsetY: 5,
        },
      },
      // Subtitle
      {
        type: 'text',
        attrs: {
          x: 60, y: 1000, text: '{{subtitle}}', fontSize: 32, fontFamily: 'Arial',
          fill: '#ffffff', opacity: 0.9, width: 960, lineHeight: 1.4,
        },
      },
      // CTA bottom
      {
        type: 'rect',
        attrs: { x: 290, y: 1600, width: 500, height: 70, fill: '#ffffff', cornerRadius: 35 },
      },
      {
        type: 'text',
        attrs: {
          x: 540, y: 1620, text: '{{cta}}', fontSize: 24, fontFamily: 'Arial',
          fill: '{{primaryColor}}', fontWeight: 'bold', align: 'center',
        },
      },
      // Swipe indicator
      {
        type: 'text',
        attrs: {
          x: 540, y: 1780, text: 'Desliza para más →', fontSize: 18, fontFamily: 'Arial',
          fill: '#ffffff', opacity: 0.5, align: 'center',
        },
      },
    ],
  },
  {
    name: 'Foto Full Story',
    category: 'story',
    width: 1080,
    height: 1920,
    layers: [
      // Dark base
      { type: 'rect', attrs: { x: 0, y: 0, width: 1080, height: 1920, fill: '#111111' } },
      // Bottom gradient overlay
      gradientRect(0, 1000, 1080, 920, 'rgba(0,0,0,0)', 'rgba(0,0,0,0.9)', 'vertical'),
      // Logo top
      {
        type: 'rect',
        attrs: { x: 40, y: 60, width: 180, height: 50, fill: '{{primaryColor}}', cornerRadius: 25 },
      },
      {
        type: 'text',
        attrs: {
          x: 60, y: 70, text: '{{businessName}}', fontSize: 16, fontFamily: 'Arial',
          fill: '#ffffff', fontWeight: 'bold', width: 140,
        },
      },
      // Title over gradient
      {
        type: 'text',
        attrs: {
          x: 60, y: 1250, text: '{{title}}', fontSize: 64, fontFamily: 'Arial',
          fill: '#ffffff', fontWeight: 'bold', width: 960, lineHeight: 1.15,
        },
      },
      // Subtitle
      {
        type: 'text',
        attrs: {
          x: 60, y: 1500, text: '{{subtitle}}', fontSize: 28, fontFamily: 'Arial',
          fill: '#ffffff', opacity: 0.8, width: 960, lineHeight: 1.4,
        },
      },
      // CTA
      {
        type: 'rect',
        attrs: { x: 60, y: 1700, width: 400, height: 64, fill: '{{accentColor}}', cornerRadius: 32 },
      },
      {
        type: 'text',
        attrs: {
          x: 180, y: 1717, text: '{{cta}}', fontSize: 22, fontFamily: 'Arial',
          fill: '#ffffff', fontWeight: 'bold',
        },
      },
    ],
  },
  {
    name: 'Servicios Story',
    category: 'story',
    width: 1080,
    height: 1920,
    layers: [
      // Background
      { type: 'rect', attrs: { x: 0, y: 0, width: 1080, height: 1920, fill: '#ffffff' } },
      // Header bar
      { type: 'rect', attrs: { x: 0, y: 0, width: 1080, height: 380, fill: '{{primaryColor}}' } },
      // Header title
      {
        type: 'text',
        attrs: {
          x: 60, y: 130, text: '{{businessName}}', fontSize: 52, fontFamily: 'Arial',
          fill: '#ffffff', fontWeight: 'bold', width: 960,
        },
      },
      {
        type: 'text',
        attrs: {
          x: 60, y: 240, text: 'Nuestros Servicios', fontSize: 28, fontFamily: 'Arial',
          fill: '#ffffff', opacity: 0.85,
        },
      },
      // Service card 1
      {
        type: 'rect',
        attrs: {
          x: 60, y: 440, width: 960, height: 200, fill: '#f8f9fa', cornerRadius: 20,
          shadowColor: 'rgba(0,0,0,0.06)', shadowBlur: 15, shadowOffsetY: 4,
        },
      },
      { type: 'rect', attrs: { x: 60, y: 440, width: 8, height: 200, fill: '{{accentColor}}', cornerRadius: 4 } },
      {
        type: 'text',
        attrs: {
          x: 100, y: 490, text: '{{title}}', fontSize: 28, fontFamily: 'Arial',
          fill: '#1a1a1a', fontWeight: 'bold', width: 880,
        },
      },
      {
        type: 'text',
        attrs: {
          x: 100, y: 550, text: '{{subtitle}}', fontSize: 20, fontFamily: 'Arial',
          fill: '#888888', width: 880, lineHeight: 1.4,
        },
      },
      // Service card 2
      {
        type: 'rect',
        attrs: {
          x: 60, y: 680, width: 960, height: 200, fill: '#f8f9fa', cornerRadius: 20,
          shadowColor: 'rgba(0,0,0,0.06)', shadowBlur: 15, shadowOffsetY: 4,
        },
      },
      { type: 'rect', attrs: { x: 60, y: 680, width: 8, height: 200, fill: '{{primaryColor}}', cornerRadius: 4 } },
      {
        type: 'text',
        attrs: {
          x: 100, y: 730, text: 'Servicio destacado', fontSize: 28, fontFamily: 'Arial',
          fill: '#1a1a1a', fontWeight: 'bold', width: 880,
        },
      },
      {
        type: 'text',
        attrs: {
          x: 100, y: 790, text: 'Calidad y profesionalismo garantizado', fontSize: 20, fontFamily: 'Arial',
          fill: '#888888', width: 880, lineHeight: 1.4,
        },
      },
      // Service card 3
      {
        type: 'rect',
        attrs: {
          x: 60, y: 920, width: 960, height: 200, fill: '#f8f9fa', cornerRadius: 20,
          shadowColor: 'rgba(0,0,0,0.06)', shadowBlur: 15, shadowOffsetY: 4,
        },
      },
      { type: 'rect', attrs: { x: 60, y: 920, width: 8, height: 200, fill: '{{secondaryColor}}', cornerRadius: 4 } },
      {
        type: 'text',
        attrs: {
          x: 100, y: 970, text: 'Más servicios', fontSize: 28, fontFamily: 'Arial',
          fill: '#1a1a1a', fontWeight: 'bold', width: 880,
        },
      },
      {
        type: 'text',
        attrs: {
          x: 100, y: 1030, text: 'Descubrí todo lo que podemos hacer por vos', fontSize: 20, fontFamily: 'Arial',
          fill: '#888888', width: 880, lineHeight: 1.4,
        },
      },
      // CTA bottom
      {
        type: 'rect',
        attrs: { x: 260, y: 1650, width: 560, height: 70, fill: '{{primaryColor}}', cornerRadius: 35 },
      },
      {
        type: 'text',
        attrs: {
          x: 540, y: 1670, text: '{{cta}}', fontSize: 24, fontFamily: 'Arial',
          fill: '#ffffff', fontWeight: 'bold', align: 'center',
        },
      },
    ],
  },
  {
    name: 'Testimonio Story',
    category: 'story',
    width: 1080,
    height: 1920,
    layers: [
      // Background gradient
      gradientRect(0, 0, 1080, 1920, '{{primaryColor}}', '{{secondaryColor}}', 'diagonal'),
      // Quote marks
      {
        type: 'text',
        attrs: {
          x: 80, y: 550, text: '"', fontSize: 200, fontFamily: 'Georgia',
          fill: '#ffffff', opacity: 0.15,
        },
      },
      // Quote text
      {
        type: 'text',
        attrs: {
          x: 80, y: 750, text: '{{title}}', fontSize: 44, fontFamily: 'Arial',
          fill: '#ffffff', fontWeight: 'bold', width: 920, lineHeight: 1.4,
        },
      },
      // Attribution line
      { type: 'rect', attrs: { x: 80, y: 1100, width: 60, height: 4, fill: '{{accentColor}}' } },
      {
        type: 'text',
        attrs: {
          x: 80, y: 1140, text: '{{subtitle}}', fontSize: 24, fontFamily: 'Arial',
          fill: '#ffffff', opacity: 0.8,
        },
      },
      // Business name bottom
      {
        type: 'text',
        attrs: {
          x: 540, y: 1700, text: '{{businessName}}', fontSize: 24, fontFamily: 'Arial',
          fill: '#ffffff', opacity: 0.6, align: 'center',
        },
      },
    ],
  },
  {
    name: 'Promo Flash Story',
    category: 'story',
    width: 1080,
    height: 1920,
    layers: [
      // Dark background
      { type: 'rect', attrs: { x: 0, y: 0, width: 1080, height: 1920, fill: '#1a1a2e' } },
      // Accent diagonal band
      {
        type: 'rect',
        attrs: {
          x: -100, y: 600, width: 1300, height: 200, fill: '{{primaryColor}}',
          rotation: -8,
        },
      },
      // Flash badge
      {
        type: 'rect',
        attrs: { x: 340, y: 300, width: 400, height: 50, fill: '{{accentColor}}', cornerRadius: 25 },
      },
      {
        type: 'text',
        attrs: {
          x: 540, y: 310, text: 'OFERTA FLASH', fontSize: 22, fontFamily: 'Arial',
          fill: '#ffffff', fontWeight: 'bold', align: 'center',
        },
      },
      // Big promo text
      {
        type: 'text',
        attrs: {
          x: 540, y: 480, text: '{{title}}', fontSize: 120, fontFamily: 'Arial',
          fill: '#ffffff', fontWeight: 'bold', align: 'center',
          shadowColor: 'rgba(0,0,0,0.4)', shadowBlur: 20, shadowOffsetY: 5,
        },
      },
      // Subtitle
      {
        type: 'text',
        attrs: {
          x: 540, y: 900, text: '{{subtitle}}', fontSize: 36, fontFamily: 'Arial',
          fill: '#ffffff', align: 'center', width: 900, lineHeight: 1.4,
        },
      },
      // Business name
      {
        type: 'text',
        attrs: {
          x: 540, y: 1100, text: '{{businessName}}', fontSize: 28, fontFamily: 'Arial',
          fill: '{{primaryColor}}', fontWeight: 'bold', align: 'center',
        },
      },
      // CTA
      {
        type: 'rect',
        attrs: { x: 260, y: 1600, width: 560, height: 80, fill: '{{primaryColor}}', cornerRadius: 40 },
      },
      {
        type: 'text',
        attrs: {
          x: 540, y: 1625, text: '{{cta}}', fontSize: 26, fontFamily: 'Arial',
          fill: '#ffffff', fontWeight: 'bold', align: 'center',
        },
      },
      // Urgency
      {
        type: 'text',
        attrs: {
          x: 540, y: 1750, text: 'Solo por tiempo limitado', fontSize: 18, fontFamily: 'Arial',
          fill: '#ffffff', opacity: 0.5, align: 'center',
        },
      },
    ],
  },

  // ====================================================================
  // BANNER FACEBOOK 1200×628 (4 templates)
  // ====================================================================
  {
    name: 'Corporativo FB',
    category: 'banner',
    width: 1200,
    height: 628,
    layers: [
      // Background
      { type: 'rect', attrs: { x: 0, y: 0, width: 1200, height: 628, fill: '#f8f9fa' } },
      // Left color panel (60%)
      gradientRect(0, 0, 720, 628, '{{primaryColor}}', '{{secondaryColor}}', 'horizontal'),
      // Title
      {
        type: 'text',
        attrs: {
          x: 60, y: 160, text: '{{businessName}}', fontSize: 48, fontFamily: 'Arial',
          fill: '#ffffff', fontWeight: 'bold', width: 600,
          shadowColor: 'rgba(0,0,0,0.2)', shadowBlur: 8, shadowOffsetY: 3,
        },
      },
      // Subtitle
      {
        type: 'text',
        attrs: {
          x: 60, y: 300, text: '{{tagline}}', fontSize: 22, fontFamily: 'Arial',
          fill: '#ffffff', opacity: 0.9, width: 600, lineHeight: 1.5,
        },
      },
      // CTA
      {
        type: 'rect',
        attrs: { x: 60, y: 440, width: 220, height: 52, fill: '#ffffff', cornerRadius: 26 },
      },
      {
        type: 'text',
        attrs: {
          x: 100, y: 453, text: '{{cta}}', fontSize: 18, fontFamily: 'Arial',
          fill: '{{primaryColor}}', fontWeight: 'bold',
        },
      },
      // Right side pattern
      { type: 'circle', attrs: { x: 950, y: 314, radius: 120, fill: '{{primaryColor}}', opacity: 0.1 } },
      { type: 'circle', attrs: { x: 1050, y: 200, radius: 80, fill: '{{accentColor}}', opacity: 0.08 } },
      // Right text
      {
        type: 'text',
        attrs: {
          x: 780, y: 280, text: '{{subtitle}}', fontSize: 20, fontFamily: 'Arial',
          fill: '#555555', width: 370, lineHeight: 1.5,
        },
      },
    ],
  },
  {
    name: 'Evento FB',
    category: 'banner',
    width: 1200,
    height: 628,
    layers: [
      gradientRect(0, 0, 1200, 628, '{{primaryColor}}', '{{secondaryColor}}', 'diagonal'),
      // Decorative shapes
      { type: 'circle', attrs: { x: 1100, y: 100, radius: 150, fill: '#ffffff', opacity: 0.06 } },
      { type: 'circle', attrs: { x: 100, y: 530, radius: 100, fill: '#ffffff', opacity: 0.04 } },
      // Date/badge area
      {
        type: 'rect',
        attrs: { x: 60, y: 60, width: 200, height: 50, fill: 'rgba(255,255,255,0.2)', cornerRadius: 25 },
      },
      {
        type: 'text',
        attrs: {
          x: 100, y: 72, text: '{{subtitle}}', fontSize: 18, fontFamily: 'Arial',
          fill: '#ffffff', fontWeight: 'bold',
        },
      },
      // Event title
      {
        type: 'text',
        attrs: {
          x: 60, y: 200, text: '{{title}}', fontSize: 52, fontFamily: 'Arial',
          fill: '#ffffff', fontWeight: 'bold', width: 800, lineHeight: 1.15,
        },
      },
      // Description
      {
        type: 'text',
        attrs: {
          x: 60, y: 380, text: '{{tagline}}', fontSize: 22, fontFamily: 'Arial',
          fill: '#ffffff', opacity: 0.85, width: 700, lineHeight: 1.4,
        },
      },
      // CTA
      {
        type: 'rect',
        attrs: { x: 60, y: 490, width: 280, height: 56, fill: '#ffffff', cornerRadius: 28 },
      },
      {
        type: 'text',
        attrs: {
          x: 120, y: 503, text: '{{cta}}', fontSize: 20, fontFamily: 'Arial',
          fill: '{{primaryColor}}', fontWeight: 'bold',
        },
      },
    ],
  },
  {
    name: 'Oferta FB',
    category: 'banner',
    width: 1200,
    height: 628,
    layers: [
      // Background pattern
      { type: 'rect', attrs: { x: 0, y: 0, width: 1200, height: 628, fill: '{{primaryColor}}' } },
      // Geometric patterns
      { type: 'rect', attrs: { x: 0, y: 0, width: 1200, height: 8, fill: '{{accentColor}}' } },
      { type: 'rect', attrs: { x: 0, y: 620, width: 1200, height: 8, fill: '{{accentColor}}' } },
      { type: 'circle', attrs: { x: 200, y: 314, radius: 300, fill: '#ffffff', opacity: 0.05 } },
      { type: 'circle', attrs: { x: 1000, y: 314, radius: 250, fill: '#ffffff', opacity: 0.04 } },
      // Big promo center
      {
        type: 'text',
        attrs: {
          x: 600, y: 100, text: '{{title}}', fontSize: 100, fontFamily: 'Arial',
          fill: '#ffffff', fontWeight: 'bold', align: 'center',
          shadowColor: 'rgba(0,0,0,0.3)', shadowBlur: 15, shadowOffsetY: 5,
        },
      },
      // Details
      {
        type: 'text',
        attrs: {
          x: 600, y: 330, text: '{{subtitle}}', fontSize: 28, fontFamily: 'Arial',
          fill: '#ffffff', opacity: 0.9, align: 'center', width: 900, lineHeight: 1.4,
        },
      },
      // Business name
      {
        type: 'text',
        attrs: {
          x: 600, y: 430, text: '{{businessName}}', fontSize: 22, fontFamily: 'Arial',
          fill: '#ffffff', opacity: 0.7, align: 'center',
        },
      },
      // CTA badge
      {
        type: 'rect',
        attrs: { x: 440, y: 500, width: 320, height: 60, fill: '#ffffff', cornerRadius: 30 },
      },
      {
        type: 'text',
        attrs: {
          x: 600, y: 515, text: '{{cta}}', fontSize: 22, fontFamily: 'Arial',
          fill: '{{primaryColor}}', fontWeight: 'bold', align: 'center',
        },
      },
    ],
  },
  {
    name: 'Marca FB',
    category: 'banner',
    width: 1200,
    height: 628,
    layers: [
      // Clean white background
      { type: 'rect', attrs: { x: 0, y: 0, width: 1200, height: 628, fill: '#ffffff' } },
      // Subtle bottom accent
      { type: 'rect', attrs: { x: 0, y: 618, width: 1200, height: 10, fill: '{{primaryColor}}' } },
      // Centered content
      {
        type: 'text',
        attrs: {
          x: 600, y: 200, text: '{{businessName}}', fontSize: 60, fontFamily: 'Arial',
          fill: '{{primaryColor}}', fontWeight: 'bold', align: 'center',
        },
      },
      // Divider
      { type: 'rect', attrs: { x: 500, y: 320, width: 200, height: 3, fill: '{{primaryColor}}', opacity: 0.3 } },
      // Tagline
      {
        type: 'text',
        attrs: {
          x: 600, y: 370, text: '{{tagline}}', fontSize: 24, fontFamily: 'Arial',
          fill: '#888888', align: 'center', width: 800, lineHeight: 1.5,
        },
      },
    ],
  },

  // ====================================================================
  // BANNER WEB 1200×628 (3 templates)
  // ====================================================================
  {
    name: 'Hero CTA Web',
    category: 'banner',
    width: 1200,
    height: 628,
    layers: [
      gradientRect(0, 0, 1200, 628, '{{primaryColor}}', '{{secondaryColor}}', 'horizontal'),
      // Decorative shapes
      { type: 'circle', attrs: { x: 1050, y: 150, radius: 200, fill: '#ffffff', opacity: 0.05 } },
      { type: 'circle', attrs: { x: 1100, y: 450, radius: 150, fill: '#ffffff', opacity: 0.04 } },
      { type: 'rect', attrs: { x: 800, y: 250, width: 4, height: 150, fill: '{{accentColor}}', opacity: 0.4 } },
      // Title
      {
        type: 'text',
        attrs: {
          x: 80, y: 140, text: '{{title}}', fontSize: 48, fontFamily: 'Arial',
          fill: '#ffffff', fontWeight: 'bold', width: 650, lineHeight: 1.2,
        },
      },
      // Subtitle
      {
        type: 'text',
        attrs: {
          x: 80, y: 350, text: '{{tagline}}', fontSize: 22, fontFamily: 'Arial',
          fill: '#ffffff', opacity: 0.85, width: 600, lineHeight: 1.5,
        },
      },
      // CTA button
      {
        type: 'rect',
        attrs: { x: 80, y: 470, width: 260, height: 60, fill: '#ffffff', cornerRadius: 30 },
      },
      {
        type: 'text',
        attrs: {
          x: 140, y: 487, text: '{{cta}}', fontSize: 20, fontFamily: 'Arial',
          fill: '{{primaryColor}}', fontWeight: 'bold',
        },
      },
      // Right-side content
      {
        type: 'text',
        attrs: {
          x: 850, y: 300, text: '{{businessName}}', fontSize: 28, fontFamily: 'Arial',
          fill: '#ffffff', opacity: 0.8, width: 300,
        },
      },
    ],
  },
  {
    name: 'Features Web',
    category: 'banner',
    width: 1200,
    height: 628,
    layers: [
      // Light background
      { type: 'rect', attrs: { x: 0, y: 0, width: 1200, height: 628, fill: '#fafafa' } },
      // Top accent
      { type: 'rect', attrs: { x: 0, y: 0, width: 1200, height: 6, fill: '{{primaryColor}}' } },
      // Title
      {
        type: 'text',
        attrs: {
          x: 600, y: 60, text: '{{title}}', fontSize: 40, fontFamily: 'Arial',
          fill: '#1a1a1a', fontWeight: 'bold', align: 'center', width: 1000,
        },
      },
      // Subtitle
      {
        type: 'text',
        attrs: {
          x: 600, y: 140, text: '{{subtitle}}', fontSize: 20, fontFamily: 'Arial',
          fill: '#888888', align: 'center', width: 800,
        },
      },
      // Feature column 1
      { type: 'rect', attrs: { x: 80, y: 220, width: 320, height: 320, fill: '#ffffff', cornerRadius: 16, shadowColor: 'rgba(0,0,0,0.06)', shadowBlur: 15, shadowOffsetY: 5 } },
      { type: 'circle', attrs: { x: 240, y: 290, radius: 30, fill: '{{primaryColor}}', opacity: 0.15 } },
      { type: 'text', attrs: { x: 240, y: 340, text: 'Calidad', fontSize: 22, fontFamily: 'Arial', fill: '#1a1a1a', fontWeight: 'bold', align: 'center' } },
      { type: 'text', attrs: { x: 240, y: 390, text: 'Los mejores\nprofesionales', fontSize: 16, fontFamily: 'Arial', fill: '#888888', align: 'center', lineHeight: 1.4 } },
      // Feature column 2
      { type: 'rect', attrs: { x: 440, y: 220, width: 320, height: 320, fill: '#ffffff', cornerRadius: 16, shadowColor: 'rgba(0,0,0,0.06)', shadowBlur: 15, shadowOffsetY: 5 } },
      { type: 'circle', attrs: { x: 600, y: 290, radius: 30, fill: '{{accentColor}}', opacity: 0.15 } },
      { type: 'text', attrs: { x: 600, y: 340, text: 'Rapidez', fontSize: 22, fontFamily: 'Arial', fill: '#1a1a1a', fontWeight: 'bold', align: 'center' } },
      { type: 'text', attrs: { x: 600, y: 390, text: 'Reserva en\nsegundos', fontSize: 16, fontFamily: 'Arial', fill: '#888888', align: 'center', lineHeight: 1.4 } },
      // Feature column 3
      { type: 'rect', attrs: { x: 800, y: 220, width: 320, height: 320, fill: '#ffffff', cornerRadius: 16, shadowColor: 'rgba(0,0,0,0.06)', shadowBlur: 15, shadowOffsetY: 5 } },
      { type: 'circle', attrs: { x: 960, y: 290, radius: 30, fill: '{{secondaryColor}}', opacity: 0.15 } },
      { type: 'text', attrs: { x: 960, y: 340, text: 'Confianza', fontSize: 22, fontFamily: 'Arial', fill: '#1a1a1a', fontWeight: 'bold', align: 'center' } },
      { type: 'text', attrs: { x: 960, y: 390, text: 'Opiniones\nverificadas', fontSize: 16, fontFamily: 'Arial', fill: '#888888', align: 'center', lineHeight: 1.4 } },
      // Bottom text
      { type: 'text', attrs: { x: 600, y: 580, text: '{{businessName}}', fontSize: 18, fontFamily: 'Arial', fill: '{{primaryColor}}', fontWeight: 'bold', align: 'center' } },
    ],
  },
  {
    name: 'Anuncio Web',
    category: 'banner',
    width: 1200,
    height: 628,
    layers: [
      // Dark bg
      { type: 'rect', attrs: { x: 0, y: 0, width: 1200, height: 628, fill: '#1a1a2e' } },
      // Gradient diagonal accent
      gradientRect(0, 0, 700, 628, '{{primaryColor}}', '{{secondaryColor}}', 'diagonal'),
      // "Nuevo" badge
      {
        type: 'rect',
        attrs: { x: 60, y: 60, width: 120, height: 40, fill: '{{accentColor}}', cornerRadius: 20 },
      },
      {
        type: 'text',
        attrs: {
          x: 85, y: 68, text: 'NUEVO', fontSize: 16, fontFamily: 'Arial',
          fill: '#ffffff', fontWeight: 'bold',
        },
      },
      // Main title
      {
        type: 'text',
        attrs: {
          x: 60, y: 180, text: '{{title}}', fontSize: 52, fontFamily: 'Arial',
          fill: '#ffffff', fontWeight: 'bold', width: 580, lineHeight: 1.15,
        },
      },
      // Description
      {
        type: 'text',
        attrs: {
          x: 60, y: 380, text: '{{subtitle}}', fontSize: 22, fontFamily: 'Arial',
          fill: '#ffffff', opacity: 0.85, width: 550, lineHeight: 1.4,
        },
      },
      // CTA
      {
        type: 'rect',
        attrs: { x: 60, y: 490, width: 240, height: 56, fill: '#ffffff', cornerRadius: 28 },
      },
      {
        type: 'text',
        attrs: {
          x: 110, y: 504, text: '{{cta}}', fontSize: 20, fontFamily: 'Arial',
          fill: '{{primaryColor}}', fontWeight: 'bold',
        },
      },
      // Right side business name
      {
        type: 'text',
        attrs: {
          x: 900, y: 540, text: '{{businessName}}', fontSize: 20, fontFamily: 'Arial',
          fill: '#ffffff', opacity: 0.5, width: 250,
        },
      },
    ],
  },

  // ====================================================================
  // HEADER EMAIL 600×200 (3 templates)
  // ====================================================================
  {
    name: 'Email Clásico',
    category: 'email_header',
    width: 600,
    height: 200,
    layers: [
      // Background
      { type: 'rect', attrs: { x: 0, y: 0, width: 600, height: 200, fill: '{{primaryColor}}' } },
      // Bottom accent line
      { type: 'rect', attrs: { x: 0, y: 190, width: 600, height: 10, fill: '{{accentColor}}' } },
      // Business name
      {
        type: 'text',
        attrs: {
          x: 30, y: 55, text: '{{businessName}}', fontSize: 36, fontFamily: 'Arial',
          fill: '#ffffff', fontWeight: 'bold',
        },
      },
      // Tagline
      {
        type: 'text',
        attrs: {
          x: 30, y: 120, text: '{{tagline}}', fontSize: 16, fontFamily: 'Arial',
          fill: '#ffffff', opacity: 0.8, width: 540,
        },
      },
    ],
  },
  {
    name: 'Email Moderno',
    category: 'email_header',
    width: 600,
    height: 200,
    layers: [
      gradientRect(0, 0, 600, 200, '{{primaryColor}}', '{{secondaryColor}}', 'horizontal'),
      // Centered layout
      {
        type: 'text',
        attrs: {
          x: 300, y: 55, text: '{{businessName}}', fontSize: 32, fontFamily: 'Arial',
          fill: '#ffffff', fontWeight: 'bold', align: 'center',
        },
      },
      // Divider
      { type: 'rect', attrs: { x: 250, y: 115, width: 100, height: 2, fill: '#ffffff', opacity: 0.4 } },
      // Tagline
      {
        type: 'text',
        attrs: {
          x: 300, y: 140, text: '{{tagline}}', fontSize: 14, fontFamily: 'Arial',
          fill: '#ffffff', opacity: 0.8, align: 'center', width: 500,
        },
      },
    ],
  },
  {
    name: 'Email Minimalista',
    category: 'email_header',
    width: 600,
    height: 200,
    layers: [
      // White background
      { type: 'rect', attrs: { x: 0, y: 0, width: 600, height: 200, fill: '#ffffff' } },
      // Thin top line
      { type: 'rect', attrs: { x: 0, y: 0, width: 600, height: 3, fill: '{{primaryColor}}' } },
      // Business name
      {
        type: 'text',
        attrs: {
          x: 30, y: 60, text: '{{businessName}}', fontSize: 28, fontFamily: 'Arial',
          fill: '#333333', fontWeight: 'bold',
        },
      },
      // Separator
      { type: 'rect', attrs: { x: 30, y: 115, width: 540, height: 1, fill: '#e0e0e0' } },
      // Tagline
      {
        type: 'text',
        attrs: {
          x: 30, y: 140, text: '{{tagline}}', fontSize: 14, fontFamily: 'Arial',
          fill: '#999999', width: 540,
        },
      },
    ],
  },
];

export async function seedTemplates() {
  console.log('Seeding professional system templates...');

  // Delete old system templates to replace them
  const deleted = await prisma.template.deleteMany({
    where: { isSystem: true },
  });
  console.log(`  Removed ${deleted.count} old system templates`);

  for (const template of SYSTEM_TEMPLATES) {
    await prisma.template.create({
      data: {
        name: template.name,
        category: template.category,
        width: template.width,
        height: template.height,
        layers: JSON.stringify(template.layers),
        isSystem: true,
        tenantId: null,
      },
    });
    console.log(`  Created "${template.name}" (${template.category} ${template.width}×${template.height})`);
  }

  console.log(`System templates seeded: ${SYSTEM_TEMPLATES.length} templates`);
}
