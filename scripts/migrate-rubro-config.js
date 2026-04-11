/**
 * Migration script: Apply hiddenSections + publicPageLayout to ALL existing tenants
 * based on their rubro.
 *
 * - Tenants with a valid rubro → use it directly
 * - Tenants with invalid/missing rubro → infer from slug/name (manual mapping)
 * - Fixes known bad data (e.g. odontologiaya had "Odontología" instead of "odontologia")
 *
 * Run: npx ts-node scripts/migrate-rubro-config.ts [--dry-run]
 */

const { PrismaClient } = require('../node_modules/.pnpm/@prisma+client@5.22.0_prisma@5.22.0/node_modules/@prisma/client');

const prisma = new PrismaClient();

const DRY_RUN = process.argv.includes('--dry-run');

// ─── Layout por rubro ───────────────────────────────────────────────
const RUBRO_LAYOUT = {
  'estetica-belleza': 'employee_first',
  'barberia':         'employee_first',
  'masajes-spa':      'employee_first',
  'tatuajes-piercing':'employee_first',
  'salud':            'specialty_first',
  'odontologia':      'service_first',
  'psicologia':       'service_first',
  'nutricion':        'service_first',
  'veterinaria':      'service_first',
  'fitness':          'service_first',
  'deportes':         'service_first',
  'hospedaje':        'service_first',
  'alquiler':         'service_first',
  'espacios':         'service_first',
  'educacion':        'service_first',
  'consultoria':      'specialty_first',
  'otro':             'employee_first',
};

// ─── Secciones ocultas por rubro ────────────────────────────────────
const TALENTO = ['/talento', '/talento/propuestas', '/talento/ofertas'];
const ADVANCED = ['/integracion'];

const RUBRO_HIDDEN_SECTIONS = {
  'estetica-belleza': ['/especialidades', '/sucursales', '/videollamadas', ...TALENTO, ...ADVANCED],
  'barberia':         ['/especialidades', '/sucursales', '/videollamadas', ...TALENTO, ...ADVANCED],
  'masajes-spa':      ['/especialidades', '/sucursales', '/videollamadas', ...TALENTO, ...ADVANCED],
  'tatuajes-piercing':['/especialidades', '/formularios', '/sucursales', '/videollamadas', ...TALENTO, ...ADVANCED],
  'salud':            ['/sucursales', ...TALENTO, ...ADVANCED],
  'odontologia':      ['/especialidades', '/sucursales', '/videollamadas', ...TALENTO, ...ADVANCED],
  'psicologia':       ['/especialidades', '/empleados', '/sucursales', ...TALENTO, ...ADVANCED],
  'nutricion':        ['/especialidades', '/empleados', '/sucursales', ...TALENTO, ...ADVANCED],
  'veterinaria':      ['/especialidades', '/sucursales', '/videollamadas', ...TALENTO, ...ADVANCED],
  'fitness':          ['/especialidades', '/formularios', '/sucursales', '/videollamadas', ...TALENTO, ...ADVANCED],
  'deportes':         ['/empleados', '/especialidades', '/formularios', '/sucursales', '/videollamadas', ...TALENTO, ...ADVANCED],
  'hospedaje':        ['/empleados', '/especialidades', '/formularios', '/sucursales', '/videollamadas', ...TALENTO, ...ADVANCED],
  'alquiler':         ['/empleados', '/especialidades', '/formularios', '/sucursales', '/videollamadas', ...TALENTO, ...ADVANCED],
  'espacios':         ['/empleados', '/especialidades', '/formularios', '/sucursales', '/videollamadas', ...TALENTO, ...ADVANCED],
  'educacion':        ['/especialidades', '/sucursales', ...TALENTO, ...ADVANCED],
  'consultoria':      ['/sucursales', ...TALENTO, ...ADVANCED],
  'otro':             [...TALENTO, ...ADVANCED],
};

// ─── Mapeo manual: slug → rubro correcto ────────────────────────────
// Para tenants sin rubro o con rubro incorrecto
const SLUG_TO_RUBRO = {
  // Sin rubro — inferido del nombre/slug
  'estudio-contable-ruiz':       'consultoria',
  'escribania-mendez':           'consultoria',
  'vetcare-centro':              'veterinaria',
  'fine-line-studio':            'tatuajes-piercing',
  'alma-relax-spa':              'masajes-spa',
  'workhub-coworking':           'espacios',
  'padel-futbol-sur':            'deportes',
  'albergue-luxury':             'hospedaje',
  'barber-club':                 'barberia',
  'hotel-costa-serena':          'hospedaje',
  'consultorio-medico':          'salud',
  'quinta-los-alamos':           'alquiler',
  'armenon':                     'hospedaje',
  'happy-paws':                  'veterinaria',
  'fitzone-training':            'fitness',
  'sonrisas-odontologia':        'odontologia',
  'ink-master-studio':           'tatuajes-piercing',
  'salon-noir':                  'estetica-belleza',
  'the-barber-club':             'barberia',
  'dra-martinez-dermatologia':   'salud',
  'zen-spa-masajes':             'masajes-spa',
  'lash-studio-ba':              'estetica-belleza',
  'nails-and-co':                'estetica-belleza',
  'kados-tattoo':                'tatuajes-piercing',
  'juanaspa':                    'masajes-spa',
  'demo-estetica':               'estetica-belleza',
  'bella-estetica':              'estetica-belleza',
  // Profesionales / genéricos → otro
  'pro-melisa-leslie-a1d74f':    'otro',
  'pro-franco-1e74bf':           'otro',
  'leonardo-0aec07':             'otro',
  'prueba-qr':                   'otro',
  'centro-de-servicios':         'otro',
  'meliuu':                      'otro',
  'demo-talent-pool':            'otro',
  'franco-valencia-sosa-dc56dc': 'otro',
  // Correcciones de rubro incorrecto
  'estudio-molina-asociados':    'consultoria',  // Tenía tatuajes-piercing (error)
  'odontologiaya':               'odontologia',  // Tenía "Odontología" (con mayúscula/acento)
};

// ─── Terminología por rubro (para setear si falta) ──────────────────
const RUBRO_TERMINOLOGY = {
  'estetica-belleza': { clientLabelSingular: 'Cliente', clientLabelPlural: 'Clientes', enabledFichas: ['datosPersonales', 'fichaBelleza', 'notasSeguimiento'] },
  'barberia':         { clientLabelSingular: 'Cliente', clientLabelPlural: 'Clientes', enabledFichas: ['datosPersonales', 'notasSeguimiento'] },
  'masajes-spa':      { clientLabelSingular: 'Cliente', clientLabelPlural: 'Clientes', enabledFichas: ['datosPersonales', 'fichaBelleza', 'notasSeguimiento'] },
  'tatuajes-piercing': { clientLabelSingular: 'Cliente', clientLabelPlural: 'Clientes', enabledFichas: ['datosPersonales', 'fichaBelleza', 'notasSeguimiento'] },
  'salud':            { clientLabelSingular: 'Paciente', clientLabelPlural: 'Pacientes', enabledFichas: ['datosPersonales', 'fichaClinica', 'notasSeguimiento'] },
  'odontologia':      { clientLabelSingular: 'Paciente', clientLabelPlural: 'Pacientes', enabledFichas: ['datosPersonales', 'fichaClinica', 'notasSeguimiento'] },
  'psicologia':       { clientLabelSingular: 'Paciente', clientLabelPlural: 'Pacientes', enabledFichas: ['datosPersonales', 'fichaClinica', 'notasSeguimiento'] },
  'nutricion':        { clientLabelSingular: 'Paciente', clientLabelPlural: 'Pacientes', enabledFichas: ['datosPersonales', 'fichaClinica', 'fichaFitness', 'notasSeguimiento'] },
  'veterinaria':      { clientLabelSingular: 'Paciente', clientLabelPlural: 'Pacientes', enabledFichas: ['datosPersonales', 'fichaClinica', 'notasSeguimiento'] },
  'fitness':          { clientLabelSingular: 'Alumno', clientLabelPlural: 'Alumnos', enabledFichas: ['datosPersonales', 'fichaFitness', 'notasSeguimiento'] },
  'deportes':         { clientLabelSingular: 'Cliente', clientLabelPlural: 'Clientes', enabledFichas: ['datosPersonales', 'notasSeguimiento'] },
  'hospedaje':        { clientLabelSingular: 'Huesped', clientLabelPlural: 'Huespedes', enabledFichas: ['datosPersonales', 'notasSeguimiento'] },
  'alquiler':         { clientLabelSingular: 'Cliente', clientLabelPlural: 'Clientes', enabledFichas: ['datosPersonales', 'notasSeguimiento'] },
  'espacios':         { clientLabelSingular: 'Usuario', clientLabelPlural: 'Usuarios', enabledFichas: ['datosPersonales', 'notasSeguimiento'] },
  'educacion':        { clientLabelSingular: 'Alumno', clientLabelPlural: 'Alumnos', enabledFichas: ['datosPersonales', 'notasSeguimiento'] },
  'consultoria':      { clientLabelSingular: 'Cliente', clientLabelPlural: 'Clientes', enabledFichas: ['datosPersonales', 'notasSeguimiento'] },
  'otro':             { clientLabelSingular: 'Cliente', clientLabelPlural: 'Clientes', enabledFichas: ['datosPersonales', 'notasSeguimiento'] },
};

// ─── Main ───────────────────────────────────────────────────────────
async function main() {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`  MIGRACIÓN: Auto-configuración de menú y layout por rubro`);
  console.log(`  Modo: ${DRY_RUN ? '🔍 DRY RUN (no se modifica nada)' : '🚀 EJECUCIÓN REAL'}`);
  console.log(`${'='.repeat(70)}\n`);

  const tenants = await prisma.tenant.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
  });

  console.log(`Tenants activos encontrados: ${tenants.length}\n`);

  let updated = 0;
  let skipped = 0;
  const errors = [];

  for (const tenant of tenants) {
    const settings = typeof tenant.settings === 'string'
      ? JSON.parse(tenant.settings || '{}')
      : tenant.settings || {};

    const currentRubro = settings.rubro || '';
    const currentLayout = tenant.publicPageLayout || 'employee_first';
    const currentHidden = settings.hiddenSections || [];

    // Determinar rubro final
    let finalRubro;

    if (SLUG_TO_RUBRO[tenant.slug]) {
      // Mapeo manual explícito (incluye correcciones)
      finalRubro = SLUG_TO_RUBRO[tenant.slug];
    } else if (currentRubro && RUBRO_LAYOUT[currentRubro]) {
      // Rubro existente válido
      finalRubro = currentRubro;
    } else if (currentRubro) {
      // Rubro existente pero no reconocido → normalizar
      const normalized = currentRubro
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      if (RUBRO_LAYOUT[normalized]) {
        finalRubro = normalized;
      } else {
        errors.push(`⚠️  ${tenant.slug}: rubro "${currentRubro}" no reconocido → usando "otro"`);
        finalRubro = 'otro';
      }
    } else {
      // Sin rubro y sin mapeo manual
      errors.push(`⚠️  ${tenant.slug}: sin rubro y sin mapeo manual → usando "otro"`);
      finalRubro = 'otro';
    }

    const newLayout = RUBRO_LAYOUT[finalRubro] || 'employee_first';
    const newHidden = RUBRO_HIDDEN_SECTIONS[finalRubro] || [];
    const terminology = RUBRO_TERMINOLOGY[finalRubro];

    // Verificar si hay cambios reales
    const layoutChanged = currentLayout !== newLayout;
    const hiddenChanged = JSON.stringify(currentHidden.sort()) !== JSON.stringify(newHidden.sort());
    const rubroChanged = currentRubro !== finalRubro;

    if (!layoutChanged && !hiddenChanged && !rubroChanged) {
      skipped++;
      continue;
    }

    // Construir nuevos settings (merge, no replace)
    const newSettings = {
      ...settings,
      rubro: finalRubro,
      hiddenSections: newHidden,
    };

    // Solo setear terminología si no la tiene ya configurada
    if (!settings.clientLabelSingular && terminology) {
      newSettings.clientLabelSingular = terminology.clientLabelSingular;
      newSettings.clientLabelPlural = terminology.clientLabelPlural;
    }
    if (!settings.enabledFichas && terminology) {
      newSettings.enabledFichas = terminology.enabledFichas;
    }

    const changes = [];
    if (rubroChanged) changes.push(`rubro: "${currentRubro || '(vacío)'}" → "${finalRubro}"`);
    if (layoutChanged) changes.push(`layout: "${currentLayout}" → "${newLayout}"`);
    if (hiddenChanged) changes.push(`hiddenSections: ${currentHidden.length} → ${newHidden.length} items`);

    console.log(`✏️  ${tenant.slug} (${tenant.name})`);
    changes.forEach(c => console.log(`    ${c}`));

    if (!DRY_RUN) {
      await prisma.tenant.update({
        where: { id: tenant.id },
        data: {
          publicPageLayout: newLayout,
          settings: JSON.stringify(newSettings),
        },
      });
    }

    updated++;
  }

  console.log(`\n${'─'.repeat(70)}`);
  console.log(`\n  Resultado:`);
  console.log(`    Actualizados: ${updated}`);
  console.log(`    Sin cambios:  ${skipped}`);
  if (errors.length > 0) {
    console.log(`\n  Notas:`);
    errors.forEach(e => console.log(`    ${e}`));
  }
  console.log(`\n${DRY_RUN ? '  → Ejecutar sin --dry-run para aplicar los cambios' : '  ✅ Migración completada'}`);
  console.log('');
}

main()
  .catch((e) => {
    console.error('Error en migración:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
