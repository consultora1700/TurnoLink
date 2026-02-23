'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { createApiClient, TalentProfile, MyProfileData, ExperienceData } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ImageUpload } from '@/components/ui/image-upload';
import { ZoneAutocomplete } from '@/components/ui/zone-autocomplete';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  UserCog,
  Loader2,
  Save,
  Plus,
  Trash2,
  Pencil,
  Eye,
  EyeOff,
  Briefcase,
  Sparkles,
  Palette,
} from 'lucide-react';
import { ProfileHeader } from '@/components/profile/profile-header';
import { TEMPLATE_OPTIONS, resolveTemplate } from '@/lib/profile-templates';
import { CATEGORY_SELECT_OPTIONS } from '@/lib/category-config';

export default function MiPerfilPage() {
  const { data: session } = useSession();
  const { toast } = useToast();

  const [profile, setProfile] = useState<TalentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  // Form state
  const [form, setForm] = useState<MyProfileData>({
    name: '',
    phone: '',
    headline: '',
    bio: '',
    specialty: '',
    category: '',
    image: '',
    coverImage: '',
    headerTemplate: '',
    yearsExperience: undefined,
    skills: [],
    certifications: [],
    availability: '',
    preferredZones: [],
    openToWork: false,
    profileVisible: false,
  });

  // Skills/certs input
  const [skillInput, setSkillInput] = useState('');
  const [certInput, setCertInput] = useState('');

  // Experience dialog
  const [expDialogOpen, setExpDialogOpen] = useState(false);
  const [editingExpId, setEditingExpId] = useState<string | null>(null);
  const [expForm, setExpForm] = useState<ExperienceData>({
    businessName: '',
    role: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    description: '',
  });
  const [savingExp, setSavingExp] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    try {
      const api = createApiClient(session.accessToken as string);
      const data = await api.getMyProfile();
      if (data) {
        setProfile(data);
        setHasProfile(true);
        setForm({
          name: data.name || '',
          phone: data.phone || '',
          headline: data.headline || '',
          bio: data.bio || '',
          specialty: data.specialty || '',
          category: data.category || '',
          image: data.image || '',
          coverImage: data.coverImage || '',
          headerTemplate: data.headerTemplate || '',
          yearsExperience: data.yearsExperience ?? undefined,
          skills: data.skills || [],
          certifications: data.certifications || [],
          availability: data.availability || '',
          preferredZones: data.preferredZones || [],
          openToWork: data.openToWork || false,
          profileVisible: data.profileVisible || false,
        });
      } else {
        // No profile yet - prefill name from session
        setForm((prev) => ({ ...prev, name: session.user?.name || '' }));
      }
    } catch {
      // No profile yet
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, session?.user?.name]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSave = async () => {
    if (!session?.accessToken) return;
    setSaving(true);
    try {
      const api = createApiClient(session.accessToken as string);
      const payload: MyProfileData = { ...form };
      if (payload.yearsExperience !== undefined) {
        payload.yearsExperience = Number(payload.yearsExperience);
      }
      // Convert _auto back to empty string (use category default)
      if (payload.headerTemplate === '_auto') {
        payload.headerTemplate = '';
      }

      let result: TalentProfile;
      if (hasProfile) {
        result = await api.updateMyProfile(payload);
      } else {
        result = await api.createMyProfile(payload);
        setHasProfile(true);
      }
      setProfile(result);
      toast({ title: hasProfile ? 'Perfil actualizado' : 'Perfil creado', description: 'Tus cambios se guardaron correctamente' });
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'No se pudo guardar', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // Tag helpers
  const addSkill = () => {
    const val = skillInput.trim();
    if (val && !(form.skills || []).includes(val)) {
      setForm((prev) => ({ ...prev, skills: [...(prev.skills || []), val] }));
    }
    setSkillInput('');
  };

  const removeSkill = (s: string) => {
    setForm((prev) => ({ ...prev, skills: (prev.skills || []).filter((x) => x !== s) }));
  };

  const addCert = () => {
    const val = certInput.trim();
    if (val && !(form.certifications || []).includes(val)) {
      setForm((prev) => ({ ...prev, certifications: [...(prev.certifications || []), val] }));
    }
    setCertInput('');
  };

  const removeCert = (c: string) => {
    setForm((prev) => ({ ...prev, certifications: (prev.certifications || []).filter((x) => x !== c) }));
  };

  // Experience handlers
  const openNewExpDialog = () => {
    setEditingExpId(null);
    setExpForm({ businessName: '', role: '', startDate: '', endDate: '', isCurrent: false, description: '' });
    setExpDialogOpen(true);
  };

  const openEditExpDialog = (exp: TalentProfile['experiences'][0]) => {
    setEditingExpId(exp.id);
    setExpForm({
      businessName: exp.businessName,
      role: exp.role,
      startDate: exp.startDate.split('T')[0],
      endDate: exp.endDate ? exp.endDate.split('T')[0] : '',
      isCurrent: exp.isCurrent,
      description: exp.description || '',
    });
    setExpDialogOpen(true);
  };

  const handleSaveExp = async () => {
    if (!session?.accessToken) return;
    setSavingExp(true);
    try {
      const api = createApiClient(session.accessToken as string);
      if (editingExpId) {
        await api.updateMyExperience(editingExpId, expForm);
      } else {
        await api.addMyExperience(expForm);
      }
      setExpDialogOpen(false);
      toast({ title: editingExpId ? 'Experiencia actualizada' : 'Experiencia agregada' });
      loadProfile();
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'No se pudo guardar', variant: 'destructive' });
    } finally {
      setSavingExp(false);
    }
  };

  const handleDeleteExp = async (id: string) => {
    if (!session?.accessToken) return;
    try {
      const api = createApiClient(session.accessToken as string);
      await api.deleteMyExperience(id);
      toast({ title: 'Experiencia eliminada' });
      loadProfile();
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'No se pudo eliminar', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-primary p-5 sm:p-8 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBvcGFjaXR5PSIuMSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIgZmlsbD0id2hpdGUiLz48L2c+PC9zdmc+')] opacity-30" />
        <div className="relative flex items-center gap-3">
          <div className="rounded-lg bg-white/20 p-2 shrink-0">
            <UserCog className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold sm:text-3xl">Mi Perfil Profesional</h1>
            <p className="mt-0.5 sm:mt-1 text-sm sm:text-base text-white/80">
              {hasProfile ? 'Edita tu perfil y gestiona tu visibilidad' : 'Completa tu perfil para empezar a recibir propuestas'}
            </p>
          </div>
        </div>
      </div>

      {/* Visibility toggles */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
            <div className="flex items-center gap-3">
              <Switch
                id="profileVisible"
                checked={form.profileVisible}
                onCheckedChange={(val) => setForm((prev) => ({ ...prev, profileVisible: val }))}
              />
              <Label htmlFor="profileVisible" className="cursor-pointer flex items-center gap-2">
                {form.profileVisible ? <Eye className="h-4 w-4 text-green-600" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                Perfil visible
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="openToWork"
                checked={form.openToWork}
                onCheckedChange={(val) => setForm((prev) => ({ ...prev, openToWork: val }))}
              />
              <Label htmlFor="openToWork" className="cursor-pointer flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Disponible para trabajar
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Datos del perfil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Tu nombre"
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="headline">Titular</Label>
              <Input
                id="headline"
                value={form.headline}
                onChange={(e) => setForm((prev) => ({ ...prev, headline: e.target.value }))}
                placeholder="Ej: Estilista senior con 5 años de experiencia"
                className="h-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono de contacto</Label>
            <Input
              id="phone"
              type="tel"
              value={form.phone || ''}
              onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder="Ej: +54 11 1234-5678"
              className="h-10 sm:w-[280px]"
            />
            <p className="text-xs text-muted-foreground">
              Se comparte solo cuando aceptás una propuesta.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Acerca de mi</Label>
            <Textarea
              id="bio"
              value={form.bio}
              onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
              placeholder="Contale a los negocios sobre tu experiencia y lo que te destaca..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="specialty">Especialidad</Label>
              <Input
                id="specialty"
                value={form.specialty}
                onChange={(e) => setForm((prev) => ({ ...prev, specialty: e.target.value }))}
                placeholder="Ej: Colorista, Masajista..."
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={form.category || ''}
                onValueChange={(val) => setForm((prev) => ({ ...prev, category: val }))}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_SELECT_OPTIONS.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="yearsExperience">Años de experiencia</Label>
              <Input
                id="yearsExperience"
                type="number"
                min={0}
                max={60}
                value={form.yearsExperience ?? ''}
                onChange={(e) => setForm((prev) => ({ ...prev, yearsExperience: e.target.value ? Number(e.target.value) : undefined }))}
                className="h-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="availability">Disponibilidad</Label>
            <Select
              value={form.availability || ''}
              onValueChange={(val) => setForm((prev) => ({ ...prev, availability: val }))}
            >
              <SelectTrigger className="h-10 w-full sm:w-[200px]">
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full-time">Jornada completa</SelectItem>
                <SelectItem value="part-time">Medio turno</SelectItem>
                <SelectItem value="freelance">Independiente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Profile Image & Appearance */}
          <div className="border-t pt-4 mt-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Apariencia del perfil
            </h3>
            <div className="space-y-4">
              {/* Profile photo */}
              <div className="space-y-2">
                <Label>Foto de perfil</Label>
                <ImageUpload
                  value={form.image}
                  onChange={(url) => setForm((prev) => ({ ...prev, image: url }))}
                  onUpload={(file) => createApiClient(session!.accessToken as string).uploadMedia(file, 'profiles')}
                  variant="avatar"
                  enableCamera={true}
                  initials={(form.name || '?').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                />
                <p className="text-xs text-muted-foreground">
                  Tu foto aparece en las tarjetas de búsqueda y en tu perfil público
                </p>
              </div>

              {/* Template selector */}
              <div className="space-y-2">
                <Label>Estilo del header</Label>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {/* Auto */}
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, headerTemplate: '_auto' }))}
                    className={cn(
                      'rounded-lg p-1 transition-all cursor-pointer',
                      (!form.headerTemplate || form.headerTemplate === '_auto')
                        ? 'ring-2 ring-primary bg-primary/5'
                        : 'border border-muted hover:border-primary/50'
                    )}
                  >
                    <div className="rounded bg-gradient-to-br from-slate-100 to-slate-50 flex flex-col items-center justify-center aspect-[4/3] overflow-hidden">
                      <Sparkles className="h-5 w-5 text-amber-500 mb-1" />
                      <span className="text-[10px] text-muted-foreground leading-tight text-center px-1">Según tu categoría</span>
                    </div>
                    <p className="text-xs font-medium text-center mt-1 pb-0.5">Automático</p>
                  </button>

                  {/* Vibrant */}
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, headerTemplate: 'vibrant' }))}
                    className={cn(
                      'rounded-lg p-1 transition-all cursor-pointer',
                      form.headerTemplate === 'vibrant'
                        ? 'ring-2 ring-primary bg-primary/5'
                        : 'border border-muted hover:border-primary/50'
                    )}
                  >
                    <div className="rounded overflow-hidden aspect-[4/3] relative">
                      <svg viewBox="0 0 120 90" className="w-full h-full">
                        <defs>
                          <linearGradient id="tpl-vibrant" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#14b8a6" />
                            <stop offset="50%" stopColor="#06b6d4" />
                            <stop offset="100%" stopColor="#6366f1" />
                          </linearGradient>
                        </defs>
                        <rect width="120" height="50" fill="url(#tpl-vibrant)" />
                        <rect y="50" width="120" height="40" fill="#f8fafc" />
                        <circle cx="30" cy="50" r="14" fill="white" stroke="url(#tpl-vibrant)" strokeWidth="2" />
                        <circle cx="30" cy="50" r="12" fill="#e2e8f0" />
                        <rect x="52" y="54" width="45" height="4" rx="2" fill="#cbd5e1" />
                        <rect x="52" y="62" width="30" height="3" rx="1.5" fill="#e2e8f0" />
                      </svg>
                    </div>
                    <p className="text-xs font-medium text-center mt-1 pb-0.5">Vibrante</p>
                  </button>

                  {/* Clinical */}
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, headerTemplate: 'clinical' }))}
                    className={cn(
                      'rounded-lg p-1 transition-all cursor-pointer',
                      form.headerTemplate === 'clinical'
                        ? 'ring-2 ring-primary bg-primary/5'
                        : 'border border-muted hover:border-primary/50'
                    )}
                  >
                    <div className="rounded overflow-hidden aspect-[4/3] relative">
                      <svg viewBox="0 0 120 90" className="w-full h-full">
                        <rect width="120" height="90" fill="#f0fdfa" />
                        <rect width="4" height="90" fill="#14b8a6" />
                        <rect x="16" y="12" width="28" height="28" rx="6" fill="#e2e8f0" />
                        <rect x="52" y="16" width="50" height="5" rx="2.5" fill="#14b8a6" opacity="0.6" />
                        <rect x="52" y="26" width="35" height="4" rx="2" fill="#cbd5e1" />
                        <rect x="16" y="50" width="88" height="3" rx="1.5" fill="#e2e8f0" />
                        <rect x="16" y="58" width="70" height="3" rx="1.5" fill="#e2e8f0" />
                        <rect x="16" y="66" width="50" height="3" rx="1.5" fill="#e2e8f0" />
                      </svg>
                    </div>
                    <p className="text-xs font-medium text-center mt-1 pb-0.5">Clínico</p>
                  </button>

                  {/* Corporate */}
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, headerTemplate: 'corporate' }))}
                    className={cn(
                      'rounded-lg p-1 transition-all cursor-pointer',
                      form.headerTemplate === 'corporate'
                        ? 'ring-2 ring-primary bg-primary/5'
                        : 'border border-muted hover:border-primary/50'
                    )}
                  >
                    <div className="rounded overflow-hidden aspect-[4/3] relative">
                      <svg viewBox="0 0 120 90" className="w-full h-full">
                        <rect width="120" height="90" fill="#f1f5f9" />
                        <rect width="120" height="28" fill="#1e293b" />
                        <rect x="12" y="20" width="20" height="20" rx="2" fill="white" />
                        <rect x="12" y="20" width="20" height="20" rx="2" fill="#94a3b8" opacity="0.5" />
                        <rect x="40" y="10" width="55" height="5" rx="2.5" fill="white" opacity="0.8" />
                        <rect x="40" y="19" width="35" height="3" rx="1.5" fill="white" opacity="0.4" />
                        <rect x="12" y="48" width="96" height="3" rx="1.5" fill="#cbd5e1" />
                        <rect x="12" y="56" width="75" height="3" rx="1.5" fill="#cbd5e1" />
                        <rect x="12" y="64" width="55" height="3" rx="1.5" fill="#cbd5e1" />
                      </svg>
                    </div>
                    <p className="text-xs font-medium text-center mt-1 pb-0.5">Corporativo</p>
                  </button>

                  {/* Modern */}
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, headerTemplate: 'modern' }))}
                    className={cn(
                      'rounded-lg p-1 transition-all cursor-pointer',
                      form.headerTemplate === 'modern'
                        ? 'ring-2 ring-primary bg-primary/5'
                        : 'border border-muted hover:border-primary/50'
                    )}
                  >
                    <div className="rounded overflow-hidden aspect-[4/3] relative">
                      <svg viewBox="0 0 120 90" className="w-full h-full">
                        <defs>
                          <linearGradient id="tpl-modern" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="50%" stopColor="#06b6d4" />
                            <stop offset="100%" stopColor="#22c55e" />
                          </linearGradient>
                        </defs>
                        <rect width="120" height="50" fill="url(#tpl-modern)" />
                        <polygon points="85,0 120,0 120,50" fill="white" opacity="0.1" />
                        <polygon points="0,50 40,20 80,50" fill="white" opacity="0.08" />
                        <rect y="50" width="120" height="40" fill="#f8fafc" />
                        <rect x="20" y="36" width="26" height="26" rx="8" fill="white" stroke="url(#tpl-modern)" strokeWidth="2" />
                        <rect x="20" y="36" width="26" height="26" rx="8" fill="#e2e8f0" />
                        <rect x="54" y="54" width="48" height="4" rx="2" fill="#cbd5e1" />
                        <rect x="54" y="62" width="32" height="3" rx="1.5" fill="#e2e8f0" />
                      </svg>
                    </div>
                    <p className="text-xs font-medium text-center mt-1 pb-0.5">Moderno</p>
                  </button>

                  {/* Minimal */}
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, headerTemplate: 'minimal' }))}
                    className={cn(
                      'rounded-lg p-1 transition-all cursor-pointer',
                      form.headerTemplate === 'minimal'
                        ? 'ring-2 ring-primary bg-primary/5'
                        : 'border border-muted hover:border-primary/50'
                    )}
                  >
                    <div className="rounded overflow-hidden aspect-[4/3] relative">
                      <svg viewBox="0 0 120 90" className="w-full h-full">
                        <rect width="120" height="90" fill="#f8fafc" />
                        <circle cx="60" cy="28" r="14" fill="#e2e8f0" />
                        <rect x="30" y="50" width="60" height="4" rx="2" fill="#cbd5e1" />
                        <rect x="38" y="59" width="44" height="3" rx="1.5" fill="#e2e8f0" />
                        <rect x="20" y="72" width="20" height="6" rx="3" fill="#e2e8f0" />
                        <rect x="44" y="72" width="20" height="6" rx="3" fill="#e2e8f0" />
                        <rect x="68" y="72" width="20" height="6" rx="3" fill="#e2e8f0" />
                      </svg>
                    </div>
                    <p className="text-xs font-medium text-center mt-1 pb-0.5">Minimal</p>
                  </button>
                </div>
              </div>

              {/* Cover image */}
              <div className="space-y-2">
                <Label>Imagen de portada</Label>
                <ImageUpload
                  value={form.coverImage}
                  onChange={(url) => setForm((prev) => ({ ...prev, coverImage: url }))}
                  onUpload={(file) => createApiClient(session!.accessToken as string).uploadMedia(file, 'covers')}
                  aspectRatio="banner"
                  enableCamera={false}
                  placeholder="Subir imagen de portada"
                />
                <p className="text-xs text-muted-foreground">
                  Se muestra en el template Vibrante
                </p>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-2">
            <Label>Especialidades</Label>
            <div className="flex gap-2">
              <Input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="Agregar especialidad..."
                className="h-10"
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
              />
              <Button type="button" variant="outline" size="sm" onClick={addSkill} className="h-10 px-3">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {(form.skills || []).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {(form.skills || []).map((s) => (
                  <Badge key={s} variant="secondary" className="pr-1">
                    {s}
                    <button onClick={() => removeSkill(s)} className="ml-1 hover:text-destructive">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Certifications */}
          <div className="space-y-2">
            <Label>Certificaciones</Label>
            <div className="flex gap-2">
              <Input
                value={certInput}
                onChange={(e) => setCertInput(e.target.value)}
                placeholder="Agregar certificación..."
                className="h-10"
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCert(); } }}
              />
              <Button type="button" variant="outline" size="sm" onClick={addCert} className="h-10 px-3">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {(form.certifications || []).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {(form.certifications || []).map((c) => (
                  <Badge key={c} variant="outline" className="pr-1">
                    {c}
                    <button onClick={() => removeCert(c)} className="ml-1 hover:text-destructive">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Preferred Zones */}
          <div className="space-y-2">
            <Label>Zonas preferidas</Label>
            <ZoneAutocomplete
              values={form.preferredZones || []}
              onChange={(zones) => setForm((prev) => ({ ...prev, preferredZones: zones }))}
            />
          </div>

          <Button onClick={handleSave} disabled={saving || !form.name} className="w-full sm:w-auto h-11">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {hasProfile ? 'Guardar cambios' : 'Crear perfil'}
          </Button>
        </CardContent>
      </Card>

      {/* Experience Section */}
      {hasProfile && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Experiencia</CardTitle>
            <Button variant="outline" size="sm" onClick={openNewExpDialog}>
              <Plus className="mr-1 h-4 w-4" />
              Agregar
            </Button>
          </CardHeader>
          <CardContent>
            {profile?.experiences && profile.experiences.length > 0 ? (
              <div className="space-y-4">
                {profile.experiences.map((exp) => (
                  <div
                    key={exp.id}
                    className="relative pl-6 border-l-2 border-muted pb-4 last:pb-0"
                  >
                    <div className="absolute left-[-5px] top-1 h-2 w-2 rounded-full bg-primary" />
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-medium">{exp.role}</div>
                        <div className="text-sm text-muted-foreground">{exp.businessName}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(exp.startDate).toLocaleDateString('es-AR', { month: 'short', year: 'numeric' })}
                          {' — '}
                          {exp.isCurrent ? 'Actual' : exp.endDate ? new Date(exp.endDate).toLocaleDateString('es-AR', { month: 'short', year: 'numeric' }) : ''}
                        </div>
                        {exp.description && <p className="text-sm text-muted-foreground mt-1">{exp.description}</p>}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditExpDialog(exp)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDeleteExp(exp.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Briefcase className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
                <p>No hay experiencia laboral</p>
                <p className="text-sm mt-1">Agrega tu experiencia para destacar tu perfil</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Profile Preview */}
      {hasProfile && profile && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Vista previa del perfil
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-hidden rounded-b-lg">
            <ProfileHeader
              compact
              profile={{
                ...profile,
                name: form.name || profile.name,
                headline: form.headline || profile.headline,
                bio: form.bio || profile.bio,
                specialty: form.specialty || profile.specialty,
                category: form.category || profile.category,
                image: form.image || profile.image,
                coverImage: form.coverImage || profile.coverImage,
                headerTemplate: (form.headerTemplate === '_auto' ? '' : form.headerTemplate) || profile.headerTemplate,
                skills: form.skills || profile.skills,
                certifications: form.certifications || profile.certifications,
                availability: form.availability || profile.availability,
                preferredZones: form.preferredZones || profile.preferredZones,
                openToWork: form.openToWork ?? profile.openToWork,
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Experience Dialog */}
      <Dialog open={expDialogOpen} onOpenChange={setExpDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingExpId ? 'Editar experiencia' : 'Agregar experiencia'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Empresa / Negocio</Label>
              <Input
                value={expForm.businessName}
                onChange={(e) => setExpForm((prev) => ({ ...prev, businessName: e.target.value }))}
                placeholder="Nombre de la empresa"
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label>Puesto / Rol</Label>
              <Input
                value={expForm.role}
                onChange={(e) => setExpForm((prev) => ({ ...prev, role: e.target.value }))}
                placeholder="Ej: Estilista senior"
                className="h-10"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Fecha inicio</Label>
                <Input
                  type="date"
                  value={expForm.startDate}
                  onChange={(e) => setExpForm((prev) => ({ ...prev, startDate: e.target.value }))}
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label>Fecha fin</Label>
                <Input
                  type="date"
                  value={expForm.endDate || ''}
                  onChange={(e) => setExpForm((prev) => ({ ...prev, endDate: e.target.value }))}
                  disabled={expForm.isCurrent}
                  className="h-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="isCurrent"
                checked={expForm.isCurrent}
                onCheckedChange={(val) => setExpForm((prev) => ({ ...prev, isCurrent: val, endDate: val ? '' : prev.endDate }))}
              />
              <Label htmlFor="isCurrent" className="cursor-pointer">Trabajo actual</Label>
            </div>
            <div className="space-y-2">
              <Label>Descripcion <span className="text-muted-foreground font-normal">(opcional)</span></Label>
              <Textarea
                value={expForm.description || ''}
                onChange={(e) => setExpForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Describe tus responsabilidades..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setExpDialogOpen(false)}>Cancelar</Button>
            <Button
              onClick={handleSaveExp}
              disabled={savingExp || !expForm.businessName || !expForm.role || !expForm.startDate}
            >
              {savingExp ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
