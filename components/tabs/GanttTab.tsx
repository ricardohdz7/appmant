"use client";

import { useMaintenanceContext } from "@/lib/MaintenanceContext";
import { calculateKPIs, getMonthName, getStatusColor } from "@/lib/kpiCalculations";
import { KPIDashboard } from "@/components/KPIDashboard";

export function GanttTab() {
  const { state } = useMaintenanceContext();
  const kpis = calculateKPIs(state);

  // Calculate overall compliance
  const totalMaintenances = state.branches.length * 4;
  const completedMaintenances = state.calendarEntries.filter(
    (e) =>
      e.year === state.currentYear &&
      e.status === "realizado" &&
      [0, 3, 6, 9].includes(e.month)
  ).length;
  const overallCompliancePercent = Math.round((completedMaintenances / totalMaintenances) * 100);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Dashboard de Cumplimiento</h2>
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-4 shadow-md">
          <div className="text-sm font-semibold">Cumplimiento General</div>
          <div className="text-3xl font-bold">{overallCompliancePercent}%</div>
          <div className="text-xs mt-1">{completedMaintenances} de {totalMaintenances} mantenimientos realizados</div>
        </div>
      </div>

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
        <div className="bg-white rounded-lg shadow-md p-4 border-2 border-gray-300">
          <h3 className="font-bold text-base text-gray-900 mb-4">Resumen por Empresa</h3>
          <div className="space-y-3 text-sm">
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
                <div key={enterprise} className="flex justify-between items-center p-2 bg-gray-50 rounded border border-gray-200">
                  <span className="font-semibold text-gray-900">{enterprise}</span>
                  <span className="font-bold text-gray-900 bg-gray-200 px-3 py-1 rounded">
                    {completed}/{total} ({Math.round((completed / total) * 100)}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 border-2 border-gray-300">
          <h3 className="font-bold text-base text-gray-900 mb-4">Resumen por Marca</h3>
          <div className="space-y-3 text-sm">
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
                <div key={brand} className="flex justify-between items-center p-2 bg-gray-50 rounded border border-gray-200">
                  <span className="font-semibold text-gray-900">{brand}</span>
                  <span className="font-bold text-gray-900 bg-gray-200 px-3 py-1 rounded">
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
