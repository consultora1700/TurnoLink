'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Globe,
} from 'lucide-react';

/* ─── Static data for all industries & sub-niches ─── */

interface SubNiche {
  slug: string;
  pill: string;
}

interface IndustrySection {
  id: string;
  emoji: string;
  label: string;
  accent: string;
  parentUrl: string;
  subNiches: SubNiche[];
}

const INDUSTRIES: IndustrySection[] = [
  {
    id: 'belleza',
    emoji: '💄',
    label: 'Belleza & Bienestar',
    accent: '#EC4899',
    parentUrl: '/_landing/belleza',
    subNiches: [
      { slug: 'peluquerias', pill: '✂️ Peluquerías' },
      { slug: 'barberias', pill: '💈 Barberías' },
      { slug: 'centros-de-estetica', pill: '✨ Centros de Estética' },
      { slug: 'unas-nail-bars', pill: '💅 Uñas & Nail Bars' },
      { slug: 'pestanas-cejas', pill: '👁️ Pestañas & Cejas' },
      { slug: 'depilacion', pill: '⚡ Depilación' },
      { slug: 'spa-relax', pill: '🧖 Spa & Relax' },
      { slug: 'masajes', pill: '💆 Masajes' },
      { slug: 'bronceado', pill: '☀️ Bronceado' },
      { slug: 'cosmetologia', pill: '💧 Cosmetología' },
    ],
  },
  {
    id: 'salud',
    emoji: '🏥',
    label: 'Salud & Profesionales',
    accent: '#3B82F6',
    parentUrl: '/_landing/salud',
    subNiches: [
      { slug: 'psicologos', pill: '🧠 Psicólogos' },
      { slug: 'consultorios-medicos', pill: '🏥 Consultorios Médicos' },
      { slug: 'odontologos', pill: '🦷 Odontólogos' },
      { slug: 'nutricionistas', pill: '🥗 Nutricionistas' },
      { slug: 'kinesiologos', pill: '💪 Kinesiólogos' },
      { slug: 'fonoaudiologos', pill: '🗣️ Fonoaudiólogos' },
      { slug: 'abogados', pill: '⚖️ Abogados' },
      { slug: 'contadores', pill: '📊 Contadores' },
      { slug: 'escribanos', pill: '📝 Escribanos' },
    ],
  },
  {
    id: 'deportes',
    emoji: '⚽',
    label: 'Deportes & Recreación',
    accent: '#22C55E',
    parentUrl: '/_landing/deportes',
    subNiches: [
      { slug: 'canchas-de-futbol', pill: '⚽ Canchas de Fútbol' },
      { slug: 'canchas-de-padel', pill: '🏸 Canchas de Pádel' },
      { slug: 'tenis', pill: '🎾 Tenis' },
      { slug: 'basquet', pill: '🏀 Básquet' },
      { slug: 'estudios-de-danza', pill: '💃 Estudios de Danza' },
      { slug: 'gimnasios-por-clase', pill: '🏋️ Gimnasios por Clase' },
      { slug: 'entrenadores-personales', pill: '🏃 Entrenadores Personales' },
      { slug: 'salas-de-ensayo', pill: '🎵 Salas de Ensayo' },
      { slug: 'estudios-de-grabacion', pill: '🎙️ Estudios de Grabación' },
    ],
  },
  {
    id: 'hospedaje-por-horas',
    emoji: '🏨',
    label: 'Hospedaje por Horas',
    accent: '#F59E0B',
    parentUrl: '/_landing/hospedaje-por-horas',
    subNiches: [
      { slug: 'albergues-transitorios', pill: '🏩 Albergues Transitorios' },
      { slug: 'hoteles-por-turno', pill: '🏨 Hoteles por Turno' },
      { slug: 'hostels-por-bloque', pill: '🛏️ Hostels por Bloque' },
      { slug: 'habitaciones-12hs', pill: '🕐 Habitaciones 12hs' },
      { slug: 'boxes-privados', pill: '🚪 Boxes Privados' },
    ],
  },
  {
    id: 'alquiler-temporario',
    emoji: '🏠',
    label: 'Alquiler Temporario',
    accent: '#06B6D4',
    parentUrl: '/_landing/alquiler-temporario',
    subNiches: [
      { slug: 'casas-quinta', pill: '🏡 Casas Quinta' },
      { slug: 'cabanas', pill: '🛖 Cabañas' },
      { slug: 'departamentos-temporarios', pill: '🏢 Departamentos Temporarios' },
      { slug: 'campos-recreativos', pill: '🌾 Campos Recreativos' },
      { slug: 'salones-por-dia', pill: '🎪 Salones por Día' },
      { slug: 'quinchos', pill: '🔥 Quinchos' },
      { slug: 'espacios-para-eventos', pill: '🎉 Espacios para Eventos' },
    ],
  },
  {
    id: 'espacios-flexibles',
    emoji: '💼',
    label: 'Espacios Flexibles',
    accent: '#8B5CF6',
    parentUrl: '/_landing/espacios-flexibles',
    subNiches: [
      { slug: 'coworking', pill: '💻 Coworking' },
      { slug: 'oficinas-por-hora', pill: '🏬 Oficinas por Hora' },
      { slug: 'salas-de-reuniones', pill: '🤝 Salas de Reuniones' },
      { slug: 'boxes-profesionales', pill: '💼 Boxes Profesionales' },
      { slug: 'estudios-compartidos', pill: '🎨 Estudios Compartidos' },
    ],
  },
];

const GENERAL_PAGES = [
  { key: 'landing-main', label: 'Landing principal', url: '/_landing' },
  { key: 'landing-talento', label: 'Talento', url: '/_landing/talento' },
  { key: 'landing-integrar', label: 'Integrar', url: '/_landing/integrar' },
];

const LS_KEY = 'admin-landing-statuses';

function getAllKeys(): string[] {
  const keys: string[] = [];
  // general pages
  for (const p of GENERAL_PAGES) keys.push(p.key);
  // industries: parent + sub-niches
  for (const ind of INDUSTRIES) {
    keys.push(`parent-${ind.id}`);
    for (const sn of ind.subNiches) keys.push(`${ind.id}/${sn.slug}`);
  }
  return keys;
}

function loadStatuses(): Record<string, boolean> {
  const allKeys = getAllKeys();
  const defaults: Record<string, boolean> = {};
  for (const k of allKeys) defaults[k] = false;

  if (typeof window === 'undefined') return defaults;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return defaults;
    const saved = JSON.parse(raw) as Record<string, boolean>;
    return { ...defaults, ...saved };
  } catch {
    return defaults;
  }
}

export default function AdminLandingsPage() {
  const [statuses, setStatuses] = useState<Record<string, boolean>>({});
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setStatuses(loadStatuses());
    setMounted(true);
  }, []);

  const toggleStatus = (key: string) => {
    setStatuses((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem(LS_KEY, JSON.stringify(next));
      return next;
    });
  };

  const toggleCollapse = (sectionId: string) => {
    setCollapsed((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const totalCount = getAllKeys().length;
  const readyCount = Object.values(statuses).filter(Boolean).length;
  const pendingCount = totalCount - readyCount;

  // Count ready per industry
  const industryReadyCount = (ind: IndustrySection) => {
    let count = 0;
    if (statuses[`parent-${ind.id}`]) count++;
    for (const sn of ind.subNiches) {
      if (statuses[`${ind.id}/${sn.slug}`]) count++;
    }
    return count;
  };

  const industryTotalCount = (ind: IndustrySection) => ind.subNiches.length + 1; // +1 for parent

  const generalReadyCount = GENERAL_PAGES.filter((p) => statuses[p.key]).length;

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 sm:p-6 text-center">
            <p className="text-sm text-muted-foreground mb-1">Total</p>
            <p className="text-3xl font-bold">{totalCount}</p>
          </CardContent>
        </Card>
        <Card className="border-green-500/30">
          <CardContent className="p-4 sm:p-6 text-center">
            <p className="text-sm text-green-600 dark:text-green-400 mb-1">Listas</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{readyCount}</p>
          </CardContent>
        </Card>
        <Card className="border-red-500/30">
          <CardContent className="p-4 sm:p-6 text-center">
            <p className="text-sm text-red-600 dark:text-red-400 mb-1">Pendientes</p>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">{pendingCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* General Pages */}
      <Card>
        <CardHeader
          className="cursor-pointer select-none"
          onClick={() => toggleCollapse('general')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {collapsed['general'] ? (
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
              <Globe className="h-5 w-5" />
              <CardTitle className="text-lg">Páginas Generales</CardTitle>
            </div>
            <Badge variant={generalReadyCount === GENERAL_PAGES.length ? 'default' : 'secondary'}>
              {generalReadyCount}/{GENERAL_PAGES.length} listas
            </Badge>
          </div>
        </CardHeader>
        {!collapsed['general'] && (
          <CardContent className="pt-0">
            <div className="divide-y">
              {GENERAL_PAGES.map((page) => (
                <LandingRow
                  key={page.key}
                  label={page.label}
                  url={page.url}
                  isReady={!!statuses[page.key]}
                  onToggle={() => toggleStatus(page.key)}
                />
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Industry Sections */}
      {INDUSTRIES.map((ind) => {
        const ready = industryReadyCount(ind);
        const total = industryTotalCount(ind);
        const isCollapsed = !!collapsed[ind.id];

        return (
          <Card key={ind.id} style={{ borderColor: `${ind.accent}30` }}>
            <CardHeader
              className="cursor-pointer select-none"
              onClick={() => toggleCollapse(ind.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isCollapsed ? (
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span className="text-xl">{ind.emoji}</span>
                  <CardTitle className="text-lg" style={{ color: ind.accent }}>
                    {ind.label}
                  </CardTitle>
                </div>
                <Badge
                  variant={ready === total ? 'default' : 'secondary'}
                  style={ready === total ? { backgroundColor: ind.accent } : undefined}
                >
                  {ready}/{total} listas
                </Badge>
              </div>
            </CardHeader>
            {!isCollapsed && (
              <CardContent className="pt-0">
                <div className="divide-y">
                  {/* Parent landing */}
                  <LandingRow
                    label="Landing padre"
                    url={ind.parentUrl}
                    isReady={!!statuses[`parent-${ind.id}`]}
                    onToggle={() => toggleStatus(`parent-${ind.id}`)}
                    accent={ind.accent}
                  />
                  {/* Sub-niches */}
                  {ind.subNiches.map((sn) => (
                    <LandingRow
                      key={sn.slug}
                      label={sn.pill}
                      url={`${ind.parentUrl}/${sn.slug}`}
                      isReady={!!statuses[`${ind.id}/${sn.slug}`]}
                      onToggle={() => toggleStatus(`${ind.id}/${sn.slug}`)}
                      accent={ind.accent}
                    />
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}

/* ─── Row component ─── */

function LandingRow({
  label,
  url,
  isReady,
  onToggle,
  accent,
}: {
  label: string;
  url: string;
  isReady: boolean;
  onToggle: () => void;
  accent?: string;
}) {
  return (
    <div className="flex items-center justify-between py-3 px-2 gap-2">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <span className="text-sm font-medium truncate">{label}</span>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 truncate max-w-[180px]"
        >
          <span className="hidden sm:inline truncate">{url}</span>
          <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
        </a>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={onToggle}
        >
          <div
            className={cn(
              'h-5 w-5 rounded-full transition-colors duration-300',
              isReady ? 'bg-green-500' : 'bg-red-500'
            )}
            style={isReady && accent ? { backgroundColor: accent } : undefined}
          />
        </Button>
      </div>
    </div>
  );
}
