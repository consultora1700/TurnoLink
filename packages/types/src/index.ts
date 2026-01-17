// ===========================================
// TURNERO SAAS - Shared Types
// ===========================================

// ============ ENUMS ============

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  OWNER = 'OWNER',
  STAFF = 'STAFF',
}

export enum TenantStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export enum DayOfWeek {
  MONDAY = 0,
  TUESDAY = 1,
  WEDNESDAY = 2,
  THURSDAY = 3,
  FRIDAY = 4,
  SATURDAY = 5,
  SUNDAY = 6,
}

export enum NotificationType {
  BOOKING_CONFIRMATION = 'BOOKING_CONFIRMATION',
  BOOKING_REMINDER = 'BOOKING_REMINDER',
  BOOKING_CANCELLED = 'BOOKING_CANCELLED',
}

export enum NotificationChannel {
  EMAIL = 'EMAIL',
  WHATSAPP = 'WHATSAPP',
  SMS = 'SMS',
}

// ============ USER TYPES ============

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

export interface UpdateUserDto {
  email?: string;
  name?: string;
  isActive?: boolean;
}

// ============ TENANT (BUSINESS) TYPES ============

export interface TenantSettings {
  timezone: string;
  currency: string;
  language: string;
  bookingBuffer: number; // minutes between bookings
  maxAdvanceBookingDays: number;
  minAdvanceBookingHours: number;
  allowCancellation: boolean;
  cancellationHoursLimit: number;
  showPrices: boolean;
  requirePhone: boolean;
  requireEmail: boolean;
  primaryColor: string;
  secondaryColor: string;
}

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  logo: string | null;
  coverImage: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  instagram: string | null;
  facebook: string | null;
  website: string | null;
  settings: TenantSettings;
  status: TenantStatus;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTenantDto {
  name: string;
  slug: string;
  description?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
}

export interface UpdateTenantDto {
  name?: string;
  description?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  instagram?: string;
  facebook?: string;
  website?: string;
  settings?: Partial<TenantSettings>;
}

// ============ SERVICE TYPES ============

export interface Service {
  id: string;
  tenantId: string;
  categoryId: string | null;
  name: string;
  description: string | null;
  price: number;
  duration: number; // in minutes
  image: string | null;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceCategory {
  id: string;
  tenantId: string;
  name: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateServiceDto {
  name: string;
  description?: string;
  price: number;
  duration: number;
  categoryId?: string;
  image?: string;
}

export interface UpdateServiceDto {
  name?: string;
  description?: string;
  price?: number;
  duration?: number;
  categoryId?: string;
  image?: string;
  isActive?: boolean;
  order?: number;
}

// ============ SCHEDULE TYPES ============

export interface Schedule {
  id: string;
  tenantId: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlockedDate {
  id: string;
  tenantId: string;
  date: Date;
  reason: string | null;
  createdAt: Date;
}

export interface TimeSlot {
  time: string; // HH:mm format
  available: boolean;
}

export interface DayAvailability {
  date: string; // YYYY-MM-DD format
  slots: TimeSlot[];
}

export interface UpdateScheduleDto {
  schedules: {
    dayOfWeek: DayOfWeek;
    startTime: string;
    endTime: string;
    isActive: boolean;
  }[];
}

export interface CreateBlockedDateDto {
  date: string;
  reason?: string;
}

// ============ BOOKING TYPES ============

export interface Booking {
  id: string;
  tenantId: string;
  serviceId: string;
  customerId: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  service?: Service;
  customer?: Customer;
}

export interface CreateBookingDto {
  serviceId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  notes?: string;
}

export interface UpdateBookingDto {
  status?: BookingStatus;
  notes?: string;
}

// ============ CUSTOMER TYPES ============

export interface Customer {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  email: string | null;
  notes: string | null;
  totalBookings: number;
  lastBookingAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCustomerDto {
  name: string;
  phone: string;
  email?: string;
  notes?: string;
}

export interface UpdateCustomerDto {
  name?: string;
  phone?: string;
  email?: string;
  notes?: string;
}

// ============ MEDIA TYPES ============

export interface Media {
  id: string;
  tenantId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: Date;
}

export interface UploadMediaDto {
  file: File;
  folder?: string;
}

// ============ NOTIFICATION TYPES ============

export interface Notification {
  id: string;
  tenantId: string;
  bookingId: string;
  type: NotificationType;
  channel: NotificationChannel;
  recipient: string;
  content: string;
  sentAt: Date | null;
  status: 'PENDING' | 'SENT' | 'FAILED';
  error: string | null;
  createdAt: Date;
}

// ============ AUTH TYPES ============

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
  businessName: string;
  businessSlug: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  tenantId: string | null;
}

// ============ API RESPONSE TYPES ============

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============ DASHBOARD STATS ============

export interface DashboardStats {
  todayBookings: number;
  weekBookings: number;
  monthBookings: number;
  totalCustomers: number;
  upcomingBookings: Booking[];
  recentCustomers: Customer[];
}

// ============ PUBLIC TENANT VIEW ============

export interface PublicTenant {
  slug: string;
  name: string;
  description: string | null;
  logo: string | null;
  coverImage: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  instagram: string | null;
  facebook: string | null;
  website: string | null;
  settings: Pick<TenantSettings,
    'showPrices' |
    'requirePhone' |
    'requireEmail' |
    'primaryColor' |
    'secondaryColor' |
    'maxAdvanceBookingDays' |
    'minAdvanceBookingHours'
  >;
  services: PublicService[];
  categories: ServiceCategory[];
}

export interface PublicService {
  id: string;
  name: string;
  description: string | null;
  price: number | null; // null if showPrices is false
  duration: number;
  image: string | null;
  categoryId: string | null;
}
