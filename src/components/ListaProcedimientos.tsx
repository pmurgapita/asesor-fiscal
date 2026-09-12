"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Procedimiento = {
  id: string;
  clienteNombre: string;
  tipoProcedimiento: string;
  organismo: string;
  estado: string;
  proximoPlazo: { descripcion: string; fechaTexto: string; urgencia: "vencido" | "proximo" | "normal" } | null;
};

const ESTILO_URGENCIA: Record<string, string> = {
  vencido: "border-red-300 bg-red-50",
  proximo: "border-amber-300 bg-amber-50",
  normal: "",
};

const ETIQUETA_URGENCIA: Record<string, string> = {
  vencido: "Plazo vencido",
  proximo: "Plazo próximo",
  normal: "",
};

export function ListaProcedimientos({ procedimientos }: { procedimientos: Procedimiento[] }) {
  const [mostrarCerrados, setMostrarCerrados] = useState(false);

  const filtrados = useMemo(
    () => procedimientos.filter((p) => mostrarCerrados || p.estado === "ABIERTO"),
    [procedimientos, mostrarCerrados]
  );

  return (
    <div className="space-y-4">
      <label className="flex items-center gap-2 text-base text-slate-600">
        <input
          type="checkbox"
          checked={mostrarCerrados}
          onChange={(e) => setMostrarCerrados(e.target.checked)}
        />
        Mostrar también los cerrados
      </label>

      {filtrados.length === 0 ? (
        <p className="py-8 text-center text-lg text-slate-500">No hay procedimientos que mostrar.</p>
      ) : (
        <ul className="space-y-3">
          {filtrados.map((p) => (
            <li key={p.id}>
              <Link
                href={`/procedimientos/${p.id}`}
                className={`card block hover:border-slate-400 ${p.proximoPlazo ? ESTILO_URGENCIA[p.proximoPlazo.urgencia] : ""}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-slate-800">{p.clienteNombre}</p>
                    <p className="text-base text-slate-600">
                      {p.tipoProcedimiento} · {p.organismo}
                    </p>
                  </div>
                  {p.estado === "CERRADO" && (
                    <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-500">
                      Cerrado
                    </span>
                  )}
                </div>
                {p.proximoPlazo && (
                  <p
                    className={`mt-2 text-sm font-medium ${
                      p.proximoPlazo.urgencia === "vencido"
                        ? "text-red-700"
                        : p.proximoPlazo.urgencia === "proximo"
                          ? "text-amber-700"
                          : "text-slate-500"
                    }`}
                  >
                    {ETIQUETA_URGENCIA[p.proximoPlazo.urgencia] && `${ETIQUETA_URGENCIA[p.proximoPlazo.urgencia]}: `}
                    {p.proximoPlazo.descripcion} — {p.proximoPlazo.fechaTexto}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
