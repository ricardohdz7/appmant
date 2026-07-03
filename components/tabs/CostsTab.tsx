"use client";

import { useMaintenanceContext } from "@/lib/MaintenanceContext";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Copy, Download, Upload, FileDown, PlusCircle } from "lucide-react";
import { formatDate } from "@/lib/dateUtils";
import { downloadCostsTemplate, exportCostsToExcel, importCostsFromExcel } from "@/lib/excelUtils";
import { useState, useRef } from "react";

const MAINTENANCE_MONTHS = [
  { value: 0, label: "Enero" },
  { value: 3, label: "Abril" },
  { value: 6, label: "Julio" },
  { value: 9, label: "Octubre" }
];

interface CostsTabProps {
  readOnly?: boolean;
}

export function CostsTab({ readOnly }: CostsTabProps) {
  const { state, dispatch } = useMaintenanceContext();
  const [selectedBranch, setSelectedBranch] = useState(state.branches[0]?.id || "");
  const [items, setItems] = useState([{ material: "", quantity: "", unitCost: "" }]);
  const [assignedTo, setAssignedTo] = useState("");
  const [date, setDate] = useState(() => {
    const year = new Date().getFullYear();
    return `${year}-01-15`; // Default to Enero
  });
  const [monthFilter, setMonthFilter] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddCost = (branchId: string = selectedBranch) => {
    let addedCount = 0;
    items.forEach((item) => {
      if (!item.material || !item.quantity || !item.unitCost) return;
      const id = `c${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      dispatch({
        type: "ADD_COST_ENTRY",
        payload: {
          id,
          branchId,
          date: new Date(date),
          material: item.material,
          quantity: parseInt(item.quantity),
          unitCost: parseFloat(item.unitCost),
          assignedTo,
        },
      });
      addedCount++;
    });
    return addedCount;
  };

  const handleAddToAllBranches = () => {
    const validItems = items.filter(i => i.material && i.quantity && i.unitCost);
    if (validItems.length === 0) return;

    state.branches.forEach((branch) => {
      handleAddCost(branch.id);
    });

    setItems([{ material: "", quantity: "", unitCost: "" }]);
    setAssignedTo("");
    alert(`${validItems.length} insumos agregados a todas las ${state.branches.length} sucursales`);
  };

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    if (newItems.length === 0) {
      setItems([{ material: "", quantity: "", unitCost: "" }]);
    } else {
      setItems(newItems);
    }
  };

  const addItemRow = () => {
    setItems([...items, { material: "", quantity: "", unitCost: "" }]);
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

  const handleImportExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const branchesMap = state.branches.reduce((acc, b) => {
        acc[b.id] = b.name;
        return acc;
      }, {} as Record<string, string>);

      const newCosts = await importCostsFromExcel(file, branchesMap);
      
      newCosts.forEach((cost) => {
        dispatch({ type: "ADD_COST_ENTRY", payload: cost });
      });
      
      alert(`${newCosts.length} insumos importados exitosamente`);
      event.target.value = "";
    } catch (error: any) {
      alert(`Error al importar Excel: ${error.message}`);
      console.error(error);
    }
  };

  const filteredCostEntries = state.costEntries.filter((c) => {
    if (monthFilter !== null) {
      const d = c.date instanceof Date ? c.date : new Date(c.date);
      return d.getMonth() === monthFilter;
    }
    return true;
  });

  const branchCosts = filteredCostEntries.filter((c) => c.branchId === selectedBranch);
  const total = branchCosts.reduce((sum, c) => sum + c.quantity * c.unitCost, 0);

  const inputClass = "px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 font-medium bg-white placeholder-gray-400 focus:ring-2 focus:ring-blue-300 focus:border-blue-300 focus:outline-none transition-all";
  const btnOutlineClass = "flex items-center gap-2 rounded-xl border-gray-300 hover:bg-blue-50 hover:border-blue-300 transition-all";

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Costos de Insumos</h2>
        {!readOnly && (
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => downloadCostsTemplate(state.branches)}
              variant="outline"
              size="sm"
              className={btnOutlineClass}
            >
              <Download className="w-4 h-4" />
              Plantilla Excel
            </Button>
            <Button 
              onClick={() => {
                const branchesMap = state.branches.reduce((acc, b) => {
                  acc[b.id] = b.name;
                  return acc;
                }, {} as Record<string, string>);
                exportCostsToExcel(state.costEntries, branchesMap);
              }}
              variant="outline"
              size="sm"
              className={btnOutlineClass}
            >
              <FileDown className="w-4 h-4" />
              Exportar Excel
            </Button>
            <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="sm" className={btnOutlineClass}>
              <Upload className="w-4 h-4" />
              Cargar Excel
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImportExcel}
              className="hidden"
            />
          </div>
        )}
      </div>

      {/* Segmentador de Meses */}
      <div className="bg-gray-100/80 p-1.5 rounded-2xl flex gap-1 border border-gray-200/50 max-w-xl">
        {[
          { label: "Consolidado (Todos)", value: null },
          ...MAINTENANCE_MONTHS
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

      {!readOnly && (
        <div className="rounded-2xl shadow-lg p-6 space-y-4 bg-white border border-gray-200/80">
          <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
            <span className="w-1.5 h-5 rounded-full bg-blue-500 inline-block" />
            Agregar Insumos Masivos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pb-3 border-b border-gray-100">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 uppercase">Sucursal Destino</label>
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
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 uppercase">Mes a Asignar</label>
              <select
                value={date.split("-")[1] ? parseInt(date.split("-")[1]) - 1 : 0}
                onChange={(e) => {
                  const year = date.split("-")[0] || new Date().getFullYear().toString();
                  const newMonth = (parseInt(e.target.value) + 1).toString().padStart(2, '0');
                  setDate(`${year}-${newMonth}-15`);
                }}
                className={inputClass}
              >
                {MAINTENANCE_MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 uppercase">Asignado a</label>
              <input
                type="text"
                placeholder="Nombre del responsable"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-gray-500 uppercase">Lista de Materiales</label>
              <Button onClick={addItemRow} variant="outline" size="sm" className="h-7 text-xs flex gap-1 items-center bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
                <PlusCircle className="w-3.5 h-3.5" /> Agregar fila
              </Button>
            </div>
            
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_auto] gap-2 items-center bg-gray-50/50 p-2 rounded-xl border border-gray-100">
                <input
                  type="text"
                  placeholder="Nombre del Material"
                  value={item.material}
                  onChange={(e) => updateItem(index, 'material', e.target.value)}
                  className={inputClass}
                />
                <input
                  type="number"
                  placeholder="Cantidad"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                  className={inputClass}
                />
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                  <input
                    type="number"
                    placeholder="Precio Unit."
                    value={item.unitCost}
                    onChange={(e) => updateItem(index, 'unitCost', e.target.value)}
                    className={`${inputClass} pl-7 w-full`}
                  />
                </div>
                <button
                  onClick={() => removeItem(index)}
                  className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  title="Eliminar fila"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <Button 
              onClick={() => {
                const count = handleAddCost();
                if (count > 0) {
                  setItems([{ material: "", quantity: "", unitCost: "" }]);
                  setAssignedTo("");
                }
              }} 
              className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200 transition-all flex-1 md:flex-none"
            >
              <Plus className="w-4 h-4" />
              Agregar Lista a Sucursal
            </Button>

            <Button 
              onClick={handleAddToAllBranches}
              variant="outline"
              className="flex items-center gap-2 rounded-xl border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400 transition-all flex-1 md:flex-none"
            >
              <Copy className="w-4 h-4" />
              Agregar Lista a Todas
            </Button>
          </div>
        </div>
      )}

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
              {!readOnly && <th className="px-4 py-3.5 text-center font-bold text-gray-700 uppercase text-[11px] tracking-wider">Acción</th>}
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
                {!readOnly && (
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => dispatch({ type: "DELETE_COST_ENTRY", payload: cost.id })}
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

      {branchCosts.length > 0 && (
        <div
          className="rounded-2xl p-5 border border-blue-200/80"
          style={{ background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)" }}
        >
          <div className="flex justify-between items-center">
            <span className="font-bold text-blue-900">Total de Costos (Sucursal Actual):</span>
            <div className="flex items-center gap-4">
              <span className="text-3xl font-extrabold text-blue-700">${total.toFixed(2)}</span>
              {!readOnly && (
                <Button 
                  onClick={handleClearBranchCosts} 
                  variant="destructive"
                  size="sm"
                  className="flex items-center gap-1 rounded-xl bg-red-600 hover:bg-red-700 shadow-md shadow-red-200"
                >
                  <Trash2 className="w-4 h-4" />
                  Vaciar Sucursal
                </Button>
              )}
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
              const branchTotal = filteredCostEntries
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
                {!readOnly && filteredCostEntries.length > 0 && (
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
                  ${filteredCostEntries.reduce((sum, c) => sum + c.quantity * c.unitCost, 0).toFixed(2)}
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
