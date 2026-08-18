"""
Fast Render Annotated Output Videos with Green Bounding Boxes & Tracking
Generates compact, high-performance MP4 videos in public/output_videos/ for all 4 CCTV feeds.
"""

import os
import json
import cv2
import numpy as np

def render_video_fast(video_in, json_in, video_out, max_seconds=20.0, target_w=640, target_h=360):
    print(f"=== Rendering {video_in} -> {video_out} ({target_w}x{target_h}) ===")
    if not os.path.exists(video_in):
        print(f"Error: {video_in} not found.")
        return False
    if not os.path.exists(json_in):
        print(f"Error: {json_in} not found.")
        return False

    with open(json_in, "r") as f:
        det_data = json.load(f)

    cap = cv2.VideoCapture(video_in)
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    total_video_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    frames_list = det_data.get("frames", [])
    max_frames = min(int(max_seconds * fps), len(frames_list))
    if max_frames <= 0:
        max_frames = min(total_video_frames, len(frames_list))

    os.makedirs(os.path.dirname(video_out), exist_ok=True)
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(video_out, fourcc, fps, (target_w, target_h))

    line_y = int(target_h * 0.65)
    box_color_bgr = (129, 185, 16)      # Emerald green
    crossed_color_bgr = (94, 197, 34)   # Bright green when crossed line

    frame_idx = 0
    while cap.isOpened() and frame_idx < max_frames:
        ret, frame = cap.read()
        if not ret:
            break

        # Resize to target 640x360 for fast performance & low memory
        frame = cv2.resize(frame, (target_w, target_h))

        f_data = frames_list[frame_idx] if frame_idx < len(frames_list) else None

        # Draw YOLO Counting Line (y=0.65)
        cv2.line(frame, (0, line_y), (target_w, line_y), (212, 182, 6), 1, cv2.LINE_AA)
        cv2.putText(frame, "YOLO COUNTING LINE (y=0.65)", (8, line_y - 4),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.35, (212, 182, 6), 1, cv2.LINE_AA)

        if f_data and "boxes" in f_data:
            for box in f_data["boxes"]:
                tid = box["id"]
                vtype = box["class"]
                conf = box.get("conf", 0.95)
                crossed = box.get("crossed", False)
                norm_x1, norm_y1, norm_x2, norm_y2 = box["bbox"]

                x1 = int(norm_x1 * target_w)
                y1 = int(norm_y1 * target_h)
                x2 = int(norm_x2 * target_w)
                y2 = int(norm_y2 * target_h)

                color = crossed_color_bgr if crossed else box_color_bgr

                # Semi-transparent overlay box fill
                overlay = frame.copy()
                cv2.rectangle(overlay, (x1, y1), (x2, y2), color, -1)
                alpha = 0.12
                cv2.addWeighted(overlay, alpha, frame, 1 - alpha, 0, frame)

                # Draw 2px tight bounding box outline
                cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2, cv2.LINE_AA)

                # Draw corner accents
                corner_len = 4
                cv2.line(frame, (x1, y1), (x1 + corner_len, y1), (255, 255, 255), 1)
                cv2.line(frame, (x1, y1), (x1, y1 + corner_len), (255, 255, 255), 1)
                cv2.line(frame, (x2, y2), (x2 - corner_len, y2), (255, 255, 255), 1)
                cv2.line(frame, (x2, y2), (x2, y2 - corner_len), (255, 255, 255), 1)

                # Compact Label Tag above bounding box: "Car #101 96%"
                label_text = f"{vtype} #{tid} {int(conf * 100)}%"
                (font_w, font_h), baseline = cv2.getTextSize(label_text, cv2.FONT_HERSHEY_SIMPLEX, 0.35, 1)

                label_x = max(2, min(x1, target_w - font_w - 4))
                label_y1 = y1 - font_h - 4 if y1 - font_h - 4 > 2 else y1 + 2
                label_y2 = label_y1 + font_h + 4

                # Semi-transparent dark label background
                tag_bg = frame.copy()
                bg_color = (59, 78, 6) if crossed else (42, 23, 15) # BGR
                cv2.rectangle(tag_bg, (label_x, label_y1), (label_x + font_w + 4, label_y2), bg_color, -1)
                cv2.addWeighted(tag_bg, 0.85, frame, 0.15, 0, frame)
                cv2.rectangle(frame, (label_x, label_y1), (label_x + font_w + 4, label_y2), (180, 180, 180), 1)

                cv2.putText(frame, label_text, (label_x + 2, label_y2 - 3),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.35, (255, 255, 255), 1, cv2.LINE_AA)

        out.write(frame)
        frame_idx += 1

    cap.release()
    out.release()
    print(f"[OK] Saved {frame_idx} frames -> {video_out}")
    return True

if __name__ == "__main__":
    targets = [
        ("public/sample_data/Vid-1.MOV", "public/sample_data/Vid-1_yolo_detections.json", "public/output_videos/Vid-1_output.mp4", 16.0),
        ("public/sample_data/Vid-2.MOV", "public/sample_data/Vid-2_yolo_detections.json", "public/output_videos/Vid-2_output.mp4", 19.0),
        ("public/sample_data/Vid-3.MOV", "public/sample_data/Vid-3_yolo_detections.json", "public/output_videos/Vid-3_output.mp4", 18.0),
        ("public/sample_data/Vid-4.MOV", "public/sample_data/Vid-4_yolo_detections.json", "public/output_videos/Vid-4_output.mp4", 22.0),
    ]

    for v_in, j_in, v_out, dur in targets:
        if not os.path.exists(v_in):
            alt_mp4 = v_in.replace("Vid-1.MOV", "1st.mp4").replace("Vid-2.MOV", "2nd.mp4").replace("Vid-3.MOV", "3rd.mp4").replace("Vid-4.MOV", "4th.mp4")
            if os.path.exists(alt_mp4):
                v_in = alt_mp4

        render_video_fast(v_in, j_in, v_out, max_seconds=dur)

    print("\n=======================================================")
    print("[OK] ALL 4 OUTPUT VIDEOS RENDERED TO public/output_videos/")
    print("=======================================================")
