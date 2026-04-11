'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { createApiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ZoneAutocomplete } from '@/components/ui/zone-autocomplete';
import {
  Briefcase,
  ArrowLeft,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const CATEGORIES = [
  { value: 'estetica-belleza', label: 'Estética y Belleza' },
  { value: 'barberia', label: 'Barbería' },
  { value: 'peluqueria', label: 'Peluquería' },
  { value: 'spa-masajes', label: 'Spa y Masajes' },
  { value: 'fitness-deporte', label: 'Fitness y Deporte' },
  { value: 'salud-bienestar', label: 'Salud y Bienestar' },
  { value: 'gastronomia', label: 'Gastronomía' },
  { value: 'educacion-capacitacion', label: 'Educación y Capacitación' },
  { value: 'consultoria', label: 'Consultoría' },
  { value: 'tecnologia', label: 'Tecnología' },
  { value: 'servicios-profesionales', label: 'Servicios Profesionales' },
  { value: 'otros', label: 'Otros' },
];

export default function NuevaOfertaPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [showSalary, setShowSalary] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    requiredSkills: '',
    availability: '',
    minExperience: '',
    zone: '',
    salaryMin: '',
    salaryMax: '',
    salaryCurrency: 'ARS',
    salaryPeriod: '',
    deadline: '',
    maxApplications: '',
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.accessToken || !form.title || !form.description || !form.category) return;

    setSubmitting(true);
    try {
      const api = createApiClient(session.accessToken as string);

      const skillsArray = form.requiredSkills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await api.createJobPosting({
        title: form.title,
        description: form.description,
        category: form.category,
        requiredSkills: skillsArray.length > 0 ? JSON.stringify(skillsArray) : undefined,
        availability: form.availability || undefined,
        minExperience: form.minExperience ? parseInt(form.minExperience) : undefined,
        zone: form.zone || undefined,
        salaryMin: form.salaryMin ? parseFloat(form.salaryMin) : undefined,
        salaryMax: form.salaryMax ? parseFloat(form.salaryMax) : undefined,
        salaryCurrency: form.salaryCurrency || 'ARS',
        salaryPeriod: form.salaryPeriod || undefined,
        deadline: form.deadline || undefined,
        maxApplications: form.maxApplications ? parseInt(form.maxApplications) : undefined,
      });

      toast({ title: 'Oferta publicada', description: 'Tu oferta laboral fue publicada exitosamente' });
      router.push('/talento/ofertas');
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message || 'No se pudo crear la oferta',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isValid = form.title.trim() && form.description.trim() && form.category;

  return (
    <div className="space-y-4 sm:space-y-6 pb-4 max-w-2xl mx-auto">
      {/* Back link */}
      <button
        onClick={() => router.push('/talento/ofertas')}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a ofertas
      </button>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Briefcase className="h-5 w-5 text-teal-600" />
            Nueva oferta laboral
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                placeholder="Ej: Peluquero/a con experiencia"
                value={form.title}
                onChange={(e) => handleChange('title', e.target.value)}
                maxLength={200}
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <Label>Categoría *</Label>
              <Select value={form.category} onValueChange={(v) => handleChange('category', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="description">Descripción *</Label>
              <Textarea
                id="description"
                placeholder="Describe los requisitos, responsabilidades y beneficios del puesto..."
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={5}
                maxLength={5000}
              />
              <p className="text-xs text-muted-foreground text-right">{form.description.length}/5000</p>
            </div>

            {/* Skills */}
            <div className="space-y-1.5">
              <Label htmlFor="skills">Habilidades requeridas</Label>
              <Input
                id="skills"
                placeholder="Ej: Corte clásico, Colorimetría, Alisados (separar con comas)"
                value={form.requiredSkills}
                onChange={(e) => handleChange('requiredSkills', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Separa las habilidades con comas</p>
            </div>

            {/* Availability + Experience */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Disponibilidad</Label>
                <Select value={form.availability} onValueChange={(v) => handleChange('availability', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Cualquiera" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="minExperience">Experiencia mínima (años)</Label>
                <Input
                  id="minExperience"
                  type="number"
                  min="0"
                  max="50"
                  placeholder="Ej: 2"
                  value={form.minExperience}
                  onChange={(e) => handleChange('minExperience', e.target.value)}
                />
              </div>
            </div>

            {/* Zone */}
            <div className="space-y-1.5">
              <Label>Zona de trabajo</Label>
              <ZoneAutocomplete
                values={form.zone ? [form.zone] : []}
                onChange={(zones) => handleChange('zone', zones.length > 0 ? zones[zones.length - 1] : '')}
                placeholder="Buscar localidad..."
              />
              <p className="text-xs text-muted-foreground">Selecciona la zona donde se ubica el puesto</p>
            </div>

            {/* Salary (collapsible) */}
            <div className="border rounded-lg">
              <button
                type="button"
                onClick={() => setShowSalary(!showSalary)}
                className="w-full flex items-center justify-between p-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <span>Rango salarial (opcional)</span>
                {showSalary ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {showSalary && (
                <div className="px-3 pb-3 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="salaryMin">Mínimo</Label>
                      <Input
                        id="salaryMin"
                        type="number"
                        min="0"
                        placeholder="Ej: 300000"
                        value={form.salaryMin}
                        onChange={(e) => handleChange('salaryMin', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="salaryMax">Máximo</Label>
                      <Input
                        id="salaryMax"
                        type="number"
                        min="0"
                        placeholder="Ej: 500000"
                        value={form.salaryMax}
                        onChange={(e) => handleChange('salaryMax', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Moneda</Label>
                      <Select value={form.salaryCurrency} onValueChange={(v) => handleChange('salaryCurrency', v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ARS">ARS</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Periodo</Label>
                      <Select value={form.salaryPeriod} onValueChange={(v) => handleChange('salaryPeriod', v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Mensual</SelectItem>
                          <SelectItem value="hourly">Por hora</SelectItem>
                          <SelectItem value="project">Por proyecto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Deadline + Max applications */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="deadline">Fecha límite de postulación</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={form.deadline}
                  onChange={(e) => handleChange('deadline', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Después de esta fecha no se aceptan nuevas postulaciones. Si no la definís, la oferta queda abierta hasta que la cierres.</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="maxApplications">Máximo de postulaciones</Label>
                <Input
                  id="maxApplications"
                  type="number"
                  min="1"
                  placeholder="Sin límite"
                  value={form.maxApplications}
                  onChange={(e) => handleChange('maxApplications', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Cantidad máxima de profesionales que pueden postularse. Si no lo definís, no hay límite.</p>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/talento/ofertas')}
                className="flex-1 sm:flex-none"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={!isValid || submitting}
                className="flex-1 sm:flex-none"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                    Publicando...
                  </>
                ) : (
                  <>
                    <Briefcase className="h-4 w-4 mr-1.5" />
                    Publicar oferta
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
