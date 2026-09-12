import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ClienteForm } from "@/components/ClienteForm";
import { actualizarClienteAction } from "@/app/clientes/actions";

export default async function EditarClientePage({
  params,
}: {
  params: Promise<{ clienteId: string }>;
}) {
  const { clienteId } = await params;

  const [cliente, categorias] = await Promise.all([
    prisma.cliente.findUnique({ where: { id: clienteId }, include: { categoria: true } }),
    prisma.categoriaCliente.findMany({ orderBy: { nombre: "asc" }, select: { nombre: true } }),
  ]);

  if (!cliente) notFound();

  const boundAction = actualizarClienteAction.bind(null, cliente.id);

  return (
    <div className="space-y-6">
      <Link href={`/clientes/${cliente.id}/ficha`} className="text-base font-medium text-blue-700">
        ← {cliente.nombre}
      </Link>

      <h1 className="text-2xl font-bold text-slate-800">Editar cliente</h1>

      <ClienteForm
        action={boundAction}
        categoriasExistentes={categorias.map((c) => c.nombre)}
        textoBoton="Guardar cambios"
        initialValues={{
          nombre: cliente.nombre,
          dni: cliente.dni ?? undefined,
          direccion: cliente.direccion ?? undefined,
          telefono: cliente.telefono ?? undefined,
          email: cliente.email ?? undefined,
          estadoCivil: cliente.estadoCivil ?? undefined,
          regimenMatrimonial: cliente.regimenMatrimonial ?? undefined,
          categoria: cliente.categoria?.nombre,
          tarifaHoraEspecial: cliente.tarifaHoraEspecial?.toString(),
          razonSocialFacturacion: cliente.razonSocialFacturacion ?? undefined,
          cifFacturacion: cliente.cifFacturacion ?? undefined,
          direccionFacturacion: cliente.direccionFacturacion ?? undefined,
          notas: cliente.notas ?? undefined,
        }}
      />
    </div>
  );
}
