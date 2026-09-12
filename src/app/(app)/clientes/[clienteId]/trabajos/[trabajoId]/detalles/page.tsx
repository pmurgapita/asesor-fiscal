import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatearEuros } from "@/lib/tiempo";
import { crearGastoAction, eliminarGastoAction } from "@/app/trabajos/actions";
import { BotonEliminar } from "@/components/BotonEliminar";

const ETIQUETA_ESTADO: Record<string, string> = {
  EN_CURSO: "En curso",
  POR_COMENZAR: "Por comenzar",
  TERMINADO: "Terminado",
};

export default async function DetallesTrabajoPage({
  params,
  searchParams,
}: {
  params: Promise<{ clienteId: string; trabajoId: string }>;
  searchParams: Promise<{ actualizado?: string }>;
}) {
  const { clienteId, trabajoId } = await params;
  const { actualizado } = await searchParams;

  const trabajo = await prisma.trabajo.findUnique({
    where: { id: trabajoId },
    include: {
      cliente: true,
      categoria: true,
      asignaciones: { include: { usuario: true } },
      gastos: { orderBy: { fecha: "desc" } },
    },
  });

  if (!trabajo || trabajo.clienteId !== clienteId) notFound();

  const boundCrearGasto = crearGastoAction.bind(null, trabajo.id, clienteId);
  const totalGastos = trabajo.gastos.reduce((suma, g) => suma + Number(g.importe), 0);

  return (
    <div className="space-y-8">
      <Link
        href={`/clientes/${clienteId}/trabajos/${trabajo.id}`}
        className="text-base font-medium text-blue-700"
      >
        ← {trabajo.titulo}
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{trabajo.titulo}</h1>
          <p className="text-lg text-slate-500">{trabajo.cliente.nombre}</p>
        </div>
        <Link
          href={`/clientes/${clienteId}/trabajos/${trabajo.id}/editar`}
          className="btn-secondary px-4 py-2 text-base"
        >
          Editar
        </Link>
      </div>

      {actualizado && (
        <div className="card border-green-300 bg-green-50">
          <p className="text-lg font-semibold text-green-800">Trabajo actualizado correctamente</p>
        </div>
      )}

      <section className="card space-y-2">
        <p className="text-base text-slate-700">
          <span className="text-slate-500">Estado: </span>
          {ETIQUETA_ESTADO[trabajo.estado]}
        </p>
        {trabajo.categoria && (
          <p className="text-base text-slate-700">
            <span className="text-slate-500">Categoría: </span>
            {trabajo.categoria.nombre}
          </p>
        )}
        <p className="text-base text-slate-700">
          <span className="text-slate-500">Asignado a: </span>
          {trabajo.asignaciones.map((a) => a.usuario.nombre).join(", ")}
        </p>
        {trabajo.descripcion && (
          <p className="whitespace-pre-wrap text-base text-slate-700">{trabajo.descripcion}</p>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-700">Gastos / suplidos</h2>
          {trabajo.gastos.length > 0 && (
            <span className="text-base font-medium text-slate-600">
              Total: {formatearEuros(totalGastos)}
            </span>
          )}
        </div>

        {trabajo.gastos.length > 0 && (
          <ul className="space-y-2">
            {trabajo.gastos.map((g) => (
              <li key={g.id} className="card flex items-center justify-between">
                <div>
                  <p className="text-base font-medium text-slate-800">{g.concepto}</p>
                  <p className="text-sm text-slate-500">
                    {new Intl.DateTimeFormat("es-ES").format(g.fecha)}
                    {g.repercutirACliente && " · Se repercute al cliente"}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-base font-medium text-slate-700">
                    {formatearEuros(g.importe)}
                  </span>
                  <BotonEliminar
                    action={eliminarGastoAction}
                    hiddenFields={{ gastoId: g.id, clienteId, trabajoId: trabajo.id }}
                    confirmacion={`¿Eliminar el gasto "${g.concepto}"?`}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}

        <details className="card">
          <summary className="cursor-pointer text-base font-medium text-blue-700">
            + Añadir gasto
          </summary>
          <form action={boundCrearGasto} className="mt-4 space-y-4">
            <div>
              <label className="field-label" htmlFor="concepto">
                Concepto
              </label>
              <input id="concepto" name="concepto" type="text" required className="field-input" />
            </div>
            <div>
              <label className="field-label" htmlFor="importe">
                Importe (€)
              </label>
              <input
                id="importe"
                name="importe"
                type="number"
                step="0.01"
                min="0"
                required
                className="field-input"
              />
            </div>
            <label className="flex items-center gap-2 text-base text-slate-700">
              <input type="checkbox" name="repercutirACliente" />
              Se repercute al cliente
            </label>
            <button type="submit" className="btn-secondary">
              Añadir gasto
            </button>
          </form>
        </details>
      </section>
    </div>
  );
}
