"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { ORDEN_ESTADOS_TAREA, ORDEN_PRIORIDADES } from "@/lib/tareas";

type Prioridad = (typeof ORDEN_PRIORIDADES)[number];
type EstadoTarea = (typeof ORDEN_ESTADOS_TAREA)[number];

function campoTexto(formData: FormData, nombre: string): string | null {
  const valor = String(formData.get(nombre) ?? "").trim();
  return valor || null;
}

function datosTareaComunes(formData: FormData) {
  const prioridad = String(formData.get("prioridad") ?? "MEDIA");
  const estado = String(formData.get("estado") ?? "PDTE_INICIAR");
  const fechaLimiteStr = campoTexto(formData, "fechaLimite");
  const clienteId = campoTexto(formData, "clienteId");

  return {
    descripcion: String(formData.get("descripcion") ?? "").trim(),
    clienteId,
    usuarioAsignadoId: String(formData.get("usuarioAsignadoId") ?? ""),
    prioridad: (ORDEN_PRIORIDADES as readonly string[]).includes(prioridad)
      ? (prioridad as Prioridad)
      : "MEDIA",
    estado: (ORDEN_ESTADOS_TAREA as readonly string[]).includes(estado)
      ? (estado as EstadoTarea)
      : "PDTE_INICIAR",
    fechaLimite: fechaLimiteStr ? new Date(fechaLimiteStr) : null,
  };
}

export async function crearTareaAction(_prevState: unknown, formData: FormData) {
  await requireUser();

  const datos = datosTareaComunes(formData);
  if (!datos.descripcion) {
    return { error: "Describe brevemente la tarea." };
  }
  if (!datos.usuarioAsignadoId) {
    return { error: "Elige a quién se asigna la tarea." };
  }

  await prisma.tareaPendiente.create({ data: datos });

  redirect("/tareas?creada=1");
}

export async function actualizarTareaAction(
  tareaId: string,
  _prevState: unknown,
  formData: FormData
) {
  await requireUser();

  const datos = datosTareaComunes(formData);
  if (!datos.descripcion) {
    return { error: "Describe brevemente la tarea." };
  }
  if (!datos.usuarioAsignadoId) {
    return { error: "Elige a quién se asigna la tarea." };
  }

  await prisma.tareaPendiente.update({ where: { id: tareaId }, data: datos });

  redirect("/tareas?actualizada=1");
}

export async function cambiarEstadoTareaAction(formData: FormData) {
  await requireUser();

  const tareaId = String(formData.get("tareaId") ?? "");
  const estado = String(formData.get("estado") ?? "");

  if (!(ORDEN_ESTADOS_TAREA as readonly string[]).includes(estado)) {
    throw new Error("Estado de tarea no válido.");
  }

  await prisma.tareaPendiente.update({
    where: { id: tareaId },
    data: { estado: estado as EstadoTarea },
  });

  revalidatePath("/tareas");
}
