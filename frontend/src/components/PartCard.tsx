import { Link } from "react-router-dom";
import { ImageOff } from "lucide-react";
import type { Part } from "../types";

export default function PartCard({ part }: { part: Part }) {
  const low = part.quantity <= part.quantity_threshold;
  return (
    <Link
      to={`/parts/${part.id}`}
      className="card overflow-hidden hover:shadow-md hover:border-brand-300 transition-all group"
    >
      <div className="aspect-square bg-slate-100 flex items-center justify-center overflow-hidden">
        {part.image_url ? (
          <img
            src={part.image_url}
            alt={part.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <ImageOff className="text-slate-300" size={32} />
        )}
      </div>
      <div className="p-3.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm leading-snug line-clamp-2">
            {part.name}
          </h3>
        </div>
        {part.value && (
          <p className="text-xs text-slate-500 mt-0.5">
            {part.value}
            {part.package ? ` · ${part.package}` : ""}
          </p>
        )}
        <div className="flex items-center justify-between mt-2.5">
          <span
            className={`badge ${low ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}
          >
            {part.quantity} {part.unit}
          </span>
          {part.category && (
            <span className="text-[11px] text-slate-400 truncate max-w-[7rem]">
              {part.category.name}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
