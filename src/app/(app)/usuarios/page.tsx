import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ToggleActivoUsuario } from "@/components/ToggleActivoUsuario";

export default async function UsuariosPage({
  searchParams,
}: {
  searchParams: Promise<{ creado?: string }>;
}) {
  const admin = await requireAdmin();
  const { creado } = await searchParams;

  const usuarios = await prisma.usuario.findMany({ orderBy: { nombre: "asc" } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Usuarios</h1>
        <Link href="/usuarios/nuevo" className="btn-primary px-4 py-2 text-base">
          + Nuevo usuario
        </Link>
      </div>

      {creado && (
        <div className="card border-green-300 bg-green-50">
          <p className="text-lg font-semibold text-green-800">Usuario creado correctamente</p>
        </div>
      )}

      <ul className="space-y-3">
        {usuarios.map((u) => (
          <li key={u.id} className="card flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-slate-800">{u.nombre}</p>
              <p className="text-base text-slate-500">
                {u.email} · {u.rol === "ADMIN" ? "Administrador" : "Trabajador"}
              </p>
            </div>
            <ToggleActivoUsuario usuarioId={u.id} activo={u.activo} esUsuarioActual={u.id === admin.id} />
          </li>
        ))}
      </ul>
    </div>
  );
}
