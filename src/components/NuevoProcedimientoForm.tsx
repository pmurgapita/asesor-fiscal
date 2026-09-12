"use client";

import { useActionState } from "react";
import { crearProcedimientoAction } from "@/app/procedimientos/actions";

export function NuevoProcedimientoForm({ clientes }: { clientes: { id: string; nombre: string }[] }) {
  const [state, formAction, pending] = useActionState(crearProcedimientoAction, undefined);

  return (
    <form action={formAction} className="card space-y-5">
      <div>
        <label className="field-label" htmlFor="clienteId">
          Cliente *
        </label>
        <select id="clienteId" name="clienteId" required defaultValue="" className="field-input">
          <option value="" disabled>
            Elige un cliente
          </option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="field-label" htmlFor="tipoProcedimiento">
          Tipo de procedimiento *
        </label>
        <input
          id="tipoProcedimiento"
          name="tipoProcedimiento"
          type="text"
          required
          placeholder="Ej: Inspección IRPF 2023, Derivación de responsabilidad…"
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
          placeholder="Ej: AEAT, TEAR, TEAC, Contencioso…"
          className="field-input"
        />
      </div>

      <div>
        <label className="field-label" htmlFor="notas">
          Notas
        </label>
        <textarea id="notas" name="notas" rows={3} className="field-input" />
      </div>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-base font-medium text-red-700">
          {state.error}
        </p>
      )}

      <button type="submit" className="btn-primary w-full" disabled={pending}>
        {pending ? "Guardando…" : "Crear procedimiento"}
      </button>
    </form>
  );
}
