'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { providersApi } from '@/lib/api';
import { ProviderProfile, PaginatedResponse } from '@/types';
import { ProviderCard } from '@/components/providers/provider-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PageLoader } from '@/components/ui/spinner';
import { Search, Users, X, ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 12;

const COMMON_SKILLS = [
  'Construction', 'Rénovation', 'Plomberie', 'Électricité',
  'Menuiserie', 'Peinture', 'Carrelage', 'Toiture', 'Maçonnerie',
];

const COTONOU_ZONES = [
  'Cotonou', 'Cadjèhoun', 'Fidjrossè', 'Akpakpa', 'Godomey',
  'Calavi', 'Porto-Novo', 'Parakou',
];

export default function ProvidersPage() {
  const [search, setSearch] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const params = {
    search: search || undefined,
    skills: selectedSkills.length > 0 ? selectedSkills.join(',') : undefined,
    zones: selectedZones.length > 0 ? selectedZones.join(',') : undefined,
    page,
    limit: PAGE_SIZE,
  };

  const { data, isLoading } = useQuery<PaginatedResponse<ProviderProfile>>({
    queryKey: ['providers', params],
    queryFn: async () => {
      const res = await providersApi.list(params as Record<string, unknown>);
      return res.data;
    },
  });

  const providers = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill],
    );
    setPage(1);
  };

  const toggleZone = (zone: string) => {
    setSelectedZones((prev) =>
      prev.includes(zone) ? prev.filter((z) => z !== zone) : [...prev, zone],
    );
    setPage(1);
  };

  const hasFilters = search || selectedSkills.length > 0 || selectedZones.length > 0;

  const handleReset = () => {
    setSearch('');
    setSelectedSkills([]);
    setSelectedZones([]);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Annuaire des prestataires</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Trouvez le bon professionnel pour votre projet BTP
        </p>
      </div>

      {/* Search */}
      <div className="flex gap-3 items-center">
        <div className="flex-1">
          <Input
            placeholder="Rechercher un prestataire..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
        {hasFilters && (
          <Button variant="ghost" onClick={handleReset}>
            <X className="h-4 w-4 mr-1" />
            Effacer
          </Button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters sidebar */}
        <aside className="lg:w-56 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-5 sticky top-20">
            {/* Skills filter */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Compétences</h3>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_SKILLS.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                      selectedSkills.includes(skill)
                        ? 'bg-primary-500 text-white border-primary-500'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            {/* Zones filter */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Zone d&apos;intervention</h3>
              <div className="flex flex-wrap gap-1.5">
                {COTONOU_ZONES.map((zone) => (
                  <button
                    key={zone}
                    onClick={() => toggleZone(zone)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                      selectedZones.includes(zone)
                        ? 'bg-secondary-500 text-white border-secondary-500'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-secondary-300'
                    }`}
                  >
                    {zone}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1">
          {isLoading ? (
            <PageLoader />
          ) : providers.length === 0 ? (
            <div className="text-center py-16">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun prestataire trouvé</h3>
              <p className="text-gray-500 text-sm">
                Essayez d&apos;élargir vos critères de recherche.
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-4">
                {data?.total ?? 0} prestataire{(data?.total ?? 0) !== 1 ? 's' : ''} trouvé{(data?.total ?? 0) !== 1 ? 's' : ''}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {providers.map((provider) => (
                  <ProviderCard key={provider.id} provider={provider} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Précédent
                  </Button>
                  <span className="text-sm text-gray-500">
                    Page {page} sur {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                  >
                    Suivant
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
