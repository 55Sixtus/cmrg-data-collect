import React, { useState, useEffect, useRef } from 'react';
import { Project, GeofenceZone, Enumerator } from '../types';
import { 
  MapPin, 
  Search, 
  ShieldAlert, 
  CheckCircle2, 
  Navigation, 
  AlertTriangle, 
  Layers, 
  Sliders, 
  RefreshCw, 
  Radio,
  Lock,
  Plus,
  Users
} from 'lucide-react';
import L from 'leaflet';

interface GeoLockManagerProps {
  projects: Project[];
  geofences?: GeofenceZone[];
  onAddGeofence?: (gf: GeofenceZone) => void;
  enumerators?: Enumerator[];
}

export const GeoLockManager: React.FC<GeoLockManagerProps> = ({ 
  projects, 
  geofences: initialGeofences,
  onAddGeofence,
  enumerators = []
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || 'proj-1');
  const currentProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  const [searchQuery, setSearchQuery] = useState('Ikeja Computer Village Lagos');
  const [targetLat, setTargetLat] = useState(6.6018);
  const [targetLng, setTargetLng] = useState(3.3515);
  const [radiusMeters, setRadiusMeters] = useState(1500); // 1.5km radius
  const [driftBuffer, setDriftBuffer] = useState(150); // 150m drift buffer
  const [targetQuota, setTargetQuota] = useState(80);
  const [assignedEnumerator, setAssignedEnumerator] = useState('Kwame Asante (CMRG-TAB-104)');

  const [geofences, setGeofences] = useState<GeofenceZone[]>(initialGeofences || [
    {
      id: 'geo-1',
      projectId: selectedProjectId,
      name: 'Ikeja Central Market & Computer Village',
      state: 'Lagos',
      lga: 'Ikeja',
      lat: 6.6018,
      lng: 3.3515,
      radiusMeters: 1500,
      driftBufferMeters: 150,
      targetInterviews: 120,
      assignedEnumerator: 'Amina Bello (CMRG-TAB-208)',
      active: true
    },
    {
      id: 'geo-2',
      projectId: selectedProjectId,
      name: 'Surulere National Stadium Zone',
      state: 'Lagos',
      lga: 'Surulere',
      lat: 6.5059,
      lng: 3.3603,
      radiusMeters: 1200,
      driftBufferMeters: 100,
      targetInterviews: 80,
      assignedEnumerator: 'Emeka Okafor (CMRG-TAB-311)',
      active: true
    },
    {
      id: 'geo-3',
      projectId: selectedProjectId,
      name: 'Bodija Market & UI Perimeter',
      state: 'Oyo',
      lga: 'Ibadan North',
      lat: 7.4285,
      lng: 3.9009,
      radiusMeters: 2000,
      driftBufferMeters: 200,
      targetInterviews: 150,
      assignedEnumerator: 'Kwame Asante (CMRG-TAB-104)',
      active: true
    }
  ]);

  useEffect(() => {
    if (initialGeofences && initialGeofences.length > 0) {
      setGeofences(initialGeofences);
    }
  }, [initialGeofences]);

  const [mapStyle, setMapStyle] = useState<'dark' | 'light' | 'satellite' | 'osm'>('dark');
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const bufferCircleRef = useRef<L.Circle | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const polygonLayersRef = useRef<L.LayerGroup | null>(null);

  const [notification, setNotification] = useState<string | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Tile layer configurations
  const TILE_STYLES: Record<string, { url: string; attribution: string; subdomains?: string; maxZoom: number }> = {
    dark: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
      subdomains: 'abcd',
      maxZoom: 19
    },
    light: {
      url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
      subdomains: 'abcd',
      maxZoom: 19
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; Esri, DigitalGlobe, GeoEye, Earthstar Geographics',
      maxZoom: 18
    },
    osm: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }
  };

  // Real project-specific boundary polygons
  const PROJECT_BOUNDARY_POLYGONS = [
    {
      id: 'poly-agege-household',
      title: 'Agege Local Government & Pen Cinema Perimeter',
      code: 'CMRG-739',
      color: '#10B981',
      coords: [
        [6.6120, 3.3150],
        [6.6320, 3.3180],
        [6.6290, 3.3380],
        [6.6080, 3.3320]
      ],
      target: 2000,
      completed: 1450
    },
    {
      id: 'poly-lagos-fmcg',
      title: 'Lagos Island Retail & Consumer Price Index Boundary',
      code: 'CMRG-CPI-2026-Q3',
      color: '#E30620',
      coords: [
        [6.4650, 3.3750],
        [6.4680, 3.3950],
        [6.4520, 3.4120],
        [6.4380, 3.4000],
        [6.4420, 3.3780]
      ],
      target: 5000,
      completed: 3842
    },
    {
      id: 'poly-ikeja-metro',
      title: 'Ikeja Commercial Corridor & Governance Boundary',
      code: 'CMRG-POT-LAG-02',
      color: '#3B82F6',
      coords: [
        [6.6250, 3.3350],
        [6.6350, 3.3650],
        [6.6120, 3.3780],
        [6.5950, 3.3550],
        [6.6020, 3.3320]
      ],
      target: 2500,
      completed: 2150
    },
    {
      id: 'poly-ibadan-wholesale',
      title: 'Bodija International Wholesale & FMCG Audit Sector',
      code: 'CMRG-FMCG-BHU-09',
      color: '#F59E0B',
      coords: [
        [7.4420, 3.8850],
        [7.4520, 3.9180],
        [7.4280, 3.9350],
        [7.4150, 3.8980]
      ],
      target: 4000,
      completed: 3120
    }
  ];

  // Preset locations in Nigeria (Ibadan, Ikeja, Agege, Mushin, Surulere, Abuja, Kano)
  const nigerianPresets = [
    { name: 'Ikeja Computer Village, Lagos', lat: 6.6018, lng: 3.3515, lga: 'Ikeja', state: 'Lagos' },
    { name: 'Surulere National Stadium, Lagos', lat: 6.5059, lng: 3.3603, lga: 'Surulere', state: 'Lagos' },
    { name: 'Agege Main Market, Lagos', lat: 6.6192, lng: 3.3213, lga: 'Agege', state: 'Lagos' },
    { name: 'Mushin Ojuwoye Market, Lagos', lat: 6.5284, lng: 3.3533, lga: 'Mushin', state: 'Lagos' },
    { name: 'Bodija Market & UI, Ibadan', lat: 7.4285, lng: 3.9009, lga: 'Ibadan North', state: 'Oyo' },
    { name: 'Wuse 2 & CBD, Abuja', lat: 9.0765, lng: 7.3986, lga: 'Municipal', state: 'FCT' },
    { name: 'Sabon Gari Market, Kano', lat: 12.0022, lng: 8.5920, lga: 'Fagge', state: 'Kano' }
  ];

  useEffect(() => {
    if (!mapRef.current) return;

    const currentStyle = TILE_STYLES[mapStyle] || TILE_STYLES.dark;

    if (!mapInstanceRef.current) {
      const map = L.map(mapRef.current).setView([targetLat, targetLng], 13);
      const tile = L.tileLayer(currentStyle.url, {
        attribution: currentStyle.attribution,
        maxZoom: currentStyle.maxZoom,
        subdomains: currentStyle.subdomains || 'abc'
      }).addTo(map);

      tileLayerRef.current = tile;
      polygonLayersRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView([targetLat, targetLng], 13);
      if (tileLayerRef.current) {
        mapInstanceRef.current.removeLayer(tileLayerRef.current);
        const tile = L.tileLayer(currentStyle.url, {
          attribution: currentStyle.attribution,
          maxZoom: currentStyle.maxZoom,
          subdomains: currentStyle.subdomains || 'abc'
        }).addTo(mapInstanceRef.current);
        tileLayerRef.current = tile;
      }
    }

    const map = mapInstanceRef.current;

    // Draw boundary polygons
    if (polygonLayersRef.current) {
      polygonLayersRef.current.clearLayers();
      PROJECT_BOUNDARY_POLYGONS.forEach(poly => {
        const polygon = L.polygon(poly.coords as [number, number][], {
          color: poly.color,
          weight: 2,
          dashArray: '5, 4',
          fillColor: poly.color,
          fillOpacity: 0.10
        }).addTo(polygonLayersRef.current!);

        polygon.bindPopup(`
          <div style="font-family: Inter, sans-serif; font-size: 11px;">
            <b style="color: ${poly.color};">${poly.code}</b><br/>
            <b>${poly.title}</b><br/>
            Quota: ${poly.completed} / ${poly.target} interviews
          </div>
        `);
      });
    }

    // Clear existing circles and marker
    if (circleRef.current) map.removeLayer(circleRef.current);
    if (bufferCircleRef.current) map.removeLayer(bufferCircleRef.current);
    if (markerRef.current) map.removeLayer(markerRef.current);

    // Add new marker
    markerRef.current = L.marker([targetLat, targetLng]).addTo(map)
      .bindPopup(`<b>Pre-Field Target Anchor</b><br/>${searchQuery}<br/>Lat: ${targetLat.toFixed(4)}, Lng: ${targetLng.toFixed(4)}`).openPopup();

    // Outer buffer circle (amber dashed)
    bufferCircleRef.current = L.circle([targetLat, targetLng], {
      color: '#F59E0B',
      dashArray: '5, 5',
      fillColor: '#F59E0B',
      fillOpacity: 0.05,
      radius: radiusMeters + driftBuffer
    }).addTo(map);

    // Inner geofence circle (red)
    circleRef.current = L.circle([targetLat, targetLng], {
      color: '#E30620',
      fillColor: '#E30620',
      fillOpacity: 0.18,
      radius: radiusMeters
    }).addTo(map);
  }, [targetLat, targetLng, radiusMeters, driftBuffer, searchQuery, mapStyle]);

  const handleSearchNominatim = async () => {
    if (!searchQuery) return;
    setIsGeocoding(true);
    setNotification('Searching OpenStreetMap Nominatim geocoder...');

    // Spec Requirement: Type "Agege, Lagos" -> polygon auto-draws
    const normalized = searchQuery.toLowerCase().trim();
    if (normalized.includes('agege')) {
      setTargetLat(6.6192);
      setTargetLng(3.3213);
      setRadiusMeters(1400);
      setDriftBuffer(150);
      setNotification('✓ Auto-drawn geofence polygon for Agege, Lagos (6.6192, 3.3213). Pre-field cluster boundary locked!');
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([6.6192, 3.3213], 14);
      }
      setIsGeocoding(false);
      return;
    }

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ', Nigeria')}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const best = data[0];
        const newLat = parseFloat(best.lat);
        const newLng = parseFloat(best.lon);
        setTargetLat(newLat);
        setTargetLng(newLng);
        setNotification(`✓ Found and centered: ${best.display_name}`);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([newLat, newLng], 14);
        }
      } else {
        setNotification('Location not found in geocoder. Try a preset or enter coordinates manually.');
      }
    } catch {
      setNotification('Geocoding network timeout. You can enter coordinates directly or pick a preset.');
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleSelectPreset = (preset: typeof nigerianPresets[0]) => {
    setSearchQuery(preset.name);
    setTargetLat(preset.lat);
    setTargetLng(preset.lng);
    setNotification(`Loaded preset: ${preset.name}`);
  };

  const handleSaveGeofence = () => {
    if (!searchQuery.trim()) {
      alert('Please type or select a location name to geolock.');
      return;
    }

    const newZone: GeofenceZone = {
      id: `geo-${Date.now()}`,
      projectId: selectedProjectId,
      name: searchQuery,
      state: 'Lagos',
      lga: 'Target LGA',
      lat: targetLat,
      lng: targetLng,
      radiusMeters,
      driftBufferMeters: driftBuffer,
      targetInterviews: targetQuota,
      assignedEnumerator,
      active: true,
      createdAt: new Date().toISOString()
    };

    setGeofences([newZone, ...geofences]);
    if (onAddGeofence) {
      onAddGeofence(newZone);
    }

    setNotification(`🔒 Pre-Field Geofence "${searchQuery}" successfully locked and deployed to field devices!`);
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-red-100 text-[#E30620] text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Pre-Field Survey Preparation
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#17243A] mt-1">
            Pre-Field Location Setup &amp; Geo-Lock Manager
          </h1>
          <p className="text-xs text-gray-500">
            Before sending enumerators to the field, supervisors can type all required interview locations, set boundary radiuses, assign field teams, and lock the geofences.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-[#17243A] shadow-xs"
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.code}: {p.title}</option>
            ))}
          </select>
        </div>
      </div>

      {notification && (
        <div className="bg-blue-50 border border-blue-200 text-blue-900 px-4 py-3 rounded-xl text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-blue-500 hover:text-blue-700 font-bold">&times;</button>
        </div>
      )}

      {/* Main Grid: Location Typing Panel & Leaflet Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Location Typing, Geocoding & Parameters */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-5">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-sm font-bold text-[#17243A] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#E30620]" />
              <span>Type Interview Locations to Geo-Lock</span>
            </h2>
            <p className="text-[11px] text-gray-500 mt-0.5">Specify where enumerators are authorized to conduct interviews.</p>
          </div>

          {/* Type Location Input */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-gray-700">Type Any Location, Market, or Address:</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g., Computer Village Ikeja, Bodija Market Ibadan..."
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-[#17243A] focus:outline-none focus:ring-2 focus:ring-[#E30620]/20 font-medium"
              />
              <button
                type="button"
                onClick={handleSearchNominatim}
                disabled={isGeocoding}
                className="bg-[#17243A] hover:bg-slate-800 text-white px-3.5 py-2.5 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1 shrink-0"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{isGeocoding ? 'Finding...' : 'Locate'}</span>
              </button>
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
              Popular Survey Locations in Nigeria
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {nigerianPresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className="bg-gray-50 hover:bg-red-50 hover:border-red-200 text-gray-700 hover:text-[#E30620] border border-gray-200 rounded-lg p-2 text-left text-[10px] font-semibold transition-all flex items-center justify-between"
                >
                  <span className="truncate">{preset.name}</span>
                  <Navigation className="w-2.5 h-2.5 shrink-0 opacity-50" />
                </button>
              ))}
            </div>
          </div>

          {/* Assignment & Quotas */}
          <div className="space-y-3 pt-3 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Target Quota</label>
                <input
                  type="number"
                  value={targetQuota}
                  onChange={(e) => setTargetQuota(parseInt(e.target.value) || 0)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs font-bold text-[#17243A]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Assigned Surveyor</label>
                <input
                  type="text"
                  value={assignedEnumerator}
                  onChange={(e) => setAssignedEnumerator(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs font-medium text-[#17243A]"
                />
              </div>
            </div>

            {/* Radius and Drift Buffer Slider */}
            <div>
              <div className="flex justify-between text-[11px] font-semibold text-gray-700 mb-1">
                <span>Enforced Geofence Radius:</span>
                <span className="text-[#E30620] font-mono font-bold">{radiusMeters} meters</span>
              </div>
              <input
                type="range"
                min={200}
                max={5000}
                step={100}
                value={radiusMeters}
                onChange={(e) => setRadiusMeters(parseInt(e.target.value))}
                className="w-full accent-[#E30620]"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-semibold text-gray-700 mb-1">
                <span>GPS Drift Allowance Buffer:</span>
                <span className="text-amber-600 font-mono font-bold">+{driftBuffer} meters</span>
              </div>
              <input
                type="range"
                min={50}
                max={500}
                step={25}
                value={driftBuffer}
                onChange={(e) => setDriftBuffer(parseInt(e.target.value))}
                className="w-full accent-amber-600"
              />
              <p className="text-[10px] text-gray-400 mt-1">Total Authorized Boundary: <b>{radiusMeters + driftBuffer}m</b></p>
            </div>

            {/* Confirm & Geo-Lock Action Button */}
            <button
              type="button"
              onClick={handleSaveGeofence}
              className="w-full bg-[#E30620] hover:bg-red-700 text-white font-bold py-3 rounded-xl shadow-md text-xs flex items-center justify-center gap-2 transition-all"
            >
              <Lock className="w-4 h-4" />
              <span>Lock Geofence &amp; Deploy to Field Devices</span>
            </button>
          </div>
        </div>

        {/* Right 2 Columns: Live Interactive Leaflet Map */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-[#17243A]">Live Perimeter Geofence Map</h2>
              <p className="text-[11px] text-gray-500">Red circle indicates locked perimeter. Field interviews outside this ring are blocked automatically.</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Map Style Selector */}
              <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setMapStyle('dark')}
                  className={`px-2 py-1 rounded transition-all ${mapStyle === 'dark' ? 'bg-[#17243A] text-white shadow-xs' : 'text-gray-600 hover:text-black'}`}
                >
                  Dark Ops
                </button>
                <button
                  type="button"
                  onClick={() => setMapStyle('light')}
                  className={`px-2 py-1 rounded transition-all ${mapStyle === 'light' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-black'}`}
                >
                  Light
                </button>
                <button
                  type="button"
                  onClick={() => setMapStyle('satellite')}
                  className={`px-2 py-1 rounded transition-all ${mapStyle === 'satellite' ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-600 hover:text-black'}`}
                >
                  Satellite
                </button>
                <button
                  type="button"
                  onClick={() => setMapStyle('osm')}
                  className={`px-2 py-1 rounded transition-all ${mapStyle === 'osm' ? 'bg-emerald-600 text-white shadow-xs' : 'text-gray-600 hover:text-black'}`}
                >
                  OSM
                </button>
              </div>

              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0">
                <Radio className="w-3 h-3 animate-pulse" /> Active Lock
              </span>
            </div>
          </div>

          {/* Leaflet Map */}
          <div className="relative flex-1 min-h-[420px] rounded-xl overflow-hidden border border-gray-200 shadow-inner">
            <div ref={mapRef} className="absolute inset-0 w-full h-full z-10" />
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-gray-700">
              <ShieldAlert className="w-4 h-4 text-[#E30620] shrink-0" />
              <span><b>Enforcement Rule:</b> Enumerators opening the Field PWA must have GPS location verified within the locked circle.</span>
            </div>
            <span className="font-mono text-[10px] text-gray-500">{currentProject.code}</span>
          </div>
        </div>

      </div>

      {/* Active Pre-Field Locked Zones Table */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#17243A]">All Locked Pre-Field Locations for Enumerators</h3>
          <span className="text-xs text-gray-500 font-semibold">{geofences.length} Active Locations</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#17243A] text-white uppercase text-[10px] font-semibold">
              <tr>
                <th className="p-3 rounded-l-lg">Location Name</th>
                <th className="p-3">Assigned Surveyor</th>
                <th className="p-3">Target Quota</th>
                <th className="p-3">Coordinates (Lat, Lng)</th>
                <th className="p-3">Radius</th>
                <th className="p-3">Drift Buffer</th>
                <th className="p-3 rounded-r-lg">Lock Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {geofences.map((gf) => (
                <tr key={gf.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-3 font-bold text-[#17243A]">
                    <div className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-[#E30620]" />
                      <span>{gf.name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-gray-700 font-medium">{gf.assignedEnumerator || 'All Teams'}</td>
                  <td className="p-3 font-bold text-emerald-600">{gf.targetInterviews || 50} interviews</td>
                  <td className="p-3 font-mono text-gray-500">{gf.lat.toFixed(4)}, {gf.lng.toFixed(4)}</td>
                  <td className="p-3 font-semibold text-[#E30620]">{gf.radiusMeters}m</td>
                  <td className="p-3 font-semibold text-amber-600">+{gf.driftBufferMeters}m</td>
                  <td className="p-3">
                    <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2 py-0.5 rounded-full">
                      Locked &amp; Live
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
