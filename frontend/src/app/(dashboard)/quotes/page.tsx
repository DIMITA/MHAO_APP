'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FileText, ChevronRight } from 'lucide-react';
import { useQuotes } from '@/hooks/use-quotes';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageLoader } from '@/components/ui/spinner';
import { formatCurrency, formatRelativeDate } from '@/lib/utils';
import { QuoteStatus } from '@/types';

const statusTabs = [
  { value: '', label: 'Tous' },
  { value: QuoteStatus.PENDING, label: 'En attente' },
  { value: QuoteStatus.ACCEPTED, label: 'Acceptés' },
  { value: QuoteStatus.REJECTED, label: 'Refusés' },
];

export default function QuotesPage() {
  const { isClient, isProvider } = useAuth();
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuotes({
    status: statusFilter || undefined,
  });

  const quotes = data?.data ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {isProvider ? 'Mes devis' : 'Devis reçus'}
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          {data?.total ?? 0} devis au total
        </p>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === tab.value
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <PageLoader />
      ) : quotes.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun devis trouvé</h3>
          <p className="text-gray-500 text-sm">
            {isClient
              ? "Vous n'avez pas encore reçu de devis."
              : "Vous n'avez pas encore soumis de devis."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {quotes.map((quote) => (
            <Card key={quote.id} hover>
              <CardContent className="py-4">
                <Link href={`/dashboard/projects/${quote.projectId}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900 truncate">
                          {quote.project?.title ?? 'Projet'}
                        </p>
                        <Badge status={quote.status} />
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(quote.amount)}
                        </span>
                        <span>{quote.timelineDays} jours</span>
                        <span>{formatRelativeDate(quote.createdAt)}</span>
                      </div>

                      {quote.description && (
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                          {quote.description}
                        </p>
                      )}

                      {isClient && quote.provider && (
                        <p className="text-xs text-gray-400 mt-2">
                          Par {quote.provider.firstName} {quote.provider.lastName}
                        </p>
                      )}
                    </div>

                    <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  </div>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
