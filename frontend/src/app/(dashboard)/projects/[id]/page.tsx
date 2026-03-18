'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import {
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Plus,
  Star,
} from 'lucide-react';
import { useProject } from '@/hooks/use-projects';
import { useProjectQuotes, useAcceptQuote, useRejectQuote } from '@/hooks/use-quotes';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageLoader } from '@/components/ui/spinner';
import { QuoteForm } from '@/components/quotes/quote-form';
import { MilestoneProgress } from '@/components/payments/milestone-progress';
import {
  formatCurrency,
  formatDate,
  truncate,
  getInitials,
} from '@/lib/utils';
import Link from 'next/link';
import { QuoteStatus } from '@/types';

const ProjectMapStatic = dynamic(
  () => import('@/components/map/project-map').then((m) => m.ProjectMapStatic),
  { ssr: false, loading: () => <div className="h-48 bg-gray-100 rounded-xl animate-pulse" /> },
);

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { isClient, isProvider, user } = useAuth();
  const [quoteFormOpen, setQuoteFormOpen] = useState(false);

  const { data: project, isLoading, isError } = useProject(params.id);
  const { data: quotes = [] } = useProjectQuotes(params.id);
  const { mutate: acceptQuote, isPending: isAccepting } = useAcceptQuote();
  const { mutate: rejectQuote, isPending: isRejecting } = useRejectQuote();

  if (isLoading) return <PageLoader />;
  if (isError || !project) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Projet introuvable.</p>
        <Button className="mt-4" variant="outline" asChild>
          <Link href="/dashboard/projects">Retour aux projets</Link>
        </Button>
      </div>
    );
  }

  const hasAlreadyQuoted = quotes.some((q) => q.providerId === user?.id);
  const acceptedQuote = quotes.find((q) => q.status === QuoteStatus.ACCEPTED);

  return (
    <div className="max-w-5xl space-y-6">
      {/* Back button + title */}
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">{project.title}</h1>
            <Badge status={project.status} />
          </div>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {project.address}, {project.city}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {formatDate(project.createdAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <DollarSign className="h-4 w-4" />
              {formatCurrency(project.budgetMin)} – {formatCurrency(project.budgetMax)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Photos */}
          {project.photos.length > 0 && (
            <Card>
              <CardContent className="py-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {project.photos.map((photo, i) => (
                    <div key={i} className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photo} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description du projet</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                {project.description}
              </p>
            </CardContent>
          </Card>

          {/* Map */}
          <Card>
            <CardHeader>
              <CardTitle>Localisation</CardTitle>
            </CardHeader>
            <CardContent>
              <ProjectMapStatic lat={project.lat} lng={project.lng} className="h-56" />
            </CardContent>
          </Card>

          {/* Milestones (if payment exists) */}
          {project.payment && (
            <Card>
              <CardHeader>
                <CardTitle>Avancement du projet</CardTitle>
              </CardHeader>
              <CardContent>
                <MilestoneProgress payment={project.payment} canApprove={isClient} />
              </CardContent>
            </Card>
          )}

          {/* Quotes */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {isClient ? `Devis reçus (${quotes.length})` : 'Devis soumis'}
                </CardTitle>
                {isProvider && !hasAlreadyQuoted && (
                  <Button size="sm" onClick={() => setQuoteFormOpen(true)}>
                    <Plus className="h-4 w-4" />
                    Soumettre un devis
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {quotes.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">
                    {isClient ? 'Aucun devis reçu pour l\'instant.' : 'Vous n\'avez pas encore soumis de devis.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {quotes.map((quote) => (
                    <div
                      key={quote.id}
                      className="rounded-xl border border-gray-200 p-5 hover:border-primary-200 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm flex-shrink-0">
                            {quote.provider
                              ? getInitials(quote.provider.firstName, quote.provider.lastName)
                              : 'P'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {quote.provider
                                ? `${quote.provider.firstName} ${quote.provider.lastName}`
                                : 'Prestataire'}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {quote.profile?.isVerified && (
                                <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 rounded-full px-2 py-0.5">
                                  <CheckCircle className="h-3 w-3" />
                                  Vérifié
                                </span>
                              )}
                              {quote.profile?.ratingAvg ? (
                                <span className="flex items-center gap-1 text-xs text-amber-600">
                                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                  {quote.profile.ratingAvg.toFixed(1)}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                        <Badge status={quote.status} />
                      </div>

                      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">Montant proposé</p>
                          <p className="font-semibold text-gray-900">{formatCurrency(quote.amount)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">Délai</p>
                          <p className="font-semibold text-gray-900">{quote.timelineDays} jours</p>
                        </div>
                      </div>

                      <p className="mt-3 text-sm text-gray-600 line-clamp-3">
                        {quote.description}
                      </p>

                      {/* Client actions */}
                      {isClient && quote.status === QuoteStatus.PENDING && (
                        <div className="mt-4 flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => acceptQuote({ quoteId: quote.id, projectId: project.id })}
                            isLoading={isAccepting}
                          >
                            <CheckCircle className="h-4 w-4" />
                            Accepter
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => rejectQuote({ quoteId: quote.id, projectId: project.id })}
                            isLoading={isRejecting}
                          >
                            <XCircle className="h-4 w-4" />
                            Refuser
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Project info card */}
          <Card>
            <CardHeader>
              <CardTitle>Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Catégorie</p>
                <p className="font-medium text-gray-900 capitalize">{project.category}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Budget</p>
                <p className="font-medium text-gray-900">
                  {formatCurrency(project.budgetMin)} – {formatCurrency(project.budgetMax)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Localisation</p>
                <p className="font-medium text-gray-900">{project.city}, {project.country}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Devis reçus</p>
                <p className="font-medium text-gray-900">{quotes.length}</p>
              </div>
              {project.client && (
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Client</p>
                  <p className="font-medium text-gray-900">
                    {project.client.firstName} {project.client.lastName}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Provider action card */}
          {isProvider && !hasAlreadyQuoted && (
            <Card className="border-primary-200 bg-primary-50">
              <CardContent className="py-5 text-center">
                <p className="text-sm font-medium text-primary-800 mb-3">
                  Intéressé par ce projet?
                </p>
                <Button className="w-full" onClick={() => setQuoteFormOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Soumettre mon devis
                </Button>
              </CardContent>
            </Card>
          )}

          {hasAlreadyQuoted && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="py-4 text-center">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-green-800">Devis déjà soumis</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Quote form modal */}
      {isProvider && (
        <QuoteForm
          project={project}
          open={quoteFormOpen}
          onClose={() => setQuoteFormOpen(false)}
        />
      )}
    </div>
  );
}
