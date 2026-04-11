'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Film,
  RotateCcw,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { creativeApi, SceneInfo, TenantBranding } from './_components/creative-api';
import { TenantSelector } from './_components/tenant-selector';
import { StepIndicator, WizardStep } from './_components/step-indicator';
import { SceneGallery } from './_components/scene-gallery';
import { SceneCustomizer, SceneCustomizations } from './_components/scene-customizer';
import { SceneExportPanel } from './_components/scene-export-panel';

const STEP_ORDER: WizardStep[] = ['tenant', 'scene', 'customize', 'export'];

export default function CreativeStudioPage() {
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [step, setStep] = useState<WizardStep>('tenant');
  const [completedSteps, setCompletedSteps] = useState<Set<WizardStep>>(new Set());

  // Step 1: Tenant
  const [tenantId, setTenantId] = useState('platform');
  const [tenantName, setTenantName] = useState('TurnoLink (Plataforma)');
  const [branding, setBranding] = useState<TenantBranding | null>(null);

  // Step 2: Scene
  const [selectedScene, setSelectedScene] = useState<SceneInfo | null>(null);

  // Step 3: Customizations
  const [customizations, setCustomizations] = useState<SceneCustomizations>({
    title: '',
    subtitle: '',
    cta: 'Reservar ahora',
    description: '',
    primaryColor: '#3F8697',
    secondaryColor: '#2D6B77',
    accentColor: '#10B981',
  });

  // Health check
  useEffect(() => {
    creativeApi
      .healthCheck()
      .then(() => setApiStatus('online'))
      .catch(() => setApiStatus('offline'));
  }, []);

  // Load branding when tenant changes
  const loadBranding = useCallback(async (tid: string) => {
    try {
      const b = await creativeApi.getTenantBranding(tid);
      setBranding(b);
      setCustomizations((prev) => ({
        ...prev,
        title: b.name,
        subtitle: b.tagline || '',
        primaryColor: b.primaryColor,
        secondaryColor: b.secondaryColor,
        accentColor: b.accentColor,
      }));
    } catch (e) {
      console.error('Failed to load branding:', e);
    }
  }, []);

  const handleTenantChange = (id: string, name: string) => {
    setTenantId(id);
    setTenantName(name);
    loadBranding(id);
  };

  const completeStep = (s: WizardStep) => {
    setCompletedSteps((prev) => new Set(prev).add(s));
  };

  const goToNextStep = () => {
    const currentIdx = STEP_ORDER.indexOf(step);
    if (currentIdx < STEP_ORDER.length - 1) {
      completeStep(step);
      setStep(STEP_ORDER[currentIdx + 1]);
    }
  };

  const goToPrevStep = () => {
    const currentIdx = STEP_ORDER.indexOf(step);
    if (currentIdx > 0) {
      setStep(STEP_ORDER[currentIdx - 1]);
    }
  };

  const handleSceneSelect = (scene: SceneInfo) => {
    setSelectedScene(scene);
    completeStep('scene');
    setStep('customize');
  };

  const handleStartOver = () => {
    setStep('tenant');
    setCompletedSteps(new Set());
    setSelectedScene(null);
    setCustomizations({
      title: branding?.name || '',
      subtitle: branding?.tagline || '',
      cta: 'Reservar ahora',
      description: '',
      primaryColor: branding?.primaryColor || '#3F8697',
      secondaryColor: branding?.secondaryColor || '#2D6B77',
      accentColor: branding?.accentColor || '#10B981',
    });
  };

  const currentStepIndex = STEP_ORDER.indexOf(step);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Creative Studio</h1>
          <p className="text-muted-foreground mt-1">
            Creá contenido de marketing profesional en minutos
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Activity className={`h-4 w-4 ${apiStatus === 'online' ? 'text-green-500' : apiStatus === 'offline' ? 'text-red-500' : 'text-yellow-500'}`} />
            <Badge variant={apiStatus === 'online' ? 'default' : 'destructive'}>
              {apiStatus === 'online' ? 'Online' : apiStatus === 'offline' ? 'Offline' : '...'}
            </Badge>
          </div>
          <Link href="/admin/creative-studio/ai-copy">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> Copy IA
            </Button>
          </Link>
          <Link href="/admin/creative-studio/animations">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Film className="h-3.5 w-3.5" /> Animaciones
            </Button>
          </Link>
        </div>
      </div>

      {apiStatus === 'offline' && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">
              La API de Creative Studio no está disponible. Verificá que <code>creative-api</code> esté corriendo.
            </p>
          </CardContent>
        </Card>
      )}

      {apiStatus !== 'offline' && (
        <>
          {/* Step indicator */}
          <StepIndicator
            currentStep={step}
            onStepClick={setStep}
            completedSteps={completedSteps}
          />

          {/* Step content */}
          <div className="min-h-[400px]">
            {/* Step 1: Tenant */}
            {step === 'tenant' && (
              <div className="max-w-md mx-auto space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold">¿Para quién es el contenido?</h2>
                  <p className="text-muted-foreground mt-1">
                    Seleccioná el negocio para auto-rellenar colores, logo y nombre
                  </p>
                </div>
                <TenantSelector
                  value={tenantId}
                  onChange={handleTenantChange}
                  label="Negocio o marca"
                />
                {branding && (
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm font-medium mb-2">Branding cargado:</p>
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1.5">
                          <div className="w-8 h-8 rounded-full border" style={{ backgroundColor: branding.primaryColor }} title="Primario" />
                          <div className="w-8 h-8 rounded-full border" style={{ backgroundColor: branding.secondaryColor }} title="Secundario" />
                          <div className="w-8 h-8 rounded-full border" style={{ backgroundColor: branding.accentColor }} title="Acento" />
                        </div>
                        <div className="text-sm">
                          <p className="font-medium">{branding.name}</p>
                          {branding.tagline && <p className="text-muted-foreground text-xs">{branding.tagline}</p>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                <Button className="w-full" size="lg" onClick={goToNextStep}>
                  Continuar <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Step 2: Scene */}
            {step === 'scene' && (
              <SceneGallery
                tenantId={tenantId}
                selected={selectedScene?.id || null}
                onSelect={handleSceneSelect}
              />
            )}

            {/* Step 3: Customize */}
            {step === 'customize' && selectedScene && (
              <SceneCustomizer
                scene={selectedScene}
                tenantId={tenantId}
                branding={branding}
                customizations={customizations}
                onCustomizationsChange={setCustomizations}
              />
            )}

            {/* Step 4: Export */}
            {step === 'export' && selectedScene && (
              <SceneExportPanel
                scene={selectedScene}
                tenantId={tenantId}
                customizations={customizations}
              />
            )}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between max-w-5xl mx-auto pt-4 border-t">
            <div className="flex gap-2">
              {currentStepIndex > 0 && (
                <Button variant="outline" onClick={goToPrevStep}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Atrás
                </Button>
              )}
              {currentStepIndex > 0 && (
                <Button variant="ghost" onClick={handleStartOver}>
                  <RotateCcw className="mr-2 h-4 w-4" /> Empezar de nuevo
                </Button>
              )}
            </div>
            <div>
              {step === 'customize' && (
                <Button onClick={goToNextStep}>
                  Ir a descargar <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
