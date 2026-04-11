'use client';

import { MessageCircle, MapPin, Phone, Mail, Instagram, Facebook, ExternalLink } from 'lucide-react';
import type { TenantPublic, TenantBranding } from '@/lib/api';
import { normalizePhoneForWhatsApp } from '@/lib/property-utils';

interface RealEstateFooterProps {
  tenant: TenantPublic;
  branding?: TenantBranding | null;
  primaryColor: string;
}

export function RealEstateFooter({ tenant, branding, primaryColor }: RealEstateFooterProps) {
  const settings = tenant.settings as any;
  const whatsappNumber = tenant.phone ? normalizePhoneForWhatsApp(tenant.phone) : '';
  const b = branding as any;
  const matricula = settings?.matricula || b?.matricula;
  const colegioProfesional = settings?.colegioProfesional || b?.colegioProfesional;
  const nombreCorredor = settings?.nombreCorredor || b?.nombreCorredor;

  return (
    <footer className="mt-16">
      {/* WhatsApp CTA band */}
      {whatsappNumber && (
        <div className="py-12 text-center relative overflow-hidden" style={{ backgroundColor: primaryColor }}>
          <div className="absolute -top-20 -left-20 w-60 h-60 rounded-full opacity-10 bg-white" />
          <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full opacity-10 bg-white" />
          <div className="relative z-10">
            <p className="text-white/60 text-sm mb-1">¿Tenés alguna consulta?</p>
            <p className="text-white font-bold text-xl md:text-2xl mb-5" style={{ letterSpacing: '-0.01em' }}>
              Estamos para ayudarte
            </p>
            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hola! Quisiera información sobre sus propiedades.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-white rounded-full text-sm font-bold transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              style={{ color: primaryColor }}
            >
              <MessageCircle className="h-5 w-5" />
              Escribinos por WhatsApp
            </a>
          </div>
        </div>
      )}

      {/* Footer grid */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-14">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] mb-5 text-white/40">Contacto</h4>
              <div className="space-y-3.5">
                {tenant.phone && (
                  <a href={`tel:${tenant.phone}`} className="flex items-center gap-2.5 text-sm text-white/65 hover:text-white transition-colors">
                    <Phone className="h-4 w-4 shrink-0 text-white/30" />{tenant.phone}
                  </a>
                )}
                {(tenant as any).email && (
                  <a href={`mailto:${(tenant as any).email}`} className="flex items-center gap-2.5 text-sm text-white/65 hover:text-white transition-colors">
                    <Mail className="h-4 w-4 shrink-0 text-white/30" />{(tenant as any).email}
                  </a>
                )}
                {tenant.instagram && (
                  <a href={`https://instagram.com/${tenant.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-sm text-white/65 hover:text-white transition-colors">
                    <Instagram className="h-4 w-4 shrink-0 text-white/30" />{tenant.instagram}
                  </a>
                )}
                {tenant.facebook && (
                  <a href={tenant.facebook.startsWith('http') ? tenant.facebook : `https://facebook.com/${tenant.facebook}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-sm text-white/65 hover:text-white transition-colors">
                    <Facebook className="h-4 w-4 shrink-0 text-white/30" />Facebook
                  </a>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] mb-5 text-white/40">Oficina</h4>
              <div className="space-y-3.5">
                {tenant.address && (
                  <p className="flex items-start gap-2.5 text-sm text-white/65">
                    <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-white/30" />
                    <span>{tenant.address}{tenant.city ? `, ${tenant.city}` : ''}</span>
                  </p>
                )}
                {nombreCorredor && (
                  <div className="text-sm">
                    <span className="text-white/30 text-[10px] uppercase tracking-[0.1em] block mb-0.5">Corredor</span>
                    <span className="text-white/65">{nombreCorredor}</span>
                  </div>
                )}
                {matricula && (
                  <div className="text-sm">
                    <span className="text-white/30 text-[10px] uppercase tracking-[0.1em] block mb-0.5">Matrícula</span>
                    <span className="text-white/65">{matricula}{colegioProfesional && <span className="text-white/40"> — {colegioProfesional}</span>}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] mb-5 text-white/40">Sobre nosotros</h4>
              <p className="text-sm text-white/65 line-clamp-4 leading-relaxed">
                {tenant.description || `Inmobiliaria con presencia en ${tenant.city || 'Argentina'}. Venta y alquiler de propiedades.`}
              </p>
              {tenant.website && (
                <a href={tenant.website.startsWith('http') ? tenant.website : `https://${tenant.website}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-white/65 hover:text-white transition-colors mt-4">
                  <ExternalLink className="h-3.5 w-3.5" />Sitio web
                </a>
              )}
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-white/25">© {new Date().getFullYear()} {tenant.name}. Todos los derechos reservados.</p>
            <a href="https://turnolink.com.ar" target="_blank" rel="noopener noreferrer" className="text-xs text-white/15 hover:text-white/35 transition-colors">
              Sitio creado con TurnoLink
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
