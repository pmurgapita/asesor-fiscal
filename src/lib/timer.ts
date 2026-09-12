import { prisma } from "./prisma";

export function getCronometroActivo(usuarioId: string) {
  return prisma.registroTiempo.findFirst({
    where: { usuarioId, horaFin: null },
    include: { trabajo: { include: { cliente: true } } },
  });
}
