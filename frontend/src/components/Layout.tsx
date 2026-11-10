import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";

export default function Layout({ children }: { children: ReactNode }) {
  const fullPage = useLocation().pathname === "/";

  return (
    <div className="app-shell flex flex-col">
      <main className="flex min-h-screen flex-1 flex-col">
        <div
          className={
            fullPage
              ? "flex min-h-screen flex-1 flex-col p-4 sm:p-6"
              : "max-w-7xl mx-auto w-full px-6 py-6 lg:px-8 lg:py-8"
          }
        >
          {children}
        </div>
      </main>
    </div>
  );
}
