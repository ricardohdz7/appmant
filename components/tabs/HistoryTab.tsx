"use client";

import { useMaintenanceContext } from "@/lib/MaintenanceContext";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Trash2, 
  History, 
  Calendar, 
  DollarSign, 
  Building, 
  ClipboardList, 
  Activity,
  Clock
} from "lucide-react";

export function HistoryTab() {
  const { state, dispatch } = useMaintenanceContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "cost" | "calendar" | "planning" | "branch" | "system">("all");

  const history = state.historyLog || [];

  // Filter logic
  const filteredHistory = history.filter((item) => {
    const matchesSearch = item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === "all" || item.entity === activeFilter;
    return matchesSearch && matchesFilter;
  });

  // Calculate statistics
  const totalChanges = history.length;
  const costChanges = history.filter((h) => h.entity === "cost").length;
  const calendarChanges = history.filter((h) => h.entity === "calendar").length;
  const lastChangeTime = history[0]
    ? new Date(history[0].timestamp).toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "Sin cambios";

  const handleClearHistory = () => {
    if (confirm("¿Estás seguro de que deseas limpiar todo el historial de cambios? Esta acción eliminará el registro histórico permanente.")) {
      dispatch({ type: "CLEAR_HISTORY" });
    }
  };

  const getEntityBadge = (entity: string) => {
    const styles: Record<string, { label: string; bg: string; text: string; icon: any }> = {
      cost: { label: "Costos", bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700", icon: DollarSign },
      calendar: { label: "Calendario", bg: "bg-indigo-50 border-indigo-200", text: "text-indigo-700", icon: Calendar },
      planning: { label: "Planeación", bg: "bg-violet-50 border-violet-200", text: "text-violet-700", icon: ClipboardList },
      branch: { label: "Sucursales", bg: "bg-amber-50 border-amber-200", text: "text-amber-700", icon: Building },
      system: { label: "Sistema", bg: "bg-slate-100 border-slate-300", text: "text-slate-700", icon: Activity },
    };

    const config = styles[entity] || { label: "Otro", bg: "bg-gray-50 border-gray-200", text: "text-gray-600", icon: History };
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${config.bg} ${config.text}`}>
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </span>
    );
  };

  const formatTimestamp = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
      });
    } catch {
      return isoString;
    }
  };

  const inputClass = "pl-10 pr-4 py-2.5 w-full md:w-80 border border-gray-200 rounded-xl text-sm text-gray-900 font-medium bg-white placeholder-gray-400 focus:ring-2 focus:ring-blue-300 focus:border-blue-300 focus:outline-none transition-all";

  return (
    <div className="space-y-6">
      {/* KPI/Statistics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="rounded-2xl p-5 border border-blue-100 bg-gradient-to-br from-white to-blue-50/20 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-100/50 rounded-xl text-blue-700">
            <History className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total de Cambios</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-1">{totalChanges}</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="rounded-2xl p-5 border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/10 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-100/50 rounded-xl text-emerald-700">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Historial de Costos</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-1">{costChanges}</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="rounded-2xl p-5 border border-indigo-100 bg-gradient-to-br from-white to-indigo-50/10 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-100/50 rounded-xl text-indigo-700">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Historial Calendario</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-1">{calendarChanges}</p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="rounded-2xl p-5 border border-purple-100 bg-gradient-to-br from-white to-purple-50/10 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-100/50 rounded-xl text-purple-700">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Última Modificación</p>
            <p className="text-lg font-extrabold text-purple-950 mt-1.5 truncate">{lastChangeTime}</p>
          </div>
        </div>
      </div>

      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Historial de Cambios</h2>
          <p className="text-sm text-gray-500 mt-1">Registro de auditoría en tiempo real para el seguimiento de costos, calendarios y planeación.</p>
        </div>

        {totalChanges > 0 && (
          <Button 
            onClick={handleClearHistory}
            variant="destructive"
            size="sm"
            className="flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 shadow-md shadow-red-200 transition-all ml-auto md:ml-0"
          >
            <Trash2 className="w-4 h-4" />
            Limpiar Registro
          </Button>
        )}
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Category Filters */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {[
            { id: "all", label: "Todos", icon: History },
            { id: "cost", label: "Costos", icon: DollarSign },
            { id: "calendar", label: "Calendario", icon: Calendar },
            { id: "planning", label: "Planeación", icon: ClipboardList },
            { id: "branch", label: "Sucursales", icon: Building },
            { id: "system", label: "Sistema", icon: Activity },
          ].map((filter) => {
            const Icon = filter.icon;
            const isActive = activeFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id as any)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                  isActive
                    ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                    : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {filter.label}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-auto">
          <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-gray-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Buscar en descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      {/* Log list / Table */}
      <div className="rounded-2xl shadow-lg overflow-hidden border border-gray-200/80 bg-white">
        {filteredHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100/60 font-bold text-gray-700 text-xs uppercase tracking-wider">
                  <th className="px-5 py-3.5 w-48">Fecha y Hora</th>
                  <th className="px-5 py-3.5 w-36">Tipo</th>
                  <th className="px-5 py-3.5">Descripción del Cambio</th>
                  <th className="px-5 py-3.5 w-32 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredHistory.map((item, idx) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-blue-50/20 transition-colors ${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50/10"
                    }`}
                  >
                    <td className="px-5 py-4 whitespace-nowrap text-xs font-semibold text-gray-500 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      {formatTimestamp(item.timestamp)}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      {getEntityBadge(item.entity)}
                    </td>
                    <td className="px-5 py-4 text-gray-900 font-semibold text-sm leading-relaxed">
                      {item.description}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-center text-xs font-bold">
                      <span className={`inline-block px-2 py-0.5 rounded uppercase tracking-wider ${
                        item.action === "add" ? "bg-green-100 text-green-800" :
                        item.action === "delete" ? "bg-red-100 text-red-800" :
                        item.action === "clear" ? "bg-red-200 text-red-950" :
                        item.action === "update" ? "bg-blue-100 text-blue-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {item.action === "add" ? "Creado" :
                         item.action === "delete" ? "Borrado" :
                         item.action === "clear" ? "Vaciado" :
                         item.action === "update" ? "Edición" :
                         item.action}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 px-4 text-center">
            <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-900 font-bold text-base">No se encontraron registros</p>
            <p className="text-gray-400 text-sm mt-1">Realiza algún cambio en costos, sucursales o calendarios para comenzar a registrar eventos, o ajusta los filtros.</p>
          </div>
        )}
      </div>
    </div>
  );
}
