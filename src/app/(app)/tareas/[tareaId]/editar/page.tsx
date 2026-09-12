import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TareaForm } from "@/components/TareaForm";
import { actualizarTareaAction } from "@/app/tareas/actions";
import { formatearFechaInput } from "@/lib/tiempo";

export default async function EditarTareaPage({
  params,
}: {
  params: Promise<{ tareaId: string }>;
}) {
  const { tareaId } = await params;

  const [tarea, clientes, trabajadores] = await Promise.all([
    prisma.tareaPendiente.findUnique({ where: { id: tareaId } }),
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

  if (!tarea) notFound();

  const boundAction = actualizarTareaAction.bind(null, tarea.id);

  return (
    <div className="space-y-6">
      <Link href="/tareas" className="text-base font-medium text-blue-700">
        ← Tareas pendientes
      </Link>

      <h1 className="text-2xl font-bold text-slate-800">Editar tarea</h1>

      <TareaForm
        action={boundAction}
        clientes={clientes}
        trabajadores={trabajadores}
        textoBoton="Guardar cambios"
        initialValues={{
          descripcion: tarea.descripcion,
          clienteId: tarea.clienteId ?? undefined,
          usuarioAsignadoId: tarea.usuarioAsignadoId,
          prioridad: tarea.prioridad,
          estado: tarea.estado,
          fechaLimite: tarea.fechaLimite ? formatearFechaInput(tarea.fechaLimite) : undefined,
        }}
      />
    </div>
  );
}
