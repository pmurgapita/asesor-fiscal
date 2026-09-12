import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ListaProcedimientos } from "@/components/ListaProcedimientos";
import { urgenciaPlazo, diasHastaPlazo } from "@/lib/procedimientos";

const PESO_URGENCIA: Record<string, number> = { vencido: 0, proximo: 1, normal: 2 };

export default async function ProcedimientosPage() {
  const procedimientos = await prisma.procedimientoTributario.findMany({
    include: {
      cliente: true,
      plazos: { where: { cumplido: false }, orderBy: { fechaLimite: "asc" } },
    },
  });

  const conProximoPlazo = procedimientos.map((p) => {
    const plazo = p.plazos[0] ?? null;
    return {
      id: p.id,
      clienteNombre: p.cliente.nombre,
      tipoProcedimiento: p.tipoProcedimiento,
      organismo: p.organismo,
      estado: p.estado,
      proximoPlazo: plazo
        ? {
            descripcion: plazo.descripcion,
            fechaTexto: new Intl.DateTimeFormat("es-ES").format(plazo.fechaLimite),
            urgencia: urgenciaPlazo(plazo.fechaLimite, plazo.avisoDiasAntes),
            dias: diasHastaPlazo(plazo.fechaLimite),
          }
        : null,
    };
  });

  conProximoPlazo.sort((a, b) => {
    const pesoA = a.proximoPlazo ? PESO_URGENCIA[a.proximoPlazo.urgencia] : 3;
    const pesoB = b.proximoPlazo ? PESO_URGENCIA[b.proximoPlazo.urgencia] : 3;
    if (pesoA !== pesoB) return pesoA - pesoB;
    if (a.proximoPlazo && b.proximoPlazo) return a.proximoPlazo.dias - b.proximoPlazo.dias;
    return 0;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Procedimientos tributarios</h1>
        <Link href="/procedimientos/nuevo" className="btn-primary px-4 py-2 text-base">
          + Nuevo procedimiento
        </Link>
      </div>

      <ListaProcedimientos procedimientos={conProximoPlazo} />
    </div>
  );
}
