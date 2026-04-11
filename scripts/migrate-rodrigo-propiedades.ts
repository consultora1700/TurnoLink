/**
 * Migration Script: Rodrigo Propiedades → TurnoLink
 *
 * 1. Registers "Rodrigo Propiedades" as inmobiliaria
 * 2. Creates property categories
 * 3. Downloads images from tokkobroker CDN
 * 4. Uploads images through TurnoLink media API (auto-optimizes to WebP)
 * 5. Creates all properties as products with full details + images
 *
 * Usage: npx ts-node scripts/migrate-rodrigo-propiedades.ts
 */

import * as fs from 'fs';
import * as path from 'path';
const API_BASE = 'http://localhost:3001/api';
const DOWNLOAD_DIR = '/tmp/rodrigo-propiedades-images';

// ============ ACCOUNT CONFIG ============
const ACCOUNT = {
  email: 'rodrigo@rodrigopropiedades.com.ar',
  password: 'RodrigoProp2026!',
  name: 'Rodrigo Propiedades',
  businessName: 'Rodrigo Propiedades',
  businessSlug: 'rodrigo-propiedades',
  industry: 'inmobiliarias',
};

// ============ CATEGORIES ============
const CATEGORIES = [
  { name: 'Departamentos', slug: 'departamentos' },
  { name: 'Casas', slug: 'casas' },
  { name: 'Terrenos', slug: 'terrenos' },
  { name: 'Locales', slug: 'locales' },
  { name: 'Oficinas', slug: 'oficinas' },
  { name: 'PHs', slug: 'phs' },
  { name: 'Galpones', slug: 'galpones' },
  { name: 'Cocheras', slug: 'cocheras' },
];

// ============ ALL 61 PROPERTIES ============

interface Property {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  price: number;
  currency: 'ARS' | 'USD';
  category: string; // slug
  operation: string; // Venta, Alquiler
  address: string;
  location: string;
  ambientes?: number;
  dormitorios?: number;
  banos?: number;
  superficieCubierta?: string;
  superficieTotal?: string;
  superficieTerreno?: string;
  garage?: string;
  antiguedad?: string;
  orientacion?: string;
  estado?: string;
  situacion?: string;
  expensas?: string;
  disposicion?: string;
  services?: string[];
  amenities?: string[];
  referenceCode?: string;
  images: string[];
  isFeatured?: boolean;
}

const PROPERTIES: Property[] = [
  // === ALQUILER ===
  {
    id: '6557420',
    title: 'Departamento en Alquiler - 2 entre 59 y 60, La Plata',
    description: 'Departamento en alquiler situado cerca de la zona de facultades, encontramos esta luminosa propiedad de un dormitorio con placard y piso de madera, con baño completo, ante baño, cocina integrada con barra desayunadora y amplio living comedor con pisos de madera. No cuenta con balcón. Contrato por 24 meses con ajuste semestral por Índice ICL.',
    shortDescription: '40m² · 2 amb · 1 dorm · Alquiler',
    price: 450000,
    currency: 'ARS',
    category: 'departamentos',
    operation: 'Alquiler',
    address: '2 entre 59 Y 60',
    location: 'La Plata',
    ambientes: 2,
    dormitorios: 1,
    banos: 1,
    superficieCubierta: '40 m²',
    superficieTotal: '40 m²',
    antiguedad: '10 Años',
    orientacion: 'Sur',
    disposicion: 'Contrafrente',
    estado: 'Muy bueno',
    situacion: 'Vacía',
    expensas: '$150.000',
    services: ['Agua Corriente', 'Gas Natural', 'Alumbrado público', 'Electricidad'],
    referenceCode: 'RAP6557420',
    images: [
      'https://static.tokkobroker.com/w_pics/6557420_1669811017639341697321823739776089260373967363205439428396972740344550209049.jpg',
    ],
  },
  {
    id: '7851782',
    title: 'Local en Alquiler - 4 entre 50 y 51, La Plata',
    description: 'Local comercial en alquiler ubicado sobre calle 4 entre 50 y 51 en La Plata. Excelente ubicación comercial.',
    shortDescription: 'Local comercial · Alquiler',
    price: 3500000,
    currency: 'ARS',
    category: 'locales',
    operation: 'Alquiler',
    address: '4 entre 50 y 51',
    location: 'La Plata',
    referenceCode: 'RLO7851782',
    images: [
      'https://static.tokkobroker.com/w_pics/7851782_86614682740199555107752332937923812690902973327534438867620955388683802255468.jpg',
    ],
  },
  {
    id: '6847395',
    title: 'Oficina en Alquiler - Plaza Italia N°37, La Plata',
    description: 'Oficina en alquiler en Plaza Italia, La Plata. Amplio espacio con 4 ambientes.',
    shortDescription: '4 amb · Oficina · Alquiler',
    price: 450000,
    currency: 'ARS',
    category: 'oficinas',
    operation: 'Alquiler',
    address: 'Plaza Italia N°37',
    location: 'La Plata',
    ambientes: 4,
    referenceCode: 'ROF6847395',
    images: [
      'https://static.tokkobroker.com/w_pics/6847395_12194571459205007197464872572683173485728490643957045681718047017560651135849.jpg',
    ],
  },
  {
    id: '7779291',
    title: 'Departamento en Alquiler - 37 e/ 19 y 20, La Plata',
    description: 'Departamento de un dormitorio ubicado en 37 e/ 19 y 20 piso 3, La Plata. Contrato por 24 meses con ajuste semestral por índice ICL.',
    shortDescription: '1 amb · 1 dorm · Alquiler',
    price: 400000,
    currency: 'ARS',
    category: 'departamentos',
    operation: 'Alquiler',
    address: '37 e/ 19 y 20 piso 3',
    location: 'La Plata',
    ambientes: 1,
    dormitorios: 1,
    referenceCode: 'RAP7779291',
    images: [
      'https://static.tokkobroker.com/w_pics/7779291_31757824237405417510732008428744724672937736992626971397604505652271552510700.jpg',
    ],
  },
  {
    id: '7779160',
    title: 'Departamento en Alquiler - 59 E/ 4 y 5, La Plata',
    description: 'Departamento de 4 ambientes en alquiler ubicado en 59 E/ 4 y 5 piso 5, La Plata.',
    shortDescription: '4 amb · Alquiler',
    price: 650000,
    currency: 'ARS',
    category: 'departamentos',
    operation: 'Alquiler',
    address: '59 E/ 4 y 5 piso 5',
    location: 'La Plata',
    ambientes: 4,
    referenceCode: 'RAP7779160',
    images: [
      'https://static.tokkobroker.com/w_pics/7779160_73367961484669872987334872821651771779830698852427841516735187451610243814100.jpg',
    ],
  },
  {
    id: '7121341',
    title: 'Oficina en Alquiler - 54 e/ 4 y 5, La Plata',
    description: 'Oficina en alquiler de 4 ambientes ubicada en 54 e/ 4 y 5, La Plata.',
    shortDescription: '4 amb · Oficina · Alquiler',
    price: 600000,
    currency: 'ARS',
    category: 'oficinas',
    operation: 'Alquiler',
    address: '54 e/ 4 y 5',
    location: 'La Plata',
    ambientes: 4,
    referenceCode: 'ROF7121341',
    images: [
      'https://static.tokkobroker.com/w_pics/7121341_49956666815356962340245355760242289722476015427745354020508696895796638731314.jpg',
    ],
  },
  {
    id: '7605326',
    title: 'Casa en Alquiler - 4 esquina 59, La Plata',
    description: 'Casa en alquiler de 6 ambientes y 3 dormitorios ubicada en 4 esquina 59, La Plata. 170m² cubiertos, cochera, terraza, baño de servicio. 70 años de antigüedad en buen estado.',
    shortDescription: '170m² · 6 amb · 3 dorm · Alquiler',
    price: 1200000,
    currency: 'ARS',
    category: 'casas',
    operation: 'Alquiler',
    address: '4 esquina 59',
    location: 'La Plata',
    ambientes: 6,
    dormitorios: 3,
    banos: 1,
    superficieCubierta: '170 m²',
    garage: '1',
    antiguedad: '70 Años',
    orientacion: 'NO',
    estado: 'Bueno',
    situacion: 'Vacía',
    services: ['Agua', 'Alumbrado', 'Cloaca', 'Electricidad', 'Gas', 'Pavimento'],
    referenceCode: 'RHO7605326',
    images: [
      'https://static.tokkobroker.com/w_pics/7605326_109761579928841051348747939892939932271658525196702548955325149633196905111388.jpg',
    ],
  },
  {
    id: '7517606',
    title: 'Departamento en Alquiler - 33 entre 5 y 6, La Plata',
    description: 'Departamento de un dormitorio ubicado próximo a autopista con cocina separada, baño completo, dormitorio con placar y amplio living comedor. Contrato por 24 meses con ajuste semestral por índice ICL.',
    shortDescription: '2 amb · 1 dorm · Alquiler',
    price: 450000,
    currency: 'ARS',
    category: 'departamentos',
    operation: 'Alquiler',
    address: '33 entre 5 y 6',
    location: 'La Plata',
    ambientes: 2,
    dormitorios: 1,
    banos: 1,
    antiguedad: '35 Años',
    estado: 'Bueno',
    situacion: 'Vacía',
    expensas: '$60.000',
    disposicion: 'Contrafrente',
    services: ['Agua Corriente', 'Alumbrado público', 'Cloaca', 'Electricidad'],
    referenceCode: 'RAP7517606',
    images: [
      'https://static.tokkobroker.com/w_pics/7517606_30822219167937616882987162725309834395344339625496012387376033564889506724149.jpg',
    ],
  },
  {
    id: '4365915',
    title: 'Casa en Alquiler - Campos de Roca, Coronel Brandsen',
    description: 'Casa en alquiler / alquiler temporario en Campos de Roca, Coronel Brandsen. 2 dormitorios.',
    shortDescription: '2 dorm · Casa · Alquiler temporario',
    price: 800,
    currency: 'USD',
    category: 'casas',
    operation: 'Alquiler',
    address: 'Campos de Roca',
    location: 'Coronel Brandsen',
    dormitorios: 2,
    referenceCode: 'RHO4365915',
    images: [
      'https://static.tokkobroker.com/w_pics/847814279383881195196378706909096042062610189818921858445803331082574255358803458.jpg',
    ],
  },
  {
    id: '7268868',
    title: 'Terreno en Venta/Alquiler - Camino Gral Belgrano, Manuel B Gonnet',
    description: 'Lote de 852m² con casa de 4 dormitorios, living-comedor, comedor diario, cocina, 3 baños, lavadero, depósito, quincho con parrilla, cochera, jardín, piscina + local comercial. 179m² cubiertos.',
    shortDescription: '852m² · 4 dorm · Casa + Local · Venta/Alquiler',
    price: 200000,
    currency: 'USD',
    category: 'terrenos',
    operation: 'Venta/Alquiler',
    address: 'Camino General Belgrano e/ 510 y 511',
    location: 'Manuel B Gonnet, La Plata',
    dormitorios: 4,
    banos: 3,
    superficieCubierta: '179 m²',
    superficieTerreno: '852 m²',
    garage: '1',
    services: ['Agua', 'Cable', 'Cloaca', 'Gas Natural', 'Alumbrado', 'Electricidad', 'Internet'],
    amenities: ['Quincho', 'Parrilla', 'Piscina', 'Jardín', 'Local comercial'],
    referenceCode: 'RLA7268868',
    images: [
      'https://static.tokkobroker.com/w_pics/7268868_114979879339264383580717314487690475506104247556782248666917081517961538224250.jpg',
    ],
    isFeatured: true,
  },

  // === VENTA - DEPARTAMENTOS ===
  {
    id: '7859719',
    title: 'Departamento en Venta - 12 entre 45 y 46, La Plata',
    description: 'Departamento en venta en La Plata, ubicado en 12 entre 45 y 46.',
    shortDescription: '1 amb · Departamento · Venta',
    price: 40000,
    currency: 'USD',
    category: 'departamentos',
    operation: 'Venta',
    address: '12 entre 45 y 46',
    location: 'La Plata',
    ambientes: 1,
    referenceCode: 'RAP7859719',
    images: [
      'https://static.tokkobroker.com/w_pics/7859719_16762026399048355543284585596948858706946836538848644826809517963179572549917.jpg',
    ],
  },
  {
    id: '7877251',
    title: 'Departamento en Venta - Av. 14 al 3400, Berazategui',
    description: 'Departamento en venta en Berazategui, 2 ambientes.',
    shortDescription: '2 amb · Departamento · Venta',
    price: 45000,
    currency: 'USD',
    category: 'departamentos',
    operation: 'Venta',
    address: 'Av. 14 al 3400',
    location: 'Berazategui',
    ambientes: 2,
    referenceCode: 'RAP7877251',
    images: [
      'https://static.tokkobroker.com/w_pics/7877251_86687153645611884525016425926134558361736609039618993411912093804598938525861.jpg',
    ],
  },
  {
    id: '7374968',
    title: 'Departamento en Venta - Greenville Polo & Resort, Spring Torre 1',
    description: 'Departamento en Greenville Polo & Resort, Spring Torre 1. 2 ambientes, 54m². Complejo residencial con hotel 5 estrellas, amenities, seguridad 24hs, pileta.',
    shortDescription: '54m² · 2 amb · Greenville · Venta',
    price: 165000,
    currency: 'USD',
    category: 'departamentos',
    operation: 'Venta',
    address: 'Greenville Polo & Resort - Spring Torre 1',
    location: 'Berazategui',
    ambientes: 2,
    superficieCubierta: '54 m²',
    amenities: ['Seguridad 24hs', 'Pileta', 'Amenities', 'Hotel 5 estrellas'],
    referenceCode: 'RAP7374968',
    images: [
      'https://static.tokkobroker.com/w_pics/7374968_107055269011524667808091166996614391225273809429310325244140381690689674380281.jpg',
    ],
    isFeatured: true,
  },
  {
    id: '7815578',
    title: 'Departamento en Venta - Greenville Polo & Resort, Condominios Torre Oeste',
    description: 'Departamento 1 dormitorio en Greenville Polo & Resort, Condominios Torre oeste. 68.60m², cocina equipada, barra desayunadora, placard empotrado, baño con bañera. Condominios conectados al hotel Sheraton, vistas al waterpark y canchas de polo.',
    shortDescription: '68.60m² · 2 amb · 1 dorm · Greenville · Venta',
    price: 185000,
    currency: 'USD',
    category: 'departamentos',
    operation: 'Venta',
    address: 'Greenville Polo & Resort - Condominios Torre Oeste',
    location: 'Berazategui',
    ambientes: 2,
    dormitorios: 1,
    banos: 1,
    superficieCubierta: '62 m²',
    superficieTotal: '68.60 m²',
    garage: '2',
    antiguedad: '7 Años',
    estado: 'Muy bueno',
    expensas: '$280.000',
    amenities: ['Centro deportes', 'Seguridad 24hs', 'Pileta', 'Calefacción central', 'Amenities'],
    services: ['Agua', 'Cloaca', 'Internet', 'Electricidad', 'Pavimento', 'Cable'],
    referenceCode: 'RAP7815578',
    images: [
      'https://static.tokkobroker.com/w_pics/7815578_106067777547300428812680930110520070595709859986668624426299950523180938969085.jpg',
    ],
    isFeatured: true,
  },
  {
    id: '7195563',
    title: 'Departamento en Venta - Greenville Polo & Resort, Condominios Torre Oeste',
    description: 'Departamento 1 dormitorio en Greenville Polo & Resort, Condominios Torre oeste. 68.60m² total, 62m² cubiertos + 6m² semicubiertos. Cocina equipada, barra desayunadora, placard empotrado, baño con bañera. Condominios conectados al hotel Sheraton.',
    shortDescription: '68.60m² · 2 amb · 1 dorm · Greenville · Venta',
    price: 178000,
    currency: 'USD',
    category: 'departamentos',
    operation: 'Venta',
    address: 'Greenville Polo & Resort - Condominios Torre Oeste',
    location: 'Berazategui',
    ambientes: 2,
    dormitorios: 1,
    banos: 1,
    superficieCubierta: '62 m²',
    superficieTotal: '68.60 m²',
    garage: '2',
    antiguedad: '7 Años',
    orientacion: 'NE',
    estado: 'Muy bueno',
    situacion: 'Vacía',
    expensas: '$280.000',
    amenities: ['Centro deportes', 'Seguridad 24hs', 'Pileta', 'Calefacción central', 'Amenities'],
    services: ['Agua', 'Cloaca', 'Internet', 'Electricidad', 'Pavimento', 'Cable'],
    referenceCode: 'RAP7195563',
    images: [
      'https://static.tokkobroker.com/w_pics/7195563_54205570854639061316874871439812668416062161787319853591736235572150153785895.jpg',
    ],
  },
  {
    id: '7565546',
    title: 'Departamento en Venta - Greenville Polo & Resort, Spring Torre 1 Piso 5',
    description: 'Departamento en Greenville Polo & Resort, Spring Torre 1, Piso 5. 2 ambientes, 54m².',
    shortDescription: '54m² · 2 amb · Greenville Spring · Venta',
    price: 160000,
    currency: 'USD',
    category: 'departamentos',
    operation: 'Venta',
    address: 'Greenville Polo & Resort - Spring Torre 1 Piso 5',
    location: 'Berazategui',
    ambientes: 2,
    superficieCubierta: '54 m²',
    referenceCode: 'RAP7565546',
    images: [
      'https://static.tokkobroker.com/w_pics/7565546_72931431561016550628947568136777887828886806844455052061738733527326758497763.jpg',
    ],
  },
  {
    id: '7782232',
    title: 'Departamento en Venta - 2 e 54 y 55, La Plata',
    description: 'Departamento de 2 ambientes, 1 dormitorio, 1 baño. 42m² total. Buen estado, 40 años de antigüedad.',
    shortDescription: '42m² · 2 amb · 1 dorm · Venta',
    price: 58000,
    currency: 'USD',
    category: 'departamentos',
    operation: 'Venta',
    address: '2 e 54 y 55',
    location: 'La Plata',
    ambientes: 2,
    dormitorios: 1,
    banos: 1,
    superficieTotal: '42 m²',
    antiguedad: '40 Años',
    orientacion: 'Sur',
    disposicion: 'Contrafrente',
    estado: 'Bueno',
    situacion: 'Vacía',
    services: ['Agua', 'Cable', 'Cloaca', 'Electricidad', 'Alumbrado'],
    referenceCode: 'RAP7782232',
    images: [
      'https://static.tokkobroker.com/w_pics/7782232_70571415825876665439013459284506559076845986771830671821142107438446228382641.jpg',
    ],
  },
  {
    id: '7781759',
    title: 'Departamento en Venta - 38 e/ 17 y 18, La Plata',
    description: 'Departamento de 2 ambientes, 1 dormitorio. 43m² total. Pisos de madera, placard, cocina comedor, baño, balcón. Muy buen estado, 8 años. Actualmente alquilado.',
    shortDescription: '43m² · 2 amb · 1 dorm · Venta',
    price: 70000,
    currency: 'USD',
    category: 'departamentos',
    operation: 'Venta',
    address: '38 e/ 17 y 18',
    location: 'La Plata',
    ambientes: 2,
    dormitorios: 1,
    banos: 1,
    superficieTotal: '43 m²',
    antiguedad: '8 Años',
    orientacion: 'Suroeste',
    disposicion: 'Contrafrente',
    estado: 'Muy bueno',
    services: ['Agua', 'Cable', 'Pavimento', 'Internet', 'Wifi', 'Gas Natural'],
    referenceCode: 'RAP7781759',
    images: [
      'https://static.tokkobroker.com/w_pics/7781759_111367811482379197138903708853658876417936036202099257007804839132661374631757.jpg',
    ],
  },
  {
    id: '7781745',
    title: 'Departamento en Venta - 25 e/ 46 y 47, La Plata',
    description: 'Departamento de 1 ambiente, 1 baño, 40m². Muy buen estado, 8 años.',
    shortDescription: '40m² · 1 amb · Venta',
    price: 65000,
    currency: 'USD',
    category: 'departamentos',
    operation: 'Venta',
    address: '25 e/ 46 y 47',
    location: 'La Plata',
    ambientes: 1,
    banos: 1,
    superficieCubierta: '40 m²',
    antiguedad: '8 Años',
    orientacion: 'Sur',
    disposicion: 'Contrafrente',
    estado: 'Muy bueno',
    situacion: 'Habitada',
    services: ['Agua', 'Cable', 'Cloaca', 'Electricidad', 'Alumbrado', 'Wifi', 'Gas', 'Internet'],
    referenceCode: 'RAP7781745',
    images: [
      'https://static.tokkobroker.com/w_pics/7781745_7612963277951585372349016721696027878431081735134770500677548547144586252884.jpg',
    ],
  },
  {
    id: '7442318',
    title: 'Departamento en Venta - 40 al 500, La Plata',
    description: 'Departamento de 2 ambientes, 1 dormitorio. 40m² cubiertos + 4m² semicubiertos. Excelente estado, 7 años. Terraza, sala de reuniones, quincho, SUM.',
    shortDescription: '44m² · 2 amb · 1 dorm · Venta',
    price: 62000,
    currency: 'USD',
    category: 'departamentos',
    operation: 'Venta',
    address: '40 al 500',
    location: 'La Plata',
    ambientes: 2,
    dormitorios: 1,
    banos: 1,
    superficieCubierta: '40 m²',
    antiguedad: '7 Años',
    orientacion: 'NE',
    disposicion: 'Contrafrente',
    estado: 'Excelente',
    situacion: 'Vacía',
    expensas: '$55.000',
    amenities: ['Terraza', 'Sala de reuniones', 'Quincho', 'SUM'],
    referenceCode: 'RAP7442318',
    images: [
      'https://static.tokkobroker.com/w_pics/7442318_28017829688337235804956600852249335900664547372370848019515846282236197674946.jpg',
    ],
  },
  {
    id: '4113205',
    title: 'Departamento en Venta - 64 18 y 19, La Plata',
    description: 'Departamento de 3 ambientes, 2 dormitorios, 1 baño. 60m² cubiertos. Buen estado, 60 años. Cocina, comedor diario, jardín, lavadero.',
    shortDescription: '60m² · 3 amb · 2 dorm · Venta',
    price: 65000,
    currency: 'USD',
    category: 'departamentos',
    operation: 'Venta',
    address: '64 18 y 19',
    location: 'La Plata',
    ambientes: 3,
    dormitorios: 2,
    banos: 1,
    superficieCubierta: '60 m²',
    antiguedad: '60 Años',
    orientacion: 'Norte',
    disposicion: 'Interno',
    estado: 'Bueno',
    situacion: 'Habitada',
    services: ['Agua', 'Cloaca', 'Internet', 'Electricidad', 'Pavimento', 'Teléfono', 'Cable'],
    referenceCode: 'LAP4042230',
    images: [
      'https://static.tokkobroker.com/w_pics/847868015152084159967219406158944229973856289974270739723727643453246287844333268.jpg',
    ],
  },
  {
    id: '7474027',
    title: 'Departamento en Venta - 46 al 900, La Plata',
    description: 'Departamento de 4 ambientes, 2 dormitorios. 51m² cubiertos + 3m² semicubiertos + 39m² descubiertos = 94m² total. 45 años.',
    shortDescription: '94m² total · 4 amb · 2 dorm · Venta',
    price: 74000,
    currency: 'USD',
    category: 'departamentos',
    operation: 'Venta',
    address: '46 al 900',
    location: 'La Plata',
    ambientes: 4,
    dormitorios: 2,
    superficieCubierta: '51 m²',
    superficieTotal: '94 m²',
    antiguedad: '45 Años',
    orientacion: 'NE',
    disposicion: 'Interno',
    expensas: '$55.000',
    services: ['Agua', 'Agua Potable', 'Alumbrado', 'Electricidad', 'Cloaca', 'Pavimento'],
    referenceCode: 'RAP7474027',
    images: [
      'https://static.tokkobroker.com/w_pics/7474027_2379994818758760939972922214116725336196067502378872287120855536523451806030.jpg',
    ],
  },
  {
    id: '5950713',
    title: 'Departamento en Venta - 4 54 y 55, La Plata',
    description: 'Departamento de 3 ambientes, 80m². En venta.',
    shortDescription: '80m² · 3 amb · Venta',
    price: 157000,
    currency: 'USD',
    category: 'departamentos',
    operation: 'Venta',
    address: '4 54 y 55',
    location: 'La Plata',
    ambientes: 3,
    superficieCubierta: '80 m²',
    referenceCode: 'RAP5950713',
    images: [
      'https://static.tokkobroker.com/w_pics/84787215621606865961556797985409834442918141599455997270927480217242719340331661.jpg',
    ],
  },
  {
    id: '4113139',
    title: 'Departamento en Venta - 43 e/ 11 y 12, Plaza Italia, La Plata',
    description: 'Departamento de 3 ambientes, 40m². Plaza Italia.',
    shortDescription: '40m² · 3 amb · Plaza Italia · Venta',
    price: 73000,
    currency: 'USD',
    category: 'departamentos',
    operation: 'Venta',
    address: '43 e/ 11 y 12',
    location: 'Plaza Italia, La Plata',
    ambientes: 3,
    superficieCubierta: '40 m²',
    referenceCode: 'RAP4113139',
    images: [
      'https://static.tokkobroker.com/w_pics/4113139_3520663448947297676888494970175071095698835656432314800099796593057227120277.jpg',
    ],
  },
  {
    id: '4113122',
    title: 'Departamento en Venta - 47 e 2 y 3, Microcentro, La Plata',
    description: 'Departamento de 5 ambientes, 92m². Microcentro.',
    shortDescription: '92m² · 5 amb · Microcentro · Venta',
    price: 100000,
    currency: 'USD',
    category: 'departamentos',
    operation: 'Venta',
    address: '47 e 2 y 3',
    location: 'Microcentro, La Plata',
    ambientes: 5,
    superficieCubierta: '92 m²',
    referenceCode: 'RAP4113122',
    images: [
      'https://static.tokkobroker.com/w_pics/4113122_101092682009570358097059887282340051996327851190770449674839048789743131442211.jpg',
    ],
  },
  {
    id: '4113198',
    title: 'Departamento en Venta - 62 12 y 13, La Plata',
    description: 'Departamento de 5 ambientes, 76.78m². En venta.',
    shortDescription: '76.78m² · 5 amb · Venta',
    price: 105000,
    currency: 'USD',
    category: 'departamentos',
    operation: 'Venta',
    address: '62 12 y 13',
    location: 'La Plata',
    ambientes: 5,
    superficieCubierta: '76.78 m²',
    referenceCode: 'RAP4113198',
    images: [
      'https://static.tokkobroker.com/w_pics/4113198_7225647885563132413898652513796352525546456324362655558430609451125541889442.jpg',
    ],
  },
  {
    id: '4113207',
    title: 'Departamento en Venta - 26 35 y 36, La Plata',
    description: 'Departamento de 3 ambientes, 58m². En venta.',
    shortDescription: '58m² · 3 amb · Venta',
    price: 63000,
    currency: 'USD',
    category: 'departamentos',
    operation: 'Venta',
    address: '26 35 y 36',
    location: 'La Plata',
    ambientes: 3,
    superficieCubierta: '58 m²',
    referenceCode: 'RAP4113207',
    images: [
      'https://static.tokkobroker.com/w_pics/847849374617640716102402666292795242411691947639718988724186647828833204848456632.jpg',
    ],
  },
  {
    id: '6908907',
    title: 'Departamento en Venta - Diagonal 74 y 9, Microcentro, La Plata',
    description: 'Luminoso departamento ubicado en el centro de la ciudad, sobre calle 9 y diagonal 74 cuarto piso. Cuenta con un amplio estar comedor, cocina separada con lavadero cubierto, 3 dormitorios con piso de madera (2 de ellos con placar), amplio placar en pasillo distribuidor, 1 toilette y 1 baño completo. APTO BANCO.',
    shortDescription: '70m² · 5 amb · 3 dorm · Microcentro · Venta',
    price: 73000,
    currency: 'USD',
    category: 'departamentos',
    operation: 'Venta',
    address: 'Diagonal 74 y 9',
    location: 'Microcentro, La Plata',
    ambientes: 5,
    dormitorios: 3,
    banos: 2,
    superficieCubierta: '68 m²',
    superficieTotal: '70 m²',
    antiguedad: '50 Años',
    orientacion: 'Norte',
    estado: 'Bueno',
    situacion: 'Vacía',
    services: ['Agua Corriente', 'Cloaca', 'Alumbrado público', 'Electricidad', 'Cable', 'Gas Natural'],
    referenceCode: 'RAP6908907',
    images: [
      'https://static.tokkobroker.com/w_pics/6908907_41864724390909734023876676923197183661311042648717148299957277883648814578349.jpg',
    ],
  },
  {
    id: '4194045',
    title: 'Departamento en Venta - 57 e/ 17 y 18, La Plata',
    description: 'Departamento en venta de dos dormitorios. Interno por pasillo - 2 patios - 2 dormitorios - cocina - baño completo - lavadero - 50 mts.',
    shortDescription: '50m² · 2 dorm · Venta',
    price: 0,
    currency: 'USD',
    category: 'departamentos',
    operation: 'Venta',
    address: '57 e/ 17 y 18',
    location: 'La Plata',
    ambientes: 2,
    dormitorios: 1,
    banos: 1,
    superficieCubierta: '50 m²',
    antiguedad: '50 Años',
    services: ['Agua Corriente', 'Gas Natural', 'Cable', 'Internet', 'Cloaca', 'Pavimento', 'Electricidad', 'Teléfono'],
    referenceCode: 'RAP4194045',
    images: [
      'https://static.tokkobroker.com/w_pics/84783827733270513357622511959197082249212840599385820597950066022697458568554247.jpg',
    ],
  },
  {
    id: '4113171',
    title: 'Departamento en Venta - 54 4 y 5, La Plata',
    description: 'Departamento de dos dormitorios con placard, pisos de madera, living, cocina, lavadero cubierto. Alquilado hasta mayo 2026.',
    shortDescription: '65m² · 3 amb · 2 dorm · Venta',
    price: 80000,
    currency: 'USD',
    category: 'departamentos',
    operation: 'Venta',
    address: '54 4 y 5',
    location: 'La Plata',
    ambientes: 3,
    dormitorios: 2,
    banos: 1,
    superficieCubierta: '65 m²',
    antiguedad: '40 Años',
    services: ['Agua Corriente', 'Cloaca', 'Gas Natural', 'Internet', 'Electricidad', 'Pavimento', 'Teléfono', 'Cable'],
    referenceCode: 'LAP4031814',
    images: [
      'https://static.tokkobroker.com/w_pics/4113171_87137452569641974026677075625806049934294527917410222022165399241688941237057.jpg',
    ],
  },
  {
    id: '4113125',
    title: 'Departamento en Venta - 7 esquina 59, Plaza Rocha, La Plata',
    description: 'En esquina, antiguo, primer piso por escalera, pisos de pinotea, 166 metros cubiertos, 3 dormitorios, living, comedor, cocina comedor, escritorio, 2 baños, 4 balcones, pieza y baño de servicio, y terraza con parrilla.',
    shortDescription: '166m² · 9 amb · 3 dorm · Plaza Rocha · Venta',
    price: 140000,
    currency: 'USD',
    category: 'departamentos',
    operation: 'Venta',
    address: '7 esquina 59',
    location: 'Plaza Rocha, La Plata',
    ambientes: 9,
    dormitorios: 3,
    banos: 3,
    superficieCubierta: '166 m²',
    antiguedad: '70 Años',
    orientacion: 'Oeste',
    disposicion: 'Frente',
    estado: 'Bueno',
    situacion: 'Habitada',
    amenities: ['4 balcones', 'Terraza con parrilla', 'Pisos de pinotea', 'Escritorio', 'Calefacción'],
    services: ['Agua Corriente', 'Cloaca', 'Gas Natural', 'Internet', 'Electricidad', 'Pavimento', 'Teléfono', 'Cable'],
    referenceCode: 'LAP4026485',
    images: [
      'https://static.tokkobroker.com/w_pics/847857110798710646436087850597237045373603916593531677784798264038917852087096463.jpg',
    ],
  },

  // === VENTA - GALPONES ===
  {
    id: '7554622',
    title: 'Galpón en Venta - 509 e/131 y 132, José Hernández, La Plata',
    description: 'Galpón en venta en José Hernández, La Plata.',
    shortDescription: 'Galpón · Venta',
    price: 260000,
    currency: 'USD',
    category: 'galpones',
    operation: 'Venta',
    address: '509 e/131 y 132',
    location: 'José Hernández, La Plata',
    referenceCode: 'RAP7554622',
    images: [
      'https://static.tokkobroker.com/w_pics/7554622_75404173369478974581518900115906459829709310666472754384705787210217892529846.jpg',
    ],
  },

  // === VENTA - TERRENOS ===
  {
    id: '5403514',
    title: 'Terreno en Venta - Greenville Polo & Resort, Villa 8 Barrio H',
    description: 'Terreno de 895m² en Greenville Polo & Resort, Villa 8 Barrio H.',
    shortDescription: '895m² · Greenville · Venta',
    price: 150000,
    currency: 'USD',
    category: 'terrenos',
    operation: 'Venta',
    address: 'Greenville Polo & Resort - Villa 8 Barrio H',
    location: 'Berazategui',
    superficieTerreno: '895 m²',
    referenceCode: 'RLA5403514',
    images: [
      'https://static.tokkobroker.com/w_pics/847889889370194279585736779010322533949919293725035282926938376618660267072129286.jpg',
    ],
  },
  {
    id: '7864686',
    title: 'Terreno en Venta - Greenville Polo & Resort, Villa 8 Barrio H',
    description: 'Terreno de 762.98m² en Greenville Polo & Resort, Villa 8 Barrio H.',
    shortDescription: '762.98m² · Greenville · Venta',
    price: 139000,
    currency: 'USD',
    category: 'terrenos',
    operation: 'Venta',
    address: 'Greenville Polo & Resort - Villa 8 Barrio H',
    location: 'Berazategui',
    superficieTerreno: '762.98 m²',
    referenceCode: 'RLA7864686',
    images: [
      'https://static.tokkobroker.com/w_pics/7864686_10739753681468763346452800296826936716576792517255102639859813130194814124937.jpg',
    ],
  },
  {
    id: '7866570',
    title: 'Terreno en Venta - Greenville Polo & Resort, Villa 7 Barrio G',
    description: 'Terreno de 846m² en Greenville Polo & Resort, Villa 7 Barrio G.',
    shortDescription: '846m² · Greenville · Venta',
    price: 155000,
    currency: 'USD',
    category: 'terrenos',
    operation: 'Venta',
    address: 'Greenville Polo & Resort - Villa 7 Barrio G',
    location: 'Berazategui',
    superficieTerreno: '846 m²',
    referenceCode: 'RLA7866570',
    images: [
      'https://static.tokkobroker.com/w_pics/7866570_58296049032211135150759773066256143565298854610724371748920415975822520791505.jpg',
    ],
  },
  {
    id: '7864601',
    title: 'Terreno en Venta - Haras del Sur 3, Coronel Brandsen',
    description: 'Terreno de 1000m² en Haras del Sur 3, Coronel Brandsen.',
    shortDescription: '1000m² · Haras del Sur · Venta',
    price: 39000,
    currency: 'USD',
    category: 'terrenos',
    operation: 'Venta',
    address: 'Haras del Sur 3',
    location: 'Coronel Brandsen',
    superficieTerreno: '1000 m²',
    referenceCode: 'RLA7864601',
    images: [
      'https://static.tokkobroker.com/w_pics/7864601_69732196091832676776393796581243434070396868153991582630394312232200917428204.jpg',
    ],
  },
  {
    id: '7196231',
    title: 'Terreno en Venta - Greenville Polo & Resort, Villa 8 Barrio H',
    description: 'Terreno de 1076m² en Greenville Polo & Resort, Villa 8 Barrio H.',
    shortDescription: '1076m² · Greenville · Venta',
    price: 171000,
    currency: 'USD',
    category: 'terrenos',
    operation: 'Venta',
    address: 'Greenville Polo & Resort - Villa 8 Barrio H',
    location: 'Berazategui',
    superficieTerreno: '1076 m²',
    referenceCode: 'RLA7196231',
    images: [
      'https://static.tokkobroker.com/w_pics/7196231_88549844417773909659574628547165935130553931427936872730068441791445388961227.jpg',
    ],
  },
  {
    id: '7749708',
    title: 'Terreno en Venta - Camino Belgrano e/ 476 y 477, City Bell',
    description: 'Lote 25x85m (2000m²), casa 2 plantas 280m² cubiertos. PB: living, cocina comedor, baño, escritorio, lavadero, garage cubierto, galería, pileta 5x10. PA: 3 dormitorios, 2 baños, balcón.',
    shortDescription: '2000m² · Casa 280m² · 3 dorm · City Bell · Venta',
    price: 550000,
    currency: 'USD',
    category: 'terrenos',
    operation: 'Venta',
    address: 'Camino Belgrano e/ 476 y 477',
    location: 'City Bell, La Plata',
    dormitorios: 3,
    banos: 2,
    superficieCubierta: '280 m²',
    superficieTerreno: '2000 m²',
    garage: '1',
    amenities: ['Pileta 5x10', 'Galería', 'Escritorio', 'Lavadero'],
    services: ['Agua', 'Cloaca', 'Gas', 'Internet', 'Electricidad', 'Pavimento', 'Teléfono', 'Cable'],
    referenceCode: 'RLA7749708',
    images: [
      'https://static.tokkobroker.com/w_pics/7749708_38068971252791330899691682998457920709442881829385852173438442082102634053847.jpg',
    ],
    isFeatured: true,
  },
  {
    id: '7720816',
    title: 'Terreno en Venta - Greenville Polo & Resort, Villa 1 Barrio A',
    description: 'Terreno de 700m² (20x35m) en Greenville Polo & Resort, Villa 1 Barrio A. 130 hectáreas, hotel 5 estrellas, Health Club, Spa, Gimnasio 800m².',
    shortDescription: '700m² · Greenville · Venta',
    price: 185000,
    currency: 'USD',
    category: 'terrenos',
    operation: 'Venta',
    address: 'Greenville Polo & Resort - Villa 1 Barrio A',
    location: 'Berazategui',
    superficieTerreno: '700 m²',
    expensas: '$690.000',
    amenities: ['Centro deportes', 'Seguridad Privada', 'Canchas fútbol/tenis', 'Zonas Verdes', 'Amenities'],
    referenceCode: 'RLA7720816',
    images: [
      'https://static.tokkobroker.com/w_pics/7720816_43151527879995944332330400841974286166026694111759864390066297815756929278626.jpg',
    ],
  },
  {
    id: '7540750',
    title: 'Terreno en Venta - Greenville Polo & Resort, Villa 1 Barrio A',
    description: 'Terreno de 1197m² (39.98x40m) en Greenville Polo & Resort, Villa 1 Barrio A. Hotel Sheraton, amenities completos.',
    shortDescription: '1197m² · Greenville · Venta',
    price: 215000,
    currency: 'USD',
    category: 'terrenos',
    operation: 'Venta',
    address: 'Greenville Polo & Resort - Villa 1 Barrio A',
    location: 'Berazategui',
    superficieTerreno: '1197 m²',
    expensas: '$800.000',
    amenities: ['Centro deportes', 'Gimnasio', 'Solarium', 'Seguridad', 'Zonas Verdes', 'Canchas fútbol/tenis'],
    referenceCode: 'RLA7540750',
    images: [
      'https://static.tokkobroker.com/w_pics/7540750_48519339536191382518913981471221075056674832865662486963791478378053138764737.jpg',
    ],
  },
  {
    id: '7312466',
    title: 'Terreno en Venta - 62 e/7 y 8, Plaza Rocha, La Plata',
    description: 'Terreno en venta. 250m² cubierta, frente 10m, fondo 60m.',
    shortDescription: '600m² · Plaza Rocha · Venta',
    price: 480000,
    currency: 'USD',
    category: 'terrenos',
    operation: 'Venta',
    address: '62 e/7 y 8',
    location: 'Plaza Rocha, La Plata',
    superficieCubierta: '250 m²',
    superficieTerreno: '600 m²',
    services: ['Agua', 'Cloaca', 'Gas', 'Internet', 'Electricidad', 'Pavimento', 'Teléfono', 'Cable'],
    referenceCode: 'RLA7312466',
    images: [
      'https://static.tokkobroker.com/w_pics/7312466_102729077656984407771488581546018414558827187349311003615276524605319949171761.jpg',
    ],
  },
  {
    id: '4264219',
    title: 'Terreno en Venta - 645 y Diag. 133, Nueva Hermosura, La Plata',
    description: 'Lote de 20 x 40 en Ruta 11, 645 y Diag. 133.',
    shortDescription: '800m² · Nueva Hermosura · Venta',
    price: 25000,
    currency: 'USD',
    category: 'terrenos',
    operation: 'Venta',
    address: '645 y Diag. 133',
    location: 'Nueva Hermosura, La Plata',
    superficieTerreno: '800 m²',
    referenceCode: 'RLA4264219',
    images: [
      'https://static.tokkobroker.com/w_pics/847890250039512975157580704084243345363210996330316971711087683603163420731938255.jpg',
    ],
  },
  {
    id: '6227720',
    title: 'Terreno en Venta - 12 entre 33 y 34, La Plata',
    description: 'Terreno en venta. 18.70 mts de frente x 50 mts. Densidad: 900 hab/ha. LTG.',
    shortDescription: '1015m² · 18.7x50 · Venta',
    price: 480000,
    currency: 'USD',
    category: 'terrenos',
    operation: 'Venta',
    address: '12 entre 33 y 34',
    location: 'La Plata',
    superficieCubierta: '200 m²',
    superficieTerreno: '1015 m²',
    services: ['Agua Corriente', 'Agua Potable', 'Cloaca', 'Gas Natural'],
    referenceCode: 'RLA6227720',
    images: [
      'https://static.tokkobroker.com/w_pics/84786227720_91498311514561482655890720673741803363335093301289347157647405812168353658344.jpg',
    ],
  },
  {
    id: '6210271',
    title: 'Terreno en Venta - 424 15 y 16, La Plata',
    description: 'Lote en venta 424 15 y 16. 20 x 40 Mts.',
    shortDescription: '800m² · 20x40 · Venta',
    price: 30000,
    currency: 'USD',
    category: 'terrenos',
    operation: 'Venta',
    address: '424 15 y 16',
    location: 'La Plata',
    superficieTerreno: '800 m²',
    referenceCode: 'RLA6210271',
    images: [
      'https://static.tokkobroker.com/w_pics/84786210271_48573386202147230438741933712385176132511959256316459860425209993986507766450.jpg',
    ],
  },
  {
    id: '4684066',
    title: 'Terreno en Venta - 77 30 y 31, La Plata',
    description: 'Lote en 77 30 y 31 - La Plata. Terreno de 42 x 50mts, ideal emprendimiento vivienda multifamiliar.',
    shortDescription: '2100m² · 42x50 · Ideal emprendimiento · Venta',
    price: 220000,
    currency: 'USD',
    category: 'terrenos',
    operation: 'Venta',
    address: '77 30 y 31',
    location: 'La Plata',
    superficieTerreno: '2100 m²',
    services: ['Electricidad', 'Gas Natural'],
    referenceCode: 'RHO4684066',
    images: [
      'https://static.tokkobroker.com/w_pics/847879424226927180167862899416035915575792476175717782692752237380889126603446305.jpg',
    ],
  },
  {
    id: '6415118',
    title: 'Terreno en Venta - 27 y 419, Villa Elisa',
    description: 'Terreno de 2400m² (40x60). Las medidas publicadas son a mero efecto orientativo.',
    shortDescription: '2400m² · 40x60 · Villa Elisa · Venta',
    price: 280000,
    currency: 'USD',
    category: 'terrenos',
    operation: 'Venta',
    address: '27 y 419',
    location: 'Villa Elisa, La Plata',
    superficieTerreno: '2400 m²',
    referenceCode: 'RLA6415118',
    images: [
      'https://static.tokkobroker.com/w_pics/6415118_68826375896506828812325447832724349538718075854152197618127519859252003197691.jpg',
    ],
  },

  // === VENTA - CASAS ===
  {
    id: '7848374',
    title: 'Casa en Venta - 71 e/ 134 y 135, Los Hornos, La Plata',
    description: 'Casa de 2 dormitorios, 110m². En venta en Los Hornos.',
    shortDescription: '110m² · 2 dorm · Los Hornos · Venta',
    price: 93000,
    currency: 'USD',
    category: 'casas',
    operation: 'Venta',
    address: '71 e/ 134 y 135',
    location: 'Los Hornos, La Plata',
    dormitorios: 2,
    superficieCubierta: '110 m²',
    referenceCode: 'RHO7848374',
    images: [
      'https://static.tokkobroker.com/w_pics/7848374_86022228688873159204940643218430884316512712420757485705819832416250683628164.jpg',
    ],
  },
  {
    id: '4113155',
    title: 'Casa en Venta - 24 459 y 460, City Bell, La Plata',
    description: 'Casa de 94m², 2 dormitorios, en City Bell.',
    shortDescription: '94m² · 2 dorm · City Bell · Venta',
    price: 160000,
    currency: 'USD',
    category: 'casas',
    operation: 'Venta',
    address: '24 459 y 460',
    location: 'City Bell, La Plata',
    dormitorios: 2,
    superficieCubierta: '94 m²',
    referenceCode: 'RHO4113155',
    images: [
      'https://static.tokkobroker.com/w_pics/847897621324531727668635896501493697746512056191495902915061599952976423250638024.jpg',
    ],
  },
  {
    id: '7163394',
    title: 'Casa en Venta - 38 e/10 y 11, Barrio Norte, La Plata',
    description: 'Casa de 210m², 3 dormitorios, en Barrio Norte.',
    shortDescription: '210m² · 3 dorm · Barrio Norte · Venta',
    price: 240000,
    currency: 'USD',
    category: 'casas',
    operation: 'Venta',
    address: '38 e/10 y 11',
    location: 'Barrio Norte, La Plata',
    dormitorios: 3,
    superficieCubierta: '210 m²',
    referenceCode: 'RHO7163394',
    images: [
      'https://static.tokkobroker.com/w_pics/7163394_14417923987121762509222408349388162187846852078576955597102582819562712942630.jpg',
    ],
  },
  {
    id: '4324139',
    title: 'Casa en Venta - 452 Esquina 21, City Bell, La Plata',
    description: 'Casa sobre lote de 20 x 50 mts + 15 x 50 mts. Cuenta con tres dormitorios con placard, tres baños, cocina comedor, living, galería y jardín con pileta de 6x10 mts. Cochera para 3 autos. Caldera y radiadores.',
    shortDescription: '220m² · 3 dorm · 3 baños · Pileta · City Bell · Venta',
    price: 257000,
    currency: 'USD',
    category: 'casas',
    operation: 'Venta',
    address: '452 Esquina 21',
    location: 'City Bell, La Plata',
    ambientes: 4,
    dormitorios: 3,
    banos: 3,
    superficieCubierta: '180 m²',
    superficieTotal: '220 m²',
    superficieTerreno: '1000 m²',
    garage: '3',
    antiguedad: '10 Años',
    orientacion: 'Sudeste',
    estado: 'Muy bueno',
    situacion: 'Habitada',
    amenities: ['Pileta 6x10m', 'Jardín', 'Parrilla', 'Galería', 'Lavadero', 'Caldera y radiadores'],
    services: ['Agua Corriente', 'Gas Natural', 'Cable', 'Internet', 'Cloaca', 'Pavimento', 'Electricidad', 'Teléfono'],
    referenceCode: 'RHO4324139',
    images: [
      'https://static.tokkobroker.com/w_pics/847840946664018488093123948650168383842240929306371940974722749553580287953215716.jpg',
    ],
    isFeatured: true,
  },
  {
    id: '6984088',
    title: 'Casa en Venta - 47 e/ 5 y 6, Microcentro, La Plata',
    description: 'Casa antigua sobre lote de 13x20, PB: hall, estar, comedor, escritorio, cocina, comedor diario, toilette, lavadero, baño y escalera, cochera 2 autos, en PA: hall, 3 dormitorios, 1 baño, dormitorio PR con baño en suite y terraza.',
    shortDescription: '250m² · 3 dorm · 2 plantas · Microcentro · Venta',
    price: 750000,
    currency: 'USD',
    category: 'casas',
    operation: 'Venta',
    address: '47 e/ 5 y 6',
    location: 'Microcentro, La Plata',
    ambientes: 9,
    dormitorios: 3,
    banos: 3,
    superficieCubierta: '250 m²',
    superficieTerreno: '260 m²',
    garage: '2',
    antiguedad: '60 Años',
    orientacion: 'Norte',
    estado: 'Muy bueno',
    situacion: 'Vacía',
    amenities: ['Altillo', 'Baulera', 'Comedor diario', 'Escritorio', 'Baño de servicio', 'Terraza', 'Suite'],
    referenceCode: 'RHO6984088',
    images: [
      'https://static.tokkobroker.com/w_pics/6984088_93499301180751824196072399235936566916469769737971619025418296924055605927453.jpg',
    ],
    isFeatured: true,
  },
  {
    id: '7019676',
    title: 'Casa en Venta - Plaza Paso entre 13 y 44, Plaza Italia, La Plata',
    description: 'Casa sobre lote de 7.55x18 tiene 3 dormitorios con placard y piso de madera, cochera, cocina comedor, living comedor, patio, lavadero, baño completo, baño de servicio. Estufas dormitorio tiro balanceado. Estufa hogar a gas living comedor. Cableado nuevo, cañería de agua nueva.',
    shortDescription: '135m² · 3 dorm · 2 plantas · Plaza Italia · Venta',
    price: 160000,
    currency: 'USD',
    category: 'casas',
    operation: 'Venta',
    address: 'Plaza Paso entre 13 y 44',
    location: 'Plaza Italia, La Plata',
    ambientes: 5,
    dormitorios: 3,
    banos: 2,
    superficieCubierta: '132 m²',
    superficieTotal: '135 m²',
    superficieTerreno: '135.9 m²',
    garage: '1',
    antiguedad: '50 Años',
    orientacion: 'Noreste',
    estado: 'Muy bueno',
    situacion: 'Habitada',
    services: ['Agua corriente', 'Cable', 'Electricidad', 'Cloaca', 'Agua potable', 'Alumbrado público'],
    referenceCode: 'RHO7019676',
    images: [
      'https://static.tokkobroker.com/w_pics/7019676_57480328967312795622633750466250826507985335772037920178480886830238904123863.jpg',
    ],
  },
  {
    id: '5425118',
    title: 'Casa en Venta - Greenville Polo & Resort, Barrio C',
    description: 'Excelente casa en Greenville Polo & Resort, barrio central, 320 metros cubiertos sobre lote de 1050 metros cuadrados. 4 dormitorios, uno de ellos en suite con hidromasaje, espacio para oficina o dependencia de servicio, pileta climatizada, play room, amplia galería con parrilla.',
    shortDescription: '320m² · 4 dorm · Pileta climatizada · Greenville · Venta',
    price: 450000,
    currency: 'USD',
    category: 'casas',
    operation: 'Venta',
    address: 'Greenville Polo & Resort Barrio C',
    location: 'Berazategui',
    dormitorios: 4,
    banos: 3,
    superficieCubierta: '250 m²',
    superficieTerreno: '1050 m²',
    antiguedad: '8 Años',
    expensas: '$100.000',
    situacion: 'Habitada',
    amenities: ['Pileta climatizada', 'Play room', 'Galería con parrilla', 'Suite con hidromasaje', 'Escritorio/oficina', 'Club House', 'Seguridad 24hs'],
    services: ['Cloaca', 'Gas Natural', 'Internet', 'Electricidad', 'Pavimento', 'Cable'],
    referenceCode: 'RHO5425118',
    images: [
      'https://static.tokkobroker.com/w_pics/847881641614168755983167385208695560908061725366898552787268513472512109419112374.jpg',
    ],
    isFeatured: true,
  },
  {
    id: '4113108',
    title: 'Casa en Venta - 139 y 407, Villa Elisa, La Plata',
    description: 'Casa de 380 metros cubiertos sobre lote de 75 x 140, pisos de lapacho, 2/3 dormitorios, baño en suite y baño principal, amplio living, escritorio, cocina, dependencias, pileta.',
    shortDescription: '350m² · 3 dorm · 10500m² lote · Villa Elisa · Venta',
    price: 800000,
    currency: 'USD',
    category: 'casas',
    operation: 'Venta',
    address: '139 y 407',
    location: 'Villa Elisa, La Plata',
    ambientes: 7,
    dormitorios: 3,
    banos: 2,
    superficieCubierta: '350 m²',
    superficieTerreno: '10500 m²',
    orientacion: 'Norte',
    estado: 'Muy bueno',
    amenities: ['Pileta', 'Jardín', 'Lavadero', 'Escritorio', 'Galería', 'Pisos de lapacho', 'Suite'],
    services: ['Agua Corriente', 'Cloaca', 'Gas Natural', 'Internet', 'Electricidad', 'Pavimento', 'Teléfono', 'Cable'],
    referenceCode: 'LHO4026189',
    images: [
      'https://static.tokkobroker.com/w_pics/84782577030012734466325875276364561775474062442153876701423660133348837745630004.jpg',
    ],
    isFeatured: true,
  },

  // === VENTA - LOCALES ===
  {
    id: '7679761',
    title: 'Local en Venta - 10 al 1300, La Plata',
    description: 'Local de 2 ambientes, 23m². 25 años. Baulera, cocina, toilette.',
    shortDescription: '23m² · 2 amb · Local · Venta',
    price: 50000,
    currency: 'USD',
    category: 'locales',
    operation: 'Venta',
    address: '10 al 1300',
    location: 'La Plata',
    ambientes: 2,
    superficieCubierta: '23 m²',
    antiguedad: '25 Años',
    expensas: '$115.000',
    services: ['Agua', 'Cloaca', 'Internet', 'Electricidad', 'Agua Potable', 'Alumbrado'],
    referenceCode: 'RLO7679761',
    images: [
      'https://static.tokkobroker.com/w_pics/7679761_44963026231411688132531916117572051578250291897563362998943546872951262587090.jpg',
    ],
  },
  {
    id: '6449063',
    title: 'Local en Venta - Camino General Belgrano y 461, City Bell',
    description: 'Local comercial de 128.35m². Al frente, City Bell.',
    shortDescription: '128.35m² · Local · City Bell · Venta',
    price: 156000,
    currency: 'USD',
    category: 'locales',
    operation: 'Venta',
    address: 'Camino General Belgrano y 461',
    location: 'City Bell, La Plata',
    superficieCubierta: '128.35 m²',
    referenceCode: 'RLO6449063',
    images: [
      'https://static.tokkobroker.com/w_pics/6449063_108618069116757217438457756889431166031428633016648072387737394129831009068013.jpg',
    ],
  },
  {
    id: '7011423',
    title: 'Local en Venta - 45 e/ 6 y 7, Plaza Italia, La Plata',
    description: 'Local comercial con baño en el centro de la ciudad. 18m², frente 3m, fondo 6m.',
    shortDescription: '18m² · Local · Plaza Italia · Venta',
    price: 50000,
    currency: 'USD',
    category: 'locales',
    operation: 'Venta',
    address: '45 e/ 6 y 7',
    location: 'Plaza Italia, La Plata',
    ambientes: 2,
    banos: 1,
    superficieCubierta: '18 m²',
    antiguedad: '50 Años',
    orientacion: 'Sudeste',
    estado: 'Bueno',
    situacion: 'Ocupado',
    expensas: '$65.000',
    services: ['Agua Corriente', 'Cloaca', 'Internet', 'Electricidad', 'Pavimento', 'Cable', 'Alumbrado público'],
    referenceCode: 'RLO7011423',
    images: [
      'https://static.tokkobroker.com/w_pics/7011423_114022903187189871184245777363129993930872589484245886438489163189509808756615.jpg',
    ],
  },

  // === VENTA - PH ===
  {
    id: '7678789',
    title: 'PH en Venta - 61 al 900, La Plata',
    description: 'PH Duplex 61 e 14 y 15. 3 ambientes, 2 dormitorios, 49m² cubiertos + 16m² descubiertos. 20 años. Listo para escriturar. APTO BANCO.',
    shortDescription: '49m² · 3 amb · 2 dorm · PH Duplex · Venta',
    price: 66000,
    currency: 'USD',
    category: 'phs',
    operation: 'Venta',
    address: '61 al 900',
    location: 'La Plata',
    ambientes: 3,
    dormitorios: 2,
    banos: 1,
    superficieCubierta: '49 m²',
    antiguedad: '20 Años',
    expensas: '$52.000',
    amenities: ['Aire Acondicionado individual'],
    referenceCode: 'RPH7678789',
    images: [
      'https://static.tokkobroker.com/w_pics/7678789_27128008198779791294320454368959255112774050812047950106857211368741085370069.jpg',
    ],
  },
  {
    id: '6323749',
    title: 'PH en Venta - Diagonal 74 entre 46 y 47, Plaza Italia, La Plata',
    description: 'PH en planta baja al frente, 2 dorm, escritorio, living, amplio comedor, baño, cocina, lavadero 126 metros cubiertos, patio con parrilla, 3 semicubiertos y 129 de patio con verde descubiertos.',
    shortDescription: '265m² total · 6 amb · 2 dorm · PH · Plaza Italia · Venta',
    price: 110000,
    currency: 'USD',
    category: 'phs',
    operation: 'Venta',
    address: 'Diagonal 74 entre 46 y 47',
    location: 'Plaza Italia, La Plata',
    ambientes: 6,
    dormitorios: 2,
    banos: 1,
    superficieCubierta: '126 m²',
    superficieTotal: '265 m²',
    antiguedad: '50 Años',
    amenities: ['Escritorio', 'Living', 'Comedor amplio', 'Cocina', 'Lavadero', 'Patio con parrilla'],
    services: ['Agua Corriente', 'Cloaca', 'Electricidad'],
    referenceCode: 'RPH6323749',
    images: [
      'https://static.tokkobroker.com/w_pics/6323749_70789600211363178998458856454415454934844553371813551957388789773338349673032.jpg',
    ],
  },

  // === VENTA - COCHERAS ===
  {
    id: '4113183',
    title: 'Cochera en Venta - 8 entre 65 y 66, La Plata',
    description: 'Cochera en venta en La Plata.',
    shortDescription: 'Cochera · Venta',
    price: 7000,
    currency: 'USD',
    category: 'cocheras',
    operation: 'Venta',
    address: '8 entre 65 y 66',
    location: 'La Plata',
    referenceCode: 'RCO4113183',
    images: [
      'https://static.tokkobroker.com/w_pics/847831082362663140612874071894407875712080982635288781119978228002205016707091064.jpg',
    ],
  },
  {
    id: '4113182',
    title: 'Cochera en Venta - 7 34 y 35, La Plata',
    description: 'Cochera de 12.50m² en venta en La Plata.',
    shortDescription: '12.50m² · Cochera · Venta',
    price: 9000,
    currency: 'USD',
    category: 'cocheras',
    operation: 'Venta',
    address: '7 34 y 35',
    location: 'La Plata',
    superficieCubierta: '12.50 m²',
    referenceCode: 'RCO4113182',
    images: [
      'https://static.tokkobroker.com/w_pics/4113182_32828808874064793800536094507144128614815575712879109489117260666435367048873.jpg',
    ],
  },
];

// ============ HELPERS ============

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function apiRequest(method: string, path: string, body?: any, token?: string, isFormData = false) {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!isFormData) headers['Content-Type'] = 'application/json';

  const opts: RequestInit = {
    method,
    headers,
    body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
  };

  const resp = await fetch(`${API_BASE}/${path}`, opts);
  const text = await resp.text();

  let data: any;
  try { data = JSON.parse(text); } catch { data = text; }

  if (!resp.ok) {
    console.error(`❌ ${method} ${path} → ${resp.status}:`, typeof data === 'string' ? data.slice(0, 200) : JSON.stringify(data).slice(0, 200));
    return null;
  }
  return data;
}

async function downloadImage(url: string, destPath: string): Promise<boolean> {
  try {
    const resp = await fetch(url);
    if (!resp.ok) {
      console.error(`  ❌ Download failed: ${resp.status} - ${url.slice(-60)}`);
      return false;
    }
    const buffer = Buffer.from(await resp.arrayBuffer());
    fs.writeFileSync(destPath, buffer);
    return true;
  } catch (err: any) {
    console.error(`  ❌ Download error: ${err.message} - ${url.slice(-60)}`);
    return false;
  }
}

async function uploadImage(filePath: string, token: string, folder = 'products'): Promise<string | null> {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);

    // Use native FormData with Blob (Node 18+)
    const formData = new globalThis.FormData();
    const blob = new Blob([fileBuffer], { type: 'image/jpeg' });
    formData.append('file', blob, fileName);

    const resp = await fetch(`${API_BASE}/media/upload?folder=${folder}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error(`  ❌ Upload failed: ${resp.status} - ${errText.slice(0, 100)}`);
      return null;
    }
    const data: any = await resp.json();
    return data.url;
  } catch (err: any) {
    console.error(`  ❌ Upload error: ${err.message}`);
    return null;
  }
}

// ============ MAIN MIGRATION ============

async function main() {
  console.log('🏠 ═══════════════════════════════════════════════');
  console.log('   RODRIGO PROPIEDADES → TURNOLINK MIGRATION');
  console.log('═══════════════════════════════════════════════════\n');

  // Ensure download dir exists
  if (!fs.existsSync(DOWNLOAD_DIR)) {
    fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
  }

  // ── STEP 1: Register Account ──
  console.log('📋 Step 1: Registering account...');
  const registerResult = await apiRequest('POST', 'auth/register', ACCOUNT);
  if (!registerResult) {
    console.error('Failed to register. Trying login instead...');
    const loginResult = await apiRequest('POST', 'auth/login', {
      email: ACCOUNT.email,
      password: ACCOUNT.password,
    });
    if (!loginResult) {
      console.error('❌ Cannot register or login. Aborting.');
      process.exit(1);
    }
    var token = loginResult.accessToken;
    var tenantId = loginResult.user?.tenantId || loginResult.tenant?.id;
    console.log(`✅ Logged in. Tenant: ${tenantId}`);
  } else {
    var token = registerResult.accessToken;
    var tenantId = registerResult.tenant?.id;
    console.log(`✅ Registered. Tenant: ${tenantId}`);
  }

  // ── STEP 2: Delete seeded example products ──
  console.log('\n🧹 Step 2: Cleaning seeded example products...');
  const existingProducts = await apiRequest('GET', 'products?includeInactive=true', null, token);
  if (existingProducts && Array.isArray(existingProducts)) {
    for (const p of existingProducts) {
      await apiRequest('DELETE', `products/${p.id}`, null, token);
      console.log(`  🗑️  Deleted seeded: ${p.name}`);
    }
  }

  // ── STEP 3: Create Categories ──
  console.log('\n📂 Step 3: Creating categories...');
  const categoryMap: Record<string, string> = {};
  for (const cat of CATEGORIES) {
    const result = await apiRequest('POST', 'products/categories', { name: cat.name, description: `Propiedades tipo ${cat.name}` }, token);
    if (result) {
      categoryMap[cat.slug] = result.id;
      console.log(`  ✅ ${cat.name} → ${result.id}`);
    }
  }

  // ── STEP 4: Create Properties with Images ──
  console.log(`\n🏗️  Step 4: Creating ${PROPERTIES.length} properties with images...\n`);

  let created = 0;
  let failed = 0;

  for (let i = 0; i < PROPERTIES.length; i++) {
    const prop = PROPERTIES[i];
    console.log(`[${i + 1}/${PROPERTIES.length}] ${prop.title}`);

    // Build attributes
    const attributes: any[] = [];
    if (prop.operation) attributes.push({ key: 'operacion', label: 'Operación', value: prop.operation, type: 'text' });
    if (prop.address) attributes.push({ key: 'direccion', label: 'Dirección', value: prop.address, type: 'text' });
    if (prop.location) attributes.push({ key: 'ubicacion', label: 'Ubicación', value: prop.location, type: 'text' });
    if (prop.ambientes) attributes.push({ key: 'ambientes', label: 'Ambientes', value: String(prop.ambientes), type: 'number' });
    if (prop.dormitorios) attributes.push({ key: 'dormitorios', label: 'Dormitorios', value: String(prop.dormitorios), type: 'number' });
    if (prop.banos) attributes.push({ key: 'banos', label: 'Baños', value: String(prop.banos), type: 'number' });
    if (prop.superficieCubierta) attributes.push({ key: 'superficie_cubierta', label: 'Sup. Cubierta', value: prop.superficieCubierta, type: 'text' });
    if (prop.superficieTotal) attributes.push({ key: 'superficie_total', label: 'Sup. Total', value: prop.superficieTotal, type: 'text' });
    if (prop.superficieTerreno) attributes.push({ key: 'superficie_terreno', label: 'Sup. Terreno', value: prop.superficieTerreno, type: 'text' });
    if (prop.garage) attributes.push({ key: 'garage', label: 'Garage', value: prop.garage, type: 'text' });
    if (prop.antiguedad) attributes.push({ key: 'antiguedad', label: 'Antigüedad', value: prop.antiguedad, type: 'text' });
    if (prop.orientacion) attributes.push({ key: 'orientacion', label: 'Orientación', value: prop.orientacion, type: 'text' });
    if (prop.estado) attributes.push({ key: 'estado', label: 'Estado', value: prop.estado, type: 'text' });
    if (prop.situacion) attributes.push({ key: 'situacion', label: 'Situación', value: prop.situacion, type: 'text' });
    if (prop.expensas) attributes.push({ key: 'expensas', label: 'Expensas', value: prop.expensas, type: 'text' });
    if (prop.disposicion) attributes.push({ key: 'disposicion', label: 'Disposición', value: prop.disposicion, type: 'text' });
    if (prop.referenceCode) attributes.push({ key: 'codigo', label: 'Código', value: prop.referenceCode, type: 'text' });
    if (prop.services?.length) attributes.push({ key: 'servicios', label: 'Servicios', value: prop.services.join(', '), type: 'text' });
    if (prop.amenities?.length) attributes.push({ key: 'amenities', label: 'Amenities', value: prop.amenities.join(', '), type: 'text' });

    // Create product
    const productData = {
      name: prop.title,
      description: prop.description,
      shortDescription: prop.shortDescription,
      price: prop.price,
      currency: prop.currency,
      stock: 1,
      trackInventory: false,
      type: 'PHYSICAL' as const,
      categoryId: categoryMap[prop.category] || undefined,
      isActive: true,
      isFeatured: prop.isFeatured || false,
      sku: prop.referenceCode || `RP-${prop.id}`,
      attributes,
    };

    const product = await apiRequest('POST', 'products', productData, token);
    if (!product) {
      console.log(`  ❌ Failed to create product`);
      failed++;
      continue;
    }

    // Download and upload images
    const propImgDir = path.join(DOWNLOAD_DIR, prop.id);
    if (!fs.existsSync(propImgDir)) {
      fs.mkdirSync(propImgDir, { recursive: true });
    }

    for (let imgIdx = 0; imgIdx < prop.images.length; imgIdx++) {
      const imgUrl = prop.images[imgIdx];
      const imgFile = path.join(propImgDir, `img_${imgIdx}.jpg`);

      // Download
      const downloaded = await downloadImage(imgUrl, imgFile);
      if (!downloaded) continue;

      // Upload to TurnoLink (auto-converts to WebP)
      const uploadedUrl = await uploadImage(imgFile, token, 'products');
      if (!uploadedUrl) continue;

      // Attach to product
      await apiRequest('POST', `products/${product.id}/images`, {
        url: uploadedUrl,
        alt: `${prop.title} - Imagen ${imgIdx + 1}`,
      }, token);

      // Rate limit
      await sleep(200);
    }

    console.log(`  ✅ Created with ${prop.images.length} images`);
    created++;

    // Small delay between properties
    await sleep(300);
  }

  // ── STEP 5: Update tenant info ──
  console.log('\n🏢 Step 5: Updating tenant profile...');
  await apiRequest('PUT', 'tenants/profile', {
    name: 'Rodrigo Propiedades',
    description: 'Inmobiliaria en La Plata y alrededores. Venta y alquiler de departamentos, casas, terrenos, locales, oficinas y más. Operamos en La Plata, City Bell, Villa Elisa, Berazategui (Greenville Polo & Resort), Coronel Brandsen.',
    phone: '+54 221 603-0156',
    email: 'ventas@rodrigopropiedades.com',
    address: 'La Plata, Buenos Aires, Argentina',
    city: 'La Plata',
    website: 'https://www.rodrigopropiedades.com',
    instagram: 'rodrigopropiedades',
  }, token);
  console.log('  ✅ Tenant profile updated');

  // ── Summary ──
  console.log('\n═══════════════════════════════════════════════════');
  console.log(`✅ Migration Complete!`);
  console.log(`   Created: ${created} properties`);
  console.log(`   Failed:  ${failed} properties`);
  console.log(`   Categories: ${Object.keys(categoryMap).length}`);
  console.log(`\n🔗 Store URL: https://turnolink.com.ar/tienda/rodrigo-propiedades`);
  console.log(`📧 Login: ${ACCOUNT.email} / ${ACCOUNT.password}`);
  console.log('═══════════════════════════════════════════════════\n');
}

main().catch(console.error);
