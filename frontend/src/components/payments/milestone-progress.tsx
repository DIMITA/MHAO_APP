'use client';

import { CheckCircle, Clock, DollarSign } from 'lucide-react';
import { Payment, Milestone, MilestoneStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { useReleaseMilestone } from '@/hooks/use-payments';
import { formatCurrency, getMilestoneStatusLabel, getMilestoneStatusColor } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface MilestoneProgressProps {
  payment: Payment;
  canApprove?: boolean;
}

export function MilestoneProgress({ payment, canApprove }: MilestoneProgressProps) {
  const { mutate: releaseMilestone, isPending } = useReleaseMilestone();

  const milestones = payment.milestones ?? [];
  const paidCount = milestones.filter((m) => m.status === MilestoneStatus.PAID).length;
  const progressPercent = milestones.length > 0 ? (paidCount / milestones.length) * 100 : 0;

  const releasedPct =
    payment.escrowAmount > 0
      ? Math.round((payment.releasedAmount / payment.escrowAmount) * 100)
      : 0;

  return (
    <div className="space-y-4">
      {/* Overview */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="rounded-lg bg-gray-50 p-3">
          <p className="text-xs text-gray-500 mb-0.5">Total séquestre</p>
          <p className="font-bold text-gray-900 text-sm">{formatCurrency(payment.escrowAmount)}</p>
        </div>
        <div className="rounded-lg bg-green-50 p-3">
          <p className="text-xs text-gray-500 mb-0.5">Libéré</p>
          <p className="font-bold text-green-700 text-sm">{formatCurrency(payment.releasedAmount)}</p>
        </div>
        <div className="rounded-lg bg-orange-50 p-3">
          <p className="text-xs text-gray-500 mb-0.5">Restant</p>
          <p className="font-bold text-orange-700 text-sm">
            {formatCurrency(payment.escrowAmount - payment.releasedAmount)}
          </p>
        </div>
      </div>

      {/* Overall progress bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
          <span>Progression globale</span>
          <span>{releasedPct}%</span>
        </div>
        <div className="h-2.5 w-full bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-500 rounded-full transition-all duration-500"
            style={{ width: `${releasedPct}%` }}
          />
        </div>
      </div>

      {/* Milestones list */}
      {milestones.length > 0 && (
        <div className="space-y-3 mt-2">
          {milestones
            .sort((a, b) => a.order - b.order)
            .map((milestone, index) => (
              <MilestoneItem
                key={milestone.id}
                milestone={milestone}
                index={index}
                paymentId={payment.id}
                canApprove={canApprove}
                isLoading={isPending}
                onApprove={(milestoneId) =>
                  releaseMilestone({ paymentId: payment.id, milestoneId })
                }
              />
            ))}
        </div>
      )}
    </div>
  );
}

interface MilestoneItemProps {
  milestone: Milestone;
  index: number;
  paymentId: string;
  canApprove?: boolean;
  isLoading?: boolean;
  onApprove: (milestoneId: string) => void;
}

function MilestoneItem({
  milestone,
  index,
  canApprove,
  isLoading,
  onApprove,
}: MilestoneItemProps) {
  const isPaid = milestone.status === MilestoneStatus.PAID;
  const isApproved = milestone.status === MilestoneStatus.APPROVED;
  const isPending = milestone.status === MilestoneStatus.PENDING;

  return (
    <div
      className={cn(
        'flex items-start gap-4 p-4 rounded-xl border transition-colors',
        isPaid
          ? 'border-green-200 bg-green-50'
          : isApproved
          ? 'border-blue-200 bg-blue-50'
          : 'border-gray-200 bg-white',
      )}
    >
      {/* Step indicator */}
      <div
        className={cn(
          'flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold',
          isPaid
            ? 'bg-green-500 text-white'
            : isApproved
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-500',
        )}
      >
        {isPaid ? <CheckCircle className="h-4.5 w-4.5" /> : index + 1}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <p className="font-medium text-gray-900 text-sm">{milestone.title}</p>
            {milestone.description && (
              <p className="text-xs text-gray-500 mt-0.5">{milestone.description}</p>
            )}
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-semibold text-gray-900 text-sm">{formatCurrency(milestone.amount)}</p>
            <span className={cn('inline-flex text-xs rounded-full px-2 py-0.5 mt-1', getMilestoneStatusColor(milestone.status))}>
              {getMilestoneStatusLabel(milestone.status)}
            </span>
          </div>
        </div>

        {/* Approve button for client */}
        {canApprove && isPending && (
          <div className="mt-3">
            <Button
              size="sm"
              onClick={() => onApprove(milestone.id)}
              isLoading={isLoading}
            >
              <CheckCircle className="h-4 w-4" />
              Approuver et libérer le paiement
            </Button>
          </div>
        )}

        {isApproved && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-blue-600">
            <Clock className="h-3.5 w-3.5" />
            Paiement en cours de traitement
          </div>
        )}

        {isPaid && milestone.paidAt && (
          <p className="mt-1 text-xs text-green-600">
            Payé le {new Intl.DateTimeFormat('fr-FR').format(new Date(milestone.paidAt))}
          </p>
        )}
      </div>
    </div>
  );
}
