"use client";

import { useState } from "react";
import { useMaintenanceContext } from "@/lib/MaintenanceContext";
import { User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { CHECKLIST_CATEGORIES } from "@/lib/checklistTasks";
import { 
  Building, 
  LogOut, 
  ChevronLeft, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  ShieldAlert, 
  Clock, 
  ClipboardCheck, 
  Printer, 
  XCircle, 
  User as UserIcon 
} from "lucide-react";
import { formatDate } from "@/lib/dateUtils";
import { TicketsTab } from "./tabs/TicketsTab";

interface ManagementDashboardProps {
  currentUser: User;
  onLogout: () => void;
}

const SECTOR_MONTHS = [
  { value: 0, label: "Enero" },
  { value: 3, label: "Abril" },
  { value: 6, label: "Julio" },
  { value: 9, label: "Octubre" }
];

export function ManagementDashboard({ currentUser, onLogout }: ManagementDashboardProps) {
  const { state } = useMaintenanceContext();
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number>(0); // Default Enero
  const [activeTab, setActiveTab] = useState<"general" | "tickets">("general");

  const getMonthName = (monthNum: number): string => {
    const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    return months[monthNum] || `Mes ${monthNum}`;
  };

  const totalTasks = CHECKLIST_CATEGORIES.reduce((acc, cat) => acc + cat.tasks.length, 0);

  // --- LIST VIEW (CARDS) ---
  if (!selectedBranchId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-slate-100 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-40 shadow-md bg-gradient-to-r from-emerald-900 to-emerald-800 print:hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-500/20">
                  <ShieldAlert className="w-5.5 h-5.5" />
                </div>
                <div>
                  <h1 className="text-lg font-extrabold text-white leading-tight">
                    Administración General
                  </h1>
                  <p className="text-[10px] text-emerald-200 font-semibold uppercase tracking-wider mt-0.5">
                    Vista de Cumplimiento de Sucursales
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <span className="text-[10px] text-emerald-300 font-bold block uppercase">Perfil</span>
                  <span className="text-xs text-white font-extrabold">{currentUser.username}</span>
                </div>
                <Button
                  onClick={onLogout}
                  variant="outline"
                  size="sm"
                  className="text-red-400 hover:text-red-300 border-red-500/30 hover:bg-red-500/10 rounded-xl transition-all"
                >
                  <LogOut className="w-4 h-4 mr-1.5" />
                  Cerrar Sesión
                </Button>
              </div>
            </div>
            
            <div className="mt-6 flex items-center gap-6 border-b border-emerald-700/50 pb-0">
              <button
                onClick={() => setActiveTab("general")}
                className={`pb-3 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${
                  activeTab === "general"
                    ? "text-white border-white"
                    : "text-emerald-300 border-transparent hover:text-emerald-100 hover:border-emerald-500/50"
                }`}
              >
                Cumplimiento General
              </button>
              <button
                onClick={() => setActiveTab("tickets")}
                className={`pb-3 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${
                  activeTab === "tickets"
                    ? "text-white border-white"
                    : "text-emerald-300 border-transparent hover:text-emerald-100 hover:border-emerald-500/50"
                }`}
              >
                Tickets Odoo
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6">
          
          {activeTab === "tickets" && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200/80 p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-bl-full -z-0 opacity-50" />
              <div className="relative z-10">
                <TicketsTab readOnly={true} />
              </div>
            </div>
          )}

          {activeTab === "general" && (
            <>
              {/* Month Selector Panel */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Período a Consultar</h2>
              <p className="text-xs text-gray-400">Selecciona el trimestre para ver el cumplimiento de todas las sucursales</p>
            </div>
            <div className="bg-gray-100/80 p-1 rounded-xl flex gap-1 border border-gray-200/50 w-full sm:w-auto">
              {SECTOR_MONTHS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSelectedMonth(opt.value)}
                  className={`flex-1 py-1.5 px-4 text-xs font-bold rounded-lg transition-all duration-200 ${
                    selectedMonth === opt.value
                      ? "bg-white text-emerald-700 shadow-sm border border-gray-200/40"
                      : "text-gray-600 hover:bg-white/40 hover:text-gray-900"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {state.branches.map(branch => {
              // Calculate compliance for this branch and selected month
              const checklistEntries = state.checklistEntries.filter(
                (c) => c.branchId === branch.id && c.year === state.currentYear && c.month === selectedMonth
              );
              const completedCount = checklistEntries.filter(e => e.status === "Realizado").length;
              const failedCount = checklistEntries.filter(e => e.status === "No realizado").length;
              const naCount = checklistEntries.filter(e => e.status === "No aplica").length;
              const answeredCount = completedCount + failedCount + naCount;
              const compliancePct = answeredCount > 0 ? Math.round((completedCount / (totalTasks - naCount || 1)) * 100) : 0;

              // Get general status
              const calendarEntry = state.calendarEntries.find(
                (c) => c.branchId === branch.id && c.year === state.currentYear && c.month === selectedMonth
              );

              return (
                <div 
                  key={branch.id} 
                  onClick={() => setSelectedBranchId(branch.id)}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-200/80 hover:border-emerald-300 transition-all cursor-pointer p-5 flex flex-col group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -z-0 opacity-50 group-hover:scale-110 transition-transform duration-500" />
                  
                  <div className="relative z-10 space-y-4 flex-1">
                    <div>
                      <h3 className="font-extrabold text-gray-900 text-lg leading-tight">{branch.name}</h3>
                      <p className="text-[10px] text-gray-500 font-semibold uppercase mt-1">{branch.enterprise} • {branch.brand}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${
                        calendarEntry?.status === "realizado" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" :
                        calendarEntry?.status === "programado" ? "bg-blue-50 text-blue-800 border border-blue-200" :
                        "bg-red-50 text-red-800 border border-red-200"
                      }`}>
                        {calendarEntry?.status || "Pendiente"}
                      </span>
                    </div>

                    <div className="mt-auto pt-4 space-y-1.5 border-t border-gray-100">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-gray-600">Cumplimiento Checklist</span>
                        <span className="text-sm font-extrabold text-emerald-700">{compliancePct}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${compliancePct}%` }}
                        />
                      </div>
                      <p className="text-[9px] text-gray-400 font-medium text-right mt-1">
                        {completedCount} / {totalTasks - naCount} tareas
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            </div>
            </>
          )}
        </main>
      </div>
    );
  }

  // --- DETAIL VIEW ---
  const branch = state.branches.find(b => b.id === selectedBranchId);
  if (!branch) {
    setSelectedBranchId(null);
    return null;
  }

  // Filter planning entries for this branch and selected month
  const planningEntries = state.planningEntries.filter(
    (p) =>
      p.branchId === selectedBranchId &&
      new Date(p.scheduledDate).getFullYear() === state.currentYear &&
      new Date(p.scheduledDate).getMonth() === selectedMonth
  );

  // Filter calendar status for this branch and selected month
  const calendarEntry = state.calendarEntries.find(
    (c) =>
      c.branchId === selectedBranchId &&
      c.year === state.currentYear &&
      c.month === selectedMonth
  );

  // Filter checklist entries
  const checklistEntries = state.checklistEntries.filter(
    (c) =>
      c.branchId === selectedBranchId &&
      c.year === state.currentYear &&
      c.month === selectedMonth
  );

  // Calculate stats
  const completedCount = checklistEntries.filter(e => e.status === "Realizado").length;
  const failedCount = checklistEntries.filter(e => e.status === "No realizado").length;
  const naCount = checklistEntries.filter(e => e.status === "No aplica").length;
  const answeredCount = completedCount + failedCount + naCount;
  const compliancePct = answeredCount > 0 ? Math.round((completedCount / (totalTasks - naCount || 1)) * 100) : 0;

  const getTaskStatus = (taskKey: string): string => {
    const entry = checklistEntries.find((c) => c.taskKey === taskKey);
    return entry?.status || "";
  };

  const responsible =
    planningEntries[0]?.technicalResponsible ||
    calendarEntry?.responsible ||
    "Soporte Técnico / Sistemas";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-slate-100 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 shadow-md bg-gradient-to-r from-emerald-900 to-emerald-800 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setSelectedBranchId(null)}
                variant="ghost"
                size="icon"
                className="text-emerald-100 hover:text-white hover:bg-emerald-700/50 mr-2"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-500/20">
                <Building className="w-5.5 h-5.5" />
              </div>
              <div>
                <h1 className="text-lg font-extrabold text-white leading-tight flex items-center gap-2">
                  {branch.name}
                  <span className="text-[10px] bg-emerald-500/30 text-emerald-100 px-2 py-0.5 rounded-full border border-emerald-400/30">
                    Solo Lectura
                  </span>
                </h1>
                <p className="text-[10px] text-emerald-200 font-semibold uppercase tracking-wider mt-0.5">
                  {branch.enterprise} • {branch.brand}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button
                onClick={onLogout}
                variant="outline"
                size="sm"
                className="text-red-400 hover:text-red-300 border-red-500/30 hover:bg-red-500/10 rounded-xl transition-all"
              >
                <LogOut className="w-4 h-4 mr-1.5" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6">
        <div className="flex items-center justify-between mb-2 print:hidden">
          <h2 className="text-xl font-extrabold text-gray-900">
            Detalle de Cumplimiento: {getMonthName(selectedMonth)} {state.currentYear}
          </h2>
          <Button
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-200 text-xs font-bold text-white"
          >
            <Printer className="w-4 h-4" />
            Descargar PDF
          </Button>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:hidden">
          {/* Calendar Status Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-5 space-y-4">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm uppercase tracking-wide border-b border-gray-100 pb-2">
              <CalendarIcon className="w-5 h-5 text-emerald-500" />
              Estatus General
            </div>
            
            <div className="space-y-4">
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Mantenimiento</span>
                <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold border uppercase mt-1.5 ${
                  calendarEntry?.status === "realizado"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                    : calendarEntry?.status === "programado"
                    ? "bg-blue-50 text-blue-800 border-blue-300"
                    : "bg-red-50 text-red-800 border-red-300"
                }`}>
                  {calendarEntry?.status || "Sin programar"}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Responsable Técnico</span>
                <span className="text-sm text-gray-800 font-bold mt-1 block flex items-center gap-1.5">
                  <UserIcon className="w-4 h-4 text-gray-400" />
                  {responsible}
                </span>
              </div>
            </div>
          </div>

          {/* Planning Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-5 space-y-4">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm uppercase tracking-wide border-b border-gray-100 pb-2">
              <Clock className="w-5 h-5 text-emerald-500" />
              Planeación Agendada
            </div>

            {planningEntries.length > 0 ? (
              <div className="space-y-3">
                {planningEntries.map((p) => (
                  <div key={p.id} className="p-3 bg-gray-50/60 border border-gray-200/50 rounded-xl space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-800 font-bold">{formatDate(p.scheduledDate)}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        p.advanceStatus === "listo"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : p.advanceStatus === "en_proceso"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-red-50 text-red-700 border-red-200"
                      }`}>
                        {p.advanceStatus === "listo" ? "Listo" : p.advanceStatus === "en_proceso" ? "En Proceso" : "Pendiente"}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-500 font-semibold block">Técnico: {p.technicalResponsible}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400 text-xs italic flex flex-col items-center gap-2">
                <ShieldAlert className="w-8 h-8 text-gray-300" />
                No hay planeaciones agendadas en este mes.
              </div>
            )}
          </div>

          {/* Checklist compliance summary card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm uppercase tracking-wide border-b border-gray-100 pb-2">
                <ClipboardCheck className="w-5 h-5 text-emerald-500" />
                Checklist Preventivo
              </div>
              <div className="flex items-baseline gap-2 mt-4">
                <span className="text-4xl font-extrabold text-emerald-700">{compliancePct}%</span>
                <span className="text-xs text-gray-500 font-bold">de Cumplimiento</span>
              </div>
              <p className="text-[10px] text-gray-400 font-semibold mt-1">
                {completedCount} de {totalTasks - naCount} actividades marcadas como realizadas
              </p>
            </div>
          </div>
        </div>

        {/* Read-Only Checklist view */}
        <div className="space-y-6 print:hidden">
          <div className="flex justify-between items-center border-b border-gray-200 pb-2">
            <h3 className="font-extrabold text-gray-900 text-base">Checklist Detallado</h3>
            <span className="text-xs font-bold text-gray-500">Vista de Lectura</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {CHECKLIST_CATEGORIES.map((category) => (
              <div key={category.title} className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden">
                <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
                  <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wide">{category.title}</h4>
                </div>
                <div className="divide-y divide-gray-100 text-xs">
                  {category.tasks.map((task) => {
                    const status = getTaskStatus(task.key);
                    return (
                      <div key={task.key} className="p-3.5 flex justify-between items-center gap-3">
                        <span className="text-gray-800 font-medium">{task.description}</span>
                        <div>
                          {status === "Realizado" ? (
                            <span className="flex items-center gap-1 text-emerald-600 font-bold">
                              <CheckCircle2 className="w-4 h-4" /> Realizado
                            </span>
                          ) : status === "No realizado" ? (
                            <span className="flex items-center gap-1 text-red-500 font-bold">
                              <XCircle className="w-4 h-4" /> No realizado
                            </span>
                          ) : status === "No aplica" ? (
                            <span className="text-gray-400 font-semibold">No aplica</span>
                          ) : (
                            <span className="text-gray-400 italic">Pendiente</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* SECTION 3: PRINT-ONLY LAYOUT (MIMICS USER PDF DESIGN EXACTLY) */}
      <div className="hidden print:block font-serif text-black p-4 w-full bg-white leading-normal" style={{ fontSize: "10pt" }}>
        {/* PDF Header block */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="font-bold text-emerald-900 tracking-wide text-base uppercase">CASA MUÑOZ, S.A. DE C.V.</div>
            <div className="text-gray-600 font-semibold text-[9pt]">Área de Sistemas / Soporte TI</div>
          </div>
        </div>

        {/* Heavy emerald separator line */}
        <div className="border-t-3 border-emerald-800 my-3" />

        {/* Centered Document Title */}
        <div className="text-center my-3">
          <div className="font-extrabold text-emerald-900 text-lg tracking-wider">REPORTE DE CUMPLIMIENTO</div>
          <div className="text-[8pt] text-gray-500 italic mt-0.5">Vista de Administración</div>
        </div>

        {/* Metadata Details Grid */}
        <div className="grid grid-cols-2 gap-3 border border-gray-400 p-3 rounded-lg text-[9pt] font-semibold my-4 bg-gray-50/10 font-sans">
          <div>
            <span className="text-gray-500 font-bold uppercase mr-1">Sucursal:</span>
            <span className="text-gray-900 font-extrabold">{branch?.name || "No seleccionada"}</span>
          </div>
          <div>
            <span className="text-gray-500 font-bold uppercase mr-1">Periodo:</span>
            <span className="text-gray-900 font-extrabold">{getMonthName(selectedMonth).toUpperCase()} {state.currentYear}</span>
          </div>
          <div>
            <span className="text-gray-500 font-bold uppercase mr-1">Empresa / Marca:</span>
            <span className="text-gray-800">{branch?.enterprise} / {branch?.brand}</span>
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
              <h4 className="font-extrabold text-emerald-900 border-b-2 border-emerald-800/60 pb-0.5 mb-2 mt-4 text-[10pt] uppercase tracking-wide">
                {category.title}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5 pl-1">
                {category.tasks.map((task) => {
                  const status = getTaskStatus(task.key);
                  let boxChar = "☐";
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

        <div className="text-[7pt] text-gray-500 italic mt-6 border-t border-gray-200 pt-2 flex justify-between font-sans">
          <span>* Simbología: ☑ Realizado | ☒ No Realizado | ☐ No Aplica / Pendiente</span>
          <span>Impreso el {new Date().toLocaleDateString("es-ES")}</span>
        </div>
      </div>
    </div>
  );
}
