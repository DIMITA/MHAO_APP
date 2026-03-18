'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, FolderOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { useProjects } from '@/hooks/use-projects';
import { useAuth } from '@/hooks/use-auth';
import { ProjectFilters } from '@/types';
import { ProjectCard } from '@/components/projects/project-card';
import { ProjectFiltersBar } from '@/components/projects/project-filters';
import { Button } from '@/components/ui/button';
import { PageLoader } from '@/components/ui/spinner';

const PAGE_SIZE = 12;

export default function ProjectsPage() {
  const { isClient, isProvider } = useAuth();
  const [filters, setFilters] = useState<ProjectFilters>({ page: 1, limit: PAGE_SIZE });

  const { data, isLoading, isError } = useProjects(filters);
  const projects = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const currentPage = filters.page ?? 1;

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isProvider ? 'Projets disponibles' : 'Mes projets'}
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            {total} projet{total !== 1 ? 's' : ''} trouvé{total !== 1 ? 's' : ''}
          </p>
        </div>
        {isClient && (
          <Button asChild>
            <Link href="/dashboard/projects/new">
              <Plus className="h-4 w-4" />
              Nouveau projet
            </Link>
          </Button>
        )}
      </div>

      {/* Filters */}
      <ProjectFiltersBar filters={filters} onChange={setFilters} />

      {/* Content */}
      {isLoading ? (
        <PageLoader />
      ) : isError ? (
        <div className="text-center py-16 text-gray-500">
          <p>Erreur lors du chargement des projets. Veuillez réessayer.</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16">
          <FolderOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun projet trouvé</h3>
          <p className="text-gray-500 mb-6 text-sm">
            {isClient
              ? "Vous n'avez pas encore créé de projet."
              : "Aucun projet ne correspond à vos critères."}
          </p>
          {isClient && (
            <Button asChild>
              <Link href="/dashboard/projects/new">
                <Plus className="h-4 w-4" />
                Créer mon premier projet
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Précédent
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`h-8 w-8 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-primary-500 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                Suivant
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
