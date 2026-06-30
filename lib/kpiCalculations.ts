import { MaintenanceState, CalendarEntry, PlanningEntry, CostEntry } from "./types";

export interface KPI {
  label: string;
  value: number;
  total?: number;
  percentage?: number;
  color?: "green" | "blue" | "red" | "gray";
}

export function calculateKPIs(state: MaintenanceState): KPI[] {
  const { branches, calendarEntries, planningEntries, costEntries, currentYear } = state;

  // Filter entries for current year
  const yearCalendarEntries = calendarEntries.filter((e) => e.year === currentYear);
  const yearPlanningEntries = planningEntries;
  const yearCostEntries = costEntries.filter((e) => {
    const d = e.date instanceof Date ? e.date : new Date(e.date);
    return d.getFullYear() === currentYear;
  });

  // Total branches
  const totalBranches = branches.length;

  // Calendar compliance
  const totalExpectedMaintenances = totalBranches * 12;
  const completedMaintenances = yearCalendarEntries.filter((e) => e.status === "realizado").length;
  const scheduledMaintenances = yearCalendarEntries.filter((e) => e.status === "programado").length;
  const pendingMaintenances = yearCalendarEntries.filter((e) => e.status === "pendiente").length;

  // Planning status
  const totalPlanning = yearPlanningEntries.length;
  const readyPlanning = yearPlanningEntries.filter((p) => p.advanceStatus === "listo").length;
  const inProcessPlanning = yearPlanningEntries.filter((p) => p.advanceStatus === "en_proceso").length;
  const pendingPlanning = yearPlanningEntries.filter((p) => p.advanceStatus === "pendiente").length;

  // Costs
  const totalCosts = yearCostEntries.reduce((sum, c) => sum + c.quantity * c.unitCost, 0);
  const totalCostEntries = yearCostEntries.length;

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
      percentage: Math.round((completedMaintenances / totalExpectedMaintenances) * 100),
      color: "green",
    },
    {
      label: "Mantenimientos Programados",
      value: scheduledMaintenances,
      total: totalExpectedMaintenances,
      percentage: Math.round((scheduledMaintenances / totalExpectedMaintenances) * 100),
      color: "blue",
    },
    {
      label: "Mantenimientos Pendientes",
      value: pendingMaintenances,
      total: totalExpectedMaintenances,
      percentage: Math.round((pendingMaintenances / totalExpectedMaintenances) * 100),
      color: "red",
    },
    {
      label: "Cumplimiento General",
      value: Math.round((completedMaintenances / totalExpectedMaintenances) * 100),
      percentage: Math.round((completedMaintenances / totalExpectedMaintenances) * 100),
      color: completedMaintenances / totalExpectedMaintenances > 0.7 ? "green" : "red",
    },
    {
      label: "Planeación Lista",
      value: readyPlanning,
      total: totalPlanning,
      percentage: totalPlanning > 0 ? Math.round((readyPlanning / totalPlanning) * 100) : 0,
      color: "green",
    },
    {
      label: "Planeación en Proceso",
      value: inProcessPlanning,
      total: totalPlanning,
      percentage: totalPlanning > 0 ? Math.round((inProcessPlanning / totalPlanning) * 100) : 0,
      color: "blue",
    },
    {
      label: "Planeación Pendiente",
      value: pendingPlanning,
      total: totalPlanning,
      percentage: totalPlanning > 0 ? Math.round((pendingPlanning / totalPlanning) * 100) : 0,
      color: "red",
    },
    {
      label: "Costo Total de Insumos",
      value: Math.round(totalCosts),
      color: "blue",
    },
    {
      label: "Cantidad de Registros de Costo",
      value: totalCostEntries,
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
