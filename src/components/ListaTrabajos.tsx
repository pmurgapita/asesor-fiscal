"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Trabajo = {
  id: string;
  clienteId: string;
  clienteNombre: string;
  titulo: string;
  estado: string;
  asignadosIds: string[];
  asignadosNombres: string;
};

const ETIQUETA_ESTADO: Record<string, string> = {
  EN_CURSO: "En curso",
  POR_COMENZAR: "Por comenzar",
  TERMINADO: "Terminado",
};

const COLOR_ESTADO: Record<string, string> = {
  EN_CURSO: "bg-green-100 text-green-800",
  POR_COMENZAR: "bg-amber-100 text-amber-800",
  TERMINADO: "bg-slate-100 text-slate-600",
};

export function ListaTrabajos({
  trabajos,
  clientes,
  trabajadores,
}: {
  trabajos: Trabajo[];
  clientes: { id: string; nombre: string }[];
  trabajadores: { id: string; nombre: string }[];
}) {
  const [cliente, setCliente] = useState("");
  const [estado, setEstado] = useState("");
  const [asignado, setAsignado] = useState("");

  const filtrados = useMemo(() => {
    return trabajos.filter((t) => {
      if (cliente && t.clienteId !== cliente) return false;
      if (estado && t.estado !== estado) return false;
      if (asignado && !t.asignadosIds.includes(asignado)) return false;
      return true;
    });
  }, [trabajos, cliente, estado, asignado]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={cliente}
          onChange={(e) => setCliente(e.target.value)}
          className="rounded-lg border-2 px-3 py-2 text-base"
          style={{ borderColor: "var(--color-border)" }}
        >
          <option value="">Todos los clientes</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>

        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          className="rounded-lg border-2 px-3 py-2 text-base"
          style={{ borderColor: "var(--color-border)" }}
        >
          <option value="">Todos los estados</option>
          <option value="POR_COMENZAR">Por comenzar</option>
          <option value="EN_CURSO">En curso</option>
          <option value="TERMINADO">Terminado</option>
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
      </div>

      {filtrados.length === 0 ? (
        <p className="py-8 text-center text-lg text-slate-500">No hay trabajos que coincidan.</p>
      ) : (
        <ul className="space-y-3">
          {filtrados.map((t) => (
            <li key={t.id}>
              <Link
                href={`/clientes/${t.clienteId}/trabajos/${t.id}`}
                className="card block hover:border-slate-400"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-slate-800">{t.titulo}</p>
                    <p className="text-base text-slate-600">
                      {t.clienteNombre} · {t.asignadosNombres}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-sm font-medium ${COLOR_ESTADO[t.estado]}`}
                  >
                    {ETIQUETA_ESTADO[t.estado]}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
