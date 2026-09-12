import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LoginForm } from "@/components/LoginForm";

export default async function LoginPage() {
  const session = await getSession();
  if (session.userId) {
    redirect("/clientes");
  }

  return (
    <main className="flex min-h-screen flex-1 flex-col items-center justify-center gap-8 px-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-800">Gestión del despacho</h1>
        <p className="mt-2 text-lg text-slate-500">Inicia sesión para continuar</p>
      </div>
      <LoginForm />
    </main>
  );
}
