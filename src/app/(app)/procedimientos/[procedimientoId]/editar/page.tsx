import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EditarProcedimientoForm } from "@/components/EditarProcedimientoForm";
import { actualizarProcedimientoAction } from "@/app/procedimientos/actions";

export default async function EditarProcedimientoPage({
  params,
}: {
  params: Promise<{ procedimientoId: string }>;
}) {
  const { procedimientoId } = await params;

  const procedimiento = await prisma.procedimientoTributario.findUnique({
    where: { id: procedimientoId },
    include: { cliente: true },
  });

  if (!procedimiento) notFound();

  const boundAction = actualizarProcedimientoAction.bind(null, procedimiento.id);

  return (
    <div className="space-y-6">
      <Link href={`/procedimientos/${procedimiento.id}`} className="text-base font-medium text-blue-700">
        ← {procedimiento.tipoProcedimiento}
      </Link>

      <h1 className="text-2xl font-bold text-slate-800">Editar procedimiento</h1>
      <p className="text-lg text-slate-500">{procedimiento.cliente.nombre}</p>

      <EditarProcedimientoForm
        action={boundAction}
        initialValues={{
          tipoProcedimiento: procedimiento.tipoProcedimiento,
          organismo: procedimiento.organismo,
          estado: procedimiento.estado,
          notas: procedimiento.notas ?? "",
        }}
      />
    </div>
  );
}
