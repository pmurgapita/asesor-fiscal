import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatearEuros } from "@/lib/tiempo";
import {
  añadirFamiliarAction,
  añadirEmpresaAction,
  eliminarFamiliarAction,
  eliminarEmpresaAction,
} from "@/app/clientes/actions";
import { BotonEliminar } from "@/components/BotonEliminar";

const ETIQUETA_ESTADO_CIVIL: Record<string, string> = {
  SOLTERO: "Soltero/a",
  CASADO: "Casado/a",
  DIVORCIADO: "Divorciado/a",
  VIUDO: "Viudo/a",
  PAREJA_DE_HECHO: "Pareja de hecho",
};

function Dato({ etiqueta, valor }: { etiqueta: string; valor?: string | null }) {
  if (!valor) return null;
  return (
    <p className="text-base text-slate-700">
      <span className="text-slate-500">{etiqueta}: </span>
      {valor}
    </p>
  );
}

export default async function FichaClientePage({
  params,
  searchParams,
}: {
  params: Promise<{ clienteId: string }>;
  searchParams: Promise<{ creado?: string; actualizado?: string }>;
}) {
  const { clienteId } = await params;
  const { creado, actualizado } = await searchParams;

  const cliente = await prisma.cliente.findUnique({
    where: { id: clienteId },
    include: {
      categoria: true,
      familiares: { orderBy: { tipo: "asc" } },
      empresas: true,
    },
  });

  if (!cliente) notFound();

  const boundAñadirFamiliar = añadirFamiliarAction.bind(null, cliente.id);
  const boundAñadirEmpresa = añadirEmpresaAction.bind(null, cliente.id);

  return (
    <div className="space-y-8">
      <Link href={`/clientes/${cliente.id}`} className="text-base font-medium text-blue-700">
        ← {cliente.nombre}
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Ficha de {cliente.nombre}</h1>
        <Link href={`/clientes/${cliente.id}/ficha/editar`} className="btn-secondary px-4 py-2 text-base">
          Editar
        </Link>
      </div>

      {creado && (
        <div className="card border-green-300 bg-green-50">
          <p className="text-lg font-semibold text-green-800">Cliente creado correctamente</p>
        </div>
      )}
      {actualizado && (
        <div className="card border-green-300 bg-green-50">
          <p className="text-lg font-semibold text-green-800">Datos actualizados correctamente</p>
        </div>
      )}

      <section className="card space-y-2">
        <h2 className="mb-2 text-lg font-semibold text-slate-700">Datos básicos</h2>
        <Dato etiqueta="DNI" valor={cliente.dni} />
        <Dato etiqueta="Categoría" valor={cliente.categoria?.nombre} />
        <Dato etiqueta="Dirección" valor={cliente.direccion} />
        <Dato etiqueta="Teléfono" valor={cliente.telefono} />
        <Dato etiqueta="Correo" valor={cliente.email} />
        {cliente.estadoCivil && (
          <Dato etiqueta="Estado civil" valor={ETIQUETA_ESTADO_CIVIL[cliente.estadoCivil]} />
        )}
        <Dato etiqueta="Régimen matrimonial" valor={cliente.regimenMatrimonial} />
        {cliente.tarifaHoraEspecial != null && (
          <Dato etiqueta="Tarifa/hora especial" valor={formatearEuros(cliente.tarifaHoraEspecial)} />
        )}
        {!cliente.dni &&
          !cliente.direccion &&
          !cliente.telefono &&
          !cliente.email &&
          !cliente.estadoCivil && <p className="text-base text-slate-400">Sin más datos todavía.</p>}
      </section>

      <section className="card space-y-4">
        <h2 className="text-lg font-semibold text-slate-700">Familiares</h2>

        {cliente.familiares.length > 0 && (
          <ul className="space-y-2">
            {cliente.familiares.map((f) => (
              <li key={f.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                <div>
                  <p className="text-base font-medium text-slate-800">
                    {f.nombre}{" "}
                    <span className="text-sm font-normal text-slate-500">
                      ({f.tipo === "CONYUGE" ? "cónyuge" : "hijo/a"})
                    </span>
                  </p>
                  {f.fechaNacimiento && (
                    <p className="text-sm text-slate-500">
                      Nacimiento:{" "}
                      {new Intl.DateTimeFormat("es-ES").format(f.fechaNacimiento)}
                    </p>
                  )}
                </div>
                <BotonEliminar
                  action={eliminarFamiliarAction}
                  hiddenFields={{ familiarId: f.id, clienteId: cliente.id }}
                  confirmacion={`¿Eliminar a ${f.nombre} de los familiares?`}
                />
              </li>
            ))}
          </ul>
        )}

        <details>
          <summary className="cursor-pointer text-base font-medium text-blue-700">
            + Añadir familiar
          </summary>
          <form action={boundAñadirFamiliar} className="mt-4 space-y-4">
            <div>
              <label className="field-label" htmlFor="tipo-familiar">
                Tipo
              </label>
              <select id="tipo-familiar" name="tipo" className="field-input">
                <option value="CONYUGE">Cónyuge</option>
                <option value="HIJO">Hijo/a</option>
              </select>
            </div>
            <div>
              <label className="field-label" htmlFor="nombre-familiar">
                Nombre
              </label>
              <input id="nombre-familiar" name="nombre" type="text" required className="field-input" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="field-label" htmlFor="dni-familiar">
                  DNI (opcional)
                </label>
                <input id="dni-familiar" name="dni" type="text" className="field-input" />
              </div>
              <div>
                <label className="field-label" htmlFor="fechaNacimiento-familiar">
                  Fecha de nacimiento (si es hijo/a)
                </label>
                <input
                  id="fechaNacimiento-familiar"
                  name="fechaNacimiento"
                  type="date"
                  className="field-input"
                />
              </div>
            </div>
            <button type="submit" className="btn-secondary">
              Añadir familiar
            </button>
          </form>
        </details>
      </section>

      <section className="card space-y-4">
        <h2 className="text-lg font-semibold text-slate-700">Empresas asociadas</h2>

        {cliente.empresas.length > 0 && (
          <ul className="space-y-2">
            {cliente.empresas.map((e) => (
              <li key={e.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                <div>
                  <p className="text-base font-medium text-slate-800">{e.nombre}</p>
                  <p className="text-sm text-slate-500">
                    {[e.cif, e.actividad].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <BotonEliminar
                  action={eliminarEmpresaAction}
                  hiddenFields={{ empresaId: e.id, clienteId: cliente.id }}
                  confirmacion={`¿Eliminar la empresa ${e.nombre}?`}
                />
              </li>
            ))}
          </ul>
        )}

        <details>
          <summary className="cursor-pointer text-base font-medium text-blue-700">
            + Añadir empresa
          </summary>
          <form action={boundAñadirEmpresa} className="mt-4 space-y-4">
            <div>
              <label className="field-label" htmlFor="nombre-empresa">
                Nombre
              </label>
              <input id="nombre-empresa" name="nombre" type="text" required className="field-input" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="field-label" htmlFor="cif-empresa">
                  CIF
                </label>
                <input id="cif-empresa" name="cif" type="text" className="field-input" />
              </div>
              <div>
                <label className="field-label" htmlFor="actividad-empresa">
                  Actividad
                </label>
                <input id="actividad-empresa" name="actividad" type="text" className="field-input" />
              </div>
            </div>
            <div>
              <label className="field-label" htmlFor="direccion-empresa">
                Dirección
              </label>
              <input id="direccion-empresa" name="direccion" type="text" className="field-input" />
            </div>
            <button type="submit" className="btn-secondary">
              Añadir empresa
            </button>
          </form>
        </details>
      </section>

      <section className="card space-y-2">
        <h2 className="mb-2 text-lg font-semibold text-slate-700">Facturación</h2>
        <Dato etiqueta="Razón social" valor={cliente.razonSocialFacturacion} />
        <Dato etiqueta="CIF/NIF" valor={cliente.cifFacturacion} />
        <Dato etiqueta="Dirección de facturación" valor={cliente.direccionFacturacion} />
        {!cliente.razonSocialFacturacion &&
          !cliente.cifFacturacion &&
          !cliente.direccionFacturacion && (
            <p className="text-base text-slate-400">Sin datos de facturación todavía.</p>
          )}
      </section>

      {cliente.notas && (
        <section className="card space-y-2">
          <h2 className="mb-2 text-lg font-semibold text-slate-700">Notas</h2>
          <p className="whitespace-pre-wrap text-base text-slate-700">{cliente.notas}</p>
        </section>
      )}
    </div>
  );
}
