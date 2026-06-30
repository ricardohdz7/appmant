"use client";

import { useMaintenanceContext } from "@/lib/MaintenanceContext";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Copy } from "lucide-react";
import { formatDate } from "@/lib/dateUtils";
import { useState } from "react";

export function CostsTab() {
  const { state, dispatch } = useMaintenanceContext();
  const [selectedBranch, setSelectedBranch] = useState(state.branches[0]?.id || "");
  const [material, setMaterial] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const handleAddCost = (branchId: string = selectedBranch) => {
    if (!material || !quantity || !unitCost) return;

    const id = `c${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    dispatch({
      type: "ADD_COST_ENTRY",
      payload: {
        id,
        branchId,
        date: new Date(date),
        material,
        quantity: parseInt(quantity),
        unitCost: parseFloat(unitCost),
        assignedTo,
      },
    });
  };

  const handleAddToAllBranches = () => {
    if (!material || !quantity || !unitCost) return;

    state.branches.forEach((branch) => {
      handleAddCost(branch.id);
    });

    setMaterial("");
    setQuantity("");
    setUnitCost("");
    setAssignedTo("");
    alert(`Costo agregado a todas las ${state.branches.length} sucursales`);
  };

  const handleClearBranchCosts = () => {
    const branchName = state.branches.find((b) => b.id === selectedBranch)?.name || "esta sucursal";
    if (confirm(`¿Estás seguro de que deseas borrar todos los insumos de ${branchName}?`)) {
      dispatch({ type: "CLEAR_BRANCH_COSTS", payload: selectedBranch });
    }
  };

  const handleClearAllCosts = () => {
    if (confirm("¿Estás seguro de que deseas borrar ABSOLUTAMENTE TODOS los insumos de todas las sucursales? Esta acción no se puede deshacer.")) {
      dispatch({ type: "CLEAR_ALL_COSTS" });
    }
  };

  const branchCosts = state.costEntries.filter((c) => c.branchId === selectedBranch);
  const total = branchCosts.reduce((sum, c) => sum + c.quantity * c.unitCost, 0);

  const inputClass = "px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 font-medium bg-white placeholder-gray-400 focus:ring-2 focus:ring-blue-300 focus:border-blue-300 focus:outline-none transition-all";

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-bold text-gray-900">Costos de Insumos</h2>

      <div className="rounded-2xl shadow-lg p-6 space-y-4 bg-white border border-gray-200/80">
        <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
          <span className="w-1.5 h-5 rounded-full bg-blue-500 inline-block" />
          Agregar Costo
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className={`${inputClass} col-span-2`}
          >
            {state.branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass}
          />

          <input
            type="text"
            placeholder="Material"
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            className={inputClass}
          />

          <input
            type="number"
            placeholder="Cantidad"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className={inputClass}
          />

          <input
            type="number"
            placeholder="Costo Unitario"
            value={unitCost}
            onChange={(e) => setUnitCost(e.target.value)}
            className={inputClass}
          />

          <input
            type="text"
            placeholder="Asignado a"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            className={inputClass}
          />

          <div className="flex gap-2">
            <Button 
              onClick={() => {
                handleAddCost();
                setMaterial("");
                setQuantity("");
                setUnitCost("");
                setAssignedTo("");
              }} 
              className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200 transition-all"
            >
              <Plus className="w-4 h-4" />
              Agregar a Sucursal
            </Button>

            <Button 
              onClick={handleAddToAllBranches}
              variant="outline"
              className="flex items-center gap-2 rounded-xl border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400 transition-all"
            >
              <Copy className="w-4 h-4" />
              Agregar a Todas
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl shadow-lg overflow-x-auto border border-gray-200/80 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100/60">
              <th className="px-4 py-3.5 text-left font-bold text-gray-700 uppercase text-[11px] tracking-wider">Fecha</th>
              <th className="px-4 py-3.5 text-left font-bold text-gray-700 uppercase text-[11px] tracking-wider">Material</th>
              <th className="px-4 py-3.5 text-center font-bold text-gray-700 uppercase text-[11px] tracking-wider">Cantidad</th>
              <th className="px-4 py-3.5 text-center font-bold text-gray-700 uppercase text-[11px] tracking-wider">Costo Unitario</th>
              <th className="px-4 py-3.5 text-center font-bold text-gray-700 uppercase text-[11px] tracking-wider">Total</th>
              <th className="px-4 py-3.5 text-left font-bold text-gray-700 uppercase text-[11px] tracking-wider">Asignado a</th>
              <th className="px-4 py-3.5 text-center font-bold text-gray-700 uppercase text-[11px] tracking-wider">Acción</th>
            </tr>
          </thead>
          <tbody>
            {branchCosts.map((cost, idx) => (
              <tr
                key={cost.id}
                className={`border-b border-gray-100 hover:bg-blue-50/40 transition-colors ${
                  idx % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                }`}
              >
                <td className="px-4 py-3 text-gray-900 font-medium">{formatDate(cost.date)}</td>
                <td className="px-4 py-3 text-gray-900 font-medium">{cost.material}</td>
                <td className="px-4 py-3 text-center text-gray-900 font-medium">{cost.quantity}</td>
                <td className="px-4 py-3 text-center text-gray-900 font-medium">${cost.unitCost.toFixed(2)}</td>
                <td className="px-4 py-3 text-center">
                  <span className="font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-lg">
                    ${(cost.quantity * cost.unitCost).toFixed(2)}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-900 font-medium">{cost.assignedTo}</td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => dispatch({ type: "DELETE_COST_ENTRY", payload: cost.id })}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {branchCosts.length > 0 && (
        <div
          className="rounded-2xl p-5 border border-blue-200/80"
          style={{ background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)" }}
        >
          <div className="flex justify-between items-center">
            <span className="font-bold text-blue-900">Total de Costos (Sucursal Actual):</span>
            <div className="flex items-center gap-4">
              <span className="text-3xl font-extrabold text-blue-700">${total.toFixed(2)}</span>
              <Button 
                onClick={handleClearBranchCosts} 
                variant="destructive"
                size="sm"
                className="flex items-center gap-1 rounded-xl bg-red-600 hover:bg-red-700 shadow-md shadow-red-200"
              >
                <Trash2 className="w-4 h-4" />
                Vaciar Sucursal
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl shadow-lg overflow-x-auto border border-gray-200/80 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100/60">
              <th className="px-4 py-3.5 text-left font-bold text-gray-700 uppercase text-[11px] tracking-wider">Sucursal</th>
              <th className="px-4 py-3.5 text-center font-bold text-gray-700 uppercase text-[11px] tracking-wider">Total de Insumos</th>
            </tr>
          </thead>
          <tbody>
            {state.branches.map((branch, idx) => {
              const branchTotal = state.costEntries
                .filter((c) => c.branchId === branch.id)
                .reduce((sum, c) => sum + c.quantity * c.unitCost, 0);
              
              return (
                <tr
                  key={branch.id}
                  className={`border-b border-gray-100 hover:bg-blue-50/40 transition-colors ${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                  }`}
                >
                  <td className="px-4 py-3 text-gray-900 font-semibold">{branch.name}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg">
                      ${branchTotal > 0 ? branchTotal.toFixed(2) : "0.00"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-gradient-to-r from-gray-50 to-blue-50/30 border-t-2 border-gray-200">
              <td className="px-4 py-4 font-bold text-gray-900 flex justify-between items-center">
                <span className="uppercase tracking-wider text-sm">Total General</span>
                {state.costEntries.length > 0 && (
                  <Button 
                    onClick={handleClearAllCosts} 
                    variant="destructive"
                    size="sm"
                    className="h-8 text-xs px-3 rounded-lg bg-red-600 hover:bg-red-700 flex items-center gap-1 shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Vaciar Todo
                  </Button>
                )}
              </td>
              <td className="px-4 py-4 text-center">
                <span className="font-extrabold text-lg text-blue-700 bg-blue-100 px-4 py-1.5 rounded-xl">
                  ${state.costEntries.reduce((sum, c) => sum + c.quantity * c.unitCost, 0).toFixed(2)}
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
