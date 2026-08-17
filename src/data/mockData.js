// Nagpur Nexus Client-side Data Engine & Dataset

export const NAGPUR_DATASET = {
  city: "Nagpur",
  police_zones: [
    {
      zone_id: "ZONE_1",
      name: "Zone 1 - Central Nagpur",
      police_station: {
        station_id: "PS_SITABULDI",
        name: "Sitabuldi Police Station",
        code: "STB-01",
        lat: 21.1458,
        lng: 79.0882,
        total_officers: 35,
        on_call_night_officers: 6,
        in_charge: "Inspector A. V. Deshmukh",
        contact: "+91 712 2561100"
      },
      junctions: [
        {
          junction_id: "JNC_VARIETY_SQ",
          name: "Variety Square (Sitabuldi)",
          lat: 21.1462,
          lng: 79.0885,
          historical_accident_score: 0.85,
          road_capacity_vph: 2400,
          blackspot_severity: "High (Top 5 Blackspot)",
          structural_hazards: ["Pedestrian Overcrowding", "Metro Pillar Blind Spot", "5-Arm Complex Traffic"],
          video_sample: "Video Project.mp4",
          baseline_officers_assigned: 1
        },
        {
          junction_id: "JNC_JHANSI_RANI_SQ",
          name: "Jhansi Rani Square",
          lat: 21.1415,
          lng: 79.0830,
          historical_accident_score: 0.62,
          road_capacity_vph: 1800,
          blackspot_severity: "Medium",
          structural_hazards: ["Sharp Left Turn", "Narrow Bottle-Neck"],
          video_sample: "WhatsApp Video 2026-08-17 at 8.56.16 PM.mp4",
          baseline_officers_assigned: 0
        },
        {
          junction_id: "JNC_LAW_COLLEGE_SQ",
          name: "Law College Square (Amravati Rd)",
          lat: 21.1490,
          lng: 79.0665,
          historical_accident_score: 0.55,
          road_capacity_vph: 2000,
          blackspot_severity: "Medium",
          structural_hazards: ["High Speed Corridor", "University Signal Cross"],
          video_sample: "Video Project.mp4",
          baseline_officers_assigned: 1
        }
      ]
    },
    {
      zone_id: "ZONE_2",
      name: "Zone 2 - North/Sadar",
      police_station: {
        station_id: "PS_SADAR",
        name: "Sadar Police Station",
        code: "SDR-02",
        lat: 21.1610,
        lng: 79.0820,
        total_officers: 30,
        on_call_night_officers: 5,
        in_charge: "Inspector R. S. Kulkarni",
        contact: "+91 712 2562200"
      },
      junctions: [
        {
          junction_id: "JNC_SADAR_BAZAAR_SQ",
          name: "Sadar Bazaar Square (Residency Rd)",
          lat: 21.1618,
          lng: 79.0825,
          historical_accident_score: 0.78,
          road_capacity_vph: 2100,
          blackspot_severity: "High",
          structural_hazards: ["Commercial Parking Encroachment", "Illegal Auto Stands"],
          video_sample: "WhatsApp Video 2026-08-17 at 8.56.16 PM.mp4",
          baseline_officers_assigned: 1
        },
        {
          junction_id: "JNC_ZERO_MILE",
          name: "Zero Mile Freedom Park Intersection",
          lat: 21.1495,
          lng: 79.0812,
          historical_accident_score: 0.70,
          road_capacity_vph: 2600,
          blackspot_severity: "High",
          structural_hazards: ["VVIP Movement Zone", "Metro Station Footfall Spikes"],
          video_sample: "Video Project.mp4",
          baseline_officers_assigned: 1
        },
        {
          junction_id: "JNC_LIC_SQ",
          name: "LIC Square (Kamptee Rd)",
          lat: 21.1560,
          lng: 79.0890,
          historical_accident_score: 0.48,
          road_capacity_vph: 2200,
          blackspot_severity: "Medium",
          structural_hazards: ["Heavy Bus Fleet Turning Point"],
          video_sample: "WhatsApp Video 2026-08-17 at 8.56.16 PM.mp4",
          baseline_officers_assigned: 0
        }
      ]
    },
    {
      zone_id: "ZONE_3",
      name: "Zone 3 - East/Itwari",
      police_station: {
        station_id: "PS_LAKADGANJ",
        name: "Lakadganj Police Station",
        code: "LKG-03",
        lat: 21.1512,
        lng: 79.1120,
        total_officers: 28,
        on_call_night_officers: 4,
        in_charge: "Inspector M. K. Patil",
        contact: "+91 712 2563300"
      },
      junctions: [
        {
          junction_id: "JNC_TELEPHONE_EXCHANGE_SQ",
          name: "Telephone Exchange Square (Central Ave)",
          lat: 21.1520,
          lng: 79.1125,
          historical_accident_score: 0.88,
          road_capacity_vph: 2500,
          blackspot_severity: "High (Top 3 Blackspot)",
          structural_hazards: ["Heavy Freight Truck Corridor", "Poor Night Street Lighting"],
          video_sample: "Video Project.mp4",
          baseline_officers_assigned: 1
        },
        {
          junction_id: "JNC_DOSAR_VAISHYA_SQ",
          name: "Dosar Vaishya Square (Itwari)",
          lat: 21.1545,
          lng: 79.0980,
          historical_accident_score: 0.65,
          road_capacity_vph: 1700,
          blackspot_severity: "Medium-High",
          structural_hazards: ["Handcart & Rickshaw Congestion", "Market Signal Bypass"],
          video_sample: "WhatsApp Video 2026-08-17 at 8.56.16 PM.mp4",
          baseline_officers_assigned: 0
        },
        {
          junction_id: "JNC_AUTOMOBILE_SQ",
          name: "Automobile Square (Kalamna Rd)",
          lat: 21.1620,
          lng: 79.1240,
          historical_accident_score: 0.72,
          road_capacity_vph: 2300,
          blackspot_severity: "High",
          structural_hazards: ["Interstate Truck Haul Junction", "High Speed Heavy Vehicles"],
          video_sample: "Video Project.mp4",
          baseline_officers_assigned: 0
        }
      ]
    },
    {
      zone_id: "ZONE_4",
      name: "Zone 4 - South/Wardha Road",
      police_station: {
        station_id: "PS_AJNI",
        name: "Ajni Police Station",
        code: "AJN-04",
        lat: 21.1105,
        lng: 79.0645,
        total_officers: 32,
        on_call_night_officers: 5,
        in_charge: "Inspector S. T. Jadhav",
        contact: "+91 712 2564400"
      },
      junctions: [
        {
          junction_id: "JNC_CHHATRAPATI_SQ",
          name: "Chhatrapati Square (Wardha Rd)",
          lat: 21.1110,
          lng: 79.0650,
          historical_accident_score: 0.92,
          road_capacity_vph: 3000,
          blackspot_severity: "Critical (Top 1 Blackspot)",
          structural_hazards: ["National Highway Merge", "Airport Corridor Speeding", "Double Flyover Blind Curve"],
          video_sample: "Video Project.mp4",
          baseline_officers_assigned: 1
        },
        {
          junction_id: "JNC_PRIDE_HOTEL_SQ",
          name: "Pride Hotel Square (Airport Rd)",
          lat: 21.0920,
          lng: 79.0580,
          historical_accident_score: 0.75,
          road_capacity_vph: 2800,
          blackspot_severity: "High",
          structural_hazards: ["High Speed Lane Merging", "Expressway Exit"],
          video_sample: "WhatsApp Video 2026-08-17 at 8.56.16 PM.mp4",
          baseline_officers_assigned: 1
        },
        {
          junction_id: "JNC_RAHATE_COLONY_SQ",
          name: "Rahate Colony Square",
          lat: 21.1270,
          lng: 79.0740,
          historical_accident_score: 0.58,
          road_capacity_vph: 2100,
          blackspot_severity: "Medium",
          structural_hazards: ["Hospital Zone Emergency Ambulance Cross"],
          video_sample: "Video Project.mp4",
          baseline_officers_assigned: 0
        }
      ]
    }
  ],
  road_corridors: [
    {
      id: "CORRIDOR_WARDHA_RD",
      name: "Wardha Road Highway (NH-44)",
      status: "Congested",
      color: "#EF4444",
      weight: 6,
      points: [
        [21.0920, 79.0580],
        [21.1110, 79.0650],
        [21.1270, 79.0740],
        [21.1415, 79.0830],
        [21.1462, 79.0885]
      ]
    },
    {
      id: "CORRIDOR_CENTRAL_AVE",
      name: "Central Avenue Corridor",
      status: "Severe Bottleneck",
      color: "#EF4444",
      weight: 6,
      points: [
        [21.1462, 79.0885],
        [21.1495, 79.0812],
        [21.1545, 79.0980],
        [21.1520, 79.1125],
        [21.1620, 79.1240]
      ]
    },
    {
      id: "CORRIDOR_RESIDENCY_RD",
      name: "Residency Road Corridor (Sadar)",
      status: "Moderate Flow",
      color: "#F59E0B",
      weight: 5,
      points: [
        [21.1495, 79.0812],
        [21.1560, 79.0890],
        [21.1618, 79.0825],
        [21.1680, 79.0810]
      ]
    },
    {
      id: "CORRIDOR_AMRAVATI_RD",
      name: "Amravati Road Corridor",
      status: "Normal Flow",
      color: "#10B981",
      weight: 5,
      points: [
        [21.1462, 79.0885],
        [21.1490, 79.0665],
        [21.1530, 79.0480]
      ]
    }
  ],
  officers: [
    { officer_id: "OFF_101", name: "SI Rajesh Kumar", badge: "NGP-TP-101", rank: "Sub-Inspector", station_id: "PS_SITABULDI", shift: "Shift 1", current_lat: 21.1440, current_lng: 79.0870, status: "Available", deployments_today: 0, last_assigned_area: "JNC_JHANSI_RANI_SQ", phone: "+91 98220 11001", vehicle: "Patrol Bike (MH-31-TP-01)" },
    { officer_id: "OFF_102", name: "ASI Sunil Shinde", badge: "NGP-TP-102", rank: "Assistant Sub-Inspector", station_id: "PS_SITABULDI", shift: "Shift 1", current_lat: 21.1470, current_lng: 79.0895, status: "Available", deployments_today: 0, last_assigned_area: "JNC_VARIETY_SQ", phone: "+91 98220 11002", vehicle: "Interceptor PCR-1" },
    { officer_id: "OFF_103", name: "HC Amit Verma", badge: "NGP-TP-103", rank: "Head Constable", station_id: "PS_SITABULDI", shift: "Shift 2", current_lat: 21.1450, current_lng: 79.0860, status: "Available", deployments_today: 0, last_assigned_area: "JNC_LAW_COLLEGE_SQ", phone: "+91 98220 11003", vehicle: "Patrol Bike (MH-31-TP-03)" },
    { officer_id: "OFF_104", name: "Constable Vikas Gaikwad", badge: "NGP-TP-104", rank: "Constable", station_id: "PS_SITABULDI", shift: "Shift 2", current_lat: 21.1480, current_lng: 79.0700, status: "Available", deployments_today: 0, last_assigned_area: "JNC_VARIETY_SQ", phone: "+91 98220 11004", vehicle: "Foot Patrol" },
    { officer_id: "OFF_201", name: "SI Pravin Tiwari", badge: "NGP-TP-201", rank: "Sub-Inspector", station_id: "PS_SADAR", shift: "Shift 1", current_lat: 21.1600, current_lng: 79.0810, status: "Available", deployments_today: 0, last_assigned_area: "JNC_ZERO_MILE", phone: "+91 98220 22001", vehicle: "Patrol Bike (MH-31-TP-21)" },
    { officer_id: "OFF_202", name: "ASI Deepak Wankhede", badge: "NGP-TP-202", rank: "Assistant Sub-Inspector", station_id: "PS_SADAR", shift: "Shift 1", current_lat: 21.1625, current_lng: 79.0835, status: "Available", deployments_today: 0, last_assigned_area: "JNC_SADAR_BAZAAR_SQ", phone: "+91 98220 22002", vehicle: "Interceptor PCR-2" },
    { officer_id: "OFF_203", name: "HC Ramesh Rathod", badge: "NGP-TP-203", rank: "Head Constable", station_id: "PS_SADAR", shift: "Shift 2", current_lat: 21.1550, current_lng: 79.0880, status: "Available", deployments_today: 0, last_assigned_area: "JNC_LIC_SQ", phone: "+91 98220 22003", vehicle: "Patrol Bike (MH-31-TP-23)" },
    { officer_id: "OFF_301", name: "SI Sanjay Bobde", badge: "NGP-TP-301", rank: "Sub-Inspector", station_id: "PS_LAKADGANJ", shift: "Shift 1", current_lat: 21.1510, current_lng: 79.1110, status: "Available", deployments_today: 0, last_assigned_area: "JNC_DOSAR_VAISHYA_SQ", phone: "+91 98220 33001", vehicle: "Patrol Bike (MH-31-TP-31)" },
    { officer_id: "OFF_302", name: "ASI Nitin Chaudhari", badge: "NGP-TP-302", rank: "Assistant Sub-Inspector", station_id: "PS_LAKADGANJ", shift: "Shift 1", current_lat: 21.1530, current_lng: 79.1140, status: "Available", deployments_today: 0, last_assigned_area: "JNC_TELEPHONE_EXCHANGE_SQ", phone: "+91 98220 33002", vehicle: "Interceptor PCR-3" },
    { officer_id: "OFF_303", name: "HC Ganesh Meshram", badge: "NGP-TP-303", rank: "Head Constable", station_id: "PS_LAKADGANJ", shift: "Shift 2", current_lat: 21.1610, current_lng: 79.1230, status: "Available", deployments_today: 0, last_assigned_area: "JNC_AUTOMOBILE_SQ", phone: "+91 98220 33003", vehicle: "Patrol Bike (MH-31-TP-33)" },
    { officer_id: "OFF_401", name: "SI Vijay More", badge: "NGP-TP-401", rank: "Sub-Inspector", station_id: "PS_AJNI", shift: "Shift 1", current_lat: 21.1120, current_lng: 79.0660, status: "Available", deployments_today: 0, last_assigned_area: "JNC_RAHATE_COLONY_SQ", phone: "+91 98220 44001", vehicle: "Patrol Bike (MH-31-TP-41)" },
    { officer_id: "OFF_402", name: "ASI Anil Shelke", badge: "NGP-TP-402", rank: "Assistant Sub-Inspector", station_id: "PS_AJNI", shift: "Shift 1", current_lat: 21.1090, current_lng: 79.0630, status: "Available", deployments_today: 0, last_assigned_area: "JNC_CHHATRAPATI_SQ", phone: "+91 98220 44002", vehicle: "Interceptor PCR-4" },
    { officer_id: "OFF_403", name: "HC Mahesh Zade", badge: "NGP-TP-403", rank: "Head Constable", station_id: "PS_AJNI", shift: "Shift 2", current_lat: 21.0930, current_lng: 79.0585, status: "Available", deployments_today: 0, last_assigned_area: "JNC_PRIDE_HOTEL_SQ", phone: "+91 98220 44003", vehicle: "Patrol Bike (MH-31-TP-43)" }
  ]
};

// Client-side Risk Scoring Formula: W1 = 0.40, W2 = 0.60
export function calcRiskScore(vehicleCount, historicalScore, capacity = 2400, hour = 17, weatherBonus = 0.0) {
  let peakMult = 1.0;
  if ((hour >= 8 && hour <= 11) || (hour >= 17 && hour <= 20)) {
    peakMult = 1.35;
  } else if (hour >= 22 || hour <= 6) {
    peakMult = 0.5;
  }

  const densityRatio = (vehicleCount * 60) / capacity;
  const densityScore = Math.min(1.0, Math.max(0.0, densityRatio * peakMult));
  
  const w1 = 0.40;
  const w2 = 0.60;
  
  const base = (w1 * densityScore) + (w2 * historicalScore);
  const finalScore = Math.min(1.0, Math.max(0.0, base + weatherBonus));
  const rounded = Number(finalScore.toFixed(2));

  let level = "Low";
  let action = "Normal Patrol + Standard Monitoring";
  let color = "#10B981"; // Green

  if (rounded >= 0.70) {
    level = "High";
    action = "Immediate Officer Deployment + System Push Alert";
    color = "#EF4444"; // Red
  } else if (rounded >= 0.40) {
    level = "Medium";
    action = "Standby Alert + Elevated Monitoring";
    color = "#F59E0B"; // Amber
  }

  return {
    risk_score: rounded,
    risk_level: level,
    system_action: action,
    color,
    density_score: Number(densityScore.toFixed(2)),
    historical_score: historicalScore,
    density_contrib: Number((w1 * densityScore).toFixed(2)),
    historical_contrib: Number((w2 * historicalScore).toFixed(2))
  };
}

// Distance solver (Haversine)
export function haversineDist(lat1, lon1, lat2, lon2) {
  const R = 6371.0;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

// CAD Dispatch Solver
export function solveDispatch(junction, hour = 17, officersList = NAGPUR_DATASET.officers) {
  let shiftName = "Shift 1";
  if (hour >= 15 && hour < 22) shiftName = "Shift 2";
  if (hour >= 22 || hour < 8) shiftName = "Night Emergency";

  if (shiftName === "Night Emergency") {
    // Station Pop-Up Escalation
    let nearestStation = null;
    let minD = Infinity;
    NAGPUR_DATASET.police_zones.forEach(z => {
      const st = z.police_station;
      const d = haversineDist(st.lat, st.lng, junction.lat, junction.lng);
      if (d < minD) {
        minD = d;
        nearestStation = st;
      }
    });
    return {
      mode: "NIGHT_STATION_ALERT",
      shift: shiftName,
      station: nearestStation,
      distance_km: minD,
      recommendation_summary: `Night Emergency Protocol Active (${String(hour).padStart(2, '0')}:00). Station Alert sent to ${nearestStation.name} (${minD} km away).`,
      rationale: [
        "24-Hour YOLO Risk Monitoring active",
        `Time (${String(hour).padStart(2, '0')}:00) is within Night Emergency Slot (22:00 - 08:00)`,
        `Direct officer auto-assignment suspended; Station pop-up sent to ${nearestStation.name}`,
        `Available On-Call Night Officers at Station: ${nearestStation.on_call_night_officers}`
      ],
      eligible: [],
      excluded: []
    };
  }

  const eligible = [];
  const excluded = [];

  officersList.forEach(off => {
    const reasons = [];
    if (off.shift !== shiftName) reasons.push(`Assigned to ${off.shift} (Active: ${shiftName})`);
    if (off.status !== "Available") reasons.push(`Status is '${off.status}'`);
    if (off.deployments_today >= 1) reasons.push(`Completed daily deployment cap (1/1)`);
    if (off.last_assigned_area === junction.junction_id) reasons.push(`Rotation Rule: Assigned here yesterday`);

    const d = haversineDist(off.current_lat, off.current_lng, junction.lat, junction.lng);

    if (reasons.length === 0) {
      eligible.push({ officer: off, distance_km: d });
    } else {
      excluded.push({ officer_name: off.name, reasons });
    }
  });

  eligible.sort((a, b) => a.distance_km - b.distance_km);

  if (eligible.length > 0) {
    const pick = eligible[0];
    return {
      mode: "DAY_CAD_DISPATCH",
      shift: shiftName,
      recommended_officer: pick.officer,
      distance_km: pick.distance_km,
      eta_minutes: Math.max(2, Math.round(pick.distance_km * 3)),
      recommendation_summary: `Selected ${pick.officer.rank} ${pick.officer.name} (${pick.officer.vehicle}) situated ${pick.distance_km} km away.`,
      rationale: [
        `Active in current shift (${shiftName})`,
        `Available with 0 prior deployments today (Daily Max Rule Passed)`,
        `Rotation Rule Passed (Not assigned to ${junction.name} yesterday)`,
        `Closest eligible officer (${pick.distance_km} km away, ETA ~${Math.max(2, Math.round(pick.distance_km * 3))} mins)`
      ],
      eligible,
      excluded
    };
  } else {
    // Fallback
    const fallback = officersList.find(o => o.status === "Available") || officersList[0];
    const d = haversineDist(fallback.current_lat, fallback.current_lng, junction.lat, junction.lng);
    return {
      mode: "DAY_CAD_DISPATCH_FALLBACK",
      shift: shiftName,
      recommended_officer: fallback,
      distance_km: d,
      eta_minutes: Math.max(2, Math.round(d * 3)),
      recommendation_summary: `Emergency Exemption: Assigned ${fallback.name} (${d} km away) due to high risk demand.`,
      rationale: [
        "Primary roster candidates restricted by fatigue/shift limits",
        "CAD Exemption override triggered",
        `Nearest officer dispatched (${d} km)`
      ],
      eligible: [],
      excluded
    };
  }
}
