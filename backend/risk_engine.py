"""
Nagpur Nexus - Traffic Risk Scoring Model
Formula: Risk Score = (W1 * Live Traffic Density Score) + (W2 * Historical Accident Score)
W1 = 0.40, W2 = 0.60
Classifications:
 - High Risk: 0.70 - 1.00 -> Immediate deployment alert
 - Medium Risk: 0.40 - 0.69 -> Standby alert & monitoring
 - Low Risk: 0.00 - 0.39 -> Normal patrol
"""

import math

W1 = 0.40  # Weight for live traffic density score
W2 = 0.60  # Weight for historical accident score

def compute_density_score(vehicle_count: int, capacity_vph: int = 2400, peak_multiplier: float = 1.0) -> float:
    """
    Computes normalized live traffic density score (0.0 to 1.0).
    Considers current active vehicles relative to road capacity.
    """
    if capacity_vph <= 0:
        capacity_vph = 2000
    
    # Estimate hourly equivalent rate or ratio of capacity
    density_ratio = (vehicle_count * 60) / capacity_vph
    score = min(1.0, max(0.0, density_ratio * peak_multiplier))
    return round(score, 4)

def calculate_composite_risk(
    live_vehicle_count: int,
    historical_accident_score: float,
    road_capacity_vph: int = 2400,
    peak_multiplier: float = 1.0,
    weather_hazard_bonus: float = 0.0
) -> dict:
    """
    Calculates composite risk score and details.
    Returns score, risk level, system action, and explainability breakdown.
    """
    density_score = compute_density_score(live_vehicle_count, road_capacity_vph, peak_multiplier)
    
    # Weighted composite score
    base_score = (W1 * density_score) + (W2 * historical_accident_score)
    final_score = min(1.0, max(0.0, base_score + weather_hazard_bonus))
    final_score = round(final_score, 4)

    # Risk Classification
    if final_score >= 0.70:
        level = "High"
        action = "Immediate Officer Deployment + System Push Alert"
        color = "#EF4444" # Red
    elif final_score >= 0.40:
        level = "Medium"
        action = "Standby Alert + Elevated Monitoring"
        color = "#F59E0B" # Amber
    else:
        level = "Low"
        action = "Normal Patrol + Standard Monitoring"
        color = "#10B981" # Green

    return {
        "risk_score": final_score,
        "risk_level": level,
        "system_action": action,
        "color": color,
        "breakdown": {
            "density_score": density_score,
            "density_weight": W1,
            "density_contribution": round(W1 * density_score, 4),
            "historical_accident_score": historical_accident_score,
            "historical_weight": W2,
            "historical_contribution": round(W2 * historical_accident_score, 4),
            "weather_hazard_bonus": weather_hazard_bonus,
            "peak_multiplier": peak_multiplier
        }
    }
