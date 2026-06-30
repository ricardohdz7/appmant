import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { sampleBranches, sampleCalendarEntries, samplePlanningEntries, sampleCostEntries } from "@/lib/sampleData";

const DB_PATH = path.join(process.cwd(), "data", "database.json");

// Helper to ensure database file exists
async function ensureDb() {
  try {
    await fs.access(DB_PATH);
  } catch {
    // If it doesn't exist, create it with sample data
    const initialData = {
      branches: sampleBranches,
      calendarEntries: sampleCalendarEntries,
      planningEntries: samplePlanningEntries,
      costEntries: sampleCostEntries,
      currentYear: 2025,
      historyLog: [
        {
          id: "hist-init",
          timestamp: new Date().toISOString(),
          entity: "system",
          action: "sync",
          description: "Base de datos inicializada con datos de muestra"
        }
      ]
    };
    // Ensure parent directory exists
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
    await fs.writeFile(DB_PATH, JSON.stringify(initialData, null, 2), "utf8");
  }
}

export async function GET() {
  try {
    await ensureDb();
    const data = await fs.readFile(DB_PATH, "utf8");
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    console.error("Failed to GET database", error);
    return NextResponse.json({ error: "Failed to read database" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureDb();
    const newData = await request.json();
    const oldDataStr = await fs.readFile(DB_PATH, "utf8");
    const oldData = JSON.parse(oldDataStr);

    // Compute differences to generate history log entries!
    const newHistoryEntries: any[] = [];

    // Helper to generate a unique ID for history entries
    const genHistId = () => `hist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // 1. Detect Branch changes
    const oldBranches = oldData.branches || [];
    const newBranches = newData.branches || [];
    
    // Added branches
    newBranches.forEach((newB: any) => {
      if (!oldBranches.some((oldB: any) => oldB.id === newB.id)) {
        newHistoryEntries.push({
          id: genHistId(),
          timestamp: new Date().toISOString(),
          entity: "branch",
          action: "add",
          description: `Se agregó la sucursal "${newB.name}" (${newB.brand})`
        });
      }
    });

    // Deleted branches
    oldBranches.forEach((oldB: any) => {
      if (!newBranches.some((newB: any) => newB.id === oldB.id)) {
        newHistoryEntries.push({
          id: genHistId(),
          timestamp: new Date().toISOString(),
          entity: "branch",
          action: "delete",
          description: `Se eliminó la sucursal "${oldB.name}"`
        });
      }
    });

    // 2. Detect Calendar changes
    const oldCalendar = oldData.calendarEntries || [];
    const newCalendar = newData.calendarEntries || [];

    // Find updates and additions
    newCalendar.forEach((newC: any) => {
      const oldC = oldCalendar.find(
        (c: any) => c.branchId === newC.branchId && c.month === newC.month && c.year === newC.year
      );
      const branchName = newBranches.find((b: any) => b.id === newC.branchId)?.name || "Sucursal";
      const monthName = getMonthNameSpanish(newC.month);

      if (!oldC) {
        if (newC.status) {
          newHistoryEntries.push({
            id: genHistId(),
            timestamp: new Date().toISOString(),
            entity: "calendar",
            action: "add",
            description: `Se programó mantenimiento para "${branchName}" en ${monthName} ${newC.year} (Estado: ${newC.status})`
          });
        }
      } else {
        if (oldC.status !== newC.status) {
          const prevStatus = oldC.status || "sin datos";
          const nextStatus = newC.status || "sin datos";
          newHistoryEntries.push({
            id: genHistId(),
            timestamp: new Date().toISOString(),
            entity: "calendar",
            action: "update",
            description: `Se cambió estado de mantenimiento para "${branchName}" en ${monthName} ${newC.year} de "${prevStatus}" a "${nextStatus}"`
          });
        }
        if (oldC.responsible !== newC.responsible && newC.responsible) {
          newHistoryEntries.push({
            id: genHistId(),
            timestamp: new Date().toISOString(),
            entity: "calendar",
            action: "update",
            description: `Se asignó a "${newC.responsible}" como responsable del mantenimiento de "${branchName}" en ${monthName} ${newC.year}`
          });
        }
      }
    });

    // 3. Detect Cost changes
    const oldCosts = oldData.costEntries || [];
    const newCosts = newData.costEntries || [];

    // Added costs
    newCosts.forEach((newCo: any) => {
      if (!oldCosts.some((oldCo: any) => oldCo.id === newCo.id)) {
        const branchName = newBranches.find((b: any) => b.id === newCo.branchId)?.name || "Sucursal";
        const totalCost = newCo.quantity * newCo.unitCost;
        newHistoryEntries.push({
          id: genHistId(),
          timestamp: new Date().toISOString(),
          entity: "cost",
          action: "add",
          description: `Se agregó costo de insumo: "${newCo.material}" (${newCo.quantity} x $${newCo.unitCost.toFixed(2)} = $${totalCost.toFixed(2)}) para "${branchName}"`
        });
      }
    });

    // Deleted costs
    oldCosts.forEach((oldCo: any) => {
      if (!newCosts.some((newCo: any) => newCo.id === oldCo.id)) {
        const branchName = oldBranches.find((b: any) => b.id === oldCo.branchId)?.name || "Sucursal";
        newHistoryEntries.push({
          id: genHistId(),
          timestamp: new Date().toISOString(),
          entity: "cost",
          action: "delete",
          description: `Se eliminó costo de insumo: "${oldCo.material}" para "${branchName}"`
        });
      }
    });

    // 4. Detect Planning changes
    const oldPlanning = oldData.planningEntries || [];
    const newPlanning = newData.planningEntries || [];

    // Added planning
    newPlanning.forEach((newP: any) => {
      if (!oldPlanning.some((oldP: any) => oldP.id === newP.id)) {
        const branchName = newBranches.find((b: any) => b.id === newP.branchId)?.name || "Sucursal";
        const dateStr = new Date(newP.scheduledDate).toLocaleDateString("es-ES");
        newHistoryEntries.push({
          id: genHistId(),
          timestamp: new Date().toISOString(),
          entity: "planning",
          action: "add",
          description: `Se creó planeación para "${branchName}" programada para el ${dateStr} con responsable "${newP.technicalResponsible}"`
        });
      }
    });

    // Updated planning
    newPlanning.forEach((newP: any) => {
      const oldP = oldPlanning.find((p: any) => p.id === newP.id);
      if (oldP) {
        const branchName = newBranches.find((b: any) => b.id === newP.branchId)?.name || "Sucursal";
        const oldDateStr = new Date(oldP.scheduledDate).toLocaleDateString("es-ES");
        const newDateStr = new Date(newP.scheduledDate).toLocaleDateString("es-ES");
        
        if (oldDateStr !== newDateStr) {
          newHistoryEntries.push({
            id: genHistId(),
            timestamp: new Date().toISOString(),
            entity: "planning",
            action: "update",
            description: `Se reprogramó mantenimiento de "${branchName}" del ${oldDateStr} al ${newDateStr}`
          });
        }
        if (oldP.advanceStatus !== newP.advanceStatus) {
          newHistoryEntries.push({
            id: genHistId(),
            timestamp: new Date().toISOString(),
            entity: "planning",
            action: "update",
            description: `Se actualizó avance de planeación para "${branchName}" a "${newP.advanceStatus}"`
          });
        }
        if (oldP.technicalResponsible !== newP.technicalResponsible) {
          newHistoryEntries.push({
            id: genHistId(),
            timestamp: new Date().toISOString(),
            entity: "planning",
            action: "update",
            description: `Se cambió el responsable técnico de "${branchName}" a "${newP.technicalResponsible}"`
          });
        }
      }
    });

    // Deleted planning
    oldPlanning.forEach((oldP: any) => {
      if (!newPlanning.some((newP: any) => newP.id === oldP.id)) {
        const branchName = oldBranches.find((b: any) => b.id === oldP.branchId)?.name || "Sucursal";
        const dateStr = new Date(oldP.scheduledDate).toLocaleDateString("es-ES");
        newHistoryEntries.push({
          id: genHistId(),
          timestamp: new Date().toISOString(),
          entity: "planning",
          action: "delete",
          description: `Se eliminó planeación para "${branchName}" del ${dateStr}`
        });
      }
    });

    // Detect "CLEAR_BRANCH_COSTS" or "CLEAR_ALL_COSTS"
    if (oldCosts.length > 0 && newCosts.length === 0 && oldData.branches?.length === newData.branches?.length) {
      newHistoryEntries.push({
        id: genHistId(),
        timestamp: new Date().toISOString(),
        entity: "cost",
        action: "clear",
        description: "Se vaciaron todos los costos de insumos del sistema"
      });
    }

    // Merge new logs into existing log (limit to 500 entries to prevent database bloating)
    const existingLog = oldData.historyLog || [];
    let updatedLog = [...newHistoryEntries, ...existingLog];

    // If client requested clearing history log (sending historyLog as empty and no new logs)
    if (newData.historyLog && newData.historyLog.length === 0 && newHistoryEntries.length === 0) {
      updatedLog = [];
    }

    // Slice to limit size
    updatedLog = updatedLog.slice(0, 500);

    // Save back to JSON file
    const dataToSave = {
      branches: newData.branches,
      calendarEntries: newData.calendarEntries,
      planningEntries: newData.planningEntries,
      costEntries: newData.costEntries,
      currentYear: newData.currentYear,
      historyLog: updatedLog
    };

    await fs.writeFile(DB_PATH, JSON.stringify(dataToSave, null, 2), "utf8");
    return NextResponse.json(dataToSave);
  } catch (error) {
    console.error("Error updating database", error);
    return NextResponse.json({ error: "Failed to update database" }, { status: 500 });
  }
}

function getMonthNameSpanish(monthNum: number): string {
  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  return months[monthNum] || `Mes ${monthNum}`;
}
