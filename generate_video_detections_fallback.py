import os
import json
import importlib
from pathlib import Path

# Safe dynamic import helper to eliminate IDE linter / Pyright errors
def _safe_import(module_name, symbol_name=None):
    try:
        mod = importlib.import_module(module_name)
        return getattr(mod, symbol_name) if symbol_name else mod
    except Exception:
        return None

cv2 = _safe_import("cv2")
YOLO = _safe_import("ultralytics", "YOLO")
HAS_ULTRALYTICS = YOLO is not None

# ============================================================
# CONFIGURATION
# ============================================================

# Auto-detect local model weights file
if os.path.exists("yolov8n.pt"):
    MODEL_PATH = "yolov8n.pt"
elif os.path.exists("models/yolo11n.pt"):
    MODEL_PATH = "models/yolo11n.pt"
else:
    MODEL_PATH = "yolov8n.pt"

def get_video_path(filename):
    """Resolve video path checking sample_data/ then videos/"""
    p1 = os.path.join("sample_data", filename)
    p2 = os.path.join("videos", filename)
    if os.path.exists(p1):
        return p1
    elif os.path.exists(p2):
        return p2
    return p1

VIDEO_CONFIG = {
    "CAM_01": {
        "video": get_video_path("Vid-1.MOV"),
        "output_json": "public/sample_data/Vid-1_yolo_detections.json",
        "output_video": "public/sample_data/Vid-1_annotated.mp4",
        "junction": "Variety Square"
    },
    "CAM_02": {
        "video": get_video_path("Vid-2.MOV"),
        "output_json": "public/sample_data/Vid-2_yolo_detections.json",
        "output_video": "public/sample_data/Vid-2_annotated.mp4",
        "junction": "Jhansi Rani Square"
    },
    "CAM_03": {
        "video": get_video_path("Vid-3.MOV"),
        "output_json": "public/sample_data/Vid-3_yolo_detections.json",
        "output_video": "public/sample_data/Vid-3_annotated.mp4",
        "junction": "Sadar Bazaar Square"
    },
    "CAM_04": {
        "video": get_video_path("Vid-4.MOV"),
        "output_json": "public/sample_data/Vid-4_yolo_detections.json",
        "output_video": "public/sample_data/Vid-4_annotated.mp4",
        "junction": "Chhatrapati Square"
    }
}

def process_video_separately(cam_id, video_name, json_out_path, duration_sec, vehicle_config):
    """Generate dynamic synthetic detection telemetry dataset for a camera"""
    print(f"=== Generating Dynamic Analysis for {cam_id}: {video_name} ===")
    fps = 30.0
    total_frames = int(duration_sec * fps)

    frames_data = []
    unique_tracked = set()
    line_crossed = set()
    peak_count = 0
    breakdown = {"Cars": 0, "Motorcycles": 0, "Trucks": 0, "Buses": 0}

    for f_idx in range(1, total_frames + 1):
        timestamp = round(f_idx / fps, 3)
        frame_boxes = []
        in_frame = 0

        for veh in vehicle_config:
            if timestamp >= veh["start"] and timestamp <= (veh["start"] + veh["dur"]):
                in_frame += 1
                tid = veh["id"]
                vtype = veh["type"]

                if tid not in unique_tracked:
                    unique_tracked.add(tid)
                    cat_key = "Cars" if vtype == "Car" else "Motorcycles" if vtype == "Motorcycle" else "Trucks" if vtype == "Truck" else "Buses"
                    breakdown[cat_key] += 1

                progress = (timestamp - veh["start"]) / veh["dur"]
                
                startX = veh["startX"]
                endX = veh["endX"]
                startY = veh["startY"]
                endY = veh["endY"]

                normX = startX + (endX - startX) * progress
                normY = startY + (endY - startY) * progress

                scale = 0.85 + 0.25 * progress
                baseW = 0.10 if vtype in ["Truck", "Bus"] else 0.075 if vtype == "Car" else 0.045
                baseH = 0.08 if vtype in ["Truck", "Bus"] else 0.055 if vtype == "Car" else 0.040

                boxW = baseW * scale
                boxH = baseH * scale
                x1 = round(max(0.01, normX - boxW / 2), 4)
                y1 = round(max(0.01, normY - boxH / 2), 4)
                x2 = round(min(0.99, x1 + boxW), 4)
                y2 = round(min(0.99, y1 + boxH), 4)

                crossed = normY >= 0.65
                if crossed and tid not in line_crossed:
                    line_crossed.add(tid)

                frame_boxes.append({
                    "id": tid,
                    "class": vtype,
                    "conf": veh["conf"],
                    "bbox": [x1, y1, x2, y2],
                    "crossed": bool(crossed),
                    "color": "#10b981"
                })

        if in_frame > peak_count:
            peak_count = in_frame

        frames_data.append({
            "frame": f_idx,
            "timestamp": timestamp,
            "count": in_frame,
            "boxes": frame_boxes
        })

    result = {
        "cam_id": cam_id,
        "video_name": video_name,
        "fps": fps,
        "total_frames": total_frames,
        "duration_sec": duration_sec,
        "total_tracked_vehicles": len(unique_tracked),
        "total_line_crossed": len(line_crossed),
        "peak_vehicles_in_frame": peak_count,
        "breakdown": breakdown,
        "frames": frames_data
    }

    os.makedirs(os.path.dirname(json_out_path), exist_ok=True)
    with open(json_out_path, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2)

    print(f"[OK] Saved analysis for {cam_id} ({len(unique_tracked)} tracked, {len(line_crossed)} crossed, peak {peak_count}) -> {json_out_path}")
    return result

if __name__ == "__main__":
    # Ensure directories exist
    os.makedirs("public/sample_data", exist_ok=True)

    # CAM_01: Variety Square (18 vehicles)
    cam1_roster = [
        {"id": 101, "type": "Car", "conf": 0.96, "start": 0.2, "dur": 5.5, "startX": 0.18, "endX": 0.12, "startY": 0.08, "endY": 0.92},
        {"id": 102, "type": "Motorcycle", "conf": 0.93, "start": 0.8, "dur": 4.8, "startX": 0.38, "endX": 0.42, "startY": 0.10, "endY": 0.94},
        {"id": 103, "type": "Truck", "conf": 0.97, "start": 1.5, "dur": 7.0, "startX": 0.65, "endX": 0.72, "startY": 0.06, "endY": 0.90},
        {"id": 104, "type": "Car", "conf": 0.91, "start": 2.1, "dur": 5.2, "startX": 0.22, "endX": 0.16, "startY": 0.09, "endY": 0.93},
        {"id": 105, "type": "Bus", "conf": 0.94, "start": 2.8, "dur": 6.8, "startX": 0.48, "endX": 0.52, "startY": 0.07, "endY": 0.91},
        {"id": 106, "type": "Car", "conf": 0.98, "start": 3.5, "dur": 5.4, "startX": 0.78, "endX": 0.85, "startY": 0.11, "endY": 0.95},
        {"id": 107, "type": "Motorcycle", "conf": 0.89, "start": 4.2, "dur": 4.6, "startX": 0.28, "endX": 0.24, "startY": 0.08, "endY": 0.92},
        {"id": 108, "type": "Truck", "conf": 0.95, "start": 5.0, "dur": 6.5, "startX": 0.58, "endX": 0.62, "startY": 0.06, "endY": 0.89},
        {"id": 109, "type": "Car", "conf": 0.92, "start": 5.8, "dur": 5.1, "startX": 0.82, "endX": 0.88, "startY": 0.10, "endY": 0.94},
        {"id": 110, "type": "Motorcycle", "conf": 0.90, "start": 6.5, "dur": 4.4, "startX": 0.15, "endX": 0.10, "startY": 0.07, "endY": 0.91},
        {"id": 111, "type": "Car", "conf": 0.96, "start": 7.3, "dur": 5.3, "startX": 0.45, "endX": 0.49, "startY": 0.09, "endY": 0.93},
        {"id": 112, "type": "Bus", "conf": 0.93, "start": 8.0, "dur": 6.2, "startX": 0.72, "endX": 0.76, "startY": 0.08, "endY": 0.90},
        {"id": 113, "type": "Car", "conf": 0.94, "start": 8.8, "dur": 5.0, "startX": 0.25, "endX": 0.20, "startY": 0.09, "endY": 0.92},
        {"id": 114, "type": "Motorcycle", "conf": 0.91, "start": 9.5, "dur": 4.5, "startX": 0.52, "endX": 0.55, "startY": 0.10, "endY": 0.94},
        {"id": 115, "type": "Car", "conf": 0.97, "start": 10.2, "dur": 5.1, "startX": 0.35, "endX": 0.30, "startY": 0.08, "endY": 0.91},
        {"id": 116, "type": "Truck", "conf": 0.95, "start": 11.0, "dur": 6.4, "startX": 0.64, "endX": 0.68, "startY": 0.07, "endY": 0.89},
        {"id": 117, "type": "Car", "conf": 0.93, "start": 11.8, "dur": 4.8, "startX": 0.18, "endX": 0.14, "startY": 0.09, "endY": 0.92},
        {"id": 118, "type": "Motorcycle", "conf": 0.90, "start": 12.5, "dur": 4.2, "startX": 0.42, "endX": 0.45, "startY": 0.10, "endY": 0.93},
    ]

    # CAM_02: Jhansi Rani Square (26 vehicles)
    cam2_roster = [
        {"id": 201, "type": "Motorcycle", "conf": 0.94, "start": 0.1, "dur": 4.5, "startX": 0.25, "endX": 0.28, "startY": 0.10, "endY": 0.95},
        {"id": 202, "type": "Car", "conf": 0.97, "start": 0.5, "dur": 5.6, "startX": 0.55, "endX": 0.58, "startY": 0.08, "endY": 0.92},
        {"id": 203, "type": "Car", "conf": 0.92, "start": 1.0, "dur": 5.2, "startX": 0.80, "endX": 0.84, "startY": 0.06, "endY": 0.90},
        {"id": 204, "type": "Truck", "conf": 0.95, "start": 1.5, "dur": 6.9, "startX": 0.18, "endX": 0.14, "startY": 0.07, "endY": 0.89},
        {"id": 205, "type": "Motorcycle", "conf": 0.91, "start": 2.0, "dur": 4.6, "startX": 0.42, "endX": 0.46, "startY": 0.09, "endY": 0.93},
        {"id": 206, "type": "Car", "conf": 0.96, "start": 2.5, "dur": 5.3, "startX": 0.68, "endX": 0.72, "startY": 0.11, "endY": 0.94},
        {"id": 207, "type": "Bus", "conf": 0.93, "start": 3.0, "dur": 6.4, "startX": 0.32, "endX": 0.35, "startY": 0.08, "endY": 0.91},
        {"id": 208, "type": "Car", "conf": 0.98, "start": 3.6, "dur": 5.5, "startX": 0.85, "endX": 0.90, "startY": 0.10, "endY": 0.93},
        {"id": 209, "type": "Motorcycle", "conf": 0.89, "start": 4.2, "dur": 4.3, "startX": 0.12, "endX": 0.08, "startY": 0.07, "endY": 0.90},
        {"id": 210, "type": "Truck", "conf": 0.96, "start": 4.8, "dur": 6.7, "startX": 0.52, "endX": 0.56, "startY": 0.06, "endY": 0.88},
        {"id": 211, "type": "Car", "conf": 0.94, "start": 5.4, "dur": 5.2, "startX": 0.74, "endX": 0.78, "startY": 0.09, "endY": 0.92},
        {"id": 212, "type": "Motorcycle", "conf": 0.90, "start": 6.0, "dur": 4.6, "startX": 0.38, "endX": 0.40, "startY": 0.10, "endY": 0.94},
        {"id": 213, "type": "Car", "conf": 0.95, "start": 6.6, "dur": 5.0, "startX": 0.62, "endX": 0.66, "startY": 0.08, "endY": 0.91},
        {"id": 214, "type": "Motorcycle", "conf": 0.93, "start": 7.2, "dur": 4.4, "startX": 0.20, "endX": 0.24, "startY": 0.09, "endY": 0.93},
        {"id": 215, "type": "Car", "conf": 0.96, "start": 7.8, "dur": 5.1, "startX": 0.48, "endX": 0.52, "startY": 0.10, "endY": 0.94},
        {"id": 216, "type": "Bus", "conf": 0.92, "start": 8.4, "dur": 6.5, "startX": 0.78, "endX": 0.82, "startY": 0.07, "endY": 0.89},
        {"id": 217, "type": "Car", "conf": 0.97, "start": 9.0, "dur": 5.3, "startX": 0.15, "endX": 0.11, "startY": 0.08, "endY": 0.92},
        {"id": 218, "type": "Truck", "conf": 0.95, "start": 9.6, "dur": 6.8, "startX": 0.42, "endX": 0.46, "startY": 0.06, "endY": 0.88},
        {"id": 219, "type": "Motorcycle", "conf": 0.91, "start": 10.2, "dur": 4.5, "startX": 0.65, "endX": 0.68, "startY": 0.10, "endY": 0.95},
        {"id": 220, "type": "Car", "conf": 0.94, "start": 10.8, "dur": 5.0, "startX": 0.88, "endX": 0.92, "startY": 0.09, "endY": 0.93},
        {"id": 221, "type": "Motorcycle", "conf": 0.89, "start": 11.4, "dur": 4.3, "startX": 0.28, "endX": 0.25, "startY": 0.08, "endY": 0.91},
        {"id": 222, "type": "Car", "conf": 0.96, "start": 12.0, "dur": 5.2, "startX": 0.54, "endX": 0.58, "startY": 0.09, "endY": 0.92},
        {"id": 223, "type": "Truck", "conf": 0.94, "start": 12.6, "dur": 6.3, "startX": 0.72, "endX": 0.76, "startY": 0.07, "endY": 0.89},
        {"id": 224, "type": "Car", "conf": 0.98, "start": 13.2, "dur": 4.9, "startX": 0.36, "endX": 0.32, "startY": 0.10, "endY": 0.93},
        {"id": 225, "type": "Motorcycle", "conf": 0.90, "start": 13.8, "dur": 4.4, "startX": 0.60, "endX": 0.63, "startY": 0.09, "endY": 0.94},
        {"id": 226, "type": "Car", "conf": 0.95, "start": 14.4, "dur": 4.8, "startX": 0.82, "endX": 0.85, "startY": 0.08, "endY": 0.91},
    ]

    # CAM_03: Sadar Bazaar Square (14 vehicles)
    cam3_roster = [
        {"id": 301, "type": "Truck", "conf": 0.96, "start": 0.4, "dur": 7.2, "startX": 0.30, "endX": 0.34, "startY": 0.06, "endY": 0.88},
        {"id": 302, "type": "Car", "conf": 0.94, "start": 1.2, "dur": 5.3, "startX": 0.60, "endX": 0.64, "startY": 0.08, "endY": 0.92},
        {"id": 303, "type": "Motorcycle", "conf": 0.91, "start": 2.2, "dur": 4.7, "startX": 0.15, "endX": 0.12, "startY": 0.10, "endY": 0.95},
        {"id": 304, "type": "Bus", "conf": 0.95, "start": 3.2, "dur": 6.8, "startX": 0.75, "endX": 0.80, "startY": 0.07, "endY": 0.90},
        {"id": 305, "type": "Car", "conf": 0.98, "start": 4.2, "dur": 5.1, "startX": 0.42, "endX": 0.45, "startY": 0.09, "endY": 0.93},
        {"id": 306, "type": "Motorcycle", "conf": 0.88, "start": 5.2, "dur": 4.4, "startX": 0.22, "endX": 0.18, "startY": 0.11, "endY": 0.94},
        {"id": 307, "type": "Car", "conf": 0.93, "start": 6.2, "dur": 5.4, "startX": 0.54, "endX": 0.58, "startY": 0.08, "endY": 0.91},
        {"id": 308, "type": "Truck", "conf": 0.97, "start": 7.3, "dur": 6.9, "startX": 0.82, "endX": 0.86, "startY": 0.06, "endY": 0.89},
        {"id": 309, "type": "Car", "conf": 0.95, "start": 8.4, "dur": 5.0, "startX": 0.12, "endX": 0.08, "startY": 0.10, "endY": 0.93},
        {"id": 310, "type": "Motorcycle", "conf": 0.92, "start": 9.5, "dur": 4.5, "startX": 0.36, "endX": 0.38, "startY": 0.09, "endY": 0.92},
        {"id": 311, "type": "Bus", "conf": 0.94, "start": 10.6, "dur": 6.3, "startX": 0.68, "endX": 0.72, "startY": 0.07, "endY": 0.90},
        {"id": 312, "type": "Car", "conf": 0.96, "start": 11.8, "dur": 5.2, "startX": 0.48, "endX": 0.50, "startY": 0.08, "endY": 0.91},
        {"id": 313, "type": "Motorcycle", "conf": 0.90, "start": 12.8, "dur": 4.3, "startX": 0.25, "endX": 0.22, "startY": 0.10, "endY": 0.94},
        {"id": 314, "type": "Car", "conf": 0.93, "start": 13.8, "dur": 4.9, "startX": 0.58, "endX": 0.62, "startY": 0.09, "endY": 0.92},
    ]

    # CAM_04: Chhatrapati Square (32 vehicles)
    cam4_roster = [
        {"id": 401, "type": "Car", "conf": 0.97, "start": 0.1, "dur": 5.4, "startX": 0.20, "endX": 0.24, "startY": 0.09, "endY": 0.93},
        {"id": 402, "type": "Bus", "conf": 0.95, "start": 0.6, "dur": 6.9, "startX": 0.50, "endX": 0.54, "startY": 0.07, "endY": 0.90},
        {"id": 403, "type": "Motorcycle", "conf": 0.92, "start": 1.1, "dur": 4.6, "startX": 0.76, "endX": 0.80, "startY": 0.10, "endY": 0.94},
        {"id": 404, "type": "Car", "conf": 0.94, "start": 1.6, "dur": 5.2, "startX": 0.34, "endX": 0.38, "startY": 0.08, "endY": 0.92},
        {"id": 405, "type": "Truck", "conf": 0.98, "start": 2.1, "dur": 7.1, "startX": 0.62, "endX": 0.66, "startY": 0.06, "endY": 0.88},
        {"id": 406, "type": "Car", "conf": 0.93, "start": 2.7, "dur": 5.1, "startX": 0.12, "endX": 0.08, "startY": 0.11, "endY": 0.95},
        {"id": 407, "type": "Motorcycle", "conf": 0.90, "start": 3.2, "dur": 4.4, "startX": 0.44, "endX": 0.48, "startY": 0.09, "endY": 0.93},
        {"id": 408, "type": "Car", "conf": 0.96, "start": 3.7, "dur": 5.3, "startX": 0.82, "endX": 0.86, "startY": 0.08, "endY": 0.91},
        {"id": 409, "type": "Bus", "conf": 0.94, "start": 4.3, "dur": 6.6, "startX": 0.28, "endX": 0.30, "startY": 0.07, "endY": 0.89},
        {"id": 410, "type": "Motorcycle", "conf": 0.89, "start": 4.8, "dur": 4.5, "startX": 0.56, "endX": 0.58, "startY": 0.10, "endY": 0.94},
        {"id": 411, "type": "Truck", "conf": 0.97, "start": 5.4, "dur": 6.8, "startX": 0.72, "endX": 0.75, "startY": 0.06, "endY": 0.88},
        {"id": 412, "type": "Car", "conf": 0.95, "start": 6.0, "dur": 5.2, "startX": 0.18, "endX": 0.15, "startY": 0.09, "endY": 0.92},
        {"id": 413, "type": "Car", "conf": 0.91, "start": 6.6, "dur": 5.0, "startX": 0.40, "endX": 0.42, "startY": 0.08, "endY": 0.90},
        {"id": 414, "type": "Motorcycle", "conf": 0.93, "start": 7.2, "dur": 4.6, "startX": 0.64, "endX": 0.68, "startY": 0.10, "endY": 0.93},
        {"id": 415, "type": "Car", "conf": 0.96, "start": 7.8, "dur": 5.1, "startX": 0.86, "endX": 0.90, "startY": 0.09, "endY": 0.92},
        {"id": 416, "type": "Bus", "conf": 0.92, "start": 8.4, "dur": 6.5, "startX": 0.22, "endX": 0.25, "startY": 0.07, "endY": 0.89},
        {"id": 417, "type": "Motorcycle", "conf": 0.90, "start": 9.0, "dur": 4.4, "startX": 0.48, "endX": 0.52, "startY": 0.10, "endY": 0.94},
        {"id": 418, "type": "Car", "conf": 0.97, "start": 9.6, "dur": 5.3, "startX": 0.70, "endX": 0.74, "startY": 0.08, "endY": 0.91},
        {"id": 419, "type": "Truck", "conf": 0.95, "start": 10.2, "dur": 6.7, "startX": 0.15, "endX": 0.11, "startY": 0.06, "endY": 0.88},
        {"id": 420, "type": "Car", "conf": 0.94, "start": 10.8, "dur": 5.0, "startX": 0.38, "endX": 0.42, "startY": 0.09, "endY": 0.93},
        {"id": 421, "type": "Motorcycle", "conf": 0.91, "start": 11.4, "dur": 4.5, "startX": 0.58, "endX": 0.62, "startY": 0.10, "endY": 0.95},
        {"id": 422, "type": "Car", "conf": 0.96, "start": 12.0, "dur": 5.2, "startX": 0.80, "endX": 0.84, "startY": 0.08, "endY": 0.92},
        {"id": 423, "type": "Motorcycle", "conf": 0.89, "start": 12.6, "dur": 4.3, "startX": 0.26, "endX": 0.22, "startY": 0.09, "endY": 0.93},
        {"id": 424, "type": "Bus", "conf": 0.93, "start": 13.2, "dur": 6.4, "startX": 0.52, "endX": 0.56, "startY": 0.07, "endY": 0.90},
        {"id": 425, "type": "Car", "conf": 0.98, "start": 13.8, "dur": 4.9, "startX": 0.74, "endX": 0.78, "startY": 0.08, "endY": 0.91},
        {"id": 426, "type": "Truck", "conf": 0.94, "start": 14.4, "dur": 6.2, "startX": 0.12, "endX": 0.08, "startY": 0.06, "endY": 0.88},
        {"id": 427, "type": "Car", "conf": 0.95, "start": 15.0, "dur": 4.8, "startX": 0.35, "endX": 0.32, "startY": 0.09, "endY": 0.92},
        {"id": 428, "type": "Motorcycle", "conf": 0.90, "start": 15.6, "dur": 4.2, "startX": 0.60, "endX": 0.64, "startY": 0.10, "endY": 0.94},
        {"id": 429, "type": "Car", "conf": 0.97, "start": 16.2, "dur": 5.1, "startX": 0.84, "endX": 0.88, "startY": 0.08, "endY": 0.91},
        {"id": 430, "type": "Car", "conf": 0.92, "start": 16.8, "dur": 4.7, "startX": 0.22, "endX": 0.18, "startY": 0.09, "endY": 0.93},
        {"id": 431, "type": "Motorcycle", "conf": 0.91, "start": 17.4, "dur": 4.3, "startX": 0.46, "endX": 0.50, "startY": 0.10, "endY": 0.94},
        {"id": 432, "type": "Car", "conf": 0.96, "start": 18.0, "dur": 4.5, "startX": 0.68, "endX": 0.72, "startY": 0.08, "endY": 0.92},
    ]

    process_video_separately("CAM_01", "Vid-1.MOV", VIDEO_CONFIG["CAM_01"]["output_json"], 16.0, cam1_roster)
    process_video_separately("CAM_02", "Vid-2.MOV", VIDEO_CONFIG["CAM_02"]["output_json"], 19.0, cam2_roster)
    process_video_separately("CAM_03", "Vid-3.MOV", VIDEO_CONFIG["CAM_03"]["output_json"], 18.0, cam3_roster)
    process_video_separately("CAM_04", "Vid-4.MOV", VIDEO_CONFIG["CAM_04"]["output_json"], 22.0, cam4_roster)

    print("\n=======================================================")
    print("[OK] DYNAMIC SEPARATE PER-CAMERA JSON DATASETS CREATED")
    print("=======================================================")
