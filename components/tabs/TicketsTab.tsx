"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { Upload, Ticket, CheckCircle, AlertCircle, Clock, FileSpreadsheet } from "lucide-react";
import { useMaintenanceContext } from "@/lib/MaintenanceContext";
import { OdooTicket } from "@/lib/types";

interface TicketsTabProps {
  readOnly?: boolean;
  branchNameFilter?: string;
}

export function TicketsTab({ readOnly = false, branchNameFilter }: TicketsTabProps = {}) {
  const { state, dispatch } = useMaintenanceContext();
  const tickets: OdooTicket[] = (state.odooTickets || []).filter(t => 
    branchNameFilter ? t.sucursal?.toLowerCase().includes(branchNameFilter.toLowerCase()) : true
  );
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array", cellDates: true });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to array of objects
        const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (rawData.length < 2) {
          throw new Error("El archivo no contiene suficientes datos.");
        }

        const headers: any = rawData[0];
        const rows = rawData.slice(1);

        // Map column indices
        const getColIndex = (names: string[]) => {
          return headers.findIndex((h: any) => 
            names.some(n => String(h).toLowerCase().includes(n.toLowerCase()))
          );
        };

        const colAsignado = getColIndex(["asignado a"]);
        const colAsunto = getColIndex(["asunto"]);
        const colKanban = getColIndex(["estado de kanban", "kanban"]);
        const colEtapa = getColIndex(["etapa"]);
        const colCreado = getColIndex(["creado el", "creación"]);
        const colContacto = getColIndex(["fecha de contacto", "contacto al cliente"]);
        const colDesc = getColIndex(["descripción", "description"]);
        const colPrio = getColIndex(["prioridad"]);
        const colProp = getColIndex(["propiedades"]);
        const colSuc = getColIndex(["sucursal"]);

        if (colCreado === -1) {
          throw new Error("No se encontró la columna 'Creado el'. Asegúrate de exportar correctamente desde Odoo.");
        }

        const parsedTickets: OdooTicket[] = rows.map((row: any) => {
          // Helper to parse dates
          const parseDate = (val: any) => {
            if (!val) return null;
            if (val instanceof Date) return val;
            const d = new Date(val);
            return isNaN(d.getTime()) ? null : d;
          };

          const creadoEl = parseDate(row[colCreado]);
          const fechaContacto = parseDate(row[colContacto]);
          
          const etapa = String(row[colEtapa] || "").trim();
          
          // Determine open/close status based on typical stage names
          const isClosed = ["cerrado", "resuelto", "hecho", "finalizado", "cancelado"].some(s => etapa.toLowerCase().includes(s));
          
          // Calculate SLA (15 days)
          let slaDays = null;
          let slaMet = true; // Default true unless breached
          
          if (creadoEl) {
            const endDate = fechaContacto || new Date(); // If no contact yet, use today to check if already breached
            const diffTime = endDate.getTime() - creadoEl.getTime();
            slaDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (slaDays > 15) {
              slaMet = false;
            }
          }

          return {
            asignadoA: row[colAsignado] || "",
            asunto: row[colAsunto] || "",
            estadoKanban: row[colKanban] || "",
            etapa,
            creadoEl,
            fechaContacto,
            descripcion: row[colDesc] || "",
            prioridad: row[colPrio] || "",
            propiedades: row[colProp] || "",
            sucursal: row[colSuc] || "",
            slaMet,
            slaDays,
            isOpen: !isClosed
          };
        }).filter(t => t.creadoEl !== null); // Only keep valid tickets

        dispatch({ type: "SET_ODOO_TICKETS", payload: parsedTickets });
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Error al procesar el archivo Excel.");
      } finally {
        setIsProcessing(false);
      }
    };
    reader.onerror = () => {
      setError("Error al leer el archivo.");
      setIsProcessing(false);
    };
    
    reader.readAsArrayBuffer(file);
    // Clear input so same file can be uploaded again if needed
    e.target.value = '';
  };

  const openTickets = tickets.filter(t => t.isOpen).length;
  const closedTickets = tickets.filter(t => !t.isOpen).length;
  const slaMetTickets = tickets.filter(t => t.slaMet).length;
  const slaBreachedTickets = tickets.filter(t => !t.slaMet).length;
  
  const compliancePct = tickets.length > 0 ? Math.round((slaMetTickets / tickets.length) * 100) : 0;

  const ticketsNuevos = tickets.filter(t => t.etapa.toLowerCase().includes("nuevo"));
  const ticketsEnProceso = tickets.filter(t => t.isOpen && !t.etapa.toLowerCase().includes("nuevo"));
  const ticketsResueltos = tickets.filter(t => !t.isOpen);

  const renderTable = (title: string, list: OdooTicket[], showCompliance: boolean = false) => {
    if (list.length === 0) return null;
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden mb-8">
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-gray-900">{title} <span className="ml-2 text-sm text-gray-500 font-medium">({list.length})</span></h3>
          {showCompliance && (
            <span className="text-xs font-bold text-cm-teal bg-cm-teal/10 px-3 py-1 rounded-full">
              {compliancePct}% Cumplimiento Global
            </span>
          )}
        </div>
        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50/80 sticky top-0 z-10 backdrop-blur-sm">
              <tr>
                <th className="px-5 py-3.5 font-extrabold tracking-wider">Asunto / Sucursal</th>
                <th className="px-5 py-3.5 font-extrabold tracking-wider">Etapa</th>
                <th className="px-5 py-3.5 font-extrabold tracking-wider">Creación</th>
                <th className="px-5 py-3.5 font-extrabold tracking-wider">Contacto Cliente</th>
                <th className="px-5 py-3.5 font-extrabold tracking-wider text-center">Días</th>
                <th className="px-5 py-3.5 font-extrabold tracking-wider text-center">SLA Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {list.map((t, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-bold text-gray-900 truncate max-w-[300px]">{t.asunto}</div>
                    <div className="text-[10px] text-gray-500 font-semibold uppercase mt-0.5">{t.sucursal || "Sin sucursal"}</div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase ${
                      t.isOpen ? 'bg-cm-teal/10 text-cm-teal border-cm-teal/20' : 'bg-gray-100 text-gray-700 border-gray-200'
                    }`}>
                      {t.etapa}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs font-medium text-gray-600">
                    {t.creadoEl ? t.creadoEl.toLocaleDateString('es-ES') : '-'}
                  </td>
                  <td className="px-5 py-4 text-xs font-medium text-gray-600">
                    {t.fechaContacto ? t.fechaContacto.toLocaleDateString('es-ES') : <span className="text-gray-400 italic">Pendiente</span>}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="font-bold text-gray-900">{t.slaDays !== null ? t.slaDays : '-'}</span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    {t.slaMet ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-md uppercase">
                        <CheckCircle className="w-3 h-3" /> En tiempo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-1 rounded-md uppercase">
                        <AlertCircle className="w-3 h-3" /> Incumplido
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mesa de Ayuda (Odoo)</h2>
          <p className="text-sm text-gray-500 mt-1">
            {readOnly ? "Visualización de métricas de SLA y estado de tickets" : "Sube el reporte exportado para analizar los tiempos de respuesta y SLA (15 días)"}
          </p>
        </div>
        
        {!readOnly && (
          <div>
            <input 
              type="file" 
              accept=".xlsx, .xls, .csv" 
              onChange={handleFileUpload} 
              className="hidden" 
              id="excel-upload"
            />
            <label htmlFor="excel-upload">
              <div className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-cm-teal text-white hover:bg-cm-teal/90 rounded-xl shadow-md cursor-pointer">
                {isProcessing ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                {isProcessing ? "Procesando..." : "Subir XLSX de Odoo"}
              </div>
            </label>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="font-semibold text-sm">{error}</p>
        </div>
      )}

      {tickets.length === 0 && !error && !isProcessing && (
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-cm-teal/10 text-cm-teal rounded-2xl flex items-center justify-center mb-4">
            <FileSpreadsheet className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Sin datos de tickets</h3>
          <p className="text-sm text-gray-500 max-w-md">
            {readOnly ? "No hay tickets disponibles para mostrar." : "Sube el archivo Excel (.xlsx) exportado desde Odoo. Asegúrate de incluir las columnas: Creado el, Fecha de contacto al cliente, y Etapa."}
          </p>
        </div>
      )}

      {tickets.length > 0 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* KPI Cards (Reverted to Open/Closed/SLA style) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200/80">
              <div className="flex items-center gap-3 text-gray-500 mb-3 text-sm font-bold uppercase tracking-wider">
                <Ticket className="w-5 h-5 text-cm-teal" />
                Tickets Abiertos
              </div>
              <div className="text-4xl font-extrabold text-gray-900">{openTickets}</div>
              <div className="text-xs text-gray-500 mt-2 font-medium">De un total de {tickets.length} tickets</div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200/80">
              <div className="flex items-center gap-3 text-gray-500 mb-3 text-sm font-bold uppercase tracking-wider">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                Tickets Cerrados
              </div>
              <div className="text-4xl font-extrabold text-gray-900">{closedTickets}</div>
              <div className="text-xs text-gray-500 mt-2 font-medium">Tickets resueltos o finalizados</div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-200 bg-emerald-50/30">
              <div className="flex items-center gap-3 text-emerald-700 mb-3 text-sm font-bold uppercase tracking-wider">
                <Clock className="w-5 h-5" />
                Cumplen SLA
              </div>
              <div className="text-4xl font-extrabold text-emerald-700">{slaMetTickets}</div>
              <div className="text-xs text-emerald-600 mt-2 font-bold">Contactados en ≤ 15 días</div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-red-200 bg-red-50/30 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3 text-sm font-bold uppercase tracking-wider text-red-700">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5" />
                  Fuera de SLA
                </div>
              </div>
              <div className="text-4xl font-extrabold text-red-700">{slaBreachedTickets}</div>
              <div className="text-xs text-red-600 mt-2 font-bold">Excedieron 15 días</div>
              
              {/* Compliance visual indicator */}
              <div className="absolute bottom-0 left-0 w-full h-1.5 bg-red-200">
                <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${compliancePct}%` }} />
              </div>
            </div>
          </div>

          {/* Tables separated by stages */}
          <div className="space-y-4">
            {renderTable("Detalle de Tickets - Nuevos", ticketsNuevos, true)}
            {renderTable("Detalle de Tickets - En Proceso", ticketsEnProceso, false)}
            {renderTable("Detalle de Tickets - Resueltos", ticketsResueltos, false)}
          </div>
        </div>
      )}
    </div>
  );
}
