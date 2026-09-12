"use client";

import { useActionState } from "react";
import { actualizarRegistroAction } from "@/app/actions";

export function EditarRegistroForm({
  registroId,
  clienteNombre,
  trabajoTitulo,
  fecha,
  horaInicio,
  horaFin,
  nota,
}: {
  registroId: string;
  clienteNombre: string;
  trabajoTitulo: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  nota: string;
}) {
  const boundAction = actualizarRegistroAction.bind(null, registroId);
  const [state, formAction, pending] = useActionState(boundAction, undefined);

  return (
    <form action={formAction} className="card space-y-5">
      <div>
        <p className="text-lg font-semibold text-slate-800">{clienteNombre}</p>
        <p className="text-base text-slate-600">{trabajoTitulo}</p>
      </div>

      <div>
        <label className="field-label" htmlFor="fecha">
          Fecha
        </label>
        <input
          id="fecha"
          name="fecha"
          type="date"
          required
          defaultValue={fecha}
          className="field-input"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="field-label" htmlFor="horaInicio">
            Hora de inicio
          </label>
          <input
            id="horaInicio"
            name="horaInicio"
            type="time"
            required
            defaultValue={horaInicio}
            className="field-input"
          />
        </div>
        <div>
          <label className="field-label" htmlFor="horaFin">
            Hora de fin
          </label>
          <input
            id="horaFin"
            name="horaFin"
            type="time"
            required
            defaultValue={horaFin}
            className="field-input"
          />
        </div>
      </div>

      <div>
        <label className="field-label" htmlFor="nota">
          Nota (opcional)
        </label>
        <input id="nota" name="nota" type="text" defaultValue={nota} className="field-input" />
      </div>

      <div>
        <label className="field-label" htmlFor="motivoEdicion">
          ¿Por qué corriges este registro?
        </label>
        <input
          id="motivoEdicion"
          name="motivoEdicion"
          type="text"
          required
          placeholder="Ej: se me olvidó detener el cronómetro"
          className="field-input"
        />
      </div>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-base font-medium text-red-700">
          {state.error}
        </p>
      )}

      <button type="submit" className="btn-primary w-full" disabled={pending}>
        {pending ? "Guardando…" : "Guardar corrección"}
      </button>
    </form>
  );
}
