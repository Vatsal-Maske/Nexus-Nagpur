import React from 'react';
import { Clock, ShieldCheck, Bike, Phone } from 'lucide-react';
import { NAGPUR_DATASET } from '../data/mockData';

export default function ShiftManager() {
  const officers = NAGPUR_DATASET.officers;

  return (
    <div className="space-y-6">
      {/* Shift Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-blue-600 tracking-wider">Shift 1 — Morning</span>
            <span className="text-xs font-mono text-blue-500 bg-white px-2 py-0.5 rounded border border-blue-200">08:00 – 15:00</span>
          </div>
          <div className="text-sm font-semibold text-gray-800">Day Patrol & Traffic Control</div>
          <p className="text-xs text-gray-500 mt-1">Direct officer alert via push notification.</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 ring-2 ring-amber-400/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-amber-700 tracking-wider flex items-center"><Clock className="w-3 h-3 mr-1" /> Shift 2 — Peak</span>
            <span className="text-xs font-mono text-amber-600 bg-white px-2 py-0.5 rounded border border-amber-300">15:00 – 22:00</span>
          </div>
          <div className="text-sm font-semibold text-gray-800">Peak Hour Congestion Support</div>
          <p className="text-xs text-gray-500 mt-1">Rapid deployment to arterial bottlenecks. (Currently Active)</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-purple-600 tracking-wider">Night Emergency</span>
            <span className="text-xs font-mono text-purple-500 bg-white px-2 py-0.5 rounded border border-purple-200">22:00 – 08:00</span>
          </div>
          <div className="text-sm font-semibold text-gray-800">Control Room Escalation Mode</div>
          <p className="text-xs text-gray-500 mt-1">Station pop-up alert for on-call patrol units.</p>
        </div>
      </div>

      {/* Officer Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {officers.map(off => {
          const inShift2 = off.shift === 'Shift 2';
          return (
            <div key={off.officer_id} className={`bg-white rounded-xl border p-4 shadow-sm transition-all ${inShift2 ? 'border-amber-300 ring-1 ring-amber-200/50' : 'border-gray-200'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-bold text-gray-900 text-sm">{off.rank} {off.name}</div>
                  <div className="text-[11px] text-gray-400 font-mono">{off.badge} • {off.station_id}</div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  off.status === 'Available'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-purple-50 text-purple-700 border-purple-200'
                }`}>
                  {off.status}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-gray-50 p-2 rounded border border-gray-100">
                  <div className="text-gray-400">Assigned Shift</div>
                  <div className={`font-semibold ${inShift2 ? 'text-amber-600' : 'text-gray-700'}`}>{off.shift}</div>
                </div>
                <div className="bg-gray-50 p-2 rounded border border-gray-100">
                  <div className="text-gray-400">Deployments</div>
                  <div className="font-mono font-bold text-amber-600">{off.deployments_today} / 1</div>
                </div>
              </div>

              <div className="mt-2 text-[11px] bg-gray-50 p-2 rounded border border-gray-100">
                <div className="text-gray-400 flex items-center justify-between">
                  <span>Last Area:</span>
                  <span className="font-mono text-blue-600">{off.last_assigned_area}</span>
                </div>
                <div className="text-emerald-600 flex items-center mt-1"><ShieldCheck className="w-3 h-3 mr-1" />Rotation Eligible</div>
              </div>

              <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                <span className="flex items-center"><Bike className="w-3.5 h-3.5 mr-1" />{off.vehicle}</span>
                <span className="flex items-center text-blue-600"><Phone className="w-3 h-3 mr-1" />{off.phone}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
