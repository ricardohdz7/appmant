export type Enterprise = "CASA MUÑOZ S.A DE C.V" | "BEAUTY HUB S.A. DE C.V.";
export type Brand = "Casa Muñoz" | "ELÁN" | "Beauty Hub";
export type MaintenanceStatus = "programado" | "pendiente" | "realizado" | "";
export type AdvanceStatus = "pendiente" | "en_proceso" | "listo";

export interface Branch {
  id: string;
  name: string;
  enterprise: Enterprise;
  brand: Brand;
}

export interface CalendarEntry {
  branchId: string;
  year: number;
  month: number; // 0-11
  status: MaintenanceStatus;
  responsible: string;
}

export interface PlanningEntry {
  id: string;
  branchId: string;
  scheduledDate: Date;
  technicalResponsible: string;
  advanceStatus: AdvanceStatus;
}

export interface CostEntry {
  id: string;
  branchId: string;
  date: Date;
  material: string;
  quantity: number;
  unitCost: number;
  assignedTo: string;
}

export interface MaintenanceState {
  branches: Branch[];
  calendarEntries: CalendarEntry[];
  planningEntries: PlanningEntry[];
  costEntries: CostEntry[];
  currentYear: number;
}

export type MaintenanceAction =
  | { type: "ADD_BRANCH"; payload: Branch }
  | { type: "DELETE_BRANCH"; payload: string }
  | { type: "ADD_CALENDAR_ENTRY"; payload: CalendarEntry }
  | { type: "UPDATE_CALENDAR_ENTRY"; payload: CalendarEntry }
  | { type: "ADD_PLANNING_ENTRY"; payload: PlanningEntry }
  | { type: "UPDATE_PLANNING_ENTRY"; payload: PlanningEntry }
  | { type: "DELETE_PLANNING_ENTRY"; payload: string }
  | { type: "ADD_COST_ENTRY"; payload: CostEntry }
  | { type: "DELETE_COST_ENTRY"; payload: string }
  | { type: "SET_YEAR"; payload: number }
  | { type: "LOAD_STATE"; payload: MaintenanceState };
