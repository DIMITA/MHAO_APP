// ─── Microservice Message Patterns ───────────────────────────────────────────

export const MICROSERVICE_PATTERNS = {
  AUTH: {
    REGISTER: 'auth.register',
    LOGIN: 'auth.login',
    VALIDATE_TOKEN: 'auth.validate_token',
    REFRESH_TOKEN: 'auth.refresh_token',
    LOGOUT: 'auth.logout',
    SEND_OTP: 'auth.send_otp',
    VERIFY_OTP: 'auth.verify_otp',
  },
  PROJECTS: {
    CREATE: 'projects.create',
    FIND_ALL: 'projects.find_all',
    FIND_ONE: 'projects.find_one',
    UPDATE: 'projects.update',
    DELETE: 'projects.delete',
    MY_PROJECTS: 'projects.my_projects',
  },
  QUOTES: {
    CREATE: 'quotes.create',
    FIND_ONE: 'quotes.find_one',
    FIND_BY_PROJECT: 'quotes.find_by_project',
    ACCEPT: 'quotes.accept',
    REJECT: 'quotes.reject',
    MY_QUOTES: 'quotes.my_quotes',
  },
  PAYMENTS: {
    INITIATE: 'payments.initiate',
    CALLBACK: 'payments.callback',
    RELEASE_MILESTONE: 'payments.release_milestone',
    GET_STATUS: 'payments.get_status',
  },
  REVIEWS: {
    CREATE: 'reviews.create',
    FIND_BY_PROVIDER: 'reviews.find_by_provider',
  },
  NOTIFICATIONS: {
    SEND: 'notifications.send',
    MARK_READ: 'notifications.mark_read',
    GET_USER_NOTIFICATIONS: 'notifications.get_user_notifications',
  },
  ADMIN: {
    GET_PENDING_PROVIDERS: 'admin.get_pending_providers',
    VERIFY_PROVIDER: 'admin.verify_provider',
    GET_DISPUTES: 'admin.get_disputes',
    RESOLVE_DISPUTE: 'admin.resolve_dispute',
    GET_STATS: 'admin.get_stats',
  },
  FILES: {
    UPLOAD: 'files.upload',
    DELETE: 'files.delete',
    GET_URL: 'files.get_url',
  },
} as const;

// ─── Role Constants ───────────────────────────────────────────────────────────

export const ROLES = {
  CLIENT: 'CLIENT',
  PROVIDER: 'PROVIDER',
  ADMIN: 'ADMIN',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

// ─── KYC Status Constants ─────────────────────────────────────────────────────

export const KYC_STATUS = {
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
} as const;

export type KycStatus = (typeof KYC_STATUS)[keyof typeof KYC_STATUS];

// ─── Project Status Constants ─────────────────────────────────────────────────

export const PROJECT_STATUS = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  DISPUTED: 'DISPUTED',
} as const;

export type ProjectStatus = (typeof PROJECT_STATUS)[keyof typeof PROJECT_STATUS];

// ─── Quote Status Constants ───────────────────────────────────────────────────

export const QUOTE_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  WITHDRAWN: 'WITHDRAWN',
} as const;

export type QuoteStatus = (typeof QUOTE_STATUS)[keyof typeof QUOTE_STATUS];

// ─── Payment Status Constants ─────────────────────────────────────────────────

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  IN_ESCROW: 'IN_ESCROW',
  PARTIALLY_RELEASED: 'PARTIALLY_RELEASED',
  RELEASED: 'RELEASED',
  REFUNDED: 'REFUNDED',
  FAILED: 'FAILED',
} as const;

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

// ─── Milestone Status Constants ───────────────────────────────────────────────

export const MILESTONE_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  PAID: 'PAID',
} as const;

export type MilestoneStatus = (typeof MILESTONE_STATUS)[keyof typeof MILESTONE_STATUS];

// ─── Notification Type Constants ──────────────────────────────────────────────

export const NOTIFICATION_TYPES = {
  // Auth & Account
  OTP_SENT: 'OTP_SENT',
  ACCOUNT_VERIFIED: 'ACCOUNT_VERIFIED',
  KYC_APPROVED: 'KYC_APPROVED',
  KYC_REJECTED: 'KYC_REJECTED',

  // Projects
  PROJECT_CREATED: 'PROJECT_CREATED',
  PROJECT_UPDATED: 'PROJECT_UPDATED',
  PROJECT_COMPLETED: 'PROJECT_COMPLETED',
  PROJECT_CANCELLED: 'PROJECT_CANCELLED',
  PROJECT_DISPUTED: 'PROJECT_DISPUTED',

  // Quotes
  QUOTE_RECEIVED: 'QUOTE_RECEIVED',
  QUOTE_ACCEPTED: 'QUOTE_ACCEPTED',
  QUOTE_REJECTED: 'QUOTE_REJECTED',

  // Payments
  PAYMENT_INITIATED: 'PAYMENT_INITIATED',
  PAYMENT_RECEIVED: 'PAYMENT_RECEIVED',
  MILESTONE_RELEASED: 'MILESTONE_RELEASED',
  PAYMENT_REFUNDED: 'PAYMENT_REFUNDED',

  // Reviews
  REVIEW_RECEIVED: 'REVIEW_RECEIVED',

  // Admin
  PROVIDER_VERIFIED: 'PROVIDER_VERIFIED',
  DISPUTE_RESOLVED: 'DISPUTE_RESOLVED',
} as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

// ─── Mobile Money Provider Constants ─────────────────────────────────────────

export const MOBILE_MONEY_PROVIDERS = {
  MTN: 'MTN',
  ORANGE: 'ORANGE',
  MOOV: 'MOOV',
} as const;

export type MobileMoneyProvider =
  (typeof MOBILE_MONEY_PROVIDERS)[keyof typeof MOBILE_MONEY_PROVIDERS];

// ─── Pagination Defaults ──────────────────────────────────────────────────────

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// ─── Geography Constants ──────────────────────────────────────────────────────

export const GEO = {
  DEFAULT_CITY: 'Cotonou',
  DEFAULT_COUNTRY: 'Benin',
  DEFAULT_RADIUS_KM: 25,
  // West Africa bounding box (approx)
  BOUNDS: {
    MIN_LAT: 4.0,
    MAX_LAT: 15.0,
    MIN_LNG: -18.0,
    MAX_LNG: 16.0,
  },
} as const;
