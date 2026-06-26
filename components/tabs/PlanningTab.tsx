"use client";

import { useMaintenanceContext } from "@/lib/MaintenanceContext";
import { Button } from "@/components/ui/button";
import { Download, Plus, Trash2 } from "lucide-react";
import { downloadCSV } from "@/lib/exportUtils";
import { calculateKPIs } from "@/lib/kpiCalculations";
import { KPIDashboard } from "@/components/KPIDashboard";
import { formatDate } from "@/lib/dateUtils";
import { useState } from "react";

export function PlanningTab() {
  const { state, dispatch } = useMaintenanceContext();
  const [newDate, setNewDate] = useState("");
  const [newResponsible, setNewResponsible] = useState("");
  const [selectedBranch, setSelectedBranch] = useState(state.branches[0]?.id || "");

  const kpis = calculateKPIs(state);
  const planningKPIs = kpis.filter((k) =>
    ["Planeación Lisa", "Planeación en Proceso", "Planeación Pendiente"].includes(k.label)
  );

  // Group planning entries by enterprise and brand
  const grouped = state.branches.reduce(
    (acc, branch) => {
      const key = `${branch.enterprise} - ${branch.brand}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(branch);
      return acc;
    },
    {} as Record<string, typeof state.branches>
  );

  const handleAddPlanning = () => {
    if (!newDate || !newResponsible) return;

    const id = `p${Date.now()}`;
    dispatch({
      type: "ADD_PLANNING_ENTRY",
      payload: {
        id,
        branchId: selectedBranch,
        scheduledDate: new Date(newDate),
        technicalResponsible: newResponsible,
        advanceStatus: "pendiente",
      },
    });

    setNewDate("");
    setNewResponsible("");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Planeación</h2>
        <Button 
          onClick={() => downloadCSV(state)} 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Exportar CSV
        </Button>
      </div>

      <KPIDashboard kpis={planningKPIs} />

      <div className="bg-white rounded-lg shadow-md p-6 space-y-3 border border-gray-300">
        <h3 className="font-bold text-base text-gray-900">Agregar Planeación</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="px-3 py-2 border-2 border-gray-400 rounded text-sm text-gray-900 font-medium bg-white"
          >
            {state.branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className="px-3 py-2 border-2 border-gray-400 rounded text-sm text-gray-900 font-medium bg-white"
          />
          <input
            type="text"
            placeholder="Responsable"
            value={newResponsible}
            onChange={(e) => setNewResponsible(e.target.value)}
            className="px-3 py-2 border-2 border-gray-400 rounded text-sm text-gray-900 font-medium bg-white placeholder-gray-500"
          />
          <Button onClick={handleAddPlanning} size="sm" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Agregar
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {Object.entries(grouped).map(([group, branches]) => (
          <div key={group} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-300">
            <div className="bg-blue-600 px-4 py-3 border-l-4 border-blue-800">
              <h3 className="font-bold text-base text-white">{group}</h3>
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-300 bg-gray-100">
                  <th className="px-4 py-3 text-left font-bold text-gray-900">Sucursal</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-900">Fecha</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-900">Responsable</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-900">Estado</th>
                  <th className="px-4 py-3 text-center font-bold text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {branches
                  .flatMap((branch) =>
                    state.planningEntries
                      .filter((p) => p.branchId === branch.id)
                      .map((entry) => (
                        <tr key={entry.id} className="border-b border-gray-200 hover:bg-gray-100">
                          <td className="px-4 py-3 text-gray-900 font-medium">{branch.name}</td>
                          <td className="px-4 py-3 text-gray-900 font-medium">
                            {formatDate(entry.scheduledDate)}
                          </td>
                          <td className="px-4 py-3 text-gray-900 font-medium">{entry.technicalResponsible}</td>
                          <td className="px-4 py-3">
                            <select
                              value={entry.advanceStatus}
                              onChange={(e) => {
                                dispatch({
                                  type: "UPDATE_PLANNING_ENTRY",
                                  payload: { ...entry, advanceStatus: e.target.value as any },
                                });
                              }}
                              className="px-2 py-1 border-2 border-gray-400 rounded text-xs text-gray-900 font-medium bg-white"
                            >
                              <option value="pendiente">Pendiente</option>
                              <option value="en_proceso">En Proceso</option>
                              <option value="listo">Listo</option>
                            </select>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => dispatch({ type: "DELETE_PLANNING_ENTRY", payload: entry.id })}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                  )}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
