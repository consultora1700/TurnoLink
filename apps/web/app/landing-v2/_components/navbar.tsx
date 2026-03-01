'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'lv2-nav-blur' : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-5 lg:px-10 h-[70px] lg:h-[91px] flex items-center justify-between">
        <Link href="/landing-v2" className="flex items-center">
          <Image src="/logo-claro.png" alt="TurnoLink" width={240} height={60} className="h-12 lg:h-[60px] w-auto" priority />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/landing-v2#plataforma" className="text-sm text-white/60 hover:text-white transition-colors duration-300">
            Plataforma
          </Link>
          <Link href="/landing-v2#industrias" className="text-sm text-white/60 hover:text-white transition-colors duration-300">
            Industrias
          </Link>
          <Link href="/landing-v2#producto" className="text-sm text-white/60 hover:text-white transition-colors duration-300">
            Producto
          </Link>
          <Link href="/landing-v2/talento" className="text-sm text-white/60 hover:text-white transition-colors duration-300">
            Talento
          </Link>
          <Link href="/landing-v2/integrar" className="text-sm text-white/60 hover:text-white transition-colors duration-300">
            Integrar
          </Link>
          <Link href="/landing-v2#industrias" className="text-sm text-white/60 hover:text-white transition-colors duration-300">
            Precios
          </Link>
          <Link
            href="/register"
            className="lv2-glow-btn bg-[#3F8697] text-white text-sm font-medium px-5 py-2.5 rounded-[10px]"
          >
            Empezar gratis
          </Link>
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden text-white p-2" aria-label="Menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden lv2-nav-blur border-t border-white/[0.06] px-5 py-6 space-y-4">
          <Link href="/landing-v2#plataforma" className="block text-white/70 hover:text-white" onClick={() => setOpen(false)}>
            Plataforma
          </Link>
          <Link href="/landing-v2#industrias" className="block text-white/70 hover:text-white" onClick={() => setOpen(false)}>
            Industrias
          </Link>
          <Link href="/landing-v2#producto" className="block text-white/70 hover:text-white" onClick={() => setOpen(false)}>
            Producto
          </Link>
          <Link href="/landing-v2/talento" className="block text-white/70 hover:text-white" onClick={() => setOpen(false)}>
            Talento
          </Link>
          <Link href="/landing-v2/integrar" className="block text-white/70 hover:text-white" onClick={() => setOpen(false)}>
            Integrar
          </Link>
          <Link href="/landing-v2#industrias" className="block text-white/70 hover:text-white" onClick={() => setOpen(false)}>
            Precios
          </Link>
          <Link
            href="/register"
            className="block w-full text-center lv2-glow-btn bg-[#3F8697] text-white font-medium px-5 py-2.5 rounded-[10px]"
          >
            Empezar gratis
          </Link>
        </div>
      )}
    </nav>
  );
}
