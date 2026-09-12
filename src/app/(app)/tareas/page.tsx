import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ListaTareas } from "@/components/ListaTareas";

export default async function TareasPage({
  searchParams,
}: {
  searchParams: Promise<{ creada?: string; actualizada?: string }>;
}) {
  const { creada, actualizada } = await searchParams;

  const [tareas, trabajadores] = await Promise.all([
    prisma.tareaPendiente.findMany({
      orderBy: [{ prioridad: "asc" }, { fechaLimite: "asc" }],
      include: { cliente: true, usuarioAsignado: true },
    }),
    prisma.usuario.findMany({
      where: { activo: true },
      orderBy: { nombre: "asc" },
      select: { id: true, nombre: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Tareas pendientes</h1>
        <Link href="/tareas/nueva" className="btn-primary px-4 py-2 text-base">
          + Nueva tarea
        </Link>
      </div>

      {creada && (
        <div className="card border-green-300 bg-green-50">
          <p className="text-lg font-semibold text-green-800">Tarea creada correctamente</p>
        </div>
      )}
      {actualizada && (
        <div className="card border-green-300 bg-green-50">
          <p className="text-lg font-semibold text-green-800">Tarea actualizada correctamente</p>
        </div>
      )}

      <ListaTareas
        tareas={tareas.map((t) => ({
          id: t.id,
          descripcion: t.descripcion,
          clienteId: t.clienteId,
          clienteNombre: t.cliente?.nombre ?? null,
          usuarioAsignadoId: t.usuarioAsignadoId,
          usuarioAsignadoNombre: t.usuarioAsignado.nombre,
          prioridad: t.prioridad,
          estado: t.estado,
          fechaLimiteTexto: t.fechaLimite
            ? new Intl.DateTimeFormat("es-ES").format(t.fechaLimite)
            : null,
        }))}
        trabajadores={trabajadores}
      />
    </div>
  );
}
