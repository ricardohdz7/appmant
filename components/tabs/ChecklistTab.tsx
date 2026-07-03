"use client";

import { useMaintenanceContext } from "@/lib/MaintenanceContext";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CHECKLIST_CATEGORIES } from "@/lib/checklistTasks";
import { 
  CheckCircle2, 
  XCircle, 
  MinusCircle, 
  Trash2, 
  Printer, 
  Search, 
  CheckSquare, 
  AlertCircle,
  FileText
} from "lucide-react";

const MAINTENANCE_MONTHS = [
  { value: 0, label: "Enero" },
  { value: 3, label: "Abril" },
  { value: 6, label: "Julio" },
  { value: 9, label: "Octubre" }
];

interface ChecklistTabProps {
  readOnly?: boolean;
}

export function ChecklistTab({ readOnly }: ChecklistTabProps) {
  const { state, dispatch } = useMaintenanceContext();
  
  const [selectedBranch, setSelectedBranch] = useState(state.branches[0]?.id || "");
  const [selectedMonth, setSelectedMonth] = useState<number>(0); // Default Enero
  const [searchQuery, setSearchQuery] = useState("");

  const activeBranch = state.branches.find(b => b.id === selectedBranch);

  // Filter checklist entries for the active branch, year, and month
  const currentEntries = state.checklistEntries.filter(
    (c) =>
      c.branchId === selectedBranch &&
      c.year === state.currentYear &&
      c.month === selectedMonth
  );

  // Derive responsible person from planning or calendar
  const planningEntry = state.planningEntries.find(
    (p) =>
      p.branchId === selectedBranch &&
      new Date(p.scheduledDate).getFullYear() === state.currentYear &&
      new Date(p.scheduledDate).getMonth() === selectedMonth
  );

  const calendarEntry = state.calendarEntries.find(
    (e) =>
      e.branchId === selectedBranch &&
      e.year === state.currentYear &&
      e.month === selectedMonth
  );

  const responsible =
    planningEntry?.technicalResponsible ||
    calendarEntry?.responsible ||
    "Soporte Técnico / Sistemas";

  // Get status of a specific task
  const getTaskStatus = (taskKey: string): string => {
    const entry = currentEntries.find((c) => c.taskKey === taskKey);
    return entry?.status || "";
  };

  // Set status for a single task
  const handleSetStatus = (taskKey: string, status: "Realizado" | "No realizado" | "No aplica") => {
    const existing = currentEntries.find((c) => c.taskKey === taskKey);
    const payload = {
      id: existing?.id || `ch-${Date.now()}-${taskKey}-${Math.random().toString(36).substring(2, 5)}`,
      branchId: selectedBranch,
      year: state.currentYear,
      month: selectedMonth,
      taskKey,
      status
    };
    dispatch({ type: "UPDATE_CHECKLIST_ENTRY", payload });
  };

  // Bulk update all tasks
  const handleBulkUpdate = (status: "Realizado" | "No realizado" | "No aplica") => {
    const entries = CHECKLIST_CATEGORIES.flatMap((cat) => 
      cat.tasks.map((task) => ({
        id: `ch-${Date.now()}-${task.key}-${Math.random().toString(36).substring(2, 5)}`,
        branchId: selectedBranch,
        year: state.currentYear,
        month: selectedMonth,
        taskKey: task.key,
        status
      }))
    );
    dispatch({
      type: "BULK_UPDATE_CHECKLIST",
      payload: {
        branchId: selectedBranch,
        year: state.currentYear,
        month: selectedMonth,
        entries
      }
    });
  };

  // Clear all entries for this month/branch
  const handleClear = () => {
    if (confirm("¿Estás seguro de que deseas limpiar todas las respuestas del checklist para esta sucursal y mes?")) {
      dispatch({
        type: "CLEAR_CHECKLIST",
        payload: {
          branchId: selectedBranch,
          year: state.currentYear,
          month: selectedMonth
        }
      });
    }
  };

  // Calculate compliance statistics
  const totalTasks = CHECKLIST_CATEGORIES.reduce((acc, cat) => acc + cat.tasks.length, 0);
  const completedCount = currentEntries.filter(e => e.status === "Realizado").length;
  const failedCount = currentEntries.filter(e => e.status === "No realizado").length;
  const naCount = currentEntries.filter(e => e.status === "No aplica").length;
  const answeredCount = completedCount + failedCount + naCount;
  const compliancePct = answeredCount > 0 ? Math.round((completedCount / (totalTasks - naCount || 1)) * 100) : 0;

  const getMonthName = (monthNum: number): string => {
    const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    return months[monthNum] || `Mes ${monthNum}`;
  };

  // CSS classes
  const inputClass = "px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 font-medium bg-white placeholder-gray-400 focus:ring-2 focus:ring-blue-300 focus:border-blue-300 focus:outline-none transition-all";

  return (
    <div className="space-y-6">
      {/* SECTION 1: INTERACTIVE CONTROLS (HIDDEN WHEN PRINTING) */}
      <div className="space-y-4 print:hidden">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Checklist de Mantenimiento</h2>
            <p className="text-xs text-gray-500 mt-1">Actividades de mantenimiento preventivo aplicadas por sucursal</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => window.print()}
              className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200 transition-all"
            >
              <Printer className="w-4 h-4" />
              Descargar PDF / Imprimir
            </Button>
          </div>
        </div>

        {/* Filters Panel */}
        <div className="rounded-2xl shadow-lg p-5 bg-white border border-gray-200/80 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Branch Selector */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 uppercase">Sucursal</label>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className={inputClass}
              >
                {state.branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name} ({branch.brand})
                  </option>
                ))}
              </select>
            </div>

            {/* Month Selector in Dropdown for quick change */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 uppercase">Mes de Mantenimiento</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className={inputClass}
              >
                {MAINTENANCE_MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Task */}
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-xs font-semibold text-gray-500 uppercase">Buscar Tarea</label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Escribe para buscar una actividad..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`${inputClass} pl-10 w-full`}
                />
              </div>
            </div>
          </div>

          {/* Month Segmenter (matching GanttTab design) */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-gray-100">
            <div className="bg-gray-100/80 p-1 rounded-xl flex gap-1 border border-gray-200/50 w-full sm:w-auto sm:max-w-md">
              {MAINTENANCE_MONTHS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSelectedMonth(opt.value)}
                  className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-lg transition-all duration-200 ${
                    selectedMonth === opt.value
                      ? "bg-white text-blue-700 shadow-sm border border-gray-200/40"
                      : "text-gray-600 hover:bg-white/40 hover:text-gray-900"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Bulk actions and clean actions */}
            {!readOnly && (
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkUpdate("Realizado")}
                  className="text-emerald-700 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 rounded-lg text-xs"
                >
                  <CheckSquare className="w-3.5 h-3.5 mr-1" /> Marcar Todo Realizado
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkUpdate("No aplica")}
                  className="text-gray-700 border-gray-200 hover:bg-gray-50 rounded-lg text-xs"
                >
                  Marcar Todo N/A
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClear}
                  className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 rounded-lg text-xs"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Limpiar Respuestas
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Statistics Dashboard Card */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">Cumplimiento</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-blue-700">{compliancePct}%</span>
              <span className="text-[10px] text-gray-500 font-semibold">({completedCount} de {totalTasks - naCount} tareas)</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
              <div 
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${compliancePct}%` }}
              />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm">
            <span className="text-xs font-bold text-gray-500 uppercase">Realizados</span>
            <div className="text-3xl font-extrabold text-emerald-600 mt-2 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6" /> {completedCount}
            </div>
            <span className="text-[10px] text-gray-400 font-medium">Actividades completadas</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm">
            <span className="text-xs font-bold text-gray-500 uppercase">No Realizados</span>
            <div className="text-3xl font-extrabold text-red-600 mt-2 flex items-center gap-2">
              <XCircle className="w-6 h-6" /> {failedCount}
            </div>
            <span className="text-[10px] text-gray-400 font-medium">Actividades pendientes / fallidas</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm">
            <span className="text-xs font-bold text-gray-500 uppercase">Avance Contestado</span>
            <div className="text-3xl font-extrabold text-gray-700 mt-2 flex items-center gap-2">
              <FileText className="w-6 h-6 text-gray-500" /> {answeredCount} / {totalTasks}
            </div>
            <span className="text-[10px] text-gray-400 font-medium">{totalTasks - answeredCount} sin responder</span>
          </div>
        </div>

        {/* Tasks List Categories */}
        <div className="space-y-6">
          {CHECKLIST_CATEGORIES.map((category) => {
            // Filter tasks based on search
            const filteredTasks = category.tasks.filter((t) =>
              t.description.toLowerCase().includes(searchQuery.toLowerCase())
            );

            if (filteredTasks.length === 0) return null;

            return (
              <div key={category.title} className="bg-white rounded-2xl shadow-lg border border-gray-200/80 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100/60 px-5 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="font-extrabold text-gray-900 text-sm flex items-center gap-2">
                    <span className="w-1.5 h-4 rounded-full bg-blue-600" />
                    {category.title}
                  </h3>
                  <span className="text-[10px] font-bold text-gray-500 bg-gray-200/50 px-2 py-0.5 rounded-full">
                    {filteredTasks.length} Actividades
                  </span>
                </div>

                <div className="divide-y divide-gray-100">
                  {filteredTasks.map((task) => {
                    const status = getTaskStatus(task.key);
                    return (
                      <div key={task.key} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                        <div className="text-xs font-semibold text-gray-800 flex-1">
                          {task.description}
                        </div>

                        {/* Interactive status selectors */}
                        <div className="flex gap-1.5">
                          {readOnly ? (
                            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${
                              status === "Realizado"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                                : status === "No realizado"
                                ? "bg-red-50 text-red-700 border-red-300"
                                : status === "No aplica"
                                ? "bg-gray-100 text-gray-700 border-gray-300"
                                : "bg-gray-50 text-gray-400 border-gray-200"
                            }`}>
                              {status === "Realizado" && <CheckCircle2 className="w-3.5 h-3.5" />}
                              {status === "No realizado" && <XCircle className="w-3.5 h-3.5" />}
                              {status === "No aplica" && <MinusCircle className="w-3.5 h-3.5" />}
                              {status || "Sin respuesta"}
                            </span>
                          ) : (
                            <>
                              <button
                                onClick={() => handleSetStatus(task.key, "Realizado")}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                  status === "Realizado"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm"
                                    : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-gray-700"
                                }`}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Realizado
                              </button>

                              <button
                                onClick={() => handleSetStatus(task.key, "No realizado")}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                  status === "No realizado"
                                    ? "bg-red-50 text-red-700 border-red-300 shadow-sm"
                                    : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-gray-700"
                                }`}
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                No realizado
                              </button>

                              <button
                                onClick={() => handleSetStatus(task.key, "No aplica")}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                  status === "No aplica"
                                    ? "bg-gray-100 text-gray-700 border-gray-300 shadow-sm"
                                    : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-gray-700"
                                }`}
                              >
                                <MinusCircle className="w-3.5 h-3.5" />
                                N/A
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: PRINT-ONLY LAYOUT (REPLICATES USER PDF DESIGN) */}
      <div className="hidden print:block font-serif text-black p-4 w-full bg-white leading-normal" style={{ fontSize: "10pt" }}>
        {/* PDF Header block */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="font-bold text-blue-900 tracking-wide text-base uppercase">CASA MUÑOZ, S.A. DE C.V.</div>
            <div className="text-gray-600 font-semibold text-[9pt]">Área de Sistemas / Soporte TI</div>
          </div>
        </div>

        {/* Heavy blue separator line */}
        <div className="border-t-3 border-blue-800 my-3" />

        {/* Centered Document Title */}
        <div className="text-center my-3">
          <div className="font-extrabold text-blue-900 text-lg tracking-wider">CHECKLIST DE MANTENIMIENTO PREVENTIVO</div>
          <div className="text-[8pt] text-gray-500 italic mt-0.5">Actividades a replicar en las demás sucursales</div>
        </div>

        {/* Metadata Details Grid */}
        <div className="grid grid-cols-2 gap-3 border border-gray-400 p-3 rounded-lg text-[9pt] font-semibold my-4 bg-gray-50/10 font-sans">
          <div>
            <span className="text-gray-500 font-bold uppercase mr-1">Sucursal:</span>
            <span className="text-gray-900 font-extrabold">{activeBranch?.name || "No seleccionada"}</span>
          </div>
          <div>
            <span className="text-gray-500 font-bold uppercase mr-1">Periodo:</span>
            <span className="text-gray-900 font-extrabold">{getMonthName(selectedMonth).toUpperCase()} {state.currentYear}</span>
          </div>
          <div>
            <span className="text-gray-500 font-bold uppercase mr-1">Empresa / Marca:</span>
            <span className="text-gray-800">{activeBranch?.enterprise} / {activeBranch?.brand}</span>
          </div>
          <div>
            <span className="text-gray-500 font-bold uppercase mr-1">Responsable Técnico:</span>
            <span className="text-gray-900 font-extrabold">{responsible}</span>
          </div>
        </div>

        {/* Checklist tasks in columns matching template layout */}
        <div className="space-y-4">
          {CHECKLIST_CATEGORIES.map((category) => (
            <div key={category.title} className="break-inside-avoid">
              {/* Category Underlined Header */}
              <h4 className="font-extrabold text-blue-900 border-b-2 border-blue-800/60 pb-0.5 mb-2 mt-4 text-[10pt] uppercase tracking-wide">
                {category.title}
              </h4>
              
              {/* Category Tasks List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5 pl-1">
                {category.tasks.map((task) => {
                  const status = getTaskStatus(task.key);
                  let boxChar = "☐"; // Default empty box
                  let statusLabel = "";

                  if (status === "Realizado") {
                    boxChar = "☑";
                    statusLabel = " (Realizado)";
                  } else if (status === "No realizado") {
                    boxChar = "☒";
                    statusLabel = " (No realizado)";
                  } else if (status === "No aplica") {
                    boxChar = "☐";
                    statusLabel = " (N/A)";
                  }

                  return (
                    <div key={task.key} className="flex items-start gap-2 py-0.5 text-[9pt]">
                      <span className="text-[11pt] leading-none font-sans font-medium">{boxChar}</span>
                      <span className="text-gray-900">
                        {task.description}
                        {statusLabel && <span className="font-bold text-[8pt] text-gray-600 font-sans">{statusLabel}</span>}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* PDF Legend info */}
        <div className="text-[7pt] text-gray-500 italic mt-6 border-t border-gray-200 pt-2 flex justify-between font-sans">
          <span>* Simbología: ☑ Realizado | ☒ No Realizado | ☐ No Aplica / Pendiente</span>
          <span>Impreso el {new Date().toLocaleDateString("es-ES")}</span>
        </div>

        {/* Signatures block */}
        <div className="grid grid-cols-2 gap-10 mt-14 pt-6 text-center font-sans break-inside-avoid">
          <div className="flex flex-col items-center">
            <div className="w-56 border-b border-black my-1" />
            <span className="font-bold text-[9pt] text-gray-800">Firma Soporte TI</span>
            <span className="text-[7.5pt] text-gray-500">Sistemas / Soporte</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-56 border-b border-black my-1" />
            <span className="font-bold text-[9pt] text-gray-800">Firma Responsable Sucursal</span>
            <span className="text-[7.5pt] text-gray-500">Gerencia / Administración</span>
          </div>
        </div>
      </div>
    </div>
  );
}
