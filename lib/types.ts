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

export interface ChecklistEntry {
  id: string;
  branchId: string;
  year: number;
  month: number;
  taskKey: string;
  status: string; // "Realizado" | "No realizado" | "No aplica"
}

export interface OdooTicket {
  id: string;
  asignadoA: string;
  asunto: string;
  estadoKanban: string;
  etapa: string;
  creadoEl: Date | null;
  fechaContacto: Date | null;
  descripcion: string;
  prioridad: string;
  propiedades: string;
  sucursal: string;
  slaMet: boolean;
  slaDays: number | null;
  isOpen: boolean;
}

export interface User {
  id: string;
  username: string;
  password?: string;
  role: "admin" | "branch" | "management";
  branchId?: string | null;
}

export interface HistoryEntry {
  id: string;
  timestamp: string; // ISO string
  entity: "branch" | "calendar" | "planning" | "cost" | "system" | "checklist" | "user";
  action: "add" | "update" | "delete" | "clear" | "sync";
  description: string;
}

export interface MaintenanceState {
  branches: Branch[];
  calendarEntries: CalendarEntry[];
  planningEntries: PlanningEntry[];
  costEntries: CostEntry[];
  checklistEntries: ChecklistEntry[];
  users: User[];
  currentYear: number;
  historyLog: HistoryEntry[];
  odooTickets?: OdooTicket[];
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
  | { type: "CLEAR_BRANCH_COSTS"; payload: string }
  | { type: "CLEAR_ALL_COSTS" }
  | { type: "UPDATE_CHECKLIST_ENTRY"; payload: ChecklistEntry }
  | { type: "BULK_UPDATE_CHECKLIST"; payload: { branchId: string; year: number; month: number; entries: ChecklistEntry[] } }
  | { type: "CLEAR_CHECKLIST"; payload: { branchId: string; year: number; month: number } }
  | { type: "ADD_USER"; payload: User }
  | { type: "UPDATE_USER"; payload: User }
  | { type: "DELETE_USER"; payload: string }
  | { type: "SET_YEAR"; payload: number }
  | { type: "LOAD_STATE"; payload: MaintenanceState }
  | { type: "CLEAR_HISTORY" }
  | { type: "SET_ODOO_TICKETS"; payload: OdooTicket[] };

