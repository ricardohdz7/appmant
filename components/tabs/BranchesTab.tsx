"use client";

import { useMaintenanceContext } from "@/lib/MaintenanceContext";
import { Button } from "@/components/ui/button";
import { Download, Upload, Plus, Trash2 } from "lucide-react";
import { downloadJSON } from "@/lib/exportUtils";
import { useState, useRef } from "react";

export function BranchesTab() {
  const { state, dispatch } = useMaintenanceContext();
  const [newName, setNewName] = useState("");
  const [newEnterprise, setNewEnterprise] = useState<"CASA MUÑOZ S.A DE C.V" | "BEAUTY HUB S.A. DE C.V.">(
    "CASA MUÑOZ S.A DE C.V"
  );
  const [newBrand, setNewBrand] = useState<"Casa Muñoz" | "ELÁN" | "Beauty Hub">("Casa Muñoz");
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
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
        <h2 className="text-lg font-semibold">Gestión de Sucursales</h2>
        <div className="flex gap-2">
          <Button
            onClick={() => downloadJSON(state)}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Descargar Respaldo
          </Button>
          <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="sm" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Restaurar
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 space-y-3">
        <h3 className="font-semibold text-sm">Agregar Nueva Sucursal</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Nombre de Sucursal"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded text-sm"
          />
          <select
            value={newEnterprise}
            onChange={(e) => setNewEnterprise(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded text-sm"
          >
            <option value="CASA MUÑOZ S.A DE C.V">Casa Muñoz S.A</option>
            <option value="BEAUTY HUB S.A. DE C.V.">Beauty Hub S.A</option>
          </select>
          <select
            value={newBrand}
            onChange={(e) => setNewBrand(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded text-sm"
          >
            <option value="Casa Muñoz">Casa Muñoz</option>
            <option value="ELÁN">ELÁN</option>
            <option value="Beauty Hub">Beauty Hub</option>
          </select>
          <Button onClick={handleAddBranch} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Agregar
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {Object.entries(grouped).map(([group, branches]) => (
          <div key={group} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="bg-blue-50 px-4 py-2 border-l-4 border-blue-500">
              <h3 className="font-semibold text-sm text-blue-900">
                {group} ({branches.length})
              </h3>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {branches.map((branch) => (
                  <div
                    key={branch.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900">{branch.name}</p>
                      <p className="text-xs text-gray-500">{branch.brand}</p>
                    </div>
                    <button
                      onClick={() => dispatch({ type: "DELETE_BRANCH", payload: branch.id })}
                      className="text-red-600 hover:text-red-800 ml-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
