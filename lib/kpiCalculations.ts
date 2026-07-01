import { MaintenanceState, CalendarEntry, PlanningEntry, CostEntry } from "./types";

export interface KPI {
  label: string;
  value: number | string;
  total?: number;
  percentage?: number;
  color?: "green" | "blue" | "red" | "gray";
}

export function calculateKPIs(state: MaintenanceState, monthFilter: number | null = null): KPI[] {
  const { branches, calendarEntries, planningEntries, costEntries, currentYear } = state;

  // Filter entries for current year
  const yearCalendarEntries = calendarEntries.filter((e) => e.year === currentYear);
  const yearCostEntries = costEntries.filter((e) => {
    const d = e.date instanceof Date ? e.date : new Date(e.date);
    const isSameYear = d.getFullYear() === currentYear;
    if (monthFilter !== null) {
      return isSameYear && d.getMonth() === monthFilter;
    }
    return isSameYear;
  });

  // Total branches
  const totalBranches = branches.length;

  // Calendar compliance
  const totalExpectedMaintenances = monthFilter !== null ? totalBranches : totalBranches * 4;
  const completedMaintenances = yearCalendarEntries.filter((e) => {
    const matchesStatus = e.status === "realizado";
    if (monthFilter !== null) {
      return matchesStatus && e.month === monthFilter;
    }
    return matchesStatus && [0, 3, 6, 9].includes(e.month);
  }).length;

  const pendingMaintenances = yearCalendarEntries.filter((e) => {
    const matchesStatus = e.status === "pendiente";
    if (monthFilter !== null) {
      return matchesStatus && e.month === monthFilter;
    }
    return matchesStatus && [0, 3, 6, 9].includes(e.month);
  }).length;

  // Costs
  const totalCosts = yearCostEntries.reduce((sum, c) => sum + c.quantity * c.unitCost, 0);

  return [
    {
      label: "Total de Sucursales",
      value: totalBranches,
      color: "blue",
    },
    {
      label: "Mantenimientos Realizados",
      value: completedMaintenances,
      total: totalExpectedMaintenances,
      percentage: totalExpectedMaintenances > 0 ? Math.round((completedMaintenances / totalExpectedMaintenances) * 100) : 0,
      color: "green",
    },
    {
      label: "Mantenimientos Pendientes",
      value: pendingMaintenances,
      total: totalExpectedMaintenances,
      percentage: totalExpectedMaintenances > 0 ? Math.round((pendingMaintenances / totalExpectedMaintenances) * 100) : 0,
      color: "red",
    },
    {
      label: "Gasto Total de Insumos",
      value: `$${totalCosts.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      color: "blue",
    },
    {
      label: "Gasto Promedio por Sucursal",
      value: `$${(totalBranches > 0 ? totalCosts / totalBranches : 0).toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      color: "blue",
    },
  ];
}

export function calculateBranchKPIs(state: MaintenanceState, branchId: string): KPI[] {
  const { calendarEntries, planningEntries, costEntries, currentYear } = state;

  const branchCalendar = calendarEntries.filter(
    (e) => e.branchId === branchId && e.year === currentYear
  );
  const branchPlanning = planningEntries.filter((p) => p.branchId === branchId);
  const branchCosts = costEntries.filter((c) => c.branchId === branchId);

  const completed = branchCalendar.filter((e) => e.status === "realizado").length;
  const scheduled = branchCalendar.filter((e) => e.status === "programado").length;
  const pending = branchCalendar.filter((e) => e.status === "pendiente").length;

  return [
    {
      label: "Realizados",
      value: completed,
      percentage: completed,
      color: "green",
    },
    {
      label: "Programados",
      value: scheduled,
      percentage: scheduled,
      color: "blue",
    },
    {
      label: "Pendientes",
      value: pending,
      percentage: pending,
      color: "red",
    },
    {
      label: "Planeaciones",
      value: branchPlanning.length,
      color: "blue",
    },
    {
      label: "Costos",
      value: branchCosts.length,
      color: "blue",
    },
  ];
}

export function getMonthName(month: number): string {
  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  return months[month];
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "realizado":
      return "#10b981"; // green
    case "programado":
      return "#0b4f9e"; // blue
    case "pendiente":
      return "#ef4444"; // red
    case "listo":
      return "#10b981"; // green
    case "en_proceso":
      return "#0b4f9e"; // blue
    default:
      return "#9ca3af"; // gray
  }
}
