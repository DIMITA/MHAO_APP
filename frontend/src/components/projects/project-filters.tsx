'use client';

import { ProjectFilters, ProjectStatus } from '@/types';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

interface ProjectFiltersProps {
  filters: ProjectFilters;
  onChange: (filters: ProjectFilters) => void;
}

const statusOptions = [
  { value: '', label: 'Tous les statuts' },
  { value: ProjectStatus.OPEN, label: 'Ouvert' },
  { value: ProjectStatus.IN_PROGRESS, label: 'En cours' },
  { value: ProjectStatus.COMPLETED, label: 'Terminé' },
  { value: ProjectStatus.CANCELLED, label: 'Annulé' },
];

const categoryOptions = [
  { value: '', label: 'Toutes catégories' },
  { value: 'construction', label: 'Construction' },
  { value: 'renovation', label: 'Rénovation' },
  { value: 'plomberie', label: 'Plomberie' },
  { value: 'electricite', label: 'Électricité' },
  { value: 'menuiserie', label: 'Menuiserie' },
  { value: 'peinture', label: 'Peinture' },
  { value: 'carrelage', label: 'Carrelage' },
  { value: 'toiture', label: 'Toiture' },
];

export function ProjectFiltersBar({ filters, onChange }: ProjectFiltersProps) {
  const hasFilters =
    filters.search || filters.status || filters.category || filters.budgetMin || filters.budgetMax;

  const handleReset = () => {
    onChange({ page: 1, limit: filters.limit });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="flex-1">
          <Input
            placeholder="Rechercher un projet..."
            value={filters.search ?? ''}
            onChange={(e) => onChange({ ...filters, search: e.target.value, page: 1 })}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>

        {/* Status */}
        <div className="sm:w-44">
          <Select
            options={statusOptions}
            value={filters.status ?? ''}
            onChange={(e) =>
              onChange({ ...filters, status: (e.target.value as ProjectStatus) || undefined, page: 1 })
            }
            placeholder="Statut"
          />
        </div>

        {/* Category */}
        <div className="sm:w-48">
          <Select
            options={categoryOptions}
            value={filters.category ?? ''}
            onChange={(e) => onChange({ ...filters, category: e.target.value || undefined, page: 1 })}
            placeholder="Catégorie"
          />
        </div>

        {/* Budget range */}
        <div className="flex gap-2 sm:w-64">
          <Input
            type="number"
            placeholder="Budget min"
            value={filters.budgetMin ?? ''}
            onChange={(e) =>
              onChange({ ...filters, budgetMin: e.target.value ? Number(e.target.value) : undefined, page: 1 })
            }
          />
          <Input
            type="number"
            placeholder="Budget max"
            value={filters.budgetMax ?? ''}
            onChange={(e) =>
              onChange({ ...filters, budgetMax: e.target.value ? Number(e.target.value) : undefined, page: 1 })
            }
          />
        </div>

        {/* Reset */}
        {hasFilters && (
          <Button variant="ghost" size="md" onClick={handleReset} className="flex-shrink-0">
            <X className="h-4 w-4 mr-1" />
            Effacer
          </Button>
        )}
      </div>
    </div>
  );
}
