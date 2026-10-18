import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Boxes, TriangleAlert, FolderKanban, ScanLine, ArrowRight } from "lucide-react";
import { api } from "../api/client";
import type { LowStockAlert, Part, Project } from "../types";
import StatTile from "../components/StatTile";
import Loading from "../components/Loading";

export default function Dashboard() {
  const [parts, setParts] = useState<Part[] | null>(null);
  const [lowStock, setLowStock] = useState<LowStockAlert[] | null>(null);
  const [projects, setProjects] = useState<Project[] | null>(null);

  useEffect(() => {
    api.listParts().then(setParts);
    api.lowStock().then(setLowStock);
    api.listProjects().then(setProjects);
  }, []);

  if (!parts || !lowStock || !projects) return <Loading />;

  const totalUnits = parts.reduce((sum, p) => sum + p.quantity, 0);
  const activeProjects = projects.filter((p) => p.status === "active").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Overview of your component inventory.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile label="Distinct parts" value={parts.length} icon={Boxes} tone="brand" />
        <StatTile label="Total units in stock" value={totalUnits.toLocaleString()} icon={Boxes} tone="emerald" />
        <StatTile label="Low stock alerts" value={lowStock.length} icon={TriangleAlert} tone="amber" />
        <StatTile label="Active projects" value={activeProjects} icon={FolderKanban} tone="brand" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Low stock</h2>
            <Link to="/inventory" className="text-sm text-brand-600 hover:underline flex items-center gap-1">
              View inventory <ArrowRight size={14} />
            </Link>
          </div>
          {lowStock.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">Nothing is running low. Nice.</p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {lowStock.slice(0, 8).map((alert) => (
                <li key={alert.part.id} className="py-2.5 flex items-center justify-between">
                  <Link to={`/parts/${alert.part.id}`} className="text-sm font-medium hover:text-brand-600 truncate">
                    {alert.part.name}
                  </Link>
                  <span className="badge bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                    {alert.part.quantity} / {alert.part.quantity_threshold} {alert.part.unit}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-5">
          <h2 className="font-semibold mb-4">Quick actions</h2>
          <div className="space-y-2">
            <Link to="/scan" className="btn-primary w-full justify-center">
              <ScanLine size={16} /> Scan a component
            </Link>
            <Link to="/inventory" className="btn-secondary w-full justify-center">
              <Boxes size={16} /> Browse inventory
            </Link>
            <Link to="/projects" className="btn-secondary w-full justify-center">
              <FolderKanban size={16} /> Manage projects
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
