export interface ChecklistTask {
  key: string;
  description: string;
}

export interface ChecklistCategory {
  title: string;
  tasks: ChecklistTask[];
}

export const CHECKLIST_CATEGORIES: ChecklistCategory[] = [
  {
    title: "Mantenimiento Desktop (PC)",
    tasks: [
      { key: "pc_limpieza", description: "Limpieza física de equipo" },
      { key: "pc_pasta", description: "Cambio de pasta térmica (si aplica)" },
      { key: "pc_temporales", description: "Limpieza de temporales" },
      { key: "pc_desfrag", description: "Desfragmentación de discos (si aplica)" },
      { key: "pc_antivirus", description: "Verificación de antivirus y actualizaciones" },
      { key: "pc_red", description: "Revisión de conexiones de red y periféricos" },
      { key: "pc_vent", description: "Revisión de ventiladores y temperatura interna" },
      { key: "pc_fuente", description: "Verificación de estado de la fuente de poder" },
      { key: "pc_cables", description: "Revisión de cables y conexiones internas" },
      { key: "pc_respaldo", description: "Respaldo de información crítica (si aplica)" }
    ]
  },
  {
    title: "Mantenimiento Tablet y Celular",
    tasks: [
      { key: "device_limpieza", description: "Limpieza física de equipo" },
      { key: "device_cache", description: "Limpieza de caché y temporales" },
      { key: "device_storage", description: "Verificación de almacenamiento disponible" },
      { key: "device_updates", description: "Revisión de actualizaciones del sistema operativo" },
      { key: "device_battery", description: "Revisión del estado de batería y carga" },
      { key: "device_media", description: "Verificación de funcionamiento de cámara y micrófono" },
      { key: "device_case", description: "Revisión de protector de pantalla y case" }
    ]
  },
  {
    title: "Mantenimiento Impresoras",
    tasks: [
      { key: "printer_limpieza", description: "Limpieza física de equipo" },
      { key: "printer_rodillos", description: "Limpieza de rodillos y bandejas" },
      { key: "printer_toner", description: "Revisión de niveles de tóner/tinta" },
      { key: "printer_test", description: "Test de impresión" },
      { key: "printer_lubric", description: "Lubricación de partes móviles" },
      { key: "printer_sensores", description: "Revisión de sensores de papel" },
      { key: "printer_calidad", description: "Verificación de calidad y calibración de impresión" }
    ]
  },
  {
    title: "Mantenimiento CCTV",
    tasks: [
      { key: "cctv_grabador", description: "Limpieza de grabador" },
      { key: "cctv_camaras", description: "Limpieza de cámaras" },
      { key: "cctv_test_grabador", description: "Test de funcionamiento de grabador" },
      { key: "cctv_test_camaras", description: "Test de funcionamiento de cámaras" },
      { key: "cctv_voltaje", description: "Verificación de voltaje de alimentación" },
      { key: "cctv_lentes", description: "Limpieza de lentes y ajuste de enfoque/ángulo" },
      { key: "cctv_nocturna", description: "Verificación de visión nocturna (infrarrojo)" },
      { key: "cctv_fecha", description: "Revisión de fecha y hora del grabador" },
      { key: "cctv_disco", description: "Verificación de espacio y estado del disco duro de grabación" },
      { key: "cctv_respaldo", description: "Respaldo de configuración del grabador" }
    ]
  },
  {
    title: "Mantenimiento Sonido",
    tasks: [
      { key: "sound_equipo", description: "Limpieza de equipo de sonido" },
      { key: "sound_bocinas", description: "Limpieza de bocinas de techo" },
      { key: "sound_ampli", description: "Test de amplificador" },
      { key: "sound_test_bocinas", description: "Test de bocinas" },
      { key: "sound_cables", description: "Revisión de conexiones y cableado de audio" },
      { key: "sound_fuente", description: "Verificación de fuente de audio (streaming/radio/entrada auxiliar)" },
      { key: "sound_ajuste", description: "Ajuste de volumen y ecualización" }
    ]
  },
  {
    title: "Infraestructura",
    tasks: [
      { key: "infra_rack", description: "Limpieza de rack" },
      { key: "infra_orden", description: "Ordenamiento de cables" },
      { key: "infra_ident", description: "Identificación de cables" },
      { key: "infra_ups", description: "Verificación de protección eléctrica (regulador/UPS)" },
      { key: "infra_autonomia", description: "Revisión de autonomía y estado de batería del UPS" },
      { key: "infra_vent", description: "Verificación de ventilación y temperatura del rack" },
      { key: "infra_switch", description: "Revisión de switch/router (estado y funcionamiento)" },
      { key: "infra_tierra", description: "Verificación de puesta a tierra" }
    ]
  }
];
