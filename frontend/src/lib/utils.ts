import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ProjectStatus, QuoteStatus, PaymentStatus, MilestoneStatus } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'XOF'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatDateShort(date: string | Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatRelativeDate(date: string | Date): string {
  const now = new Date();
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) return "À l'instant";
  if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays < 7) return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
  return formatDateShort(date);
}

// Project status helpers
export function getProjectStatusColor(status: ProjectStatus): string {
  const colors: Record<ProjectStatus, string> = {
    [ProjectStatus.OPEN]: 'bg-blue-100 text-blue-800',
    [ProjectStatus.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800',
    [ProjectStatus.COMPLETED]: 'bg-green-100 text-green-800',
    [ProjectStatus.CANCELLED]: 'bg-gray-100 text-gray-800',
    [ProjectStatus.DISPUTED]: 'bg-red-100 text-red-800',
  };
  return colors[status] ?? 'bg-gray-100 text-gray-800';
}

export function getProjectStatusLabel(status: ProjectStatus): string {
  const labels: Record<ProjectStatus, string> = {
    [ProjectStatus.OPEN]: 'Ouvert',
    [ProjectStatus.IN_PROGRESS]: 'En cours',
    [ProjectStatus.COMPLETED]: 'Terminé',
    [ProjectStatus.CANCELLED]: 'Annulé',
    [ProjectStatus.DISPUTED]: 'En litige',
  };
  return labels[status] ?? status;
}

// Quote status helpers
export function getQuoteStatusColor(status: QuoteStatus): string {
  const colors: Record<QuoteStatus, string> = {
    [QuoteStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
    [QuoteStatus.ACCEPTED]: 'bg-green-100 text-green-800',
    [QuoteStatus.REJECTED]: 'bg-red-100 text-red-800',
    [QuoteStatus.WITHDRAWN]: 'bg-gray-100 text-gray-800',
  };
  return colors[status] ?? 'bg-gray-100 text-gray-800';
}

export function getQuoteStatusLabel(status: QuoteStatus): string {
  const labels: Record<QuoteStatus, string> = {
    [QuoteStatus.PENDING]: 'En attente',
    [QuoteStatus.ACCEPTED]: 'Accepté',
    [QuoteStatus.REJECTED]: 'Refusé',
    [QuoteStatus.WITHDRAWN]: 'Retiré',
  };
  return labels[status] ?? status;
}

// Payment status helpers
export function getPaymentStatusColor(status: PaymentStatus): string {
  const colors: Record<PaymentStatus, string> = {
    [PaymentStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
    [PaymentStatus.IN_ESCROW]: 'bg-blue-100 text-blue-800',
    [PaymentStatus.PARTIALLY_RELEASED]: 'bg-orange-100 text-orange-800',
    [PaymentStatus.RELEASED]: 'bg-green-100 text-green-800',
    [PaymentStatus.REFUNDED]: 'bg-purple-100 text-purple-800',
    [PaymentStatus.FAILED]: 'bg-red-100 text-red-800',
  };
  return colors[status] ?? 'bg-gray-100 text-gray-800';
}

export function getPaymentStatusLabel(status: PaymentStatus): string {
  const labels: Record<PaymentStatus, string> = {
    [PaymentStatus.PENDING]: 'En attente',
    [PaymentStatus.IN_ESCROW]: 'En séquestre',
    [PaymentStatus.PARTIALLY_RELEASED]: 'Partiellement libéré',
    [PaymentStatus.RELEASED]: 'Libéré',
    [PaymentStatus.REFUNDED]: 'Remboursé',
    [PaymentStatus.FAILED]: 'Échoué',
  };
  return labels[status] ?? status;
}

// Milestone status helpers
export function getMilestoneStatusColor(status: MilestoneStatus): string {
  const colors: Record<MilestoneStatus, string> = {
    [MilestoneStatus.PENDING]: 'bg-gray-100 text-gray-600',
    [MilestoneStatus.APPROVED]: 'bg-blue-100 text-blue-700',
    [MilestoneStatus.PAID]: 'bg-green-100 text-green-700',
  };
  return colors[status] ?? 'bg-gray-100 text-gray-600';
}

export function getMilestoneStatusLabel(status: MilestoneStatus): string {
  const labels: Record<MilestoneStatus, string> = {
    [MilestoneStatus.PENDING]: 'En attente',
    [MilestoneStatus.APPROVED]: 'Approuvé',
    [MilestoneStatus.PAID]: 'Payé',
  };
  return labels[status] ?? status;
}

// Generic status helpers (for backward compat)
export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    OPEN: 'bg-blue-100 text-blue-800',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-gray-100 text-gray-800',
    DISPUTED: 'bg-red-100 text-red-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    ACCEPTED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    WITHDRAWN: 'bg-gray-100 text-gray-800',
    IN_ESCROW: 'bg-blue-100 text-blue-800',
    PARTIALLY_RELEASED: 'bg-orange-100 text-orange-800',
    RELEASED: 'bg-green-100 text-green-800',
    REFUNDED: 'bg-purple-100 text-purple-800',
    FAILED: 'bg-red-100 text-red-800',
    VERIFIED: 'bg-green-100 text-green-800',
    APPROVED: 'bg-blue-100 text-blue-700',
    PAID: 'bg-green-100 text-green-700',
  };
  return map[status] ?? 'bg-gray-100 text-gray-800';
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    OPEN: 'Ouvert',
    IN_PROGRESS: 'En cours',
    COMPLETED: 'Terminé',
    CANCELLED: 'Annulé',
    DISPUTED: 'En litige',
    PENDING: 'En attente',
    ACCEPTED: 'Accepté',
    REJECTED: 'Refusé',
    WITHDRAWN: 'Retiré',
    IN_ESCROW: 'En séquestre',
    PARTIALLY_RELEASED: 'Partiellement libéré',
    RELEASED: 'Libéré',
    REFUNDED: 'Remboursé',
    FAILED: 'Échoué',
    VERIFIED: 'Vérifié',
    APPROVED: 'Approuvé',
    PAID: 'Payé',
  };
  return map[status] ?? status;
}

export function truncate(str: string, length = 100): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '…';
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}
