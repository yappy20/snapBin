#!/usr/bin/env python3
"""SnapBin capture-station client for a Raspberry Pi with a Camera Module.

Wire up a push-button (or run this on a timer / motion-triggered) to snap a
photo and send it straight to your SnapBin server for AI identification.

Requirements on the Pi:
    sudo apt install -y python3-picamera2   # camera library
    pip3 install requests

Usage:
    python3 capture.py --server https://your-snapbin-url --key YOUR_CAPTURE_API_KEY

If you're using a plain USB webcam instead of the Pi Camera Module, see
usb_webcam_capture.py in this same folder for an OpenCV-based version.
"""
import argparse
import io
import sys
import time

import requests

try:
    from picamera2 import Picamera2
except ImportError:
    Picamera2 = None


def capture_jpeg_bytes() -> bytes:
    if Picamera2 is None:
        print("picamera2 is not installed. Run: sudo apt install -y python3-picamera2", file=sys.stderr)
        sys.exit(1)
    picam2 = Picamera2()
    config = picam2.create_still_configuration()
    picam2.configure(config)
    picam2.start()
    time.sleep(1.5)  # let auto-exposure settle
    stream = io.BytesIO()
    picam2.capture_file(stream, format="jpeg")
    picam2.stop()
    stream.seek(0)
    return stream.read()


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
    parser = argparse.ArgumentParser(description="Capture a photo and send it to SnapBin for identification.")
    parser.add_argument("--server", required=True, help="Base URL of your SnapBin deployment, e.g. https://snapbin.up.railway.app")
    parser.add_argument("--key", required=True, help="Value of CAPTURE_API_KEY from your SnapBin environment variables")
    parser.add_argument("--loop", action="store_true", help="Keep capturing every --interval seconds instead of once")
    parser.add_argument("--interval", type=float, default=10.0)
    args = parser.parse_args()

    while True:
        print("Capturing photo...")
        image_bytes = capture_jpeg_bytes()
        print(f"Captured {len(image_bytes)} bytes, uploading...")
        result = send_to_snapbin(args.server, args.key, image_bytes)
        candidates = result.get("candidates", [])
        if candidates:
            print(f"Identified {len(candidates)} candidate(s):")
            for c in candidates:
                print(f"  - {c['name']} ({round(c['confidence'] * 100)}% confidence)")
        else:
            print("No candidates identified (or no AI provider configured on the server).")

        if not args.loop:
            break
        time.sleep(args.interval)


if __name__ == "__main__":
    main()
