"use client";

import { useActionState } from "react";
import { crearUsuarioAction } from "@/app/usuarios/actions";

export function NuevoUsuarioForm() {
  const [state, formAction, pending] = useActionState(crearUsuarioAction, undefined);

  return (
    <form action={formAction} className="card space-y-5">
      <div>
        <label className="field-label" htmlFor="nombre">
          Nombre *
        </label>
        <input id="nombre" name="nombre" type="text" required autoFocus className="field-input" />
      </div>

      <div>
        <label className="field-label" htmlFor="email">
          Correo (para iniciar sesión) *
        </label>
        <input id="email" name="email" type="email" required className="field-input" />
      </div>

      <div>
        <label className="field-label" htmlFor="password">
          Contraseña inicial *
        </label>
        <input
          id="password"
          name="password"
          type="text"
          required
          minLength={8}
          placeholder="Al menos 8 caracteres"
          className="field-input"
        />
        <p className="mt-1 text-sm text-slate-500">
          Dísela a la persona para que pueda entrar; puede seguir usándola, no hace falta
          cambiarla.
        </p>
      </div>

      <div>
        <label className="field-label" htmlFor="rol">
          Tipo de usuario
        </label>
        <select id="rol" name="rol" defaultValue="TRABAJADOR" className="field-input">
          <option value="TRABAJADOR">Trabajador</option>
          <option value="ADMIN">Administrador</option>
        </select>
      </div>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-base font-medium text-red-700">
          {state.error}
        </p>
      )}

      <button type="submit" className="btn-primary w-full" disabled={pending}>
        {pending ? "Creando…" : "Crear usuario"}
      </button>
    </form>
  );
}
