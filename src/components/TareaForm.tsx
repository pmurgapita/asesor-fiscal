"use client";

import { useActionState } from "react";
import { ETIQUETA_PRIORIDAD, ETIQUETA_ESTADO_TAREA, ORDEN_PRIORIDADES, ORDEN_ESTADOS_TAREA } from "@/lib/tareas";

type Opcion = { id: string; nombre: string };

export function TareaForm({
  action,
  clientes,
  trabajadores,
  initialValues,
  textoBoton,
}: {
  action: (prevState: unknown, formData: FormData) => Promise<{ error?: string } | undefined>;
  clientes: Opcion[];
  trabajadores: Opcion[];
  initialValues?: {
    descripcion?: string;
    clienteId?: string;
    usuarioAsignadoId?: string;
    prioridad?: string;
    estado?: string;
    fechaLimite?: string;
  };
  textoBoton: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="card space-y-5">
      <div>
        <label className="field-label" htmlFor="descripcion">
          Descripción *
        </label>
        <textarea
          id="descripcion"
          name="descripcion"
          rows={2}
          required
          autoFocus
          defaultValue={initialValues?.descripcion}
          className="field-input"
          placeholder="¿Qué hay que hacer?"
        />
      </div>

      <div>
        <label className="field-label" htmlFor="clienteId">
          Cliente (opcional)
        </label>
        <select
          id="clienteId"
          name="clienteId"
          defaultValue={initialValues?.clienteId ?? ""}
          className="field-input"
        >
          <option value="">Sin cliente</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="field-label" htmlFor="usuarioAsignadoId">
          Asignada a *
        </label>
        <select
          id="usuarioAsignadoId"
          name="usuarioAsignadoId"
          required
          defaultValue={initialValues?.usuarioAsignadoId ?? ""}
          className="field-input"
        >
          <option value="" disabled>
            Elige un trabajador
          </option>
          {trabajadores.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="field-label" htmlFor="prioridad">
            Prioridad
          </label>
          <select
            id="prioridad"
            name="prioridad"
            defaultValue={initialValues?.prioridad ?? "MEDIA"}
            className="field-input"
          >
            {ORDEN_PRIORIDADES.map((p) => (
              <option key={p} value={p}>
                {ETIQUETA_PRIORIDAD[p]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="fechaLimite">
            Fecha límite (opcional)
          </label>
          <input
            id="fechaLimite"
            name="fechaLimite"
            type="date"
            defaultValue={initialValues?.fechaLimite}
            className="field-input"
          />
        </div>
      </div>

      <div>
        <label className="field-label" htmlFor="estado">
          Estado
        </label>
        <select
          id="estado"
          name="estado"
          defaultValue={initialValues?.estado ?? "PDTE_INICIAR"}
          className="field-input"
        >
          {ORDEN_ESTADOS_TAREA.map((e) => (
            <option key={e} value={e}>
              {ETIQUETA_ESTADO_TAREA[e]}
            </option>
          ))}
        </select>
      </div>

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
