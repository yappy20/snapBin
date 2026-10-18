import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Plus, Trash2 } from "lucide-react";
import { api } from "../api/client";
import type { Location } from "../types";
import Loading from "../components/Loading";

export default function Locations() {
  const [locations, setLocations] = useState<Location[] | null>(null);
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");

  function load() {
    api.listLocations().then(setLocations);
  }

  useEffect(load, []);

  async function create() {
    if (!name.trim()) return;
    await api.createLocation({
      name,
      parent_id: parentId ? Number(parentId) : null,
    });
    setName("");
    setParentId("");
    load();
  }

  async function remove(id: number) {
    if (
      !confirm(
        "Delete this location? Parts stored there will become unassigned.",
      )
    )
      return;
    await api.deleteLocation(id);
    load();
  }

  if (!locations) return <Loading />;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Locations</h1>
        <p className="text-slate-800/70 mt-1 text-sm font-medium">
          Model your cabinets, drawers, and bins so every part has a physical
          home.
        </p>
      </div>

      <div className="card p-4 flex gap-2 flex-wrap">
        <input
          className="input flex-1 min-w-[180px]"
          placeholder="New location name (e.g. Drawer 4 - LEDs)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <select
          className="input w-auto"
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
        >
          <option value="">No parent (top-level)</option>
          {locations.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
        <button
          className="btn-primary"
          onClick={create}
          disabled={!name.trim()}
        >
          <Plus size={16} /> Add
        </button>
      </div>

      <div className="card divide-y divide-slate-100">
        {locations.length === 0 && (
          <p className="p-6 text-center text-slate-400 text-sm">
            No locations yet — add your first one above.
          </p>
        )}
        {locations.map((loc) => (
          <div key={loc.id} className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600">
                <MapPin size={16} />
              </div>
              <div>
                <p className="font-medium text-sm">{loc.name}</p>
                {loc.parent_id && (
                  <p className="text-xs text-slate-400">
                    in{" "}
                    {locations.find((l) => l.id === loc.parent_id)?.name ?? "…"}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to={`/inventory?location_id=${loc.id}`}
                className="text-xs text-brand-600 hover:underline"
              >
                {loc.part_count} part{loc.part_count === 1 ? "" : "s"}
              </Link>
              <button className="btn-ghost px-2" onClick={() => remove(loc.id)}>
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
