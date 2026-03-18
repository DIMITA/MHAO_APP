import {
  Role,
  KycStatus,
  ProjectStatus,
  QuoteStatus,
  PaymentStatus,
  MilestoneStatus,
  MobileMoneyProvider,
  NotificationType,
} from '../constants';

// ─── User Interface ───────────────────────────────────────────────────────────

export interface IUser {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: Role;
  kycStatus: KycStatus;
  isActive: boolean;
  fcmToken?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Provider Profile Interface ───────────────────────────────────────────────

export interface IProviderProfile {
  id: string;
  userId: string;
  companyName?: string | null;
  description?: string | null;
  skills: string[];
  zonesServed: string[];
  isVerified: boolean;
  ratingAvg: number;
  ratingCount: number;
  kycDocType?: string | null;
  kycDocRef?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Project Interface ────────────────────────────────────────────────────────

export interface IProject {
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
  createdAt: Date;
  updatedAt: Date;
}

// ─── Quote Interface ──────────────────────────────────────────────────────────

export interface IQuote {
  id: string;
  projectId: string;
  providerId: string;
  profileId: string;
  amount: number;
  description: string;
  timelineDays: number;
  status: QuoteStatus;
  files: string[];
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Milestone Interface ──────────────────────────────────────────────────────

export interface IMilestone {
  id: string;
  paymentId: string;
  title: string;
  description?: string | null;
  amount: number;
  order: number;
  status: MilestoneStatus;
  approvedAt?: Date | null;
  paidAt?: Date | null;
  createdAt: Date;
}

// ─── Payment Interface ────────────────────────────────────────────────────────

export interface IPayment {
  id: string;
  projectId: string;
  quoteId: string;
  escrowAmount: number;
  releasedAmount: number;
  mobileMoneyRef?: string | null;
  mobileMoneyPhone: string;
  mobileMoneyProv: MobileMoneyProvider;
  status: PaymentStatus;
  callbackData?: Record<string, unknown> | null;
  milestones: IMilestone[];
  createdAt: Date;
  updatedAt: Date;
}

// ─── Review Interface ─────────────────────────────────────────────────────────

export interface IReview {
  id: string;
  projectId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment?: string | null;
  isVisible: boolean;
  createdAt: Date;
}

// ─── Notification Interface ───────────────────────────────────────────────────

export interface INotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  payload?: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: Date;
}

// ─── OTP Code Interface ───────────────────────────────────────────────────────

export interface IOtpCode {
  id: string;
  userId: string;
  phone: string;
  code: string;
  purpose: 'verification' | 'payment' | 'sensitive';
  isUsed: boolean;
  expiresAt: Date;
  createdAt: Date;
}

// ─── JWT Payload Interface ────────────────────────────────────────────────────

export interface IJwtPayload {
  sub: string;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}

// ─── Generic Service Response Interface ──────────────────────────────────────

export interface IServiceResponse<T = unknown> {
  data: T | null;
  message: string;
  success: boolean;
  statusCode: number;
}

// ─── Paginated Response Interface ────────────────────────────────────────────

export interface IPaginatedResponse<T = unknown> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── File Upload Interface ────────────────────────────────────────────────────

export interface IFileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export interface IUploadedFile {
  url: string;
  key: string;
  bucket: string;
  mimetype: string;
  size: number;
}
