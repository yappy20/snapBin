/*
  SnapBin capture-station firmware for the AI-Thinker ESP32-CAM module.

  Wire a momentary push-button between GPIO 13 and GND (uses the internal
  pull-up). Pressing it takes a photo and POSTs it straight to your SnapBin
  deployment's /api/capture endpoint over Wi-Fi, exactly like the webcam/RPi
  capture scripts in the sibling folders.

  Board setup (Arduino IDE):
    1. Install the "esp32" board package (Espressif Systems) via Boards Manager.
    2. Select board: "AI Thinker ESP32-CAM".
    3. Set Partition Scheme to "Huge APP (3MB No OTA/1MB SPIFFS)".
    4. Fill in WIFI_SSID / WIFI_PASSWORD / SNAPBIN_SERVER / CAPTURE_API_KEY below.
    5. Flash with GPIO0 tied to GND, then remove the jumper and reset to run.

  This is deliberately minimal (no deep sleep / battery optimization) so it's
  easy to adapt. It's the cheapest capture-station option (~$8 boards).
*/

#include <WiFi.h>
#include <HTTPClient.h>
#include "esp_camera.h"

// ---- Configure these ----
const char *WIFI_SSID = "YOUR_WIFI_SSID";
const char *WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char *SNAPBIN_SERVER = "https://your-snapbin-url"; // no trailing slash
const char *CAPTURE_API_KEY = "YOUR_CAPTURE_API_KEY";
// --------------------------

#define BUTTON_PIN 13

// AI-Thinker ESP32-CAM pin map
#define PWDN_GPIO_NUM 32
#define RESET_GPIO_NUM -1
#define XCLK_GPIO_NUM 0
#define SIOD_GPIO_NUM 26
#define SIOC_GPIO_NUM 27
#define Y9_GPIO_NUM 35
#define Y8_GPIO_NUM 34
#define Y7_GPIO_NUM 39
#define Y6_GPIO_NUM 36
#define Y5_GPIO_NUM 21
#define Y4_GPIO_NUM 19
#define Y3_GPIO_NUM 18
#define Y2_GPIO_NUM 5
#define VSYNC_GPIO_NUM 25
#define HREF_GPIO_NUM 23
#define PCLK_GPIO_NUM 22

void setupCamera() {
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sscb_sda = SIOD_GPIO_NUM;
  config.pin_sscb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;
  config.frame_size = FRAMESIZE_SVGA; // 800x600, good balance for close-up parts
  config.jpeg_quality = 10;           // lower number = higher quality
  config.fb_count = 1;

  if (esp_camera_init(&config) != ESP_OK) {
    Serial.println("Camera init failed");
  }
}

void connectWiFi() {
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(300);
    Serial.print(".");
  }
  Serial.println(" connected: " + WiFi.localIP().toString());
}

void captureAndUpload() {
  camera_fb_t *fb = esp_camera_fb_get();
  if (!fb) {
    Serial.println("Capture failed");
    return;
  }

  HTTPClient http;
  http.begin(String(SNAPBIN_SERVER) + "/api/capture");
  http.addHeader("X-Capture-Key", CAPTURE_API_KEY);

  String boundary = "SnapBinBoundary";
  String head = "--" + boundary + "\r\nContent-Disposition: form-data; name=\"image\"; filename=\"capture.jpg\"\r\nContent-Type: image/jpeg\r\n\r\n";
  String tail = "\r\n--" + boundary + "--\r\n";

  http.addHeader("Content-Type", "multipart/form-data; boundary=" + boundary);

  uint32_t totalLen = head.length() + fb->len + tail.length();
  uint8_t *body = (uint8_t *)malloc(totalLen);
  memcpy(body, head.c_str(), head.length());
  memcpy(body + head.length(), fb->buf, fb->len);
  memcpy(body + head.length() + fb->len, tail.c_str(), tail.length());

  int code = http.POST(body, totalLen);
  Serial.printf("Upload response: %d\n", code);
  if (code == 200) {
    Serial.println(http.getString());
  }

  free(body);
  http.end();
  esp_camera_fb_return(fb);
}

void setup() {
  Serial.begin(115200);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  setupCamera();
  connectWiFi();
  Serial.println("Ready. Press the button to capture and identify a part.");
}

void loop() {
  static bool lastState = HIGH;
  bool state = digitalRead(BUTTON_PIN);
  if (lastState == HIGH && state == LOW) {
    Serial.println("Button pressed, capturing...");
    captureAndUpload();
    delay(500); // debounce
  }
  lastState = state;
}
