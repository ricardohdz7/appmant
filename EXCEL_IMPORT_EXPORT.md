# Guía de Importación y Exportación de Excel - Planeación

## Descripción General

La funcionalidad de importación y exportación de Excel permite gestionar fácilmente los datos de planeación de mantenimiento. Las fechas se editan directamente desde la aplicación web, lo que simplifica el flujo de trabajo.

## Características

### 1. **Descargar Plantilla**
- Botón: "Descargar Plantilla"
- Descarga un archivo Excel con la estructura correcta y ejemplos
- Útil para preparar datos antes de importarlos

### 2. **Exportar Excel**
- Botón: "Exportar Excel"
- Exporta todas las entradas de planeación actuales
- Incluye: Sucursal, Responsable Técnico, Estado
- Archivo: `planeacion-YYYY-MM-DD.xlsx`

### 3. **Importar Excel**
- Botón: "Importar Excel"
- Lee archivos Excel (.xlsx o .xls)
- Validación automática de datos
- Muestra errores específicos en caso de problemas

### 4. **Editar Fechas en la App**
- Haz clic en el icono de calendario junto a la fecha
- Selecciona la nueva fecha en el selector
- Haz clic en "Guardar" para confirmar
- Las fechas se asignan automáticamente al importar (día actual)

## Formato del Excel

### Columnas Requeridas:
1. **Sucursal**: Nombre exacto de la sucursal (debe existir en el sistema)
2. **Responsable Técnico**: Nombre del técnico responsable
3. **Estado**: Uno de: "Pendiente", "En Proceso" o "Listo"

### Ejemplo:
```
Sucursal                          | Responsable Técnico | Estado
Oficina CM Matriz                | Douglas, Ricardo    | Pendiente
Casa Muñoz | Las Cascadas        | Douglas             | En Proceso
Casa Muñoz | La Joya             | Ricardo             | Listo
```

## Instrucciones de Uso

### Importar Datos:

1. Descarga la plantilla con el botón "Descargar Plantilla"
2. Completa los datos con la información de planeación (sin incluir fechas)
3. Asegúrate de que:
   - Los nombres de sucursal coincidan exactamente con los del sistema
   - Los estados sean "Pendiente", "En Proceso" o "Listo"
4. Haz clic en "Importar Excel"
5. Selecciona tu archivo
6. Los registros se importarán con la fecha actual
7. Edita las fechas en la tabla usando el icono de calendario

### Exportar Datos:

1. Haz clic en "Exportar Excel"
2. El archivo se descargará automáticamente
3. Puedes editar y reimportar posteriormente

### Editar Fechas:

1. En la tabla de planeación, busca la fila que deseas editar
2. Haz clic en el icono de calendario (📅) junto a la fecha
3. Selecciona la nueva fecha en el calendario emergente
4. Haz clic en "Guardar" para confirmar o "Cancelar" para descartar

## Validaciones

### Al importar, se valida:

- ✓ Que la sucursal exista en el sistema
- ✓ Que el estado sea válido (Pendiente, En Proceso, Listo)
- ✓ Que el responsable técnico esté presente
- ✓ Que no haya columnas faltantes

### Mensajes de Error:

- "Fila N: No se encontró la sucursal 'XXX'" → La sucursal no existe
- "Fila N: Estado inválido 'XXX'. Use: Pendiente, En Proceso o Listo" → Estado no válido
- "Fila N: Responsable Técnico es requerido" → Falta el nombre del responsable

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
4. Todos los registros se agregarán con la fecha actual
5. Edita las fechas en la tabla usando el icono de calendario

### Ejemplo 2: Actualizar estados

1. Exporta la planeación actual
2. Abre en Excel y cambia los estados
3. Importa el archivo actualizado
4. Los nuevos registros se agregarán

### Ejemplo 3: Respaldar datos

1. Exporta regularmente
2. Guarda los archivos con fecha
3. En caso de pérdida de datos, puedes reimportar

### Ejemplo 4: Cambiar fechas masivamente

1. En la tabla de planeación, haz clic en el icono de calendario para cada fila
2. Selecciona la nueva fecha
3. Haz clic en "Guardar"

## Solución de Problemas

**Problema**: "Error al leer el archivo"
- **Solución**: Asegúrate de que el archivo es válido (.xlsx o .xls)

**Problema**: La sucursal no se encuentra
- **Solución**: Verifica el nombre exacto en la pestaña de sucursales

**Problema**: No puedo editar las fechas
- **Solución**: Busca el icono de calendario (📅) en la columna de fecha y haz clic en él

**Problema**: Estados no reconocidos
- **Solución**: Usa exactamente: "Pendiente", "En Proceso" o "Listo"

**Problema**: El responsable técnico no se guarda
- **Solución**: Asegúrate de que el campo "Responsable Técnico" no esté vacío en el Excel
