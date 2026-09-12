import Link from "next/link";

export default function NoAutorizadoPage() {
  return (
    <div className="card mx-auto max-w-md space-y-4 text-center">
      <h1 className="text-2xl font-bold text-slate-800">No tienes acceso a esta sección</h1>
      <p className="text-lg text-slate-600">
        Esta pantalla es solo para administradores del despacho. Si crees que deberías tener
        acceso, pide a un administrador que revise tu usuario.
      </p>
      <Link href="/clientes" className="btn-primary inline-flex">
        Volver al inicio
      </Link>
    </div>
  );
}
