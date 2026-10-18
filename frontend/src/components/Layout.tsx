import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Boxes,
  ScanLine,
  MapPin,
  FolderKanban,
  Settings as SettingsIcon,
  Zap,
} from "lucide-react";
import type { ReactNode } from "react";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/inventory", label: "Inventory", icon: Boxes },
  { to: "/scan", label: "Scan", icon: ScanLine },
  { to: "/locations", label: "Locations", icon: MapPin },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell flex">
      <aside className="w-60 shrink-0 border-r-[3px] border-black bg-black flex flex-col">
        <div className="h-16 flex items-center gap-2 px-5 border-b border-white/10">
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: "var(--neon-yellow)" }}
          >
            <Zap className="h-5 w-5 text-black" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-lg tracking-tight text-white">
            SnapBin
          </span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "text-black"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`
              }
              style={({ isActive }) =>
                isActive ? { backgroundColor: "var(--neon-yellow)" } : undefined
              }
            >
              <Icon className="h-4.5 w-4.5" size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 text-xs text-slate-500 border-t border-white/10">
          SnapBin is open source — MIT licensed.
        </div>
      </aside>
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-6 lg:px-8 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
