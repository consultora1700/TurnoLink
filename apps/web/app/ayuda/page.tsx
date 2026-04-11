'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  Search,
  HelpCircle,
  MessageSquare,
  Mail,
  Phone,
  Clock,
  ChevronDown,
  Calendar,
  Users,
  CreditCard,
  Settings,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Headphones,
  Send,
  X,
  Menu,
  Home,
  ArrowUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { LandingThemeWrapper, LandingThemeToggle } from '@/components/landing/landing-theme-wrapper';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

interface Category {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
}

const CATEGORIES: Category[] = [
  {
    id: 'getting-started',
    name: 'Primeros pasos',
    icon: Zap,
    description: 'Configurar tu cuenta, instalar la app y empezar a usar TurnoLink',
  },
  {
    id: 'turnos',
    name: 'Gestion de turnos',
    icon: Calendar,
    description: 'Reservas, cancelaciones, recordatorios y horarios',
  },
  {
    id: 'clientes',
    name: 'Clientes',
    icon: Users,
    description: 'Administrar tu base de clientes y su historial',
  },
  {
    id: 'pagos',
    name: 'Pagos y suscripcion',
    icon: CreditCard,
    description: 'Tu plan, facturacion y cobros con Mercado Pago',
  },
  {
    id: 'configuracion',
    name: 'Configuracion',
    icon: Settings,
    description: 'Personalizar tu negocio, horarios y notificaciones',
  },
  {
    id: 'seguridad',
    name: 'Seguridad',
    icon: Shield,
    description: 'Proteger tu cuenta y los datos de tus clientes',
  },
];

const FAQ_ITEMS: FAQItem[] = [
  // Getting started
  {
    category: 'getting-started',
    question: '¿Como instalo TurnoLink en mi celular?',
    answer: 'TurnoLink se instala como una app desde el navegador, sin tienda de apps. En Android: abri turnolink.com.ar en Chrome, toca el menu (tres puntos) y selecciona "Instalar aplicacion". En iPhone: abri turnolink.com.ar en Safari, toca el boton de compartir y luego "Agregar a pantalla de inicio". Una vez instalada, abri la app e inicia sesion.',
  },
  {
    category: 'getting-started',
    question: '¿Como activo las notificaciones para saber cuando un cliente reserva?',
    answer: 'Despues de instalar la app en tu celular, abri TurnoLink y vas a ver un banner que dice "Activar notificaciones". Toca "Activar" y permite las notificaciones cuando el sistema te lo pida. A partir de ese momento, cada vez que un cliente reserve un turno, vas a recibir una notificacion push con el nombre del cliente, el servicio y la fecha.',
  },
  {
    category: 'getting-started',
    question: '¿Como creo mi primera sucursal?',
    answer: 'Anda a Dashboard > Sucursales > Nueva Sucursal. Completa los datos basicos como nombre, direccion y horarios de atencion. Una vez creada, vas a poder agregar empleados y servicios. Tambien podes configurar fotos, descripcion y redes sociales.',
  },
  {
    category: 'getting-started',
    question: '¿Como agrego empleados a mi negocio?',
    answer: 'Desde el Dashboard, anda a Empleados > Nuevo Empleado. Podes asignarles servicios especificos, definir sus horarios de trabajo y permisos de acceso. Cada empleado puede tener su propio calendario.',
  },
  {
    category: 'getting-started',
    question: '¿Como configuro mis servicios y precios?',
    answer: 'Anda a Servicios > Nuevo Servicio. Define el nombre, duracion, precio y asigna que empleados pueden realizarlo. Podes crear categorias para organizar mejor tus servicios.',
  },
  // Turnos
  {
    category: 'turnos',
    question: '¿Como puedo cancelar un turno?',
    answer: 'Anda a Turnos, busca la reserva que queres cancelar y hace clic en "Cancelar". Podes elegir notificar al cliente automaticamente por email o WhatsApp. El sistema guarda un registro del motivo de cancelacion.',
  },
  {
    category: 'turnos',
    question: '¿Puedo bloquear horarios especificos?',
    answer: 'Si, desde Horarios podes marcar bloques de tiempo como no disponibles. Esto es util para almuerzos, reuniones o cualquier momento que no quieras recibir reservas. Tambien podes crear bloqueos recurrentes.',
  },
  {
    category: 'turnos',
    question: '¿Como funcionan los recordatorios automaticos?',
    answer: 'TurnoLink envia recordatorios automaticos a tus clientes 24 horas y 2 horas antes de su turno. Los recordatorios se envian por WhatsApp y reducen significativamente las ausencias.',
  },
  {
    category: 'turnos',
    question: '¿Que pasa si supero el limite de turnos de mi plan?',
    answer: 'Te avisamos cuando estes cerca del limite. Si lo superas, no vas a poder recibir nuevas reservas hasta el proximo mes, pero las existentes se mantienen. Podes subir de plan en cualquier momento para obtener mas capacidad.',
  },
  // Pagos
  {
    category: 'pagos',
    question: '¿Que planes tiene TurnoLink?',
    answer: 'TurnoLink ofrece planes adaptados a cada tipo de negocio (belleza, salud, deportes, hospedaje, alquiler, espacios). Cada industria tiene entre 2 y 3 niveles de plan con distintos limites y funcionalidades. Podes ver todos los detalles en la pagina de Precios.',
  },
  {
    category: 'pagos',
    question: '¿Que metodos de pago aceptan?',
    answer: 'Aceptamos todas las tarjetas de credito y debito a traves de Mercado Pago. Tambien podes pagar con dinero en cuenta de Mercado Pago. Todos los pagos son procesados de forma segura.',
  },
  {
    category: 'pagos',
    question: '¿Puedo cambiar mi plan?',
    answer: 'Si, podes cambiar de plan en cualquier momento desde Mi Suscripcion. Si pasas a un plan superior, se prorratea el precio. Si bajas de plan, el cambio se aplica en tu proximo ciclo de facturacion.',
  },
  {
    category: 'pagos',
    question: '¿Como funcionan los cobros con Mercado Pago a mis clientes?',
    answer: 'Conectas tu cuenta de Mercado Pago en la configuracion y listo. Podes cobrar senas del porcentaje que quieras cuando el cliente reserva. El dinero va directo a tu cuenta. Esta funcion esta disponible en los planes que incluyen "Cobros MercadoPago".',
  },
  {
    category: 'pagos',
    question: '¿Como funciona la garantia de 30 dias?',
    answer: 'Si no estas satisfecho durante los primeros 30 dias despues de tu primer pago, te devolvemos el 100% de tu dinero. Sin preguntas ni complicaciones. Solo contactanos por WhatsApp o email.',
  },
  // Clientes
  {
    category: 'clientes',
    question: '¿Como importo mis clientes existentes?',
    answer: 'Podes importar clientes desde un archivo CSV o Excel. Anda a Clientes > Importar y segui las instrucciones. El formato debe incluir nombre, telefono y email. El sistema detecta duplicados automaticamente.',
  },
  {
    category: 'clientes',
    question: '¿Como veo el historial de un cliente?',
    answer: 'Hace clic en cualquier cliente para ver su perfil completo con historial de turnos, servicios favoritos, notas y estadisticas de asistencia. Podes agregar etiquetas y notas privadas.',
  },
  // Configuracion
  {
    category: 'configuracion',
    question: '¿Como personalizo mi pagina de reservas publica?',
    answer: 'Desde Configuracion > Pagina Publica podes cambiar colores, logo, descripcion y otros elementos. Tu pagina estara disponible en una URL personalizada que podes compartir con tus clientes.',
  },
  {
    category: 'configuracion',
    question: '¿Puedo integrar TurnoLink con WhatsApp?',
    answer: 'Si, TurnoLink envia notificaciones automaticas por WhatsApp a tus clientes. Incluye confirmaciones de reserva, recordatorios y notificaciones de cambios. Los recordatorios por WhatsApp estan incluidos en todos los planes sin costo adicional.',
  },
  {
    category: 'configuracion',
    question: '¿Como configuro mis dias festivos o vacaciones?',
    answer: 'Anda a Configuracion > Horarios Especiales y agrega las fechas en las que tu negocio va a estar cerrado. Podes configurar cierres parciales o totales, y el sistema bloquea automaticamente las reservas para esos dias.',
  },
  // Seguridad
  {
    category: 'seguridad',
    question: '¿Mis datos estan seguros?',
    answer: 'Si, utilizamos encriptacion SSL/TLS para todas las comunicaciones. Tus datos se almacenan de forma segura en servidores certificados y nunca compartimos informacion con terceros sin tu consentimiento.',
  },
];

export default function AyudaPage() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedFAQs, setExpandedFAQs] = useState<Set<number>>(new Set());
  const [feedbackGiven, setFeedbackGiven] = useState<Set<number>>(new Set());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleFAQ = (index: number) => {
    const next = new Set(expandedFAQs);
    if (next.has(index)) { next.delete(index); } else { next.add(index); }
    setExpandedFAQs(next);
  };

  const handleFeedback = (index: number) => {
    setFeedbackGiven(prev => new Set(prev).add(index));
  };

  const filteredFAQs = useMemo(() => {
    return FAQ_ITEMS.filter((faq) => {
      const matchesSearch =
        searchQuery === '' ||
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || faq.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <LandingThemeWrapper>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center gap-2">
                <img src="/claro2.png" alt="TurnoLink" className="h-10 sm:h-12 w-auto dark:hidden" />
                <img src="/oscuro2.png" alt="TurnoLink" className="h-10 sm:h-12 w-auto hidden dark:block" />
              </Link>

              <div className="hidden md:flex items-center gap-3">
                <LandingThemeToggle />
                {session ? (
                  <Link href="/dashboard">
                    <Button variant="outline" size="sm">
                      <Home className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/login">
                      <Button variant="ghost" size="sm">Iniciar Sesion</Button>
                    </Link>
                    <Link href="/register">
                      <Button size="sm" className="bg-gradient-primary">Registrarse</Button>
                    </Link>
                  </>
                )}
              </div>

              <div className="flex md:hidden items-center gap-2">
                <LandingThemeToggle />
                <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </div>
            </nav>

            {mobileMenuOpen && (
              <div className="md:hidden py-4 border-t">
                <div className="flex flex-col gap-2">
                  {session ? (
                    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full justify-start">
                        <Home className="h-4 w-4 mr-2" />
                        Ir al Dashboard
                      </Button>
                    </Link>
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="outline" className="w-full">Iniciar Sesion</Button>
                      </Link>
                      <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full bg-gradient-primary">Registrarse</Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative py-12 sm:py-16 md:py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-50 to-background dark:from-brand-950/30 dark:to-background" />

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="max-w-3xl mx-auto text-center">
              <Badge className="mb-4 bg-brand-100 text-brand-700 border-brand-200 dark:bg-brand-900/50 dark:text-brand-300 dark:border-brand-700">
                <HelpCircle className="h-3 w-3 mr-1" />
                Centro de Ayuda
              </Badge>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
                ¿Como podemos{' '}
                <span className="text-gradient bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent">
                  ayudarte?
                </span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground mb-8 px-4">
                Encontra respuestas rapidas y guias paso a paso para aprovechar TurnoLink al maximo.
              </p>

              {/* Search */}
              <div className="relative max-w-xl mx-auto group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-brand-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Buscar en la ayuda..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 sm:h-14 pl-12 pr-4 rounded-xl border-2 border-border bg-background text-base sm:text-lg focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
                  aria-label="Buscar en el centro de ayuda"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              {/* Popular searches */}
              <div className="flex flex-wrap justify-center gap-2 mt-4 px-4">
                <span className="text-sm text-muted-foreground">Populares:</span>
                {['instalar app', 'notificaciones', 'cancelar turno', 'mercado pago', 'planes'].map((term) => (
                  <button
                    key={term}
                    onClick={() => setSearchQuery(term)}
                    className="text-sm px-3 py-1 rounded-full bg-muted hover:bg-brand-100 dark:hover:bg-brand-900/30 text-brand-600 hover:text-brand-700 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-10 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(selectedCategory === category.id ? null : category.id);
                    setSearchQuery('');
                  }}
                  className={cn(
                    "text-left p-4 bg-card rounded-xl border transition-all hover:shadow-md group",
                    selectedCategory === category.id
                      ? "border-brand-500 ring-2 ring-brand-500/20"
                      : "hover:border-brand-300"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all",
                      selectedCategory === category.id
                        ? "bg-brand-500 text-white shadow-lg"
                        : "bg-brand-50 dark:bg-brand-900/30 text-brand-600 group-hover:shadow-md"
                    )}>
                      <category.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm">{category.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {category.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-10 sm:py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-brand-500" />
                    Preguntas frecuentes
                  </h2>
                  {selectedCategory && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Mostrando: {CATEGORIES.find(c => c.id === selectedCategory)?.name}
                    </p>
                  )}
                </div>
                {selectedCategory && (
                  <Button variant="outline" size="sm" onClick={() => setSelectedCategory(null)}>
                    <X className="h-4 w-4 mr-1" />
                    Limpiar filtro
                  </Button>
                )}
              </div>

              {searchQuery && (
                <div className="mb-4 p-3 bg-brand-50 dark:bg-brand-900/20 rounded-lg border border-brand-200 dark:border-brand-800">
                  <p className="text-sm text-brand-700 dark:text-brand-300">
                    <Sparkles className="h-4 w-4 inline mr-1" />
                    {filteredFAQs.length} resultado{filteredFAQs.length !== 1 ? 's' : ''} para &quot;{searchQuery}&quot;
                  </p>
                </div>
              )}

              {filteredFAQs.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <HelpCircle className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">No se encontraron resultados</h3>
                  <p className="text-muted-foreground mb-4 text-sm">
                    Intenta con otros terminos o{' '}
                    <button
                      onClick={() => { setSearchQuery(''); setSelectedCategory(null); }}
                      className="text-brand-600 hover:underline font-medium"
                    >
                      ve todas las preguntas
                    </button>
                  </p>
                  <a href="https://wa.me/5491112345678" target="_blank" rel="noopener noreferrer">
                    <Button className="bg-gradient-primary">
                      <Headphones className="h-4 w-4 mr-2" />
                      Contactar soporte
                    </Button>
                  </a>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredFAQs.map((faq, index) => {
                    const origIdx = FAQ_ITEMS.indexOf(faq);
                    return (
                      <div
                        key={origIdx}
                        className={cn(
                          "bg-card rounded-xl border overflow-hidden transition-all",
                          expandedFAQs.has(origIdx) && "ring-1 ring-brand-500/30"
                        )}
                      >
                        <button
                          onClick={() => toggleFAQ(origIdx)}
                          className="w-full p-4 text-left flex items-start justify-between gap-4 hover:bg-muted/50 transition-colors"
                          aria-expanded={expandedFAQs.has(origIdx)}
                        >
                          <span className="font-medium text-sm leading-tight">{faq.question}</span>
                          <ChevronDown className={cn(
                            "h-5 w-5 text-muted-foreground flex-shrink-0 transition-transform mt-0.5",
                            expandedFAQs.has(origIdx) && "rotate-180 text-brand-500"
                          )} />
                        </button>
                        {expandedFAQs.has(origIdx) && (
                          <div className="px-4 pb-4">
                            <div className="pt-3 border-t text-sm text-muted-foreground leading-relaxed">
                              {faq.answer}
                            </div>
                            {/* Feedback */}
                            <div className="flex items-center gap-3 mt-4 pt-3 border-t">
                              {feedbackGiven.has(origIdx) ? (
                                <div className="flex items-center gap-2 text-sm text-green-600">
                                  <CheckCircle2 className="h-4 w-4" />
                                  Gracias por tu feedback
                                </div>
                              ) : (
                                <>
                                  <span className="text-sm text-muted-foreground">¿Te fue util?</span>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={(e) => { e.stopPropagation(); handleFeedback(origIdx); }}
                                      className="h-8 hover:bg-green-50 hover:border-green-500 hover:text-green-600 dark:hover:bg-green-900/20"
                                    >
                                      <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                                      Si
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={(e) => { e.stopPropagation(); handleFeedback(origIdx); }}
                                      className="h-8 hover:bg-red-50 hover:border-red-500 hover:text-red-600 dark:hover:bg-red-900/20"
                                    >
                                      <ThumbsDown className="h-3.5 w-3.5 mr-1" />
                                      No
                                    </Button>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <Badge className="mb-4 bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-700">
                  <Headphones className="h-3 w-3 mr-1" />
                  Soporte
                </Badge>
                <h2 className="text-xl sm:text-2xl font-bold mb-2">¿No encontraste lo que buscabas?</h2>
                <p className="text-muted-foreground text-sm">
                  Nuestro equipo esta listo para ayudarte
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {/* WhatsApp Support - Primary */}
                <Card className="group text-center hover:shadow-xl transition-all hover:-translate-y-1 border-2 border-green-200 dark:border-green-800 bg-gradient-to-b from-green-50/50 to-transparent dark:from-green-900/10">
                  <CardHeader className="pb-4">
                    <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-lg">
                      <MessageSquare className="h-7 w-7 text-white" />
                    </div>
                    <CardTitle className="text-lg">WhatsApp</CardTitle>
                    <CardDescription className="text-sm">
                      Soporte en tiempo real
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <a
                      href="https://wa.me/5491112345678"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button className="bg-green-500 hover:bg-green-600 text-white w-full">
                        <Send className="h-4 w-4 mr-2" />
                        Iniciar chat
                      </Button>
                    </a>
                  </CardContent>
                </Card>

                {/* Email Support */}
                <Card className="group text-center hover:shadow-xl transition-all hover:-translate-y-1 border-2 hover:border-blue-200 dark:hover:border-blue-800">
                  <CardHeader className="pb-4">
                    <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <Mail className="h-7 w-7 text-blue-600" />
                    </div>
                    <CardTitle className="text-lg">Email</CardTitle>
                    <CardDescription className="text-sm">
                      Respuesta en menos de 24hs
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <a
                      href="mailto:soporte@turnolink.com.ar"
                      className="text-brand-600 hover:underline font-medium"
                    >
                      soporte@turnolink.com.ar
                    </a>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Lunes a Viernes, 9:00 - 18:00 (Argentina)
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        {!session && (
          <section className="py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-3xl mx-auto text-center">
                <div className="relative bg-gradient-to-r from-brand-500 to-purple-500 rounded-2xl p-8 md:p-12 text-white overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                  <div className="relative">
                    <Sparkles className="h-10 w-10 mx-auto mb-4 opacity-80" />
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                      ¿Listo para empezar?
                    </h2>
                    <p className="text-white/80 mb-6 text-sm sm:text-base">
                      Comenza gratis y descubri por que cientos de negocios eligen TurnoLink.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Link href="/register">
                        <Button size="lg" className="bg-white text-brand-700 hover:bg-white/90 w-full sm:w-auto">
                          Comenzar gratis
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href="/suscripcion">
                        <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 w-full sm:w-auto">
                          Ver planes
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="border-t py-6">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} TurnoLink. Todos los derechos reservados.
              </p>
              <div className="flex items-center gap-6">
                <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">Inicio</Link>
                <Link href="/suscripcion" className="text-sm text-muted-foreground hover:text-foreground">Precios</Link>
              </div>
            </div>
          </div>
        </footer>

        {/* Back to top */}
        {showScrollTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 right-6 h-12 w-12 rounded-full bg-brand-500 text-white shadow-lg hover:bg-brand-600 transition-all hover:scale-110 z-50"
            aria-label="Volver arriba"
          >
            <ArrowUp className="h-5 w-5 mx-auto" />
          </button>
        )}
      </div>
    </LandingThemeWrapper>
  );
}
