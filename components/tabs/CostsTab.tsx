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

  const branchCosts = state.costEntries.filter((c) => c.branchId === selectedBranch);
  const total = branchCosts.reduce((sum, c) => sum + c.quantity * c.unitCost, 0);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Costos de Insumos</h2>

      <div className="bg-white rounded-lg shadow-md p-6 space-y-3 border border-gray-300">
        <h3 className="font-bold text-base text-gray-900">Agregar Costo</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="px-3 py-2 border-2 border-gray-400 rounded text-sm col-span-2 text-gray-900 font-medium bg-white"
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
            className="px-3 py-2 border-2 border-gray-400 rounded text-sm text-gray-900 font-medium bg-white"
          />

          <input
            type="text"
            placeholder="Material"
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            className="px-3 py-2 border-2 border-gray-400 rounded text-sm text-gray-900 font-medium bg-white placeholder-gray-500"
          />

          <input
            type="number"
            placeholder="Cantidad"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="px-3 py-2 border-2 border-gray-400 rounded text-sm text-gray-900 font-medium bg-white placeholder-gray-500"
          />

          <input
            type="number"
            placeholder="Costo Unitario"
            value={unitCost}
            onChange={(e) => setUnitCost(e.target.value)}
            className="px-3 py-2 border-2 border-gray-400 rounded text-sm text-gray-900 font-medium bg-white placeholder-gray-500"
          />

          <input
            type="text"
            placeholder="Asignado a"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            className="px-3 py-2 border-2 border-gray-400 rounded text-sm text-gray-900 font-medium bg-white placeholder-gray-500"
          />

          <Button 
            onClick={() => {
              handleAddCost();
              setMaterial("");
              setQuantity("");
              setUnitCost("");
              setAssignedTo("");
            }} 
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Agregar a Sucursal
          </Button>

          <Button 
            onClick={handleAddToAllBranches}
            variant="outline"
            className="flex items-center gap-2 border-2 border-green-600 text-green-600 hover:bg-green-50"
          >
            <Copy className="w-4 h-4" />
            Agregar a Todas
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-x-auto border border-gray-300">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-300 bg-gray-100">
              <th className="px-4 py-3 text-left font-bold text-gray-900">Fecha</th>
              <th className="px-4 py-3 text-left font-bold text-gray-900">Material</th>
              <th className="px-4 py-3 text-center font-bold text-gray-900">Cantidad</th>
              <th className="px-4 py-3 text-center font-bold text-gray-900">Costo Unitario</th>
              <th className="px-4 py-3 text-center font-bold text-gray-900">Total</th>
              <th className="px-4 py-3 text-left font-bold text-gray-900">Asignado a</th>
              <th className="px-4 py-3 text-center font-bold text-gray-900">Acción</th>
            </tr>
          </thead>
          <tbody>
            {branchCosts.map((cost) => (
              <tr key={cost.id} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="px-4 py-3 text-gray-900 font-medium">{formatDate(cost.date)}</td>
                <td className="px-4 py-3 text-gray-900 font-medium">{cost.material}</td>
                <td className="px-4 py-3 text-center text-gray-900 font-medium">{cost.quantity}</td>
                <td className="px-4 py-3 text-center text-gray-900 font-medium">${cost.unitCost.toFixed(2)}</td>
                <td className="px-4 py-3 text-center font-bold text-blue-700">
                  ${(cost.quantity * cost.unitCost).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-gray-900 font-medium">{cost.assignedTo}</td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => dispatch({ type: "DELETE_COST_ENTRY", payload: cost.id })}
                    className="text-red-600 hover:text-red-800"
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
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-blue-900">Total de Costos (Sucursal Actual):</span>
            <span className="text-2xl font-bold text-blue-600">${total.toFixed(2)}</span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-x-auto border border-gray-300">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-300 bg-gray-100">
              <th className="px-4 py-3 text-left font-bold text-gray-900">Sucursal</th>
              <th className="px-4 py-3 text-center font-bold text-gray-900">Total de Insumos</th>
            </tr>
          </thead>
          <tbody>
            {state.branches.map((branch) => {
              const branchTotal = state.costEntries
                .filter((c) => c.branchId === branch.id)
                .reduce((sum, c) => sum + c.quantity * c.unitCost, 0);
              
              return (
                <tr key={branch.id} className="border-b border-gray-200 hover:bg-gray-100">
                  <td className="px-4 py-3 text-gray-900 font-medium">{branch.name}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="font-bold text-blue-700">
                      ${branchTotal > 0 ? branchTotal.toFixed(2) : "0.00"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100 border-t-2 border-gray-300">
              <td className="px-4 py-3 font-bold text-gray-900">TOTAL GENERAL</td>
              <td className="px-4 py-3 text-center">
                <span className="font-bold text-lg text-blue-600">
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
