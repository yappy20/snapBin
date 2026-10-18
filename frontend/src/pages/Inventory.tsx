import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { api } from "../api/client";
import type { Category, Location, Part } from "../types";
import PartCard from "../components/PartCard";
import Loading from "../components/Loading";

export default function Inventory() {
  const [parts, setParts] = useState<Part[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [q, setQ] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);

  useEffect(() => {
    api.listCategories().then(setCategories);
    api.listLocations().then(setLocations);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      api
        .listParts({
          q,
          category_id: categoryId,
          location_id: locationId,
          low_stock_only: lowStockOnly,
        })
        .then(setParts);
    }, 200);
    return () => clearTimeout(t);
  }, [q, categoryId, locationId, lowStockOnly]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
          <p className="text-slate-800/70 mt-1 text-sm font-medium">
            {parts
              ? `${parts.length} part${parts.length === 1 ? "" : "s"}`
              : "Loading..."}
          </p>
        </div>
        <Link to="/scan" className="btn-primary">
          <Plus size={16} /> Add part
        </Link>
      </div>

      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={16}
          />
          <input
            className="input pl-9"
            placeholder="Search by name, MPN, manufacturer, tag..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <select
          className="input w-auto"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          className="input w-auto"
          value={locationId}
          onChange={(e) => setLocationId(e.target.value)}
        >
          <option value="">All locations</option>
          {locations.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
        <button
          className={`btn ${lowStockOnly ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setLowStockOnly((v) => !v)}
        >
          <SlidersHorizontal size={15} /> Low stock only
        </button>
      </div>

      {!parts ? (
        <Loading />
      ) : parts.length === 0 ? (
        <div className="card p-12 text-center text-slate-400">
          No parts match your filters. Try clearing the search or{" "}
          <Link to="/scan" className="text-brand-600 hover:underline">
            scan a new one
          </Link>
          .
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {parts.map((part) => (
            <PartCard key={part.id} part={part} />
          ))}
        </div>
      )}
    </div>
  );
}
