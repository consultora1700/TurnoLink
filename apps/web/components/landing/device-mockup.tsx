'use client';

import { ReactNode, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

// Hook to detect dark mode
function useIsDark() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains('dark'));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return isDark;
}

interface DeviceMockupProps {
  device: 'macbook' | 'iphone' | 'ipad';
  children?: ReactNode;
  screenshot?: string;
  alt?: string;
  className?: string;
  animate?: boolean;
  scale?: number;
}

export function DeviceMockup({
  device,
  children,
  screenshot,
  alt = 'App screenshot',
  className,
  animate = true,
  scale = 1,
}: DeviceMockupProps) {
  if (device === 'macbook') {
    return (
      <MacBookMockup
        className={className}
        animate={animate}
        scale={scale}
        screenshot={screenshot}
        alt={alt}
      >
        {children}
      </MacBookMockup>
    );
  }

  if (device === 'iphone') {
    return (
      <IPhoneMockup
        className={className}
        animate={animate}
        scale={scale}
        screenshot={screenshot}
        alt={alt}
      >
        {children}
      </IPhoneMockup>
    );
  }

  if (device === 'ipad') {
    return (
      <IPadMockup
        className={className}
        animate={animate}
        scale={scale}
        screenshot={screenshot}
        alt={alt}
      >
        {children}
      </IPadMockup>
    );
  }

  return null;
}

function MacBookMockup({
  children,
  screenshot,
  alt,
  className,
  animate,
  scale,
}: Omit<DeviceMockupProps, 'device'>) {
  const isDark = useIsDark();

  // MacBook Pro - Marco negro en ambos modos, base adaptativa
  // En modo claro: marco negro clásico, base plateada
  // En modo oscuro: marco Space Black, base Space Black
  const frameGradient = isDark
    ? 'linear-gradient(180deg, #2c2c2e 0%, #1c1c1e 50%, #141414 100%)' // Space Black
    : 'linear-gradient(180deg, #1d1d1f 0%, #161617 50%, #0d0d0e 100%)'; // Negro clásico

  const bezelColor = 'linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%)'; // Siempre negro

  // Base del teclado - plateada en claro, Space Black en oscuro
  const baseGradient = isDark
    ? 'linear-gradient(180deg, #3a3a3c 0%, #2c2c2e 50%, #252527 100%)' // Space Black base
    : 'linear-gradient(180deg, #e8e8ed 0%, #d1d1d6 50%, #c7c7cc 100%)'; // Silver base

  const hingeGradient = isDark
    ? 'linear-gradient(180deg, #2c2c2e 0%, #1c1c1e 100%)'
    : 'linear-gradient(180deg, #1d1d1f 0%, #2d2d2f 100%)';

  const indentGradient = isDark
    ? 'linear-gradient(180deg, #252527 0%, #1c1c1e 100%)'
    : 'linear-gradient(180deg, #b8b8bd 0%, #a8a8ad 100%)';

  return (
    <div
      className={cn(
        'relative w-full max-w-4xl mx-auto',
        animate && 'animate-float-slow',
        className
      )}
      style={{ transform: `scale(${scale})` }}
    >
      {/* MacBook Pro M3 Style Frame */}
      <div className="relative">
        {/* Screen bezel - adapts to theme */}
        <div
          className="relative rounded-t-[1.2rem] md:rounded-t-[1.5rem] overflow-hidden"
          style={{
            background: frameGradient,
            padding: '0.5rem 0.5rem 0.4rem 0.5rem',
            boxShadow: isDark
              ? '0 25px 50px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05) inset'
              : '0 25px 50px -12px rgba(0,0,0,0.25)'
          }}
        >
          {/* Top bezel with camera notch */}
          <div className="relative flex items-center justify-center mb-1">
            {/* Camera notch - MacBook Pro style */}
            <div
              className="w-16 md:w-20 h-5 md:h-6 rounded-b-xl flex items-center justify-center"
              style={{ background: bezelColor }}
            >
              {/* Camera lens */}
              <div
                className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full relative"
                style={{
                  background: 'radial-gradient(circle, #1e1e1e 0%, #0a0a0a 70%)',
                  boxShadow: 'inset 0 0 2px rgba(255,255,255,0.1), 0 0 1px #000'
                }}
              >
                {/* Camera LED indicator */}
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full"
                  style={{ backgroundColor: '#0f2f1f' }}
                />
              </div>
            </div>
          </div>

          {/* Screen - edge to edge with subtle border */}
          <div
            className="relative rounded-[0.5rem] md:rounded-[0.6rem] overflow-hidden aspect-[16/10]"
            style={{
              boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.3), inset 0 0 0 2px rgba(255,255,255,0.02)'
            }}
          >
            {screenshot ? (
              <img
                src={screenshot}
                alt={alt}
                className="w-full h-full object-cover object-top"
              />
            ) : children ? (
              <div className="w-full h-full bg-white dark:bg-neutral-900">{children}</div>
            ) : (
              <MacBookDefaultScreen />
            )}

            {/* Screen reflection overlay - sutil brillo de pantalla */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: isDark
                  ? 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, transparent 40%, transparent 100%)'
                  : 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 50%, transparent 100%)'
              }}
            />
          </div>
        </div>

        {/* Bottom hinge - seamless connection, adapts to theme */}
        <div className="relative">
          {/* Hinge lip */}
          <div
            className="h-1.5 md:h-2"
            style={{
              background: hingeGradient,
              borderBottomLeftRadius: '2px',
              borderBottomRightRadius: '2px'
            }}
          />

          {/* Base/Keyboard deck - adapts to theme */}
          <div
            className="relative h-3 md:h-4 mx-auto rounded-b-lg md:rounded-b-xl"
            style={{
              background: baseGradient,
              width: '101%',
              marginLeft: '-0.5%',
              boxShadow: isDark
                ? '0 2px 4px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)'
                : '0 2px 4px rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.05)'
            }}
          >
            {/* Center indent for opening */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-12 md:w-16 h-1 rounded-b-lg"
              style={{ background: indentGradient }}
            />
          </div>
        </div>

        {/* Realistic shadow - adapts to theme */}
        <div
          className="absolute -bottom-6 md:-bottom-8 left-1/2 -translate-x-1/2 w-[85%] h-6 md:h-8 rounded-full"
          style={{
            background: isDark
              ? 'radial-gradient(ellipse, rgba(0,0,0,0.4) 0%, transparent 70%)'
              : 'radial-gradient(ellipse, rgba(0,0,0,0.15) 0%, transparent 70%)',
            filter: 'blur(8px)'
          }}
        />
      </div>
    </div>
  );
}

function IPhoneMockup({
  children,
  screenshot,
  alt,
  className,
  animate,
  scale,
}: Omit<DeviceMockupProps, 'device'>) {
  const isDark = useIsDark();

  // En modo oscuro, marco más claro (plateado/titanio natural)
  const frameGradient = isDark
    ? 'linear-gradient(145deg, #d4d4d8 0%, #a1a1aa 50%, #b4b4bc 100%)' // Plateado claro
    : 'linear-gradient(145deg, #3a3a3c 0%, #1d1d1f 50%, #2c2c2e 100%)'; // Negro titanio (original)

  const buttonColor = isDark
    ? 'linear-gradient(90deg, #d4d4d8, #a1a1aa)'
    : 'linear-gradient(90deg, #5a5a5c, #3a3a3c)';

  return (
    <div
      className={cn(
        'relative w-full mx-auto',
        animate && 'animate-float',
        className
      )}
      style={{ transform: `scale(${scale})` }}
    >
      {/* iPhone 15 Pro Titanium Frame */}
      <div
        className="relative rounded-[2.8rem] shadow-2xl overflow-hidden"
        style={{
          background: frameGradient,
          padding: '3px'
        }}
      >
        {/* Titanium side buttons (left) - subtle */}
        <div
          className="absolute left-0 top-[18%] w-[3px] h-6 rounded-l-sm"
          style={{ background: buttonColor }}
        />
        <div
          className="absolute left-0 top-[28%] w-[3px] h-10 rounded-l-sm"
          style={{ background: buttonColor }}
        />
        <div
          className="absolute left-0 top-[42%] w-[3px] h-10 rounded-l-sm"
          style={{ background: buttonColor }}
        />

        {/* Power button (right) */}
        <div
          className="absolute right-0 top-[30%] w-[3px] h-14 rounded-r-sm"
          style={{ background: buttonColor.replace('90deg', '270deg') }}
        />

        {/* Inner bezel */}
        <div
          className="relative rounded-[2.6rem] overflow-hidden"
          style={{ background: '#000000' }}
        >
          {/* Screen area */}
          <div className="relative rounded-[2.5rem] overflow-hidden aspect-[9/19.5] m-[2px]">
            {/* Status bar area - simulates iOS status bar with Dynamic Island */}
            <div className="absolute top-0 left-0 right-0 z-30 bg-black">
              {/* Status bar with time, signal, battery - centered with Dynamic Island */}
              <div className="relative h-[36px] flex items-center justify-between px-6">
                {/* Left side - Time */}
                <span className="text-white text-[11px] font-semibold tracking-tight">9:41</span>

                {/* Dynamic Island - centered */}
                <div className="absolute top-[6px] left-1/2 -translate-x-1/2">
                  <div
                    className="w-[90px] h-[26px] bg-black rounded-full flex items-center justify-center"
                    style={{
                      boxShadow: '0 0 0 1px rgba(255,255,255,0.05)'
                    }}
                  >
                    {/* Front camera */}
                    <div
                      className="w-[9px] h-[9px] rounded-full mr-2"
                      style={{
                        background: 'radial-gradient(circle, #1a1a1a 40%, #0a0a0a 100%)',
                        boxShadow: 'inset 0 0 2px rgba(255,255,255,0.1)'
                      }}
                    />
                    {/* Face ID sensors */}
                    <div
                      className="w-[6px] h-[6px] rounded-full"
                      style={{ background: '#0d0d0d' }}
                    />
                  </div>
                </div>

                {/* Right side - Signal, WiFi, Battery */}
                <div className="flex items-center gap-1">
                  {/* Signal bars */}
                  <svg className="w-[15px] h-[10px]" viewBox="0 0 17 11" fill="white">
                    <rect x="0" y="7" width="3" height="4" rx="0.5" />
                    <rect x="4.5" y="5" width="3" height="6" rx="0.5" />
                    <rect x="9" y="2.5" width="3" height="8.5" rx="0.5" />
                    <rect x="13.5" y="0" width="3" height="11" rx="0.5" />
                  </svg>
                  {/* WiFi */}
                  <svg className="w-[13px] h-[10px]" viewBox="0 0 15 11" fill="white">
                    <path d="M7.5 2.5c2.7 0 5.2 1.1 7 2.9l-1.4 1.4c-1.5-1.5-3.5-2.3-5.6-2.3s-4.1.8-5.6 2.3L.5 5.4c1.8-1.8 4.3-2.9 7-2.9zm0 3c1.7 0 3.2.7 4.4 1.8L10.5 8.7c-.8-.8-1.9-1.2-3-1.2s-2.2.4-3 1.2L3.1 7.3c1.2-1.1 2.7-1.8 4.4-1.8zm0 3c.8 0 1.6.3 2.1.9L7.5 11l-2.1-1.6c.5-.6 1.3-.9 2.1-.9z" />
                  </svg>
                  {/* Battery */}
                  <div className="flex items-center">
                    <div className="w-[20px] h-[10px] rounded-[2px] border border-white/50 p-[1px] relative">
                      <div className="w-[85%] h-full bg-white rounded-[1px]" />
                    </div>
                    <div className="w-[1.5px] h-[4px] bg-white/50 rounded-r-full ml-[0.5px]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Content area - starts below status bar, leaving space for Dynamic Island */}
            <div className="absolute top-[38px] left-0 right-0 bottom-0">
              {screenshot ? (
                <img
                  src={screenshot}
                  alt={alt}
                  className="w-full h-full object-cover object-[center_8%]"
                />
              ) : children ? (
                <div className="w-full h-full bg-white dark:bg-neutral-900">{children}</div>
              ) : (
                <IPhoneDefaultScreen />
              )}
            </div>

            {/* Screen reflection */}
            <div
              className="absolute inset-0 pointer-events-none z-10"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 40%)'
              }}
            />

            {/* Home indicator */}
            <div
              className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-[100px] h-[4px] rounded-full z-20"
              style={{ background: 'rgba(0,0,0,0.3)' }}
            />
          </div>
        </div>
      </div>

      {/* Shadow */}
      <div
        className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[75%] h-6 rounded-full"
        style={{
          background: 'radial-gradient(ellipse, rgba(0,0,0,0.2) 0%, transparent 70%)',
          filter: 'blur(8px)'
        }}
      />
    </div>
  );
}

function IPadMockup({
  children,
  screenshot,
  alt,
  className,
  animate,
  scale,
}: Omit<DeviceMockupProps, 'device'>) {
  return (
    <div
      className={cn(
        'relative w-full max-w-2xl mx-auto',
        animate && 'animate-float-slow',
        className
      )}
      style={{ transform: `scale(${scale})` }}
    >
      {/* iPad Pro Frame */}
      <div
        className="relative rounded-3xl p-3 shadow-2xl"
        style={{
          background: 'linear-gradient(to bottom, #2d2d2d, #1a1a1a, #2d2d2d)',
          border: '1px solid #3a3a3a'
        }}
      >
        {/* Camera */}
        <div
          className="absolute top-3 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
          style={{ backgroundColor: '#0d0d0d', border: '1px solid #3a3a3a' }}
        />

        {/* Screen */}
        <div className="relative bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden aspect-[4/3]">
          {screenshot ? (
            <img
              src={screenshot}
              alt={alt}
              className="w-full h-full object-cover object-top"
            />
          ) : children ? (
            <div className="w-full h-full">{children}</div>
          ) : (
            <IPadDefaultScreen />
          )}

          {/* Screen reflection */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Shadow */}
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[85%] h-8 bg-black/20 blur-xl rounded-full" />
    </div>
  );
}

// Default screen content components
function MacBookDefaultScreen() {
  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-800 dark:to-neutral-900 p-4">
      <DashboardUI />
    </div>
  );
}

function IPhoneDefaultScreen() {
  return (
    <div className="w-full h-full bg-gradient-to-br from-teal-50 via-white to-violet-50 dark:from-neutral-800 dark:via-neutral-900 dark:to-neutral-800">
      <BookingMobileUI />
    </div>
  );
}

function IPadDefaultScreen() {
  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-800 dark:to-neutral-900 p-6">
      <CalendarUI />
    </div>
  );
}

// Stylized UI Components for mockups
export function DashboardUI() {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-violet-500 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="font-bold text-sm">TurnoLink</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-xs font-bold">
            ME
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[
          { label: 'Turnos Hoy', value: '12', color: 'from-blue-500 to-cyan-500' },
          { label: 'Esta Semana', value: '48', color: 'from-green-500 to-emerald-500' },
          { label: 'Clientes', value: '156', color: 'from-orange-500 to-amber-500' },
          { label: 'Ingresos', value: '$45k', color: 'from-teal-500 to-teal-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-neutral-800 rounded-xl p-3 shadow-sm border border-slate-100 dark:border-neutral-700">
            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            <p className={`text-lg font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 grid grid-cols-3 gap-3">
        {/* Calendar mini */}
        <div className="col-span-2 bg-white dark:bg-neutral-800 rounded-xl p-3 shadow-sm border border-slate-100 dark:border-neutral-700">
          <p className="text-xs font-semibold mb-2">Calendario</p>
          <div className="grid grid-cols-7 gap-0.5 text-center text-[8px]">
            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
              <span key={i} className="text-muted-foreground">{d}</span>
            ))}
            {Array.from({ length: 28 }, (_, i) => (
              <div
                key={i}
                className={cn(
                  'aspect-square flex items-center justify-center rounded text-[9px]',
                  i === 14 && 'bg-gradient-to-br from-teal-500 to-violet-500 text-white font-bold',
                  [10, 12, 18, 20].includes(i) && 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400'
                )}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Today's bookings */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl p-3 shadow-sm border border-slate-100 dark:border-neutral-700">
          <p className="text-xs font-semibold mb-2">Proximos</p>
          <div className="space-y-1.5">
            {[
              { time: '10:00', name: 'María G.', service: 'Corte' },
              { time: '11:30', name: 'Ana R.', service: 'Manicura' },
              { time: '14:00', name: 'Laura P.', service: 'Facial' },
            ].map((booking, i) => (
              <div key={i} className="flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-50 dark:bg-neutral-700/50">
                <span className="text-[9px] font-mono text-muted-foreground">{booking.time}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-medium truncate">{booking.name}</p>
                  <p className="text-[8px] text-muted-foreground truncate">{booking.service}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function BookingMobileUI() {
  return (
    <div className="h-full flex flex-col">
      {/* Hero Header - like real public page */}
      <div className="relative bg-gradient-to-br from-teal-500 via-cyan-600 to-violet-600 px-3 py-4">
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />

        <div className="relative flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center border border-white/30">
            <span className="text-xl font-bold text-white">B</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm text-white">Bella Estética</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="flex items-center gap-1">
                <svg className="w-3 h-3 fill-amber-300 text-amber-300" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-[10px] text-white/90">4.9</span>
              </div>
              <span className="text-white/50">•</span>
              <span className="text-[10px] text-white/70">500+ clientes</span>
            </div>
          </div>
          <div className="px-2 py-1 rounded-full bg-emerald-400/20 border border-emerald-300/30">
            <span className="text-[9px] font-medium text-emerald-200">Online</span>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 py-3 bg-white dark:bg-neutral-800 border-b">
        {[1, 2, 3].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={cn(
              'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold',
              i < 2 ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-500'
            )}>
              {i < 2 ? '✓' : s}
            </div>
            {i < 2 && <div className={cn('w-8 h-0.5 rounded', i < 1 ? 'bg-slate-900' : 'bg-slate-200')} />}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 p-3 space-y-3 overflow-auto">
        {/* Selected Service Card */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl p-3 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-neutral-700 flex items-center justify-center text-slate-600 font-semibold text-sm">L</div>
            <div className="flex-1">
              <p className="text-[10px] text-muted-foreground">Servicio</p>
              <p className="font-semibold text-sm">Limpieza Facial</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-sm">$8.500</p>
              <p className="text-[9px] text-muted-foreground">60 min</p>
            </div>
          </div>
        </div>

        {/* Date & Time */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl p-3 shadow-sm border">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-neutral-700/50 text-center">
              <p className="text-[9px] text-muted-foreground">Fecha</p>
              <p className="font-bold text-sm">Vie 17 Ene</p>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-neutral-700/50 text-center">
              <p className="text-[9px] text-muted-foreground">Hora</p>
              <p className="font-bold text-sm">11:00 hs</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="p-3 border-t bg-white dark:bg-neutral-800">
        <button className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-xs flex items-center justify-center gap-2">
          Confirmar Turno
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export function CalendarUI() {
  return (
    <div className="h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-violet-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h2 className="font-bold">Enero 2026</h2>
            <p className="text-xs text-muted-foreground">Vista semanal</p>
          </div>
        </div>
        <div className="flex gap-1">
          <button className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border overflow-hidden">
        {/* Days header */}
        <div className="grid grid-cols-8 border-b">
          <div className="p-2" />
          {['Lun 13', 'Mar 14', 'Mie 15', 'Jue 16', 'Vie 17', 'Sab 18', 'Dom 19'].map((day, i) => (
            <div key={i} className={cn(
              'p-2 text-center text-xs font-medium border-l',
              i === 4 && 'bg-teal-50 dark:bg-teal-900/20'
            )}>
              {day}
            </div>
          ))}
        </div>

        {/* Time slots */}
        {['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'].map((time, rowIdx) => (
          <div key={time} className="grid grid-cols-8 border-b last:border-b-0">
            <div className="p-2 text-[10px] text-muted-foreground border-r">{time}</div>
            {[0, 1, 2, 3, 4, 5, 6].map((colIdx) => {
              const hasBooking = (rowIdx === 0 && colIdx === 2) ||
                               (rowIdx === 2 && colIdx === 4) ||
                               (rowIdx === 4 && colIdx === 1) ||
                               (rowIdx === 1 && colIdx === 4);
              return (
                <div key={colIdx} className={cn(
                  'p-1 border-l min-h-[40px]',
                  colIdx === 4 && 'bg-teal-50/50 dark:bg-teal-900/10'
                )}>
                  {hasBooking && (
                    <div className={cn(
                      'h-full rounded-md p-1 text-[8px]',
                      colIdx === 4 ? 'bg-gradient-to-br from-teal-500 to-violet-500 text-white' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    )}>
                      <p className="font-semibold truncate">{['María G.', 'Ana R.', 'Laura P.', 'Carmen S.'][rowIdx % 4]}</p>
                      <p className="opacity-80 truncate">{['Corte', 'Manicura', 'Facial', 'Masaje'][rowIdx % 4]}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// New UI Components for carousel and sections

export function ServicesUI() {
  const services = [
    { name: 'Corte de Cabello', price: '$5.000', duration: '30 min', color: 'from-teal-500 to-teal-500' },
    { name: 'Manicura', price: '$8.000', duration: '45 min', color: 'from-violet-500 to-purple-500' },
    { name: 'Limpieza Facial', price: '$12.000', duration: '60 min', color: 'from-blue-500 to-cyan-500' },
    { name: 'Masaje Relajante', price: '$15.000', duration: '90 min', color: 'from-emerald-500 to-green-500' },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-violet-500 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <span className="font-bold text-sm">Servicios</span>
        </div>
        <button className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-teal-500 to-violet-500 text-white text-xs font-medium">
          + Agregar
        </button>
      </div>

      {/* Services List */}
      <div className="flex-1 space-y-2 overflow-hidden">
        {services.map((service, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-neutral-800 border border-slate-100 dark:border-neutral-700 hover:border-teal-200 dark:hover:border-teal-700 transition-colors"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center text-white font-bold text-xs`}>
              {service.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{service.name}</p>
              <p className="text-[10px] text-muted-foreground">{service.duration}</p>
            </div>
            <span className="text-sm font-bold text-teal-600 dark:text-teal-400">{service.price}</span>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-neutral-700">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-lg font-bold text-teal-600 dark:text-teal-400">12</p>
            <p className="text-[9px] text-muted-foreground">Servicios</p>
          </div>
          <div>
            <p className="text-lg font-bold text-violet-600 dark:text-violet-400">4</p>
            <p className="text-[9px] text-muted-foreground">Categorías</p>
          </div>
          <div>
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">$8.5k</p>
            <p className="text-[9px] text-muted-foreground">Promedio</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ClientsUI() {
  const clients = [
    { name: 'María García', visits: 12, lastVisit: 'Hace 3 días', avatar: 'MG' },
    { name: 'Ana Rodríguez', visits: 8, lastVisit: 'Hace 1 semana', avatar: 'AR' },
    { name: 'Laura Pérez', visits: 5, lastVisit: 'Hace 2 semanas', avatar: 'LP' },
    { name: 'Carmen Silva', visits: 3, lastVisit: 'Hace 1 mes', avatar: 'CS' },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <span className="font-bold text-sm">Clientes</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="px-2 py-1 rounded-md bg-muted text-[10px]">
            <svg className="w-3 h-3 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Buscar
          </div>
        </div>
      </div>

      {/* Clients List */}
      <div className="flex-1 space-y-2 overflow-hidden">
        {clients.map((client, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-neutral-800 border border-slate-100 dark:border-neutral-700"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-xs">
              {client.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{client.name}</p>
              <p className="text-[10px] text-muted-foreground">{client.lastVisit}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold">{client.visits}</p>
              <p className="text-[9px] text-muted-foreground">visitas</p>
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-neutral-700">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-lg font-bold text-orange-600 dark:text-orange-400">156</p>
            <p className="text-[9px] text-muted-foreground">Total</p>
          </div>
          <div>
            <p className="text-lg font-bold text-green-600 dark:text-green-400">24</p>
            <p className="text-[9px] text-muted-foreground">Nuevos</p>
          </div>
          <div>
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">89%</p>
            <p className="text-[9px] text-muted-foreground">Retención</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PaymentFlowUI() {
  return (
    <div className="h-full flex flex-col">
      {/* Mercado Pago Header with official logo */}
      <div className="bg-[#009ee3] px-3 py-4">
        <div className="flex items-center justify-center mb-2">
          {/* Official Mercado Pago logo */}
          <div className="bg-white rounded-lg px-3 py-1.5">
            <img
              src="/mercadopago-logo.svg"
              alt="Mercado Pago"
              className="h-5 object-contain"
            />
          </div>
        </div>
        <p className="text-center text-white/80 text-[10px]">Pago seguro con Mercado Pago</p>
      </div>

      {/* Content */}
      <div className="flex-1 p-3 space-y-3 overflow-auto bg-slate-50 dark:bg-neutral-900">
        {/* Business & Service */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl p-3 shadow-sm border">
          <div className="flex items-center gap-3 mb-3 pb-3 border-b">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm">B</div>
            <div>
              <p className="font-semibold text-sm">Bella Estética</p>
              <p className="text-[10px] text-muted-foreground">Limpieza Facial - 60 min</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Precio total</span>
              <span>$8.500</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Seña (50%)</span>
              <span className="font-bold text-[#009ee3]">$4.250</span>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl p-3 shadow-sm border">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Medio de pago</p>

          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 rounded-lg border-2 border-[#009ee3] bg-[#009ee3]/5">
              <div className="w-8 h-5 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center">
                <span className="text-white text-[8px] font-bold">VISA</span>
              </div>
              <span className="text-xs font-medium">**** 4532</span>
              <div className="ml-auto w-4 h-4 rounded-full bg-[#009ee3] flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-neutral-700">
              <div className="w-8 h-5 bg-gradient-to-r from-red-500 to-orange-500 rounded flex items-center justify-center">
                <span className="text-white text-[7px] font-bold">MC</span>
              </div>
              <span className="text-xs text-muted-foreground">Otra tarjeta</span>
            </div>
          </div>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-2 text-[9px] text-muted-foreground">
          <svg className="w-3 h-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>Pago 100% seguro</span>
        </div>
      </div>

      {/* CTA */}
      <div className="p-3 border-t bg-white dark:bg-neutral-800">
        <button className="w-full py-2.5 rounded-xl bg-[#009ee3] text-white font-semibold text-xs shadow-lg flex items-center justify-center gap-2">
          Pagar $4.250
        </button>
      </div>
    </div>
  );
}

export function PublicPageUI() {
  return (
    <div className="h-full flex flex-col">
      {/* Hero Header - matching real public page */}
      <div className="relative bg-gradient-to-br from-teal-500 via-cyan-600 to-violet-600">
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />

        {/* Decorative blurs */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-teal-300/30 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-violet-300/30 rounded-full blur-2xl" />

        <div className="relative px-3 py-4">
          {/* Business info */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center border border-white/30 shadow-lg">
              <span className="text-lg font-bold text-white">B</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm text-white">Bella Estética</h3>
              <p className="text-[10px] text-white/70">Servicios de belleza</p>
            </div>
            <div className="px-2 py-1 rounded-full bg-emerald-400/20 border border-emerald-300/30">
              <span className="text-[8px] font-medium text-emerald-200">Online</span>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3 fill-amber-300 text-amber-300" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-[10px] text-white font-medium">4.9</span>
            </div>
            <span className="text-white/40">•</span>
            <span className="text-[10px] text-white/70">500+ clientes</span>
            <span className="text-white/40">•</span>
            <div className="flex items-center gap-1 text-white/70">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <span className="text-[10px]">CABA</span>
            </div>
          </div>
        </div>
      </div>

      {/* Services List */}
      <div className="flex-1 p-3 space-y-2 overflow-auto bg-slate-50 dark:bg-neutral-900">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Servicios Disponibles</p>

        {[
          { name: 'Limpieza Facial', duration: '60 min', price: '$8.500' },
          { name: 'Manicura Premium', duration: '45 min', price: '$6.000' },
          { name: 'Masaje Relajante', duration: '90 min', price: '$12.000' },
        ].map((service, i) => (
          <div key={i} className="bg-white dark:bg-neutral-800 rounded-xl p-3 shadow-sm border hover:border-teal-200 dark:hover:border-teal-700 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-neutral-700 flex items-center justify-center text-slate-600 dark:text-slate-300 text-sm font-semibold">
                {service.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold">{service.name}</p>
                <p className="text-[9px] text-muted-foreground">{service.duration}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold">{service.price}</p>
                <p className="text-[8px] text-teal-500">Reservar →</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="p-3 border-t bg-white dark:bg-neutral-800">
        <div className="flex items-center justify-center gap-4 text-[9px] text-muted-foreground">
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Inmediato</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Seguro</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function NotificationsUI() {
  const notifications = [
    { type: 'new', icon: '✓', title: 'Nueva reserva', desc: 'María - 10:00 AM', time: 'Hace 5 min' },
    { type: 'reminder', icon: '!', title: 'Recordatorio', desc: 'Ana - Mañana 11:30', time: 'Hace 1 hora' },
    { type: 'cancel', icon: '✕', title: 'Cancelación', desc: 'Pedro canceló su turno', time: 'Hace 2 horas' },
    { type: 'new', icon: '✓', title: 'Pago recibido', desc: '$4.250 - Seña', time: 'Hace 3 horas' },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <span className="font-bold text-sm">Notificaciones</span>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-teal-500 text-white text-[10px] font-bold">4</span>
      </div>

      {/* Notifications List */}
      <div className="flex-1 space-y-2 overflow-hidden">
        {notifications.map((notif, i) => (
          <div
            key={i}
            className={cn(
              'flex items-start gap-3 p-3 rounded-xl border',
              notif.type === 'new' ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800' :
              notif.type === 'reminder' ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800' :
              'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800'
            )}
          >
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold',
              notif.type === 'new' ? 'bg-green-500' :
              notif.type === 'reminder' ? 'bg-amber-500' :
              'bg-red-500'
            )}>
              {notif.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold">{notif.title}</p>
              <p className="text-[10px] text-muted-foreground truncate">{notif.desc}</p>
            </div>
            <span className="text-[9px] text-muted-foreground whitespace-nowrap">{notif.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BookingFlowStep({
  step,
  title,
  active = false,
}: {
  step: 1 | 2 | 3;
  title: string;
  active?: boolean;
}) {
  const renderContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="p-3 space-y-2">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Servicios</p>
            {['Limpieza Facial', 'Manicura', 'Masaje'].map((service, i) => (
              <div
                key={i}
                className={cn(
                  'p-2 rounded-xl border text-xs transition-all',
                  i === 0 ? 'border-teal-300 bg-teal-50 dark:bg-teal-900/20 dark:border-teal-700' : 'border-slate-200 dark:border-neutral-700'
                )}
              >
                <div className="flex justify-between">
                  <span className="font-medium">{service}</span>
                  <span className="text-muted-foreground">${(8000 + i * 500).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        );
      case 2:
        return (
          <div className="p-3">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Enero 2026</p>
            <div className="grid grid-cols-7 gap-1 text-center text-[9px]">
              {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
                <span key={i} className="text-muted-foreground font-medium">{d}</span>
              ))}
              {Array.from({ length: 21 }, (_, i) => (
                <div
                  key={i}
                  className={cn(
                    'aspect-square flex items-center justify-center rounded-lg',
                    i === 16 ? 'bg-gradient-to-br from-teal-500 to-violet-500 text-white font-bold' :
                    i < 12 ? 'text-slate-300 dark:text-neutral-600' : ''
                  )}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="p-3 space-y-3">
            <div className="text-center p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-2">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="font-bold text-sm text-green-700 dark:text-green-300">Turno Confirmado</p>
              <p className="text-[10px] text-muted-foreground mt-1">Vie 17 Ene - 11:00</p>
            </div>
            <div className="text-[10px] text-center text-muted-foreground">
              Recibirás un recordatorio por WhatsApp
            </div>
          </div>
        );
    }
  };

  return (
    <div className={cn(
      'bg-white dark:bg-neutral-800 rounded-2xl shadow-lg border overflow-hidden transition-all duration-300',
      active ? 'ring-2 ring-teal-500 scale-105' : 'opacity-90'
    )}>
      {/* Dynamic Island placeholder */}
      <div className="h-12 bg-gradient-to-b from-black to-neutral-900 relative flex items-center justify-center">
        <div className="w-20 h-6 bg-black rounded-full" />
      </div>

      {/* Title */}
      <div className="px-3 pt-3 pb-1">
        <p className="text-xs font-semibold">{title}</p>
      </div>

      {renderContent()}
    </div>
  );
}
