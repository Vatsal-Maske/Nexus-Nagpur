import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { Shield, AlertTriangle } from 'lucide-react';
import { NAGPUR_DATASET, calcRiskScore } from '../data/mockData';

const createStationIcon = () => L.divIcon({
  className: 'custom-station-icon',
  html: `<div class="w-7 h-7 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center text-white"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14]
});

const createJunctionIcon = (color, count) => L.divIcon({
  className: 'custom-junction-icon',
  html: `<div class="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-md border-2 border-white" style="background-color: ${color};">${count}</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14]
});

const createOfficerIcon = () => L.divIcon({
  className: 'custom-officer-icon',
  html: `<div class="w-6 h-6 rounded-full bg-emerald-600 border-2 border-white shadow-md flex items-center justify-center text-white"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12]
});

export default function ControlMap() {
  const centerLat = 21.1458;
  const centerLng = 79.0882;

  const defaultCounts = {
    "JNC_VARIETY_SQ": 34, "JNC_JHANSI_RANI_SQ": 20, "JNC_SADAR_BAZAAR_SQ": 28,
    "JNC_TELEPHONE_EXCHANGE_SQ": 42, "JNC_CHHATRAPATI_SQ": 45, "JNC_PRIDE_HOTEL_SQ": 32,
    "JNC_ZERO_MILE": 30, "JNC_AUTOMOBILE_SQ": 36
  };

  const stations = NAGPUR_DATASET.police_zones.map(z => z.police_station);
  const roadCorridors = NAGPUR_DATASET.road_corridors || [];
  const officers = NAGPUR_DATASET.officers;

  const junctions = [];
  NAGPUR_DATASET.police_zones.forEach(zone => {
    zone.junctions.forEach(jnc => {
      const count = defaultCounts[jnc.junction_id] || 22;
      const evalRes = calcRiskScore(count, jnc.historical_accident_score, jnc.road_capacity_vph, 17, 0);
      junctions.push({ ...jnc, live_vehicle_count: count, risk_eval: evalRes, zone_name: zone.name, station_name: zone.police_station.name });
    });
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Sidebar */}
      <div className="lg:col-span-3 bg-gray-50 border-r border-gray-200 p-4 space-y-4 text-sm">
        <div>
          <h3 className="font-bold text-gray-900 mb-3">Traffic Layers</h3>
          <div className="space-y-2 text-gray-600">
            <div className="flex items-center space-x-2"><span className="w-3 h-3 rounded-full bg-blue-600"></span> Police Stations (4)</div>
            <div className="flex items-center space-x-2"><span className="w-3 h-3 rounded-full bg-red-500"></span> High Risk Junctions (3)</div>
            <div className="flex items-center space-x-2"><span className="w-3 h-3 rounded-full bg-amber-500"></span> Medium Risk Junctions (5)</div>
            <div className="flex items-center space-x-2"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> Patrol Units (13)</div>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-gray-900 mb-3">High Risk Incidents</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {junctions.filter(j => j.risk_eval.risk_level === 'High').slice(0, 4).map(j => (
              <div key={j.junction_id} className="bg-white p-3 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-800 text-xs flex items-center">
                    <AlertTriangle className="w-3 h-3 mr-1 text-red-500" />
                    {j.name}
                  </span>
                  <span className="text-[10px] font-bold text-white px-2 py-0.5 rounded" style={{ backgroundColor: j.risk_eval.color }}>
                    {j.risk_eval.risk_score}
                  </span>
                </div>
                <div className="text-[11px] text-gray-500 mt-1">{j.live_vehicle_count} vehicles • {j.station_name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="lg:col-span-9 h-[500px]">
        <MapContainer center={[centerLat, centerLng]} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url='https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
            subdomains='abcd'
            maxZoom={20}
          />

          {roadCorridors.map(corridor => (
            <Polyline key={corridor.id} positions={corridor.points} pathOptions={{ color: corridor.color, weight: corridor.weight || 5, opacity: 0.8 }} />
          ))}

          {stations.map(st => (
            <Marker key={st.station_id} position={[st.lat, st.lng]} icon={createStationIcon()}>
              <Popup>
                <div className="text-xs">
                  <div className="font-bold text-blue-600 flex items-center"><Shield className="w-3 h-3 mr-1" />{st.name}</div>
                  <div className="text-gray-600">Officers: {st.total_officers}</div>
                </div>
              </Popup>
            </Marker>
          ))}

          {junctions.map(j => {
            const evalRes = j.risk_eval;
            const isHigh = evalRes.risk_level === 'High';
            return (
              <React.Fragment key={j.junction_id}>
                <Circle center={[j.lat, j.lng]} radius={isHigh ? 500 : 300} pathOptions={{ color: evalRes.color, fillColor: evalRes.color, fillOpacity: isHigh ? 0.25 : 0.12, weight: 1 }} />
                <Marker position={[j.lat, j.lng]} icon={createJunctionIcon(evalRes.color, j.live_vehicle_count)}>
                  <Popup>
                    <div className="text-xs min-w-[160px]">
                      <div className="font-bold text-gray-900">{j.name}</div>
                      <div className="font-mono" style={{ color: evalRes.color }}>Risk: {evalRes.risk_score} ({evalRes.risk_level})</div>
                      <div className="text-gray-500">Vehicles: {j.live_vehicle_count}</div>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            );
          })}

          {officers.slice(0, 6).map(off => (
            <Marker key={off.officer_id} position={[off.current_lat, off.current_lng]} icon={createOfficerIcon()}>
              <Popup>
                <div className="text-xs">
                  <div className="font-bold text-emerald-600">{off.rank} {off.name}</div>
                  <div className="text-gray-600">{off.vehicle}</div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
