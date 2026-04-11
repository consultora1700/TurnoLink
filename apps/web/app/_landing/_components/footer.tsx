'use client';

import Image from 'next/image';
import Link from 'next/link';
import { GlassLine } from './ui';

export function Footer() {
  return (
    <footer className="pt-[120px] pb-10 px-5 lg:px-10">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center">
              <Image src="/logo-claro.png" alt="TurnoLink" width={200} height={50} className="h-10 lg:h-12 w-auto" />
            </Link>
            <p className="text-white/40 text-sm mt-3 leading-relaxed tracking-[-0.2px]">
              Plataforma integral para comercios: gestion&aacute; servicios, vend&eacute; productos y control&aacute; las finanzas de tu negocio.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-medium text-sm mb-4 tracking-tight">Producto</h4>
            <div className="space-y-2.5">
              <Link href="/#plataforma" className="block text-sm text-white/40 hover:text-white/70 transition-colors duration-300">
                C&oacute;mo funciona
              </Link>
              <Link href="/mercado" className="block text-sm text-white/40 hover:text-white/70 transition-colors duration-300">
                Mercado
              </Link>
              <Link href="/#pilares" className="block text-sm text-white/40 hover:text-white/70 transition-colors duration-300">
                Finanzas
              </Link>
              <Link href="/#producto" className="block text-sm text-white/40 hover:text-white/70 transition-colors duration-300">
                Producto
              </Link>
              <Link href="/#industrias" className="block text-sm text-white/40 hover:text-white/70 transition-colors duration-300">
                Precios
              </Link>
              <Link href="/#faq" className="block text-sm text-white/40 hover:text-white/70 transition-colors duration-300">
                Preguntas frecuentes
              </Link>
              <Link href="/para/talento" className="block text-sm text-white/40 hover:text-white/70 transition-colors duration-300">
                Talento profesional
              </Link>
              <Link href="/para/integrar" className="block text-sm text-white/40 hover:text-white/70 transition-colors duration-300">
                Widget embebible
              </Link>
              <Link href="/register" className="block text-sm text-white/40 hover:text-white/70 transition-colors duration-300">
                Crear cuenta
              </Link>
            </div>
          </div>

          {/* Industrias */}
          <div>
            <h4 className="text-white font-medium text-sm mb-4 tracking-tight">Industrias</h4>
            <div className="space-y-2.5">
              <Link href="/belleza" className="block text-sm text-white/40 hover:text-white/70 transition-colors duration-300">
                Belleza &amp; Bienestar
              </Link>
              <Link href="/salud" className="block text-sm text-white/40 hover:text-white/70 transition-colors duration-300">
                Salud
              </Link>
              <Link href="/turnos-profesionales" className="block text-sm text-white/40 hover:text-white/70 transition-colors duration-300">
                Profesionales
              </Link>
              <Link href="/deportes" className="block text-sm text-white/40 hover:text-white/70 transition-colors duration-300">
                Deportes &amp; Recreaci&oacute;n
              </Link>
              <Link href="/hospedaje-por-horas" className="block text-sm text-white/40 hover:text-white/70 transition-colors duration-300">
                Hospedaje por horas
              </Link>
              <Link href="/alquiler-temporario" className="block text-sm text-white/40 hover:text-white/70 transition-colors duration-300">
                Alquiler temporario
              </Link>
              <Link href="/espacios-flexibles" className="block text-sm text-white/40 hover:text-white/70 transition-colors duration-300">
                Espacios flexibles
              </Link>
              <Link href="/mercado" className="block text-sm text-white/40 hover:text-white/70 transition-colors duration-300">
                Mercado
              </Link>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-medium text-sm mb-4 tracking-tight">Legal</h4>
            <div className="space-y-2.5">
              <Link href="/terminos" className="block text-sm text-white/40 hover:text-white/70 transition-colors duration-300">
                T&eacute;rminos y condiciones
              </Link>
              <Link href="/privacidad" className="block text-sm text-white/40 hover:text-white/70 transition-colors duration-300">
                Pol&iacute;tica de privacidad
              </Link>
            </div>
          </div>
        </div>

        <GlassLine />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/20 mt-6">
          <span>&copy; {new Date().getFullYear()} TurnoLink. Todos los derechos reservados.</span>
          <span>Hecho en Argentina</span>
        </div>
      </div>
    </footer>
  );
}
