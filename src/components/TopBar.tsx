import Link from "next/link";
import { logoutAction } from "@/app/actions";
import { CronometroTick } from "./CronometroTick";

type CronometroActivo = {
  id: string;
  horaInicio: Date;
  trabajo: { id: string; titulo: string; clienteId: string; cliente: { nombre: string } };
} | null;

export function TopBar({
  nombreUsuario,
  cronometroActivo,
}: {
  nombreUsuario: string;
  cronometroActivo: CronometroActivo;
}) {
  return (
    <div>
      <header className="flex items-center justify-between border-b bg-white px-6 py-4">
        <Link href="/clientes" className="text-xl font-bold text-slate-800">
          Gestión del despacho
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/mis-tiempos" className="text-base font-medium text-blue-700">
            Mis tiempos
          </Link>
          <span className="text-base text-slate-600">{nombreUsuario}</span>
          <form action={logoutAction}>
            <button type="submit" className="btn-secondary px-4 py-2 text-base">
              Cerrar sesión
            </button>
          </form>
        </div>
      </header>

      {cronometroActivo && (
        <Link
          href={`/clientes/${cronometroActivo.trabajo.clienteId}/trabajos/${cronometroActivo.trabajo.id}`}
          className="flex items-center justify-center gap-3 px-4 py-3 text-lg font-semibold text-white"
          style={{ backgroundColor: "var(--color-success)" }}
        >
          <span className="inline-block h-3 w-3 animate-pulse rounded-full bg-white" />
          Cronómetro en marcha: {cronometroActivo.trabajo.cliente.nombre} —{" "}
          {cronometroActivo.trabajo.titulo} —{" "}
          <CronometroTick horaInicioIso={cronometroActivo.horaInicio.toISOString()} />
        </Link>
      )}
    </div>
  );
}
