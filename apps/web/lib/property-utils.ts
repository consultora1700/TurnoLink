/**
 * Property utilities — extracted from public-catalog-page.tsx
 * Used by PublicRealEstatePage and PublicCatalogPage
 */

import type { ProductAttribute } from '@/lib/api';

export function stripHtml(s: string): string {
  return s
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(?:div|p|li|h[1-6])>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

// ── Real-estate description intelligence engine ──────────────────────────────
export interface PropertyIntel {
  cleanDescription: string;
  extractedAttrs: Array<{ label: string; value: string }>;
}

export function processPropertyDescription(rawDesc: string, existingAttrs: ProductAttribute[]): PropertyIntel {
  let text = rawDesc
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(?:div|p|li|h[1-6])>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const extractedAttrs: PropertyIntel['extractedAttrs'] = [];
  const existingKeys = new Set(existingAttrs.map(a => a.key));
  const existingLabels = new Set(existingAttrs.map(a => a.label.toLowerCase()));
  const has = (key: string) => existingKeys.has(key) || existingLabels.has(key.toLowerCase());

  // APTO CRÉDITO / APTO BANCO
  if (/apto\s+(cr[eé]dito|banco)/i.test(text)) {
    extractedAttrs.push({ label: 'Apto crédito', value: 'Sí' });
    text = text.replace(/\.?\s*apto\s+(cr[eé]dito|banco)\.?\s*/gi, ' ');
  }

  // Rental status
  const rentalMatch = text.match(/alquilad[oa]\s+hasta\s+(?:el\s+)?(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|\d{1,2}\s+de\s+\w+\s+(?:de\s+)?\d{4}|\w+\s+(?:de\s+)?\d{4}|\d{1,2}[\/-]\d{2,4})/i);
  if (rentalMatch) {
    extractedAttrs.push({ label: 'Alquilado hasta', value: rentalMatch[1] });
  } else if (/\balquilad[oa]\b/i.test(text) && !/no\s+alquilad/i.test(text)) {
    extractedAttrs.push({ label: 'Estado ocupación', value: 'Alquilado' });
  }

  // Floor / Piso
  const pisoMatch = text.match(/(?:piso\s+(\d{1,2})|(\d{1,2})[°º]?\s*piso)/i);
  if (pisoMatch && !has('piso')) {
    extractedAttrs.push({ label: 'Piso', value: pisoMatch[1] || pisoMatch[2] });
  }

  // Plantas
  const plantasWordMap: Record<string, string> = { una: '1', dos: '2', tres: '3', cuatro: '4' };
  const plantasMatch = text.match(/(?:en\s+)?(\d{1,2}|una|dos|tres|cuatro)\s+plantas?(?:\b|[.,])/i);
  if (plantasMatch && !has('plantas')) {
    const val = plantasWordMap[plantasMatch[1].toLowerCase()] || plantasMatch[1];
    extractedAttrs.push({ label: 'Plantas', value: val });
  }

  // Dormitorios
  const dormWordMap: Record<string, string> = { un: '1', uno: '1', una: '1', dos: '2', tres: '3', cuatro: '4', cinco: '5' };
  const dormMatch = text.match(/(\d{1,2}|un|uno|una|dos|tres|cuatro|cinco)\s+dormitorios?/i);
  if (dormMatch && !has('dormitorios')) {
    const val = dormWordMap[dormMatch[1].toLowerCase()] || dormMatch[1];
    extractedAttrs.push({ label: 'Dormitorios', value: val });
  }

  // Baños
  const banosMatch = text.match(/(\d{1,2}|un|uno|dos|tres|cuatro)\s+ba[ñn]os?/i);
  if (banosMatch && !has('banos') && !has('baños')) {
    const val = dormWordMap[banosMatch[1].toLowerCase()] || banosMatch[1];
    extractedAttrs.push({ label: 'Baños', value: val });
  }

  // Ambientes
  const ambMatch = text.match(/(\d{1,2})\s+ambientes?/i);
  if (ambMatch && !has('ambientes')) {
    extractedAttrs.push({ label: 'Ambientes', value: ambMatch[1] });
  }

  // Cochera/garage
  if (!has('cochera') && !has('cocheras') && !has('garage')) {
    const cochMatch = text.match(/(?:cochera|garage)\s+(?:para\s+)?(\d{1,2})\s+autos?/i);
    if (cochMatch) extractedAttrs.push({ label: 'Cocheras', value: cochMatch[1] });
    else if (/\bcochera\s+cubierta\b/i.test(text)) extractedAttrs.push({ label: 'Cochera', value: 'Cubierta' });
    else if (/\bcochera\s+descubierta\b/i.test(text)) extractedAttrs.push({ label: 'Cochera', value: 'Descubierta' });
  }

  // Pileta
  const piletaMatch = text.match(/pileta\s+(?:de\s+)?(\d+\s*x\s*\d+)/i);
  if (piletaMatch) {
    extractedAttrs.push({ label: 'Pileta', value: piletaMatch[1].replace(/\s/g, '') });
  } else if (/\bpileta\s+climatizada\b/i.test(text)) {
    extractedAttrs.push({ label: 'Pileta', value: 'Climatizada' });
  } else if (/\bpileta\b/i.test(text) && !has('pileta')) {
    extractedAttrs.push({ label: 'Pileta', value: 'Sí' });
  }

  // Antigüedad
  const antMatch = text.match(/antig[üu]edad[:\s]+(\d+)\s*a[ñn]os/i);
  if (antMatch && !has('antiguedad') && !has('antigüedad')) {
    extractedAttrs.push({ label: 'Antigüedad', value: `${antMatch[1]} años` });
  }

  // NO MASCOTAS
  if (/no\s+se\s+admiten\s+mascotas/i.test(text)) {
    extractedAttrs.push({ label: 'Mascotas', value: 'No admite' });
  }

  // Escritura inmediata
  if (/escritura\s+inmediata|listo\s+para\s+escriturar/i.test(text)) {
    extractedAttrs.push({ label: 'Escritura', value: 'Inmediata' });
  }

  // Cut trailing structured data block
  const structuredTailPatterns = [
    /^(?:Situaci[oó]n|Orientaci[oó]n|Estado|Disposici[oó]n|Expensas|Antig[üu]edad|Superficie\s+\w+|Total\s+construido|Semicubierta|Descubierta|Frente|Fondo|Cocheras|Plantas)\s*:/im,
    /^SERVICIOS\b/im,
    /^AMBIENTES\b/im,
    /^ADICIONALES\b/im,
    /^\s*Servicios:\s/im,
  ];

  const lines = text.split('\n');
  let cutIndex = lines.length;
  const minLine = Math.floor(lines.length * 0.4);
  for (let i = minLine; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    for (const pattern of structuredTailPatterns) {
      if (pattern.test(line)) {
        if (/^\w[\w\s.]+:\s/.test(line) || /^(SERVICIOS|AMBIENTES|ADICIONALES)\b/.test(line)) {
          cutIndex = i;
          break;
        }
      }
    }
    if (cutIndex < lines.length) break;
  }

  text = lines.slice(0, cutIndex).join('\n').trim();

  // Strip trailing boilerplate
  text = text
    .replace(/>\s*Las?\s+visitas?\s+se\s+coordinan[\s\S]*$/i, '')
    .replace(/Escribinos\s+tu\s+consulta\s+a\s+\S+[\s\S]*$/i, '')
    .replace(/-\s*Rodrigo\s+Propiedades\s*-?\s*$/i, '')
    .replace(/Interesados\s+con\s+requisitos[\s\S]*$/i, '')
    .replace(/[<>]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // Requisitos para el alquiler
  const reqMatch = text.match(/(?:Requisitos?\s+para\s+el\s+alquiler[\s\S]*?)(?=\n\n|$)/i);
  if (reqMatch) {
    extractedAttrs.push({ label: 'Requisitos', value: 'Disponibles' });
    text = text.replace(reqMatch[0], '').replace(/\n{3,}/g, '\n\n').trim();
  }

  // Contract info
  const contratoMatch = text.match(/contrato\s+por\s+(\d+)\s+meses/i);
  if (contratoMatch) {
    extractedAttrs.push({ label: 'Contrato', value: `${contratoMatch[1]} meses` });
  }
  const ajusteMatch = text.match(/ajuste\s+(cuatrimestral|trimestral|semestral|mensual|anual)\s+(?:\(?(?:\d+\))?\s*)?(?:por\s+)?(?:[ií]ndice\s+)?(ICL|IPC|CER)?/i);
  if (ajusteMatch) {
    extractedAttrs.push({ label: 'Ajuste', value: `${ajusteMatch[1]}${ajusteMatch[2] ? ` ${ajusteMatch[2].toUpperCase()}` : ''}` });
  }

  // Clean contract lines from description
  text = text
    .replace(/Contrato\s+por\s+\d+\s+meses[^.\n]*\.?\s*/gi, '')
    .replace(/,?\s*con\s+ajuste\s+(cuatrimestral|trimestral|semestral|mensual|anual)\s+(?:\(?(?:\d+\))?\s*)?(?:por\s+)?(?:[ií]ndice\s+)?(ICL|IPC|CER)?\.?\s*/gi, ' ')
    .replace(/NO\s+SE\s+ADMITEN\s+MASCOTAS\.?\s*/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return { cleanDescription: text, extractedAttrs };
}

/** Normalize phone for WhatsApp (Argentina format) */
export function normalizePhoneForWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('54') && digits.length >= 12) return digits;
  if (digits.startsWith('0')) return `54${digits.slice(1)}`;
  if (digits.length === 10) return `54${digits}`;
  return digits;
}

/** Format price for real estate: USD for venta, ARS for alquiler */
export function formatPropertyPrice(price: number, operacion?: string, currency?: string): string {
  // Determine currency based on operation type
  const effectiveCurrency = currency || (
    operacion === 'Alquiler' ? 'ARS' :
    operacion === 'Alquiler temporario' ? 'USD' :
    'USD' // Venta defaults to USD
  );

  if (effectiveCurrency === 'USD') {
    return `USD ${price.toLocaleString('es-AR')}`;
  }
  return `$ ${price.toLocaleString('es-AR')}`;
}

/** Get attribute value helper */
export function getAttrValue(attrs: ProductAttribute[] | null | undefined, key: string): string | undefined {
  return attrs?.find(a => a.key === key)?.value;
}

/** Check if property is apto crédito */
export function isAptoCredito(attrs: ProductAttribute[] | null | undefined): boolean {
  const val = getAttrValue(attrs, 'apto_credito');
  return val === 'true' || val === 'Sí' || val === 'si' || val === '1';
}

/**
 * Infer operacion, tipo_propiedad, and barrio from the product name
 * when attributes are missing. Handles patterns like:
 *   "Casa en Venta - 47 e/ 5 y 6, Microcentro, La Plata"
 *   "Departamento en Alquiler - 33 entre 5 y 6, La Plata"
 *   "Amenabar 1975 - Belgrano"
 *   "Terreno en Venta/Alquiler - Camino Gral Belgrano, Manuel B Gonnet"
 */
export function inferPropertyAttrs(
  name: string,
  existingAttrs: ProductAttribute[] | null | undefined,
): { operacion?: string; tipoPropiedad?: string; barrio?: string } {
  const result: { operacion?: string; tipoPropiedad?: string; barrio?: string } = {};
  const get = (key: string) => existingAttrs?.find(a => a.key === key)?.value;

  // --- Operacion ---
  if (!get('operacion')) {
    if (/\ben\s+Venta\s*(?:\/|\s+y\s+)?\s*Alquiler\b/i.test(name)) result.operacion = 'Venta';
    else if (/\ben\s+Venta\b/i.test(name)) result.operacion = 'Venta';
    else if (/\ben\s+Alquiler\s+[Tt]emporario\b/i.test(name)) result.operacion = 'Alquiler temporario';
    else if (/\ben\s+Alquiler\b/i.test(name)) result.operacion = 'Alquiler';
    else if (/\b(?:Desarrollo|Emprendimiento|Pozo)\b/i.test(name)) result.operacion = 'Desarrollo';
  }

  // --- Tipo propiedad ---
  if (!get('tipo_propiedad')) {
    const tipoMap: [RegExp, string][] = [
      [/\bDepartamento\b/i, 'Departamento'],
      [/\bDepto\b/i, 'Departamento'],
      [/\bCasa\b/i, 'Casa'],
      [/\bPH\b/i, 'PH'],
      [/\bDúplex\b/i, 'Dúplex'],
      [/\bDuplex\b/i, 'Dúplex'],
      [/\bTríplex\b/i, 'Tríplex'],
      [/\bSemipiso\b/i, 'Semipiso'],
      [/\bPiso\b/i, 'Piso'],
      [/\bLoft\b/i, 'Loft'],
      [/\bPenthouse\b/i, 'Penthouse'],
      [/\bLocal\b/i, 'Local'],
      [/\bOficina\b/i, 'Oficina'],
      [/\bTerreno\b/i, 'Terreno'],
      [/\bLote\b/i, 'Terreno'],
      [/\bCochera\b/i, 'Cochera'],
      [/\bGarage\b/i, 'Cochera'],
      [/\bGalpón\b/i, 'Galpón'],
      [/\bGalpon\b/i, 'Galpón'],
      [/\bDepósito\b/i, 'Depósito'],
      [/\bDeposito\b/i, 'Depósito'],
      [/\bQuinta\b/i, 'Quinta'],
      [/\bCampo\b/i, 'Campo'],
      [/\bFondo\s+de\s+Comercio\b/i, 'Fondo de Comercio'],
    ];
    for (const [re, tipo] of tipoMap) {
      if (re.test(name)) { result.tipoPropiedad = tipo; break; }
    }
  }

  // --- Barrio ---
  // Pattern 1: "Tipo en Op - dirección, Barrio, Ciudad" → barrio before city
  // Pattern 2: "Dirección - Barrio"
  if (!get('barrio')) {
    const dashParts = name.split(/\s*-\s*/);
    if (dashParts.length >= 2) {
      const afterDash = dashParts.slice(1).join(' - ').trim();
      const commaParts = afterDash.split(',').map(s => s.trim()).filter(Boolean);

      // Known cities — these are NOT barrios
      const CITIES = /^(?:La Plata|Buenos Aires|CABA|Capital Federal|Córdoba|Rosario|Mendoza|Tucumán|Mar del Plata|Salta|Berazategui|Coronel Brandsen|San Fernando|Tigre|Pilar|Escobar|Vicente López)$/i;
      // Disqualifiers: strings that look like addresses, tower names, floor numbers, etc.
      const isNotBarrio = (s: string) =>
        /^\d/.test(s) ||                         // starts with number (address)
        /\b(?:Torre|Piso|Lote|Manzana|UF|Unidad|Dpto|Depto)\b/i.test(s) ||  // building/unit refs
        s.length < 3 || s.length > 30;           // too short or too long

      if (commaParts.length >= 3) {
        // "47 e/ 5 y 6, Microcentro, La Plata" → barrio = secondLast if lastPart is city
        const lastPart = commaParts[commaParts.length - 1];
        const secondLast = commaParts[commaParts.length - 2];
        if (CITIES.test(lastPart) && !isNotBarrio(secondLast)) {
          result.barrio = secondLast;
        } else if (!CITIES.test(lastPart) && !isNotBarrio(lastPart)) {
          result.barrio = lastPart;
        }
      } else if (commaParts.length === 2) {
        // "dirección, La Plata" → barrio = La Plata (it's the location)
        // "Campos de Roca, Coronel Brandsen" → barrio = Campos de Roca if 2nd is city
        const lastPart = commaParts[1];
        const firstPart = commaParts[0];
        if (CITIES.test(lastPart) && !isNotBarrio(firstPart) && !/^\d/.test(firstPart)) {
          // firstPart might be a barrio or address — only use if it's clearly a name
          result.barrio = lastPart; // use the city as location
        } else if (!isNotBarrio(lastPart)) {
          result.barrio = lastPart;
        }
      } else if (commaParts.length === 1) {
        // "Amenabar 1975 - Belgrano" → barrio = Belgrano
        const candidate = commaParts[0];
        if (!isNotBarrio(candidate) && !/^\d/.test(candidate)) {
          result.barrio = candidate;
        }
      }
    }
  }

  return result;
}

/** Build features row: "3 amb (2 dorm) · 1 baño · 65m² · Cochera" */
export function buildPropertyFeatures(attrs: ProductAttribute[] | null | undefined): string {
  if (!attrs?.length) return '';
  const get = (key: string) => attrs.find(a => a.key === key)?.value;

  const parts: string[] = [];
  const amb = get('ambientes');
  const dorm = get('dormitorios');
  if (amb) {
    parts.push(dorm ? `${amb} amb (${dorm} dorm)` : `${amb} amb`);
  }

  const banos = get('banos');
  if (banos) parts.push(`${banos} ${Number(banos) === 1 ? 'baño' : 'baños'}`);

  const m2 = get('m2_totales') || get('m2_cubiertos');
  if (m2) parts.push(`${m2}m²`);

  const cochera = get('cochera');
  if (cochera && cochera !== 'No') parts.push(cochera === '1' ? 'Cochera' : `${cochera} cocheras`);

  return parts.join(' · ');
}
