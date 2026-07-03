import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sampleBranches, sampleCalendarEntries, samplePlanningEntries, sampleCostEntries } from "@/lib/sampleData";

function normalizeUsername(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
    .substring(0, 40);
}

// Helper to seed database with sample data
async function seedDatabase() {
  await prisma.$transaction(async (tx: any) => {
    if (sampleBranches.length > 0) await tx.branch.createMany({ data: sampleBranches });
    if (sampleCalendarEntries.length > 0) {
      await tx.calendarEntry.createMany({ 
        data: sampleCalendarEntries.map(({ branchId, year, month, status, responsible }) => ({ branchId, year, month, status, responsible })) 
      });
    }
    if (samplePlanningEntries.length > 0) {
      await tx.planningEntry.createMany({
        data: samplePlanningEntries.map(p => ({
          ...p,
          scheduledDate: new Date(p.scheduledDate)
        }))
      });
    }
    if (sampleCostEntries.length > 0) {
      await tx.costEntry.createMany({
        data: sampleCostEntries.map(c => ({
          ...c,
          date: new Date(c.date)
        }))
      });
    }
    
    // Seed default admin user
    await tx.user.create({
      data: {
        username: "admin",
        password: "admin2026",
        role: "admin"
      }
    });

    // Seed management/administracion user
    await tx.user.create({
      data: {
        username: "administracion",
        password: "administracion2026",
        role: "management"
      }
    });

    // Seed sucursal users
    if (sampleBranches.length > 0) {
      for (const branch of sampleBranches) {
        await tx.user.create({
          data: {
            username: `sucursal.${normalizeUsername(branch.name)}`,
            password: "sucursal2026",
            role: "branch",
            branchId: branch.id
          }
        });
      }
    }

    await tx.globalState.upsert({
      where: { id: "global" },
      update: { currentYear: 2025 },
      create: { id: "global", currentYear: 2025 }
    });
    await tx.historyEntry.create({
      data: {
        entity: "system",
        action: "sync",
        description: "Base de datos inicializada con datos de muestra y usuarios"
      }
    });
  });
}

export async function GET() {
  try {
    const branchesCount = await prisma.branch.count();
    
    // Seed database if empty
    if (branchesCount === 0) {
      await seedDatabase();
    }

    // Self-heal empty users list
    const usersCount = await prisma.user.count();
    if (usersCount === 0) {
      await prisma.user.create({
        data: {
          username: "admin",
          password: "admin2026",
          role: "admin"
        }
      });
      await prisma.user.create({
        data: {
          username: "administracion",
          password: "administracion2026",
          role: "management"
        }
      });
      const allBranches = await prisma.branch.findMany();
      for (const b of allBranches) {
        await prisma.user.create({
          data: {
            username: `sucursal.${normalizeUsername(b.name)}`,
            password: "sucursal2026",
            role: "branch",
            branchId: b.id
          }
        });
      }
    }

    const [branches, calendarEntries, planningEntries, costEntries, checklistEntries, users, globalState, historyLog, odooTickets] = await Promise.all([
      prisma.branch.findMany(),
      prisma.calendarEntry.findMany(),
      prisma.planningEntry.findMany(),
      prisma.costEntry.findMany(),
      prisma.checklistEntry.findMany(),
      prisma.user.findMany(),
      prisma.globalState.findUnique({ where: { id: "global" } }),
      prisma.historyEntry.findMany({ orderBy: { timestamp: "desc" }, take: 500 }),
      prisma.odooTicket.findMany()
    ]);

    return NextResponse.json({
      branches,
      calendarEntries,
      planningEntries,
      costEntries,
      checklistEntries,
      users,
      currentYear: globalState?.currentYear || 2025,
      historyLog,
      odooTickets
    });
  } catch (error) {
    console.error("Failed to GET database", error);
    return NextResponse.json({ error: "Failed to read database" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newData = await request.json();
    
    // Fetch old data from DB for comparison
    const [oldBranches, oldCalendar, oldPlanning, oldCosts, oldChecklist, oldHistory, oldUsers] = await Promise.all([
      prisma.branch.findMany(),
      prisma.calendarEntry.findMany(),
      prisma.planningEntry.findMany(),
      prisma.costEntry.findMany(),
      prisma.checklistEntry.findMany(),
      prisma.historyEntry.findMany({ orderBy: { timestamp: "desc" } }),
      prisma.user.findMany()
    ]);
    
    const oldData = {
       branches: oldBranches,
       calendarEntries: oldCalendar,
       planningEntries: oldPlanning,
       costEntries: oldCosts,
       checklistEntries: oldChecklist,
       historyLog: oldHistory
    };

    // Compute differences to generate history log entries
    const newHistoryEntries: any[] = [];

    // 1. Detect Branch changes
    const newBranches = newData.branches || [];
    
    // Added branches
    newBranches.forEach((newB: any) => {
      if (!oldBranches.some((oldB: any) => oldB.id === newB.id)) {
        newHistoryEntries.push({
          timestamp: new Date(),
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
          timestamp: new Date(),
          entity: "branch",
          action: "delete",
          description: `Se eliminó la sucursal "${oldB.name}"`
        });
      }
    });

    // 2. Detect Calendar changes
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
            timestamp: new Date(),
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
            timestamp: new Date(),
            entity: "calendar",
            action: "update",
            description: `Se cambió estado de mantenimiento para "${branchName}" en ${monthName} ${newC.year} de "${prevStatus}" a "${nextStatus}"`
          });
        }
        if (oldC.responsible !== newC.responsible && newC.responsible) {
          newHistoryEntries.push({
            timestamp: new Date(),
            entity: "calendar",
            action: "update",
            description: `Se asignó a "${newC.responsible}" como responsable del mantenimiento de "${branchName}" en ${monthName} ${newC.year}`
          });
        }
      }
    });

    // 3. Detect Cost changes
    const newCosts = newData.costEntries || [];

    // Added costs
    newCosts.forEach((newCo: any) => {
      if (!oldCosts.some((oldCo: any) => oldCo.id === newCo.id)) {
        const branchName = newBranches.find((b: any) => b.id === newCo.branchId)?.name || "Sucursal";
        const totalCost = newCo.quantity * newCo.unitCost;
        newHistoryEntries.push({
          timestamp: new Date(),
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
          timestamp: new Date(),
          entity: "cost",
          action: "delete",
          description: `Se eliminó costo de insumo: "${oldCo.material}" para "${branchName}"`
        });
      }
    });

    // 4. Detect Planning changes
    const newPlanning = newData.planningEntries || [];

    // Added planning
    newPlanning.forEach((newP: any) => {
      if (!oldPlanning.some((oldP: any) => oldP.id === newP.id)) {
        const branchName = newBranches.find((b: any) => b.id === newP.branchId)?.name || "Sucursal";
        const dateStr = new Date(newP.scheduledDate).toLocaleDateString("es-ES");
        newHistoryEntries.push({
          timestamp: new Date(),
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
            timestamp: new Date(),
            entity: "planning",
            action: "update",
            description: `Se reprogramó mantenimiento de "${branchName}" del ${oldDateStr} al ${newDateStr}`
          });
        }
        if (oldP.advanceStatus !== newP.advanceStatus) {
          newHistoryEntries.push({
            timestamp: new Date(),
            entity: "planning",
            action: "update",
            description: `Se actualizó avance de planeación para "${branchName}" a "${newP.advanceStatus}"`
          });
        }
        if (oldP.technicalResponsible !== newP.technicalResponsible) {
          newHistoryEntries.push({
            timestamp: new Date(),
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
          timestamp: new Date(),
          entity: "planning",
          action: "delete",
          description: `Se eliminó planeación para "${branchName}" del ${dateStr}`
        });
      }
    });

    // Detect "CLEAR_BRANCH_COSTS" or "CLEAR_ALL_COSTS"
    if (oldCosts.length > 0 && newCosts.length === 0 && oldBranches.length === newBranches.length) {
      newHistoryEntries.push({
        timestamp: new Date(),
        entity: "cost",
        action: "clear",
        description: "Se vaciaron todos los costos de insumos del sistema"
      });
    }

    // Detect Checklist changes
    const newChecklist = newData.checklistEntries || [];
    const changedChecklistGroups = new Set<string>();
    newChecklist.forEach((newCe: any) => {
      const oldCe = oldChecklist.find(
        (c: any) => c.branchId === newCe.branchId && c.year === newCe.year && c.month === newCe.month && c.taskKey === newCe.taskKey
      );
      if (!oldCe || oldCe.status !== newCe.status) {
        changedChecklistGroups.add(`${newCe.branchId}-${newCe.year}-${newCe.month}`);
      }
    });
    oldChecklist.forEach((oldCe: any) => {
      if (!newChecklist.some((c: any) => c.branchId === oldCe.branchId && c.year === oldCe.year && c.month === oldCe.month && c.taskKey === oldCe.taskKey)) {
        changedChecklistGroups.add(`${oldCe.branchId}-${oldCe.year}-${oldCe.month}`);
      }
    });

    changedChecklistGroups.forEach((groupKey) => {
      const [branchId, yearStr, monthStr] = groupKey.split("-");
      const branchName = newBranches.find((b: any) => b.id === branchId)?.name || "Sucursal";
      const monthName = getMonthNameSpanish(parseInt(monthStr));
      newHistoryEntries.push({
        timestamp: new Date(),
        entity: "checklist",
        action: "update",
        description: `Se actualizó el checklist de mantenimiento de "${branchName}" para ${monthName} ${yearStr}`
      });
    });

    // Perform transaction to rewrite all state
    await prisma.$transaction(async (tx: any) => {
      // Clear data (must delete child tables before parent because of FKs, though Cascade does it too)
      await tx.odooTicket.deleteMany();
      await tx.user.deleteMany();
      await tx.checklistEntry.deleteMany();
      await tx.costEntry.deleteMany();
      await tx.planningEntry.deleteMany();
      await tx.calendarEntry.deleteMany();
      await tx.branch.deleteMany();

      // Insert fresh data
      if (newBranches.length > 0) {
        await tx.branch.createMany({ data: newBranches });
      }
      if (newCalendar.length > 0) {
        await tx.calendarEntry.createMany({ 
          data: newCalendar.map((c: any) => ({
            branchId: c.branchId,
            year: c.year,
            month: c.month,
            status: c.status,
            responsible: c.responsible
          }))
        });
      }
      if (newPlanning.length > 0) {
        await tx.planningEntry.createMany({ 
          data: newPlanning.map((p: any) => ({
            ...p,
            scheduledDate: new Date(p.scheduledDate)
          }))
        });
      }
      if (newCosts.length > 0) {
        await tx.costEntry.createMany({ 
          data: newCosts.map((c: any) => ({
            ...c,
            date: new Date(c.date)
          }))
        });
      }
      if (newChecklist.length > 0) {
        await tx.checklistEntry.createMany({
          data: newChecklist.map((c: any) => ({
            branchId: c.branchId,
            year: c.year,
            month: c.month,
            taskKey: c.taskKey,
            status: c.status
          }))
        });
      }

      if (newData.odooTickets && newData.odooTickets.length > 0) {
        await tx.odooTicket.createMany({
          data: newData.odooTickets.map((t: any) => ({
            id: t.id,
            asignadoA: t.asignadoA,
            asunto: t.asunto,
            estadoKanban: t.estadoKanban,
            etapa: t.etapa,
            creadoEl: t.creadoEl ? new Date(t.creadoEl) : null,
            fechaContacto: t.fechaContacto ? new Date(t.fechaContacto) : null,
            descripcion: t.descripcion,
            prioridad: t.prioridad,
            propiedades: t.propiedades,
            sucursal: t.sucursal,
            slaMet: t.slaMet,
            slaDays: t.slaDays,
            isOpen: t.isOpen
          }))
        });
      }

      // Merge and insert users
      const finalUsersToInsert = [...(newData.users || [])];
      for (const branch of newBranches) {
        const hasUser = finalUsersToInsert.some((u: any) => u.branchId === branch.id);
        if (!hasUser) {
          const oldU = oldUsers.find((u: any) => u.branchId === branch.id);
          finalUsersToInsert.push({
            id: oldU?.id || `u-${Date.now()}-${branch.id}-${Math.random().toString(36).substring(2, 5)}`,
            username: oldU?.username || `sucursal.${normalizeUsername(branch.name)}`,
            password: oldU?.password || "sucursal2026",
            role: "branch",
            branchId: branch.id
          });
        }
      }

      const hasAdmin = finalUsersToInsert.some((u: any) => u.role === "admin");
      if (!hasAdmin) {
        finalUsersToInsert.push({
          id: `u-admin-${Date.now()}`,
          username: "admin",
          password: "admin2026",
          role: "admin"
        });
      }

      const hasManagement = finalUsersToInsert.some((u: any) => u.role === "management");
      if (!hasManagement) {
        finalUsersToInsert.push({
          id: `u-management-${Date.now()}`,
          username: "administracion",
          password: "administracion2026",
          role: "management"
        });
      }

      if (finalUsersToInsert.length > 0) {
        await tx.user.createMany({
          data: finalUsersToInsert.map((u: any) => ({
            id: u.id,
            username: u.username,
            password: u.password || "sucursal2026",
            role: u.role,
            branchId: u.branchId
          }))
        });
      }

      await tx.globalState.upsert({
        where: { id: "global" },
        update: { currentYear: newData.currentYear || 2025 },
        create: { id: "global", currentYear: newData.currentYear || 2025 }
      });

      // Insert new history logs
      if (newHistoryEntries.length > 0) {
        await tx.historyEntry.createMany({ data: newHistoryEntries });
      }

      // If client requested clearing history log
      if (newData.historyLog && newData.historyLog.length === 0 && newHistoryEntries.length === 0) {
        await tx.historyEntry.deleteMany();
      }
    });

    // Clean up oldest history logs if exceeding 500
    const count = await prisma.historyEntry.count();
    if (count > 500) {
      const logsToKeep = await prisma.historyEntry.findMany({
        orderBy: { timestamp: "desc" },
        take: 500,
        select: { id: true }
      });
      const idsToKeep = logsToKeep.map((l: any) => l.id);
      await prisma.historyEntry.deleteMany({
        where: { id: { notIn: idsToKeep } }
      });
    }

    // Return the updated state so the frontend can sync (especially the auto-generated history logs)
    const [finalBranches, finalCalendar, finalPlanning, finalCosts, finalChecklist, finalUsers, finalGlobal, finalHistory, finalTickets] = await Promise.all([
      prisma.branch.findMany(),
      prisma.calendarEntry.findMany(),
      prisma.planningEntry.findMany(),
      prisma.costEntry.findMany(),
      prisma.checklistEntry.findMany(),
      prisma.user.findMany(),
      prisma.globalState.findUnique({ where: { id: "global" } }),
      prisma.historyEntry.findMany({ orderBy: { timestamp: "desc" }, take: 500 }),
      prisma.odooTicket.findMany()
    ]);

    return NextResponse.json({
      branches: finalBranches,
      calendarEntries: finalCalendar,
      planningEntries: finalPlanning,
      costEntries: finalCosts,
      checklistEntries: finalChecklist,
      users: finalUsers,
      currentYear: finalGlobal?.currentYear || 2025,
      historyLog: finalHistory,
      odooTickets: finalTickets
    });
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
