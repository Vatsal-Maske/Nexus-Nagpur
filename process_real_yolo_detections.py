"""
Real YOLO Vehicle Detection & ByteTracking Frame Extractor for Nagpur Nexus
Runs YOLOv8 model on Vid-1.MOV to Vid-4.MOV and extracts per-frame real detection metadata:
- normalized bounding boxes [x1, y1, x2, y2]
- vehicle class (Car, Motorcycle, Truck, Bus)
- tracking ID (persistent ByteTrack ID per vehicle)
- confidence score
- line crossing event at y=0.65
- per-camera category breakdown and peak metrics
"""

import os
import json
import cv2
import numpy as np

def process_video_yolo(video_path, output_json_path, model_name="yolov8n.pt"):
    from ultralytics import YOLO
    print(f"=== Processing {video_path} with {model_name} ===")
    if not os.path.exists(video_path):
        print(f"Error: {video_path} not found.")
        return None

    model = YOLO(model_name)
    cap = cv2.VideoCapture(video_path)

    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    print(f"Video Dimensions: {width}x{height} @ {fps:.2f} FPS | Total Frames: {total_frames}")

    # COCO Class mapping for vehicles: 2: Car, 3: Motorcycle, 5: Bus, 7: Truck
    target_classes = {
        2: "Car",
        3: "Motorcycle",
        5: "Bus",
        7: "Truck"
    }

    frames_data = []
    unique_tracked_ids = set()
    line_crossed_ids = set()
    peak_vehicles = 0
    category_counts = {"Cars": 0, "Motorcycles": 0, "Trucks": 0, "Buses": 0}

    frame_idx = 0
    counting_line_ratio = 0.65

    # Process video frame by frame with tracker (ByteTrack)
    results = model.track(source=video_path, stream=True, persist=True, tracker="bytetrack.yaml", verbose=False)

    for r in results:
        frame_idx += 1
        timestamp = round(frame_idx / fps, 3)

        frame_boxes = []
        current_frame_vehicles = 0

        if r.boxes is not None and len(r.boxes) > 0:
            boxes = r.boxes.xyxy.cpu().numpy()
            clss = r.boxes.cls.cpu().numpy().astype(int)
            confs = r.boxes.conf.cpu().numpy()
            track_ids = r.boxes.id.cpu().numpy().astype(int) if r.boxes.id is not None else [i+1 for i in range(len(boxes))]

            for box, cls_id, conf, tid in zip(boxes, clss, confs, track_ids):
                if cls_id in target_classes and conf >= 0.20:
                    current_frame_vehicles += 1
                    cat_name = target_classes[cls_id]

                    if tid not in unique_tracked_ids:
                        unique_tracked_ids.add(int(tid))
                        cat_key = "Cars" if cat_name == "Car" else "Motorcycles" if cat_name == "Motorcycle" else "Trucks" if cat_name == "Truck" else "Buses"
                        category_counts[cat_key] += 1

                    x1, y1, x2, y2 = box
                    norm_x1 = round(float(x1 / width), 4)
                    norm_y1 = round(float(y1 / height), 4)
                    norm_x2 = round(float(x2 / width), 4)
                    norm_y2 = round(float(y2 / height), 4)

                    center_y = (norm_y1 + norm_y2) / 2.0
                    crossed = center_y >= counting_line_ratio
                    if crossed and tid not in line_crossed_ids:
                        line_crossed_ids.add(int(tid))

                    frame_boxes.append({
                        "id": int(tid),
                        "class": cat_name,
                        "conf": round(float(conf), 2),
                        "bbox": [norm_x1, norm_y1, norm_x2, norm_y2],
                        "crossed": bool(crossed)
                    })

        if current_frame_vehicles > peak_vehicles:
            peak_vehicles = current_frame_vehicles

        frames_data.append({
            "frame": frame_idx,
            "timestamp": timestamp,
            "count": current_frame_vehicles,
            "boxes": frame_boxes
        })

        if frame_idx % 100 == 0 or frame_idx == total_frames:
            print(f"Progress: {frame_idx}/{total_frames} frames (Tracked: {len(unique_tracked_ids)}, Line Crossed: {len(line_crossed_ids)})")

    cap.release()

    video_report = {
        "video_path": video_path,
        "width": width,
        "height": height,
        "fps": fps,
        "total_frames": frame_idx,
        "duration_sec": round(frame_idx / fps, 2),
        "total_tracked_vehicles": len(unique_tracked_ids),
        "total_line_crossed": len(line_crossed_ids),
        "peak_vehicles_in_frame": peak_vehicles,
        "breakdown": category_counts,
        "frames": frames_data
    }

    os.makedirs(os.path.dirname(output_json_path), exist_ok=True)
    with open(output_json_path, "w") as f:
        json.dump(video_report, f, indent=2)

    print(f"=== Saved real YOLO detection dataset to {output_json_path} ===")
    return video_report

if __name__ == "__main__":
    videos = [
        ("sample_data/Vid-1.MOV", "public/sample_data/Vid-1_yolo_detections.json"),
        ("sample_data/Vid-2.MOV", "public/sample_data/Vid-2_yolo_detections.json"),
        ("sample_data/Vid-3.MOV", "public/sample_data/Vid-3_yolo_detections.json"),
        ("sample_data/Vid-4.MOV", "public/sample_data/Vid-4_yolo_detections.json"),
    ]
    for v_in, v_out in videos:
        if os.path.exists(v_in):
            process_video_yolo(v_in, v_out)
        else:
            print(f"Skipping missing video: {v_in}")
