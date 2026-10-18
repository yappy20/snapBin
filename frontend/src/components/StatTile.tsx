import type { LucideIcon } from "lucide-react";
import type { CSSProperties } from "react";

export default function StatTile({
  label,
  value,
  icon: Icon,
  tone = "brand",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: "brand" | "amber" | "red" | "emerald";
}) {
  const toneClasses: Record<string, string> = {
    brand: "bg-black",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };
  const toneStyle: Record<string, CSSProperties> = {
    brand: { color: "var(--neon-yellow)" },
  };
  return (
    <div className="card p-5 flex items-center gap-4">
      <div
        className={`h-11 w-11 rounded-xl flex items-center justify-center ${toneClasses[tone]}`}
        style={toneStyle[tone]}
      >
        <Icon size={22} />
      </div>
      <div>
        <div className="text-2xl font-bold tabular-nums leading-tight">
          {value}
        </div>
        <div className="text-sm text-slate-500">{label}</div>
      </div>
    </div>
  );
}
