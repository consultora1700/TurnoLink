/**
 * Geocode Tenants and ProfessionalProfiles using a known-cities lookup
 * with fallback to Argentina's GeoRef API (municipios endpoint).
 *
 * Usage:
 *   cd apps/api && npx ts-node --transpile-only --compiler-options '{"module":"commonjs","moduleResolution":"node","esModuleInterop":true}' --skip-project ../../scripts/geocode-entities.ts
 *
 * Or with tsx:
 *   cd apps/api && npx tsx ../../scripts/geocode-entities.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DELAY_MS = 200;

// Well-known Argentine cities/zones with their coordinates
const KNOWN_COORDS: Record<string, { lat: number; lon: number }> = {
  'buenos aires': { lat: -34.6037, lon: -58.3816 },
  'caba': { lat: -34.6037, lon: -58.3816 },
  'ciudad autónoma de buenos aires': { lat: -34.6037, lon: -58.3816 },
  'caba, buenos aires': { lat: -34.6037, lon: -58.3816 },
  'palermo': { lat: -34.5795, lon: -58.4259 },
  'palermo, ciudad autónoma de buenos aires': { lat: -34.5795, lon: -58.4259 },
  'belgrano': { lat: -34.5627, lon: -58.4560 },
  'belgrano, ciudad autónoma de buenos aires': { lat: -34.5627, lon: -58.4560 },
  'recoleta': { lat: -34.5889, lon: -58.3937 },
  'recoleta, ciudad autónoma de buenos aires': { lat: -34.5889, lon: -58.3937 },
  'caballito': { lat: -34.6187, lon: -58.4424 },
  'caballito, ciudad autónoma de buenos aires': { lat: -34.6187, lon: -58.4424 },
  'san telmo': { lat: -34.6212, lon: -58.3700 },
  'san telmo, buenos aires': { lat: -34.6212, lon: -58.3700 },
  'villa crespo': { lat: -34.5994, lon: -58.4382 },
  'villa crespo, buenos aires': { lat: -34.5994, lon: -58.4382 },
  'córdoba': { lat: -31.4201, lon: -64.1888 },
  'córdoba, córdoba': { lat: -31.4201, lon: -64.1888 },
  'rosario': { lat: -32.9468, lon: -60.6393 },
  'rosario, santa fe': { lat: -32.9468, lon: -60.6393 },
  'mendoza': { lat: -32.8908, lon: -68.8272 },
  'mendoza, mendoza': { lat: -32.8908, lon: -68.8272 },
  'mar del plata': { lat: -38.0055, lon: -57.5426 },
  'mar del plata, buenos aires': { lat: -38.0055, lon: -57.5426 },
  'la plata': { lat: -34.9215, lon: -57.9545 },
  'la plata, buenos aires': { lat: -34.9215, lon: -57.9545 },
  'san isidro': { lat: -34.4727, lon: -58.5284 },
  'san isidro, buenos aires': { lat: -34.4727, lon: -58.5284 },
  'tigre': { lat: -34.4264, lon: -58.5795 },
  'tigre, buenos aires': { lat: -34.4264, lon: -58.5795 },
  'quilmes': { lat: -34.7203, lon: -58.2536 },
  'quilmes, buenos aires': { lat: -34.7203, lon: -58.2536 },
  'morón': { lat: -34.6534, lon: -58.6198 },
  'morón, buenos aires': { lat: -34.6534, lon: -58.6198 },
  'vicente lópez': { lat: -34.5260, lon: -58.4716 },
  'vicente lópez, buenos aires': { lat: -34.5260, lon: -58.4716 },
  'lomas de zamora': { lat: -34.7615, lon: -58.4044 },
  'lomas de zamora, buenos aires': { lat: -34.7615, lon: -58.4044 },
  'lanús': { lat: -34.7066, lon: -58.3929 },
  'lanús oeste': { lat: -34.7037, lon: -58.4006 },
  'lanús oeste, buenos aires': { lat: -34.7037, lon: -58.4006 },
  'lanus oeste': { lat: -34.7037, lon: -58.4006 },
  'san miguel de tucumán': { lat: -26.8083, lon: -65.2176 },
  'san miguel de tucumán, tucumán': { lat: -26.8083, lon: -65.2176 },
  'tucumán': { lat: -26.8083, lon: -65.2176 },
  'zona norte, gran buenos aires': { lat: -34.4727, lon: -58.5284 },
  'zona sur, gran buenos aires': { lat: -34.7615, lon: -58.4044 },
  'zona oeste, gran buenos aires': { lat: -34.6534, lon: -58.6198 },
  'ciudad autónoma de buenos aires, ciudad autónoma de buenos aires': { lat: -34.6037, lon: -58.3816 },
  'open door, luján': { lat: -34.4862, lon: -59.0571 },
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function geocodeWithApi(name: string): Promise<{ lat: number; lon: number } | null> {
  try {
    // Try municipios first (better for city-level)
    const url = `https://apis.datos.gob.ar/georef/api/municipios?nombre=${encodeURIComponent(name)}&max=1`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data: any = await res.json();
    if (data.municipios && data.municipios.length > 0) {
      const mun: any = data.municipios[0];
      return { lat: mun.centroide.lat, lon: mun.centroide.lon };
    }
    return null;
  } catch {
    return null;
  }
}

function lookupKnown(name: string): { lat: number; lon: number } | null {
  const key = name.toLowerCase().trim();
  if (KNOWN_COORDS[key]) return KNOWN_COORDS[key];
  // Try first part before comma
  const firstPart = key.split(',')[0].trim();
  if (KNOWN_COORDS[firstPart]) return KNOWN_COORDS[firstPart];
  return null;
}

async function geocode(name: string): Promise<{ lat: number; lon: number } | null> {
  // 1. Try known lookup
  const known = lookupKnown(name);
  if (known) return known;
  // 2. Try API
  const api = await geocodeWithApi(name);
  if (api) return api;
  return null;
}

async function geocodeTenants() {
  const tenants = await prisma.tenant.findMany({
    where: {
      city: { not: null },
    },
    select: { id: true, name: true, city: true, latitude: true },
  });

  // Include tenants that need re-geocoding (wrong coords) or no coords
  const toGeocode = tenants.filter((t) => t.city);

  console.log(`\nFound ${toGeocode.length} tenants to geocode\n`);

  let success = 0;
  for (const tenant of toGeocode) {
    if (!tenant.city) continue;
    console.log(`Tenant "${tenant.name}" — city: "${tenant.city}"`);
    const coords = await geocode(tenant.city);
    if (coords) {
      await prisma.tenant.update({
        where: { id: tenant.id },
        data: { latitude: coords.lat, longitude: coords.lon },
      });
      console.log(`  -> ${coords.lat}, ${coords.lon}`);
      success++;
    } else {
      console.warn(`  No results for "${tenant.city}"`);
    }
    await sleep(DELAY_MS);
  }

  console.log(`\nTenants geocoded: ${success}/${toGeocode.length}`);
}

async function geocodeProfessionals() {
  const profiles = await prisma.professionalProfile.findMany({
    where: {
      preferredZones: { not: '[]' },
    },
    select: { id: true, preferredZones: true, latitude: true },
  });

  const toGeocode = profiles.filter((p) => {
    let zones: string[] = [];
    try { zones = JSON.parse(p.preferredZones); } catch {}
    return zones.length > 0;
  });

  console.log(`\nFound ${toGeocode.length} professionals to geocode\n`);

  let success = 0;
  for (const profile of toGeocode) {
    let zones: string[] = [];
    try {
      zones = JSON.parse(profile.preferredZones);
    } catch {
      continue;
    }
    if (zones.length === 0) continue;

    const zone = zones[0];
    console.log(`Professional ${profile.id} — zone: "${zone}"`);
    const coords = await geocode(zone);
    if (coords) {
      await prisma.professionalProfile.update({
        where: { id: profile.id },
        data: { latitude: coords.lat, longitude: coords.lon },
      });
      console.log(`  -> ${coords.lat}, ${coords.lon}`);
      success++;
    } else {
      console.warn(`  No results for "${zone}"`);
    }
    await sleep(DELAY_MS);
  }

  console.log(`\nProfessionals geocoded: ${success}/${toGeocode.length}`);
}

async function main() {
  console.log('=== TurnoLink Geocoding Script ===');
  await geocodeTenants();
  await geocodeProfessionals();
  await prisma.$disconnect();
  console.log('\nDone!');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  prisma.$disconnect();
  process.exit(1);
});
