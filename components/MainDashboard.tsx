"use client";

import { useState } from "react";
import { useMaintenanceContext } from "@/lib/MaintenanceContext";
import { CalendarTab } from "./tabs/CalendarTab";
import { PlanningTab } from "./tabs/PlanningTab";
import { GanttTab } from "./tabs/GanttTab";
import { CostsTab } from "./tabs/CostsTab";
import { BranchesTab } from "./tabs/BranchesTab";
import { Button } from "@/components/ui/button";
import { exportToPDF } from "@/lib/exportUtils";

export function MainDashboard() {
  const { state, dispatch } = useMaintenanceContext();
  const [activeTab, setActiveTab] = useState<"calendar" | "planning" | "gantt" | "costs" | "branches">(
    "calendar"
  );

  const tabs = [
    { id: "calendar", label: "Calendario", icon: "📅" },
    { id: "planning", label: "Planeación", icon: "📋" },
    { id: "gantt", label: "Cumplimiento", icon: "📊" },
    { id: "costs", label: "Costos", icon: "💰" },
    { id: "branches", label: "Sucursales", icon: "🏪" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-primary text-primary-foreground shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Control de Mantenimiento Preventivo</h1>
              <p className="text-sm text-primary-foreground/80 mt-1">
                Casa Muñoz S.A. • Beauty Hub S.A.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <label className="text-sm font-medium">Año:</label>
                <select
                  value={state.currentYear}
                  onChange={(e) =>
                    dispatch({ type: "SET_YEAR", payload: parseInt(e.target.value) })
                  }
                  className="ml-2 px-3 py-1 rounded bg-primary-foreground text-primary text-sm font-medium"
                >
                  {Array.from({ length: 5 }).map((_, i) => {
                    const year = new Date().getFullYear() - 2 + i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>

              <Button
                onClick={exportToPDF}
                variant="outline"
                className="text-primary-foreground border-primary-foreground hover:bg-primary-foreground/10"
                size="sm"
              >
                Imprimir / PDF
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-600 hover:text-gray-900"
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
        {activeTab === "branches" && <BranchesTab />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-8 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-600 text-center">
            © 2025 Control de Mantenimiento Preventivo • Casa Muñoz S.A. • Beauty Hub S.A.
          </p>
        </div>
      </footer>
    </div>
  );
}
