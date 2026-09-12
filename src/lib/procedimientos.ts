const MS_POR_DIA = 24 * 60 * 60 * 1000;

function inicioDelDia(fecha: Date): number {
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()).getTime();
}

export type UrgenciaPlazo = "vencido" | "proximo" | "normal";

/** Días que faltan hasta la fecha límite (negativo si ya ha pasado). */
export function diasHastaPlazo(fechaLimite: Date, ahora: Date = new Date()): number {
  return Math.round((inicioDelDia(fechaLimite) - inicioDelDia(ahora)) / MS_POR_DIA);
}

export function urgenciaPlazo(
  fechaLimite: Date,
  avisoDiasAntes: number,
  ahora: Date = new Date()
): UrgenciaPlazo {
  const dias = diasHastaPlazo(fechaLimite, ahora);
  if (dias < 0) return "vencido";
  if (dias <= avisoDiasAntes) return "proximo";
  return "normal";
}

export const ETIQUETA_ESTADO_PROCEDIMIENTO: Record<string, string> = {
  ABIERTO: "Abierto",
  CERRADO: "Cerrado",
};
