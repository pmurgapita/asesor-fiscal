import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { generarCsv, respuestaCsv } from "@/lib/csv";

const ETIQUETA_COBRO: Record<string, string> = {
  PENDIENTE: "Pendiente de facturar",
  FACTURADO: "Facturado",
  COBRADO: "Cobrado",
};

export async function GET() {
  const usuario = await requireUser();

  const registros = await prisma.registroTiempo.findMany({
    where: { usuarioId: usuario.id, horaFin: { not: null } },
    orderBy: { horaInicio: "desc" },
    include: { trabajo: { include: { cliente: true } } },
  });

  const csv = generarCsv(
    ["Fecha", "Cliente", "Trabajo", "Duración (min)", "Tarifa (€/h)", "Importe (€)", "Estado de cobro", "Nota"],
    registros.map((r) => [
      new Intl.DateTimeFormat("es-ES", { dateStyle: "short", timeStyle: "short" }).format(
        r.horaInicio
      ),
      r.trabajo.cliente.nombre,
      r.trabajo.titulo,
      r.duracionMinutos,
      Number(r.tarifaAplicada),
      r.importe != null ? Number(r.importe) : null,
      ETIQUETA_COBRO[r.estadoCobro],
      r.nota,
    ])
  );

  return respuestaCsv("mis-tiempos.csv", csv);
}
