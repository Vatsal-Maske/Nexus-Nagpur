"""
FastAPI Backend Server for Nagpur Nexus - Intelligent Traffic Risk & Deployment Decision Support System
"""

import json
import os
from typing import Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from risk_engine import calculate_composite_risk
from dispatch_engine import recommend_officer_dispatch, get_current_shift_name

app = FastAPI(
    title="Nagpur Nexus - Intelligent Traffic Management API",
    version="1.0.0",
    description="Backend API for AI-Based Traffic Risk Heatmap and Police Deployment Decision Support"
)

# Allow CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global State Containers
DATA_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "nagpur_dataset.json")
REPORT_FILE = os.path.join(os.path.dirname(__file__), "..", "combined_traffic_report.json")
SAMPLE_REPORT_FILE = os.path.join(os.path.dirname(__file__), "..", "sample_data", "combined_traffic_report.json")

# Dynamic Simulation State
current_sim_hour = 17 # Default 5:00 PM (Shift 2 Peak)
junction_overrides = {} # junction_id -> {vehicle_count, weather_bonus}
dispatch_audit_logs = []

def load_dataset():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r") as f:
            return json.load(f)
    raise FileNotFoundError(f"Dataset file missing: {DATA_FILE}")

def load_yolo_reports():
    if os.path.exists(REPORT_FILE):
        with open(REPORT_FILE, "r") as f:
            return json.load(f)
    return {"video_reports": []}

@app.get("/")
def read_root():
    return {
        "status": "online",
        "system": "Nagpur Nexus Traffic Risk & Police Deployment API",
        "version": "1.0.0"
    }

@app.get("/api/dataset")
def get_dataset():
    return load_dataset()

@app.get("/api/traffic/junctions")
def get_junctions(current_hour: Optional[int] = None):
    hour = current_hour if current_hour is not None else current_sim_hour
    ds = load_dataset()
    yolo_data = load_yolo_reports()
    
    # Default counts derived from YOLO analysis reports
    yolo_video_counts = {
        "JNC_VARIETY_SQ": 34,
        "JNC_JHANSI_RANI_SQ": 20,
        "JNC_SADAR_BAZAAR_SQ": 28,
        "JNC_TELEPHONE_EXCHANGE_SQ": 42,
        "JNC_CHHATRAPATI_SQ": 45,
        "JNC_PRIDE_HOTEL_SQ": 32,
        "JNC_ZERO_MILE": 30,
        "JNC_AUTOMOBILE_SQ": 36
    }

    result = []
    for zone in ds["police_zones"]:
        station = zone["police_station"]
        for jnc in zone["junctions"]:
            j_id = jnc["junction_id"]
            
            # Check override or default
            count = junction_overrides.get(j_id, {}).get("count", yolo_video_counts.get(j_id, 22))
            weather_bonus = junction_overrides.get(j_id, {}).get("weather_bonus", 0.0)

            # Hour-based peak multiplier
            peak_multiplier = 1.0
            if 8 <= hour <= 11 or 17 <= hour <= 20:
                peak_multiplier = 1.35 # Peak hour traffic multiplier
            elif 22 <= hour or hour <= 6:
                peak_multiplier = 0.5 # Night time baseline

            risk_eval = calculate_composite_risk(
                live_vehicle_count=count,
                historical_accident_score=jnc["historical_accident_score"],
                road_capacity_vph=jnc["road_capacity_vph"],
                peak_multiplier=peak_multiplier,
                weather_hazard_bonus=weather_bonus
            )

            # Check if currently assigned officer exists
            assigned_officers = [
                off for off in ds["officers"]
                if off.get("assigned_area") == j_id or off.get("last_assigned_area") == j_id
            ]
            is_unmanned = len(assigned_officers) == 0 and risk_eval["risk_level"] == "High"

            result.append({
                "junction_id": j_id,
                "name": jnc["name"],
                "zone_id": zone["zone_id"],
                "zone_name": zone["name"],
                "station_id": station["station_id"],
                "station_name": station["name"],
                "lat": jnc["lat"],
                "lng": jnc["lng"],
                "live_vehicle_count": count,
                "road_capacity_vph": jnc["road_capacity_vph"],
                "historical_accident_score": jnc["historical_accident_score"],
                "blackspot_severity": jnc["blackspot_severity"],
                "structural_hazards": jnc["structural_hazards"],
                "video_sample": jnc.get("video_sample", "Video Project.mp4"),
                "risk_eval": risk_eval,
                "is_unmanned_high_risk": is_unmanned,
                "assigned_officer_count": len(assigned_officers)
            })

    # Sort by risk score descending
    result.sort(key=lambda x: x["risk_eval"]["risk_score"], reverse=True)
    return {
        "current_sim_hour": hour,
        "shift": get_current_shift_name(hour),
        "total_junctions": len(result),
        "high_risk_count": sum(1 for r in result if r["risk_eval"]["risk_level"] == "High"),
        "medium_risk_count": sum(1 for r in result if r["risk_eval"]["risk_level"] == "Medium"),
        "low_risk_count": sum(1 for r in result if r["risk_eval"]["risk_level"] == "Low"),
        "unmanned_high_risk_count": sum(1 for r in result if r["is_unmanned_high_risk"]),
        "junctions": result
    }

@app.get("/api/traffic/heatmap")
def get_heatmap(current_hour: Optional[int] = None):
    jnc_data = get_junctions(current_hour)
    points = []
    for j in jnc_data["junctions"]:
        points.append({
            "lat": j["lat"],
            "lng": j["lng"],
            "intensity": j["risk_eval"]["risk_score"],
            "name": j["name"],
            "level": j["risk_eval"]["risk_level"],
            "count": j["live_vehicle_count"]
        })
    return {"points": points}

@app.get("/api/officers/roster")
def get_roster(current_hour: Optional[int] = None):
    hour = current_hour if current_hour is not None else current_sim_hour
    active_shift = get_current_shift_name(hour)
    ds = load_dataset()
    
    officers = ds["officers"]
    for off in officers:
        off["is_active_in_current_shift"] = (off["shift"] == active_shift)
    
    return {
        "current_hour": hour,
        "active_shift": active_shift,
        "total_officers": len(officers),
        "active_shift_officers": sum(1 for o in officers if o["shift"] == active_shift),
        "available_officers": sum(1 for o in officers if o["status"] == "Available"),
        "officers": officers
    }

@app.get("/api/dispatch/recommend")
def recommend_dispatch(junction_id: str, current_hour: Optional[int] = None):
    hour = current_hour if current_hour is not None else current_sim_hour
    ds = load_dataset()
    
    # Find junction
    target_jnc = None
    for zone in ds["police_zones"]:
        for j in zone["junctions"]:
            if j["junction_id"] == junction_id:
                target_jnc = j
                break
    
    if not target_jnc:
        raise HTTPException(status_code=404, detail="Junction not found")

    stations = [z["police_station"] for z in ds["police_zones"]]
    result = recommend_officer_dispatch(
        junction_info=target_jnc,
        officers_list=ds["officers"],
        police_stations_list=stations,
        current_hour=hour
    )
    return result

class DispatchActionReq(BaseModel):
    junction_id: str
    officer_id: str
    action: str # "APPROVE" or "OVERRIDE" or "REASSIGN"
    operator_note: Optional[str] = None
    override_reason: Optional[str] = None

@app.post("/api/dispatch/action")
def log_dispatch_action(req: DispatchActionReq):
    ds = load_dataset()
    
    log_entry = {
        "timestamp": f"2026-08-17T{current_sim_hour:02d}:18:00",
        "junction_id": req.junction_id,
        "officer_id": req.officer_id,
        "action": req.action,
        "operator_note": req.operator_note,
        "override_reason": req.override_reason
    }
    dispatch_audit_logs.append(log_entry)
    
    # Update officer status in dataset memory
    for off in ds["officers"]:
        if off["officer_id"] == req.officer_id:
            off["status"] = "Dispatched"
            off["deployments_today"] = off.get("deployments_today", 0) + 1
            off["assigned_area"] = req.junction_id
            break

    return {
        "status": "success",
        "message": f"Dispatch action '{req.action}' recorded successfully.",
        "log_entry": log_entry
    }

@app.get("/api/dispatch/audit_logs")
def get_audit_logs():
    return {"total_logs": len(dispatch_audit_logs), "logs": dispatch_audit_logs}

class SimulationReq(BaseModel):
    current_hour: Optional[int] = None
    junction_id: Optional[str] = None
    vehicle_count: Optional[int] = None
    weather_bonus: Optional[float] = None
    reset: Optional[bool] = False

@app.post("/api/simulation/update")
def update_simulation(req: SimulationReq):
    global current_sim_hour, junction_overrides
    
    if req.reset:
        current_sim_hour = 17
        junction_overrides.clear()
        return {"status": "reset", "current_sim_hour": current_sim_hour}

    if req.current_hour is not None:
        current_sim_hour = req.current_hour

    if req.junction_id:
        if req.junction_id not in junction_overrides:
            junction_overrides[req.junction_id] = {}
        if req.vehicle_count is not None:
            junction_overrides[req.junction_id]["count"] = req.vehicle_count
        if req.weather_bonus is not None:
            junction_overrides[req.junction_id]["weather_bonus"] = req.weather_bonus

    return {
        "status": "updated",
        "current_sim_hour": current_sim_hour,
        "active_overrides": junction_overrides
    }

@app.get("/api/yolo/telemetry")
def get_yolo_telemetry():
    # Try to load from sample_data first, fallback to main report
    if os.path.exists(SAMPLE_REPORT_FILE):
        with open(SAMPLE_REPORT_FILE, "r") as f:
            return json.load(f)
    elif os.path.exists(REPORT_FILE):
        with open(REPORT_FILE, "r") as f:
            return json.load(f)
    else:
        # Return mock data for demonstration
        return {
            "summary": "Mock Traffic Report for Sample Videos",
            "total_videos_processed": 4,
            "total_unique_vehicles_across_all_videos": 287,
            "total_vehicles_crossed_line": 31,
            "video_reports": [
                {
                    "video_file": "sample_data/1st.mp4",
                    "total_frames_processed": 1192,
                    "processing_time_sec": 128.39,
                    "total_unique_vehicles_tracked": 131,
                    "vehicles_crossed_line": 24,
                    "average_vehicles_per_frame": 34.16,
                    "peak_vehicles_in_single_frame": 42,
                    "breakdown_by_category": {
                        "Cars": 44,
                        "Motorcycles_and_Scooters": 48,
                        "Buses": 21,
                        "Trucks": 18,
                        "Bicycles": 0
                    }
                },
                {
                    "video_file": "sample_data/2nd.mp4",
                    "total_frames_processed": 366,
                    "processing_time_sec": 169.16,
                    "total_unique_vehicles_tracked": 156,
                    "vehicles_crossed_line": 7,
                    "average_vehicles_per_frame": 20.27,
                    "peak_vehicles_in_single_frame": 27,
                    "breakdown_by_category": {
                        "Cars": 68,
                        "Motorcycles_and_Scooters": 20,
                        "Buses": 11,
                        "Trucks": 57,
                        "Bicycles": 0
                    }
                },
                {
                    "video_file": "sample_data/3rd.mp4",
                    "total_frames_processed": 450,
                    "processing_time_sec": 95.42,
                    "total_unique_vehicles_tracked": 89,
                    "vehicles_crossed_line": 12,
                    "average_vehicles_per_frame": 18.5,
                    "peak_vehicles_in_single_frame": 35,
                    "breakdown_by_category": {
                        "Cars": 35,
                        "Motorcycles_and_Scooters": 32,
                        "Buses": 8,
                        "Trucks": 14,
                        "Bicycles": 0
                    }
                },
                {
                    "video_file": "sample_data/4th.mp4",
                    "total_frames_processed": 520,
                    "processing_time_sec": 110.25,
                    "total_unique_vehicles_tracked": 112,
                    "vehicles_crossed_line": 18,
                    "average_vehicles_per_frame": 22.8,
                    "peak_vehicles_in_single_frame": 38,
                    "breakdown_by_category": {
                        "Cars": 52,
                        "Motorcycles_and_Scooters": 28,
                        "Buses": 15,
                        "Trucks": 17,
                        "Bicycles": 0
                    }
                }
            ]
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
