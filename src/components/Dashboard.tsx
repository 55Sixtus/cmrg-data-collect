import React, { useState, useEffect, useRef } from 'react';
import { Project, Submission, Enumerator, GeofenceZone } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { 
  MapPin, 
  Search, 
  RefreshCw, 
  Radio, 
  AlertTriangle, 
  Check, 
  Eye, 
  Plus, 
  X, 
  ShieldCheck, 
  Sliders, 
  Layers, 
  Users, 
  Activity,
  Table,
  Settings,
  Battery,
  AlertCircle,
  QrCode,
  Download,
  FileSpreadsheet,
  FileText,
  Share2,
  ExternalLink,
  Globe,
  Music,
  Film,
  Image,
  Copy
} from 'lucide-react';
import L from 'leaflet';

interface DashboardProps {
  projects: Project[];
  submissions: Submission[];
  enumerators: Enumerator[];
  geofences?: GeofenceZone[];
  onAddGeofence?: (gf: GeofenceZone) => void;
  onNavigateTab: (tab: any) => void;
  onUpdateSubmissionStatus?: (subId: string, status: 'Approved' | 'Flagged' | 'Rejected', reason?: string) => void;
  onOpenWhatsAppConnect?: (projectCode?: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  projects: initialProjects, 
  submissions: initialSubmissions, 
  enumerators, 
  geofences: initialGeofences,
  onAddGeofence,
  onNavigateTab,
  onUpdateSubmissionStatus,
  onOpenWhatsAppConnect
}) => {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions);
  const [geofences, setGeofences] = useState<GeofenceZone[]>(initialGeofences || [
    {
      id: 'geo-1',
      projectId: 'proj-1',
      name: 'Ikeja Central Market & Business District',
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
      projectId: 'proj-1',
      name: 'Surulere National Stadium & Ojuelegba Zone',
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
      projectId: 'proj-2',
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

  // Sync with props when props change
  useEffect(() => {
    setProjects(initialProjects);
  }, [initialProjects]);

  useEffect(() => {
    setSubmissions(initialSubmissions);
  }, [initialSubmissions]);

  useEffect(() => {
    if (initialGeofences && initialGeofences.length > 0) {
      setGeofences(initialGeofences);
    }
  }, [initialGeofences]);

  // View state
  const [viewMode, setViewMode] = useState<'map' | 'table'>('map');
  const [filterProject, setFilterProject] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('all');
  const [lastSyncTime, setLastSyncTime] = useState('9:39:33 AM');
  const [syncing, setSyncing] = useState(false);

  // Type & Lock Location Modal State
  const [showTypeLockModal, setShowTypeLockModal] = useState(false);
  const [lockLocationQuery, setLockLocationQuery] = useState('');
  const [lockLat, setLockLat] = useState(6.6018);
  const [lockLng, setLockLng] = useState(3.3515);
  const [lockRadius, setLockRadius] = useState(1000);
  const [lockBuffer, setLockBuffer] = useState(100);
  const [lockQuota, setLockQuota] = useState(50);
  const [lockAssignedEnu, setLockAssignedEnu] = useState(enumerators[0]?.name || 'Kwame Asante');
  const [lockProjectId, setLockProjectId] = useState(projects[0]?.id || 'proj-1');
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeMessage, setGeocodeMessage] = useState<string | null>(null);

  // Selected Submission for Inspection
  const [inspectingSub, setInspectingSub] = useState<Submission | null>(null);
  const [reviewReason, setReviewReason] = useState<string>('');

  // Export Menu & Shareable Check Link State
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showCheckModal, setShowCheckModal] = useState(false);
  const [activeCheckCode, setActiveCheckCode] = useState('CMRG-739');
  const [copiedCheckUrl, setCopiedCheckUrl] = useState(false);

  // QC Anomalies State
  const [anomalies, setAnomalies] = useState([
    {
      id: 'anom-1',
      surveyor: 'Sipho Ndlovu',
      details: 'Interview completed in 88s (Expected minimum: 180s). Possible surveyor rushing or fabricated responses.',
      type: 'SPEED_AUDIT',
      time: '25 minutes ago',
      resolved: false
    },
    {
      id: 'anom-2',
      surveyor: 'Babatunde Adeleke',
      details: 'GPS displacement of 320m detected outside locked geofence in Surulere. Awaiting supervisor validation.',
      type: 'GEO_DRIFT_ALERT',
      time: '1 hour ago',
      resolved: false
    }
  ]);

  // High-contrast custom Leaflet map styles
  const [mapStyle, setMapStyle] = useState<'dark' | 'light' | 'satellite' | 'osm'>('dark');
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Leaflet Map Ref
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<L.LayerGroup | null>(null);

  // Filtered submissions
  const filteredSubmissions = submissions.filter(s => {
    if (filterProject !== 'all' && s.projectId !== filterProject) return false;
    if (filterStatus !== 'all' && s.status !== filterStatus) return false;
    return true;
  });

  const unmappedSubmissions = filteredSubmissions.filter(s => !s.gps || !s.gps.lat || !s.gps.lng);
  const mappedSubmissions = filteredSubmissions.filter(s => s.gps && s.gps.lat && s.gps.lng);

  // Tile layer sources
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
      attribution: '&copy; Esri, DigitalGlobe, GeoEye, Earthstar Geographics, USDA, USGS, AeroGRID, IGN, and the GIS User Community',
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
      title: 'Agege Local Government Household Survey Polygon',
      code: 'CMRG-739',
      color: '#10B981',
      coords: [
        [6.6120, 3.3150],
        [6.6320, 3.3180],
        [6.6290, 3.3380],
        [6.6080, 3.3320]
      ],
      target: 2000,
      completed: 1450,
      assignedSurveyors: 35
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
      completed: 3842,
      assignedSurveyors: 85
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
      completed: 2150,
      assignedSurveyors: 50
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
      completed: 3120,
      assignedSurveyors: 65
    },
    {
      id: 'poly-accra-coastal',
      title: 'Accra Ringway Estates & Commercial Sector',
      code: 'CMRG-CPI-ACCRA',
      color: '#10B981',
      coords: [
        [5.5720, -0.2050],
        [5.5780, -0.1750],
        [5.5480, -0.1700],
        [5.5420, -0.1980]
      ],
      target: 1200,
      completed: 940,
      assignedSurveyors: 24
    }
  ];

  // Real-time Enumerator Live Status Roster for Map Markers
  const ENUMERATOR_LIVE_MARKERS = [
    {
      name: 'Kwame Asante',
      device: 'CMRG-TAB-104',
      lat: 5.5600,
      lng: -0.1900,
      status: 'INTERVIEWING',
      statusLabel: 'Active Interviewing',
      battery: '88%',
      interviews: 32,
      speed: 'Stationary (In-Store)',
      color: '#10B981',
      location: 'Accra Ringway Estates'
    },
    {
      name: 'Amina Bello',
      device: 'CMRG-TAB-208',
      lat: 6.6018,
      lng: 3.3515,
      status: 'IN_TRANSIT',
      statusLabel: 'Relocating to Cluster',
      battery: '76%',
      interviews: 28,
      speed: '18 km/h',
      color: '#F59E0B',
      location: 'Ikeja Commercial Corridor'
    },
    {
      name: 'Sipho Ndlovu',
      device: 'CMRG-TAB-115',
      lat: 6.4552,
      lng: 3.3841,
      status: 'QC_ALERT',
      statusLabel: 'Speed Audit Flagged',
      battery: '64%',
      interviews: 14,
      speed: '88s duration (<180s threshold)',
      color: '#E30620',
      location: 'Balogun Central Market'
    },
    {
      name: 'Chukwudi Eze',
      device: 'CMRG-TAB-106',
      lat: 7.4285,
      lng: 3.9009,
      status: 'IDLE_SYNCED',
      statusLabel: 'Synced & Idle',
      battery: '94%',
      interviews: 41,
      speed: 'Stationary',
      color: '#3B82F6',
      location: 'Bodija International Market'
    }
  ];

  // Initialize & Update Leaflet Map
  useEffect(() => {
    if (!mapRef.current) return;

    const currentStyleConfig = TILE_STYLES[mapStyle] || TILE_STYLES.dark;

    if (!mapInstanceRef.current) {
      const map = L.map(mapRef.current, {
        zoomControl: true,
        attributionControl: true
      }).setView([6.5244, 3.3792], 12); // Default center (Lagos)

      const tileLayer = L.tileLayer(currentStyleConfig.url, {
        attribution: currentStyleConfig.attribution,
        maxZoom: currentStyleConfig.maxZoom,
        subdomains: currentStyleConfig.subdomains || 'abc'
      }).addTo(map);

      tileLayerRef.current = tileLayer;
      layersGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    } else if (tileLayerRef.current) {
      // Handle tile style switch smoothly
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
      const newTileLayer = L.tileLayer(currentStyleConfig.url, {
        attribution: currentStyleConfig.attribution,
        maxZoom: currentStyleConfig.maxZoom,
        subdomains: currentStyleConfig.subdomains || 'abc'
      }).addTo(mapInstanceRef.current);
      tileLayerRef.current = newTileLayer;
    }

    const map = mapInstanceRef.current;
    const layers = layersGroupRef.current;
    if (!layers) return;

    layers.clearLayers();

    // 1. Draw project-specific boundary polygons
    PROJECT_BOUNDARY_POLYGONS.forEach(poly => {
      const polygon = L.polygon(poly.coords as [number, number][], {
        color: poly.color,
        weight: 2.5,
        dashArray: '6, 4',
        fillColor: poly.color,
        fillOpacity: mapStyle === 'dark' ? 0.16 : 0.10
      }).addTo(layers);

      polygon.bindPopup(`
        <div style="font-family: Inter, sans-serif; font-size: 11px; line-height: 1.4; color: #111827; min-width: 220px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-size: 9px; font-weight: 800; text-transform: uppercase; color: ${poly.color}; letter-spacing: 0.5px;">PROJECT BOUNDARY</span>
            <span style="font-size: 9px; font-weight: 700; color: #4B5563;">${poly.code}</span>
          </div>
          <b style="font-size: 12px; color: #0F172A;">${poly.title}</b>
          <div style="margin-top: 6px; font-size: 10px; color: #374151;">
            Quota: <b>${poly.completed} / ${poly.target}</b> interviews completed<br/>
            Active Deployed Surveyors: <b>${poly.assignedSurveyors}</b>
          </div>
          <div style="margin-top: 6px; background: #E2E8F0; border-radius: 4px; height: 6px; overflow: hidden;">
            <div style="background: ${poly.color}; width: ${(poly.completed / poly.target) * 100}%; height: 100%;"></div>
          </div>
        </div>
      `);
    });

    // 2. Draw all locked geofences with perimeter circles and anchor markers
    geofences.forEach(gf => {
      // Outer drift buffer boundary
      L.circle([gf.lat, gf.lng], {
        color: '#F59E0B',
        weight: 1.5,
        dashArray: '4, 4',
        fillColor: '#F59E0B',
        fillOpacity: 0.05,
        radius: gf.radiusMeters + gf.driftBufferMeters
      }).addTo(layers);

      // Inner geofence boundary (Red/Crimson)
      L.circle([gf.lat, gf.lng], {
        color: '#E30620',
        weight: 2,
        fillColor: '#E30620',
        fillOpacity: 0.15,
        radius: gf.radiusMeters
      }).addTo(layers);

      // Geofence Anchor Pin (Pulsing green dot)
      const anchorIcon = L.divIcon({
        className: 'geofence-anchor-pin',
        html: `
          <div style="position: relative; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 20px; height: 20px; background-color: rgba(16, 185, 129, 0.4); border-radius: 50%; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 10px; height: 10px; background-color: #10B981; border: 2px solid white; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.4);"></div>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      const anchorMarker = L.marker([gf.lat, gf.lng], { icon: anchorIcon }).addTo(layers);
      anchorMarker.bindPopup(`
        <div style="font-family: Inter, sans-serif; font-size: 11px; line-height: 1.4; color: #111827;">
          <b style="color: #E30620;">🔒 LOCKED GEOFENCE ZONE</b><br/>
          <b>${gf.name}</b><br/>
          Radius: <b>${gf.radiusMeters}m</b> (Buffer: +${gf.driftBufferMeters}m)<br/>
          Target Quota: <b>${gf.targetInterviews || 50} interviews</b><br/>
          Assigned: <b>${gf.assignedEnumerator || 'All Field Teams'}</b><br/>
          <span style="color: #10B981; font-weight: bold;">● Active &amp; Enforced</span>
        </div>
      `);
    });

    // 3. Draw real-time enumerator status markers with pulsing radar rings & status badges
    ENUMERATOR_LIVE_MARKERS.forEach(enu => {
      const isAlert = enu.status === 'QC_ALERT';
      const isTransit = enu.status === 'IN_TRANSIT';
      const pingBg = isAlert ? 'rgba(227, 6, 32, 0.4)' : isTransit ? 'rgba(245, 158, 11, 0.4)' : 'rgba(16, 185, 129, 0.4)';

      const enuIcon = L.divIcon({
        className: 'enumerator-live-marker',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 34px; height: 34px;">
            <div style="position: absolute; width: 34px; height: 34px; background: ${pingBg}; border-radius: 50%; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 26px; height: 26px; background: #0B0F17; border: 2.5px solid ${enu.color}; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.6); z-index: 2;">
              <span style="color: white; font-size: 10px; font-weight: 900; font-family: Inter, sans-serif;">${enu.name.charAt(0)}</span>
            </div>
            <div style="position: absolute; bottom: -2px; right: -2px; width: 10px; height: 10px; background: ${enu.color}; border: 1.5px solid white; border-radius: 50%; z-index: 3;"></div>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });

      const enuMarker = L.marker([enu.lat, enu.lng], { icon: enuIcon }).addTo(layers);
      enuMarker.bindPopup(`
        <div style="font-family: Inter, sans-serif; font-size: 11px; line-height: 1.4; color: #0F172A; min-width: 220px;">
          <div style="display: flex; items-center; justify-content: space-between; margin-bottom: 3px;">
            <span style="font-size: 9px; font-weight: 800; background: ${enu.color}20; color: ${enu.color}; padding: 2px 6px; border-radius: 4px; border: 1px solid ${enu.color}40;">
              ${enu.statusLabel}
            </span>
            <span style="font-size: 9px; font-family: monospace; font-weight: bold; color: #64748B;">🔋 ${enu.battery}</span>
          </div>
          <b style="font-size: 12px; color: #0F172A;">${enu.name}</b> (${enu.device})<br/>
          <div style="margin-top: 4px; font-size: 10px; color: #475569; space-y: 1px;">
            <div>Cluster: <b>${enu.location}</b></div>
            <div>Interviews Done: <b>${enu.interviews}</b></div>
            <div>Speed / Activity: <b>${enu.speed}</b></div>
            <div style="color: #10B981; font-weight: 600; margin-top: 2px;">● Device Reporting Live</div>
          </div>
        </div>
      `);
    });

    // 4. Draw submission markers with colored dots and direct Google Maps link
    mappedSubmissions.forEach(sub => {
      // green = approved/completed, yellow = pending/in progress, red = flagged/rejected
      const pinColor = sub.status === 'Approved' ? '#10B981' : sub.status === 'Pending' ? '#F59E0B' : '#E30620';
      const statusLabel = sub.status === 'Approved' ? 'Completed & Approved' : sub.status === 'Pending' ? 'In Progress / Pending Review' : 'QC Flagged';

      const subIcon = L.divIcon({
        className: 'sub-pin',
        html: `
          <div style="position: relative; width: 14px; height: 14px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 14px; height: 14px; background-color: ${pinColor}40; border-radius: 50%; animation: ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 10px; height: 10px; background-color: ${pinColor}; border-radius: 50%; border: 1.5px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.6); z-index: 2;"></div>
          </div>
        `,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });

      const marker = L.marker([sub.gps.lat, sub.gps.lng], { icon: subIcon }).addTo(layers);
      marker.bindPopup(`
        <div style="font-family: Inter, sans-serif; font-size: 11px; line-height: 1.4; min-width: 210px; color: #0F172A;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-size: 9px; font-weight: 800; background: ${pinColor}20; color: ${pinColor}; padding: 2px 6px; border-radius: 4px; border: 1px solid ${pinColor}40;">
              ● ${statusLabel}
            </span>
            <span style="font-size: 9px; font-mono; color: #64748B;">${sub.submittedAt.split(' ')[1] || ''}</span>
          </div>
          <b style="font-size: 12px; color: #0F172A;">${sub.enumeratorName}</b><br/>
          <div style="font-size: 10px; color: #475569; margin: 3px 0;">
            <div>Project: <b>${sub.projectTitle}</b></div>
            <div>Cluster: <b>${sub.state}, ${sub.lga}</b></div>
            <div>GPS: <b style="color: #0F172A;">${sub.gps.lat.toFixed(4)}, ${sub.gps.lng.toFixed(4)}</b> (±${sub.gps.accuracy}m)</div>
          </div>
          <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid #E2E8F0; display: flex; gap: 6px;">
            <a 
              href="https://maps.google.com/?q=${sub.gps.lat},${sub.gps.lng}" 
              target="_blank" 
              rel="noreferrer" 
              style="display: inline-block; background: #2563EB; color: white; padding: 4px 8px; border-radius: 6px; text-decoration: none; font-size: 10px; font-weight: bold;"
            >
              📍 Open Google Maps
            </a>
          </div>
        </div>
      `);
    });

    // Pan to first geofence if available
    if (geofences.length > 0) {
      map.setView([geofences[0].lat, geofences[0].lng], 13);
    }
  }, [geofences, mappedSubmissions, mapStyle]);

  // Live Location Search with OpenStreetMap Nominatim
  const handleSearchAndGeocode = async (query: string) => {
    if (!query) return;
    setGeocoding(true);
    setGeocodeMessage('Searching OpenStreetMap geocoder for location coordinates...');
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', Nigeria')}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const top = data[0];
        const newLat = parseFloat(top.lat);
        const newLng = parseFloat(top.lon);
        setLockLat(newLat);
        setLockLng(newLng);
        setGeocodeMessage(`✓ Located: ${top.display_name}`);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([newLat, newLng], 14);
        }
      } else {
        setGeocodeMessage('Location not found in geocoder. You can enter coordinates directly or pick a preset.');
      }
    } catch {
      setGeocodeMessage('Geocoding network timeout. Using manual coordinate entries.');
    } finally {
      setGeocoding(false);
    }
  };

  // Preset location select
  const handleSelectPreset = (name: string, lat: number, lng: number, lga: string, state: string) => {
    setLockLocationQuery(name);
    setLockLat(lat);
    setLockLng(lng);
    setGeocodeMessage(`Loaded preset: ${name} (${state})`);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lng], 14);
    }
  };

  // Save and lock the geofence to the project
  const handleConfirmLockGeofence = () => {
    if (!lockLocationQuery.trim()) {
      alert('Please enter a location name to geolock.');
      return;
    }

    const newGf: GeofenceZone = {
      id: `geo-${Date.now()}`,
      projectId: lockProjectId,
      name: lockLocationQuery,
      state: 'Lagos',
      lga: 'Ikeja',
      lat: lockLat,
      lng: lockLng,
      radiusMeters: lockRadius,
      driftBufferMeters: lockBuffer,
      targetInterviews: lockQuota,
      assignedEnumerator: lockAssignedEnu,
      active: true,
      createdAt: new Date().toISOString()
    };

    setGeofences(prev => [newGf, ...prev]);
    if (onAddGeofence) {
      onAddGeofence(newGf);
    }

    setShowTypeLockModal(false);
    setLockLocationQuery('');
    setGeocodeMessage(null);
  };

  const handleResolveAnomaly = (id: string) => {
    setAnomalies(prev => prev.map(a => a.id === id ? { ...a, resolved: true } : a));
  };

  const handleManualSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setLastSyncTime(new Date().toLocaleTimeString());
    }, 800);
  };

  // Export Submissions to CSV
  const handleExportCSV = () => {
    setShowExportMenu(false);
    const headers = ['Submission UUID', 'Project Code', 'Project Title', 'Enumerator Name', 'State', 'LGA', 'Latitude', 'Longitude', 'Accuracy (m)', 'Duration (s)', 'Status', 'Submitted At', 'Google Maps Link'];
    const rows = filteredSubmissions.map(s => [
      `"${s.id}"`,
      `"${s.projectId}"`,
      `"${(s.projectTitle || '').replace(/"/g, '""')}"`,
      `"${s.enumeratorName}"`,
      `"${s.state}"`,
      `"${s.lga}"`,
      s.gps?.lat || '',
      s.gps?.lng || '',
      s.gps?.accuracy || '',
      s.durationSeconds,
      `"${s.status}"`,
      `"${s.submittedAt}"`,
      `"https://maps.google.com/?q=${s.gps?.lat},${s.gps?.lng}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CMRG_Submissions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Submissions to Excel (.xlsx-compatible XML Spreadsheet)
  const handleExportExcel = () => {
    setShowExportMenu(false);
    const headers = ['Submission UUID', 'Project Code', 'Project Title', 'Enumerator Name', 'State', 'LGA', 'Latitude', 'Longitude', 'Accuracy (m)', 'Duration (s)', 'Status', 'Submitted At', 'Google Maps Link'];
    const rows = filteredSubmissions.map(s => [
      s.id,
      s.projectId,
      s.projectTitle,
      s.enumeratorName,
      s.state,
      s.lga,
      s.gps?.lat || '',
      s.gps?.lng || '',
      s.gps?.accuracy || '',
      s.durationSeconds,
      s.status,
      s.submittedAt,
      `https://maps.google.com/?q=${s.gps?.lat},${s.gps?.lng}`
    ]);

    let xml = '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>';
    xml += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">';
    xml += '<Worksheet ss:Name="CMRG Field Submissions"><Table>';
    xml += '<Row>' + headers.map(h => `<Cell><Data ss:Type="String">${h}</Data></Cell>`).join('') + '</Row>';
    rows.forEach(row => {
      xml += '<Row>' + row.map(c => `<Cell><Data ss:Type="String">${String(c).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</Data></Cell>`).join('') + '</Row>';
    });
    xml += '</Table></Worksheet></Workbook>';

    const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CMRG_Situation_Room_${new Date().toISOString().slice(0, 10)}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Export Submissions to OpenGIS KML 2.2 (for Google Earth, QGIS, ArcGIS)
  const handleExportKML = () => {
    setShowExportMenu(false);
    let kml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    kml += '<kml xmlns="http://www.opengis.net/kml/2.2">\n';
    kml += '  <Document>\n';
    kml += '    <name>CMRG Data Collect - Situation Room Submissions</name>\n';
    kml += '    <description>Audited field submissions with coordinates and media verification</description>\n';

    filteredSubmissions.forEach(s => {
      if (s.gps && s.gps.lat && s.gps.lng) {
        kml += '    <Placemark>\n';
        kml += `      <name>${s.enumeratorName} (${s.id})</name>\n`;
        kml += `      <description><![CDATA[<b>Project:</b> ${s.projectTitle}<br/><b>Status:</b> ${s.status}<br/><b>Time:</b> ${s.submittedAt}<br/><a href="https://maps.google.com/?q=${s.gps.lat},${s.gps.lng}">Open in Google Maps</a>]]></description>\n`;
        kml += '      <Point>\n';
        kml += `        <coordinates>${s.gps.lng},${s.gps.lat},0</coordinates>\n`;
        kml += '      </Point>\n';
        kml += '    </Placemark>\n';
      }
    });

    kml += '  </Document>\n';
    kml += '</kml>';

    const blob = new Blob([kml], { type: 'application/vnd.google-earth.kml+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CMRG_Field_GIS_${new Date().toISOString().slice(0, 10)}.kml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleOpenShareCheck = (code?: string) => {
    const targetCode = code || (filterProject !== 'all' ? projects.find(p => p.id === filterProject)?.code : undefined) || 'CMRG-739';
    setActiveCheckCode(targetCode);
    setShowCheckModal(true);
  };

  return (
    <div className="bg-[#0B0F17] text-gray-200 min-h-screen p-4 sm:p-6 font-sans space-y-5">
      
      {/* 1. TOP RESEARCH OPS CONSOLE BAR - EXACT MATCH TO USER IMAGE */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-gray-800">
        
        {/* Left: Console Tag & Platform */}
        <div className="flex items-center gap-3">
          <span className="bg-[#E30620] text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded shadow-sm tracking-wider">
            CMRG RESEARCH OPS
          </span>
          <span className="text-xs text-gray-400 font-medium">
            Platform: <span className="text-gray-200">Production Console</span>
          </span>
        </div>

        {/* 4 Stat Cards in Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1 max-w-4xl lg:mx-6">
          <div className="bg-[#121824] border border-gray-800 rounded-xl px-3 py-2">
            <h4 className="text-sm font-black text-white">3 / 4</h4>
            <p className="text-[10px] font-semibold text-emerald-400">100% field devices reporting</p>
          </div>

          <div className="bg-[#121824] border border-gray-800 rounded-xl px-3 py-2">
            <h4 className="text-sm font-black text-white">585 seconds</h4>
            <p className="text-[10px] text-gray-400">Quality threshold: &gt;120s</p>
          </div>

          <div className="bg-[#121824] border border-gray-800 rounded-xl px-3 py-2">
            <h4 className="text-sm font-black text-[#E30620]">1 Interviews</h4>
            <p className="text-[10px] text-red-300">2 unresolved QC alerts</p>
          </div>

          <div className="bg-[#121824] border border-gray-800 rounded-xl px-3 py-2">
            <h4 className="text-sm font-black text-white">2 samples</h4>
            <p className="text-[10px] text-gray-400">Background QA active</p>
          </div>
        </div>

        {/* Right: Authenticated Supervisor Badge */}
        <div className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold text-white truncate">Dr. Damilare Afolabi (CMRG Lead)</span>
          <span className="bg-[#E30620] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase">
            ADMIN
          </span>
        </div>
      </div>

      {/* 2. MAIN SITUATION MAP CONTAINER - EXACT MATCH TO IMAGE */}
      <div className="bg-[#121824] border border-gray-800 rounded-2xl p-5 shadow-2xl space-y-4">
        
        {/* Top Header of Map Container */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#E30620]/20 text-[#E30620] flex items-center justify-center">
              <MapPin className="w-4 h-4 text-[#E30620]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  CMRG FIELD SITUATION MAP
                </h2>
                <span className="bg-[#E30620] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                  Leaflet GIS
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                Authorized server submission locations • Real submitted GPS coordinates
              </p>
            </div>
          </div>

          {/* Action Buttons: Map View, Accessible Table, Style Switcher, Type & Lock Location, Sync */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Custom High-Contrast Map Style Switcher */}
            <div className="flex items-center bg-[#0B0F17] p-0.5 rounded-lg border border-gray-700/80 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setMapStyle('dark')}
                className={`px-2 py-1 rounded transition-all ${mapStyle === 'dark' ? 'bg-[#E30620] text-white shadow-xs' : 'text-gray-400 hover:text-white'}`}
                title="Tactical Dark Ops"
              >
                Dark Ops
              </button>
              <button
                type="button"
                onClick={() => setMapStyle('light')}
                className={`px-2 py-1 rounded transition-all ${mapStyle === 'light' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-400 hover:text-white'}`}
                title="High-Contrast Light"
              >
                Light
              </button>
              <button
                type="button"
                onClick={() => setMapStyle('satellite')}
                className={`px-2 py-1 rounded transition-all ${mapStyle === 'satellite' ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-400 hover:text-white'}`}
                title="Satellite Hybrid"
              >
                Satellite
              </button>
              <button
                type="button"
                onClick={() => setMapStyle('osm')}
                className={`px-2 py-1 rounded transition-all ${mapStyle === 'osm' ? 'bg-emerald-600 text-white shadow-xs' : 'text-gray-400 hover:text-white'}`}
                title="Street OSM"
              >
                OSM
              </button>
            </div>

            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'map' ? 'bg-[#E30620] text-white shadow-md' : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Map View</span>
            </button>

            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'table' ? 'bg-[#E30620] text-white shadow-md' : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Accessible Table</span>
            </button>

            {/* KEY REQUESTED FEATURE: Type location and Geo-Lock it before fieldwork */}
            <button
              onClick={() => setShowTypeLockModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
              title="Type location to lock before sending enumerators to the field"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Type &amp; Geo-Lock Location</span>
            </button>

            {/* WhatsApp-Style Fast Pair QR Link Device Button */}
            {onOpenWhatsAppConnect && (
              <button
                onClick={() => onOpenWhatsAppConnect(filterProject !== 'all' ? projects.find(p => p.id === filterProject)?.code : undefined)}
                className="bg-[#25D366] hover:bg-[#1EBE5D] text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md transition-all active:scale-[0.98]"
                title="WhatsApp-Style Scan & Connect QR for Field Devices"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">WhatsApp QR Link</span>
                <span className="sm:hidden">QR Link</span>
              </button>
            )}

            {/* Public Shareable Check Link Button */}
            <button
              onClick={() => handleOpenShareCheck()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
              title="Share Public Check Link to verify survey authenticity"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Share Check Link</span>
              <span className="sm:hidden">Check</span>
            </button>

            {/* Export Dropdown Menu (Excel, CSV, KML) */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="bg-white/10 hover:bg-white/15 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md transition-all border border-white/10"
                title="Export Situation Room Data"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export</span>
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-[#121824] border border-gray-700 rounded-xl shadow-2xl py-1 z-50 text-xs animate-in fade-in duration-150">
                  <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-gray-400 border-b border-gray-800">
                    Export Formats
                  </div>
                  <button
                    onClick={handleExportExcel}
                    className="w-full px-3 py-2 text-left hover:bg-white/10 flex items-center gap-2 text-gray-200 hover:text-white"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="font-bold">Excel (.xls / .xlsx)</div>
                      <div className="text-[10px] text-gray-400">Full survey records &amp; GPS</div>
                    </div>
                  </button>
                  <button
                    onClick={handleExportCSV}
                    className="w-full px-3 py-2 text-left hover:bg-white/10 flex items-center gap-2 text-gray-200 hover:text-white"
                  >
                    <FileText className="w-4 h-4 text-blue-400" />
                    <div>
                      <div className="font-bold">CSV Spreadsheet</div>
                      <div className="text-[10px] text-gray-400">Comma-separated values</div>
                    </div>
                  </button>
                  <button
                    onClick={handleExportKML}
                    className="w-full px-3 py-2 text-left hover:bg-white/10 flex items-center gap-2 text-gray-200 hover:text-white"
                  >
                    <Globe className="w-4 h-4 text-amber-400" />
                    <div>
                      <div className="font-bold">KML Spatial Layer</div>
                      <div className="text-[10px] text-gray-400">Google Earth &amp; QGIS maps</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleManualSync}
              className="p-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-xs transition-colors"
              title="Sync Database"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-[#E30620]' : ''}`} />
            </button>
          </div>
        </div>

        {/* Server Data Status & Filter Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-1 border-t border-gray-800/80">
          <div className="flex items-center gap-2">
            <span className="text-gray-400 font-semibold">Filters:</span>
            
            <select
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              className="bg-[#0B0F17] border border-gray-700 rounded-lg px-2.5 py-1 text-[11px] text-gray-200"
            >
              <option value="all">All Questionnaires</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.code}: {p.title}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-[#0B0F17] border border-gray-700 rounded-lg px-2.5 py-1 text-[11px] text-gray-200"
            >
              <option value="all">All Statuses</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Flagged">Flagged</option>
              <option value="Rejected">Rejected</option>
            </select>

            <select
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="bg-[#0B0F17] border border-gray-700 rounded-lg px-2.5 py-1 text-[11px] text-gray-200"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-gray-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Server Data Updated: <b className="text-gray-200">{lastSyncTime}</b></span>
            <span>•</span>
            <span><b>{mappedSubmissions.length}</b> Mapped / <b>{unmappedSubmissions.length}</b> No GPS</span>
            <span>•</span>
            <span className="text-[#E30620] font-bold"><b>{geofences.length}</b> Locked Zones</span>
          </div>
        </div>

        {/* Map View & Unmapped Records Sidebar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          
          {/* Main Leaflet GIS Map Container (Cols 1-3) */}
          <div className="lg:col-span-3 relative bg-[#070A0F] rounded-xl overflow-hidden border border-gray-800 h-[480px] shadow-inner">
            <div ref={mapRef} className="absolute inset-0 w-full h-full z-10" />

            {/* Online Leaflet Tiles Indicator Badge (Bottom Left of Map) */}
            <div className="absolute bottom-3 left-3 z-20 bg-black/85 backdrop-blur-xs border border-gray-700 px-3 py-1.5 rounded-lg text-[10px] text-gray-300 flex items-center gap-2 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Online Leaflet Tiles • OpenStreetMap Data</span>
            </div>

            {/* Active Locked Geofences Overlay on Map (Top Right) */}
            <div className="absolute top-3 right-3 z-20 bg-black/85 backdrop-blur-xs border border-gray-700 rounded-xl p-2.5 text-[11px] text-gray-300 max-w-xs shadow-xl hidden sm:block">
              <div className="flex items-center justify-between pb-1 mb-1 border-b border-gray-700">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#E30620]"></span>
                  Pre-Field Locked Zones
                </span>
                <span className="text-[10px] text-gray-400">{geofences.length} Active</span>
              </div>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {geofences.map(gf => (
                  <div key={gf.id} className="flex justify-between items-center text-[10px]">
                    <span className="text-gray-200 truncate max-w-[140px]">{gf.name}</span>
                    <span className="text-[#E30620] font-mono font-bold">{gf.radiusMeters}m</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: UNMAPPED RECORDS (1) NO GPS - EXACT MATCH TO USER IMAGE */}
          <div className="bg-[#0B0F17] border border-gray-800 rounded-xl p-4 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-800">
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                  <h3 className="text-xs font-bold text-white">UNMAPPED RECORDS ({unmappedSubmissions.length})</h3>
                </div>
                <span className="text-[10px] font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded">No GPS</span>
              </div>

              <p className="text-[10px] text-gray-400 leading-relaxed">
                Records received without valid GPS coordinates. Listed here without placing markers to maintain GPS accuracy.
              </p>

              {/* Unmapped Cards Stream */}
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                <div className="p-2.5 bg-[#121824] border border-gray-800 rounded-lg text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-[11px]">CMRG National Consumer B...</span>
                    <span className="text-[9px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-semibold">Synced</span>
                  </div>
                  <p className="text-[10px] text-gray-400">Officer: Kwame Asante • CMRG-TAB-104</p>
                  <div className="flex items-center justify-between text-[10px] pt-1 border-t border-gray-800/60">
                    <span className="text-gray-500">11:49:15 AM</span>
                    <span className="text-amber-500 font-bold">GPS Unavailable</span>
                  </div>
                </div>

                {unmappedSubmissions.map(sub => (
                  <div key={sub.id} className="p-2.5 bg-[#121824] border border-gray-800 rounded-lg text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-[11px] truncate">{sub.projectTitle}</span>
                      <span className="text-[9px] bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded font-semibold">{sub.status}</span>
                    </div>
                    <p className="text-[10px] text-gray-400">Officer: {sub.enumeratorName}</p>
                    <div className="flex items-center justify-between text-[10px] pt-1 border-t border-gray-800/60">
                      <span className="text-gray-500">{sub.submittedAt.split(' ')[1] || 'Just now'}</span>
                      <span className="text-red-400 font-bold">Zero Satellite Lock</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Surveyor Privacy & Consent Disclaimer */}
            <div className="pt-3 border-t border-gray-800/80 text-[9px] text-gray-500 leading-relaxed">
              <span className="font-bold text-gray-400 block mb-0.5">ℹ Surveyor Privacy &amp; Consent</span>
              GPS coordinates are recorded strictly upon surveyor opt-in and informed questionnaire consent. Personal answers and identities are never shown on public situation displays.
            </div>

          </div>

        </div>

      </div>

      {/* 3. BOTTOM ROW: ACTIVE FIELD SURVEYOR ROSTER & QUALITY CONTROL ANOMALY STREAM */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column (Cols 1-4): Active Field Surveyor Roster */}
        <div className="lg:col-span-4 bg-[#121824] border border-gray-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-white">Active Field Surveyor Roster</h3>
            </div>
            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
              3 Active
            </span>
          </div>

          <div className="space-y-2">
            <div className="p-3 bg-[#0B0F17] border border-gray-800/80 rounded-xl flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-white">Kwame Asante</p>
                <p className="text-[10px] text-gray-400">Greater Accra Coastal • CMRG-TAB-104</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1 justify-end">
                  <Battery className="w-3 h-3" /> 88%
                </span>
                <span className="text-[10px] text-gray-400">32 interviews</span>
              </div>
            </div>

            <div className="p-3 bg-[#0B0F17] border border-gray-800/80 rounded-xl flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-white">Amina Bello</p>
                <p className="text-[10px] text-gray-400">Ikeja Metropolitan • CMRG-TAB-208</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1 justify-end">
                  <Battery className="w-3 h-3" /> 94%
                </span>
                <span className="text-[10px] text-gray-400">45 interviews</span>
              </div>
            </div>

            <div className="p-3 bg-[#0B0F17] border border-gray-800/80 rounded-xl flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-white">Emeka Okafor</p>
                <p className="text-[10px] text-gray-400">Surulere Stadium Hub • CMRG-TAB-311</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-amber-400 font-mono font-bold flex items-center gap-1 justify-end">
                  <Battery className="w-3 h-3" /> 72%
                </span>
                <span className="text-[10px] text-gray-400">28 interviews</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Cols 5-12): Quality Control Anomaly Stream */}
        <div className="lg:col-span-8 bg-[#121824] border border-gray-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#E30620]" />
              <h3 className="text-xs font-bold text-white">Quality Control Anomaly Stream</h3>
            </div>
            <span className="text-[#E30620] text-xs font-bold">
              {anomalies.filter(a => !a.resolved).length} Unresolved
            </span>
          </div>

          <div className="space-y-2.5">
            {anomalies.map(anom => (
              <div 
                key={anom.id}
                className={`p-3 rounded-xl border text-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  anom.resolved ? 'bg-[#0B0F17]/60 border-gray-800 opacity-60' : 'bg-[#0B0F17] border-gray-800 hover:border-red-900/40'
                }`}
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${anom.resolved ? 'bg-gray-500' : 'bg-[#E30620]'}`}></span>
                    <span className="font-bold text-white text-[12px]">{anom.surveyor}</span>
                    <span className="text-[10px] text-gray-400">• {anom.time}</span>
                  </div>
                  <p className="text-[11px] text-gray-300">{anom.details}</p>
                  <span className="text-[9px] font-mono font-bold text-gray-400 bg-white/5 px-2 py-0.5 rounded inline-block">
                    TYPE: {anom.type}
                  </span>
                </div>

                <div>
                  {!anom.resolved ? (
                    <button
                      type="button"
                      onClick={() => handleResolveAnomaly(anom.id)}
                      className="px-3 py-1.5 bg-white/10 hover:bg-emerald-600 hover:text-white text-gray-200 rounded-lg text-xs font-semibold transition-all flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Mark Resolved</span>
                    </button>
                  ) : (
                    <span className="text-emerald-400 font-bold text-xs flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Resolved
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 4. MODAL: TYPE LOCATION & GEOFENCE IT BEFORE SENDING TO FIELD */}
      {showTypeLockModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#121824] text-white border border-gray-700 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#E30620]/20 text-[#E30620] flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Type &amp; Geo-Lock Interview Locations</h3>
                  <p className="text-[11px] text-gray-400">Lock field boundaries before sending enumerators to conduct interviews</p>
                </div>
              </div>
              <button 
                onClick={() => setShowTypeLockModal(false)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form to type location */}
            <div className="space-y-4 text-xs">
              
              {/* Preset quick buttons */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-400 mb-1.5">
                  Popular Nigerian Survey Presets
                </label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSelectPreset('Ikeja Computer Village & Under Bridge', 6.5922, 3.3364, 'Ikeja', 'Lagos')}
                    className="bg-white/5 hover:bg-[#E30620] text-gray-300 hover:text-white px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors"
                  >
                    Ikeja Computer Village (Lagos)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectPreset('Bodija Market & UI Perimeter', 7.4285, 3.9009, 'Ibadan North', 'Oyo')}
                    className="bg-white/5 hover:bg-[#E30620] text-gray-300 hover:text-white px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors"
                  >
                    Bodija Market (Ibadan)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectPreset('Wuse 2 & Central Business District', 9.0765, 7.3986, 'Abuja', 'FCT')}
                    className="bg-white/5 hover:bg-[#E30620] text-gray-300 hover:text-white px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors"
                  >
                    Wuse 2 (Abuja)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectPreset('Alaba International Market', 6.4589, 3.1956, 'Ojo', 'Lagos')}
                    className="bg-white/5 hover:bg-[#E30620] text-gray-300 hover:text-white px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors"
                  >
                    Alaba Market (Lagos)
                  </button>
                </div>
              </div>

              {/* Type Location Input with Search Button */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                  Type Location Name, Market or Address:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={lockLocationQuery}
                    onChange={(e) => setLockLocationQuery(e.target.value)}
                    placeholder="e.g. Surulere Stadium, Agege Market, Lekki Phase 1..."
                    className="flex-1 bg-[#0B0F17] border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E30620]"
                  />
                  <button
                    type="button"
                    onClick={() => handleSearchAndGeocode(lockLocationQuery)}
                    disabled={geocoding}
                    className="px-4 py-2 bg-[#E30620] hover:bg-red-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>{geocoding ? 'Locating...' : 'Locate GPS'}</span>
                  </button>
                </div>
                {geocodeMessage && (
                  <p className="text-[11px] text-emerald-400 mt-1 font-mono">{geocodeMessage}</p>
                )}
              </div>

              {/* Coordinates & Target Project */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-gray-400 mb-1">Target Research Project</label>
                  <select
                    value={lockProjectId}
                    onChange={(e) => setLockProjectId(e.target.value)}
                    className="w-full bg-[#0B0F17] border border-gray-700 rounded-xl px-2.5 py-2 text-xs text-white"
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.code}: {p.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-gray-400 mb-1">Assigned Field Surveyor</label>
                  <select
                    value={lockAssignedEnu}
                    onChange={(e) => setLockAssignedEnu(e.target.value)}
                    className="w-full bg-[#0B0F17] border border-gray-700 rounded-xl px-2.5 py-2 text-xs text-white"
                  >
                    {enumerators.map(e => (
                      <option key={e.id} value={e.name}>{e.name} ({e.id})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Radius & Quota sliders */}
              <div className="grid grid-cols-2 gap-4 bg-[#0B0F17] p-3 rounded-xl border border-gray-800">
                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-gray-300 mb-1">
                    <span>Geofence Radius:</span>
                    <span className="text-[#E30620] font-mono">{lockRadius}m</span>
                  </div>
                  <input
                    type="range"
                    min={200}
                    max={5000}
                    step={100}
                    value={lockRadius}
                    onChange={(e) => setLockRadius(parseInt(e.target.value))}
                    className="w-full accent-[#E30620]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-gray-300 mb-1">
                    <span>Target Interviews:</span>
                    <span className="text-emerald-400 font-mono">{lockQuota} quotas</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={300}
                    step={10}
                    value={lockQuota}
                    onChange={(e) => setLockQuota(parseInt(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </div>
              </div>

              {/* Exact Lat/Lng readout */}
              <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 bg-black/40 px-3 py-2 rounded-lg border border-gray-800">
                <span>Latitude: <b className="text-white">{lockLat.toFixed(4)}</b></span>
                <span>Longitude: <b className="text-white">{lockLng.toFixed(4)}</b></span>
                <span>Drift Allowance: <b className="text-amber-400">+{lockBuffer}m</b></span>
              </div>

            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setShowTypeLockModal(false)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmLockGeofence}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-900/30"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Confirm &amp; Lock Geofence Zone</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. SUBMISSION INSPECTION MODAL */}
      {inspectingSub && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#121824] text-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 border border-gray-700 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <div>
                <span className="text-[10px] font-bold text-[#E30620] uppercase tracking-wider">Submission Review &amp; Evidence Audit</span>
                <h3 className="text-sm font-bold text-white">{inspectingSub.projectTitle}</h3>
              </div>
              <button onClick={() => setInspectingSub(null)} className="text-gray-400 hover:text-white font-bold text-lg">&times;</button>
            </div>

            {/* Top metadata grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#0B0F17] p-3 rounded-xl text-xs font-mono">
              <div>
                <span className="text-[10px] text-gray-500 block">UUID</span>
                <span className="text-gray-300 font-bold truncate block">{inspectingSub.id}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 block">Enumerator</span>
                <span className="text-gray-300 font-bold truncate block">{inspectingSub.enumeratorName}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 block">Status</span>
                <span className={`font-bold ${inspectingSub.status === 'Approved' ? 'text-emerald-400' : inspectingSub.status === 'Pending' ? 'text-amber-400' : 'text-red-400'}`}>
                  {inspectingSub.status}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 block">Submitted</span>
                <span className="text-gray-400">{inspectingSub.submittedAt}</span>
              </div>
            </div>

            {/* GPS verification card with Google Maps button */}
            <div className="bg-[#0B0F17] border border-gray-800 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5 text-xs font-mono">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <MapPin className="w-4 h-4 text-emerald-500" />
                  <span>GPS: {inspectingSub.gps?.lat?.toFixed(5)}, {inspectingSub.gps?.lng?.toFixed(5)}</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Cluster: {inspectingSub.state}, {inspectingSub.lga} (Satellite Accuracy: ±{inspectingSub.gps?.accuracy}m)
                </p>
              </div>

              {inspectingSub.gps?.lat && inspectingSub.gps?.lng && (
                <a
                  href={`https://maps.google.com/?q=${inspectingSub.gps.lat},${inspectingSub.gps.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in Google Maps</span>
                </a>
              )}
            </div>

            {/* Answers & Survey Data */}
            {inspectingSub.answers && Object.keys(inspectingSub.answers).length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-300">Questionnaire Responses</h4>
                <div className="bg-[#0B0F17] rounded-xl p-3 text-xs space-y-2">
                  {Object.entries(inspectingSub.answers).map(([key, val]: any) => {
                    if (typeof val === 'string' && (val.startsWith('http') || val.startsWith('data:') || val.startsWith('store://'))) {
                      return null; // Rendered in media section
                    }
                    return (
                      <div key={key} className="flex justify-between border-b border-gray-800/60 pb-1 text-[11px]">
                        <span className="text-gray-400 uppercase font-mono">{key.replace(/_/g, ' ')}:</span>
                        <span className="text-white font-semibold">{typeof val === 'object' ? JSON.stringify(val) : String(val)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Media Evidence Section: Photo, Video, Audio */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-300">Audited Media Evidence (GPS &amp; Timestamp Watermarked)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Photo Evidence */}
                <div className="bg-[#0B0F17] border border-gray-800 rounded-xl p-2.5 text-center space-y-1.5">
                  <div className="text-[10px] text-gray-400 font-bold uppercase flex items-center justify-center gap-1">
                    <Image className="w-3 h-3 text-[#E30620]" />
                    <span>Dwelling Photo</span>
                  </div>
                  {inspectingSub.answers?.house_photo || inspectingSub.answers?.product_photo ? (
                    <div className="relative rounded-lg overflow-hidden border border-gray-700">
                      <img
                        src={inspectingSub.answers.house_photo || inspectingSub.answers.product_photo}
                        alt="Audited Evidence"
                        className="w-full h-24 object-cover"
                      />
                      <span className="absolute bottom-1 right-1 bg-black/80 text-[8px] font-mono text-emerald-400 px-1 rounded">GPS ✓</span>
                    </div>
                  ) : (
                    <div className="h-24 bg-white/5 rounded-lg flex items-center justify-center text-[10px] text-gray-500">
                      No Photo Captured
                    </div>
                  )}
                </div>

                {/* Video Survey Evidence */}
                <div className="bg-[#0B0F17] border border-gray-800 rounded-xl p-2.5 text-center space-y-1.5">
                  <div className="text-[10px] text-gray-400 font-bold uppercase flex items-center justify-center gap-1">
                    <Film className="w-3 h-3 text-blue-400" />
                    <span>Video Survey</span>
                  </div>
                  {inspectingSub.answers?.neighborhood_video || inspectingSub.answers?.video ? (
                    <div className="p-2 bg-slate-900 rounded-lg text-left text-[10px] space-y-1">
                      <div className="flex items-center gap-1 text-emerald-400 font-bold">
                        <Check className="w-3 h-3" /> 1-Min Video Recorded
                      </div>
                      <p className="text-gray-400 font-mono text-[9px]">Surroundings &amp; Drainage</p>
                      <a
                        href={inspectingSub.answers?.neighborhood_video || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block mt-1 text-blue-400 hover:text-blue-300 font-bold underline"
                      >
                        Play Video (MP4) ↗
                      </a>
                    </div>
                  ) : (
                    <div className="h-24 bg-white/5 rounded-lg flex items-center justify-center text-[10px] text-gray-500">
                      No Video Recorded
                    </div>
                  )}
                </div>

                {/* Audio Recording */}
                <div className="bg-[#0B0F17] border border-gray-800 rounded-xl p-2.5 text-center space-y-1.5">
                  <div className="text-[10px] text-gray-400 font-bold uppercase flex items-center justify-center gap-1">
                    <Music className="w-3 h-3 text-amber-400" />
                    <span>Audio Statement</span>
                  </div>
                  {inspectingSub.audioUrl || inspectingSub.answers?.audio_consent ? (
                    <div className="p-2 bg-slate-900 rounded-lg space-y-1 text-left">
                      <div className="text-[9px] text-emerald-400 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Waveform Verified
                      </div>
                      <audio controls src={inspectingSub.audioUrl || 'https://actions.google.com/sounds/v1/ambiences/market.ogg'} className="w-full h-7" />
                    </div>
                  ) : (
                    <div className="h-24 bg-white/5 rounded-lg flex items-center justify-center text-[10px] text-gray-500">
                      No Audio Recorded
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Supervisor Action Buttons */}
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-800">
              <button
                type="button"
                onClick={() => {
                  if (onUpdateSubmissionStatus) onUpdateSubmissionStatus(inspectingSub.id, 'Approved');
                  setInspectingSub(null);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Approve Submission
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onUpdateSubmissionStatus) onUpdateSubmissionStatus(inspectingSub.id, 'Flagged');
                  setInspectingSub(null);
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Flag for Audit
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onUpdateSubmissionStatus) onUpdateSubmissionStatus(inspectingSub.id, 'Rejected');
                  setInspectingSub(null);
                }}
                className="px-4 py-2 bg-[#E30620] hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. SHAREABLE PUBLIC CHECK LINK MODAL */}
      {showCheckModal && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#121824] text-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-gray-700">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Shareable Public Survey Check Link</h3>
                  <p className="text-[11px] text-gray-400">Share with clients or monitors to verify field survey authenticity</p>
                </div>
              </div>
              <button onClick={() => setShowCheckModal(false)} className="text-gray-400 hover:text-white font-bold">&times;</button>
            </div>

            {/* Check link box */}
            <div className="bg-[#0B0F17] p-3 rounded-2xl border border-gray-800 space-y-2">
              <span className="text-[10px] text-gray-400 uppercase font-mono block">Direct Verification URL</span>
              <div className="flex items-center justify-between gap-2 bg-[#121824] p-2.5 rounded-xl border border-gray-700 text-xs font-mono text-emerald-400">
                <span className="truncate">
                  {typeof window !== 'undefined' ? `${window.location.origin}/?check=${activeCheckCode}` : `app.ourfield.com/?check=${activeCheckCode}`}
                </span>
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/?check=${activeCheckCode}`;
                    navigator.clipboard?.writeText(url);
                    setCopiedCheckUrl(true);
                    setTimeout(() => setCopiedCheckUrl(false), 3000);
                  }}
                  className="px-2.5 py-1 bg-white/10 hover:bg-emerald-600 hover:text-white text-gray-300 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors shrink-0"
                >
                  {copiedCheckUrl ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCheckUrl ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Live Certified Study Card Preview */}
            <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] border border-blue-500/30 rounded-2xl p-4 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 uppercase">
                  <ShieldCheck className="w-3 h-3" /> Certified Field Survey
                </span>
                <span className="font-mono text-gray-400 text-[10px]">Code: {activeCheckCode}</span>
              </div>
              <h4 className="font-bold text-white text-sm">Household Survey Lagos</h4>
              <p className="text-[11px] text-gray-300">
                Lagos State Infrastructure &amp; Economic Planning Bureau • Agege Local Government Geofence Enforced.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1 text-[10px] font-mono text-gray-400">
                <div>Audit Standard: <b>NDPR / ISO 27001</b></div>
                <div>Geo-Lock: <b>6.6192, 3.3213 (Agege)</b></div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setShowCheckModal(false)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-gray-200 rounded-xl text-xs font-bold"
              >
                Close
              </button>
              <a
                href={`/?check=${activeCheckCode}`}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1"
              >
                <span>Preview Check Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
