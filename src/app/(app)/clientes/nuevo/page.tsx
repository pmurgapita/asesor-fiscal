import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ClienteForm } from "@/components/ClienteForm";
import { crearClienteAction } from "@/app/clientes/actions";

export default async function NuevoClientePage() {
  const categorias = await prisma.categoriaCliente.findMany({
    orderBy: { nombre: "asc" },
    select: { nombre: true },
  });

  return (
    <div className="space-y-6">
      <Link href="/clientes" className="text-base font-medium text-blue-700">
        ← Todos los clientes
      </Link>

      <h1 className="text-2xl font-bold text-slate-800">Nuevo cliente</h1>

      <ClienteForm
        action={crearClienteAction}
        categoriasExistentes={categorias.map((c) => c.nombre)}
        textoBoton="Crear cliente"
      />
    </div>
  );
}
