import { prisma } from "./prisma";

export function getCronometroActivo(usuarioId: string) {
  return prisma.registroTiempo.findFirst({
    where: { usuarioId, horaFin: null },
    include: { trabajo: { include: { cliente: true } } },
  });
}

/** Tarifa/hora general del despacho en vigor en la fecha indicada (por defecto, ahora). */
export async function getTarifaDespachoVigente(fecha: Date = new Date()) {
  const tarifa = await prisma.tarifaDespacho.findFirst({
    where: { vigenteDesde: { lte: fecha } },
    orderBy: { vigenteDesde: "desc" },
  });

  if (!tarifa) {
    throw new Error(
      "No hay ninguna tarifa del despacho configurada. Un administrador debe crear una."
    );
  }

  return tarifa;
}
