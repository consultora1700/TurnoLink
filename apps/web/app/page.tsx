'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LanguageSelector } from '@/components/ui/language-selector';
import { LandingThemeWrapper, LandingThemeToggle } from '@/components/landing/landing-theme-wrapper';
import { useTranslation } from '@/lib/i18n';
import {
  Calendar,
  Smartphone,
  Zap,
  CheckCircle2,
  ArrowRight,
  Star,
  ChevronDown,
  Shield,
  ArrowUp,
  Menu,
  X,
  Play,
} from 'lucide-react';
import { FloatingParticles } from '@/components/landing/floating-particles';
import { HeroMockups } from '@/components/landing/hero-mockups';
import { DeviceMockup } from '@/components/landing/device-mockup';
import Image from 'next/image';
import { FeaturesCarousel, FeaturesGrid } from '@/components/landing/features-carousel';
import { MobileJourneySection } from '@/components/landing/mobile-journey-section';
import { PricingSection } from '@/components/landing/pricing-section';
import { ProblemSolutionSection } from '@/components/landing/problem-solution-section';
import { LoginModal } from '@/components/landing/login-modal';

export default function HomePage() {
  const { t } = useTranslation();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  // Scroll reveal animation with Intersection Observer
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Don't unobserve to allow re-animation if needed
        }
      });
    }, observerOptions);

    // Observe all reveal elements
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .list-item-reveal').forEach(el => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const faqs = [
    {
      question: '¿Hay un plan gratuito o solo prueba gratis?',
      answer: 'Las dos cosas. Tenemos un plan Gratis para siempre con hasta 30 turnos/mes, 2 empleados y confirmaciones por email. Además, los planes Profesional y Negocio incluyen 14 días de prueba gratis sin tarjeta de crédito. Si no elegís un plan pago, tu cuenta pasa automáticamente al plan Gratis sin perder tus datos.'
    },
    {
      question: '¿Cómo cobro señas a mis clientes con Mercado Pago?',
      answer: 'Desde el panel, conectás tu cuenta de Mercado Pago de forma segura con verificación en dos pasos. Después configurás el porcentaje de seña que querés cobrar (por ejemplo, 30%) y listo: cuando un cliente reserva, recibe un link de pago y el dinero va directo a tu cuenta. Sin comisiones extra de TurnoLink.'
    },
    {
      question: '¿Mis clientes necesitan descargarse una app o crear una cuenta?',
      answer: 'No. Tus clientes reservan desde tu página personalizada (tunegocio.turnolink.app) sin registrarse ni instalar nada. Eligen servicio, día y horario, dejan sus datos y listo. Reciben confirmación automática por email y recordatorios antes del turno.'
    },
    {
      question: '¿Qué pasa si supero los límites de mi plan?',
      answer: 'Te avisamos cuando estés por llegar al límite. Si lo alcanzás, no se pierden datos ni se cancelan turnos existentes, simplemente no se aceptan nuevas reservas hasta el próximo mes. Podés subir de plan en cualquier momento y el cambio es inmediato.'
    },
    {
      question: '¿Puedo gestionar varias sucursales?',
      answer: 'Sí. Con el plan Negocio podés administrar hasta 5 sucursales, cada una con sus propios empleados, servicios, horarios y configuración. Tus clientes eligen la sucursal al reservar. Los planes Gratis y Profesional incluyen 1 sucursal.'
    },
    {
      question: '¿Puedo cancelar en cualquier momento?',
      answer: 'Sí, sin contratos ni permanencia mínima. Cancelás cuando quieras desde tu panel. Además tenés una garantía de devolución de 30 días: si no te convence, te devolvemos el dinero sin preguntas. Los precios incluyen IVA, sin costos ocultos.'
    },
    {
      question: '¿Cuánto tardo en tener todo funcionando?',
      answer: 'Menos de 5 minutos. Creás tu cuenta, cargás tus servicios y horarios, y ya tenés tu página de reservas lista para compartir con tus clientes. Si necesitás ayuda, tenemos soporte en español por email y WhatsApp según tu plan.'
    },
  ];

  return (
    <LandingThemeWrapper>
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 bg-gradient-radial pointer-events-none" />
      <FloatingParticles />

      {/* Header */}
      <header className={`relative z-50 border-b sticky top-0 ${mobileMenuOpen ? 'bg-background' : 'bg-background/80 backdrop-blur-lg'}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between h-20 md:h-28">
            <div className="flex items-center gap-2">
              <img
                src="/claro2.png"
                alt="TurnoLink"
                className="h-20 md:h-28 w-auto dark:hidden"
              />
              <img
                src="/oscuro2.png"
                alt="TurnoLink"
                className="h-20 md:h-28 w-auto hidden dark:block"
              />
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="nav-link text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Características
              </a>
              <a href="#pricing" className="nav-link text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Precios
              </a>
              <Link href="/explorar-talento" className="nav-link text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Talento
              </Link>
              <a href="#faq" className="nav-link text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                FAQ
              </a>
            </div>

            <div className="flex items-center gap-2">
              <LandingThemeToggle />
              <LanguageSelector variant="minimal" className="hidden sm:block" />
              <Button
                variant="ghost"
                className="hidden sm:block"
                onClick={() => setLoginModalOpen(true)}
              >
                Iniciar Sesión
              </Button>
              <Link href="/register" className="hidden sm:block">
                <Button className="cta-button bg-gradient-primary hover:opacity-90 shadow-glow-sm">
                  Empezar Gratis
                </Button>
              </Link>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Menú"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </nav>

          {/* Mobile Menu Overlay + Menu */}
          {mobileMenuOpen && (
            <>
              {/* Backdrop overlay with blur */}
              <div
                className="md:hidden fixed inset-0 top-20 bg-black/40 backdrop-blur-sm z-40 animate-fade-in"
                onClick={closeMobileMenu}
                aria-hidden="true"
              />
              {/* Menu panel */}
              <div className="md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-md border-b shadow-2xl animate-fade-in z-50">
                <div className="container mx-auto px-4 py-4 space-y-4">
                  <a
                    href="#features"
                    className="block py-3 text-base font-medium hover:text-brand-600 transition-colors"
                    onClick={closeMobileMenu}
                  >
                    Características
                  </a>
                  <a
                    href="#pricing"
                    className="block py-3 text-base font-medium hover:text-brand-600 transition-colors"
                    onClick={closeMobileMenu}
                  >
                    Precios
                  </a>
                  <Link
                    href="/explorar-talento"
                    className="block py-3 text-base font-medium hover:text-brand-600 transition-colors"
                    onClick={closeMobileMenu}
                  >
                    Talento
                  </Link>
                  <a
                    href="#faq"
                    className="block py-3 text-base font-medium hover:text-brand-600 transition-colors"
                    onClick={closeMobileMenu}
                  >
                    FAQ
                  </a>
                  <div className="pt-4 border-t space-y-2">
                    <Button
                      variant="outline"
                      className="w-full h-12"
                      onClick={() => {
                        closeMobileMenu();
                        setLoginModalOpen(true);
                      }}
                    >
                      Iniciar Sesión
                    </Button>
                    <Link href="/register" className="block">
                      <Button className="w-full h-12 bg-gradient-primary">Empezar Gratis</Button>
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Hero Section - Simplified */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            {/* Headline - Shorter, punchier */}
            <h1 className="hero-title text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              Tu agenda llena,{' '}
              <span className="text-shimmer">sin contestar el teléfono</span>
            </h1>

            {/* Subheadline - Concise */}
            <p className="hero-subtitle text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Sistema de reservas online para barberías, spas y consultorios.
              Tus clientes reservan 24/7, tú te enfocas en atenderlos.
            </p>

            {/* Single Primary CTA */}
            <div className="hero-cta flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/register">
                <Button size="lg" className="btn-shine cta-button w-full sm:w-auto bg-gradient-primary hover:opacity-90 shadow-glow pulse-glow text-lg px-8 h-14">
                  Comienza gratis ahora
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/bella-estetica" className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full border border-border bg-background/80 backdrop-blur-sm text-foreground hover:bg-muted hover:border-foreground/20 hover:shadow-md transition-all duration-300 group">
                <Play className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-sm font-semibold">Ver tienda de ejemplo</span>
              </Link>
            </div>

            {/* Minimal Trust Indicators */}
            <p className="hero-trust text-sm text-muted-foreground">
              Sin tarjeta de crédito • Configuración en 5 minutos • Soporte en español
            </p>
          </div>

          {/* Hero Mockups */}
          <div className="hero-mockup">
            <HeroMockups />
          </div>
        </div>
      </section>

      {/* Problem → Solution Section */}
      <ProblemSolutionSection />

      {/* Features Section - With Custom Icons & Mobile Carousel */}
      <section id="features" className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="section-badge inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 dark:bg-brand-950/30 border border-brand-100 dark:border-brand-800 mb-6 float-medium">
              <Zap className="h-4 w-4 text-brand-600 dark:text-brand-400 icon-hover-spin" />
              <span className="text-sm font-medium text-brand-700 dark:text-brand-300">Todo lo que necesitas</span>
            </div>
            <h2 className="section-title text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Funcionalidades que <span className="text-shimmer">hacen la diferencia</span>
            </h2>
            <p className="section-description text-lg text-muted-foreground">
              Herramientas profesionales para gestionar tu negocio de forma simple.
            </p>
          </div>

          {/* Mobile: Carousel */}
          <div className="md:hidden">
            <FeaturesCarousel />
          </div>

          {/* Desktop: Grid */}
          <div className="hidden md:block">
            <FeaturesGrid />
          </div>
        </div>
      </section>

      {/* Mobile Experience Section - Journey Timeline */}
      <MobileJourneySection />

      {/* Testimonials - Improved */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="section-title text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Lo que dicen <span className="text-shimmer">nuestros clientes</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="testimonial-animate">
              <TestimonialCard
                quote="Antes perdía horas atendiendo el teléfono. Ahora todo es automático y puedo enfocarme en mis clientes."
                author="Carlos Méndez"
                role="Barbería Los Capos"
                rating={5}
              />
            </div>
            <div className="testimonial-animate">
              <TestimonialCard
                quote="Mis clientas aman poder reservar desde el celular a cualquier hora. Las cancelaciones bajaron un montón."
                author="Lucía Fernández"
                role="Spa Zen Beauty"
                rating={5}
              />
            </div>
            <div className="testimonial-animate">
              <TestimonialCard
                quote="La integración con Mercado Pago me salvó. Ahora cobro seña y los clientes no faltan."
                author="Dr. Roberto García"
                role="Consultorio Médico"
                rating={5}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing - 3 Plans */}
      <PricingSection />

      {/* FAQ Section - New */}
      <section id="faq" className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="section-title text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                Preguntas <span className="text-shimmer">frecuentes</span>
              </h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="faq-animate bg-card rounded-xl border overflow-hidden transition-shadow hover:shadow-md"
                >
                  <button
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  >
                    <span className="font-semibold pr-4">{faq.question}</span>
                    <ChevronDown className={`h-5 w-5 flex-shrink-0 text-muted-foreground transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`} />
                  </button>
                  <div className={`faq-content ${openFaq === index ? 'open' : ''}`}>
                    <div>
                      <div className="px-6 pb-4 text-muted-foreground">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto cta-section-animate">
            <div className="relative rounded-3xl bg-gradient-primary p-10 md:p-16 text-center text-white overflow-hidden">
              {/* Background decoration */}
              <div className="absolute inset-0 cta-bg-pattern bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />

              <div className="relative">
                <h2 className="animate-blur-in text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
                  ¿Listo para automatizar tu agenda?
                </h2>
                <p className="animate-on-scroll text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-8">
                  Empieza gratis hoy y descubre por qué cientos de negocios ya usan TurnoLink.
                </p>
                <Link href="/register">
                  <Button size="lg" variant="secondary" className="btn-shine cta-button text-lg px-8 h-14 bg-white text-brand-700 hover:bg-white/90 shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                    Comienza gratis ahora
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Minimal & Professional */}
      <footer className="border-t bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile Footer */}
          <div className="md:hidden py-8">
            <div className="flex flex-col items-center space-y-6">
              {/* Logo */}
              <img
                src="/claro2.png"
                alt="TurnoLink"
                className="h-8 w-auto dark:hidden"
              />
              <img
                src="/oscuro2.png"
                alt="TurnoLink"
                className="h-8 w-auto hidden dark:block"
              />

              {/* Quick Links - Pill style */}
              <div className="flex flex-wrap justify-center gap-2">
                <a href="#features" className="px-4 py-1.5 rounded-full bg-muted/60 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
                  Características
                </a>
                <a href="#pricing" className="px-4 py-1.5 rounded-full bg-muted/60 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
                  Precios
                </a>
                <Link href="/explorar-talento" className="px-4 py-1.5 rounded-full bg-muted/60 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
                  Talento
                </Link>
                <Link href="/bella-estetica" className="px-4 py-1.5 rounded-full bg-muted/60 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
                  Tienda de ejemplo
                </Link>
              </div>

              {/* Divider */}
              <div className="w-12 h-px bg-border" />

              {/* Legal + Language in one row */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <a href="#" className="hover:text-foreground transition-colors">Privacidad</a>
                <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                <a href="#" className="hover:text-foreground transition-colors">Términos</a>
                <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                <LanguageSelector variant="minimal" />
              </div>

              {/* Copyright */}
              <p className="text-[11px] text-muted-foreground/60">
                © {new Date().getFullYear()} TurnoLink · Argentina
              </p>
            </div>
          </div>

          {/* Desktop Footer */}
          <div className="hidden md:block py-8">
            <div className="flex items-center justify-between">
              {/* Left: Logo + tagline */}
              <div className="flex items-center gap-3">
                <img
                  src="/claro2.png"
                  alt="TurnoLink"
                  className="h-10 w-auto dark:hidden"
                />
                <img
                  src="/oscuro2.png"
                  alt="TurnoLink"
                  className="h-10 w-auto hidden dark:block"
                />
                <div className="h-6 w-px bg-border" />
                <span className="text-sm text-muted-foreground">Turnos online</span>
              </div>

              {/* Center: Links */}
              <nav className="flex items-center gap-6 text-sm">
                <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Características</a>
                <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Precios</a>
                <Link href="/explorar-talento" className="text-muted-foreground hover:text-foreground transition-colors">Talento</Link>
                <Link href="/bella-estetica" className="text-muted-foreground hover:text-foreground transition-colors">Tienda de ejemplo</Link>
              </nav>

              {/* Right: Legal + Language */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <a href="#" className="hover:text-foreground transition-colors">Privacidad</a>
                <a href="#" className="hover:text-foreground transition-colors">Términos</a>
                <LanguageSelector variant="minimal" />
              </div>
            </div>

            {/* Bottom line */}
            <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
              <p>© {new Date().getFullYear()} TurnoLink. Todos los derechos reservados.</p>
              <p className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Operando desde Argentina
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* WhatsApp Floating Button */}
      <a
        href="https://wa.me/5491112345678?text=Hola!%20Tengo%20una%20consulta%20sobre%20TurnoLink"
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-button fixed bottom-6 left-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full bg-[#25D366] text-white hover:scale-105 transition-transform duration-300"
        aria-label="Contactar por WhatsApp"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        <span className="text-sm font-medium hidden sm:inline">¿Dudas? Escríbenos</span>
      </a>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 z-50 p-3 rounded-full bg-gradient-primary text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        aria-label="Volver arriba"
      >
        <ArrowUp className="h-5 w-5" />
      </button>

      {/* Login Modal */}
      <LoginModal open={loginModalOpen} onOpenChange={setLoginModalOpen} />
    </div>
    </LandingThemeWrapper>
  );
}

// Pantallas del carrusel mobile - Flujo de reserva completo
// Cache busting: v=20260127 para forzar recarga de imágenes actualizadas
const mobileCarouselScreens = [
  { id: 'portada', label: 'Portada', src: '/mockups/flow-01-portada.webp?v=20260127' },
  { id: 'servicios', label: 'Servicios', src: '/mockups/flow-02-servicios.webp?v=20260127' },
  { id: 'detalle', label: 'Detalle', src: '/mockups/flow-03-detalle.webp?v=20260127' },
  { id: 'calendario', label: 'Fecha', src: '/mockups/flow-04-calendario.webp?v=20260127' },
  { id: 'horarios', label: 'Horarios', src: '/mockups/flow-05-horarios.webp?v=20260127' },
  { id: 'formulario', label: 'Datos', src: '/mockups/flow-06-formulario.webp?v=20260127' },
  { id: 'confirmacion', label: 'Confirmar', src: '/mockups/flow-07-confirmacion.webp?v=20260127' },
];

// Componente iPhone con carrusel - Flujo de reserva
function ThemeAwareIPhone() {
  const [activeScreen, setActiveScreen] = useState(0);

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveScreen((prev) => (prev + 1) % mobileCarouselScreens.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center w-full">
      {/* iPhone mockup centrado - tamaño grande para visibilidad */}
      <div className="mx-auto">
        <DeviceMockup device="iphone" animate className="!w-[280px] sm:!w-[300px] md:!w-[320px] lg:!w-[340px]">
          <div className="w-full h-full relative overflow-hidden">
            {mobileCarouselScreens.map((screen, index) => (
              <div
                key={screen.id}
                className={`absolute inset-0 transition-all duration-500 ease-out ${
                  index === activeScreen
                    ? 'opacity-100 scale-100'
                    : 'opacity-0 scale-95'
                }`}
              >
                <Image
                  src={screen.src}
                  alt={`TurnoLink ${screen.label} Mobile`}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 640px) 260px, 280px"
                  priority={index === 0}
                />
              </div>
            ))}
          </div>
        </DeviceMockup>
      </div>

      {/* Indicador de paso actual */}
      <div className="mt-4 text-center">
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-600 text-white text-sm font-medium shadow-lg">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          {mobileCarouselScreens[activeScreen].label}
        </span>
      </div>

      {/* Indicadores de puntos - mobile friendly */}
      <div className="flex items-center justify-center gap-1.5 mt-3">
        {mobileCarouselScreens.map((screen, index) => (
          <button
            key={screen.id}
            onClick={() => setActiveScreen(index)}
            className={`transition-all duration-300 rounded-full ${
              index === activeScreen
                ? 'w-6 h-2 bg-gradient-to-r from-teal-500 to-cyan-600'
                : 'w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
            }`}
            aria-label={screen.label}
          />
        ))}
      </div>
    </div>
  );
}

function TestimonialCard({
  quote,
  author,
  role,
  rating,
}: {
  quote: string;
  author: string;
  role: string;
  rating: number;
}) {
  return (
    <div className="testimonial-card relative bg-card rounded-2xl border p-6 h-full hover:shadow-lg hover:border-brand-200 dark:hover:border-brand-800">
      {/* Decorative quote mark */}
      <div className="quote-mark absolute top-4 right-4 text-6xl font-serif text-brand-500 leading-none select-none">
        "
      </div>
      <div className="relative">
        <div className="flex gap-1 mb-4">
          {Array.from({ length: rating }).map((_, i) => (
            <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
          ))}
        </div>
        <p className="text-base mb-6 leading-relaxed">&ldquo;{quote}&rdquo;</p>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
            {author.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <p className="font-semibold text-sm">{author}</p>
            <p className="text-xs text-muted-foreground">{role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
