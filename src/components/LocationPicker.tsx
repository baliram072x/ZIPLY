import { useState, useRef, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapPin, Loader2, Check } from 'lucide-react';
import L from 'leaflet';

// Fix leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationPickerProps {
  onLocationSelect: (address: string, lat: number, lng: number) => void;
  defaultLocation?: { lat: number; lng: number };
}

// Koramangala, Bengaluru default
const DEFAULT_CENTER = { lat: 12.9348, lng: 77.6222 };

export function LocationPicker({ onLocationSelect, defaultLocation }: LocationPickerProps) {
  const [position, setPosition] = useState(defaultLocation || DEFAULT_CENTER);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const reverseGeocode = async (lat: number, lng: number) => {
    setLoading(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const data = await response.json();
      if (data && data.display_name) {
        // Create a shorter address
        const parts = data.display_name.split(',').slice(0, 3);
        setAddress(parts.join(', '));
      } else {
        setAddress('Unknown Location');
      }
    } catch (err) {
      console.error('Geocoding failed:', err);
      setAddress('Could not fetch address');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initially reverse geocode the default position
    reverseGeocode(position.lat, position.lng);
    
    // Try to get user's actual location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const newPos = { lat: latitude, lng: longitude };
          setPosition(newPos);
          reverseGeocode(latitude, longitude);
          
          // Update map and marker if they are already initialized
          if (leafletMapRef.current && markerRef.current) {
            leafletMapRef.current.setView([latitude, longitude], 15);
            markerRef.current.setLatLng([latitude, longitude]);
          }
        },
        (err) => {
          console.error("Geolocation error:", err.message);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    
    // Initialize map
    const map = L.map(mapRef.current).setView([position.lat, position.lng], 15);
    leafletMapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    const marker = L.marker([position.lat, position.lng], { draggable: true }).addTo(map);
    markerRef.current = marker;

    marker.on('dragend', () => {
      const latlng = marker.getLatLng();
      setPosition(latlng);
      reverseGeocode(latlng.lat, latlng.lng);
    });

    map.on('click', (e) => {
      marker.setLatLng(e.latlng);
      setPosition(e.latlng);
      reverseGeocode(e.latlng.lat, e.latlng.lng);
    });

    // Handle resize
    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => {
      map.remove();
    };
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="text-sm font-semibold text-muted-foreground flex items-center justify-between">
        <span>Drag the marker or tap to select your location</span>
      </div>
      
      <div className="h-64 w-full rounded-2xl overflow-hidden border border-border shadow-soft relative z-0">
        <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-1 flex-shrink-0 text-primary">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <MapPin className="h-5 w-5" />}
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-foreground mb-1">Selected Location</h4>
            <p className="text-sm text-muted-foreground min-h-[2.5rem]">
              {loading ? 'Fetching address details...' : address}
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={loading || !address}
          onClick={() => onLocationSelect(address, position.lat, position.lng)}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3 font-display text-sm font-bold text-primary-foreground shadow-pop transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
        >
          <Check className="h-4 w-4" />
          Confirm Location
        </button>
      </div>
    </div>
  );
}
