"use client";

import { useMaintenanceContext } from "@/lib/MaintenanceContext";
import { calculateKPIs, getMonthName, getStatusColor } from "@/lib/kpiCalculations";
import { KPIDashboard } from "@/components/KPIDashboard";

export function GanttTab() {
  const { state } = useMaintenanceContext();
  const kpis = calculateKPIs(state);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Dashboard de Cumplimiento</h2>

      <KPIDashboard kpis={kpis} />

      <div className="bg-white rounded-lg shadow-md overflow-x-auto border border-gray-300">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-300 bg-gray-100 sticky top-0">
              <th className="px-4 py-3 text-left font-bold text-gray-900 sticky left-0 bg-gray-100 z-10 min-w-32">
                Sucursal
              </th>
              {[0, 3, 6, 9].map((month) => (
                <th key={month} className="px-3 py-3 text-center font-bold text-gray-900 whitespace-nowrap">
                  {getMonthName(month)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {state.branches.map((branch) => (
              <tr key={branch.id} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="px-4 py-3 text-gray-900 sticky left-0 bg-white z-10 font-medium text-xs">
                  {branch.name}
                </td>
                {[0, 3, 6, 9].map((month) => {
                  const entry = state.calendarEntries.find(
                    (e) => e.branchId === branch.id && e.month === month && e.year === state.currentYear
                  );

                  return (
                    <td key={month} className="px-3 py-3 text-center">
                      <div className="h-8 rounded flex items-center justify-center" style={{
                        backgroundColor: getStatusColor(entry?.status || ""),
                        opacity: 0.8,
                      }}>
                        <span className="text-white text-xs font-semibold">
                          {entry?.status ? entry.status[0].toUpperCase() : "-"}
                        </span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="font-semibold text-sm mb-3">Resumen por Empresa</h3>
          <div className="space-y-2 text-sm">
            {Array.from(
              new Set(state.branches.map((b) => b.enterprise))
            ).map((enterprise) => {
              const branchesInEnterprise = state.branches.filter((b) => b.enterprise === enterprise);
              const total = branchesInEnterprise.length * 4;
              const completed = state.calendarEntries.filter(
                (e) =>
                  e.year === state.currentYear &&
                  e.status === "realizado" &&
                  [0, 3, 6, 9].includes(e.month) &&
                  branchesInEnterprise.some((b) => b.id === e.branchId)
              ).length;

              return (
                <div key={enterprise} className="flex justify-between">
                  <span className="text-gray-700">{enterprise}</span>
                  <span className="font-semibold">
                    {completed}/{total} ({Math.round((completed / total) * 100)}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="font-semibold text-sm mb-3">Resumen por Marca</h3>
          <div className="space-y-2 text-sm">
            {Array.from(
              new Set(state.branches.map((b) => b.brand))
            ).map((brand) => {
              const branchesInBrand = state.branches.filter((b) => b.brand === brand);
              const total = branchesInBrand.length * 4;
              const completed = state.calendarEntries.filter(
                (e) =>
                  e.year === state.currentYear &&
                  e.status === "realizado" &&
                  [0, 3, 6, 9].includes(e.month) &&
                  branchesInBrand.some((b) => b.id === e.branchId)
              ).length;

              return (
                <div key={brand} className="flex justify-between">
                  <span className="text-gray-700">{brand}</span>
                  <span className="font-semibold">
                    {completed}/{total} ({Math.round((completed / total) * 100)}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
