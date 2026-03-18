'use client';

import { useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';

interface ProjectMapProps {
  lat?: number;
  lng?: number;
  onLocationSelect?: (lat: number, lng: number) => void;
  readonly?: boolean;
  className?: string;
}

// Cotonou, Benin default center
const DEFAULT_LAT = 6.3676;
const DEFAULT_LNG = 2.4252;

// We use a simple iframe for the readonly map and dynamic import for editable
export function ProjectMapStatic({ lat, lng, className }: { lat: number; lng: number; className?: string }) {
  const displayLat = lat || DEFAULT_LAT;
  const displayLng = lng || DEFAULT_LNG;

  return (
    <div className={`relative rounded-xl overflow-hidden bg-gray-100 ${className ?? 'h-48'}`}>
      <iframe
        title="Localisation du projet"
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${displayLng - 0.01},${displayLat - 0.01},${displayLng + 0.01},${displayLat + 0.01}&layer=mapnik&marker=${displayLat},${displayLng}`}
        className="w-full h-full border-0"
        loading="lazy"
      />
      <div className="absolute bottom-2 right-2 bg-white rounded-lg px-2 py-1 text-xs text-gray-600 shadow">
        {displayLat.toFixed(4)}, {displayLng.toFixed(4)}
      </div>
    </div>
  );
}

export function ProjectMapPicker({ lat, lng, onLocationSelect, className }: ProjectMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const markerRef = useRef<unknown>(null);

  const initialLat = lat || DEFAULT_LAT;
  const initialLng = lng || DEFAULT_LNG;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let isMounted = true;

    const initMap = async () => {
      try {
        const L = (await import('leaflet')).default;
        await import('leaflet/dist/leaflet.css');

        // Fix default marker icon
        delete (L.Icon.Default.prototype as Record<string, unknown>)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });

        if (!mapRef.current || !isMounted) return;
        if (mapInstanceRef.current) return;

        const map = L.map(mapRef.current, {
          center: [initialLat, initialLng],
          zoom: 14,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
        }).addTo(map);

        const marker = L.marker([initialLat, initialLng], { draggable: !!onLocationSelect }).addTo(map);

        if (onLocationSelect) {
          marker.on('dragend', () => {
            const pos = marker.getLatLng();
            onLocationSelect(pos.lat, pos.lng);
          });

          map.on('click', (e: { latlng: { lat: number; lng: number } }) => {
            marker.setLatLng([e.latlng.lat, e.latlng.lng]);
            onLocationSelect(e.latlng.lat, e.latlng.lng);
          });
        }

        mapInstanceRef.current = map;
        markerRef.current = marker;
      } catch (err) {
        console.error('Map init error:', err);
      }
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update marker when lat/lng prop changes externally
  useEffect(() => {
    if (markerRef.current && lat && lng) {
      (markerRef.current as { setLatLng: (pos: [number, number]) => void }).setLatLng([lat, lng]);
    }
  }, [lat, lng]);

  return (
    <div className={`relative rounded-xl overflow-hidden ${className ?? 'h-64'}`}>
      <div ref={mapRef} className="h-full w-full" />
      {onLocationSelect && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-white rounded-full px-3 py-1 text-xs text-gray-600 shadow flex items-center gap-1.5 pointer-events-none z-[400]">
          <MapPin className="h-3.5 w-3.5 text-primary-500" />
          Cliquez pour placer le marqueur
        </div>
      )}
    </div>
  );
}

export default ProjectMapPicker;
