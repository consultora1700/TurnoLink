'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Loader2,
  Shield,
  Home,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Send,
  User,
  Briefcase,
  Plus,
  Trash2,
  Save,
  Lock,
  Eye,
  EyeOff,
  Award,
  MapPin,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { LandingThemeWrapper, LandingThemeToggle } from '@/components/landing/landing-theme-wrapper';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { publicProfileApi, TalentProposal } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-turnolink.mubitt.com';

// ============ Types ============

interface Experience {
  id: string;
  businessName: string;
  role: string;
  startDate: string;
  endDate?: string | null;
  isCurrent: boolean;
  description?: string | null;
}

interface Profile {
  id: string;
  employeeId: string;
  email: string;
  name: string;
  image?: string | null;
  specialty?: string | null;
  bio?: string | null;
  headline?: string | null;
  yearsExperience?: number | null;
  skills: string;
  certifications: string;
  availability?: string | null;
  preferredZones: string;
  consentedAt?: string | null;
  consentIp?: string | null;
  openToWork: boolean;
  profileVisible: boolean;
  experiences: Experience[];
}

interface EmployeeData {
  id: string;
  name: string;
  email?: string | null;
  image?: string | null;
  specialty?: string | null;
  bio?: string | null;
}

interface TenantData {
  id: string;
  name: string;
  slug: string;
}

interface TokenResponse {
  employee: EmployeeData;
  tenant: TenantData;
  profile: Profile | null;
  tokenUsed: boolean;
}

// ============ Tag Input Component ============

function TagInput({
  tags,
  onChange,
  placeholder,
  suggestions,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder: string;
  suggestions?: string[];
}) {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput('');
    setShowSuggestions(false);
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  const filteredSuggestions = suggestions?.filter(
    (s) => s.toLowerCase().includes(input.toLowerCase()) && !tags.includes(s),
  );

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, i) => (
          <Badge key={i} variant="secondary" className="gap-1 pr-1">
            {tag}
            <button
              type="button"
              onClick={() => removeTag(i)}
              className="ml-1 rounded-full hover:bg-muted p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="relative">
        <Input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setShowSuggestions(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addTag(input);
            }
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={placeholder}
        />
        {showSuggestions && filteredSuggestions && filteredSuggestions.length > 0 && input && (
          <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-md max-h-32 overflow-y-auto">
            {filteredSuggestions.map((s) => (
              <button
                key={s}
                type="button"
                className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
                onMouseDown={(e) => {
                  e.preventDefault();
                  addTag(s);
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============ Experience Card ============

function ExperienceCard({
  experience,
  onUpdate,
  onDelete,
}: {
  experience: Experience;
  onUpdate: (data: any) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    businessName: experience.businessName,
    role: experience.role,
    startDate: experience.startDate.slice(0, 10),
    endDate: experience.endDate?.slice(0, 10) || '',
    isCurrent: experience.isCurrent,
    description: experience.description || '',
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate({
        ...form,
        endDate: form.isCurrent ? undefined : form.endDate || undefined,
      });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Eliminar esta experiencia?')) return;
    setDeleting(true);
    try {
      await onDelete();
    } finally {
      setDeleting(false);
    }
  };

  if (!editing) {
    return (
      <div className="p-4 border rounded-lg space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-medium">{experience.role}</p>
            <p className="text-sm text-muted-foreground">{experience.businessName}</p>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
              Editar
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDelete} disabled={deleting}>
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {new Date(experience.startDate).toLocaleDateString('es-AR', { month: 'short', year: 'numeric' })}
          {' — '}
          {experience.isCurrent
            ? 'Actualidad'
            : experience.endDate
              ? new Date(experience.endDate).toLocaleDateString('es-AR', { month: 'short', year: 'numeric' })
              : ''}
        </p>
        {experience.description && (
          <p className="text-sm text-muted-foreground">{experience.description}</p>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg space-y-3 bg-muted/30">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label>Negocio</Label>
          <Input
            value={form.businessName}
            onChange={(e) => setForm({ ...form, businessName: e.target.value })}
          />
        </div>
        <div>
          <Label>Rol</Label>
          <Input
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label>Fecha inicio</Label>
          <Input
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
          />
        </div>
        <div>
          <Label>Fecha fin</Label>
          <Input
            type="date"
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            disabled={form.isCurrent}
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Switch
          checked={form.isCurrent}
          onCheckedChange={(checked) =>
            setForm({ ...form, isCurrent: checked, endDate: checked ? '' : form.endDate })
          }
        />
        <Label>Trabajo actual</Label>
      </div>
      <div>
        <Label>Descripcion</Label>
        <Textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Describe tus responsabilidades..."
          rows={2}
        />
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={() => setEditing(false)}>
          Cancelar
        </Button>
        <Button size="sm" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
          Guardar
        </Button>
      </div>
    </div>
  );
}

// ============ Main Content ============

function PerfilProfesionalContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'invalid' | 'consent' | 'editor'>('loading');
  const [error, setError] = useState('');
  const [data, setData] = useState<TokenResponse | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Consent state
  const [consentChecked, setConsentChecked] = useState(false);
  const [consentOpenToWork, setConsentOpenToWork] = useState(false);
  const [acceptingConsent, setAcceptingConsent] = useState(false);

  // Profile form state
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [yearsExperience, setYearsExperience] = useState<number | ''>('');
  const [skills, setSkills] = useState<string[]>([]);
  const [certifications, setCertifications] = useState<string[]>([]);
  const [availability, setAvailability] = useState('');
  const [preferredZones, setPreferredZones] = useState<string[]>([]);
  const [openToWork, setOpenToWork] = useState(false);
  const [profileVisible, setProfileVisible] = useState(false);

  // New experience form
  const [showNewExp, setShowNewExp] = useState(false);
  const [newExp, setNewExp] = useState({
    businessName: '',
    role: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    description: '',
  });
  const [addingExp, setAddingExp] = useState(false);

  // Request access form
  const [requestEmail, setRequestEmail] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  // Proposals state
  const [proposals, setProposals] = useState<TalentProposal[]>([]);
  const [loadingProposals, setLoadingProposals] = useState(false);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [respondDialog, setRespondDialog] = useState(false);
  const [respondAction, setRespondAction] = useState<'ACCEPTED' | 'REJECTED'>('ACCEPTED');
  const [respondMessage, setRespondMessage] = useState('');
  const [respondingProposal, setRespondingProposal] = useState(false);

  // Sections collapsed state
  const [sectionsOpen, setSectionsOpen] = useState({
    basic: true,
    skills: true,
    certifications: false,
    experience: true,
    preferences: true,
    proposals: true,
  });

  const toggleSection = (key: keyof typeof sectionsOpen) => {
    setSectionsOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const loadProfile = useCallback(async () => {
    if (!token) {
      setStatus('invalid');
      setError('No se proporcionó un token de acceso.');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/public/professional-profile/${token}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setStatus('invalid');
        setError(err.message || 'Token inválido o expirado.');
        return;
      }

      const result: TokenResponse = await res.json();
      setData(result);

      if (result.profile) {
        // Populate form from profile
        setHeadline(result.profile.headline || '');
        setBio(result.profile.bio || '');
        setYearsExperience(result.profile.yearsExperience ?? '');
        setSkills(safeParseJSON(result.profile.skills));
        setCertifications(safeParseJSON(result.profile.certifications));
        setAvailability(result.profile.availability || '');
        setPreferredZones(safeParseJSON(result.profile.preferredZones));
        setOpenToWork(result.profile.openToWork);
        setProfileVisible(result.profile.profileVisible);
        setStatus('editor');
      } else {
        setStatus('consent');
      }
    } catch {
      setStatus('invalid');
      setError('Error de conexión. Intenta de nuevo.');
    }
  }, [token]);

  const loadProposals = useCallback(async () => {
    if (!token) return;
    setLoadingProposals(true);
    try {
      const data = await publicProfileApi.getProposalsReceived(token);
      setProposals(Array.isArray(data) ? data : []);
    } catch {
      // silent
    } finally {
      setLoadingProposals(false);
    }
  }, [token]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (status === 'editor' && token) {
      loadProposals();
    }
  }, [status, token, loadProposals]);

  const safeParseJSON = (val: string): string[] => {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const handleAcceptConsent = async () => {
    if (!token || !consentChecked) return;
    setAcceptingConsent(true);
    try {
      const res = await fetch(`${API_URL}/api/public/professional-profile/${token}/consent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ openToWork: consentOpenToWork }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setError(err.message || 'Error al aceptar consentimiento');
        return;
      }

      // Reload
      await loadProfile();
    } catch {
      setError('Error de conexión');
    } finally {
      setAcceptingConsent(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!token) return;
    setSaving(true);
    setSaveMessage('');
    try {
      const res = await fetch(`${API_URL}/api/public/professional-profile/${token}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headline,
          bio,
          yearsExperience: yearsExperience === '' ? null : yearsExperience,
          skills,
          certifications,
          availability: availability || null,
          preferredZones,
          openToWork,
          profileVisible,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setData((prev) => prev ? { ...prev, profile: updated } : prev);
        setSaveMessage('Perfil guardado correctamente');
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        const err = await res.json().catch(() => ({}));
        setSaveMessage(err.message || 'Error al guardar');
      }
    } catch {
      setSaveMessage('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  const handleAddExperience = async () => {
    if (!token || !newExp.businessName || !newExp.role || !newExp.startDate) return;
    setAddingExp(true);
    try {
      const res = await fetch(`${API_URL}/api/public/professional-profile/${token}/experience`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newExp,
          endDate: newExp.isCurrent ? undefined : newExp.endDate || undefined,
        }),
      });

      if (res.ok) {
        setShowNewExp(false);
        setNewExp({ businessName: '', role: '', startDate: '', endDate: '', isCurrent: false, description: '' });
        await loadProfile();
      }
    } catch {
      // silent
    } finally {
      setAddingExp(false);
    }
  };

  const handleUpdateExperience = async (expId: string, data: any) => {
    if (!token) return;
    await fetch(`${API_URL}/api/public/professional-profile/${token}/experience/${expId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    await loadProfile();
  };

  const handleDeleteExperience = async (expId: string) => {
    if (!token) return;
    await fetch(`${API_URL}/api/public/professional-profile/${token}/experience/${expId}`, {
      method: 'DELETE',
    });
    await loadProfile();
  };

  const handleRequestAccess = async () => {
    if (!requestEmail) return;
    setRequesting(true);
    try {
      const res = await fetch(`${API_URL}/api/public/professional-profile/request-access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: requestEmail }),
      });

      if (res.ok) {
        setRequestSent(true);
      }
    } catch {
      // silent
    } finally {
      setRequesting(false);
    }
  };

  const handleDeleteProfile = async () => {
    if (!token) return;
    if (!confirm('¿Estás seguro? Se eliminarán tu perfil y todos tus datos. Esta acción no se puede deshacer.')) return;

    try {
      const res = await fetch(`${API_URL}/api/public/professional-profile/${token}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setStatus('invalid');
        setError('Tu perfil y todos tus datos han sido eliminados.');
      }
    } catch {
      // silent
    }
  };

  const handleRespondProposal = async () => {
    if (!token || !respondingId) return;
    setRespondingProposal(true);
    try {
      await publicProfileApi.respondProposal(token, respondingId, {
        status: respondAction,
        responseMessage: respondMessage || undefined,
      });
      setRespondDialog(false);
      setRespondingId(null);
      setRespondMessage('');
      await loadProposals();
    } catch {
      // silent
    } finally {
      setRespondingProposal(false);
    }
  };

  const openRespondDialog = (proposalId: string, action: 'ACCEPTED' | 'REJECTED') => {
    setRespondingId(proposalId);
    setRespondAction(action);
    setRespondMessage('');
    setRespondDialog(true);
  };

  const skillSuggestions = [
    'Corte', 'Color', 'Brushing', 'Manicure', 'Pedicure', 'Depilación',
    'Maquillaje', 'Trenzas', 'Alisado', 'Keratina', 'Barbería', 'Extensiones',
    'Uñas esculpidas', 'Masajes', 'Tratamientos faciales', 'Mechas', 'Balayage',
  ];

  return (
    <LandingThemeWrapper>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="border-b bg-background/80 backdrop-blur-lg">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center gap-2">
                <img src="/claro2.png" alt="TurnoLink" className="h-10 sm:h-12 w-auto dark:hidden" />
                <img src="/oscuro2.png" alt="TurnoLink" className="h-10 sm:h-12 w-auto hidden dark:block" />
              </Link>
              <div className="flex items-center gap-3">
                <LandingThemeToggle />
                <Link href="/" className="hidden sm:block">
                  <Button variant="ghost" size="sm">
                    <Home className="h-4 w-4 mr-2" />
                    Inicio
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 py-6 sm:py-10 px-4 sm:px-6">
          <div className="max-w-2xl mx-auto">
            {/* Security Badge */}
            <div className="flex justify-center mb-4">
              <Badge variant="outline" className="text-xs gap-1">
                <Shield className="h-3 w-3" />
                Conexión segura
              </Badge>
            </div>

            {/* ===== LOADING ===== */}
            {status === 'loading' && (
              <Card className="border-0 shadow-2xl">
                <CardContent className="p-8 text-center space-y-4">
                  <Loader2 className="h-12 w-12 animate-spin mx-auto text-brand-500" />
                  <p className="text-muted-foreground">Validando tu enlace...</p>
                </CardContent>
              </Card>
            )}

            {/* ===== INVALID / EXPIRED ===== */}
            {status === 'invalid' && (
              <Card className="border-0 shadow-2xl">
                <CardContent className="p-6 sm:p-8 space-y-6">
                  <div className="text-center">
                    <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center mb-4">
                      <AlertTriangle className="h-10 w-10 text-amber-600" />
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold mb-2">Enlace inválido o expirado</h1>
                    <p className="text-muted-foreground text-sm">{error}</p>
                  </div>

                  {!requestSent ? (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-center">
                        Ingresa tu email para recibir un nuevo enlace:
                      </p>
                      <Input
                        type="email"
                        value={requestEmail}
                        onChange={(e) => setRequestEmail(e.target.value)}
                        placeholder="tu@email.com"
                      />
                      <Button
                        className="w-full"
                        onClick={handleRequestAccess}
                        disabled={requesting || !requestEmail}
                      >
                        {requesting ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Send className="h-4 w-4 mr-2" />
                        )}
                        Enviar nuevo enlace
                      </Button>
                    </div>
                  ) : (
                    <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-xl border border-green-200 dark:border-green-800 text-center">
                      <CheckCircle2 className="h-6 w-6 text-green-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-green-700 dark:text-green-300">
                        Si tu email esta registrado, recibiras un enlace de acceso.
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        Revisa tu bandeja de entrada y spam.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* ===== CONSENT ===== */}
            {status === 'consent' && data && (
              <Card className="border-0 shadow-2xl">
                <CardContent className="p-6 sm:p-8 space-y-6">
                  <div className="text-center">
                    <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-brand-100 to-teal-100 dark:from-brand-900/30 dark:to-teal-900/30 flex items-center justify-center mb-4">
                      <User className="h-10 w-10 text-brand-600" />
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold mb-2">
                      Tu perfil profesional
                    </h1>
                    <p className="text-muted-foreground text-sm">
                      <strong>{data.tenant.name}</strong> te registró en TurnoLink. Crea tu perfil profesional para destacarte.
                    </p>
                  </div>

                  {/* Employee preview */}
                  <div className="p-4 bg-muted/50 rounded-xl border space-y-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tus datos registrados</p>
                    <div className="flex items-center gap-3">
                      {data.employee.image ? (
                        <img src={data.employee.image} alt="" className="h-12 w-12 rounded-full object-cover" />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
                          <User className="h-6 w-6 text-brand-600" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{data.employee.name}</p>
                        {data.employee.specialty && (
                          <p className="text-sm text-muted-foreground">{data.employee.specialty}</p>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Negocio: {data.tenant.name}
                    </p>
                  </div>

                  {/* Open to work toggle */}
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">Abierto a nuevas oportunidades</span>
                      </div>
                      <Switch
                        checked={consentOpenToWork}
                        onCheckedChange={setConsentOpenToWork}
                      />
                    </div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      100% confidencial. Tu empleador actual nunca lo sabra.
                    </p>
                  </div>

                  {/* Consent checkbox */}
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consentChecked}
                      onChange={(e) => setConsentChecked(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-gray-300"
                    />
                    <span className="text-sm text-muted-foreground">
                      Acepto que TurnoLink almacene mi información profesional. Puedo eliminar mis datos en cualquier momento.
                    </span>
                  </label>

                  {error && (
                    <p className="text-sm text-destructive text-center">{error}</p>
                  )}

                  <Button
                    className="w-full bg-gradient-to-r from-brand-500 to-teal-500 hover:from-brand-600 hover:to-teal-600"
                    onClick={handleAcceptConsent}
                    disabled={!consentChecked || acceptingConsent}
                  >
                    {acceptingConsent ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                    )}
                    Crear mi perfil
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* ===== PROFILE EDITOR ===== */}
            {status === 'editor' && data?.profile && (
              <div className="space-y-4">
                {/* Header */}
                <div className="text-center space-y-2">
                  <h1 className="text-2xl font-bold">Mi perfil profesional</h1>
                  <p className="text-sm text-muted-foreground">
                    Completa tu perfil para destacarte en TurnoLink
                  </p>
                </div>

                {/* ---- DATOS BASICOS ---- */}
                <Card className="border shadow-sm">
                  <button
                    type="button"
                    onClick={() => toggleSection('basic')}
                    className="w-full flex items-center justify-between p-4 sm:p-6 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-brand-500" />
                      <span className="font-semibold">Datos basicos</span>
                    </div>
                    {sectionsOpen.basic ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  {sectionsOpen.basic && (
                    <CardContent className="px-4 sm:px-6 pb-6 pt-0 space-y-4">
                      <div>
                        <Label className="text-muted-foreground">Nombre</Label>
                        <Input value={data.employee.name} disabled className="bg-muted" />
                      </div>
                      {data.employee.specialty && (
                        <div>
                          <Label className="text-muted-foreground">Especialidad</Label>
                          <Input value={data.employee.specialty} disabled className="bg-muted" />
                        </div>
                      )}
                      <div>
                        <Label>Titular</Label>
                        <Input
                          value={headline}
                          onChange={(e) => setHeadline(e.target.value)}
                          placeholder="Ej: Colorista especialista en balayage"
                        />
                      </div>
                      <div>
                        <Label>Bio</Label>
                        <Textarea
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Contá un poco sobre vos..."
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label>Años de experiencia</Label>
                        <Input
                          type="number"
                          min={0}
                          max={60}
                          value={yearsExperience}
                          onChange={(e) =>
                            setYearsExperience(e.target.value === '' ? '' : parseInt(e.target.value))
                          }
                          placeholder="Ej: 5"
                        />
                      </div>
                    </CardContent>
                  )}
                </Card>

                {/* ---- HABILIDADES ---- */}
                <Card className="border shadow-sm">
                  <button
                    type="button"
                    onClick={() => toggleSection('skills')}
                    className="w-full flex items-center justify-between p-4 sm:p-6 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-brand-500" />
                      <span className="font-semibold">Especialidades</span>
                    </div>
                    {sectionsOpen.skills ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  {sectionsOpen.skills && (
                    <CardContent className="px-4 sm:px-6 pb-6 pt-0">
                      <TagInput
                        tags={skills}
                        onChange={setSkills}
                        placeholder="Agrega una especialidad y presiona Enter..."
                        suggestions={skillSuggestions}
                      />
                    </CardContent>
                  )}
                </Card>

                {/* ---- CERTIFICACIONES ---- */}
                <Card className="border shadow-sm">
                  <button
                    type="button"
                    onClick={() => toggleSection('certifications')}
                    className="w-full flex items-center justify-between p-4 sm:p-6 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-brand-500" />
                      <span className="font-semibold">Certificaciones</span>
                    </div>
                    {sectionsOpen.certifications ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  {sectionsOpen.certifications && (
                    <CardContent className="px-4 sm:px-6 pb-6 pt-0">
                      <TagInput
                        tags={certifications}
                        onChange={setCertifications}
                        placeholder="Agrega una certificación..."
                      />
                    </CardContent>
                  )}
                </Card>

                {/* ---- EXPERIENCIA ---- */}
                <Card className="border shadow-sm">
                  <button
                    type="button"
                    onClick={() => toggleSection('experience')}
                    className="w-full flex items-center justify-between p-4 sm:p-6 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-brand-500" />
                      <span className="font-semibold">Experiencia</span>
                    </div>
                    {sectionsOpen.experience ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  {sectionsOpen.experience && (
                    <CardContent className="px-4 sm:px-6 pb-6 pt-0 space-y-3">
                      {data.profile.experiences.map((exp) => (
                        <ExperienceCard
                          key={exp.id}
                          experience={exp}
                          onUpdate={(d) => handleUpdateExperience(exp.id, d)}
                          onDelete={() => handleDeleteExperience(exp.id)}
                        />
                      ))}

                      {showNewExp ? (
                        <div className="p-4 border rounded-lg space-y-3 bg-muted/30">
                          <p className="text-sm font-medium">Nueva experiencia</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <Label>Negocio</Label>
                              <Input
                                value={newExp.businessName}
                                onChange={(e) => setNewExp({ ...newExp, businessName: e.target.value })}
                                placeholder="Nombre del negocio"
                              />
                            </div>
                            <div>
                              <Label>Rol</Label>
                              <Input
                                value={newExp.role}
                                onChange={(e) => setNewExp({ ...newExp, role: e.target.value })}
                                placeholder="Tu puesto"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <Label>Fecha inicio</Label>
                              <Input
                                type="date"
                                value={newExp.startDate}
                                onChange={(e) => setNewExp({ ...newExp, startDate: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label>Fecha fin</Label>
                              <Input
                                type="date"
                                value={newExp.endDate}
                                onChange={(e) => setNewExp({ ...newExp, endDate: e.target.value })}
                                disabled={newExp.isCurrent}
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={newExp.isCurrent}
                              onCheckedChange={(checked) =>
                                setNewExp({ ...newExp, isCurrent: checked, endDate: checked ? '' : newExp.endDate })
                              }
                            />
                            <Label>Trabajo actual</Label>
                          </div>
                          <div>
                            <Label>Descripción</Label>
                            <Textarea
                              value={newExp.description}
                              onChange={(e) => setNewExp({ ...newExp, description: e.target.value })}
                              placeholder="Describe tus responsabilidades..."
                              rows={2}
                            />
                          </div>
                          <div className="flex gap-2 justify-end">
                            <Button variant="outline" size="sm" onClick={() => setShowNewExp(false)}>
                              Cancelar
                            </Button>
                            <Button
                              size="sm"
                              onClick={handleAddExperience}
                              disabled={addingExp || !newExp.businessName || !newExp.role || !newExp.startDate}
                            >
                              {addingExp ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                              Agregar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setShowNewExp(true)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Agregar experiencia
                        </Button>
                      )}
                    </CardContent>
                  )}
                </Card>

                {/* ---- PREFERENCIAS ---- */}
                <Card className="border shadow-sm">
                  <button
                    type="button"
                    onClick={() => toggleSection('preferences')}
                    className="w-full flex items-center justify-between p-4 sm:p-6 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-brand-500" />
                      <span className="font-semibold">Preferencias</span>
                    </div>
                    {sectionsOpen.preferences ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  {sectionsOpen.preferences && (
                    <CardContent className="px-4 sm:px-6 pb-6 pt-0 space-y-5">
                      {/* Availability */}
                      <div className="space-y-2">
                        <Label>Disponibilidad</Label>
                        <RadioGroup value={availability} onValueChange={setAvailability}>
                          {[
                            { value: 'full-time', label: 'Jornada completa' },
                            { value: 'part-time', label: 'Medio turno' },
                            { value: 'freelance', label: 'Independiente' },
                          ].map((opt) => (
                            <div key={opt.value} className="flex items-center gap-2">
                              <RadioGroupItem value={opt.value} id={`avail-${opt.value}`} />
                              <Label htmlFor={`avail-${opt.value}`} className="font-normal cursor-pointer">
                                {opt.label}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>

                      {/* Preferred zones */}
                      <div className="space-y-2">
                        <Label>Zonas preferidas</Label>
                        <TagInput
                          tags={preferredZones}
                          onChange={setPreferredZones}
                          placeholder="Agrega una zona..."
                        />
                      </div>

                      {/* Open to work */}
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium">Abierto a nuevas oportunidades</span>
                          </div>
                          <Switch checked={openToWork} onCheckedChange={setOpenToWork} />
                        </div>
                        <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                          <Lock className="h-3 w-3" />
                          100% confidencial. Tu empleador actual nunca lo sabra.
                        </p>
                      </div>

                      {/* Profile visible */}
                      <div className="p-4 bg-muted/50 rounded-xl border space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {profileVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            <span className="text-sm font-medium">Perfil visible</span>
                          </div>
                          <Switch checked={profileVisible} onCheckedChange={setProfileVisible} />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Permite que otros negocios vean tu perfil
                        </p>
                      </div>
                    </CardContent>
                  )}
                </Card>

                {/* ---- PROPUESTAS RECIBIDAS ---- */}
                {proposals.length > 0 && (
                  <Card className="border shadow-sm">
                    <button
                      type="button"
                      onClick={() => toggleSection('proposals')}
                      className="w-full flex items-center justify-between p-4 sm:p-6 text-left min-h-[48px]"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Send className="h-5 w-5 text-brand-500 shrink-0" />
                        <span className="font-semibold">Propuestas recibidas</span>
                        <Badge variant="secondary" className="ml-1 shrink-0">{proposals.length}</Badge>
                      </div>
                      {sectionsOpen.proposals ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />}
                    </button>
                    {sectionsOpen.proposals && (
                      <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6 pt-0 space-y-2.5 sm:space-y-3">
                        {loadingProposals ? (
                          <div className="flex justify-center py-4">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                          </div>
                        ) : (
                          proposals.map((proposal) => (
                            <div key={proposal.id} className="p-3 sm:p-4 border rounded-lg space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium text-[15px] truncate">{proposal.senderTenant?.name || 'Negocio'}</p>
                                  <p className="text-sm text-muted-foreground truncate">
                                    Puesto: <span className="font-medium">{proposal.role}</span>
                                  </p>
                                </div>
                                <Badge
                                  className="shrink-0 text-xs"
                                  variant={
                                    proposal.status === 'ACCEPTED' ? 'default' :
                                    proposal.status === 'REJECTED' ? 'destructive' :
                                    'secondary'
                                  }
                                >
                                  {proposal.status === 'PENDING' && 'Pendiente'}
                                  {proposal.status === 'ACCEPTED' && 'Aceptada'}
                                  {proposal.status === 'REJECTED' && 'Rechazada'}
                                  {proposal.status === 'EXPIRED' && 'Expirada'}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{proposal.message}</p>
                              {proposal.availability && (
                                <p className="text-xs text-muted-foreground">
                                  Disponibilidad: {proposal.availability}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground">
                                {new Date(proposal.createdAt).toLocaleDateString('es-AR', {
                                  day: 'numeric', month: 'short', year: 'numeric',
                                })}
                              </p>
                              {proposal.status === 'PENDING' && (
                                <div className="flex gap-2 pt-1.5 sm:pt-2">
                                  <Button
                                    size="sm"
                                    className="flex-1 h-10"
                                    onClick={() => openRespondDialog(proposal.id, 'ACCEPTED')}
                                  >
                                    <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                                    Aceptar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 h-10"
                                    onClick={() => openRespondDialog(proposal.id, 'REJECTED')}
                                  >
                                    <XCircle className="h-3.5 w-3.5 mr-1.5" />
                                    Rechazar
                                  </Button>
                                </div>
                              )}
                              {proposal.responseMessage && (
                                <div className="p-2 sm:p-2.5 bg-muted rounded-lg text-sm mt-1">
                                  <span className="text-muted-foreground text-xs font-medium">Tu respuesta: </span>
                                  <span className="leading-relaxed">{proposal.responseMessage}</span>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </CardContent>
                    )}
                  </Card>
                )}

                {/* Save button */}
                <div className="space-y-3">
                  {saveMessage && (
                    <div className={cn(
                      'text-center text-sm p-2 rounded-lg',
                      saveMessage.includes('correctamente')
                        ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',
                    )}>
                      {saveMessage}
                    </div>
                  )}
                  <Button
                    className="w-full bg-gradient-to-r from-brand-500 to-teal-500 hover:from-brand-600 hover:to-teal-600"
                    onClick={handleSaveProfile}
                    disabled={saving}
                    size="lg"
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Guardar perfil
                  </Button>

                  {/* GDPR: Delete */}
                  <Button
                    variant="ghost"
                    className="w-full text-destructive hover:text-destructive"
                    onClick={handleDeleteProfile}
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar mi perfil y datos
                  </Button>
                </div>
              </div>
            )}

            {/* Respond to Proposal Dialog */}
            <Dialog open={respondDialog} onOpenChange={setRespondDialog}>
              <DialogContent className="sm:max-w-md p-4 sm:p-6">
                <DialogHeader>
                  <DialogTitle className="text-base sm:text-lg">
                    {respondAction === 'ACCEPTED' ? 'Aceptar propuesta' : 'Rechazar propuesta'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-3 sm:space-y-4 mt-2">
                  <div>
                    <Label className="text-sm">Mensaje (opcional)</Label>
                    <Textarea
                      value={respondMessage}
                      onChange={(e) => setRespondMessage(e.target.value)}
                      placeholder={
                        respondAction === 'ACCEPTED'
                          ? 'Ej: Me interesa, contactame por email...'
                          : 'Ej: Gracias pero no me interesa en este momento...'
                      }
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 h-11"
                      onClick={() => setRespondDialog(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      className={cn(
                        'flex-1 h-11',
                        respondAction === 'REJECTED' && 'bg-destructive hover:bg-destructive/90',
                      )}
                      onClick={handleRespondProposal}
                      disabled={respondingProposal}
                    >
                      {respondingProposal ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                      ) : respondAction === 'ACCEPTED' ? (
                        <CheckCircle2 className="h-4 w-4 mr-1.5" />
                      ) : (
                        <XCircle className="h-4 w-4 mr-1.5" />
                      )}
                      {respondAction === 'ACCEPTED' ? 'Aceptar' : 'Rechazar'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Trust indicators */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                256-bit SSL
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Datos protegidos
              </span>
              <span className="flex items-center gap-1">
                <Lock className="h-3 w-3" />
                100% confidencial
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t py-4 sm:py-6">
          <div className="container mx-auto px-4 text-center">
            <p className="text-xs sm:text-sm text-muted-foreground">
              © {new Date().getFullYear()} TurnoLink. Todos los derechos reservados.
            </p>
            <div className="flex justify-center gap-4 mt-2">
              <Link href="/ayuda" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Centro de ayuda
              </Link>
              <Link href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Privacidad
              </Link>
              <Link href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Términos
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </LandingThemeWrapper>
  );
}

export default function PerfilProfesionalPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin mx-auto text-brand-500" />
            <p className="text-sm text-muted-foreground">Cargando...</p>
          </div>
        </div>
      }
    >
      <PerfilProfesionalContent />
    </Suspense>
  );
}
