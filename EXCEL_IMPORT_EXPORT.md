# Guía de Importación y Exportación de Excel - Planeación

## Descripción General

La funcionalidad de importación y exportación de Excel permite gestionar fácilmente los datos de planeación de mantenimiento. Todas las fechas se manejan en formato corto (dd/mm/yyyy) para mayor legibilidad y compatibilidad.

## Características

### 1. **Descargar Plantilla**
- Botón: "Descargar Plantilla"
- Descarga un archivo Excel con la estructura correcta y ejemplos
- Útil para preparar datos antes de importarlos

### 2. **Exportar Excel**
- Botón: "Exportar Excel"
- Exporta todas las entradas de planeación actuales
- Incluye: Sucursal, Fecha Programada, Responsable Técnico, Estado
- Fechas en formato corto (dd/mm/yyyy)
- Archivo: `planeacion-YYYY-MM-DD.xlsx`

### 3. **Importar Excel**
- Botón: "Importar Excel"
- Lee archivos Excel (.xlsx o .xls)
- Validación automática de datos
- Muestra errores específicos en caso de problemas

## Formato del Excel

### Columnas Requeridas:
1. **Sucursal**: Nombre exacto de la sucursal (debe existir en el sistema)
2. **Fecha Programada**: Formato dd/mm/yyyy (ej: 15/06/2026)
3. **Responsable Técnico**: Nombre del técnico responsable
4. **Estado**: Uno de: "Pendiente", "En Proceso" o "Listo"

### Ejemplo:
```
Sucursal                          | Fecha Programada | Responsable Técnico | Estado
Oficina CM Matriz                | 15/06/2026       | Douglas, Ricardo    | Pendiente
Casa Muñoz | Las Cascadas        | 18/06/2026       | Douglas             | En Proceso
Casa Muñoz | La Joya             | 20/06/2026       | Ricardo             | Listo
```

## Instrucciones de Uso

### Importar Datos:

1. Descarga la plantilla con el botón "Descargar Plantilla"
2. Completa los datos con la información de planeación
3. Asegúrate de que:
   - Los nombres de sucursal coincidan exactamente con los del sistema
   - Las fechas estén en formato dd/mm/yyyy
   - Los estados sean "Pendiente", "En Proceso" o "Listo"
4. Haz clic en "Importar Excel"
5. Selecciona tu archivo
6. Si hay errores, se mostrarán en un mensaje rojo con detalles específicos

### Exportar Datos:

1. Haz clic en "Exportar Excel"
2. El archivo se descargará automáticamente
3. Puedes editar y reimportar posteriormente

## Validaciones

### Al importar, se valida:

- ✓ Que la sucursal exista en el sistema
- ✓ Que la fecha esté en formato correcto (dd/mm/yyyy)
- ✓ Que el estado sea válido (Pendiente, En Proceso, Listo)
- ✓ Que no haya columnas faltantes

### Mensajes de Error:

- "Fila N: No se encontró la sucursal 'XXX'" → La sucursal no existe
- "Fila N: Fecha inválida 'XXX'. Use formato dd/mm/yyyy" → Formato de fecha incorrecto
- "Fila N: Estado inválido 'XXX'. Use: Pendiente, En Proceso o Listo" → Estado no válido

## Compatibilidad

- **Formatos soportados**: .xlsx, .xls
- **Navegadores**: Chrome, Firefox, Safari, Edge
- **Sistema operativo**: Windows, macOS, Linux
- **Idioma**: Las fechas usan formato localizado, los estados están en español

## Notas Importantes

1. **Duplicados**: Si importas el mismo registro múltiples veces, se agregará múltiples copias
2. **Respaldo**: Siempre exporta antes de importar datos modificados
3. **Nombres exactos**: Los nombres de sucursal deben coincidir exactamente (mayúsculas, espacios, etc.)
4. **Fechas válidas**: Las fechas deben ser válidas (ej: no 32/13/2026)

## Ejemplos Prácticos

### Ejemplo 1: Agregar nueva planeación de masa

1. Descarga la plantilla
2. Completa 20 filas con sucursales y técnicos
3. Importa el archivo
4. Todos los registros se agregarán a la planeación

### Ejemplo 2: Actualizar estados

1. Exporta la planeación actual
2. Abre en Excel y cambia los estados
3. Importa el archivo actualizado
4. Los nuevos registros se agregarán

### Ejemplo 3: Respaldar datos

1. Exporta regularmente
2. Guarda los archivos con fecha
3. En caso de pérdida de datos, puedes reimportar

## Solución de Problemas

**Problema**: "Error al leer el archivo"
- **Solución**: Asegúrate de que el archivo es válido (.xlsx o .xls)

**Problema**: La sucursal no se encuentra
- **Solución**: Verifica el nombre exacto en la pestaña de sucursales

**Problema**: Las fechas no se validan
- **Solución**: Usa formato dd/mm/yyyy (ejemplo: 25/12/2026)

**Problema**: Estados no reconocidos
- **Solución**: Usa exactamente: "Pendiente", "En Proceso" o "Listo"
