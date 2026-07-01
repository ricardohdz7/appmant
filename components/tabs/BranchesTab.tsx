"use client";

import { useMaintenanceContext } from "@/lib/MaintenanceContext";
import { Button } from "@/components/ui/button";
import { Download, Upload, Plus, Trash2, FileDown, List } from "lucide-react";
import { downloadJSON } from "@/lib/exportUtils";
import { exportBranchNamesToExcel } from "@/lib/excelUtils";
import { formatDate } from "@/lib/dateUtils";
import { useState, useRef } from "react";

async function exportBranchesToExcel(branches: any[]) {
  const { utils, writeFile } = await import("xlsx");
  const ws = utils.json_to_sheet(branches.map((b) => ({
    "Nombre": b.name,
    "Empresa": b.enterprise,
    "Marca": b.brand,
  })));
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, "Sucursales");
  writeFile(wb, "sucursales.xlsx");
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

  const inputClass = "px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 font-medium bg-white placeholder-gray-400 focus:ring-2 focus:ring-blue-300 focus:border-blue-300 focus:outline-none transition-all";
  const btnOutlineClass = "flex items-center gap-2 rounded-xl border-gray-300 hover:bg-blue-50 hover:border-blue-300 transition-all";

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Sucursales</h2>
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={() => downloadJSON(state)}
            variant="outline"
            size="sm"
            className={btnOutlineClass}
          >
            <Download className="w-4 h-4" />
            Respaldo
          </Button>
          <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="sm" className={btnOutlineClass}>
            <Upload className="w-4 h-4" />
            Restaurar
          </Button>
          <Button 
            onClick={() => exportBranchNamesToExcel(state.branches)}
            variant="outline"
            size="sm"
            className={btnOutlineClass}
          >
            <List className="w-4 h-4" />
            Descargar Nombres
          </Button>
          <Button 
            onClick={async () => {
              await exportBranchesToExcel(state.branches);
            }}
            variant="outline"
            size="sm"
            className={btnOutlineClass}
          >
            <FileDown className="w-4 h-4" />
            Exportar Excel
          </Button>
          <Button onClick={() => excelInputRef.current?.click()} variant="outline" size="sm" className={btnOutlineClass}>
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

      <div className="rounded-2xl shadow-lg p-6 space-y-4 bg-white border border-gray-200/80">
        <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
          <span className="w-1.5 h-5 rounded-full bg-blue-500 inline-block" />
          Agregar Nueva Sucursal
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Nombre de Sucursal"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className={inputClass}
          />
          <select
            value={newEnterprise}
            onChange={(e) => setNewEnterprise(e.target.value as any)}
            className={inputClass}
          >
            <option value="CASA MUÑOZ S.A DE C.V">Casa Muñoz S.A</option>
            <option value="BEAUTY HUB S.A. DE C.V.">Beauty Hub S.A</option>
          </select>
          <select
            value={newBrand}
            onChange={(e) => setNewBrand(e.target.value as any)}
            className={inputClass}
          >
            <option value="Casa Muñoz">Casa Muñoz</option>
            <option value="ELÁN">ELÁN</option>
            <option value="Beauty Hub">Beauty Hub</option>
          </select>
          <Button onClick={handleAddBranch} className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200 transition-all">
            <Plus className="w-4 h-4" />
            Agregar
          </Button>
        </div>
      </div>

      <div className="space-y-5">
        {Object.entries(grouped).map(([group, branches]) => (
          <div key={group} className="rounded-2xl shadow-lg overflow-hidden border border-gray-200/80 bg-white">
            <div
              className="px-5 py-3.5 border-l-4 border-blue-600"
              style={{ background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)" }}
            >
              <h3 className="font-bold text-base text-blue-900">
                {group} <span className="text-blue-600 font-semibold">({branches.length})</span>
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100/60">
                    <th className="px-4 py-3.5 text-left font-bold text-gray-700 uppercase text-[11px] tracking-wider">Sucursal</th>
                    <th className="px-4 py-3.5 text-left font-bold text-gray-700 uppercase text-[11px] tracking-wider">Empresa</th>
                    <th className="px-4 py-3.5 text-left font-bold text-gray-700 uppercase text-[11px] tracking-wider">Marca</th>
                    <th className="px-4 py-3.5 text-center font-bold text-gray-700 uppercase text-[11px] tracking-wider">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {branches.map((branch, idx) => (
                    <tr
                      key={branch.id}
                      className={`border-b border-gray-100 hover:bg-blue-50/40 transition-colors ${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                      }`}
                    >
                      <td className="px-4 py-3 text-gray-900 font-semibold">{branch.name}</td>
                      <td className="px-4 py-3 text-gray-900 font-medium">{branch.enterprise}</td>
                      <td className="px-4 py-3 text-gray-900 font-medium">{branch.brand}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => dispatch({ type: "DELETE_BRANCH", payload: branch.id })}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors font-bold"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
