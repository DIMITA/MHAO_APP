import Link from 'next/link';
import { Star, CheckCircle, MapPin } from 'lucide-react';
import { ProviderProfile } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getInitials } from '@/lib/utils';

interface ProviderCardProps {
  provider: ProviderProfile;
}

export function ProviderCard({ provider }: ProviderCardProps) {
  const user = provider.user;
  const initials = user ? getInitials(user.firstName, user.lastName) : 'P';
  const name = user ? `${user.firstName} ${user.lastName}` : provider.companyName ?? 'Prestataire';

  return (
    <Card hover>
      <CardContent className="py-5">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="h-14 w-14 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
              {initials}
            </div>
            {provider.isVerified && (
              <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                <CheckCircle className="h-3 w-3 text-white" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-gray-900 text-sm leading-tight">{name}</h3>
                {provider.companyName && (
                  <p className="text-xs text-gray-500 mt-0.5">{provider.companyName}</p>
                )}
              </div>
              {provider.isVerified && (
                <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 rounded-full px-2 py-0.5 flex-shrink-0">
                  <CheckCircle className="h-3 w-3" />
                  Vérifié
                </span>
              )}
            </div>

            {/* Rating */}
            {provider.ratingCount > 0 ? (
              <div className="flex items-center gap-1.5 mt-1.5">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-3.5 w-3.5 ${
                        star <= Math.round(provider.ratingAvg)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-gray-200 fill-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500">
                  {provider.ratingAvg.toFixed(1)} ({provider.ratingCount} avis)
                </span>
              </div>
            ) : (
              <p className="text-xs text-gray-400 mt-1.5">Pas encore d&apos;avis</p>
            )}

            {/* Description */}
            {provider.description && (
              <p className="text-xs text-gray-500 mt-2 line-clamp-2">{provider.description}</p>
            )}

            {/* Zones */}
            {provider.zonesServed.length > 0 && (
              <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{provider.zonesServed.slice(0, 3).join(', ')}</span>
              </div>
            )}

            {/* Skills tags */}
            {provider.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {provider.skills.slice(0, 4).map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600"
                  >
                    {skill}
                  </span>
                ))}
                {provider.skills.length > 4 && (
                  <span className="text-xs text-gray-400">+{provider.skills.length - 4}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
