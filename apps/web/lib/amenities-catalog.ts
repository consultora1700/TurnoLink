/**
 * Amenities catalog per industry (rubro).
 * Each rubro has its own set of relevant amenities.
 * Tenants select which amenities apply to their business.
 * Icons are Lucide icon names.
 */

import {
  Wifi, Waves, Flame, Car, AirVent, Thermometer, CookingPot, WashingMachine,
  Tv, PawPrint, TreePine, Home, ShieldCheck, BedDouble, Bath, Coffee,
  Droplets, Dumbbell, Bike, Mountain, DoorOpen, Lock, Lightbulb,
  Sparkles, Music, Accessibility, Armchair, Speaker, type LucideIcon,
} from 'lucide-react';

export interface Amenity {
  id: string;
  label: string;
  icon: string; // Lucide icon name
}

/** Map icon name → Lucide component for runtime rendering */
export const AMENITY_ICON_MAP: Record<string, LucideIcon> = {
  Wifi, Waves, Flame, Car, AirVent,
  Heater: Thermometer, CookingPot, WashingMachine,
  Tv, PawPrint, TreePine, Home, ShieldCheck, BedDouble, Bath, Coffee,
  Droplets, Dumbbell, Bike, Mountain, DoorOpen, Lock, Lightbulb,
  Sparkles, Music, Accessibility, Armchair, Speaker,
  // Aliases for missing icons
  ConciergeBell: Coffee, ShowerHead: Droplets, Projector: Tv, PresentationChart: Lightbulb,
};

// ── Alquiler temporario / Hospedaje ──────────────────────────
const AMENITIES_ALQUILER: Amenity[] = [
  { id: 'wifi', label: 'Wi-Fi', icon: 'Wifi' },
  { id: 'pileta', label: 'Pileta', icon: 'Waves' },
  { id: 'parrilla', label: 'Parrilla', icon: 'Flame' },
  { id: 'estacionamiento', label: 'Estacionamiento', icon: 'Car' },
  { id: 'aire-acondicionado', label: 'Aire acondicionado', icon: 'AirVent' },
  { id: 'calefaccion', label: 'Calefacción', icon: 'Heater' },
  { id: 'cocina', label: 'Cocina equipada', icon: 'CookingPot' },
  { id: 'lavarropas', label: 'Lavarropas', icon: 'WashingMachine' },
  { id: 'tv', label: 'TV / Smart TV', icon: 'Tv' },
  { id: 'mascotas', label: 'Acepta mascotas', icon: 'PawPrint' },
  { id: 'jardin', label: 'Jardín', icon: 'TreePine' },
  { id: 'quincho', label: 'Quincho', icon: 'Home' },
  { id: 'seguridad', label: 'Seguridad 24hs', icon: 'ShieldCheck' },
  { id: 'ropa-blanca', label: 'Ropa de cama', icon: 'BedDouble' },
  { id: 'toallas', label: 'Toallas', icon: 'Bath' },
  { id: 'desayuno', label: 'Desayuno incluido', icon: 'Coffee' },
  { id: 'jacuzzi', label: 'Jacuzzi', icon: 'Droplets' },
  { id: 'gimnasio', label: 'Gimnasio', icon: 'Dumbbell' },
  { id: 'bicicletas', label: 'Bicicletas', icon: 'Bike' },
  { id: 'vista-panoramica', label: 'Vista panorámica', icon: 'Mountain' },
];

// ── Hospedaje por horas ──────────────────────────────────────
const AMENITIES_HOSPEDAJE: Amenity[] = [
  { id: 'wifi', label: 'Wi-Fi', icon: 'Wifi' },
  { id: 'aire-acondicionado', label: 'Aire acondicionado', icon: 'AirVent' },
  { id: 'tv', label: 'TV / Smart TV', icon: 'Tv' },
  { id: 'estacionamiento', label: 'Estacionamiento', icon: 'Car' },
  { id: 'ropa-blanca', label: 'Ropa de cama', icon: 'BedDouble' },
  { id: 'toallas', label: 'Toallas', icon: 'Bath' },
  { id: 'jacuzzi', label: 'Jacuzzi', icon: 'Droplets' },
  { id: 'room-service', label: 'Room service', icon: 'ConciergeBell' },
  { id: 'seguridad', label: 'Seguridad 24hs', icon: 'ShieldCheck' },
  { id: 'cochera', label: 'Cochera privada', icon: 'Car' },
];

// ── Espacios flexibles ───────────────────────────────────────
const AMENITIES_ESPACIOS: Amenity[] = [
  { id: 'wifi', label: 'Wi-Fi', icon: 'Wifi' },
  { id: 'aire-acondicionado', label: 'Aire acondicionado', icon: 'AirVent' },
  { id: 'estacionamiento', label: 'Estacionamiento', icon: 'Car' },
  { id: 'proyector', label: 'Proyector', icon: 'Projector' },
  { id: 'pizarra', label: 'Pizarra', icon: 'PresentationChart' },
  { id: 'cocina', label: 'Cocina / Kitchenette', icon: 'CookingPot' },
  { id: 'cafe', label: 'Café / Snacks', icon: 'Coffee' },
  { id: 'sonido', label: 'Sistema de sonido', icon: 'Speaker' },
  { id: 'iluminacion', label: 'Iluminación profesional', icon: 'Lightbulb' },
  { id: 'accesibilidad', label: 'Accesibilidad', icon: 'Accessibility' },
  { id: 'vestuarios', label: 'Vestuarios', icon: 'DoorOpen' },
  { id: 'seguridad', label: 'Seguridad', icon: 'ShieldCheck' },
];

// ── Belleza / Estética ───────────────────────────────────────
const AMENITIES_BELLEZA: Amenity[] = [
  { id: 'wifi', label: 'Wi-Fi', icon: 'Wifi' },
  { id: 'aire-acondicionado', label: 'Aire acondicionado', icon: 'AirVent' },
  { id: 'estacionamiento', label: 'Estacionamiento', icon: 'Car' },
  { id: 'cafe', label: 'Café de cortesía', icon: 'Coffee' },
  { id: 'accesibilidad', label: 'Accesibilidad', icon: 'Accessibility' },
  { id: 'productos-premium', label: 'Productos premium', icon: 'Sparkles' },
  { id: 'musica', label: 'Música ambiente', icon: 'Music' },
];

// ── Deportes / Fitness ───────────────────────────────────────
const AMENITIES_DEPORTES: Amenity[] = [
  { id: 'wifi', label: 'Wi-Fi', icon: 'Wifi' },
  { id: 'estacionamiento', label: 'Estacionamiento', icon: 'Car' },
  { id: 'vestuarios', label: 'Vestuarios', icon: 'DoorOpen' },
  { id: 'duchas', label: 'Duchas', icon: 'ShowerHead' },
  { id: 'lockers', label: 'Lockers', icon: 'Lock' },
  { id: 'cafe', label: 'Cafetería', icon: 'Coffee' },
  { id: 'iluminacion', label: 'Iluminación nocturna', icon: 'Lightbulb' },
  { id: 'techado', label: 'Espacio techado', icon: 'Home' },
  { id: 'accesibilidad', label: 'Accesibilidad', icon: 'Accessibility' },
];

// ── Salud / Profesionales ────────────────────────────────────
const AMENITIES_SALUD: Amenity[] = [
  { id: 'wifi', label: 'Wi-Fi', icon: 'Wifi' },
  { id: 'aire-acondicionado', label: 'Aire acondicionado', icon: 'AirVent' },
  { id: 'estacionamiento', label: 'Estacionamiento', icon: 'Car' },
  { id: 'accesibilidad', label: 'Accesibilidad', icon: 'Accessibility' },
  { id: 'sala-espera', label: 'Sala de espera', icon: 'Armchair' },
  { id: 'cafe', label: 'Café de cortesía', icon: 'Coffee' },
];

// ── Educación ────────────────────────────────────────────────
const AMENITIES_EDUCACION: Amenity[] = [
  { id: 'wifi', label: 'Wi-Fi', icon: 'Wifi' },
  { id: 'aire-acondicionado', label: 'Aire acondicionado', icon: 'AirVent' },
  { id: 'estacionamiento', label: 'Estacionamiento', icon: 'Car' },
  { id: 'proyector', label: 'Proyector', icon: 'Projector' },
  { id: 'pizarra', label: 'Pizarra', icon: 'PresentationChart' },
  { id: 'cafe', label: 'Café / Snacks', icon: 'Coffee' },
  { id: 'accesibilidad', label: 'Accesibilidad', icon: 'Accessibility' },
];

// ── Consultoría ──────────────────────────────────────────────
const AMENITIES_CONSULTORIA: Amenity[] = [
  { id: 'wifi', label: 'Wi-Fi', icon: 'Wifi' },
  { id: 'aire-acondicionado', label: 'Aire acondicionado', icon: 'AirVent' },
  { id: 'estacionamiento', label: 'Estacionamiento', icon: 'Car' },
  { id: 'accesibilidad', label: 'Accesibilidad', icon: 'Accessibility' },
  { id: 'sala-espera', label: 'Sala de espera', icon: 'Armchair' },
  { id: 'cafe', label: 'Café de cortesía', icon: 'Coffee' },
];

// ── Mapping rubro → amenities catalog ────────────────────────
const AMENITIES_BY_RUBRO: Record<string, Amenity[]> = {
  // Alquiler temporario
  'alquiler': AMENITIES_ALQUILER,
  'casas-quinta': AMENITIES_ALQUILER,
  'cabanas': AMENITIES_ALQUILER,
  'departamentos': AMENITIES_ALQUILER,
  'glamping': AMENITIES_ALQUILER,
  'country-barrios': AMENITIES_ALQUILER,
  // Inmobiliarias
  'inmobiliarias': AMENITIES_ALQUILER,
  // Hospedaje por horas
  'hospedaje': AMENITIES_HOSPEDAJE,
  'hoteles-por-turno': AMENITIES_HOSPEDAJE,
  'moteles': AMENITIES_HOSPEDAJE,
  // Espacios flexibles
  'espacios': AMENITIES_ESPACIOS,
  'coworking': AMENITIES_ESPACIOS,
  'salas-ensayo': AMENITIES_ESPACIOS,
  'estudios-foto': AMENITIES_ESPACIOS,
  'salones-eventos': AMENITIES_ESPACIOS,
  // Belleza
  'estetica-belleza': AMENITIES_BELLEZA,
  'barberia': AMENITIES_BELLEZA,
  'masajes-spa': AMENITIES_BELLEZA,
  'tatuajes-piercing': AMENITIES_BELLEZA,
  // Deportes
  'deportes': AMENITIES_DEPORTES,
  'fitness': AMENITIES_DEPORTES,
  'canchas': AMENITIES_DEPORTES,
  'natacion': AMENITIES_DEPORTES,
  'artes-marciales': AMENITIES_DEPORTES,
  'danza': AMENITIES_DEPORTES,
  'yoga-pilates': AMENITIES_DEPORTES,
  // Salud
  'salud': AMENITIES_SALUD,
  'psicologia': AMENITIES_SALUD,
  'nutricion': AMENITIES_SALUD,
  'odontologia': AMENITIES_SALUD,
  'kinesiologia': AMENITIES_SALUD,
  'veterinaria': AMENITIES_SALUD,
  // Educación
  'educacion': AMENITIES_EDUCACION,
  // Consultoría / Profesionales
  'consultoria': AMENITIES_CONSULTORIA,
  'legal': AMENITIES_CONSULTORIA,
  'contadores': AMENITIES_CONSULTORIA,
  'coaching': AMENITIES_CONSULTORIA,
};

/**
 * Get the amenities catalog for a given rubro.
 * Returns empty array if rubro has no specific catalog.
 */
export function getAmenitiesCatalog(rubro: string): Amenity[] {
  return AMENITIES_BY_RUBRO[rubro] || [];
}

/**
 * Get amenity details by IDs, filtered by rubro catalog.
 */
export function getSelectedAmenities(rubro: string, selectedIds: string[]): Amenity[] {
  const catalog = getAmenitiesCatalog(rubro);
  return selectedIds
    .map(id => catalog.find(a => a.id === id))
    .filter((a): a is Amenity => a !== undefined);
}
