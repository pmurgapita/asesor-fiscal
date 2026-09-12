import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { TareaForm } from "@/components/TareaForm";
import { crearTareaAction } from "@/app/tareas/actions";

export default async function NuevaTareaPage() {
  const [clientes, trabajadores] = await Promise.all([
    prisma.cliente.findMany({
      where: { activo: true },
      orderBy: { nombre: "asc" },
      select: { id: true, nombre: true },
    }),
    prisma.usuario.findMany({
      where: { activo: true },
      orderBy: { nombre: "asc" },
      select: { id: true, nombre: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <Link href="/tareas" className="text-base font-medium text-blue-700">
        ← Tareas pendientes
      </Link>

      <h1 className="text-2xl font-bold text-slate-800">Nueva tarea</h1>

      <TareaForm
        action={crearTareaAction}
        clientes={clientes}
        trabajadores={trabajadores}
        textoBoton="Crear tarea"
      />
    </div>
  );
}
