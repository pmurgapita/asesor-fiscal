import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { generarCsv, respuestaCsv } from "@/lib/csv";

const ETIQUETA_COBRO: Record<string, string> = {
  PENDIENTE: "Pendiente de facturar",
  FACTURADO: "Facturado",
  COBRADO: "Cobrado",
};

export async function GET() {
  await requireAdmin();

  const registros = await prisma.registroTiempo.findMany({
    where: { horaFin: { not: null } },
    orderBy: { horaInicio: "desc" },
    include: { trabajo: { include: { cliente: true } }, usuario: true },
  });

  const csv = generarCsv(
    [
      "Fecha",
      "Cliente",
      "Trabajo",
      "Trabajador",
      "Duración (min)",
      "Tarifa (€/h)",
      "Importe (€)",
      "Estado de cobro",
      "Nota",
    ],
    registros.map((r) => [
      new Intl.DateTimeFormat("es-ES", { dateStyle: "short", timeStyle: "short" }).format(
        r.horaInicio
      ),
      r.trabajo.cliente.nombre,
      r.trabajo.titulo,
      r.usuario.nombre,
      r.duracionMinutos,
      Number(r.tarifaAplicada),
      r.importe != null ? Number(r.importe) : null,
      ETIQUETA_COBRO[r.estadoCobro],
      r.nota,
    ])
  );

  return respuestaCsv("cargos-todos-los-trabajadores.csv", csv);
}
