import { Loader2 } from "lucide-react";

export default function Loading({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 text-slate-400 py-16 text-sm">
      <Loader2 className="animate-spin" size={18} />
      {label}
    </div>
  );
}
