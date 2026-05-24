'use client';

import Image from 'next/image';
import Link from 'next/link';
import { GlassLine } from './ui';

export function Footer() {
  return (
    <footer className="pt-[120px] pb-10 px-5 lg:px-10">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center">
              <Image src="/logo-claro.png" alt="TurnoLink" width={200} height={50} className="h-10 lg:h-12 w-auto" />
            </Link>
            <p className="text-white/40 text-sm mt-3 leading-relaxed tracking-[-0.2px]">
              Plataforma de gestión de turnos y servicios para negocios que quieren crecer con menos esfuerzo.
            </p>
          </div>

          {/* Producto */}
          <div>
            <h4 className="text-white font-medium text-sm mb-4 tracking-tight">Producto</h4>
            <div className="space-y-2.5">
              <Link href="/#funcionalidades" className="block text-sm text-white/40 hover:text-white/70 transition-colors duration-300">
                Funcionalidades
              </Link>
              <Link href="/#como-funciona" className="block text-sm text-white/40 hover:text-white/70 transition-colors duration-300">
                Cómo funciona
              </Link>
              <Link href="/#precios" className="block text-sm text-white/40 hover:text-white/70 transition-colors duration-300">
                Precios
              </Link>
              <Link href="/#faq" className="block text-sm text-white/40 hover:text-white/70 transition-colors duration-300">
                Preguntas frecuentes
              </Link>
            </div>
          </div>

          {/* Cuenta */}
          <div>
            <h4 className="text-white font-medium text-sm mb-4 tracking-tight">Cuenta</h4>
            <div className="space-y-2.5">
              <Link href="/register" className="block text-sm text-white/40 hover:text-white/70 transition-colors duration-300">
                Crear cuenta
              </Link>
              <Link href="/para/talento" className="block text-sm text-white/40 hover:text-white/70 transition-colors duration-300">
                Talento profesional
              </Link>
              <Link href="/integrar" className="block text-sm text-white/40 hover:text-white/70 transition-colors duration-300">
                Widget embebible
              </Link>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-medium text-sm mb-4 tracking-tight">Legal</h4>
            <div className="space-y-2.5">
              <Link href="/terminos" className="block text-sm text-white/40 hover:text-white/70 transition-colors duration-300">
                Términos y condiciones
              </Link>
              <Link href="/privacidad" className="block text-sm text-white/40 hover:text-white/70 transition-colors duration-300">
                Privacidad
              </Link>
            </div>
          </div>
        </div>

        <GlassLine />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8">
          <p className="text-white/20 text-xs tracking-tight">
            &copy; {new Date().getFullYear()} TurnoLink. Todos los derechos reservados.
          </p>
          <p className="text-white/20 text-xs tracking-tight">
            Hecho con dedicación en Argentina.
          </p>
        </div>
      </div>
    </footer>
  );
}
