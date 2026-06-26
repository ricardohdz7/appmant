"use client";

import { useMaintenanceContext } from "@/lib/MaintenanceContext";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

export function CostsTab() {
  const { state, dispatch } = useMaintenanceContext();
  const [selectedBranch, setSelectedBranch] = useState(state.branches[0]?.id || "");
  const [material, setMaterial] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const handleAddCost = () => {
    if (!material || !quantity || !unitCost) return;

    const id = `c${Date.now()}`;
    dispatch({
      type: "ADD_COST_ENTRY",
      payload: {
        id,
        branchId: selectedBranch,
        date: new Date(date),
        material,
        quantity: parseInt(quantity),
        unitCost: parseFloat(unitCost),
        assignedTo,
      },
    });

    setMaterial("");
    setQuantity("");
    setUnitCost("");
    setAssignedTo("");
  };

  const branchCosts = state.costEntries.filter((c) => c.branchId === selectedBranch);
  const total = branchCosts.reduce((sum, c) => sum + c.quantity * c.unitCost, 0);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Costos de Insumos</h2>

      <div className="bg-white rounded-lg shadow-sm p-4 space-y-3">
        <h3 className="font-semibold text-sm">Agregar Costo</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded text-sm col-span-2"
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
            className="px-3 py-2 border border-gray-300 rounded text-sm"
          />

          <input
            type="text"
            placeholder="Material"
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded text-sm"
          />

          <input
            type="number"
            placeholder="Cantidad"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded text-sm"
          />

          <input
            type="number"
            placeholder="Costo Unitario"
            value={unitCost}
            onChange={(e) => setUnitCost(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded text-sm"
          />

          <input
            type="text"
            placeholder="Asignado a"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded text-sm"
          />

          <Button onClick={handleAddCost} className="col-span-2 md:col-span-1 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Agregar Costo
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Fecha</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Material</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Cantidad</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Costo Unitario</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Total</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Asignado a</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Acción</th>
            </tr>
          </thead>
          <tbody>
            {branchCosts.map((cost) => (
              <tr key={cost.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-600">{cost.date.toLocaleDateString("es-SV")}</td>
                <td className="px-4 py-3 text-gray-900 font-medium">{cost.material}</td>
                <td className="px-4 py-3 text-center text-gray-600">{cost.quantity}</td>
                <td className="px-4 py-3 text-center text-gray-600">${cost.unitCost.toFixed(2)}</td>
                <td className="px-4 py-3 text-center font-semibold text-blue-600">
                  ${(cost.quantity * cost.unitCost).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-gray-600">{cost.assignedTo}</td>
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
            <span className="font-semibold text-blue-900">Total de Costos:</span>
            <span className="text-2xl font-bold text-blue-600">${total.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
