import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { GeoLocation } from '../../types';
import { Navigation, MapPin, CheckCircle } from 'lucide-react';

interface LocationPickerMapProps {
  location: GeoLocation;
  onChangeLocation: (newLoc: GeoLocation) => void;
  height?: string;
}

export const LocationPickerMap: React.FC<LocationPickerMapProps> = ({
  location,
  onChangeLocation,
  height = '360px'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [location.lat, location.lng],
        zoom: 15
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      // Custom Draggable Pin
      const pinIcon = L.divIcon({
        html: `
          <div style="
            background: #059669;
            width: 32px;
            height: 32px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.35);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="width: 10px; height: 10px; background: white; border-radius: 50%; transform: rotate(45deg);"></div>
          </div>
        `,
        className: 'picker-pin',
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      });

      const marker = L.marker([location.lat, location.lng], {
        draggable: true,
        icon: pinIcon
      }).addTo(map);

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        onChangeLocation({
          ...location,
          lat: Number(pos.lat.toFixed(5)),
          lng: Number(pos.lng.toFixed(5)),
          address: 'রোড ৪, সেক্টর ৭, উত্তরা, ঢাকা (পিন পয়েন্ট নির্ধারিত)'
        });
      });

      map.on('click', (e: L.LeafletMouseEvent) => {
        marker.setLatLng(e.latlng);
        onChangeLocation({
          ...location,
          lat: Number(e.latlng.lat.toFixed(5)),
          lng: Number(e.latlng.lng.toFixed(5)),
          address: 'রোড ৪, সেক্টর ৭, উত্তরা, ঢাকা (মানচিত্রে নির্বাচিত)'
        });
      });

      markerRef.current = marker;
      mapInstanceRef.current = map;
    }
  }, []);

  const handleGetCurrentLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const newLat = pos.coords.latitude;
          const newLng = pos.coords.longitude;
          if (mapInstanceRef.current && markerRef.current) {
            mapInstanceRef.current.setView([newLat, newLng], 16);
            markerRef.current.setLatLng([newLat, newLng]);
          }
          onChangeLocation({
            ...location,
            lat: Number(newLat.toFixed(5)),
            lng: Number(newLng.toFixed(5)),
            address: 'বর্তমান জিপিএস অবস্থান (অটো-ডিটেক্টেড)'
          });
          setIsLocating(false);
        },
        () => {
          // Fallback to default Ward 12 center
          setIsLocating(false);
        },
        { timeout: 5000 }
      );
    } else {
      setIsLocating(false);
    }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-[var(--line)] shadow-sm bg-[var(--bg)]" style={{ height }}>
      <div className="absolute top-3 right-3 z-[400] flex items-center gap-2">
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={isLocating}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--paper)]/95 backdrop-blur-md hover:bg-[var(--paper)] text-[var(--ink)] text-xs font-semibold shadow-md border border-[var(--line)] transition cursor-pointer"
        >
          <Navigation className={`w-3.5 h-3.5 text-[var(--green)] ${isLocating ? 'animate-spin' : ''}`} />
          <span>{isLocating ? 'অবস্থান খোঁজা হচ্ছে...' : 'বর্তমান GPS অবস্থান'}</span>
        </button>

        <a
          href={`https://www.google.com/maps?q=${location.lat},${location.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--paper)]/95 backdrop-blur-md hover:bg-[var(--paper)] text-[var(--gold)] text-xs font-semibold shadow-md border border-[var(--line)] transition cursor-pointer"
          title="গুগল ম্যাপে বড় করে দেখুন"
        >
          <MapPin className="w-3.5 h-3.5 text-[var(--gold)]" />
          <span>Google Map-এ খুলুন</span>
        </a>
      </div>

      <div className="absolute bottom-3 left-3 right-3 z-[400] bg-[var(--paper)]/95 backdrop-blur-md p-3 rounded-xl border border-[var(--line)] shadow-md">
        <div className="flex items-start gap-2.5">
          <MapPin className="w-4 h-4 text-[var(--green)] shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[var(--ink)] truncate">{location.address}</p>
            <p className="text-[11px] text-[var(--muted)] mt-0.5">
              ওয়ার্ড: <strong className="text-[var(--ink)]">{location.wardName}</strong> | অক্ষাংশ/দ্রাঘিমাংশ: {location.lat}, {location.lng}
            </p>
          </div>
        </div>
      </div>

      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};
