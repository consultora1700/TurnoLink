'use client';

import { useEffect, useState, useRef } from 'react';
import { DeviceMockup } from './device-mockup';
import { cn } from '@/lib/utils';
import Image from 'next/image';

// Safe theme hook that works during SSR
function useSafeTheme() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if dark mode is active
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkTheme();

    // Observe theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  return { isDark: mounted ? isDark : false, mounted };
}

interface HeroMockupsProps {
  className?: string;
}

// Screen definitions - SYNCHRONIZED between Mac and iPhone (LIGHT MODE ONLY)
const screens = [
  { id: 'dashboard', label: 'Dashboard', desktop: '/mockups/dashboard-light.webp', mobile: '/mockups/mobile-dashboard-light.webp' },
  { id: 'turnos', label: 'Calendario', desktop: '/mockups/turnos-light.webp', mobile: '/mockups/mobile-turnos-light.webp' },
  { id: 'servicios', label: 'Servicios', desktop: '/mockups/servicios-light.webp', mobile: '/mockups/mobile-servicios-light.webp' },
  { id: 'clientes', label: 'Clientes', desktop: '/mockups/clientes-light.webp', mobile: '/mockups/mobile-clientes-light.webp' },
] as const;

const CAROUSEL_INTERVAL = 5000; // 5 seconds per screen

export function HeroMockups({ className }: HeroMockupsProps) {
  const [mounted, setMounted] = useState(false);
  const [activeScreen, setActiveScreen] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Wait for mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Progress bar and auto-rotate - SYNCHRONIZED for Mac and iPhone
  useEffect(() => {
    if (!mounted || isHovering) {
      if (progressRef.current) clearInterval(progressRef.current);
      if (intervalRef.current) clearTimeout(intervalRef.current);
      return;
    }

    setProgress(0);

    const progressStep = 100 / (CAROUSEL_INTERVAL / 50);
    progressRef.current = setInterval(() => {
      setProgress(prev => Math.min(prev + progressStep, 100));
    }, 50);

    intervalRef.current = setTimeout(() => {
      setActiveScreen(prev => (prev + 1) % screens.length);
    }, CAROUSEL_INTERVAL);

    return () => {
      if (progressRef.current) clearInterval(progressRef.current);
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
  }, [mounted, isHovering, activeScreen]);

  const handleScreenChange = (index: number) => {
    setActiveScreen(index);
    setProgress(0);
  };

  return (
    <div className={cn('relative mt-12 md:mt-16', className)}>
      {/* Background glow effects - hidden on mobile for performance */}
      <div className="absolute inset-0 pointer-events-none hidden md:block">
        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/3 translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />
      </div>

      {/* Devices container - Both devices side by side, centered as group */}
      <div className="relative flex items-end justify-center gap-6 lg:gap-8 xl:gap-12 px-4">

        {/* MacBook - Main device with REAL screenshot carousel */}
        <div
          className="relative z-10 w-full max-w-2xl lg:max-w-[640px] xl:max-w-[720px]"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <DeviceMockup device="macbook" animate={false}>
            <div className="w-full h-full relative overflow-hidden bg-white dark:bg-neutral-900">
              {/* Real screenshot carousel */}
              {screens.map((screen, index) => (
                <div
                  key={screen.id}
                  className={cn(
                    'absolute inset-0 transition-all duration-500 ease-out',
                    index === activeScreen
                      ? 'opacity-100 translate-x-0'
                      : index < activeScreen
                      ? 'opacity-0 -translate-x-8'
                      : 'opacity-0 translate-x-8'
                  )}
                  aria-hidden={index !== activeScreen}
                >
                  <Image
                    src={screen.desktop}
                    alt={`TurnoLink ${screen.label}`}
                    fill
                    className="object-contain object-top"
                    priority={index === 0}
                    sizes="(max-width: 768px) 100vw, 720px"
                  />
                </div>
              ))}
            </div>
          </DeviceMockup>

          {/* Carousel indicators - simplified for mobile */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-4 md:mt-6">
            {screens.map((screen, index) => (
              <button
                key={screen.id}
                onClick={() => handleScreenChange(index)}
                className={cn(
                  'flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full transition-all duration-300',
                  index === activeScreen
                    ? 'bg-gradient-to-r from-teal-500 to-violet-500 text-white shadow-md'
                    : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                )}
                aria-label={`Ver ${screen.label}`}
              >
                <span className={cn(
                  'w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all',
                  index === activeScreen ? 'bg-white' : 'bg-current'
                )} />
                <span className="text-[10px] sm:text-xs font-medium hidden sm:inline">
                  {screen.label}
                </span>
              </button>
            ))}
          </div>

          {/* Progress bar - only show on desktop */}
          <div className="hidden sm:block absolute -bottom-2 left-1/2 -translate-x-1/2 w-48 h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-violet-500 transition-[width] duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* iPhone - SYNCHRONIZED with MacBook - Hidden on mobile, visible on lg+ */}
        <div className="hidden lg:block relative z-20 flex-shrink-0 mb-8">
          <div>
            <DeviceMockup device="iphone" animate={false} className="w-[200px] lg:w-[220px] xl:w-[240px]">
              <div className="w-full h-full relative overflow-hidden">
                {/* Mobile screenshot carousel - SYNCED with desktop */}
                {screens.map((screen, index) => (
                  <div
                    key={screen.id}
                    className={cn(
                      'absolute inset-0 transition-all duration-500 ease-out',
                      index === activeScreen
                        ? 'opacity-100 scale-100'
                        : 'opacity-0 scale-95'
                    )}
                  >
                    <Image
                      src={screen.mobile}
                      alt={`TurnoLink ${screen.label} Mobile`}
                      fill
                      className="object-cover object-top"
                      sizes="200px"
                      priority={index === 0}
                    />
                  </div>
                ))}
              </div>
            </DeviceMockup>
            {/* Mobile screen indicator dots - SYNCED */}
            <div className="flex justify-center gap-1 mt-2">
              {screens.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    'w-1.5 h-1.5 rounded-full transition-all',
                    index === activeScreen
                      ? 'bg-teal-500 w-3'
                      : 'bg-muted-foreground/30'
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade gradient */}
      <div className="absolute inset-x-0 bottom-0 h-20 md:h-32 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none z-30" />
    </div>
  );
}

// Alternate layout: Side by side with perspective - REAL SCREENSHOTS (WebP)
export function HeroMockupsSideBySide({ className }: HeroMockupsProps) {
  const { isDark } = useSafeTheme();

  return (
    <div className={cn('relative mt-16 md:mt-24', className)}>
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/3 w-[600px] h-[600px] bg-gradient-to-br from-teal-500/30 to-violet-500/30 rounded-full blur-3xl opacity-50" />
      </div>

      {/* Devices */}
      <div className="relative flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-0 px-4">
        {/* MacBook - REAL screenshot - LIGHT MODE ONLY */}
        <div className="relative z-10 lg:-mr-24">
          <DeviceMockup device="macbook" animate={false} className="max-w-2xl">
            <div className="w-full h-full relative">
              <Image
                src="/mockups/dashboard-light.webp"
                alt="TurnoLink Dashboard"
                fill
                className="object-contain object-top"
                sizes="672px"
              />
            </div>
          </DeviceMockup>
        </div>

        {/* iPhone - REAL screenshot - LIGHT MODE ONLY */}
        <div className="relative z-20 lg:-ml-8">
          <div className="animate-float-slow">
            <DeviceMockup device="iphone" animate={false} className="!max-w-[260px]">
              <div className="w-full h-full relative">
                <Image
                  src="/mockups/mobile-booking-services-light.webp"
                  alt="TurnoLink Reservas Mobile"
                  fill
                  className="object-cover object-top"
                  sizes="260px"
                />
              </div>
            </DeviceMockup>
          </div>
        </div>
      </div>

      {/* Bottom gradient */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </div>
  );
}

// Compact version for smaller sections - REAL SCREENSHOTS (WebP) - LIGHT MODE ONLY
export function MockupPreview({
  device = 'macbook',
  screenshot,
  className
}: {
  device?: 'macbook' | 'iphone';
  screenshot?: string;
  className?: string;
}) {
  const defaultScreenshot = device === 'macbook'
    ? '/mockups/dashboard-light.webp'
    : '/mockups/mobile-booking-services-light.webp';

  return (
    <div className={cn('relative', className)}>
      <DeviceMockup device={device} animate>
        <div className="w-full h-full relative">
          <Image
            src={screenshot || defaultScreenshot}
            alt={`TurnoLink ${device === 'macbook' ? 'Dashboard' : 'Mobile'}`}
            fill
            className={`${device === 'macbook' ? 'object-contain' : 'object-cover'} object-top`}
            sizes={device === 'macbook' ? '672px' : '280px'}
          />
        </div>
      </DeviceMockup>
    </div>
  );
}
