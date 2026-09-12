import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { formatearDuracion, formatearEuros } from "@/lib/tiempo";
import { EnlaceExportarCsv } from "@/components/EnlaceExportarCsv";

const ETIQUETA_COBRO: Record<string, string> = {
  PENDIENTE: "Pendiente de facturar",
  FACTURADO: "Facturado",
  COBRADO: "Cobrado",
};

export default async function MisTiemposPage({
  searchParams,
}: {
  searchParams: Promise<{ corregido?: string }>;
}) {
  const { corregido } = await searchParams;
  const usuario = await requireUser();

  const registros = await prisma.registroTiempo.findMany({
    where: { usuarioId: usuario.id, horaFin: { not: null } },
    orderBy: { horaInicio: "desc" },
    take: 50,
    include: { trabajo: { include: { cliente: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Mis tiempos</h1>
        <div className="flex items-center gap-4">
          <EnlaceExportarCsv href="/api/exportar/mis-tiempos" />
          {usuario.rol === "ADMIN" && (
            <EnlaceExportarCsv
              href="/api/exportar/cargos"
              texto="Exportar cargos de todo el despacho"
            />
          )}
        </div>
      </div>

      {corregido && (
        <div className="card border-green-300 bg-green-50">
          <p className="text-lg font-semibold text-green-800">Registro corregido correctamente</p>
        </div>
      )}

      {registros.length === 0 ? (
        <p className="text-lg text-slate-500">Todavía no tienes tiempos registrados.</p>
      ) : (
        <ul className="space-y-3">
          {registros.map((registro) => (
            <li key={registro.id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-slate-800">
                    {registro.trabajo.cliente.nombre}
                  </p>
                  <p className="text-base text-slate-600">{registro.trabajo.titulo}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {new Intl.DateTimeFormat("es-ES", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(registro.horaInicio)}
                  </p>
                  {registro.nota && (
                    <p className="mt-2 text-sm italic text-slate-500">“{registro.nota}”</p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-lg font-semibold text-slate-800">
                    {formatearDuracion(registro.duracionMinutos ?? 0)}
                  </p>
                  <p className="text-base text-slate-600">{formatearEuros(registro.importe ?? 0)}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {ETIQUETA_COBRO[registro.estadoCobro]}
                  </p>
                  <Link
                    href={`/mis-tiempos/${registro.id}/editar`}
                    className="mt-2 inline-block text-sm font-medium text-blue-700"
                  >
                    Corregir
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
