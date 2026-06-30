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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard de Cumplimiento</h2>
        <div
          className="rounded-2xl p-5 shadow-lg relative overflow-hidden transition-all duration-300 hover:scale-[1.02]"
          style={{
            background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)",
          }}
        >
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
          <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/5" />
          <div className="relative z-10">
            <div className="text-sm font-bold text-blue-100 uppercase tracking-wider">Cumplimiento General</div>
            <div className="text-4xl font-extrabold text-white mt-1">{overallCompliancePercent}%</div>
            <div className="text-xs mt-2 text-blue-200 font-medium">
              {completedMaintenances} de {totalMaintenances} mantenimientos realizados
            </div>
          </div>
        </div>
      </div>

      <KPIDashboard kpis={kpis} />

      <div className="rounded-2xl shadow-lg overflow-x-auto border border-gray-200/80 bg-white">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100/60 sticky top-0">
              <th className="px-4 py-3.5 text-left font-bold text-gray-700 uppercase text-[11px] tracking-wider sticky left-0 bg-gradient-to-r from-gray-50 to-gray-100/60 z-10 min-w-32">
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
                <td className={`px-4 py-3 text-gray-900 sticky left-0 z-10 font-semibold text-xs ${
                  idx % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                }`}>
                  {branch.name}
                </td>
                {[0, 3, 6, 9].map((month) => {
                  const entry = state.calendarEntries.find(
                    (e) => e.branchId === branch.id && e.month === month && e.year === state.currentYear
                  );

                  return (
                    <td key={month} className="px-3 py-3 text-center">
                      <div
                        className="h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
                        style={{
                          backgroundColor: getStatusColor(entry?.status || ""),
                          opacity: entry?.status ? 0.9 : 0.4,
                          boxShadow: entry?.status ? `0 2px 8px ${getStatusColor(entry.status)}40` : 'none',
                        }}
                      >
                        <span className="text-white text-xs font-bold drop-shadow-sm">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-2xl shadow-lg p-5 bg-white border border-gray-200/80">
          <h3 className="font-bold text-base text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-5 rounded-full bg-blue-500 inline-block" />
            Resumen por Empresa
          </h3>
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
              const pct = Math.round((completed / total) * 100);

              return (
                <div key={enterprise} className="flex justify-between items-center p-3 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50/30 border border-gray-100 hover:border-blue-200 transition-colors">
                  <span className="font-semibold text-gray-800">{enterprise}</span>
                  <span
                    className="font-bold text-sm px-3 py-1.5 rounded-lg"
                    style={{
                      backgroundColor: pct >= 70 ? '#d1fae5' : pct >= 40 ? '#dbeafe' : '#fee2e2',
                      color: pct >= 70 ? '#065f46' : pct >= 40 ? '#1e40af' : '#991b1b',
                    }}
                  >
                    {completed}/{total} ({pct}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl shadow-lg p-5 bg-white border border-gray-200/80">
          <h3 className="font-bold text-base text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-5 rounded-full bg-emerald-500 inline-block" />
            Resumen por Marca
          </h3>
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
              const pct = Math.round((completed / total) * 100);

              return (
                <div key={brand} className="flex justify-between items-center p-3 rounded-xl bg-gradient-to-r from-gray-50 to-emerald-50/30 border border-gray-100 hover:border-emerald-200 transition-colors">
                  <span className="font-semibold text-gray-800">{brand}</span>
                  <span
                    className="font-bold text-sm px-3 py-1.5 rounded-lg"
                    style={{
                      backgroundColor: pct >= 70 ? '#d1fae5' : pct >= 40 ? '#dbeafe' : '#fee2e2',
                      color: pct >= 70 ? '#065f46' : pct >= 40 ? '#1e40af' : '#991b1b',
                    }}
                  >
                    {completed}/{total} ({pct}%)
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
