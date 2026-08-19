import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Navigation } from 'lucide-react';

interface DeliveryMapProps {
  address: string;
  children?: React.ReactNode;
}

// Default center: Colombo, Sri Lanka -- matches the shop's default district
// (see data/admin.ts DeliveryTask.shopDistrict) and is used whenever an
// address can't be geocoded.
const DEFAULT_CENTER: [number, number] = [6.9271, 79.8612];

const markerIcon = L.divIcon({
  className: '',
  html: `<div style="width:28px;height:28px;border-radius:50% 50% 50% 0;background:#9333ea;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);transform:rotate(-45deg);"></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

// Simple in-memory cache so re-opening the same task doesn't re-geocode.
const geocodeCache = new Map<string, [number, number] | null>();

async function geocodeAddress(address: string): Promise<[number, number] | null> {
  if (geocodeCache.has(address)) return geocodeCache.get(address)!;

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=lk&q=${encodeURIComponent(address)}`,
      { headers: { Accept: 'application/json' } }
    );
    const results = await res.json();
    const coords: [number, number] | null = results?.[0]
      ? [parseFloat(results[0].lat), parseFloat(results[0].lon)]
      : null;
    geocodeCache.set(address, coords);
    return coords;
  } catch {
    geocodeCache.set(address, null);
    return null;
  }
}

export default function DeliveryMap({ address, children }: DeliveryMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [approximate, setApproximate] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = L.map(containerRef.current, { attributionControl: true }).setView(DEFAULT_CENTER, 12);
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    const marker = L.marker(DEFAULT_CENTER, { icon: markerIcon }).addTo(map);

    let cancelled = false;
    geocodeAddress(address).then((coords) => {
      if (cancelled) return;
      setLoading(false);
      if (coords) {
        map.setView(coords, 15);
        marker.setLatLng(coords);
      } else {
        setApproximate(true);
      }
    });

    return () => {
      cancelled = true;
      map.remove();
      mapRef.current = null;
    };
  }, [address]);

  return (
    <div className="relative h-100 rounded-xl overflow-hidden border-2 border-purple-200 dark:border-purple-700/30 shadow-2xl">
      <div ref={containerRef} className="absolute inset-0 z-0" />

      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 dark:bg-black/50 pointer-events-none">
          <span className="text-sm text-gray-600 dark:text-gray-300">Locating address...</span>
        </div>
      )}

      {!loading && approximate && (
        <div className="absolute top-2 left-2 z-10 px-3 py-1.5 rounded-lg bg-white/90 dark:bg-black/70 border border-purple-200 dark:border-purple-700/30 text-xs text-gray-700 dark:text-gray-300 flex items-center gap-1.5 shadow">
          <Navigation className="w-3.5 h-3.5 text-purple-500 shrink-0" />
          Couldn't pinpoint this address exactly -- showing Colombo as an approximate reference.
        </div>
      )}

      <div className="absolute inset-0 z-10 pointer-events-none **:pointer-events-auto">
        {children}
      </div>
    </div>
  );
}
