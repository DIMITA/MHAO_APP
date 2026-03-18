// ─── Enums ────────────────────────────────────────────────────────────────────

export enum Role {
  CLIENT = 'CLIENT',
  PROVIDER = 'PROVIDER',
  ADMIN = 'ADMIN',
}

export enum KycStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

export enum ProjectStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  DISPUTED = 'DISPUTED',
}

export enum QuoteStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  IN_ESCROW = 'IN_ESCROW',
  PARTIALLY_RELEASED = 'PARTIALLY_RELEASED',
  RELEASED = 'RELEASED',
  REFUNDED = 'REFUNDED',
  FAILED = 'FAILED',
}

export enum MilestoneStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  PAID = 'PAID',
}

export enum MobileMoneyProvider {
  MTN = 'MTN',
  ORANGE = 'ORANGE',
  MOOV = 'MOOV',
}

// ─── Models ───────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: Role;
  kycStatus: KycStatus;
  isActive: boolean;
  fcmToken?: string;
  createdAt: string;
  updatedAt: string;
  profile?: ProviderProfile;
}

export interface ProviderProfile {
  id: string;
  userId: string;
  companyName?: string;
  description?: string;
  skills: string[];
  zonesServed: string[];
  isVerified: boolean;
  ratingAvg: number;
  ratingCount: number;
  kycDocType?: string;
  createdAt: string;
  updatedAt: string;
  user?: Pick<User, 'id' | 'firstName' | 'lastName' | 'email' | 'phone'>;
}

export interface Project {
  id: string;
  clientId: string;
  title: string;
  description: string;
  category: string;
  budgetMin: number;
  budgetMax: number;
  lat: number;
  lng: number;
  address: string;
  city: string;
  country: string;
  status: ProjectStatus;
  photos: string[];
  createdAt: string;
  updatedAt: string;
  client?: Pick<User, 'id' | 'firstName' | 'lastName'>;
  quotes?: Quote[];
  payment?: Payment;
  _count?: { quotes: number };
}

export interface Quote {
  id: string;
  projectId: string;
  providerId: string;
  profileId: string;
  amount: number;
  description: string;
  timelineDays: number;
  status: QuoteStatus;
  files: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  project?: Pick<Project, 'id' | 'title' | 'status'>;
  provider?: Pick<User, 'id' | 'firstName' | 'lastName'>;
  profile?: Pick<ProviderProfile, 'id' | 'companyName' | 'ratingAvg' | 'isVerified'>;
}

export interface Payment {
  id: string;
  projectId: string;
  quoteId: string;
  escrowAmount: number;
  releasedAmount: number;
  mobileMoneyRef?: string;
  mobileMoneyPhone: string;
  mobileMoneyProv: MobileMoneyProvider;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  milestones?: Milestone[];
  project?: Pick<Project, 'id' | 'title'>;
}

export interface Milestone {
  id: string;
  paymentId: string;
  title: string;
  description?: string;
  amount: number;
  order: number;
  status: MilestoneStatus;
  approvedAt?: string;
  paidAt?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  projectId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment?: string;
  isVisible: boolean;
  createdAt: string;
  reviewer?: Pick<User, 'id' | 'firstName' | 'lastName'>;
  reviewee?: Pick<User, 'id' | 'firstName' | 'lastName'>;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  payload?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

// ─── API Response Types ────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
  statusCode?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

export interface RegisterResponse {
  user: User;
  message: string;
}

// ─── Form Types ───────────────────────────────────────────────────────────────

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: Role;
}

export interface CreateProjectFormData {
  title: string;
  description: string;
  category: string;
  budgetMin: number;
  budgetMax: number;
  address: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
}

export interface CreateQuoteFormData {
  amount: number;
  description: string;
  timelineDays: number;
  notes?: string;
}

export interface InitiatePaymentFormData {
  mobileMoneyPhone: string;
  mobileMoneyProv: MobileMoneyProvider;
  milestones: Array<{ title: string; description?: string; amount: number; order: number }>;
}

// ─── Filter Types ─────────────────────────────────────────────────────────────

export interface ProjectFilters {
  status?: ProjectStatus;
  category?: string;
  budgetMin?: number;
  budgetMax?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ProviderFilters {
  skills?: string[];
  zones?: string[];
  search?: string;
  page?: number;
  limit?: number;
}
