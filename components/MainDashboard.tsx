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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-100 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4 flex-1">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 -ml-2 rounded-lg text-gray-500 hover:text-cm-dark hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
              
              <div>
                <h1 className="text-2xl font-extrabold text-cm-dark tracking-tight flex items-center gap-2">
                  Control de Mantenimiento Preventivo
                </h1>
                <p className="text-sm mt-1 font-medium text-cm-gray">
                  {isReadOnly ? "Vista Administración • Sólo Lectura" : "Casa Muñoz S.A. • Medi Pedi"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {isReadOnly && (
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gray-100 text-gray-500 border border-gray-200">
                  🔒 Sólo Lectura
                </span>
              )}
              <div className="flex items-center gap-2">
                <label className="text-sm font-bold text-cm-gray">Año:</label>
                <select
                  value={state.currentYear}
                  onChange={(e) =>
                    dispatch({ type: "SET_YEAR", payload: parseInt(e.target.value) })
                  }
                  className="px-3 py-1.5 rounded-lg bg-gray-50 text-cm-dark text-sm font-bold border border-gray-200 focus:ring-2 focus:ring-cm-teal/50 focus:border-cm-teal outline-none cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  {[2023, 2024, 2025, 2026, 2027].map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                onClick={exportToPDF}
                variant="outline"
                className="text-cm-dark border-gray-200 hover:bg-gray-50 rounded-lg transition-all font-semibold"
                size="sm"
              >
                Imprimir / PDF
              </Button>

              {currentUser && onLogout && (
                <div className="flex items-center gap-3 border-l border-gray-200 pl-4 ml-2">
                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] font-bold block uppercase text-cm-gray">
                      {isReadOnly ? "Administración" : "Panel de Control"}
                    </span>
                    <span className="text-xs text-cm-dark font-extrabold">{currentUser.username}</span>
                  </div>
                  <Button
                    onClick={onLogout}
                    variant="outline"
                    size="sm"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200 hover:border-red-300 rounded-lg transition-all font-semibold"
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
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white transform transition-transform duration-300 ease-in-out border-r border-gray-200 print:hidden flex flex-col shadow-2xl ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-3 text-cm-dark">
            <Wrench className="w-6 h-6 text-cm-teal" />
            <span className="font-bold tracking-wide">Mantenimiento</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="text-gray-400 hover:text-cm-dark transition-colors p-1 rounded-md hover:bg-gray-100"
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
                    ? "bg-cm-teal/10 text-cm-teal border border-cm-teal/20"
                    : "text-gray-500 hover:bg-gray-50 hover:text-cm-dark border border-transparent"
                }`}
              >
                <span className="text-lg opacity-80">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-100 text-xs text-cm-gray text-center font-semibold">
          <p>Casa Muñoz Medi Pedi v2.0</p>
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
