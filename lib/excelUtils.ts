import * as XLSX from 'xlsx';
import { PlanningEntry } from './types';

/**
 * Exporta una plantilla Excel vacía para importar planeación
 * Incluye instrucciones y ejemplos
 */
export function downloadPlanningTemplate(branchNames: string[]): void {
  const templateData = [
    {
      'Sucursal': branchNames[0] || 'Ejemplo Sucursal',
      'Fecha Programada': '01/01/2026',
      'Responsable Técnico': 'Nombre Responsable',
      'Estado': 'Pendiente',
    },
  ];

  const ws = XLSX.utils.json_to_sheet(templateData);
  
  // Ajustar ancho de columnas
  ws['!cols'] = [
    { wch: 30 }, // Sucursal
    { wch: 15 }, // Fecha
    { wch: 20 }, // Responsable
    { wch: 15 }, // Estado
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Planeación');

  // Descargar archivo
  XLSX.writeFile(wb, 'planeacion-template.xlsx');
}

/**
 * Exporta las entradas de planeación a un archivo Excel
 * Las fechas se formatean en formato corto (dd/mm/yyyy)
 */
export function exportPlanningToExcel(planningEntries: PlanningEntry[], branchesMap: Record<string, string>): void {
  // Preparar datos para Excel
  const data = planningEntries.map((entry) => ({
    'Sucursal': branchesMap[entry.branchId] || entry.branchId,
    'Fecha Programada': formatDateShort(entry.scheduledDate),
    'Responsable Técnico': entry.technicalResponsible,
    'Estado': getStatusLabel(entry.advanceStatus),
  }));

  // Crear workbook
  const ws = XLSX.utils.json_to_sheet(data);
  
  // Ajustar ancho de columnas
  ws['!cols'] = [
    { wch: 30 }, // Sucursal
    { wch: 15 }, // Fecha
    { wch: 20 }, // Responsable
    { wch: 15 }, // Estado
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Planeación');

  // Descargar archivo
  XLSX.writeFile(wb, `planeacion-${new Date().toISOString().split('T')[0]}.xlsx`);
}

/**
 * Importa entradas de planeación desde un archivo Excel
 * Espera columnas: Sucursal, Fecha Programada, Responsable Técnico, Estado
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

        const workbook = XLSX.read(data, { type: 'array' });
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

          const scheduledDate = parseShortDate(row['Fecha Programada']);
          if (!scheduledDate) {
            throw new Error(`Fila ${index + 2}: Fecha inválida "${row['Fecha Programada']}". Use formato dd/mm/yyyy`);
          }

          const status = parseStatusFromLabel(row['Estado']);
          if (!status) {
            throw new Error(`Fila ${index + 2}: Estado inválido "${row['Estado']}". Use: Pendiente, En Proceso o Listo`);
          }

          return {
            id: `p${Date.now()}_${index}`,
            branchId,
            scheduledDate,
            technicalResponsible: row['Responsable Técnico'] || '',
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
      // dd/mm/yyyy
      /^(\d{2})\/(\d{2})\/(\d{4})$/,
      // dd-mm-yyyy
      /^(\d{2})-(\d{2})-(\d{4})$/,
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
 * Parsea una etiqueta de estado a estado interno
 */
function parseStatusFromLabel(label: string): string | null {
  const statusMap: Record<string, string> = {
    'pendiente': 'pendiente',
    'en proceso': 'en_proceso',
    'en_proceso': 'en_proceso',
    'listo': 'listo',
  };
  
  const normalized = label?.toLowerCase().trim();
  return statusMap[normalized] || null;
}
