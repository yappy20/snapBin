import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Zap, AlertTriangle, Trash } from "lucide-react";
import { api } from "../api/client";
import type { Part, Project } from "../types";
import Loading from "../components/Loading";

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [parts, setParts] = useState<Part[]>([]);
  const [partId, setPartId] = useState("");
  const [qty, setQty] = useState(1);
  const [error, setError] = useState<string | null>(null);

  function load() {
    api.getProject(Number(id)).then(setProject);
  }

  useEffect(() => {
    load();
    api.listParts().then(setParts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!project) return <Loading />;

  async function addItem() {
    if (!partId) return;
    await api.addBomItem(project!.id, Number(partId), qty);
    setPartId("");
    setQty(1);
    load();
  }

  async function removeItem(itemId: number) {
    await api.removeBomItem(project!.id, itemId);
    load();
  }

  async function consume() {
    setError(null);
    try {
      await api.consumeBom(project!.id);
      load();
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function remove() {
    if (!confirm(`Delete project "${project!.name}"?`)) return;
    await api.deleteProject(project!.id);
    navigate("/projects");
  }

  return (
    <div className="max-w-3xl space-y-6">
      <button className="btn-ghost -ml-3" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> Back
      </button>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
          {project.description && <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">{project.description}</p>}
        </div>
        <button className="btn-danger" onClick={remove}>
          <Trash2 size={15} /> Delete project
        </button>
      </div>

      <div className="card p-5">
        <h2 className="font-semibold mb-3">Bill of materials</h2>

        {project.bom_items.length === 0 ? (
          <p className="text-sm text-slate-400 py-4">No parts added yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-400 border-b border-slate-100 dark:border-slate-800">
                <th className="py-2 font-medium">Part</th>
                <th className="py-2 font-medium">Required</th>
                <th className="py-2 font-medium">In stock</th>
                <th className="py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {project.bom_items.map((item) => {
                const short = item.part.quantity < item.quantity_required;
                return (
                  <tr key={item.id} className="border-b border-slate-50 dark:border-slate-900 last:border-0">
                    <td className="py-2.5">{item.part.name}</td>
                    <td className="py-2.5">{item.quantity_required}</td>
                    <td className="py-2.5">
                      <span className={short ? "text-amber-600 font-medium flex items-center gap-1" : ""}>
                        {short && <AlertTriangle size={13} />}
                        {item.part.quantity}
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      <button className="btn-ghost px-2" onClick={() => removeItem(item.id)}>
                        <Trash size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <select className="input" value={partId} onChange={(e) => setPartId(e.target.value)}>
            <option value="">Select a part...</option>
            {parts.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <input type="number" min={1} className="input w-24" value={qty} onChange={(e) => setQty(Number(e.target.value))} />
          <button className="btn-secondary shrink-0" onClick={addItem} disabled={!partId}>
            <Plus size={16} /> Add
          </button>
        </div>

        {project.bom_items.length > 0 && (
          <div className="mt-4">
            <button className="btn-primary" onClick={consume}>
              <Zap size={16} /> Consume stock for this build
            </button>
            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
