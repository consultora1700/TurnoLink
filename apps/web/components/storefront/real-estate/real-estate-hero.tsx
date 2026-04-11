'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Search, ChevronDown, Home, Building, Landmark, Check } from 'lucide-react';
import type { OperationType } from '@/lib/hooks/use-property-filters';

interface RealEstateHeroProps {
  tenantName: string;
  coverImage?: string | null;
  headline?: string;
  productCount: number;
  primaryColor: string;
  onSearch: (params: {
    operacion: OperationType;
    barrio: string;
    tipoPropiedad: string;
    ambientes: string;
  }) => void;
  barrios: string[];
  tipos: string[];
}

const CREAM = '#F0EBE3';

const OPERACION_TABS: { value: OperationType; label: string; icon: React.ReactNode }[] = [
  { value: 'Venta', label: 'Comprar', icon: <Home className="h-4 w-4" /> },
  { value: 'Alquiler', label: 'Alquilar', icon: <Building className="h-4 w-4" /> },
  { value: 'Desarrollo', label: 'Desarrollos', icon: <Landmark className="h-4 w-4" /> },
];

const AMBIENTES_OPTIONS = ['1', '2', '3', '4', '5+'];

/* ── Custom Dropdown ── */
interface DropdownOption { value: string; label: string }

function GlassDropdown({
  label,
  value,
  options,
  placeholder,
  onChange,
  icon,
  primaryColor,
}: {
  label: string;
  value: string;
  options: DropdownOption[];
  placeholder: string;
  onChange: (v: string) => void;
  icon?: React.ReactNode;
  primaryColor: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const selected = options.find(o => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full text-left cursor-pointer hover:bg-white/20 transition-colors"
      >
        <span className="absolute top-2.5 left-4 text-[10px] font-bold text-stone-500 uppercase tracking-wider">
          {label}
        </span>
        <div className="pt-7 pb-3 px-4 pr-9 flex items-center gap-2">
          {icon}
          <span className={`text-sm font-medium truncate ${selected ? 'text-stone-800' : 'text-stone-500'}`}>
            {selected ? selected.label : placeholder}
          </span>
        </div>
        <ChevronDown className={`absolute right-3 bottom-4 h-4 w-4 text-stone-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-50 max-h-[280px] overflow-y-auto scrollbar-thin"
          style={{
            background: '#FAF8F5',
            boxShadow: '0 12px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)',
            border: '1px solid rgba(168,162,150,0.2)',
          }}
        >
          <button
            type="button"
            onClick={() => { onChange(''); setOpen(false); }}
            className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${
              !value ? 'font-semibold' : 'text-stone-600 hover:bg-white/40'
            }`}
            style={!value ? { color: primaryColor } : undefined}
          >
            {placeholder}
            {!value && <Check className="h-4 w-4" style={{ color: primaryColor }} />}
          </button>
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${
                opt.value === value ? 'font-semibold' : 'text-stone-700 hover:bg-white/40'
              }`}
              style={opt.value === value ? { color: primaryColor } : undefined}
            >
              {opt.label}
              {opt.value === value && <Check className="h-4 w-4" style={{ color: primaryColor }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Mobile Dropdown ── */
function MobileGlassDropdown({
  label,
  value,
  options,
  placeholder,
  onChange,
  icon,
  primaryColor,
}: {
  label: string;
  value: string;
  options: DropdownOption[];
  placeholder: string;
  onChange: (v: string) => void;
  icon?: React.ReactNode;
  primaryColor: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const selected = options.find(o => o.value === value);

  return (
    <div ref={ref} className="relative">
      <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1 block">{label}</label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 bg-white/30 border border-stone-200/50 rounded-xl text-sm text-left font-medium cursor-pointer flex items-center gap-2"
      >
        {icon}
        <span className={`flex-1 truncate ${selected ? 'text-stone-800' : 'text-stone-500'}`}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 text-stone-400 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-50 max-h-[240px] overflow-y-auto scrollbar-thin"
          style={{
            background: '#FAF8F5',
            boxShadow: '0 12px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)',
            border: '1px solid rgba(168,162,150,0.2)',
          }}
        >
          <button
            type="button"
            onClick={() => { onChange(''); setOpen(false); }}
            className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center justify-between ${
              !value ? 'font-semibold' : 'text-stone-600 hover:bg-white/40'
            }`}
            style={!value ? { color: primaryColor } : undefined}
          >
            {placeholder}
            {!value && <Check className="h-4 w-4" style={{ color: primaryColor }} />}
          </button>
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center justify-between ${
                opt.value === value ? 'font-semibold' : 'text-stone-700 hover:bg-white/40'
              }`}
              style={opt.value === value ? { color: primaryColor } : undefined}
            >
              {opt.label}
              {opt.value === value && <Check className="h-4 w-4" style={{ color: primaryColor }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function RealEstateHero({
  tenantName,
  coverImage,
  headline = 'Encontrá tu próximo hogar',
  productCount,
  primaryColor,
  onSearch,
  barrios,
  tipos,
}: RealEstateHeroProps) {
  const [operacion, setOperacion] = useState<OperationType>('todos');
  const [barrio, setBarrio] = useState('');
  const [tipoPropiedad, setTipoPropiedad] = useState('');
  const [ambientes, setAmbientes] = useState('');

  const tipoOptions: DropdownOption[] = tipos.map(t => ({ value: t, label: t }));
  const barrioOptions: DropdownOption[] = barrios.map(b => ({ value: b, label: b }));
  const ambientesOptions: DropdownOption[] = AMBIENTES_OPTIONS.map(a => ({
    value: a,
    label: a === '5+' ? '5 o más' : `${a} ambiente${a === '1' ? '' : 's'}`,
  }));

  const handleSearch = () => {
    onSearch({ operacion, barrio, tipoPropiedad, ambientes });
  };

  return (
    <div className="relative">
      {/* ═══ HERO IMAGE — fades to cream ═══ */}
      <div className="relative h-[50vh] md:h-[65vh] min-h-[400px] md:min-h-[500px] max-h-[700px] overflow-hidden">
        {coverImage ? (
          <Image src={coverImage} alt={tenantName} fill className="object-cover" priority sizes="100vw" />
        ) : (
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}bb 50%, ${primaryColor}77 100%)` }} />
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.3) 100%)' }} />
        <div className="absolute inset-x-0 bottom-0 h-[35%] pointer-events-none" style={{ background: `linear-gradient(180deg, transparent 0%, ${CREAM}40 40%, ${CREAM}99 70%, ${CREAM} 100%)` }} />

        <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 text-center pb-16 md:pb-20">
          <h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-bold text-white mb-3 max-w-2xl"
            style={{ letterSpacing: '-0.025em', lineHeight: 1.12, textShadow: '0 2px 16px rgba(0,0,0,0.35)' }}
          >
            {headline}
          </h1>
          <p className="text-sm md:text-base text-white/70 max-w-md font-light" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.3)' }}>
            {productCount} propiedades disponibles
          </p>
        </div>
      </div>

      {/* ═══ GLASS SEARCH CARD ═══ */}
      <div className="relative z-20 -mt-14 md:-mt-16 px-4 max-w-[920px] mx-auto pb-8 md:pb-12">
        <div
          className="rounded-2xl"
          style={{
            background: 'rgba(255,255,255,0.35)',
            backdropFilter: 'blur(24px) saturate(140%)',
            WebkitBackdropFilter: 'blur(24px) saturate(140%)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 8px 24px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.6)',
            border: '1px solid rgba(255,255,255,0.5)',
          }}
        >
          {/* Tabs */}
          <div className="flex items-stretch border-b border-stone-200/40">
            <button
              onClick={() => setOperacion('todos')}
              className={`flex-1 py-3.5 md:py-4 text-[13px] md:text-sm font-semibold transition-all relative ${
                operacion === 'todos' ? 'text-stone-800' : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              Todas
              {operacion === 'todos' && (
                <span className="absolute bottom-0 inset-x-4 h-[3px] rounded-t-full" style={{ backgroundColor: primaryColor }} />
              )}
            </button>
            {OPERACION_TABS.map(tab => (
              <button
                key={tab.value}
                onClick={() => setOperacion(tab.value)}
                className={`flex-1 py-3.5 md:py-4 text-[13px] md:text-sm font-semibold transition-all relative flex items-center justify-center gap-1.5 ${
                  operacion === tab.value ? 'text-stone-800' : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                <span className="hidden md:inline-flex">{tab.icon}</span>
                {tab.label}
                {operacion === tab.value && (
                  <span className="absolute bottom-0 inset-x-4 h-[3px] rounded-t-full" style={{ backgroundColor: primaryColor }} />
                )}
              </button>
            ))}
          </div>

          {/* ── Desktop fields ── */}
          <div className="hidden md:flex items-stretch">
            <div className="flex-1 border-r border-stone-200/40">
              <GlassDropdown
                label="Tipo"
                value={tipoPropiedad}
                options={tipoOptions}
                placeholder="Todas las propiedades"
                onChange={setTipoPropiedad}
                primaryColor={primaryColor}
              />
            </div>

            <div className="flex-[1.4] border-r border-stone-200/40">
              <GlassDropdown
                label="Ubicación"
                value={barrio}
                options={barrioOptions}
                placeholder="Todos los barrios"
                onChange={setBarrio}
                icon={<MapPinIcon className="h-4 w-4 text-stone-400 shrink-0" />}
                primaryColor={primaryColor}
              />
            </div>

            <div className="flex-1">
              <GlassDropdown
                label="Ambientes"
                value={ambientes}
                options={ambientesOptions}
                placeholder="Todos"
                onChange={setAmbientes}
                primaryColor={primaryColor}
              />
            </div>

            <div className="p-2 flex items-center">
              <button
                onClick={handleSearch}
                className="h-full px-8 rounded-xl text-white font-bold text-sm transition-all hover:brightness-110 active:scale-[0.97] flex items-center gap-2.5 whitespace-nowrap"
                style={{ backgroundColor: primaryColor, minHeight: '48px', boxShadow: `0 4px 14px ${primaryColor}40` }}
              >
                <Search className="h-[18px] w-[18px]" />
                Buscar
              </button>
            </div>
          </div>

          {/* ── Mobile fields ── */}
          <div className="md:hidden p-4 space-y-3">
            <MobileGlassDropdown
              label="Tipo de propiedad"
              value={tipoPropiedad}
              options={tipoOptions}
              placeholder="Todas las propiedades"
              onChange={setTipoPropiedad}
              primaryColor={primaryColor}
            />

            <MobileGlassDropdown
              label="Ubicación"
              value={barrio}
              options={barrioOptions}
              placeholder="Todos los barrios"
              onChange={setBarrio}
              icon={<MapPinIcon className="h-4 w-4 text-stone-400 shrink-0" />}
              primaryColor={primaryColor}
            />

            <MobileGlassDropdown
              label="Ambientes"
              value={ambientes}
              options={ambientesOptions}
              placeholder="Todos"
              onChange={setAmbientes}
              primaryColor={primaryColor}
            />

            <button
              onClick={handleSearch}
              className="w-full py-3.5 rounded-xl text-white font-bold text-sm transition-all hover:brightness-110 active:scale-[0.98] flex items-center justify-center gap-2"
              style={{ backgroundColor: primaryColor, boxShadow: `0 4px 14px ${primaryColor}40` }}
            >
              <Search className="h-[18px] w-[18px]" />
              Buscar propiedades
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
