import { Branch, CalendarEntry, PlanningEntry, CostEntry } from "./types";

export const sampleBranches: Branch[] = [
  // Casa Muñoz S.A. branches
  { id: "b1", name: "Casa Muñoz Centro", enterprise: "CASA MUÑOZ S.A DE C.V", brand: "Casa Muñoz" },
  { id: "b2", name: "Casa Muñoz Santa Tecla", enterprise: "CASA MUÑOZ S.A DE C.V", brand: "Casa Muñoz" },
  { id: "b3", name: "Casa Muñoz San Salvador", enterprise: "CASA MUÑOZ S.A DE C.V", brand: "Casa Muñoz" },
  { id: "b4", name: "Casa Muñoz Metrocentro", enterprise: "CASA MUÑOZ S.A DE C.V", brand: "Casa Muñoz" },
  { id: "b5", name: "Casa Muñoz La Paz", enterprise: "CASA MUÑOZ S.A DE C.V", brand: "Casa Muñoz" },
  { id: "b6", name: "ELÁN Centro", enterprise: "CASA MUÑOZ S.A DE C.V", brand: "ELÁN" },
  { id: "b7", name: "ELÁN Colón", enterprise: "CASA MUÑOZ S.A DE C.V", brand: "ELÁN" },
  { id: "b8", name: "ELÁN Santa Tecla", enterprise: "CASA MUÑOZ S.A DE C.V", brand: "ELÁN" },
  { id: "b9", name: "ELÁN San Salvador", enterprise: "CASA MUÑOZ S.A DE C.V", brand: "ELÁN" },
  { id: "b10", name: "ELÁN Antiguo Cuscatlán", enterprise: "CASA MUÑOZ S.A DE C.V", brand: "ELÁN" },
  { id: "b11", name: "ELÁN Soyapango", enterprise: "CASA MUÑOZ S.A DE C.V", brand: "ELÁN" },
  { id: "b12", name: "ELÁN Ilopango", enterprise: "CASA MUÑOZ S.A DE C.V", brand: "ELÁN" },
  { id: "b13", name: "ELÁN San Martín", enterprise: "CASA MUÑOZ S.A DE C.V", brand: "ELÁN" },
  
  // Beauty Hub S.A. branches
  { id: "b14", name: "Beauty Hub Centro", enterprise: "BEAUTY HUB S.A. DE C.V.", brand: "Beauty Hub" },
  { id: "b15", name: "Beauty Hub Santa Tecla", enterprise: "BEAUTY HUB S.A. DE C.V.", brand: "Beauty Hub" },
  { id: "b16", name: "Beauty Hub Metrocentro", enterprise: "BEAUTY HUB S.A. DE C.V.", brand: "Beauty Hub" },
  { id: "b17", name: "Beauty Hub Antiguo Cuscatlán", enterprise: "BEAUTY HUB S.A. DE C.V.", brand: "Beauty Hub" },
  { id: "b18", name: "Beauty Hub San Salvador", enterprise: "BEAUTY HUB S.A. DE C.V.", brand: "Beauty Hub" },
  { id: "b19", name: "Beauty Hub Soyapango", enterprise: "BEAUTY HUB S.A. DE C.V.", brand: "Beauty Hub" },
  { id: "b20", name: "Beauty Hub Ilopango", enterprise: "BEAUTY HUB S.A. DE C.V.", brand: "Beauty Hub" },
  { id: "b21", name: "Beauty Hub Santa Ana", enterprise: "BEAUTY HUB S.A. DE C.V.", brand: "Beauty Hub" },
  { id: "b22", name: "Beauty Hub Sonsonate", enterprise: "BEAUTY HUB S.A. DE C.V.", brand: "Beauty Hub" },
  { id: "b23", name: "Beauty Hub La Paz", enterprise: "BEAUTY HUB S.A. DE C.V.", brand: "Beauty Hub" },
  { id: "b24", name: "Beauty Hub Cojutepeque", enterprise: "BEAUTY HUB S.A. DE C.V.", brand: "Beauty Hub" },
];

export const sampleCalendarEntries: CalendarEntry[] = [
  { branchId: "b1", year: 2025, month: 0, status: "realizado", responsible: "Juan Pérez" },
  { branchId: "b1", year: 2025, month: 1, status: "", responsible: "" },
  { branchId: "b1", year: 2025, month: 2, status: "", responsible: "" },
  { branchId: "b1", year: 2025, month: 3, status: "programado", responsible: "Juan Pérez" },
  { branchId: "b1", year: 2025, month: 4, status: "", responsible: "" },
  { branchId: "b1", year: 2025, month: 5, status: "", responsible: "" },
  { branchId: "b1", year: 2025, month: 6, status: "programado", responsible: "Juan Pérez" },
  { branchId: "b1", year: 2025, month: 7, status: "pendiente", responsible: "" },
  { branchId: "b1", year: 2025, month: 8, status: "", responsible: "" },
  { branchId: "b1", year: 2025, month: 9, status: "programado", responsible: "Juan Pérez" },
  { branchId: "b1", year: 2025, month: 10, status: "", responsible: "" },
  { branchId: "b1", year: 2025, month: 11, status: "", responsible: "" },
  
  { branchId: "b2", year: 2025, month: 0, status: "programado", responsible: "María González" },
  { branchId: "b2", year: 2025, month: 1, status: "", responsible: "" },
  { branchId: "b2", year: 2025, month: 2, status: "", responsible: "" },
  { branchId: "b2", year: 2025, month: 3, status: "realizado", responsible: "María González" },
  { branchId: "b2", year: 2025, month: 4, status: "", responsible: "" },
  { branchId: "b2", year: 2025, month: 5, status: "", responsible: "" },
  { branchId: "b2", year: 2025, month: 6, status: "pendiente", responsible: "" },
  { branchId: "b2", year: 2025, month: 7, status: "", responsible: "" },
  { branchId: "b2", year: 2025, month: 8, status: "", responsible: "" },
  { branchId: "b2", year: 2025, month: 9, status: "realizado", responsible: "María González" },
  { branchId: "b2", year: 2025, month: 10, status: "", responsible: "" },
  { branchId: "b2", year: 2025, month: 11, status: "", responsible: "" },
];

export const samplePlanningEntries: PlanningEntry[] = [
  {
    id: "p1",
    branchId: "b1",
    scheduledDate: new Date(2025, 0, 15),
    technicalResponsible: "Juan Pérez",
    advanceStatus: "listo",
  },
  {
    id: "p2",
    branchId: "b2",
    scheduledDate: new Date(2025, 0, 20),
    technicalResponsible: "María González",
    advanceStatus: "en_proceso",
  },
  {
    id: "p3",
    branchId: "b3",
    scheduledDate: new Date(2025, 1, 10),
    technicalResponsible: "Carlos López",
    advanceStatus: "pendiente",
  },
];

export const sampleCostEntries: CostEntry[] = [
  {
    id: "c1",
    branchId: "b1",
    date: new Date(2025, 0, 15),
    material: "Lubricante",
    quantity: 5,
    unitCost: 25,
    assignedTo: "Juan Pérez",
  },
  {
    id: "c2",
    branchId: "b2",
    date: new Date(2025, 0, 20),
    material: "Filtro de aire",
    quantity: 10,
    unitCost: 15,
    assignedTo: "María González",
  },
];
