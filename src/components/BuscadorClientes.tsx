"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type ClienteResumen = {
  id: string;
  nombre: string;
  categoria: string | null;
};

export function BuscadorClientes({ clientes }: { clientes: ClienteResumen[] }) {
  const [texto, setTexto] = useState("");

  const filtrados = useMemo(() => {
    const buscado = texto.trim().toLowerCase();
    if (!buscado) return clientes;
    return clientes.filter((c) => c.nombre.toLowerCase().includes(buscado));
  }, [texto, clientes]);

  return (
    <div className="space-y-4">
      <input
        type="search"
        className="field-input"
        placeholder="Buscar cliente por nombre…"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        autoFocus
      />

      {filtrados.length === 0 ? (
        <p className="py-8 text-center text-lg text-slate-500">
          No se ha encontrado ningún cliente con ese nombre.
        </p>
      ) : (
        <ul className="space-y-3">
          {filtrados.map((cliente) => (
            <li key={cliente.id}>
              <Link
                href={`/clientes/${cliente.id}`}
                className="card flex items-center justify-between hover:border-slate-400"
              >
                <span className="text-lg font-semibold text-slate-800">{cliente.nombre}</span>
                {cliente.categoria && (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
                    {cliente.categoria}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
