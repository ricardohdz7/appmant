"use client";

import { useMaintenanceContext } from "@/lib/MaintenanceContext";
import { Button } from "@/components/ui/button";
import { Download, Plus, Trash2, Upload, FileText, Calendar, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { downloadCSV } from "@/lib/exportUtils";
import { exportPlanningToExcel, importPlanningFromExcel, downloadPlanningTemplate } from "@/lib/excelUtils";
import { calculateKPIs, getMonthName } from "@/lib/kpiCalculations";
import { KPIDashboard } from "@/components/KPIDashboard";
import { formatDate } from "@/lib/dateUtils";
import { useState, useRef } from "react";

function parseDateSafely(dateVal: any): Date {
  if (!dateVal) return new Date(0);
  if (dateVal instanceof Date) return dateVal;
  
  const str = String(dateVal).trim();
  const d = new Date(str);
  if (!isNaN(d.getTime())) return d;
  
  const match = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (match) {
    const [, day, month, year] = match;
    const parsed = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(parsed.getTime())) return parsed;
  }
  
  return new Date(0);
}

interface PlanningTabProps {
  readOnly?: boolean;
}

export function PlanningTab({ readOnly }: PlanningTabProps) {
  const { state, dispatch } = useMaintenanceContext();
  const [newDate, setNewDate] = useState("");
  const [newResponsible, setNewResponsible] = useState("");
  const [selectedBranch, setSelectedBranch] = useState(state.branches[0]?.id || "");
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState("");
  const [editingDateId, setEditingDateId] = useState<string | null>(null);
  const [editingDateValue, setEditingDateValue] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleSort = () => {
    setSortOrder((prev) => {
      if (prev === null) return "asc";
      if (prev === "asc") return "desc";
      return null;
    });
  };

  const [monthFilter, setMonthFilter] = useState<number | null>(null);

  const filteredPlanningEntries = state.planningEntries.filter((p) => {
    if (monthFilter === null) return true;
    const dateObj = parseDateSafely(p.scheduledDate);
    return dateObj.getMonth() === monthFilter;
  });

  const totalPlanned = filteredPlanningEntries.length;
  const readyPlanned = filteredPlanningEntries.filter((p) => p.advanceStatus === "listo").length;
  const inProgressPlanned = filteredPlanningEntries.filter((p) => p.advanceStatus === "en_proceso").length;
  const pendingPlanned = filteredPlanningEntries.filter((p) => p.advanceStatus === "pendiente").length;
  const finalizedPlanned = filteredPlanningEntries.filter((p) => p.advanceStatus === "finalizado").length;

  const planningKPIs = [
    {
      label: "Total Planeaciones",
      value: totalPlanned,
      color: "blue" as const
    },
    {
      label: "Planeaciones Finalizadas",
      value: finalizedPlanned,
      total: totalPlanned,
      percentage: totalPlanned > 0 ? Math.round((finalizedPlanned / totalPlanned) * 100) : 0,
      color: "purple" as const
    },
    {
      label: "Planeaciones Listas",
      value: readyPlanned,
      total: totalPlanned,
      percentage: totalPlanned > 0 ? Math.round((readyPlanned / totalPlanned) * 100) : 0,
      color: "green" as const
    },
    {
      label: "Planeaciones en Proceso",
      value: inProgressPlanned,
      total: totalPlanned,
      percentage: totalPlanned > 0 ? Math.round((inProgressPlanned / totalPlanned) * 100) : 0,
      color: "blue" as const
    },
    {
      label: "Planeaciones Pendientes",
      value: pendingPlanned,
      total: totalPlanned,
      percentage: totalPlanned > 0 ? Math.round((pendingPlanned / totalPlanned) * 100) : 0,
      color: "red" as const
    }
  ];

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

  // Crear mapa de sucursales para el Excel
  const branchesMap = state.branches.reduce(
    (acc, branch) => {
      acc[branch.id] = branch.name;
      return acc;
    },
    {} as Record<string, string>
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

  const handleExportExcel = () => {
    exportPlanningToExcel(state.planningEntries, branchesMap);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleEditDate = (entryId: string, currentDate: Date) => {
    setEditingDateId(entryId);
    // Convertir Date a formato YYYY-MM-DD para el input
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    setEditingDateValue(`${year}-${month}-${day}`);
  };

  const handleSaveDate = (entryId: string) => {
    if (!editingDateValue) {
      return;
    }
    
    const entry = state.planningEntries.find(p => p.id === entryId);
    if (entry) {
      const newDate = new Date(editingDateValue + 'T00:00:00');
      const updatedPayload = { 
        ...entry, 
        scheduledDate: newDate,
        id: entry.id,
        branchId: entry.branchId,
        technicalResponsible: entry.technicalResponsible,
        advanceStatus: entry.advanceStatus,
        newInterventionDate: entry.newInterventionDate,
        observations: entry.observations,
      };
      dispatch({
        type: "UPDATE_PLANNING_ENTRY",
        payload: updatedPayload,
      });
    }
    setEditingDateId(null);
    setEditingDateValue("");
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportError("");

    try {
      const entries = await importPlanningFromExcel(file, branchesMap);
      
      // Agregar o actualizar cada entrada
      entries.forEach((entry) => {
        if (entry.id && entry.branchId && entry.scheduledDate && entry.technicalResponsible && entry.advanceStatus) {
          const exists = state.planningEntries.some(p => p.id === entry.id);
          if (exists) {
            dispatch({
              type: "UPDATE_PLANNING_ENTRY",
              payload: {
                id: entry.id,
                branchId: entry.branchId,
                scheduledDate: entry.scheduledDate,
                technicalResponsible: entry.technicalResponsible,
                advanceStatus: entry.advanceStatus,
              },
            });
          } else {
            dispatch({
              type: "ADD_PLANNING_ENTRY",
              payload: {
                id: entry.id,
                branchId: entry.branchId,
                scheduledDate: entry.scheduledDate,
                technicalResponsible: entry.technicalResponsible,
                advanceStatus: entry.advanceStatus,
              },
            });
          }
        }
      });

      // Limpiar input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      alert("Planeaciones importadas y actualizadas exitosamente");
    } catch (error) {
      setImportError(error instanceof Error ? error.message : "Error al importar el archivo");
    } finally {
      setIsImporting(false);
    }
  };

  const inputClass = "px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 font-medium bg-white placeholder-gray-400 focus:ring-2 focus:ring-blue-300 focus:border-blue-300 focus:outline-none transition-all";
  const handlePrintPlanning = () => {
    // Build rows grouped by enterprise-brand
    let tableRows = "";
    Object.entries(grouped).forEach(([group, branches]) => {
      tableRows += `<tr><td colspan="3" style="background:#eff6ff;border-left:4px solid #2563eb;padding:10px 14px;font-weight:bold;font-size:14px;color:#1e3a5f;">${group}</td></tr>`;
      tableRows += `<tr style="background:#f8fafc;"><th style="padding:8px 14px;text-align:left;font-size:11px;text-transform:uppercase;color:#475569;border-bottom:2px solid #e2e8f0;">Sucursal</th><th style="padding:8px 14px;text-align:left;font-size:11px;text-transform:uppercase;color:#475569;border-bottom:2px solid #e2e8f0;">Fecha</th><th style="padding:8px 14px;text-align:left;font-size:11px;text-transform:uppercase;color:#475569;border-bottom:2px solid #e2e8f0;">Nueva Fecha</th><th style="padding:8px 14px;text-align:left;font-size:11px;text-transform:uppercase;color:#475569;border-bottom:2px solid #e2e8f0;">Responsable</th><th style="padding:8px 14px;text-align:left;font-size:11px;text-transform:uppercase;color:#475569;border-bottom:2px solid #e2e8f0;">Observaciones</th></tr>`;
      
      const rows = branches.flatMap((branch) =>
        filteredPlanningEntries
          .filter((p) => p.branchId === branch.id)
          .map((entry) => ({ branch, entry }))
      ).sort((a, b) => {
        const dateA = parseDateSafely(a.entry.scheduledDate).getTime();
        const dateB = parseDateSafely(b.entry.scheduledDate).getTime();
        return dateA - dateB;
      });

      rows.forEach(({ branch, entry }, idx) => {
        const bg = idx % 2 === 0 ? "#ffffff" : "#f8fafc";
        const dateStr = formatDate(entry.scheduledDate);
        const newDateStr = entry.newInterventionDate ? formatDate(entry.newInterventionDate) : "-";
        const obsStr = entry.observations || "-";
        tableRows += `<tr style="background:${bg};"><td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;font-size:13px;font-weight:600;">${branch.name}</td><td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;font-size:13px;">${dateStr}</td><td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;font-size:13px;">${newDateStr}</td><td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;font-size:13px;">${entry.technicalResponsible}</td><td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;font-size:13px;">${obsStr}</td></tr>`;
      });
    });

    const printContent = `<!DOCTYPE html>
<html><head><title>Planeación de Mantenimiento ${state.currentYear}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; padding: 30px; }
  .header { text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #2563eb; }
  .header h1 { font-size: 20px; color: #1e3a5f; margin-bottom: 4px; }
  .header p { font-size: 12px; color: #64748b; }
  .header h2 { font-size: 16px; color: #334155; margin-top: 8px; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  @media print { body { padding: 15px; } }
</style></head><body>
<div class="header">
  <h1>Control de Mantenimiento Preventivo</h1>
  <p>Casa Muñoz S.A. • Beauty Hub S.A.</p>
  <h2>Planeación de Mantenimiento ${monthFilter !== null ? `(${getMonthName(monthFilter)} - ${state.currentYear})` : `(${state.currentYear})`}</h2>
</div>
<table>${tableRows}</table>
<script>window.onload = function() { window.print(); }</script>
</body></html>`;

    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
    }
  };

  return (
    <div className="space-y-5">
      {/* Cabecera exclusiva para impresión PDF */}
      <div className="hidden print:block text-center pb-4 border-b border-gray-300">
        <h1 className="text-2xl font-bold text-blue-900">Control de Mantenimiento Preventivo</h1>
        <p className="text-xs text-gray-500 font-medium">Casa Muñoz S.A. • Beauty Hub S.A.</p>
        <h2 className="text-lg font-bold text-gray-800 mt-2">Planeación de Mantenimiento {monthFilter !== null ? `(${getMonthName(monthFilter)} - ${state.currentYear})` : `(${state.currentYear})`}</h2>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 print:hidden">Planeación</h2>
        <div className="flex gap-2 flex-wrap print:hidden">
          <Button 
            onClick={handlePrintPlanning} 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2 rounded-xl border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all font-semibold"
          >
            <FileText className="w-4 h-4" />
            Imprimir / PDF
          </Button>
          {!readOnly && (
            <>
              <Button 
                onClick={() => downloadPlanningTemplate(state.branches, state.planningEntries)}
                variant="outline" 
                size="sm"
                className={"flex items-center gap-2 rounded-xl border-gray-300 hover:bg-blue-50 hover:border-blue-300 transition-all"}
              >
                <FileText className="w-4 h-4" />
                Descargar Plantilla
              </Button>
              <Button 
                onClick={handleImportClick}
                disabled={isImporting}
                variant="outline" 
                size="sm"
                className={"flex items-center gap-2 rounded-xl border-gray-300 hover:bg-blue-50 hover:border-blue-300 transition-all"}
              >
                <Upload className="w-4 h-4" />
                {isImporting ? "Importando..." : "Importar Excel"}
              </Button>
              <Button 
                onClick={handleExportExcel}
                variant="outline" 
                size="sm"
                className={"flex items-center gap-2 rounded-xl border-gray-300 hover:bg-blue-50 hover:border-blue-300 transition-all"}
              >
                <Download className="w-4 h-4" />
                Exportar Excel
              </Button>
              <Button 
                onClick={() => downloadCSV(state)} 
                variant="outline" 
                size="sm"
                className={"flex items-center gap-2 rounded-xl border-gray-300 hover:bg-blue-50 hover:border-blue-300 transition-all"}
              >
                <Download className="w-4 h-4" />
                Exportar CSV
              </Button>
            </>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="hidden"
          aria-label="Importar archivo Excel"
        />
      </div>

      {importError && (
        <div className="rounded-2xl p-4 border border-red-200" style={{ background: "linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)" }}>
          <p className="text-red-800 font-bold">Error al importar:</p>
          <p className="text-red-700 text-sm mt-1">{importError}</p>
        </div>
      )}

      {/* Segmentador de Meses */}
      <div className="bg-gray-100/80 p-1.5 rounded-2xl flex gap-1 border border-gray-200/50 max-w-xl print:hidden">
        {[
          { label: "Consolidado (Todos)", value: null },
          { value: 0, label: "Enero" },
          { value: 3, label: "Abril" },
          { value: 6, label: "Julio" },
          { value: 9, label: "Octubre" }
        ].map((opt) => (
          <button
            key={opt.label}
            onClick={() => setMonthFilter(opt.value)}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all duration-200 ${
              monthFilter === opt.value
                ? "bg-white text-blue-700 shadow-sm border border-gray-200/40"
                : "text-gray-600 hover:bg-white/40 hover:text-gray-900"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="print:hidden">
        <KPIDashboard kpis={planningKPIs} />
      </div>

      {!readOnly && (
        <div className="rounded-2xl shadow-lg p-6 space-y-4 bg-white border border-gray-200/80 print:hidden">
          <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
            <span className="w-1.5 h-5 rounded-full bg-blue-500 inline-block" />
            Agregar Planeación
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className={inputClass}
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
              className={inputClass}
            />
            <input
              type="text"
              placeholder="Responsable"
              value={newResponsible}
              onChange={(e) => setNewResponsible(e.target.value)}
              className={inputClass}
            />
            <Button onClick={handleAddPlanning} size="sm" className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200 transition-all">
              <Plus className="w-4 h-4" />
              Agregar
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-5">
        {Object.entries(grouped).map(([group, branches]) => (
          <div key={group} className="rounded-2xl shadow-lg overflow-hidden border border-gray-200/80 bg-white">
            <div
              className="px-5 py-3.5 border-l-4 border-blue-600"
              style={{ background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)" }}
            >
              <h3 className="font-bold text-base text-blue-900">{group}</h3>
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100/60">
                  <th className="px-4 py-3.5 text-left font-bold text-gray-700 uppercase text-[11px] tracking-wider">Sucursal</th>
                  <th 
                    className="px-4 py-3.5 text-left font-bold text-gray-700 cursor-pointer select-none hover:bg-gray-100 transition-colors uppercase text-[11px] tracking-wider"
                    onClick={toggleSort}
                  >
                    <div className="flex items-center gap-1">
                      Fecha
                      {sortOrder === "asc" ? (
                        <ArrowUp className="w-3.5 h-3.5 text-blue-600" />
                      ) : sortOrder === "desc" ? (
                        <ArrowDown className="w-3.5 h-3.5 text-blue-600" />
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 opacity-50" />
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3.5 text-left font-bold text-gray-700 uppercase text-[11px] tracking-wider">Nueva Fecha Intervención</th>
                  <th className="px-4 py-3.5 text-left font-bold text-gray-700 uppercase text-[11px] tracking-wider">Responsable</th>
                  <th className="px-4 py-3.5 text-left font-bold text-gray-700 uppercase text-[11px] tracking-wider">Observaciones</th>
                  <th className="px-4 py-3.5 text-left font-bold text-gray-700 uppercase text-[11px] tracking-wider print:hidden">Estado</th>
                  {!readOnly && <th className="px-4 py-3.5 text-center font-bold text-gray-700 uppercase text-[11px] tracking-wider print:hidden">Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {branches
                  .flatMap((branch) =>
                    filteredPlanningEntries
                      .filter((p) => p.branchId === branch.id)
                      .map((entry) => ({ branch, entry }))
                  )
                  .sort((a, b) => {
                    if (!sortOrder) return 0;
                    const dateA = parseDateSafely(a.entry.scheduledDate).getTime();
                    const dateB = parseDateSafely(b.entry.scheduledDate).getTime();
                    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
                  })
                  .map(({ branch, entry }, idx) => (
                    <tr
                      key={entry.id}
                      className={`border-b border-gray-100 hover:bg-blue-50/40 transition-colors ${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                      }`}
                    >
                      <td className="px-4 py-3 text-gray-900 font-semibold">{branch.name}</td>
                      <td className="px-4 py-3 text-gray-900 font-medium">
                        {readOnly ? (
                          <span>{formatDate(entry.scheduledDate)}</span>
                        ) : editingDateId === entry.id ? (
                          <div className="flex gap-2 items-center flex-wrap">
                            <input
                              type="date"
                              value={editingDateValue}
                              onChange={(e) => {
                                setEditingDateValue(e.target.value);
                              }}
                              className="px-2 py-1.5 border border-blue-300 rounded-lg text-xs text-gray-900 font-medium bg-white focus:ring-2 focus:ring-blue-300 focus:outline-none"
                            />
                            <button
                              onClick={() => handleSaveDate(entry.id)}
                              className="text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 font-bold text-sm px-2 py-1 rounded-lg transition-colors"
                            >
                              Guardar
                            </button>
                            <button
                              onClick={() => {
                                setEditingDateId(null);
                                setEditingDateValue("");
                              }}
                              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 font-bold text-sm px-2 py-1 rounded-lg transition-colors"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2 items-center">
                            <span>{formatDate(entry.scheduledDate)}</span>
                            <button
                              onClick={() => handleEditDate(entry.id, entry.scheduledDate)}
                              className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-1 rounded-lg transition-colors print:hidden"
                              title="Editar fecha"
                            >
                              <Calendar className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-900 font-medium">
                        {readOnly ? (
                          <span>{entry.newInterventionDate ? formatDate(entry.newInterventionDate) : "-"}</span>
                        ) : (
                          <input
                            type="date"
                            value={entry.newInterventionDate ? new Date(entry.newInterventionDate).toISOString().split('T')[0] : ""}
                            onChange={(e) => {
                              const newDate = e.target.value ? new Date(e.target.value + 'T00:00:00') : null;
                              dispatch({
                                type: "UPDATE_PLANNING_ENTRY",
                                payload: { ...entry, newInterventionDate: newDate },
                              });
                            }}
                            className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-900 font-medium bg-white focus:ring-2 focus:ring-blue-300 focus:outline-none"
                          />
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-900 font-medium">{entry.technicalResponsible}</td>
                      <td className="px-4 py-3 text-gray-900 font-medium">
                        {readOnly ? (
                          <span className="break-words max-w-[200px] block">{entry.observations || "-"}</span>
                        ) : (
                          <input
                            type="text"
                            placeholder="Observaciones..."
                            value={entry.observations || ""}
                            onChange={(e) => {
                              dispatch({
                                type: "UPDATE_PLANNING_ENTRY",
                                payload: { ...entry, observations: e.target.value },
                              });
                            }}
                            className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-900 font-medium bg-white focus:ring-2 focus:ring-blue-300 focus:outline-none w-full min-w-[150px]"
                          />
                        )}
                      </td>
                      <td className="px-4 py-3 print:hidden">
                        {readOnly ? (
                          <span className={`inline-block px-2.5 py-1.5 rounded-lg text-xs font-bold border ${
                            entry.advanceStatus === "finalizado"
                              ? "bg-purple-50 text-purple-800 border-purple-300"
                              : entry.advanceStatus === "listo"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                              : entry.advanceStatus === "en_proceso"
                              ? "bg-blue-50 text-blue-800 border-blue-300"
                              : "bg-red-50 text-red-800 border-red-300"
                          }`}>
                            {entry.advanceStatus === "finalizado" ? "Finalizado" : entry.advanceStatus === "listo" ? "Listo" : entry.advanceStatus === "en_proceso" ? "En Proceso" : "Pendiente"}
                          </span>
                        ) : (
                          <select
                            value={entry.advanceStatus}
                            onChange={(e) => {
                              dispatch({
                                type: "UPDATE_PLANNING_ENTRY",
                                payload: { ...entry, advanceStatus: e.target.value as any },
                              });
                            }}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer border transition-all focus:ring-2 focus:ring-blue-300 focus:outline-none ${
                              entry.advanceStatus === "finalizado"
                                ? "bg-purple-50 text-purple-800 border-purple-300"
                                : entry.advanceStatus === "listo"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                : entry.advanceStatus === "en_proceso"
                                ? "bg-blue-50 text-blue-800 border-blue-300"
                                : "bg-red-50 text-red-800 border-red-300"
                            }`}
                          >
                            <option value="pendiente">Pendiente</option>
                            <option value="en_proceso">En Proceso</option>
                            <option value="listo">Listo</option>
                            <option value="finalizado">Finalizado</option>
                          </select>
                        )}
                      </td>
                      {!readOnly && (
                        <td className="px-4 py-3 text-center print:hidden">
                          <button
                            onClick={() => dispatch({ type: "DELETE_PLANNING_ENTRY", payload: entry.id })}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
