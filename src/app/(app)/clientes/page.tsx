import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BuscadorClientes } from "@/components/BuscadorClientes";

export default async function ClientesPage() {
  const clientes = await prisma.cliente.findMany({
    where: { activo: true },
    orderBy: { nombre: "asc" },
    select: { id: true, nombre: true, categoria: { select: { nombre: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Clientes</h1>
        <Link href="/clientes/nuevo" className="btn-primary px-4 py-2 text-base">
          + Nuevo cliente
        </Link>
      </div>
      <BuscadorClientes
        clientes={clientes.map((c) => ({
          id: c.id,
          nombre: c.nombre,
          categoria: c.categoria?.nombre ?? null,
        }))}
      />
    </div>
  );
}
