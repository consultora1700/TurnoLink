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
  title: 'Política de Privacidad — TurnoLink',
  description:
    'Política de privacidad de TurnoLink. Cómo recopilamos, usamos, almacenamos y protegemos tus datos personales conforme a la Ley 25.326.',
};

export default function PrivacidadPage() {
  return (
    <div
      className={`${dmSans.variable} font-[family-name:var(--font-dm-sans)] antialiased min-h-screen bg-black text-white`}
      style={{ colorScheme: 'dark' }}
    >
      <Navbar />

      {/* Hero */}
      <section className="pt-32 lg:pt-40 pb-12 px-5 lg:px-10 relative overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-white/[0.02] blur-[140px] pointer-events-none" />
        <div className="max-w-[860px] mx-auto relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-sm text-white/80 tracking-tight">
              Documento legal
            </span>
            <Link
              href="/terminos"
              className="text-sm text-white/40 hover:text-white/70 transition-colors"
            >
              T&eacute;rminos y condiciones &rarr;
            </Link>
          </div>
          <h1 className="text-[36px] sm:text-[48px] lg:text-[60px] font-normal leading-[1.05] tracking-[-2px] lg:tracking-[-3px]">
            <span className="text-white">Pol&iacute;tica de</span>{' '}
            <span className="text-white/50">Privacidad</span>
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

            <Section num="01" title="Introducci&oacute;n">
              <P>
                La presente Pol&iacute;tica de Privacidad describe c&oacute;mo Mubitt SAS, operadora de la plataforma TurnoLink (<B>&ldquo;TurnoLink&rdquo;</B>, <B>&ldquo;nosotros&rdquo;</B>), recopila, utiliza, almacena, protege y comparte datos personales de los usuarios y de los clientes finales que interact&uacute;an con la Plataforma.
              </P>
              <P>
                Esta Pol&iacute;tica se redacta en cumplimiento de la <B>Ley 25.326 de Protecci&oacute;n de Datos Personales</B>, su Decreto Reglamentario 1558/2001, las disposiciones de la <B>Agencia de Acceso a la Informaci&oacute;n P&uacute;blica (AAIP)</B> y dem&aacute;s normativa aplicable.
              </P>
              <P>
                Al utilizar la Plataforma, usted presta su consentimiento libre, expreso e informado para el tratamiento de sus datos conforme a esta Pol&iacute;tica.
              </P>
            </Section>

            <Section num="02" title="Responsable del Tratamiento">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <MiniCard title="Raz&oacute;n social" text="Mubitt SAS" />
                <MiniCard title="Plataforma" text="TurnoLink" />
                <MiniCard title="Domicilio" text="Rep&uacute;blica Argentina" />
                <MiniCard title="Contacto" text="soporte@turnolink.mubitt.com" />
              </div>
              <P>
                Cuando un Usuario Negocio carga datos de sus propios clientes, dicho Usuario act&uacute;a como <B>responsable del tratamiento</B>. TurnoLink act&uacute;a como <B>encargado del tratamiento</B>, procesando datos &uacute;nicamente para la prestaci&oacute;n del servicio.
              </P>
            </Section>

            <Section num="03" title="Datos Personales que Recopilamos">
              <H3>3.1. Datos de registro</H3>
              <UL>
                <LI><B>Identificaci&oacute;n:</B> Nombre completo, direcci&oacute;n de email.</LI>
                <LI><B>Credenciales:</B> Contrase&ntilde;a (almacenada &uacute;nicamente como hash cifrado con bcrypt, nunca en texto plano).</LI>
                <LI><B>Tipo de cuenta:</B> Negocio, Profesional o Buscador de Talento.</LI>
                <LI><B>Datos del negocio:</B> Nombre comercial, direcci&oacute;n, ciudad, tel&eacute;fono, redes sociales, sitio web, logotipo e im&aacute;genes.</LI>
              </UL>

              <H3>3.2. Datos generados durante el uso</H3>
              <UL>
                <LI><B>Servicios:</B> Nombres, descripciones, precios, duraciones.</LI>
                <LI><B>Empleados/profesionales:</B> Nombre, email, tel&eacute;fono, especialidad, biograf&iacute;a, horarios.</LI>
                <LI><B>Clientes del Usuario:</B> Nombre, tel&eacute;fono, email, notas, historial de reservas (cargados por el Usuario Negocio, quien es responsable).</LI>
                <LI><B>Reservas:</B> Fecha, hora, servicio, profesional, estado, notas.</LI>
                <LI><B>Pagos:</B> Montos, estado, m&eacute;todo, email del pagador, IDs de transacci&oacute;n de Mercado Pago.</LI>
                <LI><B>Rese&ntilde;as:</B> Valoraciones (1-5) y comentarios.</LI>
                <LI><B>Suscripci&oacute;n:</B> Plan contratado, fechas, estado de facturaci&oacute;n.</LI>
              </UL>

              <H3>3.3. Perfiles profesionales</H3>
              <UL>
                <LI>Nombre, email, tel&eacute;fono, imagen, especialidad, categor&iacute;a, biograf&iacute;a.</LI>
                <LI>Experiencia, habilidades, certificaciones, disponibilidad, zonas.</LI>
                <LI><B>Consentimiento:</B> Fecha y direcci&oacute;n IP al aceptar publicaci&oacute;n del perfil.</LI>
              </UL>

              <H3>3.4. Datos autom&aacute;ticos</H3>
              <UL>
                <LI><B>Acceso:</B> Direcci&oacute;n IP, navegador, sistema operativo, fecha/hora (logs de auditor&iacute;a).</LI>
                <LI><B>Cookies de sesi&oacute;n:</B> Necesarias para autenticaci&oacute;n (ver secci&oacute;n 7).</LI>
              </UL>

              <Highlight>
                No recopilamos: n&uacute;meros de tarjetas de cr&eacute;dito (procesados por Mercado Pago), datos biom&eacute;tricos, historias cl&iacute;nicas, geolocalizaci&oacute;n en tiempo real, ni datos de menores de edad.
              </Highlight>
            </Section>

            <Section num="04" title="Finalidad del Tratamiento">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FinalidadCard
                  title="Prestaci&oacute;n del servicio"
                  items={['Crear y gestionar cuentas', 'Proveer funcionalidades de reservas y pagos', 'Procesar suscripciones y se&ntilde;as', 'Administrar perfiles profesionales']}
                />
                <FinalidadCard
                  title="Comunicaciones"
                  items={['Verificaci&oacute;n de cuenta', 'Recordatorios de turnos', 'Notificaciones de reservas', 'Avisos de suscripci&oacute;n']}
                />
                <FinalidadCard
                  title="Seguridad"
                  items={['Detectar accesos no autorizados', 'Registrar logs de auditor&iacute;a', 'Monitorear actividades sospechosas', 'Proteger integridad de datos']}
                />
                <FinalidadCard
                  title="Legal y mejora"
                  items={['Cumplir obligaciones fiscales', 'Responder requerimientos judiciales', 'An&aacute;lisis agregado y anonimizado', 'Estad&iacute;sticas internas']}
                />
              </div>
              <Highlight>
                No utilizamos datos personales para perfilado automatizado, decisiones automatizadas con efectos jur&iacute;dicos, ni para venta a terceros con fines publicitarios.
              </Highlight>
            </Section>

            <Section num="05" title="Base Legal del Tratamiento">
              <P>El tratamiento se fundamenta en las siguientes bases legales conforme a la Ley 25.326:</P>
              <UL>
                <LI><B>Consentimiento del titular (art. 5):</B> Otorgado al registrarse. En perfiles profesionales, consentimiento espec&iacute;fico con registro de fecha e IP.</LI>
                <LI><B>Ejecuci&oacute;n contractual (art. 5 inc. 2.c):</B> El tratamiento es necesario para la prestaci&oacute;n del servicio contratado.</LI>
                <LI><B>Inter&eacute;s leg&iacute;timo:</B> Seguridad de la plataforma, prevenci&oacute;n de fraude y mejora del servicio.</LI>
                <LI><B>Cumplimiento legal:</B> Retenci&oacute;n de registros por requisitos fiscales, contables o judiciales.</LI>
              </UL>
            </Section>

            <Section num="06" title="Compartir Datos con Terceros">
              <Highlight>
                TurnoLink no vende, alquila ni comercializa datos personales. Compartimos datos &uacute;nicamente en los siguientes supuestos:
              </Highlight>

              <H3>6.1. Mercado Pago (MercadoLibre S.R.L.)</H3>
              <P>
                Procesamos pagos a trav&eacute;s de Mercado Pago. Datos compartidos: monto, referencia, email del pagador. Los datos de tarjetas son procesados exclusivamente por Mercado Pago bajo PCI-DSS.
              </P>

              <H3>6.2. Resend (Resend, Inc.)</H3>
              <P>
                Servicio de env&iacute;o de emails transaccionales. Datos compartidos: email del destinatario, nombre y contenido del mensaje. Act&uacute;a como encargado del tratamiento.
              </P>

              <H3>6.3. Infraestructura</H3>
              <P>
                Los datos se almacenan en servidores en la Rep&uacute;blica Argentina. Si se utilizan servicios en la nube en el futuro, se seleccionar&aacute;n proveedores con garant&iacute;as adecuadas.
              </P>

              <H3>6.4. Autoridades y operaciones corporativas</H3>
              <P>
                Podremos divulgar datos cuando sea requerido por ley u orden judicial (art. 11 Ley 25.326). En caso de fusi&oacute;n o adquisici&oacute;n, los datos podr&aacute;n transferirse al sucesor.
              </P>

              <H3>6.5. Visibilidad p&uacute;blica</H3>
              <UL>
                <LI><B>P&aacute;gina de reservas:</B> Nombre del negocio, servicios, precios, horarios, profesionales, direcci&oacute;n, redes.</LI>
                <LI><B>Perfiles profesionales:</B> Solo si el profesional activ&oacute; visibilidad con consentimiento expreso.</LI>
                <LI><B>Rese&ntilde;as:</B> Nombre del cliente, valoraci&oacute;n y comentario.</LI>
              </UL>
            </Section>

            <Section num="07" title="Cookies y Tecnolog&iacute;as Similares">
              <P>TurnoLink utiliza &uacute;nicamente cookies estrictamente necesarias:</P>
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.08]">
                      <th className="text-left py-3 pr-4 font-medium text-white/70 text-xs uppercase tracking-wider">Cookie</th>
                      <th className="text-left py-3 pr-4 font-medium text-white/70 text-xs uppercase tracking-wider">Finalidad</th>
                      <th className="text-left py-3 pr-4 font-medium text-white/70 text-xs uppercase tracking-wider">Duraci&oacute;n</th>
                      <th className="text-left py-3 font-medium text-white/70 text-xs uppercase tracking-wider">Tipo</th>
                    </tr>
                  </thead>
                  <tbody className="text-white/40 text-[13px]">
                    <tr className="border-b border-white/[0.04]">
                      <td className="py-3 pr-4 font-mono text-white/50 text-xs">session-token</td>
                      <td className="py-3 pr-4">Mantener sesi&oacute;n autenticada</td>
                      <td className="py-3 pr-4">7 d&iacute;as</td>
                      <td className="py-3">Esencial</td>
                    </tr>
                    <tr className="border-b border-white/[0.04]">
                      <td className="py-3 pr-4 font-mono text-white/50 text-xs">csrf-token</td>
                      <td className="py-3 pr-4">Protecci&oacute;n CSRF</td>
                      <td className="py-3 pr-4">Sesi&oacute;n</td>
                      <td className="py-3">Seguridad</td>
                    </tr>
                    <tr className="border-b border-white/[0.04]">
                      <td className="py-3 pr-4 font-mono text-white/50 text-xs">callback-url</td>
                      <td className="py-3 pr-4">Redirecci&oacute;n post-login</td>
                      <td className="py-3 pr-4">Sesi&oacute;n</td>
                      <td className="py-3">Esencial</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 font-mono text-white/50 text-xs">turnolink-theme</td>
                      <td className="py-3 pr-4">Preferencia tema claro/oscuro</td>
                      <td className="py-3 pr-4">Persistente</td>
                      <td className="py-3">Preferencia</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <Highlight>
                No utilizamos cookies de terceros con fines publicitarios, de tracking ni de an&aacute;lisis. No implementamos Google Analytics, Facebook Pixel ni ning&uacute;n servicio de rastreo.
              </Highlight>
            </Section>

            <Section num="08" title="Seguridad de los Datos">
              <P>
                Implementamos medidas t&eacute;cnicas y organizativas conforme al art&iacute;culo 9 de la Ley 25.326:
              </P>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <MiniCard title="Contrase&ntilde;as" text="Almacenadas con bcrypt (factor 12). Nunca en texto plano." />
                <MiniCard title="Datos sensibles" text="Cifrados con AES-256-GCM con vectores de inicializaci&oacute;n &uacute;nicos." />
                <MiniCard title="2FA disponible" text="TOTP con c&oacute;digos de respaldo cifrados con SHA-256." />
                <MiniCard title="Sesiones" text="JWT con TTL de 15 min, cookies HttpOnly y SameSite." />
                <MiniCard title="Transporte" text="Todo el tr&aacute;fico sobre HTTPS (TLS 1.2+)." />
                <MiniCard title="Auditor&iacute;a" text="Registro completo de acciones cr&iacute;ticas con IP y timestamp." />
                <MiniCard title="Aislamiento" text="Arquitectura multi-tenant con datos l&oacute;gicamente separados." />
                <MiniCard title="Alertas" text="Monitoreo de intentos fallidos de login y actividades sospechosas." />
              </div>
              <P>
                En caso de brecha de seguridad, notificaremos a los afectados y a la AAIP en un plazo no mayor a setenta y dos (72) horas desde su detecci&oacute;n.
              </P>
            </Section>

            <Section num="09" title="Retenci&oacute;n de Datos">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.08]">
                      <th className="text-left py-3 pr-4 font-medium text-white/70 text-xs uppercase tracking-wider">Tipo de dato</th>
                      <th className="text-left py-3 pr-4 font-medium text-white/70 text-xs uppercase tracking-wider">Retenci&oacute;n</th>
                      <th className="text-left py-3 font-medium text-white/70 text-xs uppercase tracking-wider">Motivo</th>
                    </tr>
                  </thead>
                  <tbody className="text-white/40 text-[13px]">
                    <tr className="border-b border-white/[0.04]">
                      <td className="py-3 pr-4 text-white/50">Datos de cuenta</td>
                      <td className="py-3 pr-4">Cuenta activa + 30 d&iacute;as</td>
                      <td className="py-3">Prestaci&oacute;n del servicio</td>
                    </tr>
                    <tr className="border-b border-white/[0.04]">
                      <td className="py-3 pr-4 text-white/50">Reservas y turnos</td>
                      <td className="py-3 pr-4">Mientras la cuenta est&eacute; activa</td>
                      <td className="py-3">Historial operativo</td>
                    </tr>
                    <tr className="border-b border-white/[0.04]">
                      <td className="py-3 pr-4 text-white/50">Pagos y transacciones</td>
                      <td className="py-3 pr-4">10 a&ntilde;os</td>
                      <td className="py-3">Obligaci&oacute;n fiscal (Ley 11.683)</td>
                    </tr>
                    <tr className="border-b border-white/[0.04]">
                      <td className="py-3 pr-4 text-white/50">Logs de auditor&iacute;a</td>
                      <td className="py-3 pr-4">2 a&ntilde;os</td>
                      <td className="py-3">Seguridad y prevenci&oacute;n</td>
                    </tr>
                    <tr className="border-b border-white/[0.04]">
                      <td className="py-3 pr-4 text-white/50">Perfiles profesionales</td>
                      <td className="py-3 pr-4">Hasta solicitud de eliminaci&oacute;n</td>
                      <td className="py-3">Consentimiento del titular</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 text-white/50">Tokens de verificaci&oacute;n</td>
                      <td className="py-3 pr-4">24 horas</td>
                      <td className="py-3">Verificaci&oacute;n de cuenta</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <P>
                Transcurridos los plazos, los datos ser&aacute;n eliminados de forma segura o anonimizados de manera irreversible.
              </P>
            </Section>

            <Section num="10" title="Derechos del Titular de los Datos">
              <P>Conforme a la Ley 25.326, todo titular tiene derecho a:</P>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 mb-4">
                <MiniCard title="Acceso (art. 14)" text="Solicitar informaci&oacute;n sobre sus datos, finalidad, origen y destinatarios. Respuesta en 10 d&iacute;as, gratuito cada 6 meses." />
                <MiniCard title="Rectificaci&oacute;n (art. 16)" text="Corregir datos inexactos o desactualizados. Puede hacerlo directamente desde configuraci&oacute;n." />
                <MiniCard title="Supresi&oacute;n (art. 16)" text="Eliminar datos cuando ya no sean necesarios, retire consentimiento o el tratamiento sea il&iacute;cito. Plazo: 10 d&iacute;as." />
                <MiniCard title="Oposici&oacute;n" text="Oponerse al tratamiento en ciertas circunstancias, incluyendo comunicaciones comerciales no esenciales." />
              </div>

              <H3>Portabilidad</H3>
              <P>
                Puede solicitar una copia de sus datos en formato estructurado (CSV o JSON).
              </P>

              <H3>C&oacute;mo ejercer estos derechos</H3>
              <P>
                Env&iacute;e un email a <B>soporte@turnolink.mubitt.com</B> con asunto &ldquo;Ejercicio de Derecho &mdash; [tipo]&rdquo;, indicando nombre completo, email registrado y descripci&oacute;n del pedido. Los Usuarios Profesionales pueden solicitar eliminaci&oacute;n completa e inmediata de su perfil.
              </P>

              <Highlight>
                Si considera que el tratamiento no cumple con la normativa, tiene derecho a reclamar ante la Agencia de Acceso a la Informaci&oacute;n P&uacute;blica (AAIP) &mdash; Av. Pte. Julio A. Roca 710, Piso 2, CABA &mdash; www.argentina.gob.ar/aaip
              </Highlight>
            </Section>

            <Section num="11" title="Datos de Menores de Edad">
              <P>
                La Plataforma est&aacute; dirigida a personas mayores de dieciocho (18) a&ntilde;os. No recopilamos intencionalmente datos de menores. Si tomamos conocimiento de datos de un menor, procederemos a eliminarlos de inmediato. Contacto para padres/tutores: <B>soporte@turnolink.mubitt.com</B>.
              </P>
            </Section>

            <Section num="12" title="Transferencias Internacionales">
              <P>
                Los datos se almacenan principalmente en servidores en Argentina. Ciertos proveedores (Resend para emails) pueden procesar datos en servidores en Estados Unidos. En tales casos, nos aseguramos de que las transferencias cuenten con garant&iacute;as adecuadas conforme a la Disposici&oacute;n DNPDP N&ordm; 60-E/2016 y al art&iacute;culo 12 de la Ley 25.326.
              </P>
            </Section>

            <Section num="13" title="Notificaciones Push">
              <P>
                La Plataforma puede solicitar permiso para enviar notificaciones push al navegador. Es completamente <B>opcional</B> y requiere consentimiento expl&iacute;cito. Los datos t&eacute;cnicos de suscripci&oacute;n push se almacenan &uacute;nicamente para el env&iacute;o y pueden revocarse desde el navegador.
              </P>
            </Section>

            <Section num="14" title="Cambios a esta Pol&iacute;tica">
              <P>
                TurnoLink puede modificar esta Pol&iacute;tica con aviso de al menos quince (15) d&iacute;as por email. El uso continuado implica aceptaci&oacute;n. Si no est&aacute; de acuerdo, deje de usar la Plataforma y solicite eliminaci&oacute;n de su cuenta.
              </P>
            </Section>

            <Section num="15" title="Contacto">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <MiniCard title="Email" text="soporte@turnolink.mubitt.com" />
                <MiniCard title="Asunto sugerido" text="&ldquo;Privacidad &mdash; [consulta]&rdquo;" />
                <MiniCard title="Plazo de respuesta" text="10 d&iacute;as corridos" />
              </div>
            </Section>

            {/* Cierre */}
            <div className="mt-16 pt-8 border-t border-white/[0.06]">
              <p className="text-white/30 text-sm leading-relaxed">
                Al utilizar TurnoLink, usted confirma que ha le&iacute;do y aceptado esta Pol&iacute;tica de Privacidad en su totalidad.
              </p>
              <p className="text-white/30 text-sm mt-3">
                Contacto: <span className="text-white/50">soporte@turnolink.mubitt.com</span>
              </p>
              <p className="text-white/30 text-sm mt-2">
                Autoridad de control: <span className="text-white/50">Agencia de Acceso a la Informaci&oacute;n P&uacute;blica (AAIP)</span> &mdash; <a href="https://www.argentina.gob.ar/aaip" className="text-white/50 underline decoration-white/20 hover:decoration-white/50 transition-colors" target="_blank" rel="noopener noreferrer">www.argentina.gob.ar/aaip</a>
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

function FinalidadCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
      <h4 className="text-white/70 font-medium text-sm mb-3">{title}</h4>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-white/35 text-xs leading-relaxed">
            <span className="w-1 h-1 rounded-full bg-white/20 mt-[6px] flex-shrink-0" />
            <span dangerouslySetInnerHTML={{ __html: item }} />
          </li>
        ))}
      </ul>
    </div>
  );
}
