"use client";

import { useRef, useTransition } from "react";
import { cambiarEstadoTareaAction } from "@/app/tareas/actions";
import { ETIQUETA_ESTADO_TAREA, ORDEN_ESTADOS_TAREA } from "@/lib/tareas";

export function SelectorEstadoTarea({ tareaId, estadoActual }: { tareaId: string; estadoActual: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      ref={formRef}
      action={(formData) => startTransition(() => cambiarEstadoTareaAction(formData))}
    >
      <input type="hidden" name="tareaId" value={tareaId} />
      <select
        name="estado"
        defaultValue={estadoActual}
        disabled={pending}
        onChange={() => formRef.current?.requestSubmit()}
        className="rounded-lg border-2 px-3 py-2 text-sm"
        style={{ borderColor: "var(--color-border)" }}
      >
        {ORDEN_ESTADOS_TAREA.map((e) => (
          <option key={e} value={e}>
            {ETIQUETA_ESTADO_TAREA[e]}
          </option>
        ))}
      </select>
    </form>
  );
}
