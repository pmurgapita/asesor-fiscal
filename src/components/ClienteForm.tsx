"use client";

import { useActionState } from "react";

type ClienteFormValues = {
  nombre?: string;
  dni?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  estadoCivil?: string;
  regimenMatrimonial?: string;
  categoria?: string;
  tarifaHoraEspecial?: string;
  razonSocialFacturacion?: string;
  cifFacturacion?: string;
  direccionFacturacion?: string;
  notas?: string;
};

const ESTADOS_CIVILES: { value: string; label: string }[] = [
  { value: "", label: "Sin especificar" },
  { value: "SOLTERO", label: "Soltero/a" },
  { value: "CASADO", label: "Casado/a" },
  { value: "DIVORCIADO", label: "Divorciado/a" },
  { value: "VIUDO", label: "Viudo/a" },
  { value: "PAREJA_DE_HECHO", label: "Pareja de hecho" },
];

export function ClienteForm({
  action,
  initialValues = {},
  categoriasExistentes,
  textoBoton,
}: {
  action: (prevState: unknown, formData: FormData) => Promise<{ error?: string } | undefined>;
  initialValues?: ClienteFormValues;
  categoriasExistentes: string[];
  textoBoton: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-8">
      <section className="card space-y-4">
        <h2 className="text-lg font-semibold text-slate-700">Datos básicos</h2>

        <div>
          <label className="field-label" htmlFor="nombre">
            Nombre *
          </label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            required
            autoFocus
            defaultValue={initialValues.nombre}
            className="field-input"
          />
        </div>

        <div>
          <label className="field-label" htmlFor="dni">
            DNI
          </label>
          <input
            id="dni"
            name="dni"
            type="text"
            defaultValue={initialValues.dni}
            className="field-input"
          />
        </div>

        <div>
          <label className="field-label" htmlFor="categoria">
            Categoría
          </label>
          <input
            id="categoria"
            name="categoria"
            type="text"
            list="categorias-existentes"
            placeholder="Ej: Particular, Autónomo, Pyme…"
            defaultValue={initialValues.categoria}
            className="field-input"
          />
          <datalist id="categorias-existentes">
            {categoriasExistentes.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
      </section>

      <section className="card space-y-4">
        <h2 className="text-lg font-semibold text-slate-700">Contacto</h2>

        <div>
          <label className="field-label" htmlFor="direccion">
            Dirección
          </label>
          <input
            id="direccion"
            name="direccion"
            type="text"
            defaultValue={initialValues.direccion}
            className="field-input"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="field-label" htmlFor="telefono">
              Teléfono
            </label>
            <input
              id="telefono"
              name="telefono"
              type="tel"
              defaultValue={initialValues.telefono}
              className="field-input"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="email">
              Correo
            </label>
            <input
              id="email"
              name="email"
              type="email"
              defaultValue={initialValues.email}
              className="field-input"
            />
          </div>
        </div>
      </section>

      <section className="card space-y-4">
        <h2 className="text-lg font-semibold text-slate-700">Estado civil</h2>

        <div>
          <label className="field-label" htmlFor="estadoCivil">
            Estado civil
          </label>
          <select
            id="estadoCivil"
            name="estadoCivil"
            defaultValue={initialValues.estadoCivil ?? ""}
            className="field-input"
          >
            {ESTADOS_CIVILES.map((e) => (
              <option key={e.value} value={e.value}>
                {e.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label" htmlFor="regimenMatrimonial">
            Régimen matrimonial
          </label>
          <input
            id="regimenMatrimonial"
            name="regimenMatrimonial"
            type="text"
            placeholder="Ej: Gananciales, Separación de bienes…"
            defaultValue={initialValues.regimenMatrimonial}
            className="field-input"
          />
        </div>
      </section>

      <section className="card space-y-4">
        <h2 className="text-lg font-semibold text-slate-700">Facturación</h2>

        <div>
          <label className="field-label" htmlFor="razonSocialFacturacion">
            Razón social
          </label>
          <input
            id="razonSocialFacturacion"
            name="razonSocialFacturacion"
            type="text"
            defaultValue={initialValues.razonSocialFacturacion}
            className="field-input"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="field-label" htmlFor="cifFacturacion">
              CIF / NIF
            </label>
            <input
              id="cifFacturacion"
              name="cifFacturacion"
              type="text"
              defaultValue={initialValues.cifFacturacion}
              className="field-input"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="tarifaHoraEspecial">
              Tarifa/hora especial (€)
            </label>
            <input
              id="tarifaHoraEspecial"
              name="tarifaHoraEspecial"
              type="number"
              step="0.01"
              min="0"
              placeholder="Solo si es distinta de la general"
              defaultValue={initialValues.tarifaHoraEspecial}
              className="field-input"
            />
          </div>
        </div>

        <div>
          <label className="field-label" htmlFor="direccionFacturacion">
            Dirección de facturación
          </label>
          <input
            id="direccionFacturacion"
            name="direccionFacturacion"
            type="text"
            defaultValue={initialValues.direccionFacturacion}
            className="field-input"
          />
        </div>
      </section>

      <section className="card space-y-4">
        <h2 className="text-lg font-semibold text-slate-700">Notas</h2>
        <textarea
          id="notas"
          name="notas"
          rows={3}
          defaultValue={initialValues.notas}
          className="field-input"
          placeholder="Cualquier información adicional relevante"
        />
      </section>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-base font-medium text-red-700">
          {state.error}
        </p>
      )}

      <button type="submit" className="btn-primary w-full" disabled={pending}>
        {pending ? "Guardando…" : textoBoton}
      </button>
    </form>
  );
}
