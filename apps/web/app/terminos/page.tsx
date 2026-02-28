import type { Metadata } from 'next';
import Link from 'next/link';
import { DM_Sans } from 'next/font/google';
import { Navbar } from '../landing-v2/_components/navbar';
import { Footer } from '../landing-v2/_components/footer';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
});

export const metadata: Metadata = {
  title: 'Términos y Condiciones — TurnoLink',
  description:
    'Términos y condiciones de uso de la plataforma TurnoLink. Condiciones de servicio, suscripciones, pagos, responsabilidades y derechos.',
};

export default function TerminosPage() {
  return (
    <div
      className={`${dmSans.variable} font-[family-name:var(--font-dm-sans)] antialiased min-h-screen bg-black text-white`}
      style={{ colorScheme: 'dark' }}
    >
      <Navbar />

      {/* Hero */}
      <section className="pt-32 lg:pt-40 pb-12 px-5 lg:px-10 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-white/[0.02] blur-[140px] pointer-events-none" />
        <div className="max-w-[860px] mx-auto relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-sm text-white/80 tracking-tight">
              Documento legal
            </span>
            <Link
              href="/privacidad"
              className="text-sm text-white/40 hover:text-white/70 transition-colors"
            >
              Pol&iacute;tica de privacidad &rarr;
            </Link>
          </div>
          <h1 className="text-[36px] sm:text-[48px] lg:text-[60px] font-normal leading-[1.05] tracking-[-2px] lg:tracking-[-3px]">
            <span className="text-white">T&eacute;rminos y</span>{' '}
            <span className="text-white/50">Condiciones</span>
          </h1>
          <p className="mt-4 text-white/30 text-sm">
            &Uacute;ltima actualizaci&oacute;n: 25 de febrero de 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <main className="px-5 lg:px-10 pb-24">
        <div className="max-w-[860px] mx-auto">
          <div className="space-y-10">

            <Section num="01" title="Aceptaci&oacute;n de los T&eacute;rminos">
              <P>
                Los presentes T&eacute;rminos y Condiciones (en adelante, los <B>&ldquo;T&eacute;rminos&rdquo;</B>) regulan el acceso y uso de la plataforma TurnoLink (en adelante, la <B>&ldquo;Plataforma&rdquo;</B> o el <B>&ldquo;Servicio&rdquo;</B>), desarrollada y operada por Mubitt SAS (en adelante, <B>&ldquo;TurnoLink&rdquo;</B>, <B>&ldquo;nosotros&rdquo;</B> o <B>&ldquo;la Empresa&rdquo;</B>), con domicilio en la Rep&uacute;blica Argentina.
              </P>
              <P>
                Al registrarse, acceder o utilizar la Plataforma, usted (en adelante, el <B>&ldquo;Usuario&rdquo;</B>) declara haber le&iacute;do, comprendido y aceptado &iacute;ntegramente estos T&eacute;rminos, as&iacute; como nuestra <Link href="/privacidad" className="text-white/80 underline decoration-white/20 hover:decoration-white/60 transition-colors">Pol&iacute;tica de Privacidad</Link>. Si no est&aacute; de acuerdo con alguna disposici&oacute;n, no utilice la Plataforma.
              </P>
              <P>
                Estos T&eacute;rminos constituyen un contrato vinculante entre usted y TurnoLink en los t&eacute;rminos del art&iacute;culo 984 y concordantes del C&oacute;digo Civil y Comercial de la Naci&oacute;n (en adelante, <B>&ldquo;CCyCN&rdquo;</B>).
              </P>
            </Section>

            <Section num="02" title="Definiciones">
              <P>A los efectos de estos T&eacute;rminos, se entender&aacute; por:</P>
              <UL>
                <LI><B>Plataforma:</B> El software como servicio (SaaS) accesible en turnolink.mubitt.com y sus subdominios, incluyendo aplicaciones web y m&oacute;viles presentes y futuras.</LI>
                <LI><B>Usuario:</B> Toda persona humana o jur&iacute;dica que crea una cuenta, ya sea como titular de un negocio (&ldquo;Usuario Negocio&rdquo;), profesional independiente (&ldquo;Usuario Profesional&rdquo;) o buscador de talento (&ldquo;Usuario Buscador&rdquo;).</LI>
                <LI><B>Cliente Final:</B> Toda persona que realiza una reserva, turno o compra a trav&eacute;s de la p&aacute;gina de reservas de un Usuario Negocio, sin necesidad de crear cuenta en TurnoLink.</LI>
                <LI><B>Cuenta:</B> El registro &uacute;nico e intransferible que identifica a cada Usuario dentro de la Plataforma.</LI>
                <LI><B>Suscripci&oacute;n:</B> El plan de pago contratado por el Usuario para acceder a las funcionalidades de la Plataforma.</LI>
                <LI><B>Contenido del Usuario:</B> Toda informaci&oacute;n, dato, imagen, texto, rese&ntilde;a u otro material cargado o generado por el Usuario o sus Clientes Finales.</LI>
                <LI><B>Se&ntilde;a:</B> Pago parcial o total que el Cliente Final realiza al reservar, procesado a trav&eacute;s de Mercado Pago.</LI>
              </UL>
            </Section>

            <Section num="03" title="Descripci&oacute;n del Servicio">
              <P>
                TurnoLink es una plataforma de gesti&oacute;n integral que permite a negocios y profesionales independientes administrar reservas, turnos, clientes, servicios, pagos y operaciones. La Plataforma incluye, sin limitaci&oacute;n:
              </P>
              <UL>
                <LI>Sistema de reservas y turnos online con disponibilidad en tiempo real.</LI>
                <LI>P&aacute;gina de reservas personalizada para compartir en redes sociales y sitios web.</LI>
                <LI>Gesti&oacute;n de servicios, profesionales/empleados, horarios y sucursales.</LI>
                <LI>Cobro de se&ntilde;as y pagos integrados a trav&eacute;s de Mercado Pago.</LI>
                <LI>Ficha de clientes con historial de reservas y pagos.</LI>
                <LI>Recordatorios autom&aacute;ticos por email.</LI>
                <LI>Dashboard con m&eacute;tricas de ocupaci&oacute;n y facturaci&oacute;n.</LI>
                <LI>Sistema de rese&ntilde;as, cat&aacute;logo de productos y red de perfiles profesionales.</LI>
              </UL>
              <Highlight>
                TurnoLink act&uacute;a exclusivamente como proveedor de tecnolog&iacute;a. No es parte en las relaciones comerciales, contractuales, laborales o de servicio entre los Usuarios y sus Clientes Finales. No presta servicios de salud, belleza, hospedaje, deportes ni ning&uacute;n otro servicio profesional. No garantiza la calidad, idoneidad, legalidad o cumplimiento de los servicios ofrecidos por los Usuarios.
              </Highlight>
            </Section>

            <Section num="04" title="Registro y Cuentas">
              <H3>4.1. Requisitos</H3>
              <P>
                El Usuario debe ser mayor de 18 a&ntilde;os y tener capacidad legal para contratar conforme al CCyCN. En caso de personas jur&iacute;dicas, quien registre la cuenta declara tener poder suficiente para obligar a la entidad. Debe proporcionar informaci&oacute;n ver&iacute;dica, completa y actualizada.
              </P>
              <H3>4.2. Responsabilidad sobre la cuenta</H3>
              <P>
                El Usuario es el &uacute;nico responsable de mantener la confidencialidad de sus credenciales de acceso y de toda actividad que ocurra bajo su cuenta. Debe notificar de inmediato cualquier uso no autorizado a soporte@turnolink.mubitt.com.
              </P>
              <H3>4.3. Verificaci&oacute;n y veracidad</H3>
              <P>
                TurnoLink enviar&aacute; un correo de verificaci&oacute;n al email registrado. La verificaci&oacute;n es requisito para acceder a la totalidad de las funcionalidades. El Usuario garantiza que los datos proporcionados son exactos y se compromete a mantenerlos actualizados.
              </P>
            </Section>

            <Section num="05" title="Planes, Suscripciones y Facturaci&oacute;n">
              <H3>5.1. Planes disponibles</H3>
              <P>
                TurnoLink ofrece diferentes planes de suscripci&oacute;n (gratuitos y pagos) con distintos l&iacute;mites de funcionalidades. Los detalles est&aacute;n disponibles en la secci&oacute;n de precios y pueden variar seg&uacute;n la industria.
              </P>
              <H3>5.2. Per&iacute;odo de prueba</H3>
              <P>
                Algunos planes incluyen un per&iacute;odo de prueba gratuita de catorce (14) d&iacute;as corridos. Finalizado el per&iacute;odo, la cuenta podr&aacute; ser degradada al plan gratuito. No se requiere tarjeta de cr&eacute;dito salvo indicaci&oacute;n expresa.
              </P>
              <H3>5.3. Renovaci&oacute;n autom&aacute;tica</H3>
              <P>
                Las suscripciones pagas se renuevan autom&aacute;ticamente al final de cada per&iacute;odo. El Usuario puede cancelar en cualquier momento desde su panel. La cancelaci&oacute;n surte efecto al finalizar el per&iacute;odo ya abonado.
              </P>
              <H3>5.4. Modificaci&oacute;n de precios</H3>
              <P>
                TurnoLink puede modificar precios con aviso previo m&iacute;nimo de treinta (30) d&iacute;as por email. Los nuevos precios se aplican al siguiente per&iacute;odo de facturaci&oacute;n.
              </P>
              <H3>5.5. Reembolsos</H3>
              <P>
                Las suscripciones no son reembolsables, salvo lo dispuesto por la Ley 24.240 de Defensa del Consumidor. En contrataci&oacute;n a distancia, el Usuario consumidor podr&aacute; ejercer el derecho de revocaci&oacute;n dentro de los diez (10) d&iacute;as corridos conforme al art&iacute;culo 34 de dicha ley.
              </P>
            </Section>

            <Section num="06" title="Pagos y Procesamiento de Cobros">
              <H3>6.1. Procesador de pagos</H3>
              <P>
                TurnoLink utiliza <B>Mercado Pago</B> como procesador de pagos. Al utilizar estas funcionalidades, el Usuario acepta tambi&eacute;n los T&eacute;rminos y Condiciones de Mercado Pago.
              </P>
              <H3>6.2. Conexi&oacute;n de cuenta</H3>
              <P>
                Para cobrar se&ntilde;as, el Usuario conecta su propia cuenta de Mercado Pago mediante OAuth. TurnoLink almacena los tokens de acceso cifrados con AES-256-GCM y no tiene acceso a credenciales de Mercado Pago ni a datos de tarjetas de cr&eacute;dito.
              </P>
              <Highlight>
                TurnoLink no act&uacute;a como intermediario financiero, no retiene fondos ni cobra comisi&oacute;n sobre los pagos procesados entre Usuarios y sus Clientes Finales. Las comisiones de procesamiento son las establecidas por Mercado Pago.
              </Highlight>
              <H3>6.3. Responsabilidad tributaria</H3>
              <P>
                El Usuario es el &uacute;nico responsable del cumplimiento de sus obligaciones tributarias y fiscales, incluyendo emisi&oacute;n de facturas, inscripci&oacute;n ante AFIP, y pago de impuestos nacionales, provinciales y municipales. TurnoLink no brinda asesoramiento tributario.
              </P>
            </Section>

            <Section num="07" title="Uso Aceptable">
              <P>El Usuario se compromete a utilizar la Plataforma de buena fe, absteni&eacute;ndose de:</P>
              <UL>
                <LI>Utilizar la Plataforma para actividades il&iacute;citas, fraudulentas o contrarias a la moral y buenas costumbres.</LI>
                <LI>Suplantar la identidad de otra persona o entidad.</LI>
                <LI>Publicar contenido falso, difamatorio, discriminatorio u obsceno.</LI>
                <LI>Intentar acceder sin autorizaci&oacute;n a cuentas, sistemas o datos de otros.</LI>
                <LI>Realizar ingenier&iacute;a inversa, descompilar o intentar obtener el c&oacute;digo fuente.</LI>
                <LI>Utilizar bots, scrapers u otros medios automatizados sin autorizaci&oacute;n.</LI>
                <LI>Interferir con el funcionamiento de la Plataforma o sus servidores.</LI>
                <LI>Revender, sublicenciar o redistribuir el acceso sin autorizaci&oacute;n escrita.</LI>
                <LI>Cargar datos personales de terceros sin consentimiento leg&iacute;timo conforme a la Ley 25.326.</LI>
                <LI>Enviar comunicaciones masivas no solicitadas (spam).</LI>
              </UL>
              <P>
                El incumplimiento podr&aacute; resultar en suspensi&oacute;n o cancelaci&oacute;n inmediata de la cuenta, sin perjuicio de las acciones legales que correspondan.
              </P>
            </Section>

            <Section num="08" title="Contenido del Usuario">
              <H3>8.1. Titularidad</H3>
              <P>El Usuario retiene todos los derechos de propiedad intelectual sobre su contenido. TurnoLink no reclama titularidad.</P>
              <H3>8.2. Licencia otorgada</H3>
              <P>
                Al cargar contenido, el Usuario otorga a TurnoLink una licencia no exclusiva, mundial, libre de regal&iacute;as para usar, reproducir, almacenar y mostrar dicho contenido &uacute;nicamente para prestar el Servicio. Esta licencia se extingue cuando el Usuario elimine el contenido.
              </P>
              <H3>8.3. Rese&ntilde;as</H3>
              <P>
                Los Clientes Finales podr&aacute;n dejar rese&ntilde;as y valoraciones. TurnoLink cuenta con mecanismos de moderaci&oacute;n. No se eliminar&aacute;n rese&ntilde;as leg&iacute;timas por ser negativas, salvo que contengan contenido il&iacute;cito o difamatorio demostrable.
              </P>
            </Section>

            <Section num="09" title="Datos de Clientes Finales">
              <P>
                Cuando el Usuario Negocio carga datos de sus clientes, act&uacute;a como <B>responsable del tratamiento</B> conforme a la Ley 25.326. TurnoLink act&uacute;a como <B>encargado del tratamiento</B>, procesando datos &uacute;nicamente para prestar el Servicio.
              </P>
              <P>El Usuario se compromete a:</P>
              <UL>
                <LI>Contar con consentimiento informado de sus clientes para almacenar sus datos.</LI>
                <LI>Informar a sus clientes sobre el uso de TurnoLink como herramienta de gesti&oacute;n.</LI>
                <LI>Cumplir con la Ley 25.326, Decreto 1558/2001 y normativa de la AAIP.</LI>
                <LI>Responder a solicitudes de acceso, rectificaci&oacute;n y supresi&oacute;n de sus clientes.</LI>
              </UL>
              <Highlight>
                TurnoLink no es un sistema de historia cl&iacute;nica ni de registros m&eacute;dicos. Si el Usuario almacena informaci&oacute;n sensible de salud en campos de texto libre, lo hace bajo su exclusiva responsabilidad.
              </Highlight>
            </Section>

            <Section num="10" title="Propiedad Intelectual">
              <P>
                La Plataforma, incluyendo c&oacute;digo fuente, dise&ntilde;o, interfaz, marca, logo, textos e im&aacute;genes, es propiedad exclusiva de TurnoLink, protegida por la Ley 11.723 de Propiedad Intelectual, la Ley de Marcas 22.362 y tratados internacionales. La suscripci&oacute;n otorga una licencia limitada, no exclusiva, no transferible y revocable.
              </P>
            </Section>

            <Section num="11" title="Disponibilidad del Servicio">
              <P>
                TurnoLink realizar&aacute; esfuerzos razonables para mantener la Plataforma disponible, pero <B>no garantiza disponibilidad del 100%</B>. El Servicio puede interrumpirse por mantenimiento, actualizaciones, fallos t&eacute;cnicos o causas fuera de nuestro control. TurnoLink no ser&aacute; responsable por da&ntilde;os derivados de interrupciones.
              </P>
            </Section>

            <Section num="12" title="Limitaci&oacute;n de Responsabilidad">
              <H3>12.1. Exclusi&oacute;n de garant&iacute;as</H3>
              <P>
                La Plataforma se proporciona <B>&ldquo;tal cual&rdquo;</B> y <B>&ldquo;seg&uacute;n disponibilidad&rdquo;</B>, sin garant&iacute;as expresas o impl&iacute;citas, en la m&aacute;xima medida permitida por la legislaci&oacute;n argentina.
              </P>
              <H3>12.2. L&iacute;mite cuantitativo</H3>
              <Highlight>
                La responsabilidad total de TurnoLink no exceder&aacute; el monto total abonado por el Usuario en suscripciones durante los &uacute;ltimos doce (12) meses anteriores al hecho. Para planes gratuitos, el l&iacute;mite es $0.
              </Highlight>
              <H3>12.3. Exclusiones</H3>
              <P>TurnoLink no ser&aacute; responsable por:</P>
              <UL>
                <LI>Lucro cesante, da&ntilde;o moral, p&eacute;rdida de datos o da&ntilde;os indirectos.</LI>
                <LI>Actos u omisiones de Usuarios, empleados o Clientes Finales.</LI>
                <LI>Calidad o legalidad de los servicios prestados por los Usuarios.</LI>
                <LI>Disputas entre Usuarios y sus Clientes Finales o empleados.</LI>
                <LI>Fallos en procesamiento de pagos por Mercado Pago.</LI>
                <LI>Accesos no autorizados por negligencia del Usuario.</LI>
                <LI>Fuerza mayor o caso fortuito (art. 1730 CCyCN).</LI>
                <LI>Incumplimiento de normativas sectoriales del Usuario.</LI>
              </UL>
            </Section>

            <Section num="13" title="Indemnizaci&oacute;n">
              <P>
                El Usuario se compromete a indemnizar y mantener indemne a TurnoLink frente a cualquier reclamo, da&ntilde;o o gasto (incluidos honorarios) derivados de:
              </P>
              <UL>
                <LI>El uso del Servicio por parte del Usuario.</LI>
                <LI>La violaci&oacute;n de estos T&eacute;rminos.</LI>
                <LI>La violaci&oacute;n de derechos de terceros (propiedad intelectual, privacidad).</LI>
                <LI>La relaci&oacute;n comercial del Usuario con sus Clientes Finales.</LI>
                <LI>El incumplimiento de obligaciones tributarias, laborales o regulatorias.</LI>
                <LI>Reclamos de Clientes Finales por servicios del Usuario.</LI>
              </UL>
            </Section>

            <Section num="14" title="Suspensi&oacute;n y Terminaci&oacute;n">
              <H3>14.1. Por el Usuario</H3>
              <P>
                El Usuario puede cancelar su cuenta en cualquier momento desde configuraci&oacute;n o contactando a soporte. La cancelaci&oacute;n surte efecto al finalizar el per&iacute;odo abonado. La eliminaci&oacute;n implica p&eacute;rdida de acceso a datos, sujeto a retenci&oacute;n legal.
              </P>
              <H3>14.2. Por TurnoLink</H3>
              <P>TurnoLink podr&aacute; suspender o cancelar la cuenta por:</P>
              <UL>
                <LI>Violaci&oacute;n de estos T&eacute;rminos o la legislaci&oacute;n vigente.</LI>
                <LI>Uso fraudulento, abusivo o il&iacute;cito.</LI>
                <LI>Falta de pago por m&aacute;s de treinta (30) d&iacute;as.</LI>
                <LI>Inactividad prolongada (m&aacute;s de doce meses).</LI>
                <LI>Requerimiento de autoridad judicial o administrativa.</LI>
                <LI>Riesgo para la seguridad de la Plataforma o de otros Usuarios.</LI>
              </UL>
              <H3>14.3. Efectos</H3>
              <P>
                Tras la terminaci&oacute;n, TurnoLink podr&aacute; eliminar datos transcurridos 30 d&iacute;as, salvo obligaci&oacute;n legal de conservarlos. Las cl&aacute;usulas de propiedad intelectual, limitaci&oacute;n de responsabilidad, indemnizaci&oacute;n y ley aplicable sobreviven a la terminaci&oacute;n.
              </P>
            </Section>

            <Section num="15" title="Modificaciones a los T&eacute;rminos">
              <P>
                TurnoLink puede modificar estos T&eacute;rminos con aviso de al menos quince (15) d&iacute;as por email. El uso continuado despu&eacute;s de la vigencia implica aceptaci&oacute;n. Si no est&aacute; de acuerdo, puede cancelar su cuenta antes de la entrada en vigencia.
              </P>
            </Section>

            <Section num="16" title="Ley Aplicable y Jurisdicci&oacute;n">
              <P>
                Estos T&eacute;rminos se rigen por las leyes de la Rep&uacute;blica Argentina (CCyCN, Ley 24.240, Ley 25.326). Para controversias, las partes se someten a los <B>Tribunales Nacionales Ordinarios en lo Comercial de la Ciudad Aut&oacute;noma de Buenos Aires</B>, salvo que la legislaci&oacute;n de defensa del consumidor otorgue opci&oacute;n de litigar en domicilio del Usuario.
              </P>
            </Section>

            <Section num="17" title="Resoluci&oacute;n de Disputas">
              <P>
                Antes de iniciar acci&oacute;n judicial, las partes acuerdan un intento de soluci&oacute;n amigable mediante comunicaci&oacute;n a soporte@turnolink.mubitt.com, con plazo de treinta (30) d&iacute;as h&aacute;biles. El consumidor podr&aacute; recurrir al Sistema Nacional de Arbitraje de Consumo.
              </P>
            </Section>

            <Section num="18" title="Fuerza Mayor">
              <P>
                TurnoLink no ser&aacute; responsable por incumplimientos causados por fuerza mayor o caso fortuito: desastres naturales, pandemias, conflictos b&eacute;licos, huelgas, interrupciones de telecomunicaciones, ataques cibern&eacute;ticos, cambios legislativos u otras circunstancias fuera del control razonable (art. 1730 y 1731 CCyCN).
              </P>
            </Section>

            <Section num="19" title="Disposiciones Generales">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MiniCard title="Acuerdo completo" text="Estos T&eacute;rminos, junto con la Pol&iacute;tica de Privacidad, constituyen el acuerdo completo entre el Usuario y TurnoLink." />
                <MiniCard title="Divisibilidad" text="Si alguna disposici&oacute;n fuera declarada inv&aacute;lida, las restantes contin&uacute;an en plena vigencia." />
                <MiniCard title="Renuncia" text="La omisi&oacute;n de TurnoLink en ejercer un derecho no constituye renuncia al mismo." />
                <MiniCard title="Cesi&oacute;n" text="El Usuario no puede ceder su cuenta sin autorizaci&oacute;n escrita. TurnoLink puede ceder libremente en caso de fusi&oacute;n o adquisici&oacute;n." />
              </div>
              <P>
                Comunicaciones: todas las notificaciones se env&iacute;an al email registrado. Contacto: <B>soporte@turnolink.mubitt.com</B>. Idioma prevaleciente: espa&ntilde;ol.
              </P>
            </Section>

            {/* Cierre */}
            <div className="mt-16 pt-8 border-t border-white/[0.06]">
              <p className="text-white/30 text-sm leading-relaxed">
                Al utilizar TurnoLink, usted confirma que ha le&iacute;do y aceptado estos T&eacute;rminos y Condiciones en su totalidad.
              </p>
              <p className="text-white/30 text-sm mt-3">
                Contacto: <span className="text-white/50">soporte@turnolink.mubitt.com</span>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

/* ── Reusable sub-components ── */

function Section({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-8 relative overflow-hidden">
      <span className="absolute top-4 right-6 text-white/[0.03] text-6xl font-bold leading-none pointer-events-none select-none">
        {num}
      </span>
      <h2 className="text-white font-medium text-xl sm:text-2xl tracking-[-0.5px] mb-5 relative z-10">
        {title}
      </h2>
      <div className="relative z-10 space-y-4">{children}</div>
    </section>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="text-white/80 font-medium text-base tracking-[-0.3px] mt-6 mb-2">{children}</h3>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-white/45 text-[15px] leading-[26px] tracking-[-0.2px]">{children}</p>;
}

function B({ children }: { children: React.ReactNode }) {
  return <strong className="text-white/70 font-medium">{children}</strong>;
}

function UL({ children }: { children: React.ReactNode }) {
  return <ul className="space-y-2 ml-1">{children}</ul>;
}

function LI({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-white/45 text-[15px] leading-[26px] tracking-[-0.2px]">
      <span className="w-1.5 h-1.5 rounded-full bg-white/20 mt-[10px] flex-shrink-0" />
      <span>{children}</span>
    </li>
  );
}

function Highlight({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white/[0.04] border border-white/[0.08] p-5 my-4">
      <p className="text-white/60 text-[15px] leading-[26px] tracking-[-0.2px] font-medium">{children}</p>
    </div>
  );
}

function MiniCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
      <h4 className="text-white/70 font-medium text-sm mb-1.5">{title}</h4>
      <p className="text-white/35 text-xs leading-relaxed">{text}</p>
    </div>
  );
}
