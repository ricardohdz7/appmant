"use client";

import { useMaintenanceContext } from "@/lib/MaintenanceContext";
import { calculateKPIs, getMonthName, getStatusColor } from "@/lib/kpiCalculations";
import { KPIDashboard } from "@/components/KPIDashboard";
import { useState } from "react";
import { Calendar, AlertCircle, CheckCircle2, Clock, HelpCircle, DollarSign } from "lucide-react";

export function GanttTab() {
  const { state } = useMaintenanceContext();
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const kpis = calculateKPIs(state, selectedMonth);

  // Calculate overall compliance
  const totalMaintenances = selectedMonth !== null ? state.branches.length : state.branches.length * 4;
  const completedMaintenances = state.calendarEntries.filter(
    (e) =>
      e.year === state.currentYear &&
      e.status === "realizado" &&
      (selectedMonth !== null ? e.month === selectedMonth : [0, 3, 6, 9].includes(e.month))
  ).length;
  const overallCompliancePercent = totalMaintenances > 0 ? Math.round((completedMaintenances / totalMaintenances) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard de Cumplimiento</h2>
          <p className="text-xs text-gray-500 mt-1">Análisis de mantenimiento preventivo e insumos</p>
        </div>
        <div
          className="rounded-2xl p-5 shadow-lg relative overflow-hidden transition-all duration-300 hover:scale-[1.02]"
          style={{
            background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)",
          }}
        >
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
          <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/5" />
          <div className="relative z-10">
            <div className="text-sm font-bold text-blue-100 uppercase tracking-wider">
              {selectedMonth !== null ? `Cumplimiento de ${getMonthName(selectedMonth)}` : "Cumplimiento General"}
            </div>
            <div className="text-4xl font-extrabold text-white mt-1">{overallCompliancePercent}%</div>
            <div className="text-xs mt-2 text-blue-200 font-medium">
              {completedMaintenances} de {totalMaintenances} mantenimientos realizados
            </div>
          </div>
        </div>
      </div>

      {/* Segmentador de Meses */}
      <div className="bg-gray-100/80 p-1.5 rounded-2xl flex gap-1 border border-gray-200/50 max-w-xl">
        {[
          { label: "Consolidado", value: null },
          { label: "Enero", value: 0 },
          { label: "Abril", value: 3 },
          { label: "Julio", value: 6 },
          { label: "Octubre", value: 9 },
        ].map((opt) => (
          <button
            key={opt.label}
            onClick={() => setSelectedMonth(opt.value)}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all duration-200 ${
              selectedMonth === opt.value
                ? "bg-white text-blue-700 shadow-sm border border-gray-200/40"
                : "text-gray-600 hover:bg-white/40 hover:text-gray-900"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <KPIDashboard kpis={kpis} />

      {/* Sección de desglose mensual cuando hay un mes seleccionado */}
      {selectedMonth !== null && (() => {
        // Agrupar sucursales por estado en este mes
        const statusGroups = state.branches.reduce(
          (acc, branch) => {
            const entry = state.calendarEntries.find(
              (e) => e.branchId === branch.id && e.month === selectedMonth && e.year === state.currentYear
            );
            const status = entry?.status || "sin_programar";
            if (!acc[status]) acc[status] = [];
            acc[status].push(branch);
            return acc;
          },
          { realizado: [], programado: [], pendiente: [], sin_programar: [] } as Record<string, typeof state.branches>
        );

        // Filtrar insumos del mes seleccionado
        const monthCosts = state.costEntries.filter((e) => {
          const d = e.date instanceof Date ? e.date : new Date(e.date);
          return d.getFullYear() === state.currentYear && d.getMonth() === selectedMonth;
        });

        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Columna de Estados de Sucursales */}
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-2xl p-5 border border-gray-200/80 bg-white shadow-lg space-y-4">
                <h3 className="font-bold text-base text-gray-950 flex items-center gap-2">
                  <span className="w-1.5 h-5 rounded-full bg-blue-600 inline-block" />
                  Estatus de Sucursales en {getMonthName(selectedMonth)}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Realizados */}
                  <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 space-y-2">
                    <div className="flex items-center justify-between text-emerald-800 font-bold text-sm">
                      <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Realizados</span>
                      <span className="bg-emerald-100/70 px-2 py-0.5 rounded-lg text-xs">{statusGroups.realizado.length}</span>
                    </div>
                    {statusGroups.realizado.length === 0 ? (
                      <p className="text-xs text-emerald-600 font-medium italic">Ninguna sucursal completada</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {statusGroups.realizado.map((b) => (
                          <span key={b.id} className="text-xs bg-white text-emerald-900 border border-emerald-200/80 px-2 py-0.5 rounded-md font-semibold">
                            {b.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Programados */}
                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-2">
                    <div className="flex items-center justify-between text-blue-800 font-bold text-sm">
                      <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> Programados</span>
                      <span className="bg-blue-100/70 px-2 py-0.5 rounded-lg text-xs">{statusGroups.programado.length}</span>
                    </div>
                    {statusGroups.programado.length === 0 ? (
                      <p className="text-xs text-blue-600 font-medium italic">Ninguna sucursal programada</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {statusGroups.programado.map((b) => (
                          <span key={b.id} className="text-xs bg-white text-blue-950 border border-blue-200/80 px-2 py-0.5 rounded-md font-semibold">
                            {b.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Pendientes */}
                  <div className="bg-red-50/50 p-4 rounded-xl border border-red-100 space-y-2">
                    <div className="flex items-center justify-between text-red-800 font-bold text-sm">
                      <span className="flex items-center gap-1.5"><AlertCircle className="w-4 h-4" /> Pendientes</span>
                      <span className="bg-red-100/70 px-2 py-0.5 rounded-lg text-xs">{statusGroups.pendiente.length}</span>
                    </div>
                    {statusGroups.pendiente.length === 0 ? (
                      <p className="text-xs text-red-600 font-medium italic">Ningún mantenimiento pendiente</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {statusGroups.pendiente.map((b) => (
                          <span key={b.id} className="text-xs bg-white text-red-950 border border-red-200/80 px-2 py-0.5 rounded-md font-semibold">
                            {b.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Sin Planificar */}
                  <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-200/50 space-y-2">
                    <div className="flex items-center justify-between text-gray-700 font-bold text-sm">
                      <span className="flex items-center gap-1.5"><HelpCircle className="w-4 h-4" /> Sin Programar</span>
                      <span className="bg-gray-200/60 px-2 py-0.5 rounded-lg text-xs">{statusGroups.sin_programar.length}</span>
                    </div>
                    {statusGroups.sin_programar.length === 0 ? (
                      <p className="text-xs text-gray-500 font-medium italic">Todas las sucursales tienen estatus</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {statusGroups.sin_programar.map((b) => (
                          <span key={b.id} className="text-xs bg-white text-gray-800 border border-gray-200/80 px-2 py-0.5 rounded-md font-semibold">
                            {b.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Columna de Reporte de Insumos */}
            <div className="rounded-2xl p-5 border border-gray-200/80 bg-white shadow-lg flex flex-col h-full">
              <h3 className="font-bold text-base text-gray-950 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-5 rounded-full bg-emerald-500 inline-block" />
                Insumos de {getMonthName(selectedMonth)}
              </h3>
              
              {monthCosts.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-10 text-gray-400">
                  <DollarSign className="w-10 h-10 mb-2 opacity-50 text-gray-300" />
                  <p className="text-xs font-semibold">Sin gastos de insumos registrados</p>
                </div>
              ) : (
                <div className="space-y-2 overflow-y-auto max-h-[300px] pr-1">
                  {monthCosts.map((c) => {
                    const branchName = state.branches.find(b => b.id === c.branchId)?.name || 'Sucursal';
                    return (
                      <div key={c.id} className="p-2.5 rounded-xl border border-gray-100 bg-gray-50/50 flex justify-between items-center text-xs">
                        <div className="space-y-1">
                          <p className="font-bold text-gray-900 leading-tight">{c.material}</p>
                          <p className="text-[10px] text-gray-500 font-medium">{branchName} • Cant: {c.quantity}</p>
                        </div>
                        <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-1 rounded-lg">
                          ${(c.quantity * c.unitCost).toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })()}

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
