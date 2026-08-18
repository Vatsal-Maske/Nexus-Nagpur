"""
Run YOLO detection + tracking on IMG_4528.MOV and render annotated cam04_h264.mp4 with green boxes baked in.
"""
import os, json, cv2, subprocess, numpy as np
import imageio_ffmpeg

def run_yolo_and_render(video_in, json_out, video_out, max_frames=None, target_w=1280, target_h=720, model_name="yolov8m.pt", conf=0.2):
    from ultralytics import YOLO
    print(f"=== YOLO Detection on {video_in} ===")

    model = YOLO(model_name)
    print(f"Model: {model_name} | Conf threshold: {conf}")
    cap = cv2.VideoCapture(video_in)
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    cap.release()

    print(f"Frames: {total}, FPS: {fps}")
    if max_frames is None:
        max_frames = total

    # All vehicle-related COCO classes including heavy vehicles
    target_classes = {
        1:  "Bicycle",
        2:  "Car",
        3:  "Motorcycle",
        5:  "Bus",
        6:  "Train",
        7:  "Truck",
        8:  "Boat",
    }
    frames_data = []
    unique_ids = set()
    crossed_ids = set()
    peak = 0
    breakdown = {"Cars": 0, "Motorcycles": 0, "Trucks": 0, "Buses": 0, "Bicycles": 0, "Others": 0}
    frame_idx = 0
    line_y = 0.65

    results = model.track(source=video_in, stream=True, persist=True,
                          tracker="bytetrack.yaml", conf=conf, verbose=False)

    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    os.makedirs(os.path.dirname(video_out), exist_ok=True)
    proc = subprocess.Popen(
        [ffmpeg, "-y",
         "-f", "rawvideo", "-vcodec", "rawvideo",
         "-s", f"{target_w}x{target_h}", "-pix_fmt", "bgr24",
         "-r", str(fps), "-i", "pipe:0",
         "-c:v", "libx264", "-preset", "fast", "-crf", "28",
         "-movflags", "+faststart", "-pix_fmt", "yuv420p",
         video_out],
        stdin=subprocess.PIPE, stderr=subprocess.DEVNULL
    )

    for r in results:
        if frame_idx >= max_frames:
            break

        frame = r.orig_img.copy()
        frame = cv2.resize(frame, (target_w, target_h))
        line_px = int(target_h * line_y)

        # Draw counting line
        cv2.line(frame, (0, line_px), (target_w, line_px), (0, 255, 255), 1, cv2.LINE_AA)
        cv2.putText(frame, "YOLO COUNTING LINE (y=0.65)", (8, line_px - 4),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.35, (0, 255, 255), 1, cv2.LINE_AA)

        frame_boxes = []
        current_count = 0

        if r.boxes is not None and len(r.boxes):
            for box in r.boxes:
                cls_id = int(box.cls[0]) if box.cls is not None else -1
                if cls_id not in target_classes:
                    continue
                tid = int(box.id[0]) if box.id is not None else -1
                conf = float(box.conf[0]) if box.conf is not None else 0.9
                x1, y1, x2, y2 = box.xyxyn[0].tolist()

                crossed = False
                center_y = (y1 + y2) / 2
                if center_y > line_y and tid not in crossed_ids and tid != -1:
                    crossed_ids.add(tid)
                    crossed = True

                if tid != -1:
                    unique_ids.add(tid)
                current_count += 1

                vtype = target_classes[cls_id]
                if vtype == "Car": breakdown["Cars"] += 1
                elif vtype == "Motorcycle": breakdown["Motorcycles"] += 1
                elif vtype == "Truck": breakdown["Trucks"] += 1
                elif vtype == "Bus": breakdown["Buses"] += 1
                elif vtype == "Bicycle": breakdown["Bicycles"] += 1
                else: breakdown["Others"] += 1

                frame_boxes.append({
                    "id": tid, "class": vtype, "conf": round(conf, 3),
                    "bbox": [round(x1, 4), round(y1, 4), round(x2, 4), round(y2, 4)],
                    "crossed": crossed
                })

                # Draw box on frame
                bx1 = int(x1 * target_w); by1 = int(y1 * target_h)
                bx2 = int(x2 * target_w); by2 = int(y2 * target_h)
                color = (34, 197, 94) if not crossed else (94, 197, 34)

                overlay = frame.copy()
                cv2.rectangle(overlay, (bx1, by1), (bx2, by2), color, -1)
                cv2.addWeighted(overlay, 0.12, frame, 0.88, 0, frame)
                cv2.rectangle(frame, (bx1, by1), (bx2, by2), color, 2, cv2.LINE_AA)

                label = f"{vtype} #{tid} {int(conf*100)}%"
                (fw, fh), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.35, 1)
                lx = max(2, min(bx1, target_w - fw - 4))
                ly1 = by1 - fh - 4 if by1 - fh - 4 > 2 else by1 + 2
                ly2 = ly1 + fh + 4
                cv2.rectangle(frame, (lx, ly1), (lx + fw + 4, ly2), (6, 78, 42), -1)
                cv2.rectangle(frame, (lx, ly1), (lx + fw + 4, ly2), (180, 180, 180), 1)
                cv2.putText(frame, label, (lx + 2, ly2 - 3),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.35, (255, 255, 255), 1, cv2.LINE_AA)

        peak = max(peak, current_count)
        frames_data.append({"frame": frame_idx, "boxes": frame_boxes})

        try:
            proc.stdin.write(frame.tobytes())
        except BrokenPipeError:
            break

        frame_idx += 1
        if frame_idx % 100 == 0:
            print(f"  Frame {frame_idx}/{max_frames} | Active: {current_count}")

    try:
        proc.stdin.close()
    except:
        pass
    proc.wait()
    print(f"[OK] Video saved: {video_out} ({os.path.getsize(video_out)/1024/1024:.1f} MB)")

    report = {
        "camera_id": "CAM_04",
        "total_tracked": len(unique_ids),
        "total_line_crossed": len(crossed_ids),
        "peak_vehicles_in_frame": peak,
        "breakdown": breakdown,
        "frames": frames_data
    }
    os.makedirs(os.path.dirname(json_out), exist_ok=True)
    with open(json_out, "w") as f:
        json.dump(report, f)
    print(f"[OK] JSON saved: {json_out}")

if __name__ == "__main__":
    run_yolo_and_render(
        video_in="public/sample_data/IMG_4528.MOV",
        json_out="public/sample_data/IMG_4528_yolo_detections.json",
        video_out="public/sample_data/cam04_h264.mp4",
        max_frames=None,
        model_name="yolov8m.pt",  # Medium model — much better for trucks/buses
        conf=0.2                   # Low threshold to catch all vehicles
    )
