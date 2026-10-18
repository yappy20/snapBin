import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Upload, RefreshCw, CheckCircle2, PlusCircle, AlertTriangle } from "lucide-react";
import { api } from "../api/client";
import type { Category, Location, ScanCandidate, ScanResult } from "../types";

export default function Scan() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const navigate = useNavigate();

  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    api.listCategories().then(setCategories);
    api.listLocations().then(setLocations);
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraOn(true);
    } catch (e: any) {
      setCameraError("Couldn't access a camera. You can still upload a photo below.");
    }
  }, []);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOn(false);
  }

  async function submitBlob(blob: Blob) {
    setScanning(true);
    setError(null);
    setResult(null);
    setSavedIds(new Set());
    try {
      const res = await api.scanImage(blob);
      setResult(res);
    } catch (e: any) {
      setError(e.message || "Scan failed.");
    } finally {
      setScanning(false);
    }
  }

  function capturePhoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(video, 0, 0);
    canvas.toBlob((blob) => blob && submitBlob(blob), "image/jpeg", 0.92);
  }

  function onFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) submitBlob(file);
    e.target.value = "";
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Scan a component</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
          Use your webcam or upload a photo. SnapBin's AI will identify what it sees and suggest inventory entries.
        </p>
      </div>

      <div className="card p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center relative">
              {cameraOn ? (
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              ) : (
                <div className="text-slate-500 text-sm flex flex-col items-center gap-2">
                  <Camera size={28} />
                  Camera is off
                </div>
              )}
            </div>
            <canvas ref={canvasRef} className="hidden" />
            {cameraError && (
              <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                <AlertTriangle size={13} /> {cameraError}
              </p>
            )}
            <div className="flex gap-2 mt-3">
              {!cameraOn ? (
                <button className="btn-secondary" onClick={startCamera}>
                  <Camera size={16} /> Start camera
                </button>
              ) : (
                <>
                  <button className="btn-primary" onClick={capturePhoto} disabled={scanning}>
                    <Camera size={16} /> Capture &amp; identify
                  </button>
                  <button className="btn-ghost" onClick={stopCamera}>
                    Stop
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col justify-center items-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg p-6 text-center">
            <Upload className="text-slate-400 mb-2" size={26} />
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
              Or upload a photo from your device — this also works for images pulled from a Raspberry Pi or ESP32-CAM
              capture station.
            </p>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChosen} />
            <button className="btn-secondary" onClick={() => fileInputRef.current?.click()} disabled={scanning}>
              <Upload size={16} /> Choose file
            </button>
          </div>
        </div>
      </div>

      {scanning && (
        <div className="card p-8 flex items-center justify-center gap-2 text-slate-500">
          <RefreshCw className="animate-spin" size={18} /> Identifying component...
        </div>
      )}

      {error && (
        <div className="card p-5 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="card p-5">
          <div className="flex gap-4 mb-4">
            <img src={result.image_url} alt="captured" className="w-28 h-28 object-cover rounded-lg border border-slate-200 dark:border-slate-800" />
            <div>
              <h2 className="font-semibold">
                {result.candidates.length} candidate{result.candidates.length === 1 ? "" : "s"} found
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Provider: {result.provider === "none" ? "not configured" : result.provider}</p>
              {result.provider === "none" && (
                <p className="text-sm text-amber-600 mt-2">
                  No AI provider is configured yet — add an API key in Settings to enable automatic recognition.
                  You can still add this photo as a part manually below.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {result.candidates.map((c, i) => (
              <CandidateRow
                key={i}
                candidate={c}
                imageUrl={result.image_url}
                categories={categories}
                locations={locations}
                saved={savedIds.has(i)}
                onSaved={() => setSavedIds((s) => new Set(s).add(i))}
              />
            ))}
            {result.candidates.length === 0 && result.provider !== "none" && (
              <p className="text-sm text-slate-400 py-4 text-center">
                No components recognized in that photo. Try a closer, well-lit shot.
              </p>
            )}
            {result.candidates.length === 0 && (
              <ManualAddRow imageUrl={result.image_url} categories={categories} locations={locations} onSaved={() => navigate("/inventory")} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CandidateRow({
  candidate,
  imageUrl,
  categories,
  locations,
  saved,
  onSaved,
}: {
  candidate: ScanCandidate;
  imageUrl: string;
  categories: Category[];
  locations: Location[];
  saved: boolean;
  onSaved: () => void;
}) {
  const [name, setName] = useState(candidate.name);
  const [quantity, setQuantity] = useState(1);
  const [categoryId, setCategoryId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSaveNew() {
    setSaving(true);
    try {
      await api.createPart({
        name,
        manufacturer: candidate.manufacturer || undefined,
        mpn: candidate.mpn || undefined,
        description: candidate.description || undefined,
        value: candidate.value || undefined,
        package: candidate.package || undefined,
        quantity,
        image_url: imageUrl,
        ai_confidence: candidate.confidence,
        ai_identified: true,
        category_id: categoryId ? Number(categoryId) : undefined,
        location_id: locationId ? Number(locationId) : undefined,
      } as any);
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  async function handleIncrementExisting() {
    if (!candidate.matched_part_id) return;
    setSaving(true);
    try {
      await api.adjustQuantity(candidate.matched_part_id, quantity);
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  if (saved) {
    return (
      <div className="flex items-center gap-2 text-emerald-600 text-sm py-2">
        <CheckCircle2 size={16} /> Saved "{name}" to inventory.
      </div>
    );
  }

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex-1 min-w-[220px] space-y-2">
          <input className="input font-medium" value={name} onChange={(e) => setName(e.target.value)} />
          <p className="text-xs text-slate-500 dark:text-slate-400">{candidate.description}</p>
          <div className="flex flex-wrap gap-2 text-xs text-slate-500">
            {candidate.manufacturer && <span className="badge bg-slate-100 dark:bg-slate-800">{candidate.manufacturer}</span>}
            {candidate.mpn && <span className="badge bg-slate-100 dark:bg-slate-800">{candidate.mpn}</span>}
            {candidate.value && <span className="badge bg-slate-100 dark:bg-slate-800">{candidate.value}</span>}
            {candidate.package && <span className="badge bg-slate-100 dark:bg-slate-800">{candidate.package}</span>}
            <span className="badge bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
              {Math.round(candidate.confidence * 100)}% confidence
            </span>
          </div>
        </div>
        <div className="flex items-end gap-2">
          <div>
            <label className="label">Qty</label>
            <input
              type="number"
              className="input w-20"
              value={quantity}
              min={0}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </div>
          {!candidate.matched_part_id && (
            <div>
              <label className="label">Category</label>
              <select className="input w-40" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">None</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}
          {!candidate.matched_part_id && (
            <div>
              <label className="label">Location</label>
              <select className="input w-40" value={locationId} onChange={(e) => setLocationId(e.target.value)}>
                <option value="">None</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        {candidate.matched_part_id ? (
          <button className="btn-primary" onClick={handleIncrementExisting} disabled={saving}>
            <PlusCircle size={16} /> Looks like existing stock — add {quantity} to it
          </button>
        ) : (
          <button className="btn-primary" onClick={handleSaveNew} disabled={saving}>
            <PlusCircle size={16} /> Add as new part
          </button>
        )}
      </div>
    </div>
  );
}

function ManualAddRow({
  imageUrl,
  categories,
  locations,
  onSaved,
}: {
  imageUrl: string;
  categories: Category[];
  locations: Location[];
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [categoryId, setCategoryId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await api.createPart({
        name,
        quantity,
        image_url: imageUrl,
        category_id: categoryId ? Number(categoryId) : undefined,
        location_id: locationId ? Number(locationId) : undefined,
      } as any);
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-4 space-y-2">
      <label className="label">Add manually</label>
      <input className="input" placeholder="Part name" value={name} onChange={(e) => setName(e.target.value)} />
      <div className="flex gap-2">
        <input type="number" className="input w-24" value={quantity} min={0} onChange={(e) => setQuantity(Number(e.target.value))} />
        <select className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">Category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select className="input" value={locationId} onChange={(e) => setLocationId(e.target.value)}>
          <option value="">Location</option>
          {locations.map((l) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
      </div>
      <button className="btn-primary" onClick={handleSave} disabled={saving || !name.trim()}>
        <PlusCircle size={16} /> Add to inventory
      </button>
    </div>
  );
}
