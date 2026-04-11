/**
 * API Client - Robust, type-safe API client with error handling
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// =============================================================================
// Types
// =============================================================================

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
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

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId: string | null;
  tenantType?: string;
  isActive: boolean;
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
  status: string;
  settings: string;
  publicPageLayout?: string;
  publicPageConfig?: string;
}

export interface TenantPublic {
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
  settings: {
    showPrices: boolean;
    requirePhone: boolean;
    requireEmail: boolean;
    primaryColor: string;
    secondaryColor: string;
    accentColor?: string;
    enableDarkMode?: boolean;
    backgroundStyle?: 'minimal' | 'modern' | 'elegant' | 'fresh' | 'vibrant';
    heroStyle?: string;
    maxAdvanceBookingDays: number;
    minAdvanceBookingHours: number;
    requireDeposit?: boolean;
    depositPercentage?: number;
    depositMode?: string;
    smartTimeSlots?: boolean;
    bookingMode?: 'HOURLY' | 'DAILY';
    dailyCheckInTime?: string;
    dailyCheckOutTime?: string;
    dailyMinNights?: number;
    dailyMaxNights?: number;
    rubro?: string;
    storeType?: 'catalogo' | 'ecommerce';
    logoScale?: number;
    logoOffsetX?: number;
    logoOffsetY?: number;
  };
  publicPageLayout?: 'employee_first' | 'specialty_first' | 'service_first';
  publicPageConfig?: Record<string, unknown>;
  services: ServicePublic[];
  categories: Category[];
  specialties?: SpecialtyPublic[];
}

export interface SpecialtyPublic {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  _count?: {
    services: number;
    employeeSpecialties: number;
  };
}

export interface Service {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  price: number;
  duration: number;
  image: string | null;
  includes: string | null;
  isActive: boolean;
  order: number;
  categoryId: string | null;
  images?: string[];
  imageDisplayMode?: string;
  variations?: VariationGroup[];
  mode?: string;
}

export interface ServicePublic {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  duration: number;
  image: string | null;
  includes: string | null;
  categoryId: string | null;
  specialtyId?: string | null;
  assignmentMode?: string;
  specialty?: { id: string; name: string; slug: string } | null;
  mode?: string;
}

export interface Category {
  id: string;
  name: string;
  order: number;
}

// Products (Mercado)
export interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  isPrimary: boolean;
  order: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  value: string;
  sku: string | null;
  price: number | null;
  stock: number;
  isActive: boolean;
}

export interface ProductCategory {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  image: string | null;
  order: number;
  parentId: string | null;
  _count?: { products: number };
}

export interface ProductAttribute {
  key: string;
  label: string;
  value: string;
  type: 'text' | 'textarea' | 'number' | 'boolean' | 'select' | 'multiselect';
  unit?: string;
}

export interface Product {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  price: number;
  currency?: string;
  compareAtPrice: number | null;
  costPrice: number | null;
  sku: string | null;
  stock: number;
  lowStockThreshold: number;
  trackInventory: boolean;
  type: string;
  digitalFileUrl: string | null;
  attributes: ProductAttribute[] | null;
  isActive: boolean;
  isFeatured: boolean;
  order: number;
  categoryId: string | null;
  category: ProductCategory | null;
  images: ProductImage[];
  variants: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductStats {
  total: number;
  active: number;
  featured: number;
  lowStock: number;
}

export interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  recentOrders: Order[];
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: string;
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  notes?: string;
  orderType?: string;
  shippingAddress?: string;
  createdAt: string;
  updatedAt: string;
  _count?: { items: number };
  items?: OrderItem[];
  statusHistory?: OrderStatusHistoryEntry[];
  payments?: OrderPayment[];
  deliveryToken?: string | null;
  deliveryEmployeeId?: string | null;
  deliveryEmployee?: { id: string; name: string; phone: string | null; deliveryVehicle: string | null; image: string | null } | null;
}

export interface OrderItem {
  id: string;
  productName: string;
  variantName?: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product?: { id: string; name: string; slug: string; images?: { url: string }[] };
}

export interface OrderStatusHistoryEntry {
  id: string;
  status: string;
  note?: string;
  createdAt: string;
}

export interface OrderPayment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod?: string;
  payerEmail?: string;
  paidAt?: string;
}

// ─── Quotes (Presupuestos) ───────────────────────────────

export interface Quote {
  id: string;
  quoteNumber: string;
  publicToken: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  customer?: { id: string; name: string; phone: string; email?: string };
  status: string;
  title?: string;
  notes?: string;
  internalNotes?: string;
  terms?: string;
  subtotal: number;
  discount: number;
  total: number;
  validUntil?: string;
  validDays: number;
  sentAt?: string;
  viewedAt?: string;
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
  items?: QuoteItem[];
  tenant?: { id: string; name: string; slug: string; logo?: string; phone?: string; address?: string; city?: string; instagram?: string };
}

export interface QuoteItem {
  id: string;
  type: string;
  serviceId?: string;
  productId?: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  position: number;
  service?: { id: string; name: string; duration?: number; price?: number };
  product?: { id: string; name: string; images?: { url: string }[] };
}

export interface QuoteStats {
  total: number;
  draft: number;
  sent: number;
  accepted: number;
  rejected: number;
  expired: number;
  acceptanceRate: number;
  totalAcceptedValue: number;
}

export interface CreateQuoteData {
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  customerId?: string;
  title?: string;
  notes?: string;
  internalNotes?: string;
  terms?: string;
  discount?: number;
  validDays?: number;
  validUntil?: string;
  items: {
    type: 'SERVICE' | 'PRODUCT' | 'CUSTOM';
    serviceId?: string;
    productId?: string;
    name: string;
    description?: string;
    quantity: number;
    unitPrice: number;
  }[];
}

export interface CreateProductData {
  name: string;
  description?: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  sku?: string;
  stock?: number;
  lowStockThreshold?: number;
  trackInventory?: boolean;
  type?: string;
  digitalFileUrl?: string;
  categoryId?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  attributes?: ProductAttribute[];
}

export interface CreateProductVariantData {
  name: string;
  value: string;
  sku?: string;
  price?: number;
  stock?: number;
  isActive?: boolean;
}

export interface TenantBranding {
  id: string;
  tenantId: string;
  primaryColor: string | null;
  secondaryColor: string | null;
  accentColor: string | null;
  backgroundColor: string | null;
  textColor: string | null;
  fontFamily: string | null;
  headingFontFamily: string | null;
  logoUrl: string | null;
  coverImageUrl: string | null;
  faviconUrl: string | null;
  bannerImageUrl: string | null;
  welcomeTitle: string | null;
  welcomeSubtitle: string | null;
  footerText: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  showPrices: boolean;
  showStock: boolean;
  enableWishlist: boolean;
  enableReviews: boolean;
  storeEnabled: boolean;
  backgroundStyle: string | null;
  // Store Visual Customization
  storeHeroStyle: string | null;
  storeCardStyle: string | null;
  profilePhotoStyle: string | null;
  announcementEnabled: boolean;
  announcementText: string | null;
  announcementBgColor: string | null;
  announcementTextColor: string | null;
  announcementSpeed: string | null;
  showCategoryFilter: boolean;
  showSearchBar: boolean;
  showWhatsappButton: boolean;
  // Advanced Store Customization
  buttonStyle: string | null;
  buttonText: string | null;
  cardBorderRadius: string | null;
  imageAspectRatio: string | null;
  heroHeight: string | null;
  heroOverlay: string | null;
  mobileColumns: number;
  priceStyle: string | null;
  categoryStyle: string | null;
  // Logo Scale
  logoScale: number;
  logoOffsetX: number;
  logoOffsetY: number;
  // Logo Glow
  logoGlowEnabled: boolean;
  logoGlowColor: string | null;
  logoGlowIntensity: string | null;
  // Background Effects
  backgroundEffect: string | null;
  backgroundEffectColor: string | null;
  backgroundEffectOpacity: number;
  // Page Gradient
  gradientEnabled: boolean;
  gradientStyle: string;
  gradientFrom: string;
  gradientTo: string;
  // Carousel
  carouselImages: Array<{ url: string; linkUrl?: string; order: number }>;
}

export interface Employee {
  id: string;
  tenantId: string;
  name: string;
  email: string | null;
  phone: string | null;
  image: string | null;
  specialty: string | null;
  bio: string | null;
  credentials: string | null;
  seniority: string | null;
  isPubliclyVisible: boolean;
  isActive: boolean;
  order: number;
  isDelivery?: boolean;
  deliveryVehicle?: string | null;
  deliveryZone?: string | null;
}

export interface CreateEmployeeData {
  name: string;
  email?: string;
  phone?: string;
  image?: string;
  specialty?: string;
  bio?: string;
  credentials?: string;
  seniority?: string;
  isPubliclyVisible?: boolean;
  isActive?: boolean;
  order?: number;
  isDelivery?: boolean;
  deliveryVehicle?: string;
  deliveryZone?: string;
}

export interface DeliveryStaffMember {
  id: string;
  name: string;
  phone: string | null;
  deliveryVehicle: string | null;
  deliveryZone: string | null;
  image: string | null;
}

export interface Specialty {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  isActive: boolean;
  order: number;
  _count?: {
    services: number;
    employeeSpecialties: number;
  };
}

export interface CreateSpecialtyData {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  isActive?: boolean;
  order?: number;
}

export interface EmployeeServiceAssignment {
  id: string;
  name: string;
  price: number;
  duration: number;
  customPrice: number | null;
  customDuration: number | null;
  employeeServiceId: string;
}

export interface EmployeeSpecialtyAssignment {
  id: string;
  name: string;
  slug: string;
  seniorityLevel: string | null;
  customRate: number | null;
  employeeSpecialtyId: string;
}

// Intake Forms
export interface IntakeFormField {
  id: string;
  type: string;
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
  helpText?: string;
}

export interface IntakeForm {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  fields: IntakeFormField[];
  isActive: boolean;
  order: number;
  _count?: { services: number; submissions: number };
}

export interface CreateIntakeFormData {
  name: string;
  description?: string;
  fields: IntakeFormField[];
  isActive?: boolean;
  order?: number;
}

export interface IntakeSubmission {
  id: string;
  intakeFormId: string;
  bookingId: string | null;
  customerId: string | null;
  data: Record<string, unknown>;
  createdAt: string;
  customer?: { id: string; name: string; phone: string };
  booking?: { id: string; date: string; startTime: string };
}

// Branch types
export interface Branch {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  image: string | null;
  address: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  isMain: boolean;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    branchServices: number;
    branchEmployees: number;
  };
}

export interface BranchPublic {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  address: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  isMain: boolean;
}

export interface CreateBranchData {
  name: string;
  slug: string;
  image?: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  isMain?: boolean;
  isActive?: boolean;
  order?: number;
}

export interface BranchService {
  id: string;
  branchId: string;
  serviceId: string;
  priceOverride: number | null;
  isActive: boolean;
  service: Service;
}

export interface BranchEmployee {
  id: string;
  branchId: string;
  employeeId: string;
  isActive: boolean;
  employee: Employee;
}

export interface BranchSchedule {
  id: string;
  branchId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface BranchBlockedDate {
  id: string;
  branchId: string;
  date: string;
  reason: string | null;
}

export interface Booking {
  id: string;
  tenantId: string;
  serviceId: string | null;
  productId: string | null;
  quantity: number;
  customerId: string;
  employeeId: string | null;
  date: string;
  startTime: string;
  endTime: string;
  checkOutDate: string | null;
  totalNights: number | null;
  totalPrice: number | null;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  notes: string | null;
  createdAt: string;
  bookingMode: string | null;
  videoProvider: string | null;
  videoJoinUrl: string | null;
  service: Service | null;
  product: Product | null;
  customer: Customer;
  employee: Employee | null;
}

export interface Customer {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  email: string | null;
  notes: string | null;
  extraInfo?: Record<string, Record<string, unknown>> | null;
  totalBookings: number;
  lastVisit: string | null;
  createdAt: string;
}

export interface Schedule {
  id: string;
  tenantId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface BlockedDate {
  id: string;
  tenantId: string;
  date: string;
  reason: string | null;
}

export interface EmployeeSchedule {
  id: string;
  employeeId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface EmployeeBlockedDate {
  id: string;
  employeeId: string;
  date: string;
  reason: string | null;
}

export interface EffectiveScheduleDay {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  source: 'employee' | 'branch' | 'tenant' | 'default';
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface DashboardStats {
  todayBookings: number;
  weekBookings: number;
  monthBookings: number;
  totalCustomers: number;
  upcomingBookings: Booking[];
  recentCustomers: Customer[];
}

export interface CreateBookingData {
  serviceId?: string;
  productId?: string;
  quantity?: number;
  branchId?: string;
  employeeId?: string;
  date: string;
  startTime: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  notes?: string;
  bookingMode?: string;
  intakeFormId?: string;
  intakeFormData?: Record<string, unknown>;
}

export interface CreateDailyBookingData {
  serviceId: string;
  branchId?: string;
  checkInDate: string;
  checkOutDate: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  notes?: string;
  bookingMode?: string;
}

export interface DailyAvailabilityDay {
  date: string;
  available: boolean;
}

export type MonthlyAvailabilityMap = Record<string, boolean>;

// Service Variations
export interface VariationOption {
  id: string;
  name: string;
  priceModifier: number;
  pricingType: 'absolute' | 'relative';
  durationModifier: number;
}

export interface VariationGroup {
  id: string;
  label: string;
  type: 'single' | 'multi';
  required: boolean;
  options: VariationOption[];
}

export interface CreateServiceData {
  name: string;
  description?: string;
  price: number;
  duration: number;
  capacity?: number;
  mode?: string;
  isActive?: boolean;
  categoryId?: string;
  image?: string;
  images?: string[];
  imageDisplayMode?: string;
  includes?: string;
  variations?: string;
}

export interface UpdateServiceData extends Partial<CreateServiceData> {
  order?: number;
}

export interface ScheduleUpdate {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

// Talent Profile types
export interface TalentProfile {
  id: string;
  name: string;
  phone: string | null;
  image: string | null;
  specialty: string | null;
  category: string | null;
  coverImage: string | null;
  headerTemplate: string | null;
  headline: string | null;
  bio: string | null;
  yearsExperience: number | null;
  skills: string[];
  certifications: string[];
  availability: string | null;
  preferredZones: string[];
  openToWork: boolean;
  profileVisible: boolean;
  experiences: Array<{
    id: string;
    businessName: string;
    role: string;
    startDate: string;
    endDate: string | null;
    isCurrent: boolean;
    description: string | null;
  }>;
}

// My Professional Profile (self-registered PROFESSIONAL users)
export interface MyProfileData {
  name: string;
  phone?: string;
  headline?: string;
  bio?: string;
  specialty?: string;
  category?: string;
  image?: string;
  coverImage?: string;
  headerTemplate?: string;
  yearsExperience?: number;
  skills?: string[];
  certifications?: string[];
  availability?: string;
  preferredZones?: string[];
  openToWork?: boolean;
  profileVisible?: boolean;
}

export interface ExperienceData {
  businessName: string;
  role: string;
  startDate: string;
  endDate?: string;
  isCurrent?: boolean;
  description?: string;
}

// Talent Proposal types
export interface TalentProposal {
  id: string;
  profileId: string;
  profile?: { name: string; specialty: string | null; image: string | null; email?: string; phone?: string | null };
  senderTenantId: string;
  senderTenant?: { name: string };
  role: string;
  message: string;
  availability: string | null;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  respondedAt: string | null;
  responseMessage: string | null;
  viewedAt: string | null;
  createdAt: string;
}

// Public Talent types (reduced data for unauthenticated visitors)
export interface PublicTalentProfile {
  id: string;
  name: string;
  image: string | null;
  specialty: string | null;
  headline: string | null;
  bio: string | null;
  yearsExperience: number | null;
  skills: string[];
  availability: string | null;
  openToWork: boolean;
}

export interface PublicTalentProfileDetail extends PublicTalentProfile {
  experiences: Array<{
    id: string;
    businessName: string;
    role: string;
    startDate: string;
    endDate: string | null;
    isCurrent: boolean;
  }>;
}

// Full public talent profile (for shareable CV page)
export interface PublicTalentFullProfile {
  id: string;
  name: string;
  image: string | null;
  specialty: string | null;
  category: string | null;
  coverImage: string | null;
  headerTemplate: string | null;
  headline: string | null;
  bio: string | null;
  yearsExperience: number | null;
  skills: string[];
  certifications: string[];
  availability: string | null;
  preferredZones: string[];
  openToWork: boolean;
  profileVisible: boolean;
  experiences: Array<{
    id: string;
    businessName: string;
    role: string;
    startDate: string;
    endDate: string | null;
    isCurrent: boolean;
    description: string | null;
  }>;
}

// Job Postings (Ofertas Laborales)
export interface JobPosting {
  id: string;
  tenantId: string;
  tenant?: { id: string; name: string; logo: string | null; city: string | null };
  title: string;
  description: string;
  category: string;
  requiredSkills: string[];
  availability: string | null;
  minExperience: number | null;
  zone: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  salaryPeriod: string | null;
  status: 'OPEN' | 'PAUSED' | 'CLOSED' | 'EXPIRED';
  deadline: string | null;
  maxApplications: number | null;
  applicationCount?: number;
  hasApplied?: boolean;
  createdAt: string;
}

export interface JobApplication {
  id: string;
  postingId: string;
  posting?: JobPosting;
  profileId: string;
  profile?: {
    id: string;
    name: string;
    email?: string;
    phone?: string | null;
    image: string | null;
    specialty: string | null;
    category: string | null;
    headline: string | null;
    yearsExperience: number | null;
    skills: string[];
    availability: string | null;
    preferredZones: string[];
  };
  message: string;
  availability: string | null;
  status: 'PENDING' | 'REVIEWED' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  respondedAt: string | null;
  responseMessage: string | null;
  viewedAt: string | null;
  createdAt: string;
}

export interface CreateJobPostingData {
  title: string;
  description: string;
  category: string;
  requiredSkills?: string;
  availability?: string;
  minExperience?: number;
  zone?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  salaryPeriod?: string;
  deadline?: string;
  maxApplications?: number;
}

// =============================================================================
// Report Types
// =============================================================================

export interface ReportOverview {
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  noShowBookings: number;
  pendingBookings: number;
  totalCustomers: number;
  totalRevenue: number;
  completionRate: number;
  cancellationRate: number;
  noShowRate: number;
}

export interface BookingsByStatus {
  status: string;
  count: number;
}

export interface BookingsByDay {
  day: string;
  dayIndex: number;
  count: number;
}

export interface TopService {
  serviceId: string;
  name: string;
  bookings: number;
  revenue: number;
}

export interface TopCustomer {
  customerId: string;
  name: string;
  phone: string;
  bookings: number;
  revenue: number;
}

// Order-based report types (mercado/ecommerce)
export interface OrderReportOverview {
  totalOrders: number;
  deliveredOrders: number;
  confirmedOrders: number;
  cancelledOrders: number;
  processingOrders: number;
  pendingOrders: number;
  totalCustomers: number;
  totalRevenue: number;
  completionRate: number;
  cancellationRate: number;
}

export interface OrdersByStatus {
  status: string;
  count: number;
}

export interface TopProduct {
  productId: string;
  name: string;
  orders: number;
  revenue: number;
}

export interface TopOrderCustomer {
  customerId: string;
  name: string;
  phone: string;
  orders: number;
  revenue: number;
}

export interface OrderTrend {
  date: string;
  total: number;
  PENDING: number;
  CONFIRMED: number;
  PROCESSING: number;
  SHIPPED: number;
  DELIVERED: number;
  CANCELLED: number;
}

export interface OrderCancellationTrend {
  week: string;
  total: number;
  cancelled: number;
  cancellationRate: number;
}

export interface ProductPerformance {
  productId: string;
  name: string;
  totalOrders: number;
  totalUnits: number;
  deliveredUnits: number;
  revenue: number;
  fulfillmentRate: number;
}

export interface RevenueReport {
  data: Array<{ date: string; revenue: number }>;
  summary: { total: number; average: number; days: number };
}

export interface BookingTrend {
  date: string;
  total: number;
  PENDING: number;
  CONFIRMED: number;
  COMPLETED: number;
  CANCELLED: number;
  NO_SHOW: number;
}

export interface PeakHoursReport {
  matrix: number[][];
  maxCount: number;
}

export interface CancellationTrend {
  week: string;
  total: number;
  cancelled: number;
  noShow: number;
  cancellationRate: number;
  noShowRate: number;
}

export interface CustomerRetention {
  month: string;
  newCustomers: number;
  returningCustomers: number;
}

export interface EmployeePerformance {
  employeeId: string | null;
  name: string;
  totalBookings: number;
  completed: number;
  cancelled: number;
  noShow: number;
  revenue: number;
  completionRate: number;
}

export interface ServicePerformance {
  serviceId: string;
  name: string;
  price: number;
  totalBookings: number;
  completedBookings: number;
  revenue: number;
  completionRate: number;
}

export interface BranchComparison {
  branchId: string;
  branchName: string;
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  noShowBookings: number;
  revenue: number;
  completionRate: number;
}

export interface ReportParams {
  period?: '7d' | '30d' | '90d' | 'custom';
  startDate?: string;
  endDate?: string;
  branchId?: string;
}

// =============================================================================
// API Error Class
// =============================================================================

export class ApiRequestError extends Error {
  statusCode: number;
  originalError?: string;
  validationDetails?: string[];

  constructor(message: string, statusCode: number, originalError?: string, validationDetails?: string[]) {
    super(message);
    this.name = 'ApiRequestError';
    this.statusCode = statusCode;
    this.originalError = originalError;
    this.validationDetails = validationDetails;
  }

  get isUnauthorized() {
    return this.statusCode === 401;
  }

  get isForbidden() {
    return this.statusCode === 403;
  }

  get isNotFound() {
    return this.statusCode === 404;
  }

  get isValidationError() {
    return this.statusCode === 400;
  }

  get isServerError() {
    return this.statusCode >= 500;
  }
}

// =============================================================================
// Request Helper
// =============================================================================

interface RequestOptions extends RequestInit {
  token?: string;
  retries?: number;
  retryDelay?: number;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    token,
    retries = 2,
    retryDelay = 1000,
    ...fetchOptions
  } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Request timeout: abort after 30s to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(`${API_URL}/api${endpoint}`, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle empty and non-JSON responses
      const contentType = response.headers.get('content-type');
      const contentLength = response.headers.get('content-length');
      let data: unknown;

      // Empty body (e.g. null returned from API)
      if (contentLength === '0') {
        data = null;
      } else if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = text.length === 0 ? null : { message: text };
      }

      if (!response.ok) {
        const errorData = data as {
          message?: string;
          error?: string | { code?: string; message?: string; details?: { validation?: string[] } };
        };
        // Handle nested error format from API: { error: { message, details } }
        const nestedError = typeof errorData.error === 'object' ? errorData.error : null;
        const errorMessage = nestedError?.message || errorData.message ||
          (typeof errorData.error === 'string' ? errorData.error : null) ||
          `Request failed with status ${response.status}`;
        const validationDetails = nestedError?.details?.validation;
        throw new ApiRequestError(
          errorMessage,
          response.status,
          nestedError?.code || (typeof errorData.error === 'string' ? errorData.error : undefined),
          validationDetails
        );
      }

      return data as T;

    } catch (error) {
      lastError = error as Error;

      // Don't retry on client errors (4xx) except for rate limiting
      if (error instanceof ApiRequestError) {
        if (error.statusCode < 500 && error.statusCode !== 429) {
          // Redirect to login on 401 (session expired)
          if (error.statusCode === 401 && typeof window !== 'undefined') {
            window.location.href = '/login?error=session_expired';
          }
          throw error;
        }
      }

      // Retry on network errors (timeout, connection refused, etc.)
      const isNetworkError = error instanceof TypeError ||
        (error instanceof DOMException && error.name === 'AbortError');
      if (!isNetworkError && !(error instanceof ApiRequestError)) {
        throw error; // Unknown error type, don't retry
      }

      // Wait before retrying
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
      }
    }
  }

  throw lastError || new Error('Request failed');
}

// =============================================================================
// Auth API
// =============================================================================

export const authApi = {
  login: async (email: string, password: string) => {
    return request<{
      accessToken: string;
      refreshToken: string;
      user: User;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      retries: 0, // Don't retry login
    });
  },

  register: async (data: {
    email: string;
    password: string;
    name: string;
    businessName?: string;
    businessSlug?: string;
    accountType?: 'BUSINESS' | 'PROFESSIONAL';
    companyName?: string;
    specialty?: string;
    category?: string;
    industry?: string;
  }) => {
    return request<{
      accessToken: string;
      refreshToken: string;
      user: User;
      tenant: Tenant & { type?: string };
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
      retries: 0,
    });
  },

  refresh: async (refreshToken: string) => {
    return request<{
      accessToken: string;
      refreshToken: string;
    }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
      retries: 0,
    });
  },

  changePassword: async (
    token: string,
    currentPassword: string,
    newPassword: string
  ) => {
    return request<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
      token,
      retries: 0,
    });
  },

  forgotPassword: async (email: string) => {
    return request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
      retries: 0,
    });
  },

  resetPassword: async (token: string, newPassword: string) => {
    return request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
      retries: 0,
    });
  },

  acceptInvitation: async (data: { token: string; name: string; email: string; password: string }) => {
    return request<{
      accessToken: string;
      refreshToken: string;
      user: User & { employeeId?: string; employeeRole?: string };
      tenant: Tenant & { type?: string };
    }>('/auth/accept-invitation', {
      method: 'POST',
      body: JSON.stringify(data),
      retries: 0,
    });
  },

  validateInvitation: async (token: string) => {
    return request<{
      valid: boolean;
      expired: boolean;
      email: string;
      role: string;
      tenant: { id: string; name: string; slug: string; logo: string | null };
      employee: { id: string; name: string };
    }>(`/employee-portal/invitations/validate/${token}`);
  },
};

// =============================================================================
// Public API (No auth required)
// =============================================================================

export interface EmployeePublic {
  id: string;
  name: string;
  image: string | null;
  specialty: string | null;
  bio: string | null;
  credentials: string | null;
  seniority: string | null;
}

export interface DeliveryOrderPublic {
  orderNumber: string;
  status: string;
  orderType: string | null;
  customerName: string;
  customerPhone: string | null;
  shippingAddress: string | null;
  notes: string | null;
  items: { productName: string; variantName: string | null; quantity: number; itemNotes: string | null }[];
  total: number;
  tenant: { name: string; slug: string; logo: string | null };
  deliveryEmployeeName: string | null;
  nextStatus: string | null;
  pickupWordOptions: string[] | null;
  requiresPickupWord: boolean;
}

export const publicApi = {
  getTenant: async (slug: string): Promise<TenantPublic> => {
    return request<TenantPublic>(`/public/tenants/${slug}`);
  },

  getDeliveryByToken: async (token: string): Promise<DeliveryOrderPublic> => {
    return request<DeliveryOrderPublic>(`/public/delivery/${token}`);
  },

  advanceDelivery: async (token: string): Promise<{ orderNumber: string; status: string; nextStatus: string | null }> => {
    return request(`/public/delivery/${token}/advance`, { method: 'POST' });
  },

  confirmDeliveryWord: async (token: string, word: string): Promise<{ orderNumber: string; status: string; nextStatus: string | null }> => {
    return request(`/public/delivery/${token}/confirm-delivery`, {
      method: 'POST',
      body: JSON.stringify({ word }),
    });
  },

  getEmployees: async (slug: string): Promise<EmployeePublic[]> => {
    return request<EmployeePublic[]>(`/public/tenants/${slug}/employees`);
  },

  getServiceEmployees: async (slug: string, serviceId: string): Promise<(EmployeePublic & { customPrice?: number | null; customDuration?: number | null })[]> => {
    return request<(EmployeePublic & { customPrice?: number | null; customDuration?: number | null })[]>(`/public/tenants/${slug}/services/${serviceId}/employees`);
  },

  getEmployeeServices: async (slug: string, employeeId: string): Promise<{ id: string; name: string; description: string | null; price: number | null; duration: number; mode: string | null; image: string | null; specialtyId: string | null; categoryId: string | null; customPrice: number | null; customDuration: number | null }[]> => {
    return request(`/public/tenants/${slug}/employees/${employeeId}/services`);
  },

  getIntakeForm: async (slug: string, formId: string): Promise<{ id: string; name: string; description: string | null; fields: IntakeFormField[] }> => {
    return request<{ id: string; name: string; description: string | null; fields: IntakeFormField[] }>(`/public/tenants/${slug}/intake-forms/${formId}`);
  },

  getAvailability: async (
    slug: string,
    date: string,
    serviceId?: string,
    employeeId?: string,
  ): Promise<TimeSlot[]> => {
    const params = new URLSearchParams({ date });
    if (serviceId) params.append('serviceId', serviceId);
    if (employeeId) params.append('employeeId', employeeId);
    return request<TimeSlot[]>(`/public/bookings/${slug}/availability?${params}`);
  },

  createBooking: async (slug: string, data: CreateBookingData): Promise<Booking> => {
    return request<Booking>(`/public/bookings/${slug}`, {
      method: 'POST',
      body: JSON.stringify(data),
      retries: 0, // Don't retry booking creation
    });
  },

  getDailyAvailability: async (
    slug: string,
    startDate: string,
    endDate: string,
    branchId?: string
  ): Promise<DailyAvailabilityDay[]> => {
    const params = new URLSearchParams({ startDate, endDate });
    if (branchId) params.append('branchId', branchId);
    return request<DailyAvailabilityDay[]>(`/public/bookings/${slug}/daily-availability?${params}`);
  },

  getMonthlyAvailability: async (
    slug: string,
    year: number,
    month: number,
    serviceId?: string,
    branchId?: string,
  ): Promise<MonthlyAvailabilityMap> => {
    const params = new URLSearchParams({ year: String(year), month: String(month) });
    if (serviceId) params.append('serviceId', serviceId);
    if (branchId) params.append('branchId', branchId);
    return request<MonthlyAvailabilityMap>(`/public/bookings/${slug}/monthly-availability?${params}`);
  },

  createDailyBooking: async (slug: string, data: CreateDailyBookingData): Promise<Booking & { requiresPayment?: boolean; depositMode?: string }> => {
    return request<Booking & { requiresPayment?: boolean; depositMode?: string }>(`/public/bookings/${slug}/daily`, {
      method: 'POST',
      body: JSON.stringify(data),
      retries: 0,
    });
  },

  // Branch public methods
  getBranches: async (slug: string): Promise<BranchPublic[]> => {
    return request<BranchPublic[]>(`/public/tenants/${slug}/branches`);
  },

  getBranch: async (slug: string, branchSlug: string): Promise<Branch> => {
    return request<Branch>(`/public/tenants/${slug}/branches/${branchSlug}`);
  },

  getBranchServices: async (slug: string, branchSlug: string): Promise<ServicePublic[]> => {
    return request<ServicePublic[]>(`/public/tenants/${slug}/branches/${branchSlug}/services`);
  },

  // Products & Branding (Mercado)
  getProducts: async (slug: string, categoryId?: string): Promise<Product[]> => {
    const params = categoryId ? `?categoryId=${categoryId}` : '';
    return request<Product[]>(`/public/tenants/${slug}/products${params}`);
  },

  getProduct: async (slug: string, productSlug: string): Promise<Product> => {
    return request<Product>(`/public/tenants/${slug}/products/${productSlug}`);
  },

  getProductCategories: async (slug: string): Promise<ProductCategory[]> => {
    return request<ProductCategory[]>(`/public/tenants/${slug}/product-categories`);
  },

  getBranding: async (slug: string): Promise<TenantBranding> => {
    return request<TenantBranding>(`/public/tenants/${slug}/branding`);
  },

  getBranchEmployees: async (
    slug: string,
    branchSlug: string,
    serviceId?: string
  ): Promise<EmployeePublic[]> => {
    const params = serviceId ? `?serviceId=${serviceId}` : '';
    return request<EmployeePublic[]>(`/public/tenants/${slug}/branches/${branchSlug}/employees${params}`);
  },

  getBranchAvailability: async (
    slug: string,
    branchSlug: string,
    date: string,
    serviceId?: string
  ): Promise<TimeSlot[]> => {
    const params = new URLSearchParams({ date });
    if (serviceId) params.append('serviceId', serviceId);
    return request<TimeSlot[]>(`/public/tenants/${slug}/branches/${branchSlug}/availability?${params}`);
  },

  // Orders (E-commerce)
  createOrder: async (slug: string, data: {
    items: { productId: string; variantId?: string; quantity: number; options?: string; itemNotes?: string }[];
    customer: { name: string; email?: string; phone: string; dni?: string };
    shipping?: {
      method: 'retiro' | 'envio' | 'punto_encuentro';
      address?: string;
      city?: string;
      postalCode?: string;
      province?: string;
      formattedAddress?: string;
      lat?: number;
      lng?: number;
      placeId?: string;
    };
    paymentMethod?: 'mercadopago' | 'transferencia' | 'efectivo';
    orderType?: 'DINE_IN' | 'TAKE_AWAY' | 'DELIVERY';
    tableNumber?: string;
    couponCode?: string;
    notes?: string;
  }): Promise<{ order: any; initPoint?: string }> => {
    return request<{ order: any; initPoint?: string }>(`/public/tenants/${slug}/orders`, {
      method: 'POST',
      body: JSON.stringify(data),
      retries: 0,
    });
  },

  getOrder: async (slug: string, orderNumber: string): Promise<{ order: any; businessName: string }> => {
    return request<{ order: any; businessName: string }>(`/public/tenants/${slug}/orders/${encodeURIComponent(orderNumber)}`);
  },

  validateCoupon: async (slug: string, code: string, subtotal: number): Promise<{ valid: boolean; discount: number; message?: string }> => {
    return request<{ valid: boolean; discount: number; message?: string }>(`/public/tenants/${slug}/orders/validate-coupon`, {
      method: 'POST',
      body: JSON.stringify({ code, subtotal }),
      retries: 0,
    });
  },

  getPaymentMethods: async (slug: string): Promise<{ mercadopago: boolean; transferencia: boolean; efectivo: boolean }> => {
    return request<{ mercadopago: boolean; transferencia: boolean; efectivo: boolean }>(`/public/tenants/${slug}/payment-methods`);
  },

  getOrderByNumber: async (slug: string, orderNumber: string): Promise<{ order: any; businessName: string }> => {
    return request<{ order: any; businessName: string }>(`/public/tenants/${slug}/orders/${encodeURIComponent(orderNumber)}`);
  },

  payOrder: async (slug: string, orderNumber: string, paymentMethod: 'efectivo' | 'mercadopago'): Promise<{ initPoint?: string; success?: boolean }> => {
    return request<{ initPoint?: string; success?: boolean }>(`/public/tenants/${slug}/orders/${encodeURIComponent(orderNumber)}/pay`, {
      method: 'POST',
      body: JSON.stringify({ paymentMethod }),
      retries: 0,
    });
  },

  // Quotes (public)
  getPublicQuote: async (token: string): Promise<Quote> => {
    return request<Quote>(`/public/quotes/${token}`);
  },

  respondToQuote: async (token: string, action: 'ACCEPTED' | 'REJECTED'): Promise<Quote> => {
    return request<Quote>(`/public/quotes/${token}/respond`, {
      method: 'POST',
      body: JSON.stringify({ action }),
      retries: 0,
    });
  },

  // Loyalty (public)
  getLoyaltyProgram: async (slug: string): Promise<{ programName: string; isActive: boolean } | null> => {
    return request<{ programName: string; isActive: boolean } | null>(`/public/tenants/${slug}/loyalty/program`);
  },

  getLoyaltyRewards: async (slug: string): Promise<any[]> => {
    return request<any[]>(`/public/tenants/${slug}/loyalty/rewards`);
  },

  redeemLoyaltyReward: async (slug: string, data: { rewardId: string; phone: string; email: string }) => {
    return request<any>(`/public/tenants/${slug}/loyalty/redeem`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Sorteos (public)
  getSorteos: async (slug: string): Promise<any[]> => {
    return request<any[]>(`/public/tenants/${slug}/sorteos`);
  },

  registerSorteo: async (slug: string, sorteoId: string, data: { name: string; phone: string; email?: string }) => {
    return request<any>(`/public/tenants/${slug}/sorteos/${sorteoId}/register`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getDevelopments: async (slug: string): Promise<any[]> => {
    return request<any[]>(`/public/tenants/${slug}/developments`);
  },

  getDevelopment: async (slug: string, projectSlug: string): Promise<any> => {
    return request<any>(`/public/tenants/${slug}/developments/${projectSlug}`);
  },

  getDevelopmentPaymentPlans: async (slug: string, projectSlug: string): Promise<any[]> => {
    return request<any[]>(`/public/tenants/${slug}/developments/${projectSlug}/payment-plans`);
  },
};

// =============================================================================
// Public Professional Profile API
// =============================================================================

export const publicProfileApi = {
  getProposalsReceived: (token: string) =>
    request<TalentProposal[]>(`/public/professional-profile/${token}/proposals`),

  respondProposal: (token: string, proposalId: string, data: { status: 'ACCEPTED' | 'REJECTED'; responseMessage?: string }) =>
    request<TalentProposal>(`/public/professional-profile/${token}/proposals/${proposalId}/respond`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  markProposalViewed: (token: string, proposalId: string) =>
    request<{ success: boolean }>(`/public/professional-profile/${token}/proposals/${proposalId}/viewed`, {
      method: 'PUT',
    }),
};

// =============================================================================
// Public Talent Browse API (no auth required)
// =============================================================================

export const publicTalentApi = {
  browse: (params?: {
    search?: string;
    specialty?: string;
    category?: string;
    availability?: string;
    openToWork?: boolean;
    page?: number;
    limit?: number;
  }) => {
    const query = params
      ? `?${new URLSearchParams(
          Object.entries(params)
            .filter(([, v]) => v !== undefined)
            .map(([k, v]) => [k, String(v)])
        ).toString()}`
      : '';
    return request<PaginatedResponse<PublicTalentProfile>>(`/public/talent${query}`);
  },

  getProfile: (id: string) =>
    request<PublicTalentProfileDetail>(`/public/talent/${id}`),

  getFullProfile: (id: string) =>
    request<PublicTalentFullProfile>(`/public/talent/${id}/profile`),
};

// =============================================================================
// Protected API Client Factory
// =============================================================================

export function createApiClient(token: string) {
  const authRequest = <T>(endpoint: string, options: RequestOptions = {}) =>
    request<T>(endpoint, { ...options, token });

  return {
    // User Profile
    getProfile: () => authRequest<User>('/users/me'),

    updateProfile: (data: { name?: string; email?: string }) =>
      authRequest<User>('/users/me', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    // Tenant
    getTenant: () => authRequest<Tenant>('/tenants/current'),

    updateTenant: (data: Partial<Omit<Tenant, 'id'>>) =>
      authRequest<Tenant>('/tenants/current', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    getStats: () => authRequest<DashboardStats>('/tenants/current/stats'),

    // Services
    getServices: () => authRequest<Service[]>('/services'),

    getService: (id: string) => authRequest<Service>(`/services/${id}`),

    createService: (data: CreateServiceData) =>
      authRequest<Service>('/services', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    updateService: (id: string, data: UpdateServiceData) =>
      authRequest<Service>(`/services/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    deleteService: (id: string) =>
      authRequest<void>(`/services/${id}`, { method: 'DELETE' }),

    reorderServices: (serviceIds: string[]) =>
      authRequest<Service[]>('/services/reorder', {
        method: 'POST',
        body: JSON.stringify({ serviceIds }),
      }),

    // Bookings
    getBookings: (params?: {
      date?: string;
      startDate?: string;
      endDate?: string;
      status?: string;
      page?: number;
      limit?: number;
    }) => {
      const query = params
        ? `?${new URLSearchParams(
            Object.entries(params)
              .filter(([, v]) => v !== undefined)
              .map(([k, v]) => [k, String(v)])
          ).toString()}`
        : '';
      return authRequest<PaginatedResponse<Booking>>(`/bookings${query}`);
    },

    getTodayBookings: () => authRequest<Booking[]>('/bookings/today'),

    getRecentBookings: () => authRequest<{
      id: string;
      customerName: string;
      serviceName: string;
      date: string;
      startTime: string;
      createdAt: string;
      status: string;
    }[]>('/bookings/recent'),

    getActivityFeed: () => authRequest<{
      id: string;
      type: 'booking' | 'application' | 'review' | 'proposal_response';
      title: string;
      description: string;
      createdAt: string;
      link: string;
      meta?: Record<string, unknown>;
    }[]>('/bookings/activity-feed'),

    getBooking: (id: string) => authRequest<Booking>(`/bookings/${id}`),

    updateBookingStatus: (id: string, status: Booking['status']) =>
      authRequest<Booking>(`/bookings/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),

    cancelBooking: (id: string) =>
      authRequest<Booking>(`/bookings/${id}`, { method: 'DELETE' }),

    // Customers
    getCustomers: (params?: {
      search?: string;
      page?: number;
      limit?: number;
    }) => {
      const query = params
        ? `?${new URLSearchParams(
            Object.entries(params)
              .filter(([, v]) => v !== undefined)
              .map(([k, v]) => [k, String(v)])
          ).toString()}`
        : '';
      return authRequest<PaginatedResponse<Customer>>(`/customers${query}`);
    },

    getCustomer: (id: string) => authRequest<Customer>(`/customers/${id}`),

    getCustomerHistory: (id: string) =>
      authRequest<Booking[]>(`/customers/${id}/history`),

    updateCustomer: (id: string, data: Partial<Customer>) =>
      authRequest<Customer>(`/customers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    updateCustomerExtraInfo: (id: string, section: string, data: Record<string, unknown>) =>
      authRequest<Customer>(`/customers/${id}/extra-info`, {
        method: 'PATCH',
        body: JSON.stringify({ section, data }),
      }),

    // Schedules
    getSchedules: () => authRequest<Schedule[]>('/schedules'),

    updateSchedules: (schedules: ScheduleUpdate[]) =>
      authRequest<Schedule[]>('/schedules', {
        method: 'PUT',
        body: JSON.stringify({ schedules }),
      }),

    getBlockedDates: (params?: { startDate?: string; endDate?: string }) => {
      const query = params
        ? `?${new URLSearchParams(
            Object.entries(params)
              .filter(([, v]) => v !== undefined)
              .map(([k, v]) => [k, String(v)])
          ).toString()}`
        : '';
      return authRequest<BlockedDate[]>(`/schedules/blocked${query}`);
    },

    blockDate: (date: string, reason?: string) =>
      authRequest<BlockedDate>('/schedules/blocked', {
        method: 'POST',
        body: JSON.stringify({ date, reason }),
      }),

    unblockDate: (id: string) =>
      authRequest<void>(`/schedules/blocked/${id}`, { method: 'DELETE' }),

    // Employees
    getEmployees: () => authRequest<Employee[]>('/employees'),

    getEmployee: (id: string) => authRequest<Employee>(`/employees/${id}`),

    createEmployee: (data: CreateEmployeeData) =>
      authRequest<Employee>('/employees', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    updateEmployee: (id: string, data: Partial<CreateEmployeeData>) =>
      authRequest<Employee>(`/employees/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    deleteEmployee: (id: string) =>
      authRequest<void>(`/employees/${id}`, { method: 'DELETE' }),

    reorderEmployees: (employeeIds: string[]) =>
      authRequest<Employee[]>('/employees/reorder', {
        method: 'POST',
        body: JSON.stringify({ employeeIds }),
      }),

    getEmployeeServices: (id: string) =>
      authRequest<EmployeeServiceAssignment[]>(`/employees/${id}/services`),

    updateEmployeeServices: (
      id: string,
      services: string[] | { serviceId: string; customPrice?: number; customDuration?: number }[],
    ) =>
      authRequest<EmployeeServiceAssignment[]>(`/employees/${id}/services`, {
        method: 'PUT',
        body: JSON.stringify(
          Array.isArray(services) && typeof services[0] === 'string'
            ? { serviceIds: services }
            : { services },
        ),
      }),

    getEmployeeSpecialties: (id: string) =>
      authRequest<EmployeeSpecialtyAssignment[]>(`/employees/${id}/specialties`),

    updateEmployeeSpecialties: (
      id: string,
      specialties: { specialtyId: string; seniorityLevel?: string; customRate?: number }[],
    ) =>
      authRequest<EmployeeSpecialtyAssignment[]>(`/employees/${id}/specialties`, {
        method: 'PUT',
        body: JSON.stringify({ specialties }),
      }),

    // Employee Schedules
    getEmployeeSchedules: (id: string) =>
      authRequest<EmployeeSchedule[]>(`/employees/${id}/schedules`),

    updateEmployeeSchedules: (
      id: string,
      schedules: { dayOfWeek: number; startTime: string; endTime: string; isActive: boolean }[],
    ) =>
      authRequest<EmployeeSchedule[]>(`/employees/${id}/schedules`, {
        method: 'PUT',
        body: JSON.stringify({ schedules }),
      }),

    deleteEmployeeSchedules: (id: string) =>
      authRequest<void>(`/employees/${id}/schedules`, { method: 'DELETE' }),

    getEmployeeEffectiveSchedule: (id: string) =>
      authRequest<EffectiveScheduleDay[]>(`/employees/${id}/effective-schedule`),

    // Employee Blocked Dates
    getEmployeeBlockedDates: (id: string, startDate?: string, endDate?: string) => {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      const qs = params.toString();
      return authRequest<EmployeeBlockedDate[]>(`/employees/${id}/blocked-dates${qs ? `?${qs}` : ''}`);
    },

    createEmployeeBlockedDate: (id: string, date: string, reason?: string) =>
      authRequest<EmployeeBlockedDate>(`/employees/${id}/blocked-dates`, {
        method: 'POST',
        body: JSON.stringify({ date, reason }),
      }),

    deleteEmployeeBlockedDate: (id: string, blockedDateId: string) =>
      authRequest<void>(`/employees/${id}/blocked-dates/${blockedDateId}`, { method: 'DELETE' }),

    // Specialties
    getSpecialties: (includeInactive?: boolean) =>
      authRequest<Specialty[]>(`/specialties${includeInactive ? '?includeInactive=true' : ''}`),

    getSpecialty: (id: string) => authRequest<Specialty>(`/specialties/${id}`),

    createSpecialty: (data: CreateSpecialtyData) =>
      authRequest<Specialty>('/specialties', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    updateSpecialty: (id: string, data: Partial<CreateSpecialtyData>) =>
      authRequest<Specialty>(`/specialties/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    deleteSpecialty: (id: string) =>
      authRequest<void>(`/specialties/${id}`, { method: 'DELETE' }),

    reorderSpecialties: (specialtyIds: string[]) =>
      authRequest<Specialty[]>('/specialties/reorder', {
        method: 'POST',
        body: JSON.stringify({ specialtyIds }),
      }),

    getSpecialtyEmployees: (id: string) =>
      authRequest<unknown[]>(`/specialties/${id}/employees`),

    updateSpecialtyEmployees: (
      id: string,
      employees: { employeeId: string; seniorityLevel?: string; customRate?: number }[],
    ) =>
      authRequest<unknown[]>(`/specialties/${id}/employees`, {
        method: 'PUT',
        body: JSON.stringify({ employees }),
      }),

    // Service employees
    getServiceEmployees: (id: string) =>
      authRequest<Employee[]>(`/services/${id}/employees`),

    // Intake Forms
    getIntakeForms: () =>
      authRequest<IntakeForm[]>('/intake-forms'),

    getIntakeForm: (id: string) =>
      authRequest<IntakeForm>(`/intake-forms/${id}`),

    createIntakeForm: (data: CreateIntakeFormData) =>
      authRequest<IntakeForm>('/intake-forms', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    updateIntakeForm: (id: string, data: Partial<CreateIntakeFormData>) =>
      authRequest<IntakeForm>(`/intake-forms/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    deleteIntakeForm: (id: string) =>
      authRequest<void>(`/intake-forms/${id}`, { method: 'DELETE' }),

    getIntakeFormSubmissions: (formId: string, page = 1) =>
      authRequest<{ data: IntakeSubmission[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(`/intake-forms/${formId}/submissions?page=${page}`),

    // Branches
    getBranches: () => authRequest<Branch[]>('/branches'),

    getBranch: (id: string) => authRequest<Branch>(`/branches/${id}`),

    createBranch: (data: CreateBranchData) =>
      authRequest<Branch>('/branches', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    updateBranch: (id: string, data: Partial<CreateBranchData>) =>
      authRequest<Branch>(`/branches/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    deleteBranch: (id: string) =>
      authRequest<void>(`/branches/${id}`, { method: 'DELETE' }),

    reorderBranches: (branchIds: string[]) =>
      authRequest<Branch[]>('/branches/reorder', {
        method: 'POST',
        body: JSON.stringify({ branchIds }),
      }),

    // Branch Services
    getBranchServices: (branchId: string) =>
      authRequest<BranchService[]>(`/branches/${branchId}/services`),

    assignServiceToBranch: (branchId: string, serviceId: string, priceOverride?: number) =>
      authRequest<BranchService>(`/branches/${branchId}/services`, {
        method: 'POST',
        body: JSON.stringify({ serviceId, priceOverride }),
      }),

    removeServiceFromBranch: (branchId: string, serviceId: string) =>
      authRequest<void>(`/branches/${branchId}/services/${serviceId}`, {
        method: 'DELETE',
      }),

    bulkAssignServicesToBranch: (branchId: string, serviceIds: string[]) =>
      authRequest<BranchService[]>(`/branches/${branchId}/services`, {
        method: 'PUT',
        body: JSON.stringify({ serviceIds }),
      }),

    // Branch Employees
    getBranchEmployees: (branchId: string) =>
      authRequest<BranchEmployee[]>(`/branches/${branchId}/employees`),

    assignEmployeeToBranch: (branchId: string, employeeId: string) =>
      authRequest<BranchEmployee>(`/branches/${branchId}/employees`, {
        method: 'POST',
        body: JSON.stringify({ employeeId }),
      }),

    removeEmployeeFromBranch: (branchId: string, employeeId: string) =>
      authRequest<void>(`/branches/${branchId}/employees/${employeeId}`, {
        method: 'DELETE',
      }),

    bulkAssignEmployeesToBranch: (branchId: string, employeeIds: string[]) =>
      authRequest<BranchEmployee[]>(`/branches/${branchId}/employees`, {
        method: 'PUT',
        body: JSON.stringify({ employeeIds }),
      }),

    // Branch Schedules
    getBranchSchedules: (branchId: string) =>
      authRequest<BranchSchedule[]>(`/branches/${branchId}/schedules`),

    updateBranchSchedules: (
      branchId: string,
      schedules: Array<{
        dayOfWeek: number;
        startTime: string;
        endTime: string;
        isActive: boolean;
      }>
    ) =>
      authRequest<BranchSchedule[]>(`/branches/${branchId}/schedules`, {
        method: 'PUT',
        body: JSON.stringify({ schedules }),
      }),

    // Branch Blocked Dates
    getBranchBlockedDates: (branchId: string) =>
      authRequest<BranchBlockedDate[]>(`/branches/${branchId}/blocked-dates`),

    addBranchBlockedDate: (branchId: string, date: string, reason?: string) =>
      authRequest<BranchBlockedDate>(`/branches/${branchId}/blocked-dates`, {
        method: 'POST',
        body: JSON.stringify({ date, reason }),
      }),

    removeBranchBlockedDate: (branchId: string, blockedDateId: string) =>
      authRequest<void>(`/branches/${branchId}/blocked-dates/${blockedDateId}`, {
        method: 'DELETE',
      }),

    // Products (Mercado)
    getProducts: (includeInactive?: boolean) =>
      authRequest<Product[]>(`/products${includeInactive ? '?includeInactive=true' : ''}`),

    getProduct: (id: string) => authRequest<Product>(`/products/${id}`),

    createProduct: (data: CreateProductData) =>
      authRequest<Product>('/products', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    updateProduct: (id: string, data: Partial<CreateProductData>) =>
      authRequest<Product>(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    deleteProduct: (id: string) =>
      authRequest<void>(`/products/${id}`, { method: 'DELETE' }),

    getProductStats: () => authRequest<ProductStats>('/products/stats'),

    getLowStockProducts: () => authRequest<Product[]>('/products/low-stock'),

    addProductImage: (productId: string, url: string, alt?: string) =>
      authRequest<Product>(`/products/${productId}/images`, {
        method: 'POST',
        body: JSON.stringify({ url, alt }),
      }),

    deleteProductImage: (productId: string, imageId: string) =>
      authRequest<Product>(`/products/${productId}/images/${imageId}`, {
        method: 'DELETE',
      }),

    reorderProductImages: (productId: string, imageIds: string[]) =>
      authRequest<Product>(`/products/${productId}/images/reorder`, {
        method: 'PUT',
        body: JSON.stringify({ imageIds }),
      }),

    setPrimaryProductImage: (productId: string, imageId: string) =>
      authRequest<Product>(`/products/${productId}/images/${imageId}/primary`, {
        method: 'PUT',
      }),

    createProductVariant: (productId: string, data: CreateProductVariantData) =>
      authRequest<ProductVariant>(`/products/${productId}/variants`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    updateProductVariant: (productId: string, variantId: string, data: Partial<CreateProductVariantData>) =>
      authRequest<ProductVariant>(`/products/${productId}/variants/${variantId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    deleteProductVariant: (productId: string, variantId: string) =>
      authRequest<void>(`/products/${productId}/variants/${variantId}`, {
        method: 'DELETE',
      }),

    adjustProductStock: (productId: string, adjustment: number, variantId?: string) =>
      authRequest<Product>(`/products/${productId}/stock`, {
        method: 'PUT',
        body: JSON.stringify({ adjustment, variantId }),
      }),

    // Branding (Mercado)
    getBranding: () => authRequest<TenantBranding>('/branding'),

    updateBranding: (data: Partial<TenantBranding>) =>
      authRequest<TenantBranding>('/branding', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    // Product Categories
    getProductCategories: () =>
      authRequest<ProductCategory[]>('/products/categories/all'),

    createProductCategory: (data: { name: string; description?: string; image?: string; parentId?: string }) =>
      authRequest<ProductCategory>('/products/categories', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    updateProductCategory: (id: string, data: { name?: string; description?: string; image?: string }) =>
      authRequest<ProductCategory>(`/products/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    deleteProductCategory: (id: string) =>
      authRequest<void>(`/products/categories/${id}`, { method: 'DELETE' }),

    reorderProducts: (productIds: string[]) =>
      authRequest<{ success: boolean }>('/products/reorder', {
        method: 'PUT',
        body: JSON.stringify({ productIds }),
      }),

    reorderProductCategories: (categoryIds: string[]) =>
      authRequest<ProductCategory[]>('/products/categories/reorder', {
        method: 'PUT',
        body: JSON.stringify({ categoryIds }),
      }),

    // Media
    uploadMedia: async (file: File, folder?: string): Promise<{ url: string }> => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(
        `${API_URL}/api/media/upload${folder ? `?folder=${folder}` : ''}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new ApiRequestError(
          error.message || 'Upload failed',
          response.status
        );
      }

      const data = await response.json();
      return data.data || data;
    },

    deleteMedia: (id: string) =>
      authRequest<void>(`/media/${id}`, { method: 'DELETE' }),

    // Subscriptions
    getSubscription: () => authRequest<{
      id: string;
      status: string;
      billingPeriod: string;
      trialEndAt: string | null;
      currentPeriodEnd: string | null;
      plan: {
        id: string;
        name: string;
        slug: string;
        priceMonthly: number;
        priceYearly: number | null;
        features?: string | string[];
      };
    }>('/subscriptions'),

    getSubscriptionStatus: () => authRequest<{
      isTrialing: boolean;
      isActive: boolean;
      isExpired: boolean;
      daysRemaining: number;
      status: string;
    }>('/subscriptions/status'),

    startTrial: (planSlug?: string) =>
      authRequest('/subscriptions/trial', {
        method: 'POST',
        body: JSON.stringify({ planSlug }),
      }),

    activateSubscription: (billingPeriod: 'MONTHLY' | 'YEARLY') =>
      authRequest('/subscriptions/activate', {
        method: 'POST',
        body: JSON.stringify({ billingPeriod }),
      }),

    cancelSubscription: (reason?: string) =>
      authRequest('/subscriptions/cancel', {
        method: 'PATCH',
        body: JSON.stringify({ reason }),
      }),

    // Email Verification
    sendVerificationEmail: () =>
      authRequest<{ success: boolean; message: string }>('/email-verification/send', {
        method: 'POST',
      }),

    getEmailVerificationStatus: () =>
      authRequest<{ emailVerified: boolean }>('/email-verification/status'),

    // Reviews
    getReviews: () => authRequest<{
      id: string;
      rating: number;
      comment: string | null;
      createdAt: string;
      customer: { name: string };
    }[]>('/reviews'),

    getReviewStats: () => authRequest<{
      totalBookings: number;
      bookingsThisWeek: number;
      bookingsThisMonth: number;
      averageRating: number;
      totalReviews: number;
    }>('/reviews/stats'),

    updateReviewVisibility: (id: string, isVisible: boolean) =>
      authRequest(`/reviews/${id}/visibility`, {
        method: 'PATCH',
        body: JSON.stringify({ isVisible }),
      }),

    // Talent Browse
    browseTalent: (params?: {
      search?: string;
      specialty?: string;
      availability?: string;
      openToWork?: boolean;
      category?: string;
      zone?: string;
      minExperience?: number;
      skills?: string;
      sortBy?: string;
      page?: number;
      limit?: number;
    }) => {
      const query = params
        ? `?${new URLSearchParams(
            Object.entries(params)
              .filter(([, v]) => v !== undefined)
              .map(([k, v]) => [k, String(v)])
          ).toString()}`
        : '';
      return authRequest<PaginatedResponse<TalentProfile>>(`/professional-profiles/browse${query}`);
    },

    getTalentProfile: (id: string) =>
      authRequest<TalentProfile>(`/professional-profiles/browse/${id}`),

    sendProposal: (profileId: string, data: { role: string; message: string; availability?: string }) =>
      authRequest<TalentProposal>(`/professional-profiles/browse/${profileId}/proposal`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    getProposalsSent: () =>
      authRequest<TalentProposal[]>(`/professional-profiles/proposals/sent`),

    // My Professional Profile (PROFESSIONAL users)
    getMyProfile: () =>
      authRequest<TalentProfile | null>(`/professional-profiles/my-profile`),

    createMyProfile: (data: MyProfileData) =>
      authRequest<TalentProfile>(`/professional-profiles/my-profile`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    updateMyProfile: (data: MyProfileData) =>
      authRequest<TalentProfile>(`/professional-profiles/my-profile`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    addMyExperience: (data: ExperienceData) =>
      authRequest<{ id: string }>(`/professional-profiles/my-profile/experience`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    updateMyExperience: (id: string, data: ExperienceData) =>
      authRequest(`/professional-profiles/my-profile/experience/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    deleteMyExperience: (id: string) =>
      authRequest(`/professional-profiles/my-profile/experience/${id}`, {
        method: 'DELETE',
      }),

    getMyProposals: () =>
      authRequest<TalentProposal[]>(`/professional-profiles/my-profile/proposals`),

    respondToMyProposal: (proposalId: string, data: { status: string; responseMessage?: string }) =>
      authRequest<TalentProposal>(`/professional-profiles/my-profile/proposals/${proposalId}/respond`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    // Job Postings - Business
    createJobPosting: (data: CreateJobPostingData) =>
      authRequest<JobPosting>('/job-postings', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    getMyJobPostings: () =>
      authRequest<JobPosting[]>('/job-postings/my-postings'),

    getMyJobPosting: (id: string) =>
      authRequest<JobPosting>(`/job-postings/my-postings/${id}`),

    updateJobPosting: (id: string, data: Partial<CreateJobPostingData> & { status?: string }) =>
      authRequest<JobPosting>(`/job-postings/my-postings/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    deleteJobPosting: (id: string) =>
      authRequest<JobPosting>(`/job-postings/my-postings/${id}`, {
        method: 'DELETE',
      }),

    getJobApplications: (postingId: string) =>
      authRequest<JobApplication[]>(`/job-postings/my-postings/${postingId}/applications`),

    respondToJobApplication: (postingId: string, appId: string, data: { status: string; responseMessage?: string }) =>
      authRequest<JobApplication>(`/job-postings/my-postings/${postingId}/applications/${appId}/respond`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    markJobApplicationViewed: (postingId: string, appId: string) =>
      authRequest<JobApplication>(`/job-postings/my-postings/${postingId}/applications/${appId}/viewed`, {
        method: 'POST',
      }),

    // Job Postings - Professional
    browseJobPostings: (params?: Record<string, string>) => {
      const query = params ? `?${new URLSearchParams(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== '').map(([k, v]) => [k, String(v)])
      ).toString()}` : '';
      return authRequest<{ data: JobPosting[]; total: number; page: number; totalPages: number }>(`/job-postings/browse${query}`);
    },

    getJobPostingDetail: (id: string) =>
      authRequest<JobPosting>(`/job-postings/browse/${id}`),

    applyToJobPosting: (postingId: string, data: { message: string; availability?: string }) =>
      authRequest<JobApplication>(`/job-postings/browse/${postingId}/apply`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    getMyJobApplications: () =>
      authRequest<JobApplication[]>('/job-postings/my-applications'),

    withdrawJobApplication: (appId: string) =>
      authRequest<JobApplication>(`/job-postings/my-applications/${appId}/withdraw`, {
        method: 'POST',
      }),

    // Reports
    getReportOverview: () =>
      authRequest<ReportOverview>('/reports/overview'),

    getBookingsByStatus: () =>
      authRequest<BookingsByStatus[]>('/reports/bookings-by-status'),

    getBookingsByDay: () =>
      authRequest<BookingsByDay[]>('/reports/bookings-by-day'),

    getTopServices: () =>
      authRequest<TopService[]>('/reports/top-services'),

    getTopCustomers: () =>
      authRequest<TopCustomer[]>('/reports/top-customers'),

    // Order-based reports (mercado/ecommerce)
    getOrderReportOverview: () =>
      authRequest<OrderReportOverview>('/reports/orders/overview'),

    getOrdersByStatus: () =>
      authRequest<OrdersByStatus[]>('/reports/orders/by-status'),

    getOrdersByDay: () =>
      authRequest<BookingsByDay[]>('/reports/orders/by-day'),

    getTopProducts: () =>
      authRequest<TopProduct[]>('/reports/orders/top-products'),

    getTopOrderCustomers: () =>
      authRequest<TopOrderCustomer[]>('/reports/orders/top-customers'),

    // Order advanced reports
    getOrderRevenue: (params?: ReportParams) => {
      const query = params ? `?${new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])).toString()}` : '';
      return authRequest<RevenueReport>(`/reports/orders/revenue${query}`);
    },

    getOrderTrends: (params?: ReportParams) => {
      const query = params ? `?${new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])).toString()}` : '';
      return authRequest<OrderTrend[]>(`/reports/orders/trends${query}`);
    },

    getOrderPeakHours: (params?: ReportParams) => {
      const query = params ? `?${new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])).toString()}` : '';
      return authRequest<PeakHoursReport>(`/reports/orders/peak-hours${query}`);
    },

    getOrderCancellationTrends: (params?: ReportParams) => {
      const query = params ? `?${new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])).toString()}` : '';
      return authRequest<OrderCancellationTrend[]>(`/reports/orders/cancellation-trends${query}`);
    },

    getOrderCustomerRetention: (params?: ReportParams) => {
      const query = params ? `?${new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])).toString()}` : '';
      return authRequest<CustomerRetention[]>(`/reports/orders/customer-retention${query}`);
    },

    getProductPerformance: (params?: ReportParams) => {
      const query = params ? `?${new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])).toString()}` : '';
      return authRequest<ProductPerformance[]>(`/reports/orders/product-performance${query}`);
    },

    getRevenue: (params?: ReportParams) => {
      const query = params ? `?${new URLSearchParams(
        Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
      ).toString()}` : '';
      return authRequest<RevenueReport>(`/reports/revenue${query}`);
    },

    getBookingTrends: (params?: ReportParams) => {
      const query = params ? `?${new URLSearchParams(
        Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
      ).toString()}` : '';
      return authRequest<BookingTrend[]>(`/reports/booking-trends${query}`);
    },

    getPeakHours: (params?: ReportParams) => {
      const query = params ? `?${new URLSearchParams(
        Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
      ).toString()}` : '';
      return authRequest<PeakHoursReport>(`/reports/peak-hours${query}`);
    },

    getCancellationTrends: (params?: ReportParams) => {
      const query = params ? `?${new URLSearchParams(
        Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
      ).toString()}` : '';
      return authRequest<CancellationTrend[]>(`/reports/cancellation-trends${query}`);
    },

    getCustomerRetention: (params?: ReportParams) => {
      const query = params ? `?${new URLSearchParams(
        Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
      ).toString()}` : '';
      return authRequest<CustomerRetention[]>(`/reports/customer-retention${query}`);
    },

    getEmployeePerformance: (params?: ReportParams) => {
      const query = params ? `?${new URLSearchParams(
        Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
      ).toString()}` : '';
      return authRequest<EmployeePerformance[]>(`/reports/employee-performance${query}`);
    },

    getServicePerformance: (params?: ReportParams) => {
      const query = params ? `?${new URLSearchParams(
        Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
      ).toString()}` : '';
      return authRequest<ServicePerformance[]>(`/reports/service-performance${query}`);
    },

    getBranchComparison: (params?: ReportParams) => {
      const query = params ? `?${new URLSearchParams(
        Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
      ).toString()}` : '';
      return authRequest<BranchComparison[]>(`/reports/branch-comparison${query}`);
    },

    exportReportsCsv: (params?: ReportParams) => {
      const query = params ? `?${new URLSearchParams(
        Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
      ).toString()}` : '';
      return authRequest<string>(`/reports/export/csv${query}`);
    },

    // Finance
    getFinanceSummary: (month?: number, year?: number) => {
      const params = new URLSearchParams();
      if (month) params.append('month', String(month));
      if (year) params.append('year', String(year));
      const query = params.toString();
      return authRequest<any>(`/finance/summary${query ? `?${query}` : ''}`);
    },
    getFinanceComparison: (months?: number) =>
      authRequest<any>(`/finance/comparison${months ? `?months=${months}` : ''}`),
    getFinanceCategories: () =>
      authRequest<{ value: string; label: string }[]>('/finance/categories'),
    getExpenses: (month?: number, year?: number) => {
      const params = new URLSearchParams();
      if (month) params.append('month', String(month));
      if (year) params.append('year', String(year));
      const query = params.toString();
      return authRequest<any[]>(`/finance/expenses${query ? `?${query}` : ''}`);
    },
    createExpense: (data: {
      category: string;
      description?: string;
      amount: number;
      isRecurring?: boolean;
      recurringDay?: number;
      date?: string;
      month?: number;
      year?: number;
    }) =>
      authRequest<any>('/finance/expenses', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateExpense: (id: string, data: Record<string, any>) =>
      authRequest<any>(`/finance/expenses/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    deleteExpense: (id: string) =>
      authRequest<any>(`/finance/expenses/${id}`, {
        method: 'DELETE',
      }),
    getFinanceSummaryByRange: (startDate: string, endDate: string) =>
      authRequest<any>(`/finance/summary-range?startDate=${startDate}&endDate=${endDate}`),
    copyRecurringExpenses: (month: number, year: number) =>
      authRequest<{ created: number }>('/finance/expenses/copy-recurring', {
        method: 'POST',
        body: JSON.stringify({ month, year }),
      }),

    // Finance - Income
    getIncomeCategories: () =>
      authRequest<{ value: string; label: string }[]>('/finance/income-categories'),
    getIncomes: (month?: number, year?: number) => {
      const params = new URLSearchParams();
      if (month) params.append('month', String(month));
      if (year) params.append('year', String(year));
      const query = params.toString();
      return authRequest<any[]>(`/finance/incomes${query ? `?${query}` : ''}`);
    },
    createIncome: (data: {
      category: string;
      description?: string;
      amount: number;
      isRecurring?: boolean;
      recurringDay?: number;
      date?: string;
      month?: number;
      year?: number;
    }) =>
      authRequest<any>('/finance/incomes', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateIncome: (id: string, data: Record<string, any>) =>
      authRequest<any>(`/finance/incomes/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    deleteIncome: (id: string) =>
      authRequest<any>(`/finance/incomes/${id}`, {
        method: 'DELETE',
      }),

    // Projections
    getFinanceProjection: (months?: number) =>
      authRequest<any>(`/finance/projection${months ? `?months=${months}` : ''}`),

    // Budgets
    getBudgets: (month: number, year: number) =>
      authRequest<any[]>(`/finance/budgets?month=${month}&year=${year}`),
    setBudget: (data: { category: string; amount: number; month: number; year: number }) =>
      authRequest<any>('/finance/budgets', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    deleteBudget: (id: string) =>
      authRequest<any>(`/finance/budgets/${id}`, { method: 'DELETE' }),
    getBudgetVsActual: (month: number, year: number) =>
      authRequest<any[]>(`/finance/budget-vs-actual?month=${month}&year=${year}`),

    // Revenue Goals
    getRevenueGoal: (month: number, year: number) =>
      authRequest<any>(`/finance/goals?month=${month}&year=${year}`),
    setRevenueGoal: (data: { amount: number; month: number; year: number }) =>
      authRequest<any>('/finance/goals', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    deleteRevenueGoal: (id: string) =>
      authRequest<any>(`/finance/goals/${id}`, { method: 'DELETE' }),
    getGoalProgress: (month: number, year: number) =>
      authRequest<any>(`/finance/goal-progress?month=${month}&year=${year}`),

    // Expense Alerts
    getExpenseAlerts: () =>
      authRequest<any[]>('/finance/alerts'),
    setExpenseAlert: (data: { category: string; threshold: number; isActive?: boolean }) =>
      authRequest<any>('/finance/alerts', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    deleteExpenseAlert: (id: string) =>
      authRequest<any>(`/finance/alerts/${id}`, { method: 'DELETE' }),
    checkAlerts: (month: number, year: number) =>
      authRequest<any[]>(`/finance/alerts-check?month=${month}&year=${year}`),

    // Autogestion - Create booking directly from dashboard
    createBooking: (data: CreateBookingData) =>
      authRequest<Booking>('/bookings', {
        method: 'POST',
        body: JSON.stringify(data),
        retries: 0,
      }),

    getAvailability: (date: string, serviceId?: string) => {
      const params = new URLSearchParams({ date });
      if (serviceId) params.append('serviceId', serviceId);
      return authRequest<TimeSlot[]>(`/bookings/availability?${params}`);
    },

    // ─── Employee Portal ───

    employeePortal: {
      getFeatures: () => authRequest<{ hasPortal: boolean; hasAdvanced: boolean; maxPortalEmployees: number | null; features: string[] }>('/employee-portal/features'),

      getProfile: () => authRequest<Employee>('/employee-portal/me'),

      updateProfile: (data: { name?: string; phone?: string; bio?: string; image?: string; credentials?: string }) =>
        authRequest<Employee>('/employee-portal/me', { method: 'PATCH', body: JSON.stringify(data) }),

      getAgenda: (params?: { from?: string; to?: string; status?: string }) => {
        const query = params ? `?${new URLSearchParams(
          Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
        ).toString()}` : '';
        return authRequest<Booking[]>(`/employee-portal/agenda${query}`);
      },

      getAgendaStats: () =>
        authRequest<{ today: number; week: number; month: number; completedRate: number; nextBooking: { id: string; date: string; startTime: string; service: { name: string }; customer: { name: string } } | null }>('/employee-portal/agenda/stats'),

      getAvailability: () =>
        authRequest<Array<{ id: string; dayOfWeek: number; startTime: string; endTime: string; isActive: boolean }>>('/employee-portal/availability'),

      updateAvailability: (schedules: Array<{ dayOfWeek: number; startTime: string; endTime: string; isActive: boolean }>) =>
        authRequest<unknown>('/employee-portal/availability', { method: 'PUT', body: JSON.stringify({ schedules }) }),

      getBlockedDates: (params?: { from?: string; to?: string }) => {
        const query = params ? `?${new URLSearchParams(
          Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
        ).toString()}` : '';
        return authRequest<Array<{ id: string; date: string; reason: string | null }>>(`/employee-portal/blocked-dates${query}`);
      },

      createBlockedDate: (data: { date: string; reason?: string }) =>
        authRequest<{ id: string; date: string; reason: string | null }>('/employee-portal/blocked-dates', { method: 'POST', body: JSON.stringify(data) }),

      deleteBlockedDate: (id: string) =>
        authRequest<void>(`/employee-portal/blocked-dates/${id}`, { method: 'DELETE' }),

      getClients: () =>
        authRequest<Array<{ id: string; name: string; phone: string | null; createdAt: string; _count: { bookings: number } }>>('/employee-portal/clients'),

      getClient: (id: string) =>
        authRequest<{ id: string; name: string; phone: string | null; createdAt: string; bookings: Booking[] }>(`/employee-portal/clients/${id}`),

      getActivity: (limit?: number) =>
        authRequest<Array<{ id: string; action: string; entity: string; entityId: string | null; metadata: unknown; createdAt: string }>>(`/employee-portal/activity${limit ? `?limit=${limit}` : ''}`),

      getTeam: () =>
        authRequest<Array<{ id: string; name: string; email: string | null; phone: string | null; image: string | null; employeeRole: string; isActive: boolean; userId: string | null; user: { lastLoginAt: string | null } | null; createdAt: string }>>('/employee-portal/team'),

      inviteEmployee: (data: { employeeId: string; email: string; role: string }) =>
        authRequest<{ id: string; token: string }>('/employee-portal/invitations', { method: 'POST', body: JSON.stringify(data) }),

      getPendingInvitations: () =>
        authRequest<Array<{ id: string; email: string; role: string; expiresAt: string; employee: { id: string; name: string } }>>('/employee-portal/invitations'),

      changeRole: (employeeId: string, role: string) =>
        authRequest<Employee>(`/employee-portal/team/${employeeId}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }),

      revokeAccess: (employeeId: string) =>
        authRequest<{ message: string }>(`/employee-portal/team/${employeeId}/access`, { method: 'DELETE' }),

      getAuditLog: (params?: { employeeId?: string; action?: string; from?: string; to?: string; page?: number; limit?: number }) => {
        const query = params ? `?${new URLSearchParams(
          Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
        ).toString()}` : '';
        return authRequest<{ data: Array<{ id: string; action: string; entity: string; entityId: string | null; metadata: unknown; createdAt: string; employee: { id: string; name: string } | null; user: { id: string; name: string; email: string } | null }>; meta: { total: number; page: number; limit: number; totalPages: number } }>(`/employee-portal/audit-log${query}`);
      },
    },

    // Orders (Pedidos)
    getOrders: async (status?: string, page = 1, limit = 20, date?: string): Promise<{ data: Order[]; total: number; page: number; totalPages: number }> => {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      if (date) params.set('date', date);
      params.set('page', String(page));
      params.set('limit', String(limit));
      const res = await authRequest<{ data: Order[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>(`/orders?${params.toString()}`);
      return { data: res.data, total: res.pagination.total, page: res.pagination.page, totalPages: res.pagination.totalPages };
    },

    getOrder: (id: string): Promise<Order> => authRequest(`/orders/${id}`),

    getOrderStats: (): Promise<OrderStats> => authRequest('/orders/stats'),

    updateOrderStatus: (id: string, status: string, note?: string): Promise<Order> =>
      authRequest(`/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, note }),
      }),

    assignDeliveryEmployee: (orderId: string, deliveryEmployeeId: string | null): Promise<Order> =>
      authRequest(`/orders/${orderId}/assign-delivery`, {
        method: 'PUT',
        body: JSON.stringify({ deliveryEmployeeId }),
      }),

    getDeliveryStaff: (): Promise<DeliveryStaffMember[]> =>
      authRequest('/employees/delivery-staff'),

    createPosOrder: (data: {
      items: { productId: string; variantId?: string; quantity: number }[];
      customerName: string;
      customerPhone: string;
      customerEmail?: string;
      paymentMethod: 'efectivo' | 'transferencia' | 'mercadopago';
      notes?: string;
    }): Promise<any> =>
      authRequest('/orders', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    // Quotes (Presupuestos)
    getQuotes: async (status?: string, page = 1, limit = 20): Promise<{ data: Quote[]; pagination: { total: number; page: number; totalPages: number } }> => {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      params.set('page', String(page));
      params.set('limit', String(limit));
      return authRequest(`/quotes?${params.toString()}`);
    },

    getQuote: (id: string): Promise<Quote> => authRequest(`/quotes/${id}`),

    getQuoteStats: (): Promise<QuoteStats> => authRequest('/quotes/stats'),

    createQuote: (data: CreateQuoteData): Promise<Quote> =>
      authRequest('/quotes', { method: 'POST', body: JSON.stringify(data) }),

    updateQuote: (id: string, data: CreateQuoteData): Promise<Quote> =>
      authRequest(`/quotes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    updateQuoteStatus: (id: string, status: string): Promise<Quote> =>
      authRequest(`/quotes/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),

    deleteQuote: (id: string): Promise<{ success: boolean }> =>
      authRequest(`/quotes/${id}`, { method: 'DELETE' }),

    // Loyalty Program
    getLoyaltyProgram: () => authRequest<any>('/loyalty/program'),
    createLoyaltyProgram: () => authRequest<any>('/loyalty/program', { method: 'POST' }),
    updateLoyaltyProgram: (data: any) => authRequest<any>('/loyalty/program', { method: 'PUT', body: JSON.stringify(data) }),
    getLoyaltyMetrics: () => authRequest<any>('/loyalty/metrics'),
    getLoyaltyBalances: (params?: { page?: number; limit?: number; search?: string }) => {
      const query = params ? `?${new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])).toString()}` : '';
      return authRequest<any>(`/loyalty/balances${query}`);
    },
    getLoyaltyBalance: (customerId: string) => authRequest<any>(`/loyalty/balances/${customerId}`),
    getLoyaltyTransactions: (params?: { page?: number; limit?: number; type?: string }) => {
      const query = params ? `?${new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])).toString()}` : '';
      return authRequest<any>(`/loyalty/transactions${query}`);
    },
    adjustLoyaltyPoints: (data: { customerId: string; points: number; description: string }) =>
      authRequest<any>('/loyalty/adjust', { method: 'POST', body: JSON.stringify(data) }),

    // Loyalty Tiers
    getLoyaltyTiers: () => authRequest<any[]>('/loyalty/tiers'),
    createLoyaltyTier: (data: any) => authRequest<any>('/loyalty/tiers', { method: 'POST', body: JSON.stringify(data) }),
    updateLoyaltyTier: (id: string, data: any) => authRequest<any>(`/loyalty/tiers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteLoyaltyTier: (id: string) => authRequest<any>(`/loyalty/tiers/${id}`, { method: 'DELETE' }),

    // Loyalty Rewards
    getLoyaltyRewards: () => authRequest<any[]>('/loyalty/rewards'),
    createLoyaltyReward: (data: any) => authRequest<any>('/loyalty/rewards', { method: 'POST', body: JSON.stringify(data) }),
    updateLoyaltyReward: (id: string, data: any) => authRequest<any>(`/loyalty/rewards/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteLoyaltyReward: (id: string) => authRequest<any>(`/loyalty/rewards/${id}`, { method: 'DELETE' }),
    getLoyaltyRedemptions: (params?: { page?: number; limit?: number }) => {
      const query = params ? `?${new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])).toString()}` : '';
      return authRequest<any>(`/loyalty/redemptions${query}`);
    },

    // Sorteos
    getSorteos: () => authRequest<any[]>('/loyalty/sorteos'),
    createSorteo: (data: any) => authRequest<any>('/loyalty/sorteos', { method: 'POST', body: JSON.stringify(data) }),
    getSorteo: (id: string) => authRequest<any>(`/loyalty/sorteos/${id}`),
    updateSorteo: (id: string, data: any) => authRequest<any>(`/loyalty/sorteos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteSorteo: (id: string) => authRequest<any>(`/loyalty/sorteos/${id}`, { method: 'DELETE' }),
    activateSorteo: (id: string) => authRequest<any>(`/loyalty/sorteos/${id}/activate`, { method: 'PUT' }),
    getSorteoParticipants: (id: string) => authRequest<any[]>(`/loyalty/sorteos/${id}/participants`),
    drawSorteo: (id: string) => authRequest<any>(`/loyalty/sorteos/${id}/draw`, { method: 'POST' }),

    // Generic request method for custom endpoints
    get: <T>(endpoint: string) => authRequest<T>(endpoint),

    post: <T>(endpoint: string, data?: unknown) =>
      authRequest<T>(endpoint, {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      }),

    patch: <T>(endpoint: string, data?: unknown) =>
      authRequest<T>(endpoint, {
        method: 'PATCH',
        body: data ? JSON.stringify(data) : undefined,
      }),

    delete: <T>(endpoint: string) =>
      authRequest<T>(endpoint, { method: 'DELETE' }),

    // Gastro Salon
    getGastroTables: (): Promise<{ tables: any[]; tableCount: number; stats?: any; employees?: any[]; waiterAssignment?: string; tableAssignments?: Record<string, string> }> =>
      authRequest('/gastro/dashboard/tables'),

    enableGastroPayment: (sessionId: string) =>
      authRequest(`/gastro/session/${sessionId}/enable-payment`, { method: 'PATCH' }),

    updateGastroSessionStatus: (sessionId: string, status: string) =>
      authRequest(`/gastro/session/${sessionId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),

    addGastroItem: (sessionId: string, items: any[]) =>
      authRequest(`/gastro/session/${sessionId}/add-item`, {
        method: 'POST',
        body: JSON.stringify({ items }),
      }),

    closeGastroTable: (tableNumber: number) =>
      authRequest(`/gastro/dashboard/close-table/${tableNumber}`, { method: 'POST' }),

    markGastroOrderDelivered: (sessionId: string, orderId: string) =>
      authRequest(`/gastro/session/${sessionId}/order/${orderId}/deliver`, { method: 'PATCH' }),

    updateGastroOrderStatus: (sessionId: string, orderId: string, status: string) =>
      authRequest(`/gastro/session/${sessionId}/order/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),

    getGastroQrData: (): Promise<{ slug: string; tableCount: number; tables: { tableNumber: number; url: string }[] }> =>
      authRequest('/gastro/dashboard/qr-codes'),

    getGastroReviews: (): Promise<any[]> =>
      authRequest('/gastro/dashboard/reviews'),

    getGastroTips: (period: string = 'today'): Promise<any> =>
      authRequest(`/gastro/dashboard/tips?period=${period}`),

    assignWaiter: (sessionId: string, waiterId: string): Promise<any> =>
      authRequest(`/gastro/session/${sessionId}/assign-waiter`, {
        method: 'PATCH',
        body: JSON.stringify({ waiterId }),
      }),

    // Kitchen / Comandas
    getKitchenStations: (): Promise<any[]> =>
      authRequest('/gastro/kitchen/stations'),

    createKitchenStation: (data: { name: string; displayName: string; printerId?: string; printerName?: string }): Promise<any> =>
      authRequest('/gastro/kitchen/stations', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    updateKitchenStation: (stationId: string, data: any): Promise<any> =>
      authRequest(`/gastro/kitchen/stations/${stationId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),

    deleteKitchenStation: (stationId: string): Promise<any> =>
      authRequest(`/gastro/kitchen/stations/${stationId}/delete`, { method: 'POST' }),

    getKitchenProductMap: (): Promise<any[]> =>
      authRequest('/gastro/kitchen/product-map'),

    bulkAssignKitchenProducts: (data: { assignments: { productId: string; kitchenStationId: string | null }[] }): Promise<any> =>
      authRequest('/gastro/kitchen/product-map', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    getKitchenComandas: (stationId?: string): Promise<any[]> =>
      authRequest(`/gastro/kitchen/comandas${stationId ? `?stationId=${stationId}` : ''}`),

    updateComandaStatus: (comandaId: string, status: string): Promise<any> =>
      authRequest(`/gastro/kitchen/comandas/${comandaId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),

    reprintComanda: (comandaId: string): Promise<any> =>
      authRequest(`/gastro/kitchen/comandas/${comandaId}/reprint`, { method: 'POST' }),

    getKitchenStats: (): Promise<any> =>
      authRequest('/gastro/kitchen/stats'),

    generateKitchenAgentToken: (): Promise<{ token: string }> =>
      authRequest('/gastro/kitchen/generate-token', { method: 'POST' }),

    // =====================================================================
    // Rentals (Alquileres)
    // =====================================================================

    // Stats
    getRentalStats: (): Promise<any> => authRequest('/rentals/stats'),
    getUpcomingAdjustments: (): Promise<any[]> => authRequest('/rentals/adjustments/upcoming'),

    // Property Owners
    getPropertyOwners: (): Promise<any[]> => authRequest('/rentals/owners'),
    getPropertyOwner: (id: string): Promise<any> => authRequest(`/rentals/owners/${id}`),
    createPropertyOwner: (data: any): Promise<any> => authRequest('/rentals/owners', { method: 'POST', body: JSON.stringify(data) }),
    updatePropertyOwner: (id: string, data: any): Promise<any> => authRequest(`/rentals/owners/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deletePropertyOwner: (id: string): Promise<void> => authRequest(`/rentals/owners/${id}`, { method: 'DELETE' }),

    // Rental Properties
    getRentalProperties: (params?: { ownerId?: string; status?: string }): Promise<any[]> => {
      const qs = new URLSearchParams();
      if (params?.ownerId) qs.set('ownerId', params.ownerId);
      if (params?.status) qs.set('status', params.status);
      const q = qs.toString();
      return authRequest(`/rentals/properties${q ? `?${q}` : ''}`);
    },
    getRentalProperty: (id: string): Promise<any> => authRequest(`/rentals/properties/${id}`),
    createRentalProperty: (data: any): Promise<any> => authRequest('/rentals/properties', { method: 'POST', body: JSON.stringify(data) }),
    updateRentalProperty: (id: string, data: any): Promise<any> => authRequest(`/rentals/properties/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteRentalProperty: (id: string): Promise<void> => authRequest(`/rentals/properties/${id}`, { method: 'DELETE' }),

    // Rental Tenants (Inquilinos)
    getRentalTenants: (): Promise<any[]> => authRequest('/rentals/tenants'),
    getRentalTenant: (id: string): Promise<any> => authRequest(`/rentals/tenants/${id}`),
    createRentalTenant: (data: any): Promise<any> => authRequest('/rentals/tenants', { method: 'POST', body: JSON.stringify(data) }),
    updateRentalTenant: (id: string, data: any): Promise<any> => authRequest(`/rentals/tenants/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteRentalTenant: (id: string): Promise<void> => authRequest(`/rentals/tenants/${id}`, { method: 'DELETE' }),

    // Rental Contracts
    getRentalContracts: (params?: { status?: string; propertyId?: string }): Promise<any[]> => {
      const qs = new URLSearchParams();
      if (params?.status) qs.set('status', params.status);
      if (params?.propertyId) qs.set('propertyId', params.propertyId);
      const q = qs.toString();
      return authRequest(`/rentals/contracts${q ? `?${q}` : ''}`);
    },
    getRentalContract: (id: string): Promise<any> => authRequest(`/rentals/contracts/${id}`),
    createRentalContract: (data: any): Promise<any> => authRequest('/rentals/contracts', { method: 'POST', body: JSON.stringify(data) }),
    updateRentalContract: (id: string, data: any): Promise<any> => authRequest(`/rentals/contracts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    terminateRentalContract: (id: string): Promise<any> => authRequest(`/rentals/contracts/${id}/terminate`, { method: 'POST' }),

    // Rental Payments
    getRentalPaymentDashboard: (year?: number, month?: number): Promise<any> => {
      const qs = new URLSearchParams();
      if (year) qs.set('year', String(year));
      if (month) qs.set('month', String(month));
      const q = qs.toString();
      return authRequest(`/rentals/payments/dashboard${q ? `?${q}` : ''}`);
    },
    getRentalContractPayments: (contractId: string): Promise<any[]> => authRequest(`/rentals/contracts/${contractId}/payments`),
    createRentalPayment: (data: any): Promise<any> => authRequest('/rentals/payments', { method: 'POST', body: JSON.stringify(data) }),
    markRentalPayment: (id: string, data: any): Promise<any> => authRequest(`/rentals/payments/${id}/mark`, { method: 'POST', body: JSON.stringify(data) }),

    // Contract Adjustments
    getRentalContractAdjustments: (contractId: string): Promise<any[]> => authRequest(`/rentals/contracts/${contractId}/adjustments`),
    createRentalAdjustment: (data: any): Promise<any> => authRequest('/rentals/adjustments', { method: 'POST', body: JSON.stringify(data) }),

    // Property Expenses
    getRentalExpenses: (params?: { propertyId?: string; contractId?: string }): Promise<any[]> => {
      const qs = new URLSearchParams();
      if (params?.propertyId) qs.set('propertyId', params.propertyId);
      if (params?.contractId) qs.set('contractId', params.contractId);
      const q = qs.toString();
      return authRequest(`/rentals/expenses${q ? `?${q}` : ''}`);
    },
    createRentalExpense: (data: any): Promise<any> => authRequest('/rentals/expenses', { method: 'POST', body: JSON.stringify(data) }),
    updateRentalExpense: (id: string, data: any): Promise<any> => authRequest(`/rentals/expenses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteRentalExpense: (id: string): Promise<void> => authRequest(`/rentals/expenses/${id}`, { method: 'DELETE' }),

    // Owner Liquidations
    getOwnerLiquidations: (ownerId: string): Promise<any[]> => authRequest(`/rentals/liquidations/owner/${ownerId}`),
    getLiquidation: (id: string): Promise<any> => authRequest(`/rentals/liquidations/${id}`),
    generateLiquidation: (data: any): Promise<any> => authRequest('/rentals/liquidations', { method: 'POST', body: JSON.stringify(data) }),
    markLiquidationPaid: (id: string, data?: any): Promise<any> => authRequest(`/rentals/liquidations/${id}/paid`, { method: 'POST', body: JSON.stringify(data || {}) }),

    // =====================================================================
    // Development Projects (Desarrollos / Pozo)
    // =====================================================================

    getDevelopmentProjects: (): Promise<any[]> => authRequest('/developments/projects'),
    getDevelopmentProject: (id: string): Promise<any> => authRequest(`/developments/projects/${id}`),
    createDevelopmentProject: (data: any): Promise<any> => authRequest('/developments/projects', { method: 'POST', body: JSON.stringify(data) }),
    updateDevelopmentProject: (id: string, data: any): Promise<any> => authRequest(`/developments/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteDevelopmentProject: (id: string): Promise<void> => authRequest(`/developments/projects/${id}`, { method: 'DELETE' }),

    // Milestones
    createMilestone: (projectId: string, data: any): Promise<any> => authRequest(`/developments/projects/${projectId}/milestones`, { method: 'POST', body: JSON.stringify(data) }),
    updateMilestone: (projectId: string, milestoneId: string, data: any): Promise<any> => authRequest(`/developments/projects/${projectId}/milestones/${milestoneId}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteMilestone: (projectId: string, milestoneId: string): Promise<void> => authRequest(`/developments/projects/${projectId}/milestones/${milestoneId}`, { method: 'DELETE' }),

    // Units
    createProjectUnit: (projectId: string, data: any): Promise<any> => authRequest(`/developments/projects/${projectId}/units`, { method: 'POST', body: JSON.stringify(data) }),
    updateProjectUnit: (projectId: string, unitId: string, data: any): Promise<any> => authRequest(`/developments/projects/${projectId}/units/${unitId}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteProjectUnit: (projectId: string, unitId: string): Promise<void> => authRequest(`/developments/projects/${projectId}/units/${unitId}`, { method: 'DELETE' }),

    // Investments
    createInvestment: (projectId: string, data: any): Promise<any> => authRequest(`/developments/projects/${projectId}/investments`, { method: 'POST', body: JSON.stringify(data) }),
    markInvestmentPayment: (projectId: string, paymentId: string, data: any): Promise<any> => authRequest(`/developments/projects/${projectId}/investments/payments/${paymentId}/mark`, { method: 'POST', body: JSON.stringify(data) }),

    // Reservations
    reserveUnit: (projectId: string, unitId: string, data: any): Promise<any> => authRequest(`/developments/projects/${projectId}/units/${unitId}/reserve`, { method: 'POST', body: JSON.stringify(data) }),
    cancelReservation: (projectId: string, unitId: string): Promise<any> => authRequest(`/developments/projects/${projectId}/units/${unitId}/reserve`, { method: 'DELETE' }),

    // Payment Plans
    getPaymentPlans: (projectId: string): Promise<any[]> => authRequest(`/developments/projects/${projectId}/payment-plans`),
    createPaymentPlan: (projectId: string, data: any): Promise<any> => authRequest(`/developments/projects/${projectId}/payment-plans`, { method: 'POST', body: JSON.stringify(data) }),
    updatePaymentPlan: (projectId: string, planId: string, data: any): Promise<any> => authRequest(`/developments/projects/${projectId}/payment-plans/${planId}`, { method: 'PUT', body: JSON.stringify(data) }),
    deletePaymentPlan: (projectId: string, planId: string): Promise<void> => authRequest(`/developments/projects/${projectId}/payment-plans/${planId}`, { method: 'DELETE' }),

    // Documents
    getDocuments: (projectId: string, unitId?: string, investmentId?: string): Promise<any[]> => {
      const params = new URLSearchParams();
      if (unitId) params.set('unitId', unitId);
      if (investmentId) params.set('investmentId', investmentId);
      const qs = params.toString();
      return authRequest(`/developments/projects/${projectId}/documents${qs ? `?${qs}` : ''}`);
    },
    createDocument: (projectId: string, data: any): Promise<any> => authRequest(`/developments/projects/${projectId}/documents`, { method: 'POST', body: JSON.stringify(data) }),
    deleteDocument: (projectId: string, documentId: string): Promise<void> => authRequest(`/developments/projects/${projectId}/documents/${documentId}`, { method: 'DELETE' }),

    // =====================================================================
    // CRM Leads
    // =====================================================================

    getLeadStats: (): Promise<any> => authRequest('/leads/stats'),
    getLeads: (params?: { stage?: string; source?: string; assignedTo?: string }): Promise<any[]> => {
      const qp = new URLSearchParams();
      if (params?.stage) qp.set('stage', params.stage);
      if (params?.source) qp.set('source', params.source);
      if (params?.assignedTo) qp.set('assignedTo', params.assignedTo);
      const qs = qp.toString();
      return authRequest(`/leads${qs ? `?${qs}` : ''}`);
    },
    getLead: (id: string): Promise<any> => authRequest(`/leads/${id}`),
    createLead: (data: any): Promise<any> => authRequest('/leads', { method: 'POST', body: JSON.stringify(data) }),
    updateLead: (id: string, data: any): Promise<any> => authRequest(`/leads/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteLead: (id: string): Promise<void> => authRequest(`/leads/${id}`, { method: 'DELETE' }),

    // =====================================================================
    // Property Deposits / Señas
    // =====================================================================

    getDeposits: (status?: string): Promise<any[]> => {
      const qs = status ? `?status=${status}` : '';
      return authRequest(`/leads/deposits/all${qs}`);
    },
    getDeposit: (id: string): Promise<any> => authRequest(`/leads/deposits/${id}`),
    createDeposit: (data: any): Promise<any> => authRequest('/leads/deposits', { method: 'POST', body: JSON.stringify(data) }),
    updateDeposit: (id: string, data: any): Promise<any> => authRequest(`/leads/deposits/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteDeposit: (id: string): Promise<void> => authRequest(`/leads/deposits/${id}`, { method: 'DELETE' }),

    // =====================================================================
    // Guarantee Records
    // =====================================================================

    getGuarantees: (status?: string): Promise<any[]> => {
      const qs = status ? `?status=${status}` : '';
      return authRequest(`/leads/guarantees/all${qs}`);
    },
    getGuaranteesByContract: (contractId: string): Promise<any[]> => authRequest(`/leads/guarantees/contract/${contractId}`),
    getExpiringGuarantees: (days?: number): Promise<any[]> => authRequest(`/leads/guarantees/expiring${days ? `?days=${days}` : ''}`),
    createGuarantee: (data: any): Promise<any> => authRequest('/leads/guarantees', { method: 'POST', body: JSON.stringify(data) }),
    updateGuarantee: (id: string, data: any): Promise<any> => authRequest(`/leads/guarantees/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteGuarantee: (id: string): Promise<void> => authRequest(`/leads/guarantees/${id}`, { method: 'DELETE' }),

    // =====================================================================
    // Document Templates
    // =====================================================================

    getDocumentTemplates: (category?: string): Promise<any[]> => {
      const qs = category ? `?category=${category}` : '';
      return authRequest(`/documents/templates${qs}`);
    },
    getDocumentTemplate: (id: string): Promise<any> => authRequest(`/documents/templates/${id}`),
    createDocumentTemplate: (data: any): Promise<any> => authRequest('/documents/templates', { method: 'POST', body: JSON.stringify(data) }),
    updateDocumentTemplate: (id: string, data: any): Promise<any> => authRequest(`/documents/templates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteDocumentTemplate: (id: string): Promise<void> => authRequest(`/documents/templates/${id}`, { method: 'DELETE' }),
    renderDocument: (templateId: string, data: any): Promise<{ html: string }> => authRequest(`/documents/templates/${templateId}/render`, { method: 'POST', body: JSON.stringify(data) }),
    getTemplateVariables: (category: string): Promise<any[]> => authRequest(`/documents/variables/${category}`),
  };
}

// Type for the API client
export type ApiClient = ReturnType<typeof createApiClient>;

// =============================================================================
// Utility Functions
// =============================================================================

export function isApiError(error: unknown): error is ApiRequestError {
  return error instanceof ApiRequestError;
}

export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}
