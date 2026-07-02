"use client";

import { useState } from "react";
import { useMaintenanceContext } from "@/lib/MaintenanceContext";
import { CalendarTab } from "./tabs/CalendarTab";
import { PlanningTab } from "./tabs/PlanningTab";
import { GanttTab } from "./tabs/GanttTab";
import { CostsTab } from "./tabs/CostsTab";
import { BranchesTab } from "./tabs/BranchesTab";
import { HistoryTab } from "./tabs/HistoryTab";
import { ChecklistTab } from "./tabs/ChecklistTab";
import { Button } from "@/components/ui/button";
import { exportToPDF } from "@/lib/exportUtils";

import { User } from "@/lib/types";

interface MainDashboardProps {
  currentUser?: User;
  onLogout?: () => void;
}

export function MainDashboard({ currentUser, onLogout }: MainDashboardProps) {
  const { state, dispatch } = useMaintenanceContext();
  const [activeTab, setActiveTab] = useState<"calendar" | "planning" | "gantt" | "costs" | "checklist" | "branches" | "history">(
    "calendar"
  );

  const tabs = [
    { id: "calendar", label: "Calendario", icon: "📅" },
    { id: "planning", label: "Planeación", icon: "📋" },
    { id: "gantt", label: "Cumplimiento", icon: "📊" },
    { id: "costs", label: "Costos", icon: "💰" },
    { id: "checklist", label: "Checklist", icon: "✅" },
    { id: "branches", label: "Sucursales", icon: "🏪" },
    { id: "history", label: "Historial", icon: "📜" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-40 shadow-lg print:hidden" style={{
        background: "linear-gradient(135deg, #0b3d91 0%, #1e56a0 50%, #2563eb 100%)",
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                Control de Mantenimiento Preventivo
              </h1>
              <p className="text-sm text-blue-200 mt-1 font-medium">
                Casa Muñoz S.A. • Beauty Hub S.A.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-bold text-blue-200">Año:</label>
                <select
                  value={state.currentYear}
                  onChange={(e) =>
                    dispatch({ type: "SET_YEAR", payload: parseInt(e.target.value) })
                  }
                  className="px-3 py-1.5 rounded-lg bg-white/15 text-white text-sm font-bold border border-white/20 backdrop-blur-sm focus:ring-2 focus:ring-white/30 focus:outline-none cursor-pointer hover:bg-white/25 transition-colors"
                >
                  {[2023, 2024, 2025, 2026, 2027].map((year) => (
                    <option key={year} value={year} className="text-gray-900">
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                onClick={exportToPDF}
                variant="outline"
                className="text-white border-white/30 hover:bg-white/15 hover:border-white/50 rounded-lg transition-all backdrop-blur-sm font-semibold"
                size="sm"
              >
                Imprimir / PDF
              </Button>

              {currentUser && onLogout && (
                <div className="flex items-center gap-3 border-l border-white/20 pl-4 ml-2">
                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] text-blue-200 font-bold block uppercase">Panel de Control</span>
                    <span className="text-xs text-white font-extrabold">{currentUser.username}</span>
                  </div>
                  <Button
                    onClick={onLogout}
                    variant="outline"
                    size="sm"
                    className="text-red-200 hover:text-red-100 hover:bg-red-500/20 border-red-500/30 hover:border-red-500/50 rounded-lg transition-all font-semibold"
                  >
                    Cerrar Sesión
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/80 sticky top-[76px] z-30 shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-bold whitespace-nowrap border-b-3 transition-all duration-200 rounded-t-lg ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-700 bg-blue-50/60"
                    : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50/80"
                }`}
              >
                <span className="text-base">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "calendar" && <CalendarTab />}
        {activeTab === "planning" && <PlanningTab />}
        {activeTab === "gantt" && <GanttTab />}
        {activeTab === "costs" && <CostsTab />}
        {activeTab === "checklist" && <ChecklistTab />}
        {activeTab === "branches" && <BranchesTab />}
        {activeTab === "history" && <HistoryTab />}
      </main>

      {/* Footer */}
      <footer className="bg-white/60 backdrop-blur-sm border-t border-gray-200/60 mt-8 py-5 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-500 text-center font-medium">
            © 2025 Control de Mantenimiento Preventivo • Casa Muñoz S.A. • Beauty Hub S.A.
          </p>
        </div>
      </footer>
    </div>
  );
}
