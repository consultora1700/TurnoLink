'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Phone, Mail, MessageSquare, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { ErrorMessage } from '@/components/ui/error-message';

/**
 * Form schema for customer booking details
 * Validates in real-time as the user types
 */
const customerFormSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  phone: z
    .string()
    .min(1, 'El teléfono es requerido')
    .regex(/^[+]?[\d\s-]{8,20}$/, 'Ingrese un teléfono válido (8-20 dígitos)'),
  email: z
    .string()
    .email('Ingrese un email válido')
    .optional()
    .or(z.literal('')),
  notes: z
    .string()
    .max(500, 'Las notas no pueden exceder 500 caracteres')
    .optional(),
});

type CustomerFormData = z.infer<typeof customerFormSchema>;

interface BookingCustomerFormProps {
  /** Whether email is required based on tenant settings */
  requireEmail?: boolean;
  /** Initial form values */
  defaultValues?: Partial<CustomerFormData>;
  /** Submission handler */
  onSubmit: (data: CustomerFormData) => Promise<void>;
  /** Whether form is currently submitting */
  isSubmitting?: boolean;
  /** External error message (e.g., API error) */
  externalError?: string | null;
  /** Handler to clear external error */
  onClearError?: () => void;
}

/**
 * Customer details form with real-time validation.
 * Uses React Hook Form with Zod resolver for client-side validation.
 */
export function BookingCustomerForm({
  requireEmail = false,
  defaultValues,
  onSubmit,
  isSubmitting = false,
  externalError,
  onClearError,
}: BookingCustomerFormProps) {
  // Create dynamic schema based on email requirement
  const schema = requireEmail
    ? customerFormSchema.extend({
        email: z.string().min(1, 'El email es requerido').email('Ingrese un email válido'),
      })
    : customerFormSchema;

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, touchedFields, dirtyFields },
    watch,
    trigger,
  } = useForm<CustomerFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      notes: '',
      ...defaultValues,
    },
    mode: 'onBlur', // Validate on blur for better UX
    reValidateMode: 'onChange', // Re-validate on change after blur
  });

  // Watch fields for real-time feedback
  const watchedName = watch('name');
  const watchedPhone = watch('phone');
  const watchedEmail = watch('email');

  // Re-validate touched fields when values change
  useEffect(() => {
    if (touchedFields.name && watchedName) {
      trigger('name');
    }
  }, [watchedName, touchedFields.name, trigger]);

  useEffect(() => {
    if (touchedFields.phone && watchedPhone) {
      trigger('phone');
    }
  }, [watchedPhone, touchedFields.phone, trigger]);

  useEffect(() => {
    if (touchedFields.email && watchedEmail) {
      trigger('email');
    }
  }, [watchedEmail, touchedFields.email, trigger]);

  const handleFormSubmit = async (data: CustomerFormData) => {
    await onSubmit(data);
  };

  const getFieldState = (fieldName: keyof CustomerFormData) => {
    const error = errors[fieldName];
    const isTouched = touchedFields[fieldName];
    const isDirty = dirtyFields[fieldName];

    if (error) {
      return 'error';
    }
    if (isTouched && isDirty && !error) {
      return 'valid';
    }
    return 'default';
  };

  const getInputClassName = (fieldName: keyof CustomerFormData) => {
    const state = getFieldState(fieldName);
    const base = 'h-12 rounded-xl transition-colors';

    switch (state) {
      case 'error':
        return `${base} border-red-300 dark:border-red-700 focus:border-red-500 focus:ring-red-500`;
      case 'valid':
        return `${base} border-green-300 dark:border-green-700 focus:border-green-500 focus:ring-green-500`;
      default:
        return base;
    }
  };

  return (
    <Card className="border border-slate-200 dark:border-neutral-700 shadow-sm bg-white dark:bg-neutral-800">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-slate-900 dark:text-white">
          <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-neutral-700 flex items-center justify-center">
            <User className="h-4 w-4 text-slate-600 dark:text-neutral-300" />
          </div>
          Completá tus datos
        </h3>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5" noValidate>
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              Nombre completo <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="name"
                {...register('name')}
                placeholder="Tu nombre"
                disabled={isSubmitting}
                className={getInputClassName('name')}
                aria-invalid={errors.name ? 'true' : 'false'}
                aria-describedby={errors.name ? 'name-error' : undefined}
              />
              {getFieldState('name') === 'valid' && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
            {errors.name && (
              <p id="name-error" className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Phone Field */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              WhatsApp / Teléfono <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="phone"
                type="tel"
                {...register('phone')}
                placeholder="+54 11 1234-5678"
                disabled={isSubmitting}
                className={getInputClassName('phone')}
                aria-invalid={errors.phone ? 'true' : 'false'}
                aria-describedby={errors.phone ? 'phone-error' : undefined}
              />
              {getFieldState('phone') === 'valid' && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
            {errors.phone && (
              <p id="phone-error" className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              Email {requireEmail ? <span className="text-red-500">*</span> : <span className="text-muted-foreground font-normal">(recomendado - recibirás confirmación)</span>}
            </Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="tu@email.com"
                disabled={isSubmitting}
                className={getInputClassName('email')}
                aria-invalid={errors.email ? 'true' : 'false'}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {getFieldState('email') === 'valid' && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
            {errors.email && (
              <p id="email-error" className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Notes Field */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              Notas adicionales (opcional)
            </Label>
            <Input
              id="notes"
              {...register('notes')}
              placeholder="Alguna indicación especial..."
              disabled={isSubmitting}
              className="h-12 rounded-xl"
            />
            {errors.notes && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.notes.message}</p>
            )}
          </div>

          {/* External Error (API errors) */}
          {externalError && (
            <ErrorMessage
              message={externalError}
              variant="inline"
              onDismiss={onClearError}
            />
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 text-base bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 text-white rounded-lg"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Reservando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Confirmar Reserva
                <ArrowRight className="h-5 w-5" />
              </span>
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Al confirmar, aceptas los términos y condiciones del negocio
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

export type { CustomerFormData };
