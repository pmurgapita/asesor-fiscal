import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { formatearFechaInput, formatearHoraInput } from "@/lib/tiempo";
import { EditarRegistroForm } from "@/components/EditarRegistroForm";

export default async function EditarRegistroPage({
  params,
}: {
  params: Promise<{ registroId: string }>;
}) {
  const { registroId } = await params;
  const usuario = await requireUser();

  const registro = await prisma.registroTiempo.findUnique({
    where: { id: registroId },
    include: { trabajo: { include: { cliente: true } } },
  });

  if (!registro || !registro.horaFin) notFound();
  if (registro.usuarioId !== usuario.id && usuario.rol !== "ADMIN") notFound();

  return (
    <div className="space-y-6">
      <Link href="/mis-tiempos" className="text-base font-medium text-blue-700">
        ← Mis tiempos
      </Link>

      <h1 className="text-2xl font-bold text-slate-800">Corregir registro</h1>

      <EditarRegistroForm
        registroId={registro.id}
        clienteNombre={registro.trabajo.cliente.nombre}
        trabajoTitulo={registro.trabajo.titulo}
        fecha={formatearFechaInput(registro.horaInicio)}
        horaInicio={formatearHoraInput(registro.horaInicio)}
        horaFin={formatearHoraInput(registro.horaFin)}
        nota={registro.nota ?? ""}
      />
    </div>
  );
}
