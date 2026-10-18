import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Case, HotspotZone } from '../../types';
import { PRIORITY_CONFIG } from '../../constants';
import { MapPin, AlertTriangle, Layers, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface InteractiveMapProps {
  cases: Case[];
  hotspots?: HotspotZone[];
  selectedCaseId?: string;
  onSelectCase?: (caseId: string) => void;
  height?: string;
  showHotspotsToggle?: boolean;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  cases,
  hotspots = [],
  selectedCaseId,
  onSelectCase,
  height = '500px',
  showHotspotsToggle = true
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const hotspotsLayerRef = useRef<L.LayerGroup | null>(null);
  const [showHotspots, setShowHotspots] = useState(true);
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const navigate = useNavigate();

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Initialize map centered at Dhaka / Ward 12
      const map = L.map(mapContainerRef.current, {
        center: [23.85, 90.39],
        zoom: 13,
        zoomControl: true
      });

      // Google Maps / OpenStreetMap Base Tiles with high reliability
      L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        attribution: '&copy; Google Maps',
        maxZoom: 20
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      hotspotsLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;

      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    }

    return () => {
      // Map cleanup if needed on unmount
    };
  }, []);

  // Update Markers and Hotspots
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current || !hotspotsLayerRef.current) return;

    markersLayerRef.current.clearLayers();
    hotspotsLayerRef.current.clearLayers();

    const filteredCases = cases.filter(c => {
      if (priorityFilter === 'all') return true;
      return c.priority === priorityFilter;
    });

    // Add Incident Markers
    filteredCases.forEach(item => {
      const pConf = PRIORITY_CONFIG[item.priority] || PRIORITY_CONFIG.low;

      // Custom SVG Pin
      const iconHtml = `
        <div style="
          background-color: ${pConf.color};
          width: 28px;
          height: 28px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 2px solid white;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 8px;
            height: 8px;
            background-color: white;
            border-radius: 50%;
            transform: rotate(45deg);
          "></div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-leaflet-pin',
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -28]
      });

      const marker = L.marker([item.location.lat, item.location.lng], { icon: customIcon });

      const popupContent = `
        <div style="font-family: 'Hind Siliguri', sans-serif; font-size: 13px; max-width: 240px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <strong style="color: #059669; font-size: 11px;">${item.id}</strong>
            <span style="font-size: 10px; padding: 2px 6px; border-radius: 10px; background: ${pConf.bg}; color: ${pConf.color}; font-weight: 600;">${pConf.label}</span>
          </div>
          <h4 style="font-weight: 600; color: #1e293b; margin: 0 0 4px 0; font-size: 13px;">${item.title}</h4>
          <p style="font-size: 11px; color: #64748b; margin: 0 0 6px 0;">📍 ${item.location.address}</p>
          <div style="font-size: 11px; background: #f8fafc; padding: 4px 6px; border-radius: 6px; border: 1px solid #e2e8f0;">
            <strong>বিভাগ:</strong> ${item.aiAnalysis.proposedDepartmentName}
          </div>
          <button id="btn-view-${item.id}" style="
            margin-top: 8px;
            width: 100%;
            padding: 6px 10px;
            background: #059669;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
          ">বিস্তারিত দেখুন</button>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-view-${item.id}`);
        if (btn) {
          btn.onclick = () => {
            if (onSelectCase) onSelectCase(item.id);
            else navigate(`/cases/${item.id}`);
          };
        }
      });

      markersLayerRef.current?.addLayer(marker);
    });

    // Add Hotspot Polygons if toggled
    if (showHotspots && hotspots.length > 0) {
      hotspots.forEach(hs => {
        const polygon = L.polygon(hs.polygonCoordinates, {
          color: hs.severity === 'critical' ? '#dc2626' : '#ea580c',
          fillColor: hs.severity === 'critical' ? '#ef4444' : '#f97316',
          fillOpacity: 0.18,
          weight: 2,
          dashArray: '5, 5'
        });

        polygon.bindPopup(`
          <div style="font-family: 'Hind Siliguri', sans-serif; font-size: 12px;">
            <strong style="color: #dc2626;">⚠️ পুনরাবৃত্ত হটস্পট জোন</strong>
            <h4 style="font-weight: 600; margin: 2px 0;">${hs.name}</h4>
            <p style="font-size: 11px; color: #475569; margin: 0 0 4px 0;">আক্রান্ত সম্পদ: ${hs.recurrentAsset}</p>
            <p style="font-size: 11px; background: #fef2f2; padding: 4px; border-radius: 4px; border: 1px solid #fecaca;">
              ${hs.aiSuggestion}
            </p>
          </div>
        `);

        hotspotsLayerRef.current?.addLayer(polygon);
      });
    }

    // Auto zoom to selected case if provided
    if (selectedCaseId) {
      const selected = cases.find(c => c.id === selectedCaseId);
      if (selected && mapInstanceRef.current) {
        mapInstanceRef.current.setView([selected.location.lat, selected.location.lng], 16);
      }
    }
  }, [cases, hotspots, priorityFilter, showHotspots, selectedCaseId, onSelectCase, navigate]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm" style={{ height }}>
      {/* Map Filter Controls Overlay */}
      <div className="absolute top-3 left-3 z-[400] bg-white/95 backdrop-blur-md rounded-xl p-2 border border-slate-200 shadow-md flex flex-wrap items-center gap-2 text-xs">
        <span className="font-semibold text-slate-700 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-emerald-600" />
          ফিল্টার:
        </span>
        <select
          value={priorityFilter}
          onChange={e => setPriorityFilter(e.target.value)}
          className="px-2 py-1 bg-slate-50 rounded-lg border border-slate-300 text-xs font-medium focus:ring-1 focus:ring-emerald-500"
        >
          <option value="all">সকল অগ্রাধিকার ({cases.length})</option>
          <option value="emergency">জরুরি (Emergency)</option>
          <option value="high">উচ্চ (High)</option>
          <option value="medium">মাঝারি (Medium)</option>
          <option value="low">নিম্ন (Low)</option>
        </select>

        {showHotspotsToggle && hotspots.length > 0 && (
          <label className="flex items-center gap-1.5 ml-2 cursor-pointer font-medium text-slate-700">
            <input
              type="checkbox"
              checked={showHotspots}
              onChange={e => setShowHotspots(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span>হটস্পট জোন দেখান ({hotspots.length})</span>
          </label>
        )}
      </div>

      {/* Privacy Guarantee Note */}
      <div className="absolute bottom-3 left-3 z-[400] bg-slate-900/90 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-[11px] flex items-center gap-1.5 shadow">
        <Eye className="w-3 h-3 text-emerald-400" />
        <span>গোপনীয়তা সংরক্ষিত: মানচিত্রে কোনো নাগরিকের ব্যক্তিগত পরিচয় প্রকাশ করা হয় না</span>
      </div>

      {/* Leaflet Map DOM Element */}
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};
