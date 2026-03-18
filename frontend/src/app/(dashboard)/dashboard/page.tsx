'use client';

import { useAuth } from '@/hooks/use-auth';
import { useProjects } from '@/hooks/use-projects';
import { useQuotes } from '@/hooks/use-quotes';
import { Role, ProjectStatus, QuoteStatus } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  FolderOpen,
  FileText,
  CreditCard,
  TrendingUp,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { formatCurrency, formatRelativeDate, truncate } from '@/lib/utils';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, isClient, isProvider, fullName } = useAuth();
  const { data: projectsData } = useProjects({ limit: 5 });
  const { data: quotesData } = useQuotes({ limit: 5 });

  const projects = projectsData?.data ?? [];
  const quotes = quotesData?.data ?? [];

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';

  // Computed stats
  const openProjects = projects.filter((p) => p.status === ProjectStatus.OPEN).length;
  const inProgressProjects = projects.filter((p) => p.status === ProjectStatus.IN_PROGRESS).length;
  const pendingQuotes = quotes.filter((q) => q.status === QuoteStatus.PENDING).length;
  const acceptedQuotes = quotes.filter((q) => q.status === QuoteStatus.ACCEPTED).length;

  const clientStats = [
    {
      label: 'Mes projets',
      value: projectsData?.total ?? 0,
      subLabel: `${openProjects} ouvert${openProjects !== 1 ? 's' : ''}`,
      icon: FolderOpen,
      color: 'bg-blue-50 text-blue-600',
      href: '/dashboard/projects',
    },
    {
      label: 'Devis reçus',
      value: quotesData?.total ?? 0,
      subLabel: `${pendingQuotes} en attente`,
      icon: FileText,
      color: 'bg-orange-50 text-orange-600',
      href: '/dashboard/quotes',
    },
    {
      label: 'Projets en cours',
      value: inProgressProjects,
      subLabel: 'Chantiers actifs',
      icon: CreditCard,
      color: 'bg-green-50 text-green-600',
      href: '/dashboard/projects',
    },
  ];

  const providerStats = [
    {
      label: 'Devis soumis',
      value: quotesData?.total ?? 0,
      subLabel: `${pendingQuotes} en attente`,
      icon: FileText,
      color: 'bg-orange-50 text-orange-600',
      href: '/dashboard/quotes',
    },
    {
      label: 'Devis acceptés',
      value: acceptedQuotes,
      subLabel: 'Ce mois-ci',
      icon: CheckCircle2,
      color: 'bg-green-50 text-green-600',
      href: '/dashboard/quotes',
    },
    {
      label: 'Projets disponibles',
      value: projectsData?.total ?? 0,
      subLabel: `${openProjects} ouvert${openProjects !== 1 ? 's' : ''}`,
      icon: TrendingUp,
      color: 'bg-blue-50 text-blue-600',
      href: '/dashboard/projects',
    },
  ];

  const stats = isProvider ? providerStats : clientStats;

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {greeting}, {user?.firstName}! 👋
        </h1>
        <p className="text-gray-500 mt-1">
          {isClient
            ? "Voici un aperçu de vos projets et activités."
            : isProvider
            ? "Voici un aperçu de vos devis et opportunités."
            : "Tableau de bord administrateur."}
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href}>
              <Card hover className="h-full">
                <CardContent className="py-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                      <p className="text-xs text-gray-400 mt-1">{stat.subLabel}</p>
                    </div>
                    <div className={`p-3 rounded-xl ${stat.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent projects */}
        <Card>
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">
              {isProvider ? 'Projets récents' : 'Mes projets récents'}
            </h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/projects">
                Voir tout
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <CardContent className="py-4">
            {projects.length === 0 ? (
              <div className="text-center py-8">
                <FolderOpen className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Aucun projet pour l'instant</p>
                {isClient && (
                  <Button size="sm" className="mt-4" asChild>
                    <Link href="/dashboard/projects/new">Créer un projet</Link>
                  </Button>
                )}
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {projects.slice(0, 4).map((project) => (
                  <li key={project.id}>
                    <Link
                      href={`/dashboard/projects/${project.id}`}
                      className="flex items-center justify-between py-3 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{project.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {project.city} · {formatRelativeDate(project.createdAt)}
                        </p>
                      </div>
                      <Badge status={project.status} className="ml-3 flex-shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Recent quotes */}
        <Card>
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">
              {isProvider ? 'Mes devis récents' : 'Devis reçus récents'}
            </h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/quotes">
                Voir tout
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <CardContent className="py-4">
            {quotes.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Aucun devis pour l'instant</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {quotes.slice(0, 4).map((quote) => (
                  <li key={quote.id}>
                    <div className="flex items-center justify-between py-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {quote.project?.title ?? 'Projet'}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatCurrency(quote.amount)} · {quote.timelineDays}j
                        </p>
                      </div>
                      <Badge status={quote.status} className="ml-3 flex-shrink-0" />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions for client */}
      {isClient && (
        <Card className="bg-gradient-to-r from-primary-500 to-orange-600 border-0">
          <CardContent className="py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="text-white">
                <h3 className="font-semibold text-lg">Prêt à lancer un nouveau projet?</h3>
                <p className="text-orange-100 text-sm mt-1">
                  Publiez votre projet et recevez des devis sous 48h.
                </p>
              </div>
              <Button
                className="bg-white text-primary-600 hover:bg-orange-50 flex-shrink-0"
                asChild
              >
                <Link href="/dashboard/projects/new">
                  Nouveau projet
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
