import React, { useState } from 'react';
import { Sun, Moon, Car, AlertOctagon, CloudRain, Zap, CheckCircle2, RotateCcw } from 'lucide-react';

export default function IncidentSimulator({ activeIncident, onTriggerIncident }) {
  const [selectedTime, setSelectedTime] = useState(17);

  const presets = [
    {
      id: "INC_VARIETY_SURGE",
      title: "Variety Sq Rush Hour Surge",
      targetJunctionId: "JNC_VARIETY_SQ",
      targetName: "Variety Square (Sitabuldi)",
      injectedCount: 55,
      weatherBonus: 0.15,
      weatherName: "Rush Surge",
      desc: "Inject 55 live vehicles at Variety Sq (Sitabuldi). Triggers High Risk alert.",
      borderClass: "border-red-200 hover:border-red-400 bg-red-50/20",
      btnClass: "bg-red-600 hover:bg-red-500 text-white"
    },
    {
      id: "INC_CHHATRAPATI_CRASH",
      title: "Chhatrapati Sq Highway Crash",
      targetJunctionId: "JNC_CHHATRAPATI_SQ",
      targetName: "Chhatrapati Square (Wardha Rd)",
      injectedCount: 60,
      weatherBonus: 0.15,
      weatherName: "Rain + Flyover Blockage",
      desc: "Simulate Wardha Rd flyover blockage + rain hazard (+0.15 score bonus).",
      borderClass: "border-amber-200 hover:border-amber-400 bg-amber-50/20",
      btnClass: "bg-amber-600 hover:bg-amber-500 text-white"
    },
    {
      id: "INC_CENTRAL_FREIGHT",
      title: "Central Ave Freight Bottleneck",
      targetJunctionId: "JNC_TELEPHONE_EXCHANGE_SQ",
      targetName: "Telephone Exchange Square",
      injectedCount: 50,
      weatherBonus: 0.10,
      weatherName: "Fog / Low Visibility",
      desc: "Simulate 50 freight trucks on Central Avenue during low visibility.",
      borderClass: "border-purple-200 hover:border-purple-400 bg-purple-50/20",
      btnClass: "bg-purple-600 hover:bg-purple-500 text-white"
    }
  ];

  const handleSelectPreset = (preset) => {
    if (onTriggerIncident) {
      if (activeIncident && activeIncident.id === preset.id) {
        onTriggerIncident(null); // Clear incident
      } else {
        onTriggerIncident(preset);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Time Controller Display */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Sun className="w-5 h-5 text-amber-500" />
            <span className="font-bold text-gray-900 text-sm">Simulation Time of Day & Shift Control</span>
          </div>
          <span className="font-mono font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded border border-amber-200 text-xs">
            {selectedTime}:00 HRS • {selectedTime >= 15 && selectedTime < 22 ? 'SHIFT 2 PEAK' : selectedTime >= 22 || selectedTime < 8 ? 'NIGHT EMERGENCY' : 'SHIFT 1 DAY'}
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="23"
          value={selectedTime}
          onChange={(e) => setSelectedTime(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
        />

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
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">One-Click Incident Presets</h3>
          {activeIncident && (
            <button
              onClick={() => onTriggerIncident && onTriggerIncident(null)}
              className="text-xs font-semibold text-red-600 hover:text-red-800 bg-red-50 px-3 py-1 rounded border border-red-200 flex items-center space-x-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              <span>Clear Active Incident ({activeIncident.targetName})</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {presets.map(preset => {
            const isActive = activeIncident && activeIncident.id === preset.id;
            return (
              <div 
                key={preset.id} 
                className={`bg-white rounded-xl border p-4 shadow-2xs transition-all relative ${preset.borderClass} ${isActive ? 'ring-2 ring-red-500 shadow-md' : ''}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-gray-900 text-sm flex items-center">
                    <Zap className={`w-4 h-4 mr-1.5 ${isActive ? 'text-red-600 animate-bounce' : 'text-amber-500'}`} />
                    {preset.title}
                  </span>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed mb-3">
                  {preset.desc}
                </p>

                <div className="pt-3 border-t border-gray-100 text-xs space-y-1.5 mb-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Injected Count</span>
                    <span className="font-bold text-red-600 font-mono">{preset.injectedCount} veh</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Hazard / Weather</span>
                    <span className="font-bold text-gray-700">{preset.weatherName}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleSelectPreset(preset)}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all shadow-2xs flex items-center justify-center space-x-1.5 cursor-pointer ${
                    isActive ? 'bg-red-700 text-white' : preset.btnClass
                  }`}
                >
                  {isActive ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>INCIDENT ACTIVE (CLICK TO CLEAR)</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5" />
                      <span>TRIGGER INCIDENT</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
