"""
Nagpur Nexus - Algorithmic CAD Police Deployment Engine & Shift Manager
Implements Computer-Aided Dispatch rules:
1. Active Shift Check (Shift 1, Shift 2, Night Emergency)
2. Daily Max Rule (Max 1 assignment per officer per day)
3. Rotation Rule (No repeat assignment to the same region on consecutive days)
4. Proximity Solver (Haversine distance calculation)
"""

import math

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates straight-line distance in kilometers between two coordinates."""
    R = 6371.0 # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

def get_current_shift_name(current_hour: int) -> str:
    """
    Returns current active shift name based on 24-hr time:
    - 08:00 - 15:00: Shift 1 (Morning)
    - 15:00 - 22:00: Shift 2 (Evening/Peak)
    - 22:00 - 08:00: Emergency Slot (Night)
    """
    if 8 <= current_hour < 15:
        return "Shift 1"
    elif 15 <= current_hour < 22:
        return "Shift 2"
    else:
        return "Night Emergency"

def recommend_officer_dispatch(
    junction_info: dict,
    officers_list: list,
    police_stations_list: list,
    current_hour: int = 17
) -> dict:
    """
    Solves CAD Police Dispatch for a high-risk junction.
    Returns recommended officer, audit rationale, and backup options.
    """
    shift_name = get_current_shift_name(current_hour)
    j_lat = junction_info["lat"]
    j_lng = junction_info["lng"]
    j_id = junction_info["junction_id"]
    j_name = junction_info["name"]

    # Night emergency mode check (22:00 to 08:00)
    if shift_name == "Night Emergency":
        # Find nearest police station
        nearest_station = None
        min_st_dist = float("inf")
        for st in police_stations_list:
            dist = haversine_distance(st["lat"], st["lng"], j_lat, j_lng)
            if dist < min_st_dist:
                min_st_dist = dist
                nearest_station = st

        return {
            "mode": "NIGHT_STATION_ALERT",
            "shift": shift_name,
            "station": nearest_station,
            "distance_km": min_st_dist,
            "recommendation_summary": f"Night Emergency Protocol Active ({current_hour:02d}:00). Escalating alert to control room at {nearest_station['name']} ({min_st_dist} km away) to dispatch on-call patrol unit.",
            "rationale": [
                "24-Hour YOLO Risk Monitoring active",
                f"Time window ({current_hour:02d}:00) is within Night Emergency Slot (22:00 - 08:00)",
                f"Direct officer auto-assignment suspended; Station pop-up sent to {nearest_station['name']}",
                f"On-call Night Officers available at station: {nearest_station.get('on_call_night_officers', 4)}"
            ],
            "eligible_officers": [],
            "excluded_officers": []
        }

    # Day time shift CAD dispatch logic
    eligible = []
    excluded = []

    for off in officers_list:
        reasons_excluded = []
        
        # Rule 1: Shift match
        if off["shift"] != shift_name:
            reasons_excluded.append(f"Officer assigned to {off['shift']} (Current active: {shift_name})")

        # Rule 2: Availability
        if off["status"] != "Available":
            reasons_excluded.append(f"Officer status is currently '{off['status']}'")

        # Rule 3: Daily max deployment (max 1/day)
        if off.get("deployments_today", 0) >= 1:
            reasons_excluded.append(f"Officer already completed maximum daily deployment ({off['deployments_today']}/1)")

        # Rule 4: Rotation rule (no repeat assignment to same location on consecutive days)
        if off.get("last_assigned_area") == j_id:
            reasons_excluded.append(f"Rotation Rule Violation: Deployed to {j_name} yesterday. Skip to avoid fatigue.")

        dist = haversine_distance(off["current_lat"], off["current_lng"], j_lat, j_lng)

        if not reasons_excluded:
            eligible.append({
                "officer": off,
                "distance_km": dist,
                "score": round(dist, 2) # lowest distance wins
            })
        else:
            excluded.append({
                "officer_name": off["name"],
                "officer_id": off["officer_id"],
                "reasons": reasons_excluded
            })

    # Sort eligible by distance
    eligible.sort(key=lambda x: x["distance_km"])

    if eligible:
        top_pick = eligible[0]
        selected_officer = top_pick["officer"]
        dist_km = top_pick["distance_km"]

        return {
            "mode": "DAY_CAD_DISPATCH",
            "shift": shift_name,
            "recommended_officer": selected_officer,
            "distance_km": dist_km,
            "eta_minutes": max(2, int(dist_km * 3)), # ~20 km/h urban response speed
            "recommendation_summary": f"Selected {selected_officer['rank']} {selected_officer['name']} ({selected_officer['vehicle']}) situated {dist_km} km from {j_name}.",
            "rationale": [
                f"Active in current shift ({shift_name})",
                f"Available with 0 prior deployments today (Daily Max Rule Passed)",
                f"Rotation Rule Passed (Not assigned to {j_name} yesterday)",
                f"Closest eligible officer ({dist_km} km away, estimated ETA ~{max(2, int(dist_km * 3))} mins)"
            ],
            "eligible_officers": eligible,
            "excluded_officers": excluded
        }
    else:
        # Fallback if all officers excluded: select nearest available regardless of strict rotation
        fallback_officer = None
        min_d = float("inf")
        for off in officers_list:
            if off["status"] == "Available" and off["shift"] == shift_name:
                d = haversine_distance(off["current_lat"], off["current_lng"], j_lat, j_lng)
                if d < min_d:
                    min_d = d
                    fallback_officer = off

        return {
            "mode": "DAY_CAD_DISPATCH_FALLBACK",
            "shift": shift_name,
            "recommended_officer": fallback_officer,
            "distance_km": min_d,
            "eta_minutes": max(2, int(min_d * 3)) if fallback_officer else 15,
            "recommendation_summary": f"Emergency Roster Exemption: Selected {fallback_officer['name']} ({min_d} km away) due to high risk demand.",
            "rationale": [
                "All primary candidates had shift/rotation constraints",
                "CAD Fallback triggered for high-risk override",
                f"Nearest active officer assigned ({min_d} km)"
            ],
            "eligible_officers": [],
            "excluded_officers": excluded
        }
