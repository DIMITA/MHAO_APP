import Link from 'next/link';
import { MapPin, DollarSign, FileText, Calendar } from 'lucide-react';
import { Project } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatRelativeDate, truncate } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
  href?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  general: 'Général',
  construction: 'Construction',
  renovation: 'Rénovation',
  plomberie: 'Plomberie',
  electricite: 'Électricité',
  menuiserie: 'Menuiserie',
  peinture: 'Peinture',
  carrelage: 'Carrelage',
  toiture: 'Toiture',
  jardin: 'Jardin',
};

export function ProjectCard({ project, href }: ProjectCardProps) {
  const linkHref = href ?? `/dashboard/projects/${project.id}`;

  return (
    <Link href={linkHref}>
      <Card hover className="h-full flex flex-col">
        {/* Photo strip */}
        {project.photos && project.photos.length > 0 ? (
          <div className="h-40 bg-gray-100 rounded-t-xl overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={project.photos[0]}
              alt={project.title}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="h-40 bg-gradient-to-br from-orange-50 to-amber-100 rounded-t-xl flex items-center justify-center">
            <span className="text-4xl">🏗️</span>
          </div>
        )}

        <CardContent className="flex-1 flex flex-col py-5">
          {/* Title + status */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <h3 className="font-semibold text-gray-900 text-base leading-snug line-clamp-2 flex-1">
              {project.title}
            </h3>
            <Badge status={project.status} className="flex-shrink-0 mt-0.5" />
          </div>

          {/* Description */}
          <p className="text-sm text-gray-500 mb-4 line-clamp-2">
            {truncate(project.description, 100)}
          </p>

          {/* Meta */}
          <div className="mt-auto space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
              <span className="truncate">
                {project.address ? `${project.address}, ` : ''}{project.city}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <DollarSign className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
              <span>
                {formatCurrency(project.budgetMin)} – {formatCurrency(project.budgetMax)}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-2">
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <FileText className="h-3.5 w-3.5" />
                <span>{project._count?.quotes ?? 0} devis</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Calendar className="h-3.5 w-3.5" />
                <span>{formatRelativeDate(project.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Category tag */}
          <div className="mt-3">
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
              {CATEGORY_LABELS[project.category] ?? project.category}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
