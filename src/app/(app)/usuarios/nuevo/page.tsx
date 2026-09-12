import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { NuevoUsuarioForm } from "@/components/NuevoUsuarioForm";

export default async function NuevoUsuarioPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <Link href="/usuarios" className="text-base font-medium text-blue-700">
        ← Usuarios
      </Link>

      <h1 className="text-2xl font-bold text-slate-800">Nuevo usuario</h1>

      <NuevoUsuarioForm />
    </div>
  );
}
