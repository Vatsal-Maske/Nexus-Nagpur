import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { Shield, AlertTriangle, Layers, MapPin, Activity, Flame, Eye, EyeOff, Navigation } from 'lucide-react';
import { NAGPUR_DATASET, calcRiskScore } from '../data/mockData';

// Map Icon Creators for standard layers
const createStationIcon = () => L.divIcon({
  className: 'custom-station-icon',
  html: `<div class="w-6 h-6 rounded-full bg-blue-600 border-2 border-white shadow-md flex items-center justify-center text-white"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12]
});

const createJunctionIcon = (color, count) => L.divIcon({
  className: 'custom-junction-icon',
  html: `<div class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-md border-2 border-white" style="background-color: ${color};">${count}</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12]
});

const createOfficerIcon = () => L.divIcon({
  className: 'custom-officer-icon',
  html: `<div class="w-5 h-5 rounded-full bg-emerald-600 border-2 border-white shadow-md flex items-center justify-center text-white"><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10]
});

const createDispatchedOfficerIcon = (name) => L.divIcon({
  className: 'custom-dispatched-officer-icon',
  html: `
    <div class="relative flex items-center justify-center cursor-pointer">
      <div class="absolute -inset-1.5 rounded-full bg-emerald-500 opacity-80 animate-ping"></div>
      <div class="w-8 h-8 rounded-full bg-emerald-600 border-2 border-white shadow-xl flex items-center justify-center text-white font-bold text-xs z-10">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
      </div>
      <div class="absolute -bottom-5 bg-slate-900 text-emerald-300 font-mono text-[9px] font-bold px-2 py-0.5 rounded border border-emerald-400/50 shadow-md whitespace-nowrap z-20">
        👮 ON DUTY
      </div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});

/**
 * Creates an ultra-smooth, organic geographic heatmap radial gradient Leaflet icon.
 * Features soft gaussian edges (filter: blur), subtle opacity blending, zero hard borders, and intensity centered at coordinate.
 */
const createHeatmapRegionIcon = (camId, heatLevel, riskScore, vehicleCount) => {
  let primaryColor, coreColor, outerColor, sizePx;
  
  if (riskScore >= 0.70) {
    primaryColor = '#ef4444'; // Vivid Red (HIGH RISK)
    coreColor = '#dc2626';
    outerColor = '#f87171';
    sizePx = Math.round(180 + riskScore * 80); // 180px - 260px
  } else if (riskScore >= 0.40) {
    primaryColor = '#f59e0b'; // Amber (MEDIUM RISK)
    coreColor = '#d97706';
    outerColor = '#fbbf24';
    sizePx = Math.round(140 + riskScore * 60); // 140px - 200px
  } else {
    primaryColor = '#10b981'; // Emerald (LOW RISK)
    coreColor = '#059669';
    outerColor = '#34d399';
    sizePx = Math.round(110 + riskScore * 40); // 110px - 150px
  }

  // Smooth Gaussian opacity scaling based on risk score
  const opacityCenter = Math.min(0.72, 0.35 + riskScore * 0.35);
  const opacityMid = Math.min(0.38, 0.12 + riskScore * 0.25);
  const opacityOuter = Math.min(0.12, 0.03 + riskScore * 0.08);

  const halfSize = sizePx / 2;
  const gradientId = `cctv-heat-grad-${camId}`;

  const svgHtml = `
    <div class="cctv-heatmap-blob-container pointer-events-none" style="width: ${sizePx}px; height: ${sizePx}px; display: flex; align-items: center; justify-content: center;">
      <svg width="${sizePx}" height="${sizePx}" viewBox="0 0 ${sizePx} ${sizePx}" style="overflow: visible; filter: blur(8px); opacity: 0.92;">
        <defs>
          <radialGradient id="${gradientId}" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="${coreColor}" stop-opacity="${opacityCenter}" />
            <stop offset="25%" stop-color="${primaryColor}" stop-opacity="${opacityCenter * 0.85}" />
            <stop offset="55%" stop-color="${outerColor}" stop-opacity="${opacityMid}" />
            <stop offset="80%" stop-color="${primaryColor}" stop-opacity="${opacityOuter}" />
            <stop offset="100%" stop-color="${primaryColor}" stop-opacity="0" />
          </radialGradient>
        </defs>
        <circle cx="${halfSize}" cy="${halfSize}" r="${halfSize * 0.92}" fill="url(#${gradientId})" />
      </svg>
    </div>
  `;

  return L.divIcon({
    className: 'cctv-heatmap-icon-clean',
    html: svgHtml,
    iconSize: [sizePx, sizePx],
    iconAnchor: [halfSize, halfSize],
    popupAnchor: [0, -10]
  });
};

const MAP_PROVIDERS = {
  google_roadmap: {
    name: 'Google Maps (Roadmap)',
    url: 'https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    attribution: '&copy; <a href="https://www.google.com/maps">Google Maps</a>'
  },
  carto_dark: {
    name: 'Carto Dark (Glow Mode)',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    subdomains: ['a', 'b', 'c', 'd'],
    attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>'
  },
  google_satellite: {
    name: 'Google Maps (Satellite)',
    url: 'https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    attribution: '&copy; <a href="https://www.google.com/maps">Google Maps</a>'
  },
  carto: {
    name: 'Carto Light (Clean Map)',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    subdomains: ['a', 'b', 'c', 'd'],
    attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>'
  }
};

// Fixed Default 4 CCTV Regions Dataset
const DEFAULT_CCTV_REGIONS = {
  CAM_01: { camId: "CAM_01", regionName: "Region 1 - Variety Square (Sitabuldi)", junctionId: "JNC_VARIETY_SQ", lat: 21.1462, lng: 79.0885, vehicleCount: 18, historicalScore: 0.85, riskScore: 0.88, heatLevel: "HIGH" },
  CAM_02: { camId: "CAM_02", regionName: "Region 2 - Jhansi Rani Square", junctionId: "JNC_JHANSI_RANI_SQ", lat: 21.1415, lng: 79.0830, vehicleCount: 26, historicalScore: 0.62, riskScore: 0.72, heatLevel: "HIGH" },
  CAM_03: { camId: "CAM_03", regionName: "Region 3 - Sadar Bazaar Square", junctionId: "JNC_SADAR_BAZAAR_SQ", lat: 21.1618, lng: 79.0825, vehicleCount: 14, historicalScore: 0.78, riskScore: 0.48, heatLevel: "MEDIUM" },
  CAM_04: { camId: "CAM_04", regionName: "Region 4 - Chhatrapati Square", junctionId: "JNC_CHHATRAPATI_SQ", lat: 21.1110, lng: 79.0650, vehicleCount: 32, historicalScore: 0.92, riskScore: 0.94, heatLevel: "HIGH" }
};

export default function ControlMap({ cctvRegionsData, dispatchedOfficers = {} }) {
  const [mapProviderKey, setMapProviderKey] = useState('google_roadmap');

  // Interactive Layer Toggles to easily filter out visual clutter
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showJunctions, setShowJunctions] = useState(true);
  const [showStations, setShowStations] = useState(true);
  const [showPatrols, setShowPatrols] = useState(true);
  const [showCorridors, setShowCorridors] = useState(true);

  const centerLat = 21.1458;
  const centerLng = 79.0882;

  // Combine prop data or fallback to defaults, ALWAYS strictly capped at 4 CCTV regions
  const activeCctvData = cctvRegionsData && Object.keys(cctvRegionsData).length >= 4 
    ? cctvRegionsData 
    : DEFAULT_CCTV_REGIONS;

  const cctvRegionsList = Object.values(activeCctvData).slice(0, 4);

  const defaultCounts = {
    "JNC_VARIETY_SQ": 34, "JNC_JHANSI_RANI_SQ": 20, "JNC_SADAR_BAZAAR_SQ": 28,
    "JNC_TELEPHONE_EXCHANGE_SQ": 42, "JNC_CHHATRAPATI_SQ": 45, "JNC_PRIDE_HOTEL_SQ": 32,
    "JNC_ZERO_MILE": 30, "JNC_AUTOMOBILE_SQ": 36
  };

  const stations = NAGPUR_DATASET.police_zones.map(z => z.police_station);
  const roadCorridors = NAGPUR_DATASET.road_corridors || [];
  
  // Merge static officers dataset with active dispatched officers
  const dispatchedList = Object.values(dispatchedOfficers);
  const officers = NAGPUR_DATASET.officers.map(off => {
    const activeDispatch = dispatchedList.find(d => d.officer_id === off.officer_id || d.badge === off.badge);
    if (activeDispatch) {
      return {
        ...off,
        is_dispatched: true,
        current_lat: activeDispatch.target_lat ? activeDispatch.target_lat + 0.0006 : off.current_lat,
        current_lng: activeDispatch.target_lng ? activeDispatch.target_lng + 0.0006 : off.current_lng,
        assigned_area_name: activeDispatch.target_junction_name,
        target_junction_id: activeDispatch.target_junction_id,
        dispatched_at: activeDispatch.dispatched_at,
        orig_lat: off.current_lat,
        orig_lng: off.current_lng
      };
    }
    return off;
  });

  const junctions = [];
  NAGPUR_DATASET.police_zones.forEach(zone => {
    zone.junctions.forEach(jnc => {
      const count = defaultCounts[jnc.junction_id] || 22;
      const evalRes = calcRiskScore(count, jnc.historical_accident_score, jnc.road_capacity_vph, 17, 0);
      junctions.push({ ...jnc, live_vehicle_count: count, risk_eval: evalRes, zone_name: zone.name, station_name: zone.police_station.name });
    });
  });

  const activeProvider = MAP_PROVIDERS[mapProviderKey];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Sidebar Controls & Layer Filter Toggles */}
      <div className="lg:col-span-3 bg-gray-50 border-r border-gray-200 p-4 space-y-4 text-sm">
        {/* Map Provider Selector */}
        <div>
          <h3 className="font-bold text-gray-900 mb-2 flex items-center text-xs uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
            Map Provider & Style
          </h3>
          <select 
            value={mapProviderKey}
            onChange={(e) => setMapProviderKey(e.target.value)}
            className="w-full bg-white border border-gray-300 text-gray-800 text-xs rounded-lg px-2.5 py-2 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-xs"
          >
            {Object.entries(MAP_PROVIDERS).map(([key, provider]) => (
              <option key={key} value={key}>
                {provider.name}
              </option>
            ))}
          </select>
        </div>

        {/* Interactive Layer Toggle Switches (To remove clutter instantly!) */}
        <div>
          <h3 className="font-bold text-gray-900 mb-2.5 flex items-center justify-between text-xs uppercase tracking-wider">
            <span className="flex items-center">
              <MapPin className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
              Layer Filter Toggles
            </span>
            <span className="text-[10px] text-gray-400 font-normal">Click to hide/show</span>
          </h3>
          <div className="space-y-1.5 text-xs">
            {/* 1. Heatmap Toggle */}
            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`w-full flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
                showHeatmap ? 'bg-red-50/80 border-red-200 text-red-900 font-semibold' : 'bg-white border-gray-200 text-gray-400 opacity-60'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Flame className={`w-3.5 h-3.5 ${showHeatmap ? 'text-red-600' : 'text-gray-400'}`} />
                <span>CCTV Heatmap (4 Regions)</span>
              </div>
              {showHeatmap ? <Eye className="w-3.5 h-3.5 text-red-600" /> : <EyeOff className="w-3.5 h-3.5 text-gray-400" />}
            </button>

            {/* 2. Junction Markers Toggle */}
            <button
              onClick={() => setShowJunctions(!showJunctions)}
              className={`w-full flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
                showJunctions ? 'bg-amber-50/80 border-amber-200 text-amber-900 font-semibold' : 'bg-white border-gray-200 text-gray-400 opacity-60'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Traffic Junction Badges (12)</span>
              </div>
              {showJunctions ? <Eye className="w-3.5 h-3.5 text-amber-600" /> : <EyeOff className="w-3.5 h-3.5 text-gray-400" />}
            </button>

            {/* 3. Police Stations Toggle */}
            <button
              onClick={() => setShowStations(!showStations)}
              className={`w-full flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
                showStations ? 'bg-blue-50/80 border-blue-200 text-blue-900 font-semibold' : 'bg-white border-gray-200 text-gray-400 opacity-60'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Shield className={`w-3.5 h-3.5 ${showStations ? 'text-blue-600' : 'text-gray-400'}`} />
                <span>Police Stations (4)</span>
              </div>
              {showStations ? <Eye className="w-3.5 h-3.5 text-blue-600" /> : <EyeOff className="w-3.5 h-3.5 text-gray-400" />}
            </button>

            {/* 4. Patrol Units Toggle */}
            <button
              onClick={() => setShowPatrols(!showPatrols)}
              className={`w-full flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
                showPatrols ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900 font-semibold' : 'bg-white border-gray-200 text-gray-400 opacity-60'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Dispatched Officers ({officers.filter(o => o.is_dispatched).length} On Duty)</span>
              </div>
              {showPatrols ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5 text-gray-400" />}
            </button>

            {/* 5. Corridors Toggle */}
            <button
              onClick={() => setShowCorridors(!showCorridors)}
              className={`w-full flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
                showCorridors ? 'bg-purple-50/80 border-purple-200 text-purple-900 font-semibold' : 'bg-white border-gray-200 text-gray-400 opacity-60'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Navigation className={`w-3.5 h-3.5 ${showCorridors ? 'text-purple-600' : 'text-gray-400'}`} />
                <span>Road Corridors</span>
              </div>
              {showCorridors ? <Eye className="w-3.5 h-3.5 text-purple-600" /> : <EyeOff className="w-3.5 h-3.5 text-gray-400" />}
            </button>
          </div>
        </div>

        {/* Active Dispatched Officers Live Status */}
        {dispatchedList.length > 0 && (
          <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
            <h3 className="font-bold text-emerald-900 mb-1.5 flex items-center text-xs uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5 mr-1 text-emerald-600" />
              Active Deployments ({dispatchedList.length})
            </h3>
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {dispatchedList.map(disp => (
                <div key={disp.officer_id} className="bg-white p-2 rounded-lg border border-emerald-200 text-xs shadow-2xs">
                  <div className="font-bold text-emerald-900 flex items-center justify-between">
                    <span>{disp.rank} {disp.name}</span>
                    <span className="text-[9px] bg-emerald-600 text-white font-mono font-bold px-1.5 py-0.2 rounded">ON DUTY</span>
                  </div>
                  <div className="text-[10px] text-gray-600 mt-0.5 font-medium truncate">
                    📍 {disp.target_junction_name || disp.target_junction_id}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4 CCTV Heatmap Regions Live Status */}
        <div>
          <h3 className="font-bold text-gray-900 mb-2 flex items-center justify-between text-xs uppercase tracking-wider">
            <span className="flex items-center">
              <Activity className="w-3.5 h-3.5 mr-1 text-red-500" />
              CCTV Heatmap Regions
            </span>
            <span className="bg-red-100 text-red-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
              EXACTLY 4
            </span>
          </h3>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {cctvRegionsList.map((reg, idx) => {
              const score = reg.riskScore || 0.50;
              const levelColor = score >= 0.70 ? 'bg-red-500 text-white' : score >= 0.40 ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white';
              return (
                <div key={reg.camId} className="bg-white p-2 rounded-lg border border-gray-200 text-xs flex items-center justify-between shadow-2xs">
                  <div>
                    <div className="font-semibold text-gray-800 text-[11px] truncate max-w-[150px]">
                      Region {idx + 1}: {reg.regionName.split('-')[1] || reg.regionName}
                    </div>
                    <div className="text-[10px] text-gray-500">
                      Live Vehicles: <strong>{reg.vehicleCount}</strong>
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${levelColor}`}>
                    {score.toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Interactive Map View */}
      <div className="lg:col-span-9 h-[520px] relative">
        <MapContainer center={[centerLat, centerLng]} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            key={mapProviderKey}
            attribution={activeProvider.attribution}
            url={activeProvider.url}
            subdomains={activeProvider.subdomains}
            maxZoom={20}
          />

          {/* 1. Road Corridors (Sleek Thin Lines) */}
          {showCorridors && roadCorridors.map(corridor => (
            <Polyline key={corridor.id} positions={corridor.points} pathOptions={{ color: corridor.color, weight: 3, opacity: 0.55 }} />
          ))}

          {/* 1.5 Active Police Dispatch Route Lines */}
          {showPatrols && officers.filter(o => o.is_dispatched).map(off => (
            <Polyline
              key={`dispatch-route-${off.officer_id}`}
              positions={[[off.orig_lat, off.orig_lng], [off.current_lat, off.current_lng]]}
              pathOptions={{ color: '#10b981', weight: 4, opacity: 0.85, dashArray: '6, 8' }}
            />
          ))}

          {/* 2. CCTV TRAFFIC HEATMAP LAYER — 4 SMOOTH ORGANIC GAUSSIAN REGIONS */}
          {showHeatmap && cctvRegionsList.map((region) => {
            const riskScore = region.riskScore || 0.50;
            const vehicleCount = region.vehicleCount || 0;
            const heatLevel = riskScore >= 0.70 ? 'HIGH' : riskScore >= 0.40 ? 'MEDIUM' : 'LOW';

            return (
              <Marker
                key={`cctv-heatmap-${region.camId}`}
                position={[region.lat, region.lng]}
                icon={createHeatmapRegionIcon(region.camId, heatLevel, riskScore, vehicleCount)}
                interactive={false}
              />
            );
          })}

          {/* 3. Police Stations (4) */}
          {showStations && stations.map(st => (
            <Marker key={st.station_id} position={[st.lat, st.lng]} icon={createStationIcon()}>
              <Popup>
                <div className="text-xs">
                  <div className="font-bold text-blue-600 flex items-center"><Shield className="w-3.5 h-3.5 mr-1" />{st.name}</div>
                  <div className="text-gray-600">Officers: {st.total_officers}</div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* 4. Junction Markers (12 Total) */}
          {showJunctions && junctions.map(j => {
            const evalRes = j.risk_eval;
            const assignedOfficer = dispatchedOfficers[j.junction_id];

            return (
              <Marker key={j.junction_id} position={[j.lat, j.lng]} icon={createJunctionIcon(evalRes.color, j.live_vehicle_count)}>
                <Popup>
                  <div className="text-xs min-w-[170px]">
                    <div className="font-bold text-gray-900">{j.name}</div>
                    <div className="font-mono" style={{ color: evalRes.color }}>Risk: {evalRes.risk_score} ({evalRes.risk_level})</div>
                    <div className="text-gray-500">Live Vehicles: {j.live_vehicle_count}</div>
                    {assignedOfficer && (
                      <div className="mt-2 pt-1.5 border-t border-emerald-200 bg-emerald-50 p-1.5 rounded text-emerald-800 text-[11px]">
                        <div className="font-bold flex items-center text-emerald-900">
                          <Shield className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                          Police On Duty
                        </div>
                        <div className="font-semibold text-emerald-700 mt-0.5">
                          {assignedOfficer.rank} {assignedOfficer.name}
                        </div>
                        <div className="text-[10px] text-emerald-600 font-mono">
                          {assignedOfficer.vehicle} • {assignedOfficer.station_id}
                        </div>
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* 5. Dispatched Officers On Duty Only */}
          {showPatrols && officers.filter(off => off.is_dispatched).map(off => (
            <Marker 
              key={off.officer_id} 
              position={[off.current_lat, off.current_lng]} 
              icon={createDispatchedOfficerIcon(off.name)}
            >
              <Popup>
                <div className="text-xs min-w-[160px]">
                  <div className="font-bold text-emerald-700 text-sm">{off.rank} {off.name}</div>
                  <div className="text-gray-600 font-mono text-[11px]">{off.vehicle} • {off.badge}</div>
                  <div className="mt-2 p-1.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 font-medium">
                    <div className="font-bold text-emerald-950 flex items-center">
                      <Shield className="w-3.5 h-3.5 mr-1 text-emerald-700" />
                      STATUS: DISPATCHED ON DUTY
                    </div>
                    <div className="mt-0.5 text-[11px]">
                      Assigned: <strong>{off.assigned_area_name}</strong>
                    </div>
                    {off.dispatched_at && (
                      <div className="text-[10px] text-emerald-700 font-mono mt-0.5">
                        Time: {off.dispatched_at}
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
