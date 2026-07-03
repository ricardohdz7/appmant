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
import { TicketsTab } from "./tabs/TicketsTab";
import { UsersTab } from "./tabs/UsersTab";
import { Button } from "@/components/ui/button";
import { exportToPDF } from "@/lib/exportUtils";
import { Menu, X, Wrench } from "lucide-react";

import { User } from "@/lib/types";

interface MainDashboardProps {
  currentUser?: User;
  onLogout?: () => void;
}

export function MainDashboard({ currentUser, onLogout }: MainDashboardProps) {
  const { state, dispatch } = useMaintenanceContext();
  const [activeTab, setActiveTab] = useState<"calendar" | "planning" | "gantt" | "costs" | "checklist" | "branches" | "history" | "tickets" | "users">(
    "calendar"
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isReadOnly = currentUser?.role === "management";

  const tabs = [
    { id: "calendar", label: "Calendario", icon: "📅" },
    { id: "planning", label: "Planeación", icon: "📋" },
    { id: "gantt", label: "Cumplimiento", icon: "📊" },
    { id: "costs", label: "Costos", icon: "💰" },
    { id: "checklist", label: "Checklist", icon: "✅" },
    { id: "tickets", label: "Tickets Odoo", icon: "🎫" },
    { id: "branches", label: "Sucursales", icon: "🏪" },
    { id: "history", label: "Historial", icon: "📜" },
  ];
  
  if (!isReadOnly) {
    tabs.push({ id: "users", label: "Usuarios y Permisos", icon: "👥" });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-40 shadow-lg print:hidden" style={{
        background: isReadOnly 
          ? "linear-gradient(135deg, #1a4731 0%, #166534 50%, #15803d 100%)"
          : "linear-gradient(135deg, #0b3d91 0%, #1e56a0 50%, #2563eb 100%)",
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4 flex-1">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 -ml-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
              
              <div>
                <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  Control de Mantenimiento Preventivo
                </h1>
                <p className={`text-sm mt-1 font-medium ${isReadOnly ? "text-emerald-200" : "text-blue-200"}`}>
                  {isReadOnly ? "Vista Administración • Sólo Lectura" : "Casa Muñoz S.A. • Beauty Hub S.A."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {isReadOnly && (
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-yellow-400/20 text-yellow-200 border border-yellow-400/30">
                  🔒 Sólo Lectura
                </span>
              )}
              <div className="flex items-center gap-2">
                <label className={`text-sm font-bold ${isReadOnly ? "text-emerald-200" : "text-blue-200"}`}>Año:</label>
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
                    <span className={`text-[10px] font-bold block uppercase ${isReadOnly ? "text-emerald-200" : "text-blue-200"}`}>
                      {isReadOnly ? "Administración" : "Panel de Control"}
                    </span>
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

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 transition-opacity backdrop-blur-sm print:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Menu */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0d1117] transform transition-transform duration-300 ease-in-out border-r border-gray-800 print:hidden flex flex-col ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <div className="flex items-center gap-3 text-white">
            <Wrench className="w-6 h-6" />
            <span className="font-bold tracking-wide">Mantenimiento</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-md hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="overflow-y-auto flex-1 py-4 px-3">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-blue-600/10 text-blue-400 border border-blue-500/20"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white border border-transparent"
                }`}
              >
                <span className="text-lg opacity-80">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-800 text-xs text-gray-500">
          <p>Control Preventivo v2.0</p>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "calendar" && <CalendarTab readOnly={isReadOnly} />}
        {activeTab === "planning" && <PlanningTab readOnly={isReadOnly} />}
        {activeTab === "gantt" && <GanttTab />}
        {activeTab === "costs" && <CostsTab readOnly={isReadOnly} />}
        {activeTab === "checklist" && <ChecklistTab readOnly={isReadOnly} />}
        {activeTab === "tickets" && <TicketsTab />}
        {activeTab === "branches" && <BranchesTab readOnly={isReadOnly} />}
        {activeTab === "history" && <HistoryTab readOnly={isReadOnly} />}
        {activeTab === "users" && !isReadOnly && <UsersTab />}
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
