import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, Shield, CheckCircle2, ChevronDown, ChevronUp, UserCheck, Navigation, Clock, Zap, Info, Flame, AlertCircle } from 'lucide-react';
import { NAGPUR_DATASET, calcRiskScore, solveDispatch } from '../data/mockData';

export default function RiskMatrix({ cctvRegionsData, activeIncident, dispatchedOfficers: propDispatchedOfficers, onDispatchOfficer }) {
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [localDispatchedOfficers, setLocalDispatchedOfficers] = useState({});

  const dispatchedOfficers = propDispatchedOfficers || localDispatchedOfficers;

  // Map of 12 predefined junctions in Nagpur dataset
  const baseJunctions = [
    { junction_id: "JNC_CHHATRAPATI_SQ", name: "Chhatrapati Square (Wardha Rd)", zone_name: "Zone 4 - South/Wardha Road", station_name: "Ajni Police Station", station_id: "PS_AJNI", lat: 21.1110, lng: 79.0650, historical_accident_score: 0.92, road_capacity_vph: 3000, blackspot_severity: "Critical (Top 1 Blackspot)", baseline_count: 45, default_officers: 0, cam_id: "CAM_04" },
    { junction_id: "JNC_VARIETY_SQ", name: "Variety Square (Sitabuldi)", zone_name: "Zone 1 - Central Nagpur", station_name: "Sitabuldi Police Station", station_id: "PS_SITABULDI", lat: 21.1462, lng: 79.0885, historical_accident_score: 0.85, road_capacity_vph: 2400, blackspot_severity: "High (Top 5 Blackspot)", baseline_count: 34, default_officers: 0, cam_id: "CAM_01" },
    { junction_id: "JNC_TELEPHONE_EXCHANGE_SQ", name: "Telephone Exchange Square (Central Ave)", zone_name: "Zone 3 - East/Itwari", station_name: "Lakadganj Police Station", station_id: "PS_LAKADGANJ", lat: 21.1520, lng: 79.1125, historical_accident_score: 0.88, road_capacity_vph: 2500, blackspot_severity: "High (Top 3 Blackspot)", baseline_count: 42, default_officers: 1 },
    { junction_id: "JNC_SADAR_BAZAAR_SQ", name: "Sadar Bazaar Square (Residency Rd)", zone_name: "Zone 2 - North/Sadar", station_name: "Sadar Police Station", station_id: "PS_SADAR", lat: 21.1618, lng: 79.0825, historical_accident_score: 0.78, road_capacity_vph: 2100, blackspot_severity: "High", baseline_count: 28, default_officers: 1, cam_id: "CAM_03" },
    { junction_id: "JNC_PRIDE_HOTEL_SQ", name: "Pride Hotel Square (Airport Rd)", zone_name: "Zone 4 - South/Wardha Road", station_name: "Ajni Police Station", station_id: "PS_AJNI", lat: 21.0920, lng: 79.0580, historical_accident_score: 0.75, road_capacity_vph: 2800, blackspot_severity: "High", baseline_count: 32, default_officers: 0 },
    { junction_id: "JNC_ZERO_MILE", name: "Zero Mile Freedom Park Intersection", zone_name: "Zone 2 - North/Sadar", station_name: "Sadar Police Station", station_id: "PS_SADAR", lat: 21.1495, lng: 79.0812, historical_accident_score: 0.70, road_capacity_vph: 2600, blackspot_severity: "High", baseline_count: 30, default_officers: 1 },
    { junction_id: "JNC_AUTOMOBILE_SQ", name: "Automobile Square (Kalamna Rd)", zone_name: "Zone 3 - East/Itwari", station_name: "Lakadganj Police Station", station_id: "PS_LAKADGANJ", lat: 21.1620, lng: 79.1240, historical_accident_score: 0.72, road_capacity_vph: 2300, blackspot_severity: "High", baseline_count: 36, default_officers: 0 },
    { junction_id: "JNC_DOSAR_VAISHYA_SQ", name: "Dosar Vaishya Square (Itwari)", zone_name: "Zone 3 - East/Itwari", station_name: "Lakadganj Police Station", station_id: "PS_LAKADGANJ", lat: 21.1545, lng: 79.0980, historical_accident_score: 0.65, road_capacity_vph: 1700, blackspot_severity: "Medium-High", baseline_count: 25, default_officers: 0 },
    { junction_id: "JNC_JHANSI_RANI_SQ", name: "Jhansi Rani Square", zone_name: "Zone 1 - Central Nagpur", station_name: "Sitabuldi Police Station", station_id: "PS_SITABULDI", lat: 21.1415, lng: 79.0830, historical_accident_score: 0.62, road_capacity_vph: 1800, blackspot_severity: "Medium", baseline_count: 20, default_officers: 0, cam_id: "CAM_02" },
    { junction_id: "JNC_RAHATE_COLONY_SQ", name: "Rahate Colony Square", zone_name: "Zone 4 - South/Wardha Road", station_name: "Ajni Police Station", station_id: "PS_AJNI", lat: 21.1270, lng: 79.0740, historical_accident_score: 0.58, road_capacity_vph: 2100, blackspot_severity: "Medium", baseline_count: 19, default_officers: 0 },
    { junction_id: "JNC_LAW_COLLEGE_SQ", name: "Law College Square (Amravati Rd)", zone_name: "Zone 1 - Central Nagpur", station_name: "Sitabuldi Police Station", station_id: "PS_SITABULDI", lat: 21.1490, lng: 79.0665, historical_accident_score: 0.55, road_capacity_vph: 2000, blackspot_severity: "Medium", baseline_count: 22, default_officers: 1 },
    { junction_id: "JNC_LIC_SQ", name: "LIC Square (Kamptee Rd)", zone_name: "Zone 2 - North/Sadar", station_name: "Sadar Police Station", station_id: "PS_SADAR", lat: 21.1560, lng: 79.0890, historical_accident_score: 0.48, road_capacity_vph: 2200, blackspot_severity: "Medium", baseline_count: 20, default_officers: 0 }
  ];

  // Dynamically compute ranking, live density, risk score, status, and CAD recommendations
  const computeRankedMatrix = useCallback(() => {
    return baseJunctions.map(jnc => {
      let liveCount = jnc.baseline_count;
      let incidentBonus = 0;
      let isIncidentActive = false;
      let incidentDesc = "";

      // 1. Incorporate Live CCTV Analysis Data if available
      if (jnc.cam_id && cctvRegionsData && cctvRegionsData[jnc.cam_id]) {
        liveCount = cctvRegionsData[jnc.cam_id].vehicleCount || liveCount;
      }

      // 2. Incorporate Active Incident Simulation Overrides
      if (activeIncident) {
        if (activeIncident.targetJunctionId === jnc.junction_id) {
          liveCount = activeIncident.injectedCount || liveCount + 25;
          incidentBonus = activeIncident.weatherBonus || 0.15;
          isIncidentActive = true;
          incidentDesc = activeIncident.title || "Emergency Incident Reported";
        }
      }

      // Calculate Composite Risk Score: (0.40 * Live Density Ratio) + (0.60 * Historical Blackspot Score) + Incident Bonus
      const liveDensityRatio = Math.min(1.0, liveCount / 35.0);
      const rawScore = (0.40 * liveDensityRatio) + (0.60 * jnc.historical_accident_score) + incidentBonus;
      const riskScore = parseFloat(Math.min(0.99, Math.max(0.05, rawScore)).toFixed(2));

      let riskLevel = "Low";
      let badgeColor = "#10B981"; // Green
      if (riskScore >= 0.70) {
        riskLevel = "High";
        badgeColor = "#EF4444"; // Red
      } else if (riskScore >= 0.40) {
        riskLevel = "Medium";
        badgeColor = "#F59E0B"; // Amber
      }

      // Officer Allocation & Status Determination
      const assignedOfficer = dispatchedOfficers[jnc.junction_id];
      const assignedCount = (jnc.default_officers || 0) + (assignedOfficer ? 1 : 0);
      const requiredOfficers = riskScore >= 0.70 ? 2 : riskScore >= 0.40 ? 1 : 0;

      let statusKey = "NORMAL_PATROL";
      let statusLabel = "Normal Patrol";
      let statusBg = "bg-emerald-50 text-emerald-700 border-emerald-200";
      let statusIcon = <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />;

      if (isIncidentActive) {
        statusKey = "ACTIVE_RESPONSE";
        statusLabel = "ACTIVE RESPONSE";
        statusBg = "bg-blue-50 text-blue-700 border-blue-200 animate-pulse";
        statusIcon = <Flame className="w-3.5 h-3.5 mr-1 text-blue-600" />;
      } else if (riskLevel === "High" && assignedCount === 0) {
        statusKey = "UNMANNED_HIGH_RISK";
        statusLabel = "UNMANNED HIGH RISK";
        statusBg = "bg-red-50 text-red-700 border-red-200 font-bold";
        statusIcon = <AlertTriangle className="w-3.5 h-3.5 mr-1 text-red-600" />;
      } else if (assignedCount < requiredOfficers) {
        statusKey = "UNDERSTAFFED";
        statusLabel = "UNDERSTAFFED";
        statusBg = "bg-amber-50 text-amber-700 border-amber-200";
        statusIcon = <AlertCircle className="w-3.5 h-3.5 mr-1 text-amber-600" />;
      } else if (assignedOfficer) {
        statusKey = "OFFICER_ON_DUTY";
        statusLabel = `ON DUTY: ${assignedOfficer.name.split(' ').pop()}`;
        statusBg = "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold";
        statusIcon = <Shield className="w-3.5 h-3.5 mr-1 text-emerald-700" />;
      }

      // Solve CAD Police Deployment Recommendation
      const cadDispatch = solveDispatch(jnc, 17, NAGPUR_DATASET.officers);

      return {
        ...jnc,
        live_count: liveCount,
        risk_score: riskScore,
        risk_level: riskLevel,
        badge_color: badgeColor,
        assigned_count: assignedCount,
        required_count: requiredOfficers,
        assigned_officer_info: assignedOfficer,
        status_key: statusKey,
        status_label: statusLabel,
        status_bg: statusBg,
        status_icon: statusIcon,
        is_incident_active: isIncidentActive,
        incident_desc: incidentDesc,
        cad_dispatch: cadDispatch
      };
    }).sort((a, b) => b.risk_score - a.risk_score); // Sort descending by risk score (Rank #1 = highest risk)
  }, [cctvRegionsData, activeIncident, dispatchedOfficers]);

  const [matrixData, setMatrixData] = useState(computeRankedMatrix());

  // Update table every 2 seconds
  useEffect(() => {
    setMatrixData(computeRankedMatrix());

    const interval = setInterval(() => {
      setMatrixData(computeRankedMatrix());
    }, 2000);

    return () => clearInterval(interval);
  }, [computeRankedMatrix]);

  const handleManualDispatch = (jnc) => {
    const recommended = jnc.cad_dispatch?.recommended_officer;
    if (recommended) {
      setLocalDispatchedOfficers(prev => ({
        ...prev,
        [jnc.junction_id]: recommended
      }));
      if (onDispatchOfficer) {
        onDispatchOfficer(jnc, recommended);
      }
    }
  };

  const topUnmanned = matrixData.find(j => j.status_key === "UNMANNED_HIGH_RISK" || j.risk_level === "High");

  return (
    <div className="space-y-4">
      {/* Top Priority Action Alert Banner */}
      {topUnmanned && (
        <div className="bg-gradient-to-r from-red-900 via-red-800 to-slate-900 text-white p-4 rounded-xl shadow-md border border-red-700 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center shrink-0 shadow-sm animate-pulse">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="bg-red-500 text-white font-mono font-bold text-[10px] px-2 py-0.5 rounded uppercase">
                  RANK #1 PRIORITY ALERT
                </span>
                <span className="text-xs text-red-200 font-semibold">{topUnmanned.zone_name}</span>
              </div>
              <h3 className="font-bold text-base mt-0.5 text-white">
                {topUnmanned.name} — Risk Score: <span className="font-mono text-red-300">{topUnmanned.risk_score.toFixed(2)}</span>
              </h3>
              <p className="text-xs text-red-200 mt-0.5">
                Live Density: <strong>{topUnmanned.live_count} vehicles</strong> • Blackspot: <strong>{(topUnmanned.historical_accident_score * 100).toFixed(0)}%</strong> • Status: <span className="underline font-semibold">{topUnmanned.status_label}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => handleManualDispatch(topUnmanned)}
            className="bg-white hover:bg-red-50 text-red-800 font-bold text-xs px-4 py-2.5 rounded-lg shadow-md transition-all flex items-center space-x-2 border border-red-200 cursor-pointer shrink-0"
          >
            <UserCheck className="w-4 h-4 text-red-700" />
            <span>DEPLOY RECOMMENDED OFFICER</span>
          </button>
        </div>
      )}

      {/* Main Dynamic Ranked Risk Matrix Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Table Header Summary */}
        <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <h3 className="font-bold text-xs tracking-wider uppercase">DYNAMIC CCTV & POLICE DEPLOYMENT RISK MATRIX</h3>
          </div>
          <div className="flex items-center space-x-3 text-xs text-slate-400">
            <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-ping" /> LIVE 2S RE-RANKING</span>
            <span>12 Junctions Monitored</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-gray-50 text-gray-600 uppercase text-[11px] font-semibold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4 w-14">Rank</th>
                <th className="py-3 px-4">Junction</th>
                <th className="py-3 px-4">Zone / Station</th>
                <th className="py-3 px-4">Risk Score</th>
                <th className="py-3 px-4">Live Density</th>
                <th className="py-3 px-4">Blackspot</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {matrixData.map((j, idx) => {
                const isExpanded = expandedRowId === j.junction_id;
                const rankNum = idx + 1;
                const recOfficer = j.cad_dispatch?.recommended_officer;

                // Rank badge color styling
                const rankBadgeClass = 
                  rankNum === 1 ? 'bg-red-600 text-white ring-2 ring-red-300' :
                  rankNum === 2 ? 'bg-amber-600 text-white' :
                  rankNum === 3 ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-700';

                return (
                  <React.Fragment key={j.junction_id}>
                    <tr className={`hover:bg-slate-50/80 transition-colors ${isExpanded ? 'bg-slate-50/90' : ''}`}>
                      {/* 1. Rank */}
                      <td className="py-3.5 px-4 font-mono">
                        <span className={`w-7 h-7 inline-flex items-center justify-center rounded-full text-xs font-bold shadow-2xs ${rankBadgeClass}`}>
                          #{rankNum}
                        </span>
                      </td>

                      {/* 2. Junction */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-900 flex items-center">
                          {j.name}
                          {j.is_incident_active && (
                            <span className="ml-2 bg-blue-100 text-blue-700 text-[9px] font-bold px-1.5 py-0.5 rounded border border-blue-200">
                              INCIDENT ACTIVE
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-gray-400 font-mono mt-0.5">{j.junction_id}</div>
                      </td>

                      {/* 3. Zone / Station */}
                      <td className="py-3.5 px-4">
                        <div className="text-xs text-gray-800 font-medium">{j.zone_name}</div>
                        <div className="text-[11px] text-blue-600 flex items-center font-medium mt-0.5">
                          <Shield className="w-3 h-3 mr-1" />
                          {j.station_name}
                        </div>
                      </td>

                      {/* 4. Risk Score */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-bold text-white shadow-2xs" style={{ backgroundColor: j.badge_color }}>
                          {j.risk_score.toFixed(2)} • {j.risk_level.toUpperCase()}
                        </span>
                      </td>

                      {/* 5. Live Density */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-bold text-gray-900 text-xs flex items-center">
                          <Zap className="w-3 h-3 mr-1 text-amber-500" />
                          {j.live_count} veh
                        </div>
                        <div className="text-[10px] text-gray-400">Cap: {j.road_capacity_vph} vph</div>
                      </td>

                      {/* 6. Blackspot */}
                      <td className="py-3.5 px-4 font-mono">
                        <span className="text-amber-700 font-bold text-xs">{(j.historical_accident_score * 100).toFixed(0)}%</span>
                        <div className="text-[10px] text-gray-400">{j.blackspot_severity}</div>
                      </td>

                      {/* 7. Status */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded border ${j.status_bg}`}>
                          {j.status_icon}
                          {j.status_label}
                        </span>
                        {j.assigned_officer_info && (
                          <div className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center">
                            <UserCheck className="w-3 h-3 mr-1" />
                            {j.assigned_officer_info.name} On Duty
                          </div>
                        )}
                      </td>

                      {/* Actions Toggle */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setExpandedRowId(isExpanded ? null : j.junction_id)}
                          className="inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg border border-blue-200 transition-colors cursor-pointer"
                        >
                          <Info className="w-3.5 h-3.5 mr-1" />
                          <span>{isExpanded ? 'Hide AI Analysis' : 'Explain & Recommend'}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
                        </button>
                      </td>
                    </tr>

                    {/* Expandable Explainable AI Rationale & CAD Deployment Panel */}
                    {isExpanded && (
                      <tr className="bg-slate-50/90 border-b border-gray-200">
                        <td colSpan={8} className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                            {/* 9. Explainable AI Rationale */}
                            <div className="space-y-2 border-r border-slate-100 pr-4">
                              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center">
                                <Info className="w-4 h-4 mr-1.5 text-blue-600" />
                                Why Rank #{rankNum}? (Explainable AI Rationale)
                              </h4>
                              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-700 leading-relaxed font-sans">
                                {rankNum === 1 ? (
                                  <>
                                    <strong>Primary Priority:</strong> {j.name} holds the highest risk score (<strong>{j.risk_score.toFixed(2)}</strong>) due to dense live traffic (<strong>{j.live_count} vehicles</strong>), high historical blackspot hazard (<strong>{(j.historical_accident_score * 100).toFixed(0)}%</strong>), and {j.assigned_count === 0 ? 'zero assigned police officers.' : 'understaffed police presence.'}
                                  </>
                                ) : (
                                  <>
                                    Ranked #{rankNum} based on live CCTV count of <strong>{j.live_count} vehicles</strong> (density ratio: {(j.live_count / 35).toFixed(2)}), historical accident score of <strong>{(j.historical_accident_score * 100).toFixed(0)}%</strong>, and officer coverage of <strong>{j.assigned_count}/{j.required_count} officers</strong>.
                                  </>
                                )}
                                {j.is_incident_active && (
                                  <div className="mt-2 text-red-600 font-semibold bg-red-50 p-1.5 rounded border border-red-200">
                                    🚨 Incident Active: {j.incident_desc} (+0.15 Risk Score Boost)
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* 8. AI Police Deployment Recommendation */}
                            <div className="space-y-2">
                              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                                <span className="flex items-center">
                                  <Navigation className="w-4 h-4 mr-1.5 text-emerald-600" />
                                  AI Police Deployment Recommendation
                                </span>
                                {recOfficer && (
                                  <span className="text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    ETA ~{j.cad_dispatch.eta_minutes} mins
                                  </span>
                                )}
                              </h4>

                              {recOfficer ? (
                                <div className="bg-emerald-50/70 p-3 rounded-lg border border-emerald-200 text-xs space-y-2">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="font-bold text-emerald-900 text-xs">
                                        {recOfficer.rank} {recOfficer.name}
                                      </div>
                                      <div className="text-[11px] text-emerald-700 font-mono">
                                        {recOfficer.badge} • {recOfficer.vehicle}
                                      </div>
                                    </div>
                                    <div className="text-right font-mono text-emerald-800 font-bold text-xs">
                                      {j.cad_dispatch.distance_km} km away
                                    </div>
                                  </div>

                                  <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between">
                                    <span className="text-[11px] text-emerald-800">
                                      Station: <strong>{recOfficer.station_id}</strong>
                                    </span>
                                    <button
                                      onClick={() => handleManualDispatch(j)}
                                      disabled={j.assigned_officer_info?.officer_id === recOfficer.officer_id}
                                      className={`text-xs font-bold px-3 py-1.5 rounded-md transition-all shadow-2xs cursor-pointer flex items-center space-x-1.5 ${
                                        j.assigned_officer_info?.officer_id === recOfficer.officer_id
                                          ? 'bg-emerald-800 text-white cursor-default'
                                          : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                      }`}
                                    >
                                      <UserCheck className="w-3.5 h-3.5" />
                                      <span>
                                        {j.assigned_officer_info?.officer_id === recOfficer.officer_id ? 'Officer Assigned' : 'Deploy Officer Now'}
                                      </span>
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs text-gray-500">
                                  No available officers in current shift roster.
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
