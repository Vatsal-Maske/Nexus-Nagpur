import React from 'react';
import { AlertTriangle, Shield, CheckCircle2 } from 'lucide-react';
import { NAGPUR_DATASET, calcRiskScore } from '../data/mockData';

export default function RiskMatrix() {
  const defaultCounts = {
    "JNC_VARIETY_SQ": 34, "JNC_JHANSI_RANI_SQ": 20, "JNC_SADAR_BAZAAR_SQ": 28,
    "JNC_TELEPHONE_EXCHANGE_SQ": 42, "JNC_CHHATRAPATI_SQ": 45, "JNC_PRIDE_HOTEL_SQ": 32,
    "JNC_ZERO_MILE": 30, "JNC_AUTOMOBILE_SQ": 36
  };

  const junctions = [];
  NAGPUR_DATASET.police_zones.forEach(zone => {
    zone.junctions.forEach(jnc => {
      const count = defaultCounts[jnc.junction_id] || 22;
      const evalRes = calcRiskScore(count, jnc.historical_accident_score, jnc.road_capacity_vph, 17, 0);
      junctions.push({ ...jnc, live_vehicle_count: count, risk_eval: evalRes, zone_name: zone.name, station_name: zone.police_station.name });
    });
  });

  junctions.sort((a, b) => b.risk_eval.risk_score - a.risk_eval.risk_score);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs border-b border-gray-200">
            <tr>
              <th className="py-3 px-4 font-semibold">Rank</th>
              <th className="py-3 px-4 font-semibold">Junction</th>
              <th className="py-3 px-4 font-semibold">Zone / Station</th>
              <th className="py-3 px-4 font-semibold">Risk Score</th>
              <th className="py-3 px-4 font-semibold">Live Density</th>
              <th className="py-3 px-4 font-semibold">Blackspot</th>
              <th className="py-3 px-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {junctions.map((j, idx) => {
              const evalRes = j.risk_eval;
              return (
                <tr key={j.junction_id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <span className={`w-7 h-7 inline-flex items-center justify-center rounded-full text-xs font-bold ${
                      idx === 0 ? 'bg-red-100 text-red-700' : idx === 1 ? 'bg-amber-100 text-amber-700' : idx === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      #{idx + 1}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-gray-900">{j.name}</div>
                    <div className="text-xs text-gray-400 font-mono">{j.junction_id}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-gray-700">{j.zone_name}</div>
                    <div className="text-xs text-blue-600 flex items-center"><Shield className="w-3 h-3 mr-1" />{j.station_name}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-bold text-white" style={{ backgroundColor: evalRes.color }}>
                      {evalRes.risk_score} • {evalRes.risk_level}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-gray-800">
                    {j.live_vehicle_count} veh
                    <div className="text-[10px] text-gray-400">Cap: {j.road_capacity_vph} vph</div>
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <span className="text-amber-600 font-bold">{(j.historical_accident_score * 100).toFixed(0)}%</span>
                    <div className="text-[10px] text-gray-400">{j.blackspot_severity}</div>
                  </td>
                  <td className="py-3 px-4">
                    {evalRes.risk_level === 'High' ? (
                      <span className="inline-flex items-center text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-2 py-1 rounded">
                        <AlertTriangle className="w-3 h-3 mr-1" /> UNMANNED HIGH RISK
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Normal Patrol
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
