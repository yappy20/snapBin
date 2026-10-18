# Hardware guide

SnapBin's "camera" is anything that can send it a JPEG over HTTP, so you can
start with zero extra hardware and add a dedicated capture station later
without changing any software on the server.

## Option 1 — Just use a webcam (recommended to start)

The **Scan** page in the web app uses your browser's camera (via
`getUserMedia`) directly — any laptop or desktop webcam works, no extra
hardware or setup required, from any device that can open your SnapBin URL.

## Option 2 — Raspberry Pi capture station

Good if you want a permanently-mounted camera pointed at your workbench or a
parts-sorting tray, separate from whatever device you normally browse
SnapBin from.

1. Raspberry Pi (any model with a camera connector, or use a USB webcam).
2. Either the official Camera Module (`hardware/raspberrypi/capture.py`,
   uses `picamera2`) or any USB webcam (`hardware/raspberrypi/usb_webcam_capture.py`,
   uses OpenCV).
3. Install deps and run:
   ```bash
   pip3 install requests opencv-python   # or python3-picamera2 for the CSI camera
   python3 usb_webcam_capture.py --server https://your-snapbin-url --key YOUR_CAPTURE_API_KEY
   ```
4. Optional: wire a push-button to a GPIO pin and call `capture_jpeg_bytes()`
   on a button-press interrupt instead of on a timer, or trigger it from a
   cron job / systemd timer for a fixed cadence.

## Option 3 — ESP32-CAM (cheapest, ~$8)

A tiny Wi-Fi camera board — good for a dedicated "scan station" mounted over
a bin or sorting tray. Firmware is in `hardware/esp32cam/snapbin_capture.ino`:

1. Flash it via the Arduino IDE (instructions are in the file's header
   comment) with your Wi-Fi credentials and SnapBin deployment URL filled in.
2. Wire a push-button between GPIO 13 and GND.
3. Press the button — it captures a photo and POSTs it to
   `/api/capture`, and the result shows up in SnapBin immediately.

## The capture API contract

Every capture path — browser, Pi, ESP32-CAM, or anything else — talks to the
same endpoint on your deployed SnapBin:

```
POST https://your-snapbin-url/api/capture
Header: X-Capture-Key: <CAPTURE_API_KEY from your deployment's env vars>
Body:   multipart/form-data, field name "image", a JPEG/PNG/WebP file
```

It returns the same `ScanResult` JSON the web UI's Scan page uses
(candidate identifications, confidence, and whether any candidate looks like
an existing inventory item). **Set `CAPTURE_API_KEY` to a real secret** —
the Settings page will warn you if you're still on the default.

Because this is a plain HTTPS endpoint, you can also wire up: a phone
Shortcuts/Tasker automation, a flatbed scanner with a "scan to folder + curl"
script, or any other camera you already own.
