import * as XLSX from 'xlsx';
import { PlanningEntry, Branch, AdvanceStatus } from './types';

/**
 * Exporta una plantilla Excel para importar planeación precargada con datos actuales
 */
export function downloadPlanningTemplate(branches: Branch[], planningEntries: PlanningEntry[]): void {
  // Generar datos para Excel precargando lo que se tiene actualmente
  const templateData = branches.map((branch) => {
    const entry = planningEntries.find((p) => p.branchId === branch.id);
    return {
      'ID': entry?.id || '',
      'Sucursal': branch.name,
      'Fecha': entry ? formatDateShort(entry.scheduledDate) : '',
      'Responsable Técnico': entry?.technicalResponsible || '',
      'Estado': entry ? getStatusLabel(entry.advanceStatus) : '',
    };
  });

  const ws = XLSX.utils.json_to_sheet(templateData);
  
  // Ajustar ancho de columnas
  ws['!cols'] = [
    { wch: 15 }, // ID
    { wch: 30 }, // Sucursal
    { wch: 15 }, // Fecha
    { wch: 25 }, // Responsable Técnico
    { wch: 15 }, // Estado
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Plantilla de Planeación');

  // Descargar archivo
  XLSX.writeFile(wb, 'plantilla-planeacion.xlsx');
}

/**
 * Exporta las entradas de planeación a un archivo Excel incluyendo ID y Fecha
 */
export function exportPlanningToExcel(planningEntries: PlanningEntry[], branchesMap: Record<string, string>): void {
  // Preparar datos para Excel
  const data = planningEntries.map((entry) => ({
    'ID': entry.id,
    'Sucursal': branchesMap[entry.branchId] || entry.branchId,
    'Fecha': formatDateShort(entry.scheduledDate),
    'Responsable Técnico': entry.technicalResponsible,
    'Estado': getStatusLabel(entry.advanceStatus),
  }));

  // Crear workbook
  const ws = XLSX.utils.json_to_sheet(data);
  
  // Ajustar ancho de columnas
  ws['!cols'] = [
    { wch: 15 }, // ID
    { wch: 30 }, // Sucursal
    { wch: 15 }, // Fecha
    { wch: 25 }, // Responsable Técnico
    { wch: 15 }, // Estado
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Planeación');

  // Descargar archivo
  XLSX.writeFile(wb, `planeacion-${new Date().toISOString().split('T')[0]}.xlsx`);
}

/**
 * Importa entradas de planeación desde un archivo Excel soportando IDs y Fechas
 */
export function importPlanningFromExcel(
  file: File,
  branchesMap: Record<string, string>
): Promise<Partial<PlanningEntry>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          reject(new Error('No se pudo leer el archivo'));
          return;
        }

        // Habilitar cellDates para leer correctamente fechas nativas de Excel
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

        // Validar y transformar datos
        const entries: Partial<PlanningEntry>[] = jsonData.map((row, index) => {
          const branchId = Object.entries(branchesMap).find(
            ([_, name]) => name.toLowerCase() === row['Sucursal']?.toLowerCase()
          )?.[0];

          if (!branchId) {
            throw new Error(`Fila ${index + 2}: No se encontró la sucursal "${row['Sucursal']}"`);
          }

          const status = parseStatusFromLabel(row['Estado']);
          if (!status) {
            throw new Error(`Fila ${index + 2}: Estado inválido "${row['Estado']}". Use: Pendiente, En Proceso o Listo`);
          }

          const responsible = row['Responsable Técnico']?.toString().trim();
          if (!responsible) {
            throw new Error(`Fila ${index + 2}: Responsable Técnico es requerido`);
          }

          // Parsear fecha
          let scheduledDate = new Date();
          if (row['Fecha']) {
            if (row['Fecha'] instanceof Date) {
              scheduledDate = row['Fecha'];
            } else {
              const parsedDate = parseShortDate(row['Fecha'].toString());
              if (parsedDate) {
                scheduledDate = parsedDate;
              } else {
                throw new Error(`Fila ${index + 2}: Fecha inválida "${row['Fecha']}". Use el formato DD/MM/YYYY o una celda con formato de fecha.`);
              }
            }
          }

          return {
            id: row['ID']?.toString().trim() || `p${Date.now()}_${index}`,
            branchId,
            scheduledDate,
            technicalResponsible: responsible,
            advanceStatus: status,
          };
        });

        resolve(entries);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'));
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Formatea una fecha en formato corto dd/mm/yyyy
 */
function formatDateShort(date: Date | string | undefined): string {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return '';
  }
}

/**
 * Parsea una fecha en formato dd/mm/yyyy a un objeto Date
 */
function parseShortDate(dateString: string): Date | null {
  if (!dateString) return null;

  try {
    // Soporta múltiples formatos
    const formats = [
      // d/m/yyyy or dd/mm/yyyy
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
      // d-m-yyyy or dd-mm-yyyy
      /^(\d{1,2})-(\d{1,2})-(\d{4})$/,
    ];

    for (const format of formats) {
      const match = dateString.trim().match(format);
      if (match) {
        const [, day, month, year] = match;
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Convierte el estado interno a etiqueta para mostrar
 */
function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    'pendiente': 'Pendiente',
    'en_proceso': 'En Proceso',
    'listo': 'Listo',
  };
  return labels[status] || status;
}

/**
 * Exporta solo los nombres de las sucursales a un archivo Excel
 */
export function exportBranchNamesToExcel(branches: Array<{ name: string }>): void {
  const data = branches.map((branch) => ({
    'Nombre de Sucursal': branch.name,
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  
  // Ajustar ancho de columnas
  ws['!cols'] = [
    { wch: 40 }, // Nombre de Sucursal
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sucursales');

  // Descargar archivo
  XLSX.writeFile(wb, `sucursales-${new Date().toISOString().split('T')[0]}.xlsx`);
}

/**
 * Parsea una etiqueta de estado a estado interno
 */
function parseStatusFromLabel(label: string): AdvanceStatus | null {
  const statusMap: Record<string, AdvanceStatus> = {
    'pendiente': 'pendiente',
    'en proceso': 'en_proceso',
    'en_proceso': 'en_proceso',
    'listo': 'listo',
  };
  
  const normalized = label?.toLowerCase().trim();
  return statusMap[normalized] || null;
}
