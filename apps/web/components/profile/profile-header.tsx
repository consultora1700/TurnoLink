'use client';

import { TalentProfile } from '@/lib/api';
import {
  resolveTemplate,
  TEMPLATE_STYLES,
  type TemplateName,
} from '@/lib/profile-templates';
import { Badge } from '@/components/ui/badge';
import {
  Award,
  Briefcase,
  Clock,
  MapPin,
  UserCheck,
  Sparkles,
  GraduationCap,
  User,
  Calendar,
} from 'lucide-react';

interface ProfileHeaderProps {
  profile: TalentProfile;
  compact?: boolean;
  className?: string;
}

function getInitials(name: string | undefined | null) {
  if (!name) return '??';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function availabilityLabel(val: string | null) {
  switch (val) {
    case 'full-time': return 'Jornada completa';
    case 'part-time': return 'Medio turno';
    case 'freelance': return 'Independiente';
    default: return val;
  }
}

// ─── Skill pill variants ──────────────────────────────────
function SkillPill({ skill, variant }: { skill: string; variant: string }) {
  const styles: Record<string, string> = {
    colorful: 'bg-gradient-to-r from-cyan-50 to-teal-50 text-cyan-700 dark:from-cyan-900/30 dark:to-teal-900/30 dark:text-cyan-300 border-cyan-200/60 dark:border-cyan-800/60',
    outline: 'bg-teal-50/50 border-teal-200 text-teal-700 dark:bg-teal-900/20 dark:border-teal-700 dark:text-teal-300',
    subtle: 'bg-slate-50 text-slate-600 dark:bg-slate-800/80 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    tech: 'bg-cyan-50/70 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-300 border-cyan-200/50 dark:border-cyan-700/50 font-mono',
    plain: 'bg-gray-50 text-gray-600 dark:bg-gray-800/60 dark:text-gray-300 border-gray-200 dark:border-gray-700',
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border ${styles[variant] || styles.plain}`}>
      {skill}
    </span>
  );
}

// ─── Certification badge ──────────────────────────────────
function CertBadge({ cert, template }: { cert: string; template: TemplateName }) {
  const colors: Record<TemplateName, string> = {
    vibrant: 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-300',
    clinical: 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300',
    corporate: 'bg-slate-50 border-slate-300 text-slate-700 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300',
    modern: 'bg-violet-50 border-violet-200 text-violet-700 dark:bg-violet-900/20 dark:border-violet-700 dark:text-violet-300',
    minimal: 'bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg border ${colors[template]}`}>
      <Award className="h-3 w-3 shrink-0" />
      {cert}
    </span>
  );
}

// ─── Stats bar ────────────────────────────────────────────
function StatsBar({ profile, template }: { profile: TalentProfile; template: TemplateName }) {
  const items: Array<{ icon: React.ElementType; label: string; value: string }> = [];

  if (profile.yearsExperience != null) {
    items.push({
      icon: Briefcase,
      label: 'Experiencia',
      value: `${profile.yearsExperience} ${profile.yearsExperience === 1 ? 'año' : 'años'}`,
    });
  }

  if (profile.availability) {
    items.push({
      icon: Clock,
      label: 'Disponibilidad',
      value: availabilityLabel(profile.availability) || '',
    });
  }

  if (profile.experiences?.length > 0) {
    items.push({
      icon: Calendar,
      label: 'Posiciones',
      value: `${profile.experiences.length} ${profile.experiences.length === 1 ? 'cargo' : 'cargos'}`,
    });
  }

  if (items.length === 0) return null;

  const bgStyles: Record<TemplateName, string> = {
    vibrant: 'bg-gradient-to-r from-teal-50/80 to-cyan-50/80 dark:from-teal-900/20 dark:to-cyan-900/20 border-teal-100 dark:border-teal-800/40',
    clinical: 'bg-white dark:bg-gray-900/40 border-teal-100 dark:border-teal-800/40',
    corporate: 'bg-slate-50/80 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700/40',
    modern: 'bg-gradient-to-r from-blue-50/50 to-emerald-50/50 dark:from-blue-900/10 dark:to-emerald-900/10 border-blue-100/50 dark:border-blue-800/30',
    minimal: 'bg-gray-50/80 dark:bg-gray-800/30 border-gray-100 dark:border-gray-700/40',
  };

  return (
    <div className={`mx-4 sm:mx-6 mt-3 rounded-xl border p-3 ${bgStyles[template]}`}>
      <div className={`flex flex-wrap gap-x-5 gap-y-2.5`}>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex items-center gap-2">
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center shrink-0">
                <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium leading-none">{item.label}</p>
                <p className="text-xs sm:text-sm font-semibold mt-0.5 truncate">{item.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Header area per template ─────────────────────────────
function HeaderArea({
  profile,
  template,
  style,
  compact,
}: {
  profile: TalentProfile;
  template: TemplateName;
  style: (typeof TEMPLATE_STYLES)[TemplateName];
  compact?: boolean;
}) {
  const hasCover = !!profile.coverImage;

  // Shared badges
  const renderBadges = (specialtyClass?: string) => (
    <div className="flex flex-wrap gap-1.5 mt-2.5">
      {profile.specialty && (
        <Badge className={`text-xs h-6 px-2.5 ${specialtyClass || 'bg-secondary text-secondary-foreground hover:bg-secondary'}`}>
          {profile.specialty}
        </Badge>
      )}
      {profile.openToWork && (
        <Badge className="text-xs h-6 px-2.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 border border-emerald-200/50 dark:border-emerald-700/50">
          <UserCheck className="mr-1 h-3 w-3" />
          Disponible
        </Badge>
      )}
    </div>
  );

  // ─── Vibrant ───
  if (template === 'vibrant') {
    return (
      <div className="relative">
        {/* Gradient header */}
        <div className={`${hasCover ? '' : style.headerBg + ' ' + style.headerBgDark} ${compact ? 'h-20 sm:h-28' : 'h-24 sm:h-32'} overflow-hidden`}>
          {hasCover ? (
            <img src={profile.coverImage!} alt="" className="h-full w-full object-cover object-center" />
          ) : (
            <div className="absolute inset-0">
              <div className="absolute inset-0 opacity-20">
                <svg className="h-full w-full" viewBox="0 0 400 200" preserveAspectRatio="none">
                  <circle cx="60" cy="40" r="90" fill="white" opacity="0.1" />
                  <circle cx="340" cy="160" r="70" fill="white" opacity="0.08" />
                  <circle cx="200" cy="100" r="40" fill="white" opacity="0.06" />
                </svg>
              </div>
            </div>
          )}
        </div>
        {/* Profile info — avatar overlaps gradient, text stays below */}
        <div className="px-4 sm:px-6 pt-1.5 pb-3">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="-mt-12 sm:-mt-14 shrink-0 relative z-10">
              {profile.image ? (
                <div className={`${style.avatarSize} ${style.avatarShape} ${style.avatarRing} overflow-hidden bg-muted`}>
                  <img src={profile.image} alt={profile.name} className="h-full w-full object-cover object-center" />
                </div>
              ) : (
                <div className={`${style.avatarSize} ${style.avatarShape} ${style.avatarRing} flex items-center justify-center bg-gradient-to-br from-teal-500 to-cyan-600 text-xl sm:text-2xl font-bold text-white`}>
                  {getInitials(profile.name)}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-2xl font-bold truncate text-gray-900 dark:text-gray-100">{profile.name}</h2>
              {profile.headline && (
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">{profile.headline}</p>
              )}
              {renderBadges()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Clinical ───
  if (template === 'clinical') {
    return (
      <div className={`${style.headerBg} ${style.headerBgDark} p-4 sm:p-6 border-b border-teal-200/40 dark:border-teal-700/50`}>
        <div className="border-l-4 border-teal-500 dark:border-teal-400 pl-3 sm:pl-5">
          <div className="flex items-center gap-3 sm:gap-4">
            {profile.image ? (
              <div className={`${style.avatarSize} ${style.avatarShape} ${style.avatarRing} overflow-hidden shrink-0 bg-muted`}>
                <img src={profile.image} alt={profile.name} className="h-full w-full object-cover object-center" />
              </div>
            ) : (
              <div className={`${style.avatarSize} ${style.avatarShape} ${style.avatarRing} flex items-center justify-center bg-teal-100 text-teal-700 dark:bg-teal-800 dark:text-teal-200 text-lg font-bold`}>
                {getInitials(profile.name)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-2xl font-bold truncate text-gray-900 dark:text-white">{profile.name}</h2>
              {profile.headline && (
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 truncate mt-0.5">{profile.headline}</p>
              )}
              {renderBadges('bg-teal-100 text-teal-700 dark:bg-teal-800/60 dark:text-teal-200 hover:bg-teal-100 dark:hover:bg-teal-800/60 border border-transparent dark:border-teal-600/40')}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Corporate ───
  if (template === 'corporate') {
    return (
      <div>
        <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 dark:from-slate-600 dark:via-slate-500 dark:to-slate-600 h-2.5 rounded-t-lg" />
        <div className="p-4 sm:p-6 bg-slate-50/50 dark:bg-gray-800/30 border-b border-slate-200/50 dark:border-slate-600/30">
          <div className="flex items-center gap-3 sm:gap-4">
            {profile.image ? (
              <div className={`${style.avatarSize} ${style.avatarShape} ${style.avatarRing} overflow-hidden shrink-0 bg-muted`}>
                <img src={profile.image} alt={profile.name} className="h-full w-full object-cover object-center" />
              </div>
            ) : (
              <div className={`${style.avatarSize} ${style.avatarShape} ${style.avatarRing} flex items-center justify-center bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-200 text-base font-bold`}>
                {getInitials(profile.name)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-2xl font-bold truncate text-gray-900 dark:text-white">{profile.name}</h2>
              {profile.headline && (
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 truncate mt-0.5">{profile.headline}</p>
              )}
              {renderBadges('bg-slate-100 text-slate-700 dark:bg-slate-700/60 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60')}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Modern ───
  if (template === 'modern') {
    return (
      <div className="relative">
        {/* Gradient header */}
        <div className={`${hasCover ? '' : style.headerBg + ' ' + style.headerBgDark} ${compact ? 'h-16 sm:h-24' : 'h-24 sm:h-32'} overflow-hidden`}>
          {hasCover ? (
            <img src={profile.coverImage!} alt="" className="h-full w-full object-cover object-center" />
          ) : (
            <div className="absolute inset-0 opacity-15">
              <svg className="h-full w-full" viewBox="0 0 400 200" preserveAspectRatio="none">
                <polygon points="0,200 200,0 400,200" fill="white" opacity="0.06" />
                <polygon points="100,200 300,50 400,200" fill="white" opacity="0.04" />
                <rect x="50" y="30" width="100" height="100" rx="10" fill="white" opacity="0.03" transform="rotate(15 100 80)" />
              </svg>
            </div>
          )}
        </div>
        {/* Profile info — avatar overlaps gradient, text stays below */}
        <div className="px-4 sm:px-6 pt-1.5 pb-3">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="-mt-10 sm:-mt-12 shrink-0 relative z-10">
              {profile.image ? (
                <div className={`${style.avatarSize} ${style.avatarShape} ${style.avatarRing} overflow-hidden bg-muted`}>
                  <img src={profile.image} alt={profile.name} className="h-full w-full object-cover object-center" />
                </div>
              ) : (
                <div className={`${style.avatarSize} ${style.avatarShape} ${style.avatarRing} flex items-center justify-center bg-gradient-to-br from-blue-500 to-emerald-500 text-lg sm:text-xl font-bold text-white`}>
                  {getInitials(profile.name)}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-2xl font-bold truncate text-gray-900 dark:text-gray-100">{profile.name}</h2>
              {profile.headline && (
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">{profile.headline}</p>
              )}
              {renderBadges()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Minimal (default) ───
  return (
    <div className={`${style.headerBg} ${style.headerBgDark} p-4 sm:p-6`}>
      <div className="flex items-start gap-3 sm:gap-4">
        {profile.image ? (
          <div className={`${style.avatarSize} ${style.avatarShape} ${style.avatarRing} overflow-hidden shrink-0 bg-muted`}>
            <img src={profile.image} alt={profile.name} className="h-full w-full object-cover object-center" />
          </div>
        ) : (
          <div className={`${style.avatarSize} ${style.avatarShape} ${style.avatarRing} flex items-center justify-center bg-gradient-to-br from-teal-500 to-cyan-600 text-base sm:text-lg font-bold text-white`}>
            {getInitials(profile.name)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="text-lg sm:text-2xl font-bold truncate text-gray-900 dark:text-gray-100">{profile.name}</h2>
          {profile.headline && (
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate mt-0.5">{profile.headline}</p>
          )}
          {renderBadges()}
        </div>
      </div>
    </div>
  );
}

// ─── Section renderers ────────────────────────────────────

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-2 sm:mb-3">
      <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-md bg-muted dark:bg-gray-800 flex items-center justify-center shrink-0">
        <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-500 dark:text-gray-400" />
      </div>
      <h4 className="font-semibold text-xs sm:text-sm text-foreground dark:text-gray-200">{title}</h4>
    </div>
  );
}

function BioSection({ bio }: { bio: string | null }) {
  if (!bio) return null;
  return (
    <div>
      <SectionHeader icon={User} title="Acerca de" />
      <div className="rounded-xl bg-muted/30 border border-border/50 p-3 sm:p-4">
        <p className="text-xs sm:text-sm text-foreground/80 dark:text-gray-300 whitespace-pre-line leading-relaxed">{bio}</p>
      </div>
    </div>
  );
}

function SkillsSection({ skills, variant }: { skills: string[]; variant: string }) {
  if (skills.length === 0) return null;
  return (
    <div>
      <SectionHeader icon={Sparkles} title="Especialidades" />
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <SkillPill key={skill} skill={skill} variant={variant} />
        ))}
      </div>
    </div>
  );
}

function CertificationsSection({ certifications, template }: { certifications: string[]; template: TemplateName }) {
  if (certifications.length === 0) return null;
  return (
    <div>
      <SectionHeader icon={GraduationCap} title="Certificaciones" />
      <div className="flex flex-wrap gap-2">
        {certifications.map((cert) => (
          <CertBadge key={cert} cert={cert} template={template} />
        ))}
      </div>
    </div>
  );
}

function ExperienceSection({ experiences }: { experiences: TalentProfile['experiences'] }) {
  if (experiences.length === 0) return null;
  return (
    <div>
      <SectionHeader icon={Briefcase} title="Experiencia" />
      <div className="space-y-0">
        {experiences.map((exp, i) => (
          <div
            key={exp.id}
            className={`relative pl-5 sm:pl-6 pb-3 sm:pb-4 ${i < experiences.length - 1 ? 'border-l-2 border-border/60 ml-[5px]' : 'ml-[5px]'}`}
          >
            <div className={`absolute left-[-5px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-primary bg-background ${exp.isCurrent ? 'ring-2 ring-primary/20' : ''}`} />

            <div className="rounded-lg bg-muted/30 border border-border/40 p-2.5 sm:p-3 ml-1 sm:ml-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-xs sm:text-sm text-foreground dark:text-gray-100">{exp.role}</p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{exp.businessName}</p>
                </div>
                {exp.isCurrent && (
                  <Badge variant="outline" className="text-[10px] h-5 px-2 bg-primary/5 border-primary/20 text-primary shrink-0">
                    Actual
                  </Badge>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-gray-400 dark:text-gray-500 mt-1">
                {new Date(exp.startDate).toLocaleDateString('es-AR', { month: 'short', year: 'numeric' })}
                {' — '}
                {exp.isCurrent
                  ? 'Presente'
                  : exp.endDate
                    ? new Date(exp.endDate).toLocaleDateString('es-AR', { month: 'short', year: 'numeric' })
                    : ''}
              </p>
              {exp.description && (
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">{exp.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ZonesSection({ zones }: { zones: string[] }) {
  if (zones.length === 0) return null;
  return (
    <div>
      <SectionHeader icon={MapPin} title="Zonas preferidas" />
      <div className="flex flex-wrap gap-2">
        {zones.map((zone) => (
          <Badge key={zone} variant="outline" className="text-xs h-6 sm:h-7 px-2.5 sm:px-3 bg-background text-foreground dark:text-gray-300">
            <MapPin className="mr-1 sm:mr-1.5 h-3 w-3 text-gray-400 dark:text-gray-500" />
            {zone}
          </Badge>
        ))}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────

export function ProfileHeader({ profile, compact, className }: ProfileHeaderProps) {
  const template = resolveTemplate(profile.headerTemplate, profile.category);
  const style = TEMPLATE_STYLES[template];

  const sectionMap: Record<string, React.ReactNode> = {
    bio: <BioSection key="bio" bio={profile.bio} />,
    skills: <SkillsSection key="skills" skills={profile.skills} variant={style.skillVariant} />,
    certifications: <CertificationsSection key="certifications" certifications={profile.certifications} template={template} />,
    experience: <ExperienceSection key="experience" experiences={profile.experiences} />,
    zones: <ZonesSection key="zones" zones={profile.preferredZones} />,
  };

  return (
    <div className={className}>
      <HeaderArea profile={profile} template={template} style={style} compact={compact} />

      {/* Stats bar */}
      <StatsBar profile={profile} template={template} />

      {/* Sections in template-defined order */}
      <div className={`space-y-4 sm:space-y-5 px-4 sm:px-6 ${compact ? 'py-2 sm:py-3' : 'py-3 sm:py-5'}`}>
        {style.sectionOrder.map((section) => sectionMap[section])}
      </div>
    </div>
  );
}
