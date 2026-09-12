import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TrabajoForm } from "@/components/TrabajoForm";
import { crearTrabajoAction } from "@/app/trabajos/actions";

export default async function NuevoTrabajoPage({
  params,
}: {
  params: Promise<{ clienteId: string }>;
}) {
  const { clienteId } = await params;

  const [cliente, trabajadores, categorias] = await Promise.all([
    prisma.cliente.findUnique({ where: { id: clienteId }, select: { id: true, nombre: true } }),
    prisma.usuario.findMany({
      where: { activo: true },
      orderBy: { nombre: "asc" },
      select: { id: true, nombre: true },
    }),
    prisma.categoriaTrabajo.findMany({ orderBy: { nombre: "asc" }, select: { nombre: true } }),
  ]);

  if (!cliente) notFound();

  const boundAction = crearTrabajoAction.bind(null, cliente.id);

  return (
    <div className="space-y-6">
      <Link href={`/clientes/${cliente.id}`} className="text-base font-medium text-blue-700">
        ← {cliente.nombre}
      </Link>

      <h1 className="text-2xl font-bold text-slate-800">Nuevo trabajo</h1>
      <p className="text-lg text-slate-500">{cliente.nombre}</p>

      <TrabajoForm
        action={boundAction}
        trabajadores={trabajadores}
        categoriasExistentes={categorias.map((c) => c.nombre)}
        textoBoton="Crear trabajo"
      />
    </div>
  );
}
