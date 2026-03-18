'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CreditCard, Phone, Building2 } from 'lucide-react';
import { usePayment } from '@/hooks/use-payments';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MilestoneProgress } from '@/components/payments/milestone-progress';
import { PageLoader } from '@/components/ui/spinner';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';

const PROVIDER_LABELS: Record<string, string> = {
  MTN: 'MTN Mobile Money',
  ORANGE: 'Orange Money',
  MOOV: 'Moov Money',
};

export default function PaymentDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { isClient } = useAuth();

  const { data: payment, isLoading, isError } = usePayment(params.id);

  if (isLoading) return <PageLoader />;
  if (isError || !payment) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Paiement introuvable.</p>
        <Button className="mt-4" variant="outline" onClick={() => router.back()}>
          Retour
        </Button>
      </div>
    );
  }

  const remainingAmount = payment.escrowAmount - payment.releasedAmount;
  const milestones = payment.milestones ?? [];

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Détail du paiement</h1>
          {payment.project && (
            <p className="text-gray-500 text-sm mt-0.5">
              Projet:{' '}
              <Link
                href={`/dashboard/projects/${payment.projectId}`}
                className="text-primary-600 hover:underline"
              >
                {payment.project.title}
              </Link>
            </p>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="py-5 text-center">
            <p className="text-xs text-gray-500 mb-1">Montant total</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(payment.escrowAmount)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-5 text-center">
            <p className="text-xs text-gray-500 mb-1">Libéré</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(payment.releasedAmount)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-5 text-center">
            <p className="text-xs text-gray-500 mb-1">Restant</p>
            <p className="text-xl font-bold text-orange-600">{formatCurrency(remainingAmount)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary-500" />
              Informations du paiement
            </CardTitle>
            <Badge status={payment.status} />
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Référence</p>
            <p className="font-medium text-gray-900 font-mono text-xs">{payment.id}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Date de création</p>
            <p className="font-medium text-gray-900">{formatDate(payment.createdAt)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Opérateur Mobile Money</p>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-400" />
              <p className="font-medium text-gray-900">
                {PROVIDER_LABELS[payment.mobileMoneyProv] ?? payment.mobileMoneyProv}
              </p>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Numéro Mobile Money</p>
            <p className="font-medium text-gray-900">{payment.mobileMoneyPhone}</p>
          </div>
          {payment.mobileMoneyRef && (
            <div className="col-span-2">
              <p className="text-xs text-gray-500 mb-0.5">Référence Mobile Money</p>
              <p className="font-medium text-gray-900 font-mono text-xs">{payment.mobileMoneyRef}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Milestones */}
      <Card>
        <CardHeader>
          <CardTitle>Jalons de paiement ({milestones.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {milestones.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              Aucun jalon défini pour ce paiement.
            </p>
          ) : (
            <MilestoneProgress payment={payment} canApprove={isClient} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
