import { prisma } from "@/lib/prisma";
import { ListaTrabajos } from "@/components/ListaTrabajos";

export default async function TrabajosPage() {
  const [trabajos, clientes, trabajadores] = await Promise.all([
    prisma.trabajo.findMany({
      orderBy: { fechaAlta: "desc" },
      include: { cliente: true, asignaciones: { include: { usuario: true } } },
    }),
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
      <h1 className="text-2xl font-bold text-slate-800">Trabajos</h1>

      <ListaTrabajos
        trabajos={trabajos.map((t) => ({
          id: t.id,
          clienteId: t.clienteId,
          clienteNombre: t.cliente.nombre,
          titulo: t.titulo,
          estado: t.estado,
          asignadosIds: t.asignaciones.map((a) => a.usuarioId),
          asignadosNombres: t.asignaciones.map((a) => a.usuario.nombre).join(", "),
        }))}
        clientes={clientes}
        trabajadores={trabajadores}
      />
    </div>
  );
}
