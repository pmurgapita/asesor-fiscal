"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SelectorEstadoTarea } from "./SelectorEstadoTarea";
import { ETIQUETA_PRIORIDAD, COLOR_PRIORIDAD, ORDEN_PRIORIDADES } from "@/lib/tareas";

type Tarea = {
  id: string;
  descripcion: string;
  clienteId: string | null;
  clienteNombre: string | null;
  usuarioAsignadoId: string;
  usuarioAsignadoNombre: string;
  prioridad: string;
  estado: string;
  fechaLimiteTexto: string | null;
};

export function ListaTareas({
  tareas,
  trabajadores,
}: {
  tareas: Tarea[];
  trabajadores: { id: string; nombre: string }[];
}) {
  const [prioridad, setPrioridad] = useState("");
  const [asignado, setAsignado] = useState("");
  const [mostrarTerminadas, setMostrarTerminadas] = useState(false);

  const filtradas = useMemo(() => {
    return tareas.filter((t) => {
      if (!mostrarTerminadas && t.estado === "TERMINADA") return false;
      if (prioridad && t.prioridad !== prioridad) return false;
      if (asignado && t.usuarioAsignadoId !== asignado) return false;
      return true;
    });
  }, [tareas, prioridad, asignado, mostrarTerminadas]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={prioridad}
          onChange={(e) => setPrioridad(e.target.value)}
          className="rounded-lg border-2 px-3 py-2 text-base"
          style={{ borderColor: "var(--color-border)" }}
        >
          <option value="">Todas las prioridades</option>
          {ORDEN_PRIORIDADES.map((p) => (
            <option key={p} value={p}>
              {ETIQUETA_PRIORIDAD[p]}
            </option>
          ))}
        </select>

        <select
          value={asignado}
          onChange={(e) => setAsignado(e.target.value)}
          className="rounded-lg border-2 px-3 py-2 text-base"
          style={{ borderColor: "var(--color-border)" }}
        >
          <option value="">Todos los trabajadores</option>
          {trabajadores.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nombre}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-2 text-base text-slate-600">
          <input
            type="checkbox"
            checked={mostrarTerminadas}
            onChange={(e) => setMostrarTerminadas(e.target.checked)}
          />
          Mostrar terminadas
        </label>
      </div>

      {filtradas.length === 0 ? (
        <p className="py-8 text-center text-lg text-slate-500">No hay tareas que coincidan.</p>
      ) : (
        <ul className="space-y-3">
          {filtradas.map((t) => (
            <li key={t.id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-base font-medium text-slate-800">{t.descripcion}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {t.clienteNombre && (
                      <Link href={`/clientes/${t.clienteId}/ficha`} className="text-blue-700">
                        {t.clienteNombre}
                      </Link>
                    )}
                    {t.clienteNombre && " · "}
                    {t.usuarioAsignadoNombre}
                    {t.fechaLimiteTexto && ` · Límite: ${t.fechaLimiteTexto}`}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-sm font-medium ${COLOR_PRIORIDAD[t.prioridad]}`}
                >
                  {ETIQUETA_PRIORIDAD[t.prioridad]}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <SelectorEstadoTarea tareaId={t.id} estadoActual={t.estado} />
                <Link href={`/tareas/${t.id}/editar`} className="text-sm font-medium text-blue-700">
                  Editar
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
