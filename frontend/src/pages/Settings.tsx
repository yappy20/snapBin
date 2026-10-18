import { useEffect, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  KeyRound,
  Camera,
  ExternalLink,
} from "lucide-react";
import { api } from "../api/client";
import type { AppSettings } from "../types";
import Loading from "../components/Loading";

export default function Settings() {
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    api.getSettings().then(setSettings);
  }, []);

  if (!settings) return <Loading />;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-slate-800/70 mt-1 text-sm font-medium">
          SnapBin is configured entirely via environment variables. This page
          shows the current state so you know what's active.
        </p>
      </div>

      <div className="card p-5 space-y-4">
        <h2 className="font-semibold flex items-center gap-2">
          <KeyRound size={16} /> AI recognition provider
        </h2>
        <StatusRow
          ok={settings.ai_configured}
          label={
            settings.ai_configured
              ? `Using ${settings.ai_provider}`
              : "No provider configured"
          }
        />
        {!settings.ai_configured && (
          <p className="text-sm text-slate-500">
            Set <code>AI_PROVIDER</code> and either{" "}
            <code>ANTHROPIC_API_KEY</code> or <code>OPENAI_API_KEY</code> as
            environment variables on your deployment, then redeploy/restart. See
            the README for details.
          </p>
        )}
      </div>

      <div className="card p-5 space-y-4">
        <h2 className="font-semibold flex items-center gap-2">
          <ExternalLink size={16} /> Datasheet / pricing enrichment
        </h2>
        <StatusRow
          ok={settings.mouser_configured}
          label={
            settings.mouser_configured
              ? "Mouser API connected"
              : "Mouser API not configured"
          }
        />
        <p className="text-sm text-slate-500">
          Without a Mouser key, SnapBin still generates one-click search links
          to Mouser, DigiKey, LCSC, and Octopart from any part's detail page.
          Get a free key at{" "}
          <a
            href="https://www.mouser.com/api-hub/"
            target="_blank"
            rel="noreferrer"
            className="text-brand-600 hover:underline"
          >
            mouser.com/api-hub
          </a>{" "}
          and set <code>MOUSER_API_KEY</code>.
        </p>
      </div>

      <div className="card p-5 space-y-4">
        <h2 className="font-semibold flex items-center gap-2">
          <Camera size={16} /> Hardware capture stations
        </h2>
        <StatusRow
          ok={!settings.capture_key_is_default}
          label={
            settings.capture_key_is_default
              ? "Using the default capture key — change this before relying on it"
              : "Capture key is customized"
          }
          warnIfFalse
        />
        <p className="text-sm text-slate-500">
          Any device that can POST a JPEG (Raspberry Pi, ESP32-CAM, phone
          shortcut) can feed photos straight into SnapBin's recognition pipeline
          via <code>POST /api/capture</code> with an <code>X-Capture-Key</code>{" "}
          header matching <code>CAPTURE_API_KEY</code>. See{" "}
          <code>docs/HARDWARE.md</code> for ready-made examples.
        </p>
      </div>
    </div>
  );
}

function StatusRow({
  ok,
  label,
  warnIfFalse,
}: {
  ok: boolean;
  label: string;
  warnIfFalse?: boolean;
}) {
  const Icon = ok ? CheckCircle2 : XCircle;
  const color = ok
    ? "text-emerald-600"
    : warnIfFalse
      ? "text-amber-600"
      : "text-slate-400";
  return (
    <div className={`flex items-center gap-2 text-sm ${color}`}>
      <Icon size={16} /> {label}
    </div>
  );
}
