import { z } from 'zod';

// =============================================================================
// Common Validations
// =============================================================================

const phoneRegex = /^[+]?[\d\s-]{8,20}$/;
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const emailSchema = z
  .string()
  .min(1, 'El email es requerido')
  .email('Ingrese un email válido');

export const phoneSchema = z
  .string()
  .min(1, 'El teléfono es requerido')
  .regex(phoneRegex, 'Ingrese un teléfono válido (8-20 dígitos)');

export const optionalPhoneSchema = z
  .string()
  .optional()
  .refine((val) => !val || phoneRegex.test(val), 'Ingrese un teléfono válido');

export const optionalEmailSchema = z
  .string()
  .optional()
  .refine((val) => !val || z.string().email().safeParse(val).success, 'Ingrese un email válido');

export const passwordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
  .regex(/[a-z]/, 'Debe contener al menos una minúscula')
  .regex(/[0-9]/, 'Debe contener al menos un número');

export const nameSchema = z
  .string()
  .min(2, 'El nombre debe tener al menos 2 caracteres')
  .max(100, 'El nombre no puede exceder 100 caracteres');

export const slugSchema = z
  .string()
  .min(3, 'El slug debe tener al menos 3 caracteres')
  .max(50, 'El slug no puede exceder 50 caracteres')
  .regex(slugRegex, 'Solo letras minúsculas, números y guiones');

// =============================================================================
// Auth Schemas
// =============================================================================

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'La contraseña es requerida'),
});

export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirme su contraseña'),
    name: nameSchema,
    businessName: z
      .string()
      .min(2, 'El nombre del negocio debe tener al menos 2 caracteres')
      .max(100, 'El nombre del negocio no puede exceder 100 caracteres'),
    businessSlug: slugSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Ingrese su contraseña actual'),
    newPassword: passwordSchema,
    confirmNewPassword: z.string().min(1, 'Confirme su nueva contraseña'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmNewPassword'],
  });

// =============================================================================
// Booking Schemas
// =============================================================================

export const createBookingSchema = z.object({
  serviceId: z.string().min(1, 'Seleccione un servicio'),
  date: z.string().min(1, 'Seleccione una fecha'),
  startTime: z.string().min(1, 'Seleccione un horario'),
  customerName: nameSchema,
  customerPhone: phoneSchema,
  customerEmail: optionalEmailSchema,
  notes: z.string().max(500, 'Las notas no pueden exceder 500 caracteres').optional(),
});

// =============================================================================
// Service Schemas
// =============================================================================

export const createServiceSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  description: z.string().max(500, 'La descripción no puede exceder 500 caracteres').optional(),
  price: z
    .number({ invalid_type_error: 'Ingrese un precio válido' })
    .min(0, 'El precio no puede ser negativo')
    .max(1000000, 'El precio es demasiado alto'),
  duration: z
    .number({ invalid_type_error: 'Ingrese una duración válida' })
    .min(5, 'La duración mínima es 5 minutos')
    .max(480, 'La duración máxima es 8 horas'),
  isActive: z.boolean().optional(),
  categoryId: z.string().optional(),
});

export const updateServiceSchema = createServiceSchema.partial().extend({
  order: z.number().optional(),
});

// =============================================================================
// Tenant/Business Schemas
// =============================================================================

export const updateTenantSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
  phone: optionalPhoneSchema,
  email: optionalEmailSchema,
  address: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  instagram: z.string().max(50).optional(),
  facebook: z.string().max(100).optional(),
  website: z.string().url('Ingrese una URL válida').optional().or(z.literal('')),
  settings: z
    .object({
      showPrices: z.boolean().optional(),
      requirePhone: z.boolean().optional(),
      requireEmail: z.boolean().optional(),
      primaryColor: z.string().optional(),
      secondaryColor: z.string().optional(),
      maxAdvanceBookingDays: z.number().min(1).max(365).optional(),
      minAdvanceBookingHours: z.number().min(0).max(168).optional(),
    })
    .optional(),
});

// =============================================================================
// Schedule Schemas
// =============================================================================

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const scheduleUpdateSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(timeRegex, 'Formato de hora inválido (HH:MM)'),
  endTime: z.string().regex(timeRegex, 'Formato de hora inválido (HH:MM)'),
  isActive: z.boolean(),
});

export const scheduleArraySchema = z.array(scheduleUpdateSchema);

export const blockDateSchema = z.object({
  date: z.string().min(1, 'Seleccione una fecha'),
  reason: z.string().max(200, 'El motivo no puede exceder 200 caracteres').optional(),
});

// =============================================================================
// Customer Schemas
// =============================================================================

export const updateCustomerSchema = z.object({
  name: nameSchema.optional(),
  phone: phoneSchema.optional(),
  email: optionalEmailSchema,
  notes: z.string().max(500, 'Las notas no pueden exceder 500 caracteres').optional(),
});

// =============================================================================
// Profile Schemas
// =============================================================================

export const updateProfileSchema = z.object({
  name: nameSchema.optional(),
  email: emailSchema.optional(),
});

// =============================================================================
// Types
// =============================================================================

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
export type UpdateTenantInput = z.infer<typeof updateTenantSchema>;
export type ScheduleUpdateInput = z.infer<typeof scheduleUpdateSchema>;
export type BlockDateInput = z.infer<typeof blockDateSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// =============================================================================
// Validation Helpers
// =============================================================================

export function validateForm<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string> = {};
  result.error.errors.forEach((err) => {
    const path = err.path.join('.');
    if (!errors[path]) {
      errors[path] = err.message;
    }
  });

  return { success: false, errors };
}

export function getFieldError(
  errors: Record<string, string> | undefined,
  field: string
): string | undefined {
  return errors?.[field];
}
