"use client";

import { useMaintenanceContext } from "@/lib/MaintenanceContext";
import { getMonthName } from "@/lib/kpiCalculations";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { downloadCSV } from "@/lib/exportUtils";

interface CalendarTabProps {
  readOnly?: boolean;
}

export function CalendarTab({ readOnly }: CalendarTabProps) {
  const { state, dispatch } = useMaintenanceContext();

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Calendario de Mantenimiento {state.currentYear}</h2>
        <Button 
          onClick={() => downloadCSV(state)} 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2 rounded-xl border-gray-300 hover:bg-blue-50 hover:border-blue-300 transition-all"
        >
          <Download className="w-4 h-4" />
          Exportar CSV
        </Button>
      </div>

      <div className="rounded-2xl shadow-lg overflow-x-auto border border-gray-200/80 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100/60 sticky top-0">
              <th className="px-4 py-3.5 text-left font-bold text-gray-700 uppercase text-[11px] tracking-wider sticky left-0 bg-gradient-to-r from-gray-50 to-gray-100/60 z-10">
                Sucursal
              </th>
              {[0, 3, 6, 9].map((month) => (
                <th key={month} className="px-3 py-3.5 text-center font-bold text-gray-700 whitespace-nowrap uppercase text-[11px] tracking-wider">
                  {getMonthName(month)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {state.branches.map((branch, idx) => (
              <tr
                key={branch.id}
                className={`border-b border-gray-100 hover:bg-blue-50/40 transition-colors ${
                  idx % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                }`}
              >
                <td className={`px-4 py-3 font-semibold text-gray-900 sticky left-0 z-10 ${
                  idx % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                }`}>
                  {branch.name}
                </td>
                {[0, 3, 6, 9].map((month) => {
                  const entry = state.calendarEntries.find(
                    (e) => e.branchId === branch.id && e.month === month && e.year === state.currentYear
                  );

                  const statusStyles: Record<string, string> = {
                    realizado: "bg-emerald-50 text-emerald-800 font-bold border-emerald-300 ring-1 ring-emerald-200",
                    programado: "bg-blue-50 text-blue-800 font-bold border-blue-300 ring-1 ring-blue-200",
                    pendiente: "bg-red-50 text-red-800 font-bold border-red-300 ring-1 ring-red-200",
                    "": "bg-gray-50 text-gray-600 border-gray-300",
                  };

                  const statusLabels: Record<string, string> = {
                    realizado: "Realizado",
                    programado: "Programado",
                    pendiente: "Pendiente",
                    "": "-",
                  };

                  return (
                    <td key={month} className="px-3 py-2 text-center">
                      {readOnly ? (
                        <span className={`inline-block text-sm px-2.5 py-1.5 rounded-lg font-bold border ${
                          statusStyles[entry?.status || ""] || "bg-gray-50 text-gray-600 border-gray-300"
                        }`}>
                          {statusLabels[entry?.status || ""] || "-"}
                        </span>
                      ) : (
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
                          className={`text-sm px-2.5 py-1.5 rounded-lg font-bold cursor-pointer border w-full transition-all focus:ring-2 focus:ring-blue-300 ${
                            statusStyles[entry?.status || ""] || "bg-gray-50 text-gray-600 border-gray-300"
                          }`}
                        >
                          <option value="">-</option>
                          <option value="programado">Programado</option>
                          <option value="pendiente">Pendiente</option>
                          <option value="realizado">Realizado</option>
                        </select>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-sm">
        <h3 className="font-bold text-sm text-gray-700 mb-3 uppercase tracking-wider flex items-center gap-2">
          <span className="w-1.5 h-4 rounded-full bg-gray-400 inline-block" />
          Leyenda de Estados
        </h3>
        <div className="flex gap-6 text-sm flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 border border-emerald-400 flex items-center justify-center">
              <span className="text-emerald-600 text-xs font-bold">R</span>
            </div>
            <span className="font-semibold text-gray-800">Realizado</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-blue-100 border border-blue-400 flex items-center justify-center">
              <span className="text-blue-600 text-xs font-bold">P</span>
            </div>
            <span className="font-semibold text-gray-800">Programado</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-red-100 border border-red-400 flex items-center justify-center">
              <span className="text-red-600 text-xs font-bold">!</span>
            </div>
            <span className="font-semibold text-gray-800">Pendiente</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gray-100 border border-gray-300 flex items-center justify-center">
              <span className="text-gray-400 text-xs font-bold">-</span>
            </div>
            <span className="font-semibold text-gray-800">Sin Datos</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl shadow-lg overflow-hidden border border-gray-200/80 bg-white">
        <div className="p-5">
          <h3 className="font-bold text-base text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-5 rounded-full bg-emerald-500 inline-block" />
            Sucursales sin Mantenimiento Atrasado
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {state.branches
              .filter((branch) => {
                // Find the current month that should have maintenance (0, 3, 6, 9)
                const now = new Date();
                const currentMonth = now.getMonth();
                const currentYear = state.currentYear;
                
                // Determine which quarter month should have been completed by now
                let quarterMonth = 0;
                if (currentMonth >= 9) quarterMonth = 9;
                else if (currentMonth >= 6) quarterMonth = 6;
                else if (currentMonth >= 3) quarterMonth = 3;
                else quarterMonth = 0;
                
                const entry = state.calendarEntries.find(
                  (e) => e.branchId === branch.id && e.month === quarterMonth && e.year === currentYear
                );
                
                // Branch is on time if it has "realizado" or "programado"
                return entry && (entry.status === "realizado" || entry.status === "programado");
              })
              .map((branch) => (
                <div
                  key={branch.id}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50/50 border border-emerald-200 hover:border-emerald-300 transition-all hover:shadow-sm"
                >
                  <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200" />
                  <span className="text-sm font-semibold text-emerald-800">{branch.name}</span>
                </div>
              ))}
          </div>
          {state.branches.filter((branch) => {
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = state.currentYear;
            let quarterMonth = 0;
            if (currentMonth >= 9) quarterMonth = 9;
            else if (currentMonth >= 6) quarterMonth = 6;
            else if (currentMonth >= 3) quarterMonth = 3;
            else quarterMonth = 0;
            const entry = state.calendarEntries.find(
              (e) => e.branchId === branch.id && e.month === quarterMonth && e.year === currentYear
            );
            return entry && (entry.status === "realizado" || entry.status === "programado");
          }).length === 0 && (
            <p className="text-gray-400 text-sm italic">No hay sucursales sin mantenimiento atrasado en este período</p>
          )}
        </div>
      </div>
    </div>
  );
}
