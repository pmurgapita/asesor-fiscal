import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TrabajoForm } from "@/components/TrabajoForm";
import { actualizarTrabajoAction } from "@/app/trabajos/actions";

export default async function EditarTrabajoPage({
  params,
}: {
  params: Promise<{ clienteId: string; trabajoId: string }>;
}) {
  const { clienteId, trabajoId } = await params;

  const [trabajo, trabajadores, categorias] = await Promise.all([
    prisma.trabajo.findUnique({
      where: { id: trabajoId },
      include: { cliente: true, categoria: true, asignaciones: true },
    }),
    prisma.usuario.findMany({
      where: { activo: true },
      orderBy: { nombre: "asc" },
      select: { id: true, nombre: true },
    }),
    prisma.categoriaTrabajo.findMany({ orderBy: { nombre: "asc" }, select: { nombre: true } }),
  ]);

  if (!trabajo || trabajo.clienteId !== clienteId) notFound();

  const boundAction = actualizarTrabajoAction.bind(null, trabajo.id, clienteId);

  return (
    <div className="space-y-6">
      <Link
        href={`/clientes/${clienteId}/trabajos/${trabajo.id}/detalles`}
        className="text-base font-medium text-blue-700"
      >
        ← {trabajo.titulo}
      </Link>

      <h1 className="text-2xl font-bold text-slate-800">Editar trabajo</h1>
      <p className="text-lg text-slate-500">{trabajo.cliente.nombre}</p>

      <TrabajoForm
        action={boundAction}
        trabajadores={trabajadores}
        categoriasExistentes={categorias.map((c) => c.nombre)}
        textoBoton="Guardar cambios"
        initialValues={{
          titulo: trabajo.titulo,
          categoria: trabajo.categoria?.nombre,
          descripcion: trabajo.descripcion ?? undefined,
          estado: trabajo.estado,
          asignados: trabajo.asignaciones.map((a) => a.usuarioId),
        }}
      />
    </div>
  );
}
