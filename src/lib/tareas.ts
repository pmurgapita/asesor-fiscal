export const ETIQUETA_PRIORIDAD: Record<string, string> = {
  INMEDIATA: "Inmediata",
  ALTA: "Alta",
  MEDIA: "Media",
  BAJA: "Baja",
  NINGUNA: "Ninguna",
};

export const COLOR_PRIORIDAD: Record<string, string> = {
  INMEDIATA: "bg-red-100 text-red-800",
  ALTA: "bg-amber-100 text-amber-800",
  MEDIA: "bg-blue-100 text-blue-800",
  BAJA: "bg-slate-100 text-slate-600",
  NINGUNA: "bg-slate-100 text-slate-400",
};

export const ETIQUETA_ESTADO_TAREA: Record<string, string> = {
  PDTE_INICIAR: "Pendiente de iniciar",
  EN_CURSO: "En curso",
  PDTE_CLIENTE: "Pendiente del cliente",
  PDTE_OTROS: "Pendiente de otros",
  PDTE_COBRO: "Pendiente de cobro",
  TERMINADA: "Terminada",
};

export const ORDEN_ESTADOS_TAREA = [
  "PDTE_INICIAR",
  "EN_CURSO",
  "PDTE_CLIENTE",
  "PDTE_OTROS",
  "PDTE_COBRO",
  "TERMINADA",
] as const;

export const ORDEN_PRIORIDADES = ["INMEDIATA", "ALTA", "MEDIA", "BAJA", "NINGUNA"] as const;
