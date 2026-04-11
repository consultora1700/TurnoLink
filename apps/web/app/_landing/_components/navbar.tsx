'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { LoginModal } from '@/components/landing/login-modal';

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

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
        <Link href="/" className="flex items-center">
          <Image src="/logo-claro.png" alt="TurnoLink" width={240} height={60} className="h-12 lg:h-[60px] w-auto" priority />
        </Link>

        <div className="hidden lg:flex items-center gap-8">
          <Link href="/#plataforma" className="text-sm text-white/60 hover:text-white transition-colors duration-300">
            Plataforma
          </Link>
          <Link href="/mercado" className="text-sm text-white/60 hover:text-white transition-colors duration-300">
            Mercado
          </Link>
          <Link href="/#pilares" className="text-sm text-white/60 hover:text-white transition-colors duration-300">
            Finanzas
          </Link>
          <Link href="/#industrias" className="text-sm text-white/60 hover:text-white transition-colors duration-300">
            Industrias
          </Link>
          <Link href="/para/talento" className="text-sm text-white/60 hover:text-white transition-colors duration-300">
            Talento
          </Link>
          <Link href="/#industrias" className="text-sm text-white/60 hover:text-white transition-colors duration-300">
            Precios
          </Link>
          <button
            onClick={() => setLoginOpen(true)}
            className="text-sm text-white/60 hover:text-white transition-colors duration-300"
          >
            Iniciar sesión
          </button>
          <Link
            href="/register"
            className="lv2-glow-btn bg-[#3F8697] text-white text-sm font-medium px-5 py-2.5 rounded-[10px]"
          >
            Empezar gratis
          </Link>
        </div>

        <button onClick={() => setOpen(!open)} className="lg:hidden text-white p-2" aria-label="Menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Backdrop overlay */}
      <div
        className={`lg:hidden fixed inset-0 top-[70px] bg-black/60 backdrop-blur-sm z-[-1] transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setOpen(false)}
      />

      {/* Mobile menu panel */}
      <div
        className={`lg:hidden lv2-nav-blur border-t border-white/[0.06] overflow-hidden transition-all duration-300 ease-out ${
          open ? 'max-h-[500px] opacity-100 py-6' : 'max-h-0 opacity-0 py-0'
        } px-5 space-y-4`}
      >
        <Link href="/#plataforma" className="block text-white/70 hover:text-white transition-colors" onClick={() => setOpen(false)}>
          Plataforma
        </Link>
        <Link href="/mercado" className="block text-white/70 hover:text-white transition-colors" onClick={() => setOpen(false)}>
          Mercado
        </Link>
        <Link href="/#pilares" className="block text-white/70 hover:text-white transition-colors" onClick={() => setOpen(false)}>
          Finanzas
        </Link>
        <Link href="/#industrias" className="block text-white/70 hover:text-white transition-colors" onClick={() => setOpen(false)}>
          Industrias
        </Link>
        <Link href="/para/talento" className="block text-white/70 hover:text-white transition-colors" onClick={() => setOpen(false)}>
          Talento
        </Link>
        <Link href="/#industrias" className="block text-white/70 hover:text-white transition-colors" onClick={() => setOpen(false)}>
          Precios
        </Link>
        <button
          onClick={() => { setLoginOpen(true); setOpen(false); }}
          className="block w-full text-center text-white/70 hover:text-white font-medium px-5 py-2.5 rounded-[10px] border border-white/20"
        >
          Iniciar sesión
        </button>
        <Link
          href="/register"
          className="block w-full text-center lv2-glow-btn bg-[#3F8697] text-white font-medium px-5 py-2.5 rounded-[10px]"
        >
          Empezar gratis
        </Link>
      </div>

      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
    </nav>
  );
}
