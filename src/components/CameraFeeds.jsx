import React, { useState, useEffect } from 'react';
import { Camera, BarChart2, Video, Play } from 'lucide-react';

export default function CameraFeeds() {
  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch video analysis data from backend
    fetch('/api/yolo/telemetry')
      .then(res => res.json())
      .then(data => {
        setVideoData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch video data:', err);
        setLoading(false);
      });
  }, []);

  const cameras = [
    { id: 'CAM_01', name: 'Sample Video 1 - Junction A', video: '/sample_data/1st.mp4', status: 'LIVE', zoneColor: 'bg-blue-500' },
    { id: 'CAM_02', name: 'Sample Video 2 - Junction B', video: '/sample_data/2nd.mp4', status: 'LIVE', zoneColor: 'bg-emerald-500' },
    { id: 'CAM_03', name: 'Sample Video 3 - Junction C', video: '/sample_data/3rd.mp4', status: 'LIVE', zoneColor: 'bg-purple-500' },
    { id: 'CAM_04', name: 'Sample Video 4 - Junction D', video: '/sample_data/4th.mp4', status: 'LIVE', zoneColor: 'bg-amber-500' },
  ];

  // Get analysis data for each camera
  const getCameraAnalysis = (cameraId) => {
    if (!videoData || !videoData.video_reports) return null;
    const index = parseInt(cameraId.split('_')[1]) - 1;
    return videoData.video_reports[index] || null;
  };

  // Calculate overall breakdown from all videos
  const getOverallBreakdown = () => {
    if (!videoData || !videoData.video_reports) return null;
    
    const total = {
      Cars: 0,
      Motorcycles_and_Scooters: 0,
      Trucks: 0,
      Buses: 0,
      Bicycles: 0,
      totalVehicles: 0,
      lineCrossed: 0
    };

    videoData.video_reports.forEach(report => {
      if (report.breakdown_by_category) {
        total.Cars += report.breakdown_by_category.Cars || 0;
        total.Motorcycles_and_Scooters += report.breakdown_by_category.Motorcycles_and_Scooters || 0;
        total.Trucks += report.breakdown_by_category.Trucks || 0;
        total.Buses += report.breakdown_by_category.Buses || 0;
        total.Bicycles += report.breakdown_by_category.Bicycles || 0;
      }
      total.totalVehicles += report.total_unique_vehicles_tracked || 0;
      total.lineCrossed += report.vehicles_crossed_line || 0;
    });

    return total;
  };

  const breakdown = getOverallBreakdown();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cameras.map(cam => (
            <div key={cam.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Video feed with overlay */}
              <div className="relative w-full h-48 bg-black overflow-hidden select-none">
                <video 
                  src={cam.video} 
                  className="w-full h-full object-cover"
                  controls
                  muted
                />
                
                {/* Top-left LIVE + REC badge */}
                <div className="absolute top-3 left-3 flex items-center space-x-2 bg-black/50 px-2 py-1 rounded">
                  <span className={`w-2.5 h-2.5 rounded-full ${cam.zoneColor} animate-pulse shadow-lg`} />
                  <span className="text-[10px] font-bold tracking-wider text-white/90 uppercase">{cam.status} • {cam.id}</span>
                </div>

                {/* Analysis data overlay */}
                {(() => {
                  const analysis = getCameraAnalysis(cam.id);
                  if (!analysis) return null;
                  return (
                    <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/90 to-transparent">
                      <div className="flex items-center justify-between text-[10px] font-mono text-white">
                        <span className="text-emerald-300">TRACKED: <strong>{analysis.total_unique_vehicles_tracked}</strong></span>
                        <span className="text-yellow-300">CROSSING: <strong>{analysis.vehicles_crossed_line}</strong></span>
                        <span className="text-blue-300">PEAK: <strong>{analysis.peak_vehicles_in_single_frame}</strong></span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Meta below feed */}
              <div className="p-3">
                <div className="font-semibold text-gray-800 text-sm">{cam.name}</div>
                {(() => {
                  const analysis = getCameraAnalysis(cam.id);
                  if (!analysis) {
                    return (
                      <div className="text-xs text-gray-500 mt-1">
                        {loading ? 'Analyzing video...' : 'No analysis data available'}
                      </div>
                    );
                  }
                  return (
                    <div className="text-xs text-gray-500 mt-1 space-y-1">
                      <div>Total Tracked: <span className="font-bold text-amber-600">{analysis.total_unique_vehicles_tracked}</span> vehicles</div>
                      <div>Line Crossed: <span className="font-bold text-emerald-600">{analysis.vehicles_crossed_line}</span> vehicles</div>
                      <div>Processing Time: <span className="font-bold text-blue-600">{analysis.processing_time_sec}s</span></div>
                    </div>
                  );
                })()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics Panel */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center">
          <BarChart2 className="w-4 h-4 mr-2 text-blue-600" />
          Vehicle Breakdown
        </h3>
        
        {loading ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            Loading video analysis data...
          </div>
        ) : breakdown ? (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700">Cars / SUVs</span>
                <span className="font-mono font-bold text-blue-600">
                  {breakdown.Cars} ({((breakdown.Cars / breakdown.totalVehicles) * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${(breakdown.Cars / breakdown.totalVehicles) * 100}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700">Motorcycles</span>
                <span className="font-mono font-bold text-emerald-600">
                  {breakdown.Motorcycles_and_Scooters} ({((breakdown.Motorcycles_and_Scooters / breakdown.totalVehicles) * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div className="bg-emerald-600 h-2.5 rounded-full" style={{ width: `${(breakdown.Motorcycles_and_Scooters / breakdown.totalVehicles) * 100}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700">Heavy Trucks</span>
                <span className="font-mono font-bold text-red-600">
                  {breakdown.Trucks} ({((breakdown.Trucks / breakdown.totalVehicles) * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${(breakdown.Trucks / breakdown.totalVehicles) * 100}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700">Buses</span>
                <span className="font-mono font-bold text-amber-600">
                  {breakdown.Buses} ({((breakdown.Buses / breakdown.totalVehicles) * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: `${(breakdown.Buses / breakdown.totalVehicles) * 100}%` }}></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 text-sm">
            No analysis data available
          </div>
        )}

        {breakdown && (
          <div className="mt-6 pt-5 border-t border-gray-100 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Total Tracked</span><span className="font-bold text-gray-800">{breakdown.totalVehicles}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Line Crossed</span><span className="font-bold text-emerald-600">{breakdown.lineCrossed}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Videos Processed</span><span className="font-bold text-blue-600">{videoData?.video_reports?.length || 0}</span></div>
          </div>
        )}
      </div>
    </div>
  );
}
