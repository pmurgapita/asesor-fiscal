import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { generarCsv, respuestaCsv } from "@/lib/csv";
import { ETIQUETA_PRIORIDAD, ETIQUETA_ESTADO_TAREA } from "@/lib/tareas";

export async function GET() {
  await requireUser();

  const tareas = await prisma.tareaPendiente.findMany({
    orderBy: [{ prioridad: "asc" }, { fechaLimite: "asc" }],
    include: { cliente: true, usuarioAsignado: true },
  });

  const csv = generarCsv(
    ["Descripción", "Cliente", "Asignada a", "Prioridad", "Estado", "Fecha límite"],
    tareas.map((t) => [
      t.descripcion,
      t.cliente?.nombre,
      t.usuarioAsignado.nombre,
      ETIQUETA_PRIORIDAD[t.prioridad],
      ETIQUETA_ESTADO_TAREA[t.estado],
      t.fechaLimite ? new Intl.DateTimeFormat("es-ES").format(t.fechaLimite) : null,
    ])
  );

  return respuestaCsv("tareas-pendientes.csv", csv);
}
