"use client";

import { useActionState } from "react";

export function EditarProcedimientoForm({
  action,
  initialValues,
}: {
  action: (prevState: unknown, formData: FormData) => Promise<{ error?: string } | undefined>;
  initialValues: {
    tipoProcedimiento: string;
    organismo: string;
    estado: string;
    notas: string;
  };
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="card space-y-5">
      <div>
        <label className="field-label" htmlFor="tipoProcedimiento">
          Tipo de procedimiento *
        </label>
        <input
          id="tipoProcedimiento"
          name="tipoProcedimiento"
          type="text"
          required
          defaultValue={initialValues.tipoProcedimiento}
          className="field-input"
        />
      </div>

      <div>
        <label className="field-label" htmlFor="organismo">
          Organismo / vía *
        </label>
        <input
          id="organismo"
          name="organismo"
          type="text"
          required
          defaultValue={initialValues.organismo}
          className="field-input"
        />
      </div>

      <div>
        <label className="field-label" htmlFor="estado">
          Estado
        </label>
        <select id="estado" name="estado" defaultValue={initialValues.estado} className="field-input">
          <option value="ABIERTO">Abierto</option>
          <option value="CERRADO">Cerrado</option>
        </select>
      </div>

      <div>
        <label className="field-label" htmlFor="notas">
          Notas
        </label>
        <textarea
          id="notas"
          name="notas"
          rows={3}
          defaultValue={initialValues.notas}
          className="field-input"
        />
      </div>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-base font-medium text-red-700">
          {state.error}
        </p>
      )}

      <button type="submit" className="btn-primary w-full" disabled={pending}>
        {pending ? "Guardando…" : "Guardar cambios"}
      </button>
    </form>
  );
}
