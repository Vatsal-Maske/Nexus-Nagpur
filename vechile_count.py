"""
Vehicle Detection, Tracking, and Counting Script
Uses Ultralytics YOLOv8 with ByteTrack for dense traffic vehicle analysis.
"""

import cv2
import json
import os
import time
from collections import defaultdict, deque
import numpy as np
from ultralytics import YOLO

def process_vehicle_counting(
    video_path="Video Project.mp4",
    output_path="vehicle_project_output.mp4",
    model_name="yolo11m.pt",
    conf_threshold=0.15,
    counting_line_ratio=0.65, # Horizontal line position (fraction of frame height)
):
    print("=" * 60)
    print("      NAGPUR NEXUS - VEHICLE COUNTING & TRAFFIC ANALYZER      ")
    print("=" * 60)
    print(f"Input Video: {video_path}")
    print(f"Model: {model_name}")
    print(f"Confidence Threshold: {conf_threshold}")
    
    if not os.path.exists(video_path):
        raise FileNotFoundError(f"Video file not found: {video_path}")

    # Load YOLO Model
    print("Loading YOLO model...")
    model = YOLO(model_name)

    # Open Video
    cap = cv2.VideoCapture(video_path)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    print(f"Video Dimensions: {width}x{height} @ {fps:.2f} FPS")
    print(f"Total Frames: {total_frames}")

    # Output Video Writer
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

    # COCO Class mapping for vehicles with user-requested colors (BGR format):
    # Truck: RED (0, 0, 255), Car: BLUE (255, 0, 0), Bicycle: GREEN (0, 255, 0), Others (Motorcycle, Bus): BLACK (0, 0, 0)
    target_classes = {
        1: ("Bicycle", (0, 255, 0)),       # Green
        2: ("Car", (255, 0, 0)),           # Blue
        3: ("Motorcycle", (0, 0, 0)),      # Black
        5: ("Bus", (0, 0, 0)),             # Black
        7: ("Truck", (0, 0, 255))          # Red
    }

    # Tracking & Counting Data Structures
    unique_tracked_ids = defaultdict(set) # class_name -> set of track_ids
    line_y = int(height * counting_line_ratio)
    line_crossed_ids = set()
    track_history = defaultdict(lambda: deque(maxlen=20)) # ID -> deque of centroid points (x, y)
    
    frame_counts = [] # per-frame counts for stats
    start_time = time.time()
    frame_idx = 0

    print("Processing video frames...")

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        
        frame_idx += 1
        
        # Run tracking using ByteTrack
        results = model.track(
            source=frame,
            persist=True,
            tracker="bytetrack.yaml",
            conf=conf_threshold,
            imgsz=864,
            classes=list(target_classes.keys()),
            verbose=False
        )

        current_frame_class_counts = defaultdict(int)

        # Draw counting line
        cv2.line(frame, (0, line_y), (width, line_y), (0, 0, 255), 2)
        cv2.putText(frame, "COUNTING LINE", (10, line_y - 8),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 1, cv2.LINE_AA)

        if results and len(results) > 0 and results[0].boxes is not None:
            boxes = results[0].boxes
            if boxes.id is not None:
                xyxy_list = boxes.xyxy.cpu().numpy()
                cls_list = boxes.cls.cpu().numpy()
                id_list = boxes.id.cpu().numpy()

                for box, cls_id, track_id in zip(xyxy_list, cls_list, id_list):
                    cls_id = int(cls_id)
                    track_id = int(track_id)
                    
                    if cls_id not in target_classes:
                        continue
                        
                    cls_name, color = target_classes[cls_id]
                    unique_tracked_ids[cls_name].add(track_id)
                    current_frame_class_counts[cls_name] += 1

                    x1, y1, x2, y2 = map(int, box)
                    cx, cy = (x1 + x2) // 2, (y1 + y2) // 2
                    
                    # Store center for path trail
                    track_history[track_id].append((cx, cy))

                    # Check line crossing
                    if len(track_history[track_id]) >= 2:
                        prev_cy = track_history[track_id][-2][1]
                        # Check if vehicle crossed the line (either direction)
                        if (prev_cy < line_y <= cy) or (prev_cy > line_y >= cy):
                            line_crossed_ids.add(track_id)

                    # Draw trailing path
                    points = np.array(track_history[track_id], dtype=np.int32).reshape((-1, 1, 2))
                    cv2.polylines(frame, [points], isClosed=False, color=color, thickness=2)

                    # Draw Bounding Box
                    cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)

                    # Draw Label
                    label = f"#{track_id} Vehicle"
                    text_color = (0, 0, 0) if color == (0, 255, 0) else (255, 255, 255)
                    (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.45, 1)
                    cv2.rectangle(frame, (x1, y1 - th - 6), (x1 + tw + 4, y1), color, -1)
                    cv2.putText(frame, label, (x1 + 2, y1 - 4),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.45, text_color, 1, cv2.LINE_AA)

        total_frame_vehicles = sum(current_frame_class_counts.values())
        frame_counts.append(total_frame_vehicles)

        # Build HUD Dashboard Overlay
        overlay = frame.copy()
        # Top panel
        cv2.rectangle(overlay, (0, 0), (width, 60), (20, 20, 20), -1)
        alpha = 0.75
        cv2.addWeighted(overlay, alpha, frame, 1 - alpha, 0, frame)

        # Header Title
        cv2.putText(frame, f"NAGPUR NEXUS TRAFFIC COUNTER | Frame: {frame_idx}/{total_frames}",
                    (15, 22), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 2, cv2.LINE_AA)

        # Statistics Bar (Total Vehicles Only)
        total_unique = sum(len(s) for s in unique_tracked_ids.values())
        stats_str = f"Active Vehicles: {total_frame_vehicles} | Total Unique Vehicles: {total_unique} | Line Crossed: {len(line_crossed_ids)}"
        cv2.putText(frame, stats_str, (15, 48), cv2.FONT_HERSHEY_SIMPLEX, 0.50, (0, 255, 255), 1, cv2.LINE_AA)

        out.write(frame)

        if frame_idx % 50 == 0 or frame_idx == total_frames:
            print(f"Processed {frame_idx}/{total_frames} frames...")

    cap.release()
    out.release()
    elapsed_time = time.time() - start_time

    # Generate Summary Report
    avg_per_frame = sum(frame_counts) / len(frame_counts) if frame_counts else 0
    max_per_frame = max(frame_counts) if frame_counts else 0

    report = {
        "video_file": video_path,
        "total_frames_processed": frame_idx,
        "processing_time_sec": round(elapsed_time, 2),
        "total_unique_vehicles_tracked": sum(len(s) for s in unique_tracked_ids.values()),
        "vehicles_crossed_line": len(line_crossed_ids),
        "average_vehicles_per_frame": round(avg_per_frame, 2),
        "peak_vehicles_in_single_frame": max_per_frame,
        "breakdown_by_category": {
            "Cars": len(unique_tracked_ids["Car"]),
            "Motorcycles_and_Scooters": len(unique_tracked_ids["Motorcycle"]),
            "Buses": len(unique_tracked_ids["Bus"]),
            "Trucks": len(unique_tracked_ids["Truck"]),
            "Bicycles": len(unique_tracked_ids["Bicycle"]),
        }
    }

    # Save summary report to JSON
    report_file = os.path.splitext(output_path)[0] + "_report.json"
    with open(report_file, "w") as f:
        json.dump(report, f, indent=4)

    print("\n" + "=" * 60)
    print("                     VEHICLE COUNTING SUMMARY                    ")
    print("=" * 60)
    print(f"Total Processing Time       : {elapsed_time:.2f} seconds")
    print(f"Total Unique Tracked        : {report['total_unique_vehicles_tracked']} vehicles")
    print(f"Vehicles Line-Crossed       : {report['vehicles_crossed_line']} vehicles")
    print(f"Average Density (per frame) : {report['average_vehicles_per_frame']} vehicles")
    print(f"Peak Density (max frame)   : {report['peak_vehicles_in_single_frame']} vehicles")
    print("-" * 60)
    print("Breakdown by Vehicle Type:")
    for cat, cnt in report["breakdown_by_category"].items():
        print(f"  - {cat:<24}: {cnt}")
    print("=" * 60)
    print(f"Annotated output saved to   : {output_path}")
    print(f"Detailed JSON report saved to: {report_file}")
    print("=" * 60)

    return report

if __name__ == "__main__":
    videos_to_process = [
        {
            "video": "sample_data/1st.mp4",
            "output": "sample_data/1st_output.mp4"
        },
        {
            "video": "sample_data/2nd.mp4",
            "output": "sample_data/2nd_output.mp4"
        },
        {
            "video": "sample_data/3rd.mp4",
            "output": "sample_data/3rd_output.mp4"
        },
        {
            "video": "sample_data/4th.mp4",
            "output": "sample_data/4th_output.mp4"
        }
    ]
    
    batch_reports = []
    for item in videos_to_process:
        if os.path.exists(item["video"]):
            rep = process_vehicle_counting(
                video_path=item["video"],
                output_path=item["output"],
                model_name="yolo11m.pt"
            )
            batch_reports.append(rep)

    # Save combined report
    combined_report = {
        "summary": "Consolidated Batch Traffic Report for All Videos (YOLOv11)",
        "total_videos_processed": len(batch_reports),
        "total_unique_vehicles_across_all_videos": sum(r["total_unique_vehicles_tracked"] for r in batch_reports),
        "total_vehicles_crossed_line": sum(r["vehicles_crossed_line"] for r in batch_reports),
        "video_reports": batch_reports
    }
    with open("combined_traffic_report.json", "w") as f:
        json.dump(combined_report, f, indent=4)

    print("\n" + "=" * 60)
    print("      ALL VIDEOS PROCESSED SUCCESSFULLY WITH YOLOV11       ")
    print("      Combined Report: combined_traffic_report.json       ")
    print("=" * 60)
