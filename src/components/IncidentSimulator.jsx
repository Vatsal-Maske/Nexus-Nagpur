import React from 'react';
import { Sun, Moon, Car, AlertOctagon, CloudRain, Zap } from 'lucide-react';

export default function IncidentSimulator() {
  return (
    <div className="space-y-6">
      {/* Time Controller Display */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Sun className="w-5 h-5 text-amber-500" />
            <span className="font-bold text-gray-900">Simulation Time of Day</span>
          </div>
          <span className="font-mono font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded border border-amber-200 text-sm">
            17:00 HRS • SHIFT 2 PEAK
          </span>
        </div>
        <div className="relative w-full h-3 bg-gray-100 rounded-full">
          <div className="absolute h-3 bg-gradient-to-r from-indigo-500 via-amber-400 to-red-500 rounded-full" style={{ width: '71%' }}></div>
          <div className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-amber-500 rounded-full shadow-md" style={{ left: '71%', transform: 'translate(-50%, -50%)' }}></div>
        </div>
        <div className="flex justify-between text-[11px] font-mono text-gray-400 mt-2">
          <span>00:00 (Night)</span>
          <span>06:00 (Dawn)</span>
          <span>12:00 (Noon)</span>
          <span>18:00 (Peak)</span>
          <span>23:00 (Night)</span>
        </div>
      </div>

      {/* Incident Presets */}
      <div>
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">One-Click Incident Presets</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-red-200 shadow-sm p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-red-700 text-sm flex items-center">
                <Car className="w-4 h-4 mr-2 text-red-500" />
                Variety Sq Rush Hour Surge
              </span>
              <Zap className="w-4 h-4 text-red-500" />
            </div>
            <p className="text-xs text-gray-500">
              Inject 55 live vehicles/frame at Variety Sq (Sitabuldi). Triggers High Risk alert.
            </p>
            <div className="mt-3 pt-3 border-t border-gray-100 text-xs space-y-1">
              <div className="flex justify-between"><span className="text-gray-500">Vehicles</span><span className="font-bold text-red-600">55 veh/frame</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Weather</span><span className="font-bold text-gray-700">Clear</span></div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-amber-200 shadow-sm p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-amber-700 text-sm flex items-center">
                <AlertOctagon className="w-4 h-4 mr-2 text-amber-500" />
                Chhatrapati Sq Highway Crash
              </span>
              <Zap className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-xs text-gray-500">
              Simulate Wardha Rd flyover blockage + rain hazard (+0.15 score bonus).
            </p>
            <div className="mt-3 pt-3 border-t border-gray-100 text-xs space-y-1">
              <div className="flex justify-between"><span className="text-gray-500">Vehicles</span><span className="font-bold text-amber-600">60 veh/frame</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Weather</span><span className="font-bold text-gray-700">Rain +0.15</span></div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-purple-200 shadow-sm p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-purple-700 text-sm flex items-center">
                <CloudRain className="w-4 h-4 mr-2 text-purple-500" />
                Central Ave Freight Bottleneck
              </span>
              <Zap className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-xs text-gray-500">
              Simulate 50 freight trucks on Central Avenue during low visibility.
            </p>
            <div className="mt-3 pt-3 border-t border-gray-100 text-xs space-y-1">
              <div className="flex justify-between"><span className="text-gray-500">Vehicles</span><span className="font-bold text-purple-600">50 veh/frame</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Weather</span><span className="font-bold text-gray-700">Fog +0.10</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
