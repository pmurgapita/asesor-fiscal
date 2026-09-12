"use client";

import { useActionState } from "react";

type Opcion = { id: string; nombre: string };

export function TrabajoForm({
  action,
  trabajadores,
  categoriasExistentes,
  initialValues,
  textoBoton,
}: {
  action: (prevState: unknown, formData: FormData) => Promise<{ error?: string } | undefined>;
  trabajadores: Opcion[];
  categoriasExistentes: string[];
  initialValues?: {
    titulo?: string;
    categoria?: string;
    descripcion?: string;
    estado?: string;
    asignados?: string[];
  };
  textoBoton: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const asignadosIniciales = new Set(initialValues?.asignados ?? []);

  return (
    <form action={formAction} className="card space-y-5">
      <div>
        <label className="field-label" htmlFor="titulo">
          Título *
        </label>
        <input
          id="titulo"
          name="titulo"
          type="text"
          required
          autoFocus
          defaultValue={initialValues?.titulo}
          className="field-input"
          placeholder="Ej: Declaración de la renta 2025"
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
          list="categorias-trabajo-existentes"
          defaultValue={initialValues?.categoria}
          className="field-input"
          placeholder="Ej: Declaración de la renta, Asesoría continua…"
        />
        <datalist id="categorias-trabajo-existentes">
          {categoriasExistentes.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </div>

      <div>
        <label className="field-label" htmlFor="descripcion">
          Descripción (opcional)
        </label>
        <textarea
          id="descripcion"
          name="descripcion"
          rows={2}
          defaultValue={initialValues?.descripcion}
          className="field-input"
        />
      </div>

      <div>
        <label className="field-label" htmlFor="estado">
          Estado
        </label>
        <select
          id="estado"
          name="estado"
          defaultValue={initialValues?.estado ?? "POR_COMENZAR"}
          className="field-input"
        >
          <option value="POR_COMENZAR">Por comenzar</option>
          <option value="EN_CURSO">En curso</option>
          <option value="TERMINADO">Terminado</option>
        </select>
      </div>

      <div>
        <span className="field-label">Asignado a *</span>
        <div className="space-y-2">
          {trabajadores.map((t) => (
            <label key={t.id} className="flex items-center gap-2 text-base text-slate-700">
              <input
                type="checkbox"
                name="asignados"
                value={t.id}
                defaultChecked={asignadosIniciales.has(t.id)}
              />
              {t.nombre}
            </label>
          ))}
        </div>
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
