import { requireUser } from "@/lib/auth";
import { getCronometroActivo } from "@/lib/timer";
import { TopBar } from "@/components/TopBar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const usuario = await requireUser();
  const cronometroActivo = await getCronometroActivo(usuario.id);

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <TopBar nombreUsuario={usuario.nombre} cronometroActivo={cronometroActivo} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
