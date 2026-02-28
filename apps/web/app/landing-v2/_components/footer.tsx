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
            <Link href="/landing-v2" className="flex items-center">
              <Image src="/logo-claro.png" alt="TurnoLink" width={200} height={50} className="h-10 lg:h-12 w-auto" />
            </Link>
            <p className="text-white/40 text-sm mt-3 leading-relaxed tracking-[-0.2px]">
              Plataforma de gesti&oacute;n integral para negocios que venden tiempo o espacio.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-medium text-sm mb-4 tracking-tight">Producto</h4>
            <div className="space-y-2.5">
              <Link href="/landing-v2#plataforma" className="block text-sm text-white/40 hover:text-white/70 transition-colors duration-300">
                C&oacute;mo funciona
              </Link>
              <Link href="/landing-v2#producto" className="block text-sm text-white/40 hover:text-white/70 transition-colors duration-300">
                Producto
              </Link>
              <Link href="/landing-v2#industrias" className="block text-sm text-white/40 hover:text-white/70 transition-colors duration-300">
                Precios
              </Link>
              <Link href="/landing-v2#faq" className="block text-sm text-white/40 hover:text-white/70 transition-colors duration-300">
                Preguntas frecuentes
              </Link>
              <Link href="/landing-v2/talento" className="block text-sm text-white/40 hover:text-white/70 transition-colors duration-300">
                Talento profesional
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
              <Link href="/landing-v2/belleza" className="block text-sm text-white/40 hover:text-white/70 transition-colors duration-300">
                Belleza &amp; Bienestar
              </Link>
              <Link href="/landing-v2/salud" className="block text-sm text-white/40 hover:text-white/70 transition-colors duration-300">
                Salud &amp; Profesionales
              </Link>
              <Link href="/landing-v2/deportes" className="block text-sm text-white/40 hover:text-white/70 transition-colors duration-300">
                Deportes &amp; Recreaci&oacute;n
              </Link>
              <Link href="/landing-v2/hospedaje-por-horas" className="block text-sm text-white/40 hover:text-white/70 transition-colors duration-300">
                Hospedaje por horas
              </Link>
              <Link href="/landing-v2/alquiler-temporario" className="block text-sm text-white/40 hover:text-white/70 transition-colors duration-300">
                Alquiler temporario
              </Link>
              <Link href="/landing-v2/espacios-flexibles" className="block text-sm text-white/40 hover:text-white/70 transition-colors duration-300">
                Espacios flexibles
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
