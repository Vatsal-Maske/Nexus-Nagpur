import React from 'react';
import { Cpu, ShieldCheck } from 'lucide-react';

export default function ReportViewer() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Cover */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500"></div>
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono mb-4">
          MANTHAN YUVA COMPETITION SUBMISSION
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          AI-Based Traffic Risk Heatmap & Police Deployment for Nagpur City
        </h1>
        <p className="text-sm text-gray-500">Theme: Intelligent Traffic Management System</p>
      </div>

      {/* TOC */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-2 mb-3">Project Report Sections</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-600">
          <div>1. Introduction</div>
          <div>2. Problem Statement</div>
          <div>3. Objectives</div>
          <div>4. Solution Overview</div>
          <div>5. System Architecture</div>
          <div>6. Region & Station Mapping</div>
          <div>7. Vehicle Detection (YOLOv11)</div>
          <div>8. Traffic Risk Scoring Model</div>
          <div>9. Police Deployment Logic</div>
          <div>10. Shift Management System</div>
          <div>11. Dataset Design</div>
          <div>12. Control-Room Dashboard</div>
          <div>13. Technology Stack</div>
          <div>14. Scalability & Cost</div>
          <div>15. Existing vs Proposed</div>
          <div>16. Conclusion</div>
        </div>
      </div>

      {/* Problem Statement */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-sm text-gray-700 leading-relaxed space-y-3">
        <h2 className="font-bold text-gray-900 border-b border-gray-100 pb-2">1 & 2. Introduction & Problem Statement</h2>
        <p>
          Road traffic accidents remain one of the most pressing urban safety challenges in India, and Nagpur is no exception. Despite consistent efforts by Nagpur Traffic Police, several junctions across the city continue to witness recurring accidents due to high traffic density, poor visibility, and delayed police response during high-risk periods.
        </p>
        <p>
          Nagpur City has multiple traffic "black spots" identified by the Traffic Police. Current deployment of traffic police at these locations is largely static and manually planned, failing to dynamically respond to real-time traffic conditions.
        </p>
      </div>

      {/* Risk Scoring Formula */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-sm text-gray-700 space-y-4">
        <h2 className="font-bold text-gray-900 border-b border-gray-100 pb-2">8. Traffic Risk Scoring Model</h2>
        <p>Relying on live traffic volume alone is insufficient. The system computes a composite Risk Score combining two normalized components:</p>
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 font-mono text-center text-base text-amber-700">
          Risk Score = (0.40 × Live Density) + (0.60 × Historical Accident Score)
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <div className="bg-red-50 border border-red-200 p-3 rounded-lg text-center space-y-1">
            <div className="font-bold text-red-700">High Risk (0.70 – 1.00)</div>
            <div className="text-xs text-gray-600">Immediate officer deployment</div>
          </div>
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-center space-y-1">
            <div className="font-bold text-amber-700">Medium Risk (0.40 – 0.69)</div>
            <div className="text-xs text-gray-600">Standby alert + elevated monitoring</div>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-center space-y-1">
            <div className="font-bold text-emerald-700">Low Risk (0.00 – 0.39)</div>
            <div className="text-xs text-gray-600">Normal patrol</div>
          </div>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-sm text-gray-700 space-y-4">
        <h2 className="font-bold text-gray-900 border-b border-gray-100 pb-2">13. Technology Stack</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex items-center">
            <Cpu className="w-5 h-5 mr-3 text-blue-600" />
            <div>
              <div className="font-bold text-blue-700">Vehicle Detection</div>
              <div className="font-mono text-gray-700 text-xs">YOLOv11 (Ultralytics), OpenCV</div>
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex items-center">
            <Cpu className="w-5 h-5 mr-3 text-purple-600" />
            <div>
              <div className="font-bold text-purple-700">Vehicle Tracking</div>
              <div className="font-mono text-gray-700 text-xs">ByteTrack / DeepSORT</div>
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex items-center">
            <ShieldCheck className="w-5 h-5 mr-3 text-emerald-600" />
            <div>
              <div className="font-bold text-emerald-700">Risk Model Backend</div>
              <div className="font-mono text-gray-700 text-xs">Python (FastAPI, Pandas, scikit-learn)</div>
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex items-center">
            <Cpu className="w-5 h-5 mr-3 text-amber-600" />
            <div>
              <div className="font-bold text-amber-700">Dashboard & Map</div>
              <div className="font-mono text-gray-700 text-xs">React + Leaflet GIS + Recharts</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
