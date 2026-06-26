import { MaintenanceState } from "./types";
import { getMonthName } from "./kpiCalculations";

export function exportToCSV(state: MaintenanceState): string {
  const { branches, calendarEntries, currentYear } = state;

  // CSV with UTF-8 BOM for Excel compatibility
  let csv = "\uFEFF"; // UTF-8 BOM

  csv += "Control de Mantenimiento Preventivo\n";
  csv += `Año: ${currentYear}\n\n`;

  csv += "Sucursal,Empresa,Marca,";
  for (let month = 0; month < 12; month++) {
    csv += `${getMonthName(month)},`;
  }
  csv += "\n";

  for (const branch of branches) {
    csv += `"${branch.name}","${branch.enterprise}","${branch.brand}",`;

    for (let month = 0; month < 12; month++) {
      const entry = calendarEntries.find(
        (e) => e.branchId === branch.id && e.month === month && e.year === currentYear
      );
      const status = entry?.status || "";
      const responsible = entry?.responsible || "";
      csv += `"${status} - ${responsible}",`;
    }
    csv += "\n";
  }

  return csv;
}

export function downloadCSV(state: MaintenanceState): void {
  const csv = exportToCSV(state);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", `mantenimiento-${new Date().getFullYear()}.csv`);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadJSON(state: MaintenanceState): void {
  const json = JSON.stringify(state, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", `respaldo-mantenimiento-${new Date().toISOString().split("T")[0]}.json`);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToPDF(): void {
  window.print();
}
