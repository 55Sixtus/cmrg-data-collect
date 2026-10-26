import React, { useState, useEffect, useRef } from 'react';
import { Project } from '../types';
import { MapPin, Search, ShieldAlert, CheckCircle2, Navigation, AlertTriangle, Layers, Sliders, RefreshCw, Radio } from 'lucide-react';
import L from 'leaflet';

interface GeoLockManagerProps {
  projects: Project[];
}

interface GeofenceZone {
  id: string;
  projectId: string;
  name: string;
  state: string;
  lga: string;
  lat: number;
  lng: number;
  radiusMeters: number;
  driftBufferMeters: number;
  active: boolean;
}

export const GeoLockManager: React.FC<GeoLockManagerProps> = ({ projects }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || 'proj-1');
  const currentProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  const [searchQuery, setSearchQuery] = useState('Ikeja Lagos');
  const [targetLat, setTargetLat] = useState(6.5244);
  const [targetLng, setTargetLng] = useState(3.3792);
  const [radiusMeters, setRadiusMeters] = useState(1000); // 1km radius
  const [driftBuffer, setDriftBuffer] = useState(100); // 100m drift buffer
  const [geofences, setGeofences] = useState<GeofenceZone[]>([
    {
      id: 'geo-1',
      projectId: selectedProjectId,
      name: 'Ikeja Central Market & Business District',
      state: 'Lagos',
      lga: 'Ikeja',
      lat: 6.6018,
      lng: 3.3515,
      radiusMeters: 1500,
      driftBufferMeters: 150,
      active: true
    },
    {
      id: 'geo-2',
      projectId: selectedProjectId,
      name: 'Ibadan Bodija & UI Perimeter',
      state: 'Oyo',
      lga: 'Ibadan North',
      lat: 7.4285,
      lng: 3.9009,
      radiusMeters: 2000,
      driftBufferMeters: 200,
      active: true
    },
    {
      id: 'geo-3',
      projectId: selectedProjectId,
      name: 'Surulere National Stadium Zone',
      state: 'Lagos',
      lga: 'Surulere',
      lat: 6.5059,
      lng: 3.3603,
      radiusMeters: 1200,
      driftBufferMeters: 100,
      active: true
    }
  ]);

  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [notification, setNotification] = useState<string | null>(null);

  // Preset locations in Nigeria as requested (Ibadan, Ikeja, Agege, Mushin, Surulere)
  const nigerianPresets = [
    { name: 'Ikeja, Lagos', lat: 6.6018, lng: 3.3515, lga: 'Ikeja', state: 'Lagos' },
    { name: 'Surulere, Lagos', lat: 6.5059, lng: 3.3603, lga: 'Surulere', state: 'Lagos' },
    { name: 'Agege, Lagos', lat: 6.6192, lng: 3.3213, lga: 'Agege', state: 'Lagos' },
    { name: 'Mushin, Lagos', lat: 6.5284, lng: 3.3533, lga: 'Mushin', state: 'Lagos' },
    { name: 'Ibadan, Oyo', lat: 7.3775, lng: 3.9470, lga: 'Ibadan North', state: 'Oyo' }
  ];

  useEffect(() => {
    if (!mapRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapRef.current).setView([targetLat, targetLng], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView([targetLat, targetLng], 13);
    }

    const map = mapInstanceRef.current;

    // Clear existing circle and marker
    if (circleRef.current) {
      map.removeLayer(circleRef.current);
    }
    if (markerRef.current) {
      map.removeLayer(markerRef.current);
    }

    // Add new marker and geofence circle
    markerRef.current = L.marker([targetLat, targetLng]).addTo(map)
      .bindPopup(`<b>Geo-Lock Anchor</b><br/>Lat: ${targetLat}, Lng: ${targetLng}`).openPopup();

    circleRef.current = L.circle([targetLat, targetLng], {
      color: '#C8202F',
      fillColor: '#C8202F',
      fillOpacity: 0.15,
      radius: radiusMeters + driftBuffer
    }).addTo(map);

    return () => {
      // Cleanup handled on re-init
    };
  }, [targetLat, targetLng, radiusMeters, driftBuffer]);

  const handleSearchNominatim = async () => {
    if (!searchQuery) return;
    try {
      setNotification('Searching OpenStreetMap Nominatim geocoder...');
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ', Nigeria')}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const best = data[0];
        const newLat = parseFloat(best.lat);
        const newLng = parseFloat(best.lon);
        setTargetLat(newLat);
        setTargetLng(newLng);
        setNotification(`Found: ${best.display_name}`);
      } else {
        setNotification('Location not found in geocoder. Try a preset or coordinate.');
      }
    } catch (err) {
      setNotification('Geocoding network error. Using preset coordinates.');
    }
  };

  const handleSelectPreset = (preset: typeof nigerianPresets[0]) => {
    setSearchQuery(preset.name);
    setTargetLat(preset.lat);
    setTargetLng(preset.lng);
    setNotification(`Loaded preset: ${preset.name}`);
  };

  const handleSaveGeofence = () => {
    const newZone: GeofenceZone = {
      id: `geo-${Date.now()}`,
      projectId: selectedProjectId,
      name: searchQuery || 'Custom Field Zone',
      state: 'Lagos/Oyo',
      lga: 'Target LGA',
      lat: targetLat,
      lng: targetLng,
      radiusMeters,
      driftBufferMeters: driftBuffer,
      active: true
    };
    setGeofences([newZone, ...geofences]);
    setNotification('Geo-fence successfully deployed and locked to project database!');
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-red-100 text-[#C8202F] text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">Phase 2.3 Geo-Lock Manager</span>
          </div>
          <h1 className="text-xl font-bold text-[#17243A] mt-1">GPS Geofencing, Boundary Control & Supervisor Overrides</h1>
          <p className="text-xs text-gray-500">Configure strict GPS geofences, accuracy drift buffers (50m - 500m), and real-time validation for field submissions.</p>
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
            <ShieldAlert className="w-4 h-4 text-blue-600" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-blue-500 hover:text-blue-700 font-bold">&times;</button>
        </div>
      )}

      {/* Main Grid: Map & Configuration Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Search & Parameters */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-5">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-sm font-bold text-[#17243A] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#C8202F]" />
              <span>Location Search & Target Geofence</span>
            </h2>
          </div>

          {/* Quick Presets */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-2">Nigerian City Presets (Ibadan, Ikeja, Agege, Mushin, Surulere)</label>
            <div className="grid grid-cols-2 gap-2">
              {nigerianPresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className="bg-gray-50 hover:bg-red-50 hover:border-red-200 text-gray-700 hover:text-[#C8202F] border border-gray-200 rounded-xl p-2 text-left text-[11px] font-semibold transition-all flex items-center justify-between"
                >
                  <span className="truncate">{preset.name}</span>
                  <Navigation className="w-3 h-3 shrink-0 opacity-60" />
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="space-y-2">
            <label className="block text-[11px] font-semibold text-gray-600">Custom Search (OpenStreetMap Nominatim)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g., Victoria Island Lagos"
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-[#17243A] focus:outline-none focus:ring-2 focus:ring-[#C8202F]/20"
              />
              <button
                type="button"
                onClick={handleSearchNominatim}
                className="bg-[#17243A] hover:bg-slate-800 text-white px-3 py-2.5 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search</span>
              </button>
            </div>
          </div>

          {/* Coordinates & Radius Settings */}
          <div className="space-y-4 pt-2 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={targetLat}
                  onChange={(e) => setTargetLat(parseFloat(e.target.value) || 0)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs font-mono text-[#17243A]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={targetLng}
                  onChange={(e) => setTargetLng(parseFloat(e.target.value) || 0)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs font-mono text-[#17243A]"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-semibold text-gray-700 mb-1">
                <span>Geofence Radius:</span>
                <span className="text-[#C8202F] font-mono">{radiusMeters} meters</span>
              </div>
              <input
                type="range"
                min={200}
                max={5000}
                step={100}
                value={radiusMeters}
                onChange={(e) => setRadiusMeters(parseInt(e.target.value))}
                className="w-full accent-[#C8202F]"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-semibold text-gray-700 mb-1">
                <span>GPS Drift Buffer (Accuracy Allowance):</span>
                <span className="text-amber-600 font-mono">{driftBuffer} meters</span>
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
              <p className="text-[10px] text-gray-400 mt-1">Allows for urban satellite bounce and canopy signal attenuation without triggering flag.</p>
            </div>

            <button
              type="button"
              onClick={handleSaveGeofence}
              className="w-full bg-[#C8202F] hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl shadow-md text-xs flex items-center justify-center gap-2 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Deploy & Save Geofence Zone</span>
            </button>
          </div>
        </div>

        {/* Right 2 Columns: Interactive Map View */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-[#17243A]">Live Interactive Map & Perimeter Geofence</h2>
              <p className="text-[11px] text-gray-500">Red circle indicates enforced boundary zone for survey submission authorization.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Radio className="w-3 h-3 animate-pulse" /> Active Lock
              </span>
            </div>
          </div>

          {/* Leaflet Map Container */}
          <div className="relative flex-1 min-h-[420px] rounded-xl overflow-hidden border border-gray-200 shadow-inner">
            <div ref={mapRef} className="absolute inset-0 w-full h-full z-10" />
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-gray-700">
              <ShieldAlert className="w-4 h-4 text-[#C8202F]" />
              <span>Enforcement Rule: Submissions outside geofence + drift buffer require <b>Supervisor Override</b>.</span>
            </div>
            <span className="font-mono text-[10px] text-gray-500">{currentProject.code}</span>
          </div>
        </div>
      </div>

      {/* Active Geofence Zones Table */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#17243A]">Active Project Geofences & Assigned Perimeters</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#17243A] text-white uppercase text-[10px] font-semibold">
              <tr>
                <th className="p-3 rounded-l-lg">Zone Name</th>
                <th className="p-3">State / LGA</th>
                <th className="p-3">Coordinates (Lat, Lng)</th>
                <th className="p-3">Radius</th>
                <th className="p-3">Drift Buffer</th>
                <th className="p-3 rounded-r-lg">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {geofences.map((gf) => (
                <tr key={gf.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-3 font-bold text-[#17243A]">{gf.name}</td>
                  <td className="p-3 text-gray-600">{gf.state} ({gf.lga})</td>
                  <td className="p-3 font-mono text-gray-500">{gf.lat}, {gf.lng}</td>
                  <td className="p-3 font-semibold text-[#C8202F]">{gf.radiusMeters}m</td>
                  <td className="p-3 font-semibold text-amber-600">{gf.driftBufferMeters}m</td>
                  <td className="p-3">
                    <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2 py-0.5 rounded-full">
                      Active
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
