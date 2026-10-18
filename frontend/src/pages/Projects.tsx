import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FolderKanban, Plus } from "lucide-react";
import { api } from "../api/client";
import type { Project } from "../types";
import Loading from "../components/Loading";

const statusTone: Record<string, string> = {
  planning: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  active: "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300",
  complete: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  archived: "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500",
};

export default function Projects() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  function load() {
    api.listProjects().then(setProjects);
  }

  useEffect(load, []);

  async function create() {
    if (!name.trim()) return;
    await api.createProject({ name });
    setName("");
    setCreating(false);
    load();
  }

  if (!projects) return <Loading />;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Link parts to builds via a bill of materials.</p>
        </div>
        <button className="btn-primary" onClick={() => setCreating((v) => !v)}>
          <Plus size={16} /> New project
        </button>
      </div>

      {creating && (
        <div className="card p-4 flex gap-2">
          <input className="input" placeholder="Project name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          <button className="btn-primary" onClick={create} disabled={!name.trim()}>
            Create
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {projects.length === 0 && (
          <div className="card p-10 text-center text-slate-400 sm:col-span-2">No projects yet. Create one to start tracking a BOM.</div>
        )}
        {projects.map((p) => (
          <Link key={p.id} to={`/projects/${p.id}`} className="card p-4 hover:shadow-md hover:border-brand-300 dark:hover:border-brand-700 transition-all">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-300">
                  <FolderKanban size={15} />
                </div>
                <span className="font-semibold text-sm">{p.name}</span>
              </div>
              <span className={`badge ${statusTone[p.status] || statusTone.planning}`}>{p.status}</span>
            </div>
            {p.description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">{p.description}</p>}
            <p className="text-xs text-slate-400 mt-2">{p.bom_items.length} BOM line{p.bom_items.length === 1 ? "" : "s"}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
