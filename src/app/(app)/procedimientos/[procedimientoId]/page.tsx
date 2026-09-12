import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { urgenciaPlazo, diasHastaPlazo, ETIQUETA_ESTADO_PROCEDIMIENTO } from "@/lib/procedimientos";
import { añadirPlazoAction, eliminarPlazoAction } from "@/app/procedimientos/actions";
import { MarcarPlazoCumplido } from "@/components/MarcarPlazoCumplido";
import { BotonEliminar } from "@/components/BotonEliminar";

const ESTILO_URGENCIA: Record<string, string> = {
  vencido: "border-red-300 bg-red-50",
  proximo: "border-amber-300 bg-amber-50",
  normal: "",
};

export default async function FichaProcedimientoPage({
  params,
  searchParams,
}: {
  params: Promise<{ procedimientoId: string }>;
  searchParams: Promise<{ creado?: string; actualizado?: string }>;
}) {
  const { procedimientoId } = await params;
  const { creado, actualizado } = await searchParams;

  const procedimiento = await prisma.procedimientoTributario.findUnique({
    where: { id: procedimientoId },
    include: {
      cliente: true,
      plazos: { orderBy: { fechaLimite: "asc" } },
    },
  });

  if (!procedimiento) notFound();

  const boundAñadirPlazo = añadirPlazoAction.bind(null, procedimiento.id);

  return (
    <div className="space-y-8">
      <Link href="/procedimientos" className="text-base font-medium text-blue-700">
        ← Procedimientos tributarios
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{procedimiento.tipoProcedimiento}</h1>
          <p className="text-lg text-slate-500">
            <Link href={`/clientes/${procedimiento.clienteId}/ficha`} className="text-blue-700">
              {procedimiento.cliente.nombre}
            </Link>{" "}
            · {procedimiento.organismo}
          </p>
        </div>
        <Link
          href={`/procedimientos/${procedimiento.id}/editar`}
          className="btn-secondary px-4 py-2 text-base"
        >
          Editar
        </Link>
      </div>

      {creado && (
        <div className="card border-green-300 bg-green-50">
          <p className="text-lg font-semibold text-green-800">Procedimiento creado correctamente</p>
        </div>
      )}
      {actualizado && (
        <div className="card border-green-300 bg-green-50">
          <p className="text-lg font-semibold text-green-800">Procedimiento actualizado correctamente</p>
        </div>
      )}

      <section className="card space-y-2">
        <p className="text-base text-slate-700">
          <span className="text-slate-500">Estado: </span>
          {ETIQUETA_ESTADO_PROCEDIMIENTO[procedimiento.estado]}
        </p>
        {procedimiento.notas && (
          <p className="whitespace-pre-wrap text-base text-slate-700">{procedimiento.notas}</p>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-700">Plazos</h2>

        {procedimiento.plazos.length > 0 && (
          <ul className="space-y-3">
            {procedimiento.plazos.map((plazo) => {
              const urgencia = plazo.cumplido
                ? "normal"
                : urgenciaPlazo(plazo.fechaLimite, plazo.avisoDiasAntes);
              const dias = diasHastaPlazo(plazo.fechaLimite);
              return (
                <li
                  key={plazo.id}
                  className={`card ${plazo.cumplido ? "opacity-60" : ESTILO_URGENCIA[urgencia]}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-base font-medium text-slate-800">{plazo.descripcion}</p>
                      <p className="text-sm text-slate-500">
                        {new Intl.DateTimeFormat("es-ES").format(plazo.fechaLimite)}
                        {!plazo.cumplido &&
                          (dias < 0
                            ? ` · vencido hace ${Math.abs(dias)} día(s)`
                            : ` · faltan ${dias} día(s)`)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-4">
                      <MarcarPlazoCumplido
                        plazoId={plazo.id}
                        procedimientoId={procedimiento.id}
                        cumplido={plazo.cumplido}
                      />
                      <BotonEliminar
                        action={eliminarPlazoAction}
                        hiddenFields={{ plazoId: plazo.id, procedimientoId: procedimiento.id }}
                        confirmacion={`¿Eliminar el plazo "${plazo.descripcion}"?`}
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <details className="card">
          <summary className="cursor-pointer text-base font-medium text-blue-700">
            + Añadir plazo
          </summary>
          <form action={boundAñadirPlazo} className="mt-4 space-y-4">
            <div>
              <label className="field-label" htmlFor="descripcion-plazo">
                Descripción
              </label>
              <input
                id="descripcion-plazo"
                name="descripcion"
                type="text"
                required
                placeholder="Ej: Presentar alegaciones, recurso, vencimiento…"
                className="field-input"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="field-label" htmlFor="fechaLimite-plazo">
                  Fecha límite
                </label>
                <input
                  id="fechaLimite-plazo"
                  name="fechaLimite"
                  type="date"
                  required
                  className="field-input"
                />
              </div>
              <div>
                <label className="field-label" htmlFor="avisoDiasAntes-plazo">
                  Avisar con (días de antelación)
                </label>
                <input
                  id="avisoDiasAntes-plazo"
                  name="avisoDiasAntes"
                  type="number"
                  min="0"
                  defaultValue={15}
                  className="field-input"
                />
              </div>
            </div>
            <button type="submit" className="btn-secondary">
              Añadir plazo
            </button>
          </form>
        </details>
      </section>
    </div>
  );
}
