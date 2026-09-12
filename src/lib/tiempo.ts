import type { Prisma } from "@prisma/client";

type Decimalish = Prisma.Decimal | number | string;

function toNumber(value: Decimalish): number {
  return typeof value === "object" ? value.toNumber() : Number(value);
}

/** La tarifa especial del cliente gana sobre la tarifa general vigente del despacho. */
export function tarifaEfectiva(
  cliente: { tarifaHoraEspecial: Decimalish | null },
  tarifaDespachoVigente: Decimalish
): number {
  return cliente.tarifaHoraEspecial != null
    ? toNumber(cliente.tarifaHoraEspecial)
    : toNumber(tarifaDespachoVigente);
}

export function calcularImporte(duracionMinutos: number, tarifaHora: number): number {
  return Math.round(((duracionMinutos / 60) * tarifaHora + Number.EPSILON) * 100) / 100;
}

export function formatearEuros(valor: Decimalish): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(toNumber(valor));
}

function dosDigitos(n: number): string {
  return n.toString().padStart(2, "0");
}

/** Fecha en formato YYYY-MM-DD para rellenar un <input type="date">. */
export function formatearFechaInput(fecha: Date): string {
  return `${fecha.getFullYear()}-${dosDigitos(fecha.getMonth() + 1)}-${dosDigitos(fecha.getDate())}`;
}

/** Hora en formato HH:MM para rellenar un <input type="time">. */
export function formatearHoraInput(fecha: Date): string {
  return `${dosDigitos(fecha.getHours())}:${dosDigitos(fecha.getMinutes())}`;
}

export function formatearDuracion(minutos: number): string {
  const horas = Math.floor(minutos / 60);
  const mins = Math.round(minutos % 60);
  if (horas === 0) return `${mins} min`;
  return `${horas} h ${mins.toString().padStart(2, "0")} min`;
}
