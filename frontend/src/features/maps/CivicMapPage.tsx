import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import L from 'leaflet';
import {
  MapPin,
  Filter,
  Layers,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Eye,
  ShieldCheck,
  Sparkles,
  Maximize2,
  Compass,
  ArrowRight,
  Flame,
  Globe,
  Navigation,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { toBanglaNumber } from '../../utils/formatters';

interface MapIncident {
  id: string;
  category: 'drainage' | 'waste' | 'roads' | 'streetlights';
  categoryBn: string;
  titleBn: string;
  wardBn: string;
  wardId: number;
  priority: 'emergency' | 'high' | 'medium' | 'low';
  priorityBn: string;
  status: 'in_progress' | 'resolved' | 'submitted';
  statusBn: string;
  deptName: string;
  slaRemaining: string;
  lat: number;
  lng: number;
  isHotspot?: boolean;
}

const MAP_INCIDENTS: MapIncident[] = [
  {
    id: 'NS-2026-W03-1001',
    category: 'drainage',
    categoryBn: 'ড্রেনেজ ও জলাবদ্ধতা',
    titleBn: 'প্রধান সড়কে বর্জ্য জমে ড্রেন ভরাট ও জলাবদ্ধতা সৃষ্টি',
    wardBn: 'ওয়ার্ড ৩ (মিরপুর ১০)',
    wardId: 3,
    priority: 'emergency',
    priorityBn: 'জরুরি',
    status: 'in_progress',
    statusBn: 'সমন্বিত সমাধান চলমান',
    deptName: 'ড্রেনেজ ও পয়ঃনিষ্কাশন বিভাগ',
    slaRemaining: '২ ঘণ্টা ১৮ মি.',
    lat: 23.8068,
    lng: 90.3687,
    isHotspot: true
  },
  {
    id: 'NS-2026-W12-0842',
    category: 'waste',
    categoryBn: 'কঠিন বর্জ্য ব্যবস্থাপনা',
    titleBn: 'বাজার সংলগ্ন সেকেন্ডারি পয়েন্ট উপচে ময়লা ফেলা',
    wardBn: 'ওয়ার্ড ১২ (ধানমন্ডি ২৭)',
    wardId: 12,
    priority: 'high',
    priorityBn: 'উচ্চ অগ্রাধিকার',
    status: 'in_progress',
    statusBn: 'কমপ্যাক্টর ট্রাক নির্ধারিত',
    deptName: 'বর্জ্য ব্যবস্থাপনা বিভাগ',
    slaRemaining: '৫ ঘণ্টা ৪৫ মি.',
    lat: 23.7465,
    lng: 90.3762,
    isHotspot: true
  },
  {
    id: 'NS-2026-W08-0719',
    category: 'roads',
    categoryBn: 'সড়ক ও অবকাঠামো',
    titleBn: 'কালভার্ট সংযোগে গভীর গর্ত ও খোয়া সরে যাওয়া',
    wardBn: 'ওয়ার্ড ৮ (গুলশান ২)',
    wardId: 8,
    priority: 'medium',
    priorityBn: 'মাঝারি',
    status: 'resolved',
    statusBn: 'সমাধান সম্পন্ন (যাচাইকৃত)',
    deptName: 'সিভিল ও সড়ক সংস্কার বিভাগ',
    slaRemaining: 'সম্পন্ন',
    lat: 23.7925,
    lng: 90.4078
  },
  {
    id: 'NS-2026-W19-0520',
    category: 'streetlights',
    categoryBn: 'সড়ক বাতি মেরামত',
    titleBn: 'প্রধান সড়কের ৫টি এলইডি পোল অকেজো ও অন্ধকার',
    wardBn: 'ওয়ার্ড ১৯ (বনানী ১১)',
    wardId: 19,
    priority: 'medium',
    priorityBn: 'মাঝারি',
    status: 'in_progress',
    statusBn: 'মেরামত দল নিয়োজিত',
    deptName: 'বিদ্যুৎ ও আলোকায়ন বিভাগ',
    slaRemaining: '১০ ঘণ্টা ১২ মি.',
    lat: 23.7940,
    lng: 90.4043
  },
  {
    id: 'NS-2026-W03-0914',
    category: 'drainage',
    categoryBn: 'ড্রেনেজ ও পয়ঃনিষ্কাশন',
    titleBn: 'স্কুল সংলগ্ন খোলা ড্রেনের স্লাব ভাঙা',
    wardBn: 'ওয়ার্ড ৩ (মিরপুর ২)',
    wardId: 3,
    priority: 'high',
    priorityBn: 'উচ্চ অগ্রাধিকার',
    status: 'in_progress',
    statusBn: 'ব্যারিকেড স্থাপনকৃত',
    deptName: 'ড্রেনেজ বিভাগ',
    slaRemaining: '৪ ঘণ্টা ২০ মি.',
    lat: 23.8110,
    lng: 90.3650,
    isHotspot: true
  },
  {
    id: 'NS-2026-W01-0311',
    category: 'waste',
    categoryBn: 'বর্জ্য অপসারণ',
    titleBn: 'উত্তরা রবীন্দ্র সরণি বর্জ্য স্তূপ ও দুর্গন্ধ',
    wardBn: 'ওয়ার্ড ১ (উত্তরা সেক্টর ৭)',
    wardId: 1,
    priority: 'high',
    priorityBn: 'উচ্চ অগ্রাধিকার',
    status: 'in_progress',
    statusBn: 'পরিচ্ছন্নতাকর্মী দল পাঠানো হয়েছে',
    deptName: 'বর্জ্য ব্যবস্থাপনা বিভাগ',
    slaRemaining: '৩ ঘণ্টা ৫০ মি.',
    lat: 23.8720,
    lng: 90.3980
  }
];

type TileLayerType = 'google' | 'satellite' | 'osm' | 'dark';

export const CivicMapPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialLayer = (searchParams.get('layer') as TileLayerType) || 'google';

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedIncident, setSelectedIncident] = useState<MapIncident | null>(MAP_INCIDENTS[0]);
  const [activeTileLayer, setActiveTileLayer] = useState<TileLayerType>(initialLayer);
  const [showHotspots, setShowHotspots] = useState(true);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerGroupRef = useRef<L.TileLayer | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const hotspotsGroupRef = useRef<L.LayerGroup | null>(null);

  const filteredIncidents = MAP_INCIDENTS.filter(item => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (selectedPriority !== 'all' && item.priority !== selectedPriority) return false;
    return true;
  });

  const getPinColor = (priority: string) => {
    switch (priority) {
      case 'emergency': return '#c66e60';
      case 'high': return '#d8a155';
      case 'resolved': return '#4b9e78';
      default: return '#899fb4';
    }
  };

  // Helper to get tile URL and config by type
  const getTileConfig = (type: TileLayerType) => {
    switch (type) {
      case 'google':
        return {
          url: 'https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
          options: {
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
            maxZoom: 20,
            attribution: '&copy; Google Maps'
          }
        };
      case 'satellite':
        return {
          url: 'https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
          options: {
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
            maxZoom: 20,
            attribution: '&copy; Google Maps Imagery'
          }
        };
      case 'dark':
        return {
          url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
          options: {
            subdomains: 'abcd',
            maxZoom: 20,
            attribution: '&copy; OpenStreetMap &copy; CARTO'
          }
        };
      case 'osm':
      default:
        return {
          url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          options: {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors'
          }
        };
    }
  };

  // 1. Initialize Map on Mount
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Center on Dhaka Metropolitan
    const map = L.map(mapContainerRef.current, {
      center: [23.785, 90.395],
      zoom: 12,
      zoomControl: false
    });

    // Custom Zoom Control top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Initial Tile Layer
    const tileConfig = getTileConfig(activeTileLayer);
    let tileLayer = L.tileLayer(tileConfig.url, tileConfig.options).addTo(map);

    // Safe fallback if tile server fails
    tileLayer.on('tileerror', () => {
      if (activeTileLayer === 'google' || activeTileLayer === 'satellite') {
        // Fallback gracefully to OSM
        map.removeLayer(tileLayer);
        const osmConfig = getTileConfig('osm');
        tileLayer = L.tileLayer(osmConfig.url, osmConfig.options).addTo(map);
        tileLayerGroupRef.current = tileLayer;
      }
    });

    tileLayerGroupRef.current = tileLayer;
    markersGroupRef.current = L.layerGroup().addTo(map);
    hotspotsGroupRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    // Invalidate size to ensure zero blank spots
    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 2. Handle Layer Switching
  useEffect(() => {
    if (!mapRef.current || !tileLayerGroupRef.current) return;

    mapRef.current.removeLayer(tileLayerGroupRef.current);
    const tileConfig = getTileConfig(activeTileLayer);
    const newTileLayer = L.tileLayer(tileConfig.url, tileConfig.options).addTo(mapRef.current);

    newTileLayer.on('tileerror', () => {
      if (activeTileLayer === 'google' || activeTileLayer === 'satellite') {
        if (mapRef.current) {
          mapRef.current.removeLayer(newTileLayer);
          const osmConfig = getTileConfig('osm');
          const fallbackLayer = L.tileLayer(osmConfig.url, osmConfig.options).addTo(mapRef.current);
          tileLayerGroupRef.current = fallbackLayer;
          fallbackLayer.bringToBack();
        }
      }
    });

    tileLayerGroupRef.current = newTileLayer;
    // ensure underneath markers
    newTileLayer.bringToBack();
  }, [activeTileLayer]);

  // 3. Render Incident Markers & Hotspots
  useEffect(() => {
    if (!mapRef.current || !markersGroupRef.current || !hotspotsGroupRef.current) return;

    markersGroupRef.current.clearLayers();
    hotspotsGroupRef.current.clearLayers();

    // Render Hotspot Circles
    if (showHotspots) {
      const hotspots = [
        { lat: 23.8068, lng: 90.3687, name: 'হটস্পট: মিরপুর ১০ ড্রেনেজ', color: '#d8a155' },
        { lat: 23.7465, lng: 90.3762, name: 'হটস্পট: ধানমন্ডি ২৭ বর্জ্য', color: '#c66e60' }
      ];

      hotspots.forEach(h => {
        const circle = L.circle([h.lat, h.lng], {
          color: h.color,
          fillColor: h.color,
          fillOpacity: 0.18,
          weight: 2,
          dashArray: '6, 6',
          radius: 650
        }).addTo(hotspotsGroupRef.current!);

        circle.bindTooltip(h.name, {
          permanent: false,
          direction: 'top',
          className: 'civic-map-tooltip'
        });
      });
    }

    // Render Incident Markers
    filteredIncidents.forEach(item => {
      const color = getPinColor(item.priority);
      const isSelected = selectedIncident?.id === item.id;

      const markerHtml = `
        <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
          ${
            item.priority === 'emergency'
              ? `<div style="position: absolute; inset: -4px; border-radius: 50%; background-color: rgba(198, 110, 96, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`
              : ''
          }
          <div style="
            background-color: ${isSelected ? '#d4c19a' : '#0d100e'};
            border: 2.5px solid ${color};
            color: ${isSelected ? '#0d100e' : color};
            width: 32px;
            height: 32px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 4px 14px rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
          ">
            <div style="
              width: 10px;
              height: 10px;
              background-color: ${isSelected ? '#0d100e' : color};
              border-radius: 50%;
              transform: rotate(45deg);
            "></div>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'civic-incident-pin',
        iconSize: [34, 34],
        iconAnchor: [17, 34]
      });

      const marker = L.marker([item.lat, item.lng], { icon: customIcon }).addTo(markersGroupRef.current!);

      marker.on('click', () => {
        setSelectedIncident(item);
        if (mapRef.current) {
          mapRef.current.flyTo([item.lat, item.lng], 15, { duration: 0.8 });
        }
      });

      marker.bindPopup(`
        <div style="font-family: inherit; color: #111; padding: 4px; max-width: 240px;">
          <div style="font-size: 11px; font-weight: bold; color: #555; text-transform: uppercase;">${item.id}</div>
          <div style="font-size: 13px; font-weight: bold; margin-top: 2px;">${item.titleBn}</div>
          <div style="font-size: 12px; color: #333; margin-top: 4px;">ওয়ার্ড: <strong>${item.wardBn}</strong></div>
          <div style="font-size: 11px; margin-top: 4px; padding: 2px 6px; border-radius: 4px; display: inline-block; background-color: #f0eee4; font-weight: bold; color: ${color};">
            ${item.priorityBn} · ${item.statusBn}
          </div>
        </div>
      `);
    });
  }, [filteredIncidents, selectedIncident, showHotspots]);

  const handleFlyToIncident = (incident: MapIncident) => {
    setSelectedIncident(incident);
    if (mapRef.current) {
      mapRef.current.flyTo([incident.lat, incident.lng], 15, { duration: 1 });
    }
  };

  const handleResetFit = () => {
    if (!mapRef.current || filteredIncidents.length === 0) return;
    const bounds = L.latLngBounds(filteredIncidents.map(i => [i.lat, i.lng]));
    mapRef.current.fitBounds(bounds, { padding: [50, 50] });
  };

  const handleLocateMe = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(pos => {
        const { latitude, longitude } = pos.coords;
        if (mapRef.current) {
          mapRef.current.flyTo([latitude, longitude], 15, { duration: 1.2 });
          L.circle([latitude, longitude], {
            radius: 80,
            color: '#4b9e78',
            fillColor: '#4b9e78',
            fillOpacity: 0.35
          }).addTo(mapRef.current).bindPopup('আপনার বর্তমান অবস্থান').openPopup();
        }
      });
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#343d34]">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="text-xs font-mono tracking-widest text-[#d4c19a] bg-[#1b221c] px-3.5 py-1 rounded-full border border-[#343d34] uppercase font-semibold">
              GEOSPATIAL TRANSPARENCY & LIVE INCIDENT RADAR
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#eeeee6] tracking-tight">
            নগর জনসেবা মানচিত্র · <strong className="font-extrabold text-[#d4c19a]">Live Dhaka City Map</strong>
          </h1>
          <p className="text-sm text-[#a7b0a8] mt-1.5 leading-relaxed">
            গুগল ম্যাপ ও স্যাটেলাইট ভিউতে ওয়ার্ডভিত্তিক নাগরিক সমস্যা, অগ্রাধিকার ও তাৎক্ষণিক সমাধান স্থিতি।
          </p>
        </div>

        {/* Legend Quick Count */}
        <div className="flex items-center gap-3 bg-[#151a16] border border-[#343d34] px-4 py-2.5 rounded-2xl text-sm shadow-md">
          <span className="flex items-center gap-1.5 text-[#eeeee6]">
            <span className="w-3 h-3 rounded-full bg-[#c66e60]" />
            <span>জরুরি ({toBanglaNumber(MAP_INCIDENTS.filter(i => i.priority === 'emergency').length)})</span>
          </span>
          <span className="text-[#343d34]">|</span>
          <span className="flex items-center gap-1.5 text-[#d4c19a]">
            <span className="w-3 h-3 rounded-full bg-[#d8a155]" />
            <span>উচ্চ ({toBanglaNumber(MAP_INCIDENTS.filter(i => i.priority === 'high').length)})</span>
          </span>
          <span className="text-[#343d34]">|</span>
          <span className="flex items-center gap-1.5 text-[#4b9e78]">
            <span className="w-3 h-3 rounded-full bg-[#4b9e78]" />
            <span>সমাধান ({toBanglaNumber(MAP_INCIDENTS.filter(i => i.status === 'resolved').length)})</span>
          </span>
        </div>
      </div>

      {/* Filter & Map Layer Switcher Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#151a16] border border-[#343d34] p-4 rounded-2xl shadow-lg">
        {/* Category Filter Chips */}
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-sm font-bold text-[#d4c19a] flex items-center gap-1.5 mr-1">
            <Filter className="w-4 h-4" />
            <span>ফিল্টার:</span>
          </span>

          {[
            { id: 'all', label: 'সকল সেবা' },
            { id: 'drainage', label: 'ড্রেনেজ' },
            { id: 'waste', label: 'বর্জ্য' },
            { id: 'roads', label: 'সড়ক' },
            { id: 'streetlights', label: 'সড়ক বাতি' }
          ].map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#295e42] text-[#d4c19a] border border-[#4b9e78] shadow-sm'
                  : 'bg-[#0d100e] text-[#a7b0a8] border border-[#343d34] hover:text-[#eeeee6]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Tile Layer Selector (Google Maps / Satellite / OSM / Dark) */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-[#a7b0a8] flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-[#d4c19a]" />
            <span>মানচিত্র প্রকার:</span>
          </span>

          <div className="flex items-center rounded-xl bg-[#0d100e] border border-[#343d34] p-1">
            {[
              { id: 'google', label: 'গুগল ম্যাপ' },
              { id: 'satellite', label: 'স্যাটেলাইট ভিউ' },
              { id: 'osm', label: 'ওপেনস্ট্রিটম্যাপ' },
              { id: 'dark', label: 'ডার্ক মোড' }
            ].map(layer => (
              <button
                key={layer.id}
                type="button"
                onClick={() => setActiveTileLayer(layer.id as TileLayerType)}
                className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition cursor-pointer ${
                  activeTileLayer === layer.id
                    ? 'bg-[#d4c19a] text-[#0d100e] font-bold shadow-md'
                    : 'text-[#a7b0a8] hover:text-[#eeeee6]'
                }`}
              >
                {layer.label}
              </button>
            ))}
          </div>

          {/* Hotspots Toggle */}
          <button
            type="button"
            onClick={() => setShowHotspots(!showHotspots)}
            className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl border transition flex items-center gap-2 cursor-pointer shadow-sm ${
              showHotspots
                ? 'bg-[#373224] text-[#d4c19a] border-[#6b5c3e]'
                : 'bg-[#0d100e] text-[#708379] border-[#343d34]'
            }`}
          >
            <Flame className="w-4 h-4 text-[#d8a155]" />
            <span>হটস্পট জোন</span>
          </button>
        </div>
      </div>

      {/* Main Map + Incident Details Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Visual Map Canvas */}
        <div className="lg:col-span-8 rounded-2xl overflow-hidden border border-[#343d34] bg-[#0b100c] min-h-[580px] relative flex flex-col justify-between shadow-2xl">
          {/* Top Quick Action Floating Bar */}
          <div className="absolute top-4 left-4 z-[400] flex items-center gap-2.5">
            <div className="bg-[#151a16]/90 backdrop-blur-md border border-[#343d34] px-3.5 py-2 rounded-xl text-xs sm:text-sm text-[#a7b0a8] flex items-center gap-2 shadow-lg">
              <Compass className="w-4.5 h-4.5 text-[#d4c19a]" />
              <span className="text-[#eeeee6] font-semibold">ঢাকা সিটি কর্পোরেশন সিভিক জোন</span>
            </div>

            <button
              type="button"
              onClick={handleLocateMe}
              className="bg-[#151a16]/90 backdrop-blur-md hover:bg-[#295e42] border border-[#343d34] hover:border-[#4b9e78] text-[#eeeee6] px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-lg transition cursor-pointer"
              title="আমার অবস্থান চিহ্নিত করুন"
            >
              <Navigation className="w-4 h-4 text-[#d4c19a]" />
              <span className="hidden sm:inline">আমার অবস্থান</span>
            </button>

            <button
              type="button"
              onClick={handleResetFit}
              className="bg-[var(--paper)]/90 backdrop-blur-md hover:bg-[var(--green-light)] border border-[var(--line)] text-[var(--ink)] px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-lg transition cursor-pointer"
              title="সকল কেস দৃশ্যমান করুন"
            >
              <Maximize2 className="w-4 h-4 text-[var(--gold)]" />
              <span className="hidden sm:inline">সব কেস দেখুন</span>
            </button>
          </div>

          {/* Leaflet Map DOM Container */}
          <div
            ref={mapContainerRef}
            className="w-full h-[580px] z-0 focus:outline-none"
            style={{ background: '#0d100e' }}
          />

          {/* Bottom Privacy Safeguard Footer */}
          <div className="bg-[#151a16]/95 border-t border-[#343d34] px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#708379] z-10">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4.5 h-4.5 text-[#4b9e78]" />
              <span>নাগরিকের ব্যক্তিগত গোপনীয়তা সুরক্ষায় জিপিএস অবস্থান ক্লাস্টার বা ১০০ মিটার রেডিয়াসে সংরক্ষিত।</span>
            </div>
            <span className="font-mono text-[#a7b0a8] flex items-center gap-1.5 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4b9e78] animate-pulse" />
              <span>LIVE: {toBanglaNumber(filteredIncidents.length)} Incidents Active</span>
            </span>
          </div>
        </div>

        {/* Right Column: Selected Incident Inspection Card */}
        <div className="lg:col-span-4 space-y-4">
          {selectedIncident ? (
            <div className="rounded-2xl p-6 sm:p-7 border border-[#343d34] bg-[#151a16] shadow-xl space-y-5 sticky top-24">
              <div className="flex items-center justify-between pb-3.5 border-b border-[#242c24]">
                <div>
                  <span className="text-xs font-mono text-[#a7b0a8]">SELECTED INCIDENT</span>
                  <h3 className="text-base font-bold text-[#d4c19a] font-mono">#{selectedIncident.id}</h3>
                </div>
                <span
                  style={{
                    backgroundColor: `${getPinColor(selectedIncident.priority)}22`,
                    color: getPinColor(selectedIncident.priority),
                    borderColor: getPinColor(selectedIncident.priority)
                  }}
                  className="px-3 py-1 rounded-full text-xs font-bold border"
                >
                  {selectedIncident.priorityBn}
                </span>
              </div>

              <div className="space-y-1.5">
                <span className="text-sm text-[#d4c19a] font-bold block">
                  {selectedIncident.categoryBn} · {selectedIncident.wardBn}
                </span>
                <p className="text-base font-semibold text-[#eeeee6] leading-snug">
                  {selectedIncident.titleBn}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0d100e] border border-[#2e372e] space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[#a7b0a8]">দায়িত্বপ্রাপ্ত বিভাগ:</span>
                  <strong className="text-[#eeeee6] font-semibold">{selectedIncident.deptName}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#a7b0a8]">বর্তমান স্থিতি:</span>
                  <span className="text-[#d4c19a] font-semibold">{selectedIncident.statusBn}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#a7b0a8]">এসএলএ লক্ষ্যমাত্রা:</span>
                  <span className="text-[#4b9e78] font-bold flex items-center gap-1.5 font-mono">
                    <Clock className="w-4 h-4" />
                    <span>{selectedIncident.slaRemaining}</span>
                  </span>
                </div>
              </div>

              {selectedIncident.isHotspot && (
                <div className="p-3.5 rounded-xl bg-[#373224] border border-[#6b5c3e] text-[#d4c19a] text-sm flex items-center gap-2.5">
                  <Flame className="w-5 h-5 shrink-0 text-[#d8a155]" />
                  <span className="leading-relaxed">দীর্ঘস্থায়ী হটস্পট: এই এলাকায় সাম্প্রতিককালে একাধিক সমস্যার পুনরাবৃত্তি চিহ্নিত হয়েছে।</span>
                </div>
              )}

              <div className="pt-2 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => handleFlyToIncident(selectedIncident)}
                  className="w-full py-3 rounded-xl bg-[var(--paper)] hover:bg-[var(--green-light)] text-[var(--ink)] border border-[var(--line)] text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <MapPin className="w-4 h-4 text-[var(--gold)]" />
                  <span>মানচিত্রে ফোকাস করুন</span>
                </button>

                <Link
                  to={`/cases/${selectedIncident.id}`}
                  className="w-full py-3.5 rounded-xl bg-[#d4c19a] hover:bg-[#ebd8b1] text-[#0d100e] font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-lg active:scale-95"
                >
                  <Eye className="w-4.5 h-4.5" />
                  <span>সম্পূর্ণ টাইমলাইন ও সমাধান প্রমাণ</span>
                  <ArrowRight className="w-4.5 h-4.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl p-10 text-center text-[#a7b0a8] bg-[#151a16] border border-[#343d34] space-y-2">
              <MapPin className="w-10 h-10 mx-auto text-[#708379] mb-2" />
              <p className="text-sm font-semibold">মানচিত্রে কোনো পিনে ক্লিক করে বিস্তারিত তথ্য দেখুন</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
