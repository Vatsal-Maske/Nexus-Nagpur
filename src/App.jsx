import React, { useState, useCallback } from 'react';
import { Shield, Map, Camera, ShieldAlert, Users, Sliders, Radio } from 'lucide-react';
import ControlMap from './components/ControlMap';
import CameraFeeds from './components/CameraFeeds';
import RiskMatrix from './components/RiskMatrix';
import ShiftManager from './components/ShiftManager';
import IncidentSimulator from './components/IncidentSimulator';

export default function App() {
  const [cctvRegionsData, setCctvRegionsData] = useState(null);
  const [activeIncident, setActiveIncident] = useState(null);
  const [dispatchedOfficers, setDispatchedOfficers] = useState({}); // junction_id -> officer_info

  const handleCctvUpdate = useCallback((data) => {
    setCctvRegionsData(prev => {
      if (JSON.stringify(prev) === JSON.stringify(data)) return prev;
      return data;
    });
  }, []);

  const handleTriggerIncident = useCallback((incident) => {
    setActiveIncident(incident);
  }, []);

  const handleDispatchOfficer = useCallback((junction, officer) => {
    if (!junction || !officer) return;
    setDispatchedOfficers(prev => ({
      ...prev,
      [junction.junction_id]: {
        ...officer,
        target_junction_id: junction.junction_id,
        target_junction_name: junction.name,
        target_lat: junction.lat,
        target_lng: junction.lng,
        dispatched_at: new Date().toLocaleTimeString()
      }
    }));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* Top Alert Bar */}
      <div className="bg-gray-900 text-white px-6 py-2 flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4">
          <span className="flex items-center text-red-400 font-semibold">
            <Radio className="w-4 h-4 mr-1.5" /> LIVE NAGPUR POLICE CONTROL ROOM
          </span>
          <span className="text-gray-400">4 Zones Active</span>
        </div>
        <div className="text-gray-400">
          Shift: <span className="text-amber-400 font-semibold">Shift 2 (17:00 Peak)</span>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-5 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">NAGPUR NEXUS</h1>
              <p className="text-sm text-gray-500">AI Traffic Risk Heatmap & Police Deployment System</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#cctv-monitoring" className="text-sm font-medium text-gray-600 hover:text-blue-700 transition-colors">CCTV Monitoring</a>
            <a href="#ranked-risk-matrix" className="text-sm font-medium text-gray-600 hover:text-blue-700 transition-colors">Ranked Risk Matrix</a>
            <a href="#shift-roster" className="text-sm font-medium text-gray-600 hover:text-blue-700 transition-colors">Shift Roster & Officers</a>
            <a href="#incident-simulator" className="text-sm font-medium text-gray-600 hover:text-blue-700 transition-colors">Incident Simulator</a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-10">
        {/* Section 1: Live Map View */}
        <section>
          <div className="flex items-center space-x-2 mb-4">
            <Map className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">Real-time Traffic Map</h2>
          </div>
          <ControlMap cctvRegionsData={cctvRegionsData} dispatchedOfficers={dispatchedOfficers} />
        </section>

        {/* Section 2: Stats Cards */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Total Zones</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">4</div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Junctions</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">12</div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Police Officers</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">13</div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="text-xs text-red-500 uppercase tracking-wider font-semibold">High Risk</div>
            <div className="text-2xl font-bold text-red-600 mt-1">3</div>
          </div>
        </section>

        {/* Section 3: CCTV Feeds */}
        <section id="cctv-monitoring">
          <div className="flex items-center space-x-2 mb-4">
            <Camera className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">CCTV Monitoring</h2>
          </div>
          <CameraFeeds onCctvUpdate={handleCctvUpdate} />
        </section>

        {/* Section 4: Ranked Risk Matrix */}
        <section id="ranked-risk-matrix">
          <div className="flex items-center space-x-2 mb-4">
            <ShieldAlert className="w-5 h-5 text-red-600" />
            <h2 className="text-lg font-bold text-gray-900">Ranked Risk Matrix</h2>
          </div>
          <RiskMatrix cctvRegionsData={cctvRegionsData} activeIncident={activeIncident} dispatchedOfficers={dispatchedOfficers} onDispatchOfficer={handleDispatchOfficer} />
        </section>

        {/* Section 5: Shift Roster */}
        <section id="shift-roster">
          <div className="flex items-center space-x-2 mb-4">
            <Users className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">Shift Roster & Officers</h2>
          </div>
          <ShiftManager />
        </section>

        {/* Section 6: Incident Simulator */}
        <section id="incident-simulator">
          <div className="flex items-center space-x-2 mb-4">
            <Sliders className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-bold text-gray-900">Incident Simulator</h2>
          </div>
          <IncidentSimulator activeIncident={activeIncident} onTriggerIncident={handleTriggerIncident} />
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-6 px-6 text-center text-sm mt-12">
        Nagpur City Traffic Police AI Decision Support System
      </footer>
    </div>
  );
}
