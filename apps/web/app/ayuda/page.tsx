'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  Search,
  HelpCircle,
  Book,
  MessageSquare,
  Mail,
  Phone,
  Clock,
  ChevronDown,
  ChevronRight,
  Calendar,
  Users,
  CreditCard,
  Settings,
  Shield,
  Zap,
  ExternalLink,
  ArrowRight,
  CheckCircle2,
  PlayCircle,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Headphones,
  Video,
  FileText,
  Globe,
  AlertCircle,
  Star,
  ArrowUpRight,
  Send,
  X,
  Menu,
  Home,
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
  helpful?: number;
  relatedArticles?: string[];
}

interface Category {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  articles: number;
  color: string;
}

interface VideoTutorial {
  id: string;
  title: string;
  description: string;
  duration: string;
  thumbnail: string;
  views: string;
  category: string;
}

const CATEGORIES: Category[] = [
  {
    id: 'getting-started',
    name: 'Primeros pasos',
    icon: Zap,
    description: 'Aprende a configurar tu cuenta, instalar la app y empezar a usar TurnoLink',
    articles: 10,
    color: 'from-amber-500 to-orange-500',
  },
  {
    id: 'turnos',
    name: 'Gestión de turnos',
    icon: Calendar,
    description: 'Todo sobre reservas, cancelaciones y horarios',
    articles: 12,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'clientes',
    name: 'Clientes',
    icon: Users,
    description: 'Administra tu base de clientes y sus preferencias',
    articles: 6,
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 'pagos',
    name: 'Pagos y facturación',
    icon: CreditCard,
    description: 'Suscripciones, cobros y métodos de pago',
    articles: 10,
    color: 'from-purple-500 to-teal-500',
  },
  {
    id: 'configuracion',
    name: 'Configuración',
    icon: Settings,
    description: 'Personaliza TurnoLink para tu negocio',
    articles: 15,
    color: 'from-slate-500 to-gray-500',
  },
  {
    id: 'seguridad',
    name: 'Seguridad',
    icon: Shield,
    description: 'Protege tu cuenta y datos de clientes',
    articles: 5,
    color: 'from-red-500 to-teal-500',
  },
];

const FAQ_ITEMS: FAQItem[] = [
  {
    category: 'getting-started',
    question: '¿Como instalo TurnoLink en mi celular?',
    answer: 'TurnoLink se instala como una app desde el navegador, sin necesidad de ir a una tienda de apps. En Android: abri turnolink.mubitt.com en Chrome, toca el menu (tres puntos) y selecciona "Instalar aplicacion". En iPhone: abri turnolink.mubitt.com en Safari, toca el boton de compartir y luego "Agregar a pantalla de inicio". Una vez instalada, abri la app e inicia sesion.',
    helpful: 320,
    relatedArticles: ['Activar notificaciones push', 'Primeros pasos'],
  },
  {
    category: 'getting-started',
    question: '¿Como activo las notificaciones para saber cuando un cliente reserva?',
    answer: 'Despues de instalar la app en tu celular, abri TurnoLink y vas a ver un banner que dice "Activar notificaciones". Toca "Activar" y permite las notificaciones cuando el sistema te lo pida. A partir de ese momento, cada vez que un cliente reserve un turno, vas a recibir una notificacion push en tu celular con el nombre del cliente, el servicio y la fecha.',
    helpful: 298,
    relatedArticles: ['Instalar TurnoLink en tu celular', 'Confirmar turnos por WhatsApp'],
  },
  {
    category: 'getting-started',
    question: '¿Cómo creo mi primera sucursal?',
    answer: 'Ve a Dashboard > Sucursales > Nueva Sucursal. Completa los datos básicos como nombre, dirección y horarios de atención. Una vez creada, podrás agregar empleados y servicios. También puedes configurar fotos, descripción y redes sociales de tu sucursal.',
    helpful: 156,
    relatedArticles: ['Configurar horarios de atención', 'Agregar empleados'],
  },
  {
    category: 'getting-started',
    question: '¿Cómo agrego empleados a mi negocio?',
    answer: 'Desde el Dashboard, ve a Empleados > Nuevo Empleado. Puedes asignarles servicios específicos, definir sus horarios de trabajo y permisos de acceso al sistema. Cada empleado puede tener su propio calendario y colores personalizados.',
    helpful: 134,
    relatedArticles: ['Configurar permisos', 'Asignar servicios a empleados'],
  },
  {
    category: 'getting-started',
    question: '¿Cómo configuro mis servicios y precios?',
    answer: 'Accede a Servicios > Nuevo Servicio. Define el nombre, duración, precio y asigna qué empleados pueden realizarlo. Puedes crear categorías para organizar mejor tus servicios y configurar precios variables según el día u hora.',
    helpful: 189,
  },
  {
    category: 'turnos',
    question: '¿Cómo puedo cancelar un turno?',
    answer: 'Ve a Turnos, busca la reserva que deseas cancelar y haz clic en "Cancelar". Puedes elegir notificar al cliente automáticamente por email o WhatsApp. El sistema guardará un registro del motivo de cancelación.',
    helpful: 203,
    relatedArticles: ['Políticas de cancelación', 'Notificaciones automáticas'],
  },
  {
    category: 'turnos',
    question: '¿Puedo bloquear horarios específicos?',
    answer: 'Sí, desde Horarios puedes marcar bloques de tiempo como no disponibles. Esto es útil para almuerzos, reuniones o cualquier momento que no quieras recibir reservas. También puedes crear bloqueos recurrentes.',
    helpful: 178,
  },
  {
    category: 'turnos',
    question: '¿Cómo funcionan los recordatorios automáticos?',
    answer: 'TurnoLink envía recordatorios automáticos a tus clientes 24 horas y 2 horas antes de su turno. Puedes personalizar estos tiempos y elegir entre enviarlos por WhatsApp, email o ambos. Esto reduce significativamente las ausencias.',
    helpful: 245,
  },
  {
    category: 'pagos',
    question: '¿Cómo funciona el plan Gratis?',
    answer: 'El plan Gratis te permite hasta 30 turnos al mes, 2 empleados, 5 servicios y 50 clientes. Es ideal para emprendedores que están comenzando. Puedes usarlo indefinidamente sin costo alguno.',
    helpful: 312,
  },
  {
    category: 'pagos',
    question: '¿Qué métodos de pago aceptan?',
    answer: 'Aceptamos todas las tarjetas de crédito y débito a través de Mercado Pago. También puedes pagar con dinero en cuenta de Mercado Pago o transferencia bancaria. Todos los pagos son procesados de forma segura.',
    helpful: 167,
  },
  {
    category: 'pagos',
    question: '¿Puedo cambiar mi plan?',
    answer: 'Sí, puedes cambiar de plan en cualquier momento desde Mi Suscripción. Si pasas a un plan superior, se prorrateará el precio. Si bajas de plan, el cambio se aplicará en tu próximo ciclo de facturación.',
    helpful: 198,
    relatedArticles: ['Comparar planes', 'Facturación y recibos'],
  },
  {
    category: 'clientes',
    question: '¿Cómo importo mis clientes existentes?',
    answer: 'Puedes importar clientes desde un archivo CSV o Excel. Ve a Clientes > Importar y sigue las instrucciones. El formato debe incluir nombre, teléfono y email. También detectamos duplicados automáticamente.',
    helpful: 145,
  },
  {
    category: 'clientes',
    question: '¿Cómo veo el historial de un cliente?',
    answer: 'Haz clic en cualquier cliente para ver su perfil completo con historial de turnos, servicios favoritos, notas y estadísticas de asistencia. Puedes agregar etiquetas y notas privadas para personalizar su atención.',
    helpful: 123,
  },
  {
    category: 'seguridad',
    question: '¿Cómo activo la autenticación de dos factores?',
    answer: 'Ve a Configuración > Seguridad > Autenticación de dos factores y sigue los pasos para vincular una app como Google Authenticator. Esto agrega una capa extra de protección a tu cuenta.',
    helpful: 89,
  },
  {
    category: 'seguridad',
    question: '¿Mis datos están seguros?',
    answer: 'Sí, utilizamos encriptación SSL/TLS para todas las comunicaciones. Tus datos se almacenan de forma segura en servidores certificados y nunca compartimos información con terceros sin tu consentimiento. Cumplimos con las normativas de protección de datos.',
    helpful: 234,
  },
  {
    category: 'configuracion',
    question: '¿Cómo personalizo mi página de reservas pública?',
    answer: 'Desde Configuración > Página Pública puedes cambiar colores, logo, descripción y otros elementos. Tu página estará disponible en una URL personalizada que puedes compartir con tus clientes.',
    helpful: 201,
  },
  {
    category: 'configuracion',
    question: '¿Puedo integrar TurnoLink con WhatsApp?',
    answer: 'Sí, TurnoLink envía notificaciones automáticas por WhatsApp a tus clientes. Incluye confirmaciones de reserva, recordatorios y notificaciones de cambios. Solo necesitas configurar tu número de WhatsApp Business.',
    helpful: 278,
    relatedArticles: ['Configurar WhatsApp', 'Plantillas de mensajes'],
  },
  {
    category: 'configuracion',
    question: '¿Cómo configuro mis días festivos o vacaciones?',
    answer: 'Ve a Configuración > Horarios Especiales y agrega las fechas en las que tu negocio estará cerrado. Puedes configurar cierres parciales o totales, y el sistema bloqueará automáticamente las reservas para esos días.',
    helpful: 156,
  },
];

const VIDEO_TUTORIALS: VideoTutorial[] = [
  {
    id: '1',
    title: 'Configuración inicial completa',
    description: 'Aprende a configurar tu negocio desde cero en TurnoLink',
    duration: '8:45',
    thumbnail: '/tutorials/setup.jpg',
    views: '2.3K',
    category: 'getting-started',
  },
  {
    id: '2',
    title: 'Gestionar turnos como un pro',
    description: 'Domina todas las funciones de gestión de citas',
    duration: '12:30',
    thumbnail: '/tutorials/turnos.jpg',
    views: '1.8K',
    category: 'turnos',
  },
  {
    id: '3',
    title: 'Configurar WhatsApp Business',
    description: 'Integra WhatsApp para notificaciones automáticas',
    duration: '6:15',
    thumbnail: '/tutorials/whatsapp.jpg',
    views: '3.1K',
    category: 'configuracion',
  },
  {
    id: '4',
    title: 'Administrar empleados y horarios',
    description: 'Configura tu equipo y sus disponibilidades',
    duration: '10:20',
    thumbnail: '/tutorials/empleados.jpg',
    views: '1.5K',
    category: 'getting-started',
  },
];

const QUICK_LINKS = [
  { icon: FileText, label: 'Documentación', href: '#', description: 'Guías completas' },
  { icon: Video, label: 'Video tutoriales', href: '#videos', description: 'Aprende visualmente' },
  { icon: MessageSquare, label: 'Comunidad', href: '#', description: 'Conecta con otros usuarios' },
  { icon: Globe, label: 'Estado del sistema', href: '#', description: 'Ver uptime', status: 'operational' },
];

export default function AyudaPage() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedFAQs, setExpandedFAQs] = useState<Set<number>>(new Set());
  const [feedbackGiven, setFeedbackGiven] = useState<Set<number>>(new Set());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Track scroll position for back to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleFAQ = (index: number) => {
    const newExpanded = new Set(expandedFAQs);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedFAQs(newExpanded);
  };

  const handleFeedback = (index: number, isHelpful: boolean) => {
    setFeedbackGiven(prev => new Set(prev).add(index));
    // Here you would typically send this to your analytics/backend
    console.log(`FAQ ${index} marked as ${isHelpful ? 'helpful' : 'not helpful'}`);
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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <LandingThemeWrapper>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center gap-2">
                <img
                  src="/claro2.png"
                  alt="TurnoLink"
                  className="h-10 sm:h-12 w-auto dark:hidden"
                />
                <img
                  src="/oscuro2.png"
                  alt="TurnoLink"
                  className="h-10 sm:h-12 w-auto hidden dark:block"
                />
              </Link>

              {/* Desktop Navigation */}
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
                      <Button variant="ghost" size="sm">Iniciar Sesión</Button>
                    </Link>
                    <Link href="/register">
                      <Button size="sm" className="bg-gradient-primary">Registrarse</Button>
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile Menu Button */}
              <div className="flex md:hidden items-center gap-2">
                <LandingThemeToggle />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </div>
            </nav>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <div className="md:hidden py-4 border-t animate-in slide-in-from-top duration-200">
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
                        <Button variant="outline" className="w-full">Iniciar Sesión</Button>
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

        {/* Hero Section with Search */}
        <section className="relative py-12 sm:py-16 md:py-24 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-b from-brand-50 to-background dark:from-brand-950/30 dark:to-background" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-100/50 via-transparent to-transparent dark:from-brand-900/20" />

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="max-w-3xl mx-auto text-center">
              <Badge className="mb-4 bg-brand-100 text-brand-700 border-brand-200 dark:bg-brand-900/50 dark:text-brand-300 dark:border-brand-700">
                <HelpCircle className="h-3 w-3 mr-1" />
                Centro de Ayuda
              </Badge>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
                ¿Cómo podemos{' '}
                <span className="text-gradient bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent">
                  ayudarte?
                </span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 px-4">
                Encuentra respuestas rápidas, guías paso a paso y soporte para aprovechar TurnoLink al máximo.
              </p>

              {/* Search Bar */}
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
                {['instalar app', 'notificaciones', 'cancelar turno', 'plan gratis'].map((term) => (
                  <button
                    key={term}
                    onClick={() => setSearchQuery(term)}
                    className="text-sm px-3 py-1 rounded-full bg-muted hover:bg-brand-100 dark:hover:bg-brand-900/30 text-brand-600 hover:text-brand-700 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>

              {/* Quick Links */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 px-4 sm:px-0">
                {QUICK_LINKS.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="group flex flex-col items-center p-3 sm:p-4 rounded-xl bg-background border hover:border-brand-500 hover:shadow-lg transition-all"
                  >
                    <div className="h-10 w-10 rounded-lg bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <link.icon className="h-5 w-5 text-brand-600" />
                    </div>
                    <span className="font-medium text-sm">{link.label}</span>
                    <span className="text-xs text-muted-foreground hidden sm:block">{link.description}</span>
                    {link.status === 'operational' && (
                      <span className="flex items-center gap-1 text-xs text-green-600 mt-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                        Operativo
                      </span>
                    )}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Video Tutorials Section */}
        <section id="videos" className="py-10 sm:py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <Video className="h-5 sm:h-6 w-5 sm:w-6 text-brand-500" />
                  Video Tutoriales
                </h2>
                <p className="text-sm text-muted-foreground mt-1">Aprende de forma visual con nuestros tutoriales</p>
              </div>
              <Button variant="outline" size="sm" className="self-start sm:self-center">
                Ver todos
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {VIDEO_TUTORIALS.map((video) => (
                <div
                  key={video.id}
                  className="group cursor-pointer bg-card rounded-xl border overflow-hidden hover:shadow-lg transition-all"
                >
                  {/* Video Thumbnail */}
                  <div className="relative aspect-video bg-gradient-to-br from-brand-100 to-purple-100 dark:from-brand-900/30 dark:to-purple-900/30 flex items-center justify-center overflow-hidden">
                    <PlayCircle className="h-12 w-12 text-brand-600 group-hover:scale-110 transition-transform" />
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 text-white text-xs rounded">
                      {video.duration}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-brand-600 transition-colors">
                      {video.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {video.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <span>{video.views} visualizaciones</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-10 sm:py-12 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl sm:text-2xl font-bold mb-6 flex items-center gap-2">
              <Book className="h-5 sm:h-6 w-5 sm:w-6 text-brand-500" />
              Categorías
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                  className={cn(
                    "text-left p-4 sm:p-5 bg-card rounded-xl border transition-all hover:shadow-md group",
                    selectedCategory === category.id
                      ? "border-brand-500 ring-2 ring-brand-500/20"
                      : "hover:border-brand-300"
                  )}
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className={cn(
                      "h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br transition-all",
                      selectedCategory === category.id
                        ? `${category.color} text-white shadow-lg`
                        : "bg-brand-50 dark:bg-brand-900/30 text-brand-600 group-hover:shadow-md"
                    )}>
                      <category.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm sm:text-base">{category.name}</h3>
                        <ChevronRight className={cn(
                          "h-4 w-4 text-muted-foreground transition-transform flex-shrink-0",
                          selectedCategory === category.id && "rotate-90 text-brand-500"
                        )} />
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">
                        {category.description}
                      </p>
                      <Badge variant="secondary" className="mt-2 text-xs">
                        {category.articles} artículos
                      </Badge>
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                    <MessageSquare className="h-5 sm:h-6 w-5 sm:w-6 text-brand-500" />
                    Preguntas frecuentes
                  </h2>
                  {selectedCategory && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Mostrando: {CATEGORIES.find(c => c.id === selectedCategory)?.name}
                    </p>
                  )}
                </div>
                {selectedCategory && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedCategory(null)}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Limpiar filtro
                  </Button>
                )}
              </div>

              {/* Results count */}
              {searchQuery && (
                <div className="mb-4 p-3 bg-brand-50 dark:bg-brand-900/20 rounded-lg border border-brand-200 dark:border-brand-800">
                  <p className="text-sm text-brand-700 dark:text-brand-300">
                    <Sparkles className="h-4 w-4 inline mr-1" />
                    Se encontraron <strong>{filteredFAQs.length}</strong> resultados para "{searchQuery}"
                  </p>
                </div>
              )}

              {filteredFAQs.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <HelpCircle className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">No se encontraron resultados</h3>
                  <p className="text-muted-foreground mb-4 text-sm">
                    Intenta con otros términos de búsqueda o{' '}
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory(null);
                      }}
                      className="text-brand-600 hover:underline font-medium"
                    >
                      ver todas las preguntas
                    </button>
                  </p>
                  <div className="mt-6">
                    <p className="text-sm text-muted-foreground mb-3">¿No encuentras lo que buscas?</p>
                    <Button className="bg-gradient-primary">
                      <Headphones className="h-4 w-4 mr-2" />
                      Contactar soporte
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredFAQs.map((faq, index) => {
                    const originalIndex = FAQ_ITEMS.indexOf(faq);
                    return (
                      <div
                        key={originalIndex}
                        className={cn(
                          "bg-card rounded-xl border overflow-hidden transition-all",
                          expandedFAQs.has(originalIndex) && "ring-1 ring-brand-500/30"
                        )}
                      >
                        <button
                          onClick={() => toggleFAQ(originalIndex)}
                          className="w-full p-4 sm:p-5 text-left flex items-start justify-between gap-4 hover:bg-muted/50 transition-colors"
                          aria-expanded={expandedFAQs.has(originalIndex)}
                        >
                          <div className="flex-1">
                            <span className="font-medium text-sm sm:text-base leading-tight">{faq.question}</span>
                            {faq.helpful && (
                              <span className="inline-flex items-center gap-1 ml-2 text-xs text-muted-foreground">
                                <ThumbsUp className="h-3 w-3" />
                                {faq.helpful}
                              </span>
                            )}
                          </div>
                          <ChevronDown
                            className={cn(
                              "h-5 w-5 text-muted-foreground flex-shrink-0 transition-transform",
                              expandedFAQs.has(originalIndex) && "rotate-180 text-brand-500"
                            )}
                          />
                        </button>
                        {expandedFAQs.has(originalIndex) && (
                          <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0 animate-in slide-in-from-top-2 duration-200">
                            <div className="pt-3 border-t text-sm sm:text-base text-muted-foreground leading-relaxed">
                              {faq.answer}
                            </div>

                            {/* Related Articles */}
                            {faq.relatedArticles && faq.relatedArticles.length > 0 && (
                              <div className="mt-4 pt-3 border-t">
                                <p className="text-xs font-medium text-muted-foreground mb-2">Artículos relacionados:</p>
                                <div className="flex flex-wrap gap-2">
                                  {faq.relatedArticles.map((article, i) => (
                                    <button key={i} className="text-xs px-3 py-1 rounded-full bg-muted hover:bg-brand-100 dark:hover:bg-brand-900/30 text-brand-600 transition-colors">
                                      {article}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Feedback */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-4 pt-3 border-t">
                              {feedbackGiven.has(originalIndex) ? (
                                <div className="flex items-center gap-2 text-sm text-green-600">
                                  <CheckCircle2 className="h-4 w-4" />
                                  ¡Gracias por tu feedback!
                                </div>
                              ) : (
                                <>
                                  <span className="text-sm text-muted-foreground">
                                    ¿Te fue útil esta respuesta?
                                  </span>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleFeedback(originalIndex, true)}
                                      className="hover:bg-green-50 hover:border-green-500 hover:text-green-600 dark:hover:bg-green-900/20"
                                    >
                                      <ThumbsUp className="h-4 w-4 mr-1" />
                                      Sí
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleFeedback(originalIndex, false)}
                                      className="hover:bg-red-50 hover:border-red-500 hover:text-red-600 dark:hover:bg-red-900/20"
                                    >
                                      <ThumbsDown className="h-4 w-4 mr-1" />
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
        <section className="py-12 sm:py-16 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8 sm:mb-10">
                <Badge className="mb-4 bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-700">
                  <Headphones className="h-3 w-3 mr-1" />
                  Soporte
                </Badge>
                <h2 className="text-xl sm:text-2xl font-bold mb-2">¿No encontraste lo que buscabas?</h2>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Nuestro equipo de soporte está listo para ayudarte
                </p>
              </div>

              <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
                {/* Email Support */}
                <Card className="group text-center hover:shadow-xl transition-all hover:-translate-y-1 border-2 hover:border-blue-200 dark:hover:border-blue-800">
                  <CardHeader className="pb-4">
                    <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <Mail className="h-7 w-7 text-blue-600" />
                    </div>
                    <CardTitle className="text-lg">Email</CardTitle>
                    <CardDescription className="text-sm">
                      Respuesta en menos de 24 horas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <a
                      href="mailto:soporte@turnolink.com"
                      className="text-brand-600 hover:underline font-medium text-sm sm:text-base"
                    >
                      soporte@turnolink.com
                    </a>
                  </CardContent>
                </Card>

                {/* WhatsApp Support */}
                <Card className="group text-center hover:shadow-xl transition-all hover:-translate-y-1 border-2 border-green-200 dark:border-green-800 bg-gradient-to-b from-green-50/50 to-transparent dark:from-green-900/10">
                  <CardHeader className="pb-4">
                    <Badge className="mx-auto mb-2 bg-green-100 text-green-700 border-green-300">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      Recomendado
                    </Badge>
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
                      href="https://wa.me/5491234567890"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button className="bg-green-500 hover:bg-green-600 text-white">
                        <Send className="h-4 w-4 mr-2" />
                        Iniciar chat
                      </Button>
                    </a>
                  </CardContent>
                </Card>

                {/* Schedule Call */}
                <Card className="group text-center hover:shadow-xl transition-all hover:-translate-y-1 border-2 hover:border-purple-200 dark:hover:border-purple-800">
                  <CardHeader className="pb-4">
                    <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <Phone className="h-7 w-7 text-purple-600" />
                    </div>
                    <CardTitle className="text-lg">Llamada</CardTitle>
                    <CardDescription className="text-sm">
                      Agenda una videollamada
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline">
                      <Calendar className="h-4 w-4 mr-2" />
                      Agendar llamada
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Support Hours & Status */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Lunes a Viernes, 9:00 - 18:00 (Argentina)
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-full text-sm text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  Tiempo de respuesta actual: ~15 min
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        {!session && (
          <section className="py-12 sm:py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-3xl mx-auto text-center">
                <div className="relative bg-gradient-to-r from-brand-500 to-purple-500 rounded-2xl p-6 sm:p-8 md:p-12 text-white overflow-hidden">
                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

                  <div className="relative">
                    <Sparkles className="h-10 w-10 mx-auto mb-4 opacity-80" />
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                      ¿Listo para empezar?
                    </h2>
                    <p className="text-white/80 mb-6 text-sm sm:text-base">
                      Comienza gratis y descubre por qué miles de negocios eligen TurnoLink.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Link href="/register">
                        <Button
                          size="lg"
                          className="bg-white text-brand-700 hover:bg-white/90 w-full sm:w-auto"
                        >
                          Comenzar gratis
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href="/suscripcion">
                        <Button
                          size="lg"
                          variant="outline"
                          className="border-white/30 text-white hover:bg-white/10 w-full sm:w-auto"
                        >
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
        <footer className="border-t py-6 sm:py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground text-center sm:text-left">
                © {new Date().getFullYear()} TurnoLink. Todos los derechos reservados.
              </p>
              <div className="flex items-center flex-wrap justify-center gap-4 sm:gap-6">
                <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Inicio
                </Link>
                <Link href="/suscripcion" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Precios
                </Link>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacidad
                </Link>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Términos
                </Link>
              </div>
            </div>
          </div>
        </footer>

        {/* Back to top button */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 h-12 w-12 rounded-full bg-brand-500 text-white shadow-lg hover:bg-brand-600 transition-all hover:scale-110 animate-in fade-in slide-in-from-bottom-4 z-50"
            aria-label="Volver arriba"
          >
            <ArrowUpRight className="h-5 w-5 mx-auto" />
          </button>
        )}
      </div>
    </LandingThemeWrapper>
  );
}
