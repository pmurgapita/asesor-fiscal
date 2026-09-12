import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { generarCsv, respuestaCsv } from "@/lib/csv";

const ETIQUETA_ESTADO: Record<string, string> = {
  EN_CURSO: "En curso",
  POR_COMENZAR: "Por comenzar",
  TERMINADO: "Terminado",
};

export async function GET() {
  await requireUser();

  const trabajos = await prisma.trabajo.findMany({
    orderBy: { fechaAlta: "desc" },
    include: { cliente: true, categoria: true, asignaciones: { include: { usuario: true } } },
  });

  const csv = generarCsv(
    ["Cliente", "Título", "Categoría", "Estado", "Asignado a", "Fecha de alta"],
    trabajos.map((t) => [
      t.cliente.nombre,
      t.titulo,
      t.categoria?.nombre,
      ETIQUETA_ESTADO[t.estado],
      t.asignaciones.map((a) => a.usuario.nombre).join(" / "),
      new Intl.DateTimeFormat("es-ES").format(t.fechaAlta),
    ])
  );

  return respuestaCsv("trabajos.csv", csv);
}
