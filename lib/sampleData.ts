import { Branch, CalendarEntry, PlanningEntry, CostEntry } from "./types";

export const sampleBranches: Branch[] = [
  // Casa Muñoz S.A. branches
  { id: "b1", name: "Oficina CM Matriz", enterprise: "CASA MUÑOZ S.A DE C.V", brand: "Casa Muñoz" },
  { id: "b2", name: "Casa Muñoz | Las Cascadas", enterprise: "CASA MUÑOZ S.A DE C.V", brand: "Casa Muñoz" },
  { id: "b3", name: "Casa Muñoz | La Joya", enterprise: "CASA MUÑOZ S.A DE C.V", brand: "Casa Muñoz" },
  { id: "b4", name: "Casa Muñoz | Plaza Merliot", enterprise: "CASA MUÑOZ S.A DE C.V", brand: "Casa Muñoz" },
  { id: "b5", name: "Casa Muñoz | Metrocentro SS", enterprise: "CASA MUÑOZ S.A DE C.V", brand: "Casa Muñoz" },
  { id: "b6", name: "Casa Muñoz | Metrosur", enterprise: "CASA MUÑOZ S.A DE C.V", brand: "Casa Muñoz" },
  { id: "b7", name: "Casa Muñoz | Plaza Mundo Soyapango", enterprise: "CASA MUÑOZ S.A DE C.V", brand: "Casa Muñoz" },
  { id: "b8", name: "Casa Muñoz | Plaza Mundo Apopa", enterprise: "CASA MUÑOZ S.A DE C.V", brand: "Casa Muñoz" },
  { id: "b9", name: "Casa Muñoz | El Encuentro Lourdes", enterprise: "CASA MUÑOZ S.A DE C.V", brand: "Casa Muñoz" },
  { id: "b10", name: "Casa Muñoz | El Encuentro Sonsonate", enterprise: "CASA MUÑOZ S.A DE C.V", brand: "Casa Muñoz" },
  { id: "b11", name: "Casa Muñoz | Metrocentro Santa Ana", enterprise: "CASA MUÑOZ S.A DE C.V", brand: "Casa Muñoz" },
  { id: "b12", name: "Centro de Formación Autopista Sur", enterprise: "CASA MUÑOZ S.A DE C.V", brand: "Casa Muñoz" },
  { id: "b13", name: "Casa Muñoz | Las Ramblas", enterprise: "CASA MUÑOZ S.A DE C.V", brand: "Casa Muñoz" },
  { id: "b14", name: "Casa Muñoz | Sensuntepeque", enterprise: "CASA MUÑOZ S.A DE C.V", brand: "Casa Muñoz" },
  { id: "b15", name: "Casa Muñoz | Plaza Mundo Usulután", enterprise: "CASA MUÑOZ S.A DE C.V", brand: "Casa Muñoz" },
  { id: "b16", name: "Kiosco | Kiosco Soyapango", enterprise: "CASA MUÑOZ S.A DE C.V", brand: "Casa Muñoz" },
  { id: "b17", name: "Casa Muñoz | eCommerce", enterprise: "CASA MUÑOZ S.A DE C.V", brand: "Casa Muñoz" },
  { id: "b18", name: "Casa Muñoz | Galerias", enterprise: "CASA MUÑOZ S.A DE C.V", brand: "Casa Muñoz" },
  { id: "b19", name: "Casa Muñoz | Paseo Venecia", enterprise: "CASA MUÑOZ S.A DE C.V", brand: "Casa Muñoz" },
  { id: "b20", name: "Casa Muñoz | Surft City", enterprise: "CASA MUÑOZ S.A DE C.V", brand: "Casa Muñoz" },
  { id: "b21", name: "Casa Muñoz | Colonia Medica", enterprise: "CASA MUÑOZ S.A DE C.V", brand: "Casa Muñoz" },
  
  // ELÁN branches
  { id: "b22", name: "ELÁN | Plaza Madero", enterprise: "CASA MUÑOZ S.A DE C.V", brand: "ELÁN" },
  { id: "b23", name: "ELÁN | Millennium Plaza", enterprise: "CASA MUÑOZ S.A DE C.V", brand: "ELÁN" },
  { id: "b24", name: "ELÁN | Espacio San Benito", enterprise: "CASA MUÑOZ S.A DE C.V", brand: "ELÁN" },
  
  // Beauty Hub S.A. branches
  { id: "b25", name: "Beauty Hub | ESLAB UCA", enterprise: "BEAUTY HUB S.A. DE C.V.", brand: "Beauty Hub" },
  { id: "b26", name: "Beauty Hub | ESLAB San Benito", enterprise: "BEAUTY HUB S.A. DE C.V.", brand: "Beauty Hub" },
  { id: "b27", name: "Beauty Hub | ESLAB Galerias", enterprise: "BEAUTY HUB S.A. DE C.V.", brand: "Beauty Hub" },
  { id: "b28", name: "Beauty Hub | ESLAB PMS", enterprise: "BEAUTY HUB S.A. DE C.V.", brand: "Beauty Hub" },
];

export const sampleCalendarEntries: CalendarEntry[] = [
  // b1
  { branchId: "b1", year: 2025, month: 1, status: "realizado", responsible: "Douglas, Ricardo" },
  { branchId: "b1", year: 2025, month: 2, status: "pendiente", responsible: "" },
  
  // b2
  { branchId: "b2", year: 2025, month: 1, status: "realizado", responsible: "Douglas, Ricardo" },
  { branchId: "b2", year: 2025, month: 2, status: "pendiente", responsible: "" },
  
  // b3
  { branchId: "b3", year: 2025, month: 1, status: "realizado", responsible: "Douglas, Ricardo" },
  { branchId: "b3", year: 2025, month: 2, status: "pendiente", responsible: "" },
  
  // b4
  { branchId: "b4", year: 2025, month: 1, status: "programado", responsible: "Douglas" },
  { branchId: "b4", year: 2025, month: 2, status: "pendiente", responsible: "" },
  
  // b5
  { branchId: "b5", year: 2025, month: 1, status: "realizado", responsible: "Ricardo" },
  { branchId: "b5", year: 2025, month: 2, status: "pendiente", responsible: "" },
  
  // b6
  { branchId: "b6", year: 2025, month: 1, status: "programado", responsible: "Douglas" },
  { branchId: "b6", year: 2025, month: 2, status: "pendiente", responsible: "" },
  
  // b7
  { branchId: "b7", year: 2025, month: 1, status: "realizado", responsible: "Ricardo" },
  { branchId: "b7", year: 2025, month: 2, status: "pendiente", responsible: "" },
  
  // b8
  { branchId: "b8", year: 2025, month: 1, status: "programado", responsible: "Douglas" },
  { branchId: "b8", year: 2025, month: 2, status: "pendiente", responsible: "" },
  
  // b9
  { branchId: "b9", year: 2025, month: 1, status: "realizado", responsible: "Douglas" },
  { branchId: "b9", year: 2025, month: 2, status: "pendiente", responsible: "" },
  
  // b10
  { branchId: "b10", year: 2025, month: 1, status: "programado", responsible: "Douglas, Ricardo" },
  { branchId: "b10", year: 2025, month: 2, status: "pendiente", responsible: "" },
  
  // b11
  { branchId: "b11", year: 2025, month: 1, status: "realizado", responsible: "Ricardo" },
  { branchId: "b11", year: 2025, month: 2, status: "pendiente", responsible: "" },
  
  // b12
  { branchId: "b12", year: 2025, month: 1, status: "programado", responsible: "Douglas" },
  { branchId: "b12", year: 2025, month: 2, status: "pendiente", responsible: "" },
  
  // b13
  { branchId: "b13", year: 2025, month: 1, status: "realizado", responsible: "Douglas, Ricardo" },
  { branchId: "b13", year: 2025, month: 2, status: "pendiente", responsible: "" },
  
  // b14
  { branchId: "b14", year: 2025, month: 1, status: "programado", responsible: "Douglas, Ricardo" },
  { branchId: "b14", year: 2025, month: 2, status: "pendiente", responsible: "" },
  
  // b15
  { branchId: "b15", year: 2025, month: 1, status: "realizado", responsible: "Douglas, Ricardo" },
  { branchId: "b15", year: 2025, month: 2, status: "pendiente", responsible: "" },
  
  // b16
  { branchId: "b16", year: 2025, month: 1, status: "realizado", responsible: "Douglas, Ricardo" },
  { branchId: "b16", year: 2025, month: 2, status: "pendiente", responsible: "" },
  
  // b17
  { branchId: "b17", year: 2025, month: 1, status: "programado", responsible: "Douglas, Ricardo" },
  { branchId: "b17", year: 2025, month: 2, status: "pendiente", responsible: "" },
  
  // b18
  { branchId: "b18", year: 2025, month: 1, status: "realizado", responsible: "Douglas, Ricardo" },
  { branchId: "b18", year: 2025, month: 2, status: "pendiente", responsible: "" },
  
  // b19 ELÁN
  { branchId: "b19", year: 2025, month: 2, status: "programado", responsible: "Ricardo" },
  { branchId: "b19", year: 2025, month: 3, status: "pendiente", responsible: "" },
  
  // b20
  { branchId: "b20", year: 2025, month: 2, status: "realizado", responsible: "Douglas, Ricardo" },
  { branchId: "b20", year: 2025, month: 3, status: "pendiente", responsible: "" },
  
  // b21
  { branchId: "b21", year: 2025, month: 2, status: "programado", responsible: "Douglas" },
  { branchId: "b21", year: 2025, month: 3, status: "pendiente", responsible: "" },
  
  // b22 Beauty Hub
  { branchId: "b22", year: 2025, month: 0, status: "realizado", responsible: "Douglas, Ricardo" },
  { branchId: "b22", year: 2025, month: 1, status: "pendiente", responsible: "" },
  
  // b23
  { branchId: "b23", year: 2025, month: 0, status: "programado", responsible: "Douglas, Ricardo" },
  { branchId: "b23", year: 2025, month: 1, status: "pendiente", responsible: "" },
  
  // b24
  { branchId: "b24", year: 2025, month: 0, status: "realizado", responsible: "Douglas, Ricardo" },
  { branchId: "b24", year: 2025, month: 1, status: "pendiente", responsible: "" },
  
  // b25
  { branchId: "b25", year: 2025, month: 0, status: "pendiente", responsible: "" },
  { branchId: "b25", year: 2025, month: 1, status: "pendiente", responsible: "" },
  
  // b26
  { branchId: "b26", year: 2025, month: 0, status: "programado", responsible: "Douglas, Ricardo" },
  { branchId: "b26", year: 2025, month: 1, status: "pendiente", responsible: "" },
  
  // b27
  { branchId: "b27", year: 2025, month: 0, status: "realizado", responsible: "Douglas, Ricardo" },
  { branchId: "b27", year: 2025, month: 1, status: "pendiente", responsible: "" },
  
  // b28
  { branchId: "b28", year: 2025, month: 0, status: "pendiente", responsible: "" },
  { branchId: "b28", year: 2025, month: 1, status: "pendiente", responsible: "" },
];

export const samplePlanningEntries: PlanningEntry[] = [
  { id: "p1", branchId: "b1", scheduledDate: new Date(2026, 5, 1), technicalResponsible: "Douglas, Ricardo", advanceStatus: "listo" },
  { id: "p2", branchId: "b2", scheduledDate: new Date(2026, 5, 3), technicalResponsible: "Douglas, Ricardo", advanceStatus: "listo" },
  { id: "p3", branchId: "b3", scheduledDate: new Date(2026, 5, 5), technicalResponsible: "Douglas, Ricardo", advanceStatus: "listo" },
  { id: "p4", branchId: "b4", scheduledDate: new Date(2026, 5, 9), technicalResponsible: "Douglas", advanceStatus: "en_proceso" },
  { id: "p5", branchId: "b5", scheduledDate: new Date(2026, 5, 7), technicalResponsible: "Ricardo", advanceStatus: "listo" },
  { id: "p6", branchId: "b6", scheduledDate: new Date(2026, 5, 7), technicalResponsible: "Douglas", advanceStatus: "listo" },
  { id: "p7", branchId: "b7", scheduledDate: new Date(2026, 5, 9), technicalResponsible: "Ricardo", advanceStatus: "en_proceso" },
  { id: "p8", branchId: "b8", scheduledDate: new Date(2026, 5, 11), technicalResponsible: "Douglas", advanceStatus: "listo" },
  { id: "p9", branchId: "b9", scheduledDate: new Date(2026, 5, 13), technicalResponsible: "Douglas", advanceStatus: "pendiente" },
  { id: "p10", branchId: "b10", scheduledDate: new Date(2026, 5, 15), technicalResponsible: "Douglas, Ricardo", advanceStatus: "listo" },
  { id: "p11", branchId: "b11", scheduledDate: new Date(2026, 5, 11), technicalResponsible: "Ricardo", advanceStatus: "en_proceso" },
  { id: "p12", branchId: "b12", scheduledDate: new Date(2026, 5, 17), technicalResponsible: "Douglas", advanceStatus: "listo" },
  { id: "p13", branchId: "b13", scheduledDate: new Date(2026, 5, 19), technicalResponsible: "Douglas, Ricardo", advanceStatus: "listo" },
  { id: "p14", branchId: "b14", scheduledDate: new Date(2026, 5, 21), technicalResponsible: "Douglas, Ricardo", advanceStatus: "en_proceso" },
  { id: "p15", branchId: "b15", scheduledDate: new Date(2026, 5, 23), technicalResponsible: "Douglas, Ricardo", advanceStatus: "listo" },
  { id: "p16", branchId: "b16", scheduledDate: new Date(2026, 5, 25), technicalResponsible: "Douglas, Ricardo", advanceStatus: "listo" },
  { id: "p17", branchId: "b17", scheduledDate: new Date(2026, 5, 27), technicalResponsible: "Douglas, Ricardo", advanceStatus: "pendiente" },
  { id: "p18", branchId: "b18", scheduledDate: new Date(2026, 5, 29), technicalResponsible: "Douglas, Ricardo", advanceStatus: "listo" },
  { id: "p19", branchId: "b19", scheduledDate: new Date(2026, 6, 31), technicalResponsible: "Ricardo", advanceStatus: "en_proceso" },
  { id: "p20", branchId: "b20", scheduledDate: new Date(2026, 7, 2), technicalResponsible: "Douglas, Ricardo", advanceStatus: "listo" },
  { id: "p21", branchId: "b21", scheduledDate: new Date(2026, 6, 31), technicalResponsible: "Douglas", advanceStatus: "pendiente" },
  { id: "p22", branchId: "b22", scheduledDate: new Date(2026, 4, 25), technicalResponsible: "Douglas, Ricardo", advanceStatus: "listo" },
  { id: "p23", branchId: "b23", scheduledDate: new Date(2026, 4, 26), technicalResponsible: "Douglas, Ricardo", advanceStatus: "en_proceso" },
  { id: "p24", branchId: "b24", scheduledDate: new Date(2026, 4, 27), technicalResponsible: "Douglas, Ricardo", advanceStatus: "listo" },
  { id: "p25", branchId: "b25", scheduledDate: new Date(2026, 4, 28), technicalResponsible: "Douglas", advanceStatus: "pendiente" },
];

export const sampleCostEntries: CostEntry[] = [
  { id: "c1", branchId: "b1", date: new Date(2026, 5, 1), material: "Lubricante", quantity: 5, unitCost: 25, assignedTo: "Douglas, Ricardo" },
  { id: "c2", branchId: "b2", date: new Date(2026, 5, 3), material: "Filtro aire", quantity: 3, unitCost: 15, assignedTo: "Douglas, Ricardo" },
  { id: "c3", branchId: "b3", date: new Date(2026, 5, 5), material: "Grasa", quantity: 2, unitCost: 20, assignedTo: "Douglas, Ricardo" },
  { id: "c4", branchId: "b4", date: new Date(2026, 5, 9), material: "Tuercas", quantity: 10, unitCost: 5, assignedTo: "Douglas" },
  { id: "c5", branchId: "b5", date: new Date(2026, 5, 7), material: "Correas", quantity: 4, unitCost: 30, assignedTo: "Ricardo" },
  { id: "c6", branchId: "b6", date: new Date(2026, 5, 7), material: "Rodamientos", quantity: 2, unitCost: 50, assignedTo: "Douglas" },
  { id: "c7", branchId: "b7", date: new Date(2026, 5, 9), material: "Mangueras", quantity: 6, unitCost: 12, assignedTo: "Ricardo" },
  { id: "c8", branchId: "b8", date: new Date(2026, 5, 11), material: "Pernos", quantity: 20, unitCost: 3, assignedTo: "Douglas" },
  { id: "c9", branchId: "b9", date: new Date(2026, 5, 13), material: "Arandelas", quantity: 30, unitCost: 1, assignedTo: "Douglas" },
  { id: "c10", branchId: "b10", date: new Date(2026, 5, 15), material: "Aceite", quantity: 10, unitCost: 18, assignedTo: "Douglas, Ricardo" },
  { id: "c11", branchId: "b22", date: new Date(2026, 4, 25), material: "Sellador", quantity: 5, unitCost: 22, assignedTo: "Douglas, Ricardo" },
  { id: "c12", branchId: "b23", date: new Date(2026, 4, 26), material: "Limpiador", quantity: 3, unitCost: 10, assignedTo: "Douglas, Ricardo" },
  { id: "c13", branchId: "b24", date: new Date(2026, 4, 27), material: "Pintura", quantity: 2, unitCost: 40, assignedTo: "Douglas, Ricardo" },
];
