import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { generarCsv, respuestaCsv } from "@/lib/csv";
import { ETIQUETA_ESTADO_PROCEDIMIENTO } from "@/lib/procedimientos";

export async function GET() {
  await requireUser();

  const procedimientos = await prisma.procedimientoTributario.findMany({
    include: { cliente: true, plazos: { orderBy: { fechaLimite: "asc" } } },
  });

  const csv = generarCsv(
    [
      "Cliente",
      "Tipo de procedimiento",
      "Organismo",
      "Estado",
      "Próximo plazo pendiente",
      "Fecha del próximo plazo",
    ],
    procedimientos.map((p) => {
      const proximo = p.plazos.find((pl) => !pl.cumplido) ?? null;
      return [
        p.cliente.nombre,
        p.tipoProcedimiento,
        p.organismo,
        ETIQUETA_ESTADO_PROCEDIMIENTO[p.estado],
        proximo?.descripcion,
        proximo ? new Intl.DateTimeFormat("es-ES").format(proximo.fechaLimite) : null,
      ];
    })
  );

  return respuestaCsv("procedimientos-tributarios.csv", csv);
}
