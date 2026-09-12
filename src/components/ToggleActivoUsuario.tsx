"use client";

import { useTransition } from "react";
import { cambiarActivoUsuarioAction } from "@/app/usuarios/actions";

export function ToggleActivoUsuario({
  usuarioId,
  activo,
  esUsuarioActual,
}: {
  usuarioId: string;
  activo: boolean;
  esUsuarioActual: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <label className="flex items-center gap-2 text-base text-slate-600">
      <input
        type="checkbox"
        defaultChecked={activo}
        disabled={pending || esUsuarioActual}
        onChange={(e) => {
          const formData = new FormData();
          formData.set("usuarioId", usuarioId);
          formData.set("activo", String(e.target.checked));
          startTransition(() => cambiarActivoUsuarioAction(formData));
        }}
      />
      {esUsuarioActual ? "Activo (eres tú)" : "Activo"}
    </label>
  );
}
