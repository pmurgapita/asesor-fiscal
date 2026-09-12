import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { NuevoProcedimientoForm } from "@/components/NuevoProcedimientoForm";

export default async function NuevoProcedimientoPage() {
  const clientes = await prisma.cliente.findMany({
    where: { activo: true },
    orderBy: { nombre: "asc" },
    select: { id: true, nombre: true },
  });

  return (
    <div className="space-y-6">
      <Link href="/procedimientos" className="text-base font-medium text-blue-700">
        ← Procedimientos tributarios
      </Link>

      <h1 className="text-2xl font-bold text-slate-800">Nuevo procedimiento</h1>

      <NuevoProcedimientoForm clientes={clientes} />
    </div>
  );
}
