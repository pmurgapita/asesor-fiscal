import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

const ORDEN_ESTADO: Record<string, number> = {
  EN_CURSO: 0,
  POR_COMENZAR: 1,
  TERMINADO: 2,
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

export default async function ClienteDetallePage({
  params,
}: {
  params: Promise<{ clienteId: string }>;
}) {
  const { clienteId } = await params;

  const cliente = await prisma.cliente.findUnique({
    where: { id: clienteId },
    include: {
      trabajos: { orderBy: { fechaAlta: "desc" } },
    },
  });

  if (!cliente) notFound();

  const trabajos = [...cliente.trabajos].sort(
    (a, b) => ORDEN_ESTADO[a.estado] - ORDEN_ESTADO[b.estado]
  );

  return (
    <div className="space-y-6">
      <Link href="/clientes" className="text-base font-medium text-blue-700">
        ← Todos los clientes
      </Link>

      <h1 className="text-2xl font-bold text-slate-800">{cliente.nombre}</h1>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-700">Trabajos</h2>
        {trabajos.length === 0 ? (
          <p className="text-lg text-slate-500">Este cliente todavía no tiene trabajos.</p>
        ) : (
          <ul className="space-y-3">
            {trabajos.map((trabajo) => (
              <li key={trabajo.id}>
                <Link
                  href={`/clientes/${cliente.id}/trabajos/${trabajo.id}`}
                  className="card flex items-center justify-between hover:border-slate-400"
                >
                  <span className="text-lg font-semibold text-slate-800">{trabajo.titulo}</span>
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-medium ${COLOR_ESTADO[trabajo.estado]}`}
                  >
                    {ETIQUETA_ESTADO[trabajo.estado]}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
