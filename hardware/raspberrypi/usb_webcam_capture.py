#!/usr/bin/env python3
"""SnapBin capture-station client for any USB webcam (works on a Raspberry Pi,
an old laptop, a mini PC, etc.) using OpenCV instead of the Pi Camera Module.

Requirements:
    pip3 install opencv-python requests

Usage:
    python3 usb_webcam_capture.py --server https://your-snapbin-url --key YOUR_CAPTURE_API_KEY
"""
import argparse
import time

import cv2
import requests


def capture_jpeg_bytes(camera_index: int = 0) -> bytes:
    cap = cv2.VideoCapture(camera_index)
    if not cap.isOpened():
        raise RuntimeError(f"Could not open camera index {camera_index}")
    # Warm up the sensor / auto-exposure.
    for _ in range(5):
        cap.read()
        time.sleep(0.1)
    ok, frame = cap.read()
    cap.release()
    if not ok:
        raise RuntimeError("Failed to capture a frame")
    ok, buf = cv2.imencode(".jpg", frame)
    if not ok:
        raise RuntimeError("Failed to encode frame as JPEG")
    return buf.tobytes()


def send_to_snapbin(server: str, api_key: str, image_bytes: bytes) -> dict:
    resp = requests.post(
        f"{server.rstrip('/')}/api/capture",
        headers={"X-Capture-Key": api_key},
        files={"image": ("capture.jpg", image_bytes, "image/jpeg")},
        timeout=30,
    )
    resp.raise_for_status()
    return resp.json()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--server", required=True)
    parser.add_argument("--key", required=True)
    parser.add_argument("--camera-index", type=int, default=0)
    args = parser.parse_args()

    image_bytes = capture_jpeg_bytes(args.camera_index)
    result = send_to_snapbin(args.server, args.key, image_bytes)
    print(result)


if __name__ == "__main__":
    main()
