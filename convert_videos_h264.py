"""
Convert annotated FMP4 videos to browser-compatible H.264 MP4
"""
import subprocess
import os
import sys

try:
    import imageio_ffmpeg
    ffmpeg_path = imageio_ffmpeg.get_ffmpeg_exe()
except ImportError:
    print("imageio_ffmpeg not found, trying system ffmpeg")
    ffmpeg_path = "ffmpeg"

videos = [
    ("public/sample_data/annotated_IMG_4522.mp4",   "public/sample_data/cam01_h264.mp4"),
    ("public/sample_data/annotated_IMG_4524.mp4",   "public/sample_data/cam02_h264.mp4"),
    ("public/sample_data/annotated_IMG_4526 (1).mp4", "public/sample_data/cam03_h264.mp4"),
    ("public/sample_data/annotated_IMG_4526.mp4",   "public/sample_data/cam04_h264.mp4"),
]

for inp, out in videos:
    if not os.path.exists(inp):
        print(f"SKIP (not found): {inp}")
        continue
    print(f"\nConverting: {os.path.basename(inp)} -> {os.path.basename(out)}")
    cmd = [
        ffmpeg_path,
        "-y",
        "-i", inp,
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "28",
        "-vf", "scale=1280:720",
        "-movflags", "+faststart",
        "-an",
        out
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode == 0:
        size_mb = os.path.getsize(out) / 1024 / 1024
        print(f"  OK -> {size_mb:.1f} MB")
    else:
        print(f"  FAILED: {result.stderr[-500:]}")

print("\nDone!")
