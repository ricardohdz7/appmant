"use client";

import { useMaintenanceContext } from "@/lib/MaintenanceContext";
import { getMonthName } from "@/lib/kpiCalculations";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { downloadCSV } from "@/lib/exportUtils";

export function CalendarTab() {
  const { state, dispatch } = useMaintenanceContext();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Calendario de Mantenimiento {state.currentYear}</h2>
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

      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 sticky top-0">
              <th className="px-4 py-3 text-left font-semibold text-gray-700 sticky left-0 bg-gray-50 z-10">
                Sucursal
              </th>
              {Array.from({ length: 12 }).map((_, month) => (
                <th key={month} className="px-3 py-3 text-center font-semibold text-gray-700 whitespace-nowrap">
                  {getMonthName(month).substring(0, 3)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {state.branches.map((branch) => (
              <tr key={branch.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900 sticky left-0 bg-white z-10">
                  {branch.name}
                </td>
                {Array.from({ length: 12 }).map((_, month) => {
                  const entry = state.calendarEntries.find(
                    (e) => e.branchId === branch.id && e.month === month && e.year === state.currentYear
                  );

                  const statusColors: Record<string, string> = {
                    realizado: "bg-green-100 text-green-800",
                    programado: "bg-blue-100 text-blue-800",
                    pendiente: "bg-red-100 text-red-800",
                    "": "bg-gray-50 text-gray-400",
                  };

                  return (
                    <td key={month} className="px-3 py-2 text-center">
                      <select
                        value={entry?.status || ""}
                        onChange={(e) => {
                          dispatch({
                            type: "UPDATE_CALENDAR_ENTRY",
                            payload: {
                              branchId: branch.id,
                              year: state.currentYear,
                              month,
                              status: e.target.value as any,
                              responsible: entry?.responsible || "",
                            },
                          });
                        }}
                        className={`text-xs px-2 py-1 rounded font-bold cursor-pointer border-2 border-gray-400 ${
                          statusColors[entry?.status || ""] || "bg-white text-gray-900"
                        }`}
                      >
                        <option value="">-</option>
                        <option value="programado">Programado</option>
                        <option value="pendiente">Pendiente</option>
                        <option value="realizado">Realizado</option>
                      </select>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-100 border border-green-400" />
            <span>Realizado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-100 border border-blue-400" />
            <span>Programado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-100 border border-red-400" />
            <span>Pendiente</span>
          </div>
        </div>
      </div>
    </div>
  );
}
