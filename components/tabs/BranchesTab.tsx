"use client";

import { useMaintenanceContext } from "@/lib/MaintenanceContext";
import { Button } from "@/components/ui/button";
import { Download, Upload, Plus, Trash2, FileDown } from "lucide-react";
import { downloadJSON } from "@/lib/exportUtils";
import { formatDate } from "@/lib/dateUtils";
import { useState, useRef } from "react";

async function exportBranchesToExcel(branches: any[]) {
  const { utils, write } = await import("xlsx");
  const ws = utils.json_to_sheet(branches.map((b) => ({
    "Nombre": b.name,
    "Empresa": b.enterprise,
    "Marca": b.brand,
  })));
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, "Sucursales");
  write(wb, { bookType: "xlsx", type: "file", filename: "sucursales.xlsx" });
}

async function importBranchesFromExcel(file: File): Promise<any[]> {
  const { read, utils } = await import("xlsx");
  const buffer = await file.arrayBuffer();
  const workbook = read(buffer, { cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = utils.sheet_to_json(sheet);
  return data.map((row: any, idx: number) => ({
    id: `b${Date.now()}-${idx}`,
    name: row["Nombre"] || row["name"] || "",
    enterprise: row["Empresa"] || row["enterprise"] || "CASA MUÑOZ S.A DE C.V",
    brand: row["Marca"] || row["brand"] || "Casa Muñoz",
  })).filter((b: any) => b.name.trim() !== "");
}

export function BranchesTab() {
  const { state, dispatch } = useMaintenanceContext();
  const [newName, setNewName] = useState("");
  const [newEnterprise, setNewEnterprise] = useState<"CASA MUÑOZ S.A DE C.V" | "BEAUTY HUB S.A. DE C.V.">(
    "CASA MUÑOZ S.A DE C.V"
  );
  const [newBrand, setNewBrand] = useState<"Casa Muñoz" | "ELÁN" | "Beauty Hub">("Casa Muñoz");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);

  const handleAddBranch = () => {
    if (!newName) return;

    const id = `b${Date.now()}`;
    dispatch({
      type: "ADD_BRANCH",
      payload: {
        id,
        name: newName,
        enterprise: newEnterprise,
        brand: newBrand,
      },
    });

    setNewName("");
  };

  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        dispatch({ type: "LOAD_STATE", payload: data });
        alert("Respaldo restaurado exitosamente");
      } catch (error) {
        alert("Error al restaurar el respaldo");
      }
    };
    reader.readAsText(file);
  };

  const handleImportExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const newBranches = await importBranchesFromExcel(file);
      newBranches.forEach((branch) => {
        dispatch({ type: "ADD_BRANCH", payload: branch });
      });
      alert(`${newBranches.length} sucursales importadas exitosamente`);
      event.target.value = "";
    } catch (error) {
      alert("Error al importar Excel");
      console.error(error);
    }
  };

  // Group branches by enterprise and brand
  const grouped = state.branches.reduce(
    (acc, branch) => {
      const key = `${branch.enterprise} - ${branch.brand}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(branch);
      return acc;
    },
    {} as Record<string, typeof state.branches>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Sucursales</h2>
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={() => downloadJSON(state)}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Respaldo
          </Button>
          <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="sm" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Restaurar
          </Button>
          <Button 
            onClick={async () => {
              await exportBranchesToExcel(state.branches);
            }}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <FileDown className="w-4 h-4" />
            Exportar Excel
          </Button>
          <Button onClick={() => excelInputRef.current?.click()} variant="outline" size="sm" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Cargar Excel
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportJSON}
            className="hidden"
          />
          <input
            ref={excelInputRef}
            type="file"
            accept=".xlsx"
            onChange={handleImportExcel}
            className="hidden"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 space-y-3 border border-gray-300">
        <h3 className="font-bold text-base text-gray-900">Agregar Nueva Sucursal</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Nombre de Sucursal"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="px-3 py-2 border-2 border-gray-400 rounded text-sm text-gray-900 font-medium bg-white placeholder-gray-500"
          />
          <select
            value={newEnterprise}
            onChange={(e) => setNewEnterprise(e.target.value as any)}
            className="px-3 py-2 border-2 border-gray-400 rounded text-sm text-gray-900 font-medium bg-white"
          >
            <option value="CASA MUÑOZ S.A DE C.V">Casa Muñoz S.A</option>
            <option value="BEAUTY HUB S.A. DE C.V.">Beauty Hub S.A</option>
          </select>
          <select
            value={newBrand}
            onChange={(e) => setNewBrand(e.target.value as any)}
            className="px-3 py-2 border-2 border-gray-400 rounded text-sm text-gray-900 font-medium bg-white"
          >
            <option value="Casa Muñoz">Casa Muñoz</option>
            <option value="ELÁN">ELÁN</option>
            <option value="Beauty Hub">Beauty Hub</option>
          </select>
          <Button onClick={handleAddBranch} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4" />
            Agregar
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {Object.entries(grouped).map(([group, branches]) => (
          <div key={group} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-300">
            <div className="bg-blue-600 px-4 py-3 border-l-4 border-blue-800">
              <h3 className="font-bold text-base text-white">
                {group} ({branches.length})
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-300 bg-gray-100">
                    <th className="px-4 py-3 text-left font-bold text-gray-900">Sucursal</th>
                    <th className="px-4 py-3 text-left font-bold text-gray-900">Próximo Mantenimiento</th>
                    <th className="px-4 py-3 text-left font-bold text-gray-900">Responsable</th>
                    <th className="px-4 py-3 text-left font-bold text-gray-900">Estado</th>
                    <th className="px-4 py-3 text-center font-bold text-gray-900">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {branches.map((branch) => {
                    const calendarEntry = state.calendarEntries.find(
                      (e) => e.branchId === branch.id && e.year === state.currentYear
                    );
                    const latestPlanning = state.planningEntries
                      .filter((p) => p.branchId === branch.id)
                      .sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime())[0];

                    const statusColors: Record<string, string> = {
                      realizado: "bg-green-100 text-green-900 font-bold",
                      programado: "bg-blue-100 text-blue-900 font-bold",
                      pendiente: "bg-red-100 text-red-900 font-bold",
                    };

                    return (
                      <tr key={branch.id} className="border-b border-gray-200 hover:bg-gray-100">
                        <td className="px-4 py-3 text-gray-900 font-medium">{branch.name}</td>
                        <td className="px-4 py-3 text-gray-900 font-medium">
                          {latestPlanning ? formatDate(latestPlanning.scheduledDate) : "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-900 font-medium">
                          {latestPlanning?.technicalResponsible || "-"}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={calendarEntry?.status || ""}
                            onChange={(e) => {
                              const currentMonth = new Date().getMonth();
                              dispatch({
                                type: "UPDATE_CALENDAR_ENTRY",
                                payload: {
                                  branchId: branch.id,
                                  year: state.currentYear,
                                  month: currentMonth,
                                  status: e.target.value as any,
                                  responsible: calendarEntry?.responsible || "",
                                },
                              });
                            }}
                            className={`px-3 py-2 rounded font-bold text-sm cursor-pointer border-2 border-gray-400 ${
                              statusColors[calendarEntry?.status || ""] || "bg-white text-gray-900"
                            }`}
                          >
                            <option value="">Seleccionar...</option>
                            <option value="programado">Programado</option>
                            <option value="realizado">Realizado</option>
                            <option value="pendiente">Pendiente</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => dispatch({ type: "DELETE_BRANCH", payload: branch.id })}
                            className="text-red-600 hover:text-red-800 font-bold"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
