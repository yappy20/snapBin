import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Minus,
  Plus,
  Save,
  Trash2,
  ImageOff,
  ExternalLink,
  Search,
} from "lucide-react";
import { api } from "../api/client";
import type { Category, Location, Part } from "../types";
import Loading from "../components/Loading";

export default function PartDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [part, setPart] = useState<Part | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [links, setLinks] = useState<Record<string, string> | null>(null);
  const [saving, setSaving] = useState(false);

  function load() {
    api.getPart(Number(id)).then(setPart);
  }

  useEffect(() => {
    load();
    api.listCategories().then(setCategories);
    api.listLocations().then(setLocations);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!part) return <Loading />;

  async function adjust(delta: number) {
    const updated = await api.adjustQuantity(part!.id, delta);
    setPart(updated);
  }

  async function save() {
    setSaving(true);
    try {
      const updated = await api.updatePart(part!.id, {
        name: part!.name,
        manufacturer: part!.manufacturer,
        mpn: part!.mpn,
        description: part!.description,
        value: part!.value,
        package: part!.package,
        unit: part!.unit,
        quantity_threshold: part!.quantity_threshold,
        datasheet_url: part!.datasheet_url,
        tags: part!.tags,
        category_id: part!.category_id,
        location_id: part!.location_id,
      });
      setPart(updated);
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm(`Delete "${part!.name}"? This cannot be undone.`)) return;
    await api.deletePart(part!.id);
    navigate("/inventory");
  }

  async function findLinks() {
    const q = part!.mpn || part!.name;
    const res = await api.enrich(q);
    setLinks(res.supplier_links);
    if (res.mouser_result?.datasheet_url && !part!.datasheet_url) {
      setPart({ ...part!, datasheet_url: res.mouser_result.datasheet_url });
    }
  }

  const low = part.quantity <= part.quantity_threshold;

  return (
    <div className="max-w-4xl space-y-6">
      <button className="btn-ghost -ml-3" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card overflow-hidden">
          <div className="aspect-square bg-slate-100 flex items-center justify-center">
            {part.image_url ? (
              <img
                src={part.image_url}
                alt={part.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageOff className="text-slate-300" size={40} />
            )}
          </div>
          <div className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Quantity</span>
              {low && (
                <span className="badge bg-amber-100 text-amber-700">
                  Low stock
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                className="btn-secondary px-2.5"
                onClick={() => adjust(-1)}
                disabled={part.quantity <= 0}
              >
                <Minus size={16} />
              </button>
              <span className="flex-1 text-center text-2xl font-bold tabular-nums">
                {part.quantity}
              </span>
              <button
                className="btn-secondary px-2.5"
                onClick={() => adjust(1)}
              >
                <Plus size={16} />
              </button>
            </div>
            <p className="text-xs text-slate-400 text-center">{part.unit}</p>
          </div>
        </div>

        <div className="md:col-span-2 card p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Name" full>
              <input
                className="input"
                value={part.name}
                onChange={(e) => setPart({ ...part, name: e.target.value })}
              />
            </Field>
            <Field label="Manufacturer">
              <input
                className="input"
                value={part.manufacturer || ""}
                onChange={(e) =>
                  setPart({ ...part, manufacturer: e.target.value })
                }
              />
            </Field>
            <Field label="MPN">
              <input
                className="input"
                value={part.mpn || ""}
                onChange={(e) => setPart({ ...part, mpn: e.target.value })}
              />
            </Field>
            <Field label="Value">
              <input
                className="input"
                value={part.value || ""}
                onChange={(e) => setPart({ ...part, value: e.target.value })}
              />
            </Field>
            <Field label="Package">
              <input
                className="input"
                value={part.package || ""}
                onChange={(e) => setPart({ ...part, package: e.target.value })}
              />
            </Field>
            <Field label="Category">
              <select
                className="input"
                value={part.category_id ?? ""}
                onChange={(e) =>
                  setPart({
                    ...part,
                    category_id: e.target.value ? Number(e.target.value) : null,
                  })
                }
              >
                <option value="">None</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Location">
              <select
                className="input"
                value={part.location_id ?? ""}
                onChange={(e) =>
                  setPart({
                    ...part,
                    location_id: e.target.value ? Number(e.target.value) : null,
                  })
                }
              >
                <option value="">None</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Low stock threshold">
              <input
                type="number"
                className="input"
                value={part.quantity_threshold}
                onChange={(e) =>
                  setPart({
                    ...part,
                    quantity_threshold: Number(e.target.value),
                  })
                }
              />
            </Field>
            <Field label="Description" full>
              <textarea
                className="input"
                rows={2}
                value={part.description || ""}
                onChange={(e) =>
                  setPart({ ...part, description: e.target.value })
                }
              />
            </Field>
            <Field label="Tags (comma-separated)" full>
              <input
                className="input"
                value={part.tags || ""}
                onChange={(e) => setPart({ ...part, tags: e.target.value })}
              />
            </Field>
            <Field label="Datasheet URL" full>
              <div className="flex gap-2">
                <input
                  className="input"
                  value={part.datasheet_url || ""}
                  onChange={(e) =>
                    setPart({ ...part, datasheet_url: e.target.value })
                  }
                />
                {part.datasheet_url && (
                  <a
                    href={part.datasheet_url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary shrink-0"
                  >
                    <ExternalLink size={15} />
                  </a>
                )}
              </div>
            </Field>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <button className="btn-primary" onClick={save} disabled={saving}>
              <Save size={16} /> Save changes
            </button>
            <button className="btn-secondary" onClick={findLinks}>
              <Search size={16} /> Find datasheet &amp; reorder links
            </button>
            <button className="btn-danger ml-auto" onClick={remove}>
              <Trash2 size={16} /> Delete
            </button>
          </div>

          {links && (
            <div className="pt-3 border-t border-slate-100">
              <p className="label mb-2">Reorder / spec lookup</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(links).map(([name, url]) => (
                  <a
                    key={name}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary"
                  >
                    {name} <ExternalLink size={14} />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}
