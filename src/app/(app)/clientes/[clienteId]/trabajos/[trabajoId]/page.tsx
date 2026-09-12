import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { iniciarCronometroAction, detenerCronometroAction } from "@/app/actions";
import { CronometroTick } from "@/components/CronometroTick";
import { formatearEuros, formatearDuracion } from "@/lib/tiempo";

export default async function TrabajoDetallePage({
  params,
  searchParams,
}: {
  params: Promise<{ clienteId: string; trabajoId: string }>;
  searchParams: Promise<{ guardado?: string }>;
}) {
  const { clienteId, trabajoId } = await params;
  const { guardado } = await searchParams;
  const usuario = await requireUser();

  const trabajo = await prisma.trabajo.findUnique({
    where: { id: trabajoId },
    include: { cliente: true },
  });

  if (!trabajo || trabajo.clienteId !== clienteId) notFound();

  const [cronometroActivo, registroGuardado] = await Promise.all([
    prisma.registroTiempo.findFirst({
      where: { usuarioId: usuario.id, horaFin: null },
      include: { trabajo: { include: { cliente: true } } },
    }),
    guardado
      ? prisma.registroTiempo.findUnique({ where: { id: guardado } })
      : Promise.resolve(null),
  ]);

  const corriendoAqui = cronometroActivo?.trabajoId === trabajo.id;
  const corriendoEnOtroSitio = cronometroActivo && !corriendoAqui;

  return (
    <div className="space-y-6">
      <Link href={`/clientes/${clienteId}`} className="text-base font-medium text-blue-700">
        ← {trabajo.cliente.nombre}
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{trabajo.titulo}</h1>
          <p className="text-lg text-slate-500">{trabajo.cliente.nombre}</p>
        </div>
        <Link
          href={`/clientes/${clienteId}/trabajos/${trabajo.id}/detalles`}
          className="text-base font-medium text-blue-700"
        >
          Detalles y gastos →
        </Link>
      </div>

      {registroGuardado && registroGuardado.trabajoId === trabajo.id && (
        <div className="card border-green-300 bg-green-50">
          <p className="text-lg font-semibold text-green-800">Tiempo guardado correctamente</p>
          <p className="mt-1 text-base text-green-700">
            {formatearDuracion(registroGuardado.duracionMinutos ?? 0)} · {" "}
            {formatearEuros(registroGuardado.importe ?? 0)}
          </p>
        </div>
      )}

      {corriendoEnOtroSitio && cronometroActivo && (
        <div className="card border-amber-300 bg-amber-50">
          <p className="text-lg font-semibold text-amber-800">
            Ya tienes un cronómetro en marcha
          </p>
          <p className="mt-1 text-base text-amber-700">
            {cronometroActivo.trabajo.cliente.nombre} — {cronometroActivo.trabajo.titulo}
          </p>
          <Link
            href={`/clientes/${cronometroActivo.trabajo.clienteId}/trabajos/${cronometroActivo.trabajoId}`}
            className="btn-primary mt-4 inline-flex"
          >
            Ir a ese cronómetro
          </Link>
        </div>
      )}

      {corriendoAqui && cronometroActivo && (
        <div className="card border-green-300 bg-green-50 text-center">
          <p className="text-lg font-medium text-green-800">Cronómetro en marcha</p>
          <p className="my-4 font-mono text-6xl font-bold text-green-800">
            <CronometroTick horaInicioIso={cronometroActivo.horaInicio.toISOString()} />
          </p>
          <form action={detenerCronometroAction} className="space-y-4 text-left">
            <input type="hidden" name="registroId" value={cronometroActivo.id} />
            <div>
              <label className="field-label" htmlFor="nota">
                Nota (opcional)
              </label>
              <input
                id="nota"
                name="nota"
                type="text"
                className="field-input"
                placeholder="Ej: preparación de la documentación"
              />
            </div>
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 text-lg font-semibold text-white transition-colors"
              style={{ backgroundColor: "var(--color-danger)" }}
            >
              Detener y guardar
            </button>
          </form>
        </div>
      )}

      {!cronometroActivo && (
        <form action={iniciarCronometroAction.bind(null, trabajo.id)}>
          <button type="submit" className="btn-success w-full">
            ▶ Iniciar
          </button>
        </form>
      )}
    </div>
  );
}
