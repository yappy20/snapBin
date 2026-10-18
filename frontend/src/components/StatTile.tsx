import type { LucideIcon } from "lucide-react";

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
    brand: "bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300",
    red: "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300",
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300",
  };
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${toneClasses[tone]}`}>
        <Icon size={22} />
      </div>
      <div>
        <div className="text-2xl font-bold tabular-nums leading-tight">{value}</div>
        <div className="text-sm text-slate-500 dark:text-slate-400">{label}</div>
      </div>
    </div>
  );
}
