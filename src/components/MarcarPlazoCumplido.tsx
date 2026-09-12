"use client";

import { useTransition } from "react";
import { marcarPlazoAction } from "@/app/procedimientos/actions";

export function MarcarPlazoCumplido({
  plazoId,
  procedimientoId,
  cumplido,
}: {
  plazoId: string;
  procedimientoId: string;
  cumplido: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <label className="flex items-center gap-2 text-sm text-slate-600">
      <input
        type="checkbox"
        defaultChecked={cumplido}
        disabled={pending}
        onChange={(e) => {
          const formData = new FormData();
          formData.set("plazoId", plazoId);
          formData.set("procedimientoId", procedimientoId);
          formData.set("cumplido", String(e.target.checked));
          startTransition(() => marcarPlazoAction(formData));
        }}
      />
      Cumplido
    </label>
  );
}
