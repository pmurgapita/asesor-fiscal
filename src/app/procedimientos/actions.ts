"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

function campoTexto(formData: FormData, nombre: string): string | null {
  const valor = String(formData.get(nombre) ?? "").trim();
  return valor || null;
}

export async function crearProcedimientoAction(_prevState: unknown, formData: FormData) {
  await requireUser();

  const clienteId = String(formData.get("clienteId") ?? "");
  const tipoProcedimiento = String(formData.get("tipoProcedimiento") ?? "").trim();
  const organismo = String(formData.get("organismo") ?? "").trim();

  if (!clienteId) return { error: "Elige el cliente al que pertenece el procedimiento." };
  if (!tipoProcedimiento) return { error: "Indica el tipo de procedimiento." };
  if (!organismo) return { error: "Indica el organismo o vía (ej: TEAR, TEAC, Contencioso…)." };

  const procedimiento = await prisma.procedimientoTributario.create({
    data: {
      clienteId,
      tipoProcedimiento,
      organismo,
      notas: campoTexto(formData, "notas"),
    },
  });

  redirect(`/procedimientos/${procedimiento.id}?creado=1`);
}

export async function actualizarProcedimientoAction(
  procedimientoId: string,
  _prevState: unknown,
  formData: FormData
) {
  await requireUser();

  const tipoProcedimiento = String(formData.get("tipoProcedimiento") ?? "").trim();
  const organismo = String(formData.get("organismo") ?? "").trim();
  const estado = String(formData.get("estado") ?? "ABIERTO") === "CERRADO" ? "CERRADO" : "ABIERTO";

  if (!tipoProcedimiento) return { error: "Indica el tipo de procedimiento." };
  if (!organismo) return { error: "Indica el organismo o vía." };

  await prisma.procedimientoTributario.update({
    where: { id: procedimientoId },
    data: {
      tipoProcedimiento,
      organismo,
      estado,
      notas: campoTexto(formData, "notas"),
    },
  });

  redirect(`/procedimientos/${procedimientoId}?actualizado=1`);
}

export async function añadirPlazoAction(procedimientoId: string, formData: FormData) {
  await requireUser();

  const descripcion = String(formData.get("descripcion") ?? "").trim();
  const fechaLimiteStr = String(formData.get("fechaLimite") ?? "").trim();
  const avisoDiasAntesStr = String(formData.get("avisoDiasAntes") ?? "15").trim();

  if (!descripcion || !fechaLimiteStr) {
    redirect(`/procedimientos/${procedimientoId}`);
  }

  const avisoDiasAntes = Number.isFinite(Number(avisoDiasAntesStr))
    ? Number(avisoDiasAntesStr)
    : 15;

  await prisma.procedimientoPlazo.create({
    data: {
      procedimientoId,
      descripcion,
      fechaLimite: new Date(fechaLimiteStr),
      avisoDiasAntes,
    },
  });

  revalidatePath(`/procedimientos/${procedimientoId}`);
  revalidatePath("/procedimientos");
  redirect(`/procedimientos/${procedimientoId}`);
}

export async function marcarPlazoAction(formData: FormData) {
  await requireUser();

  const plazoId = String(formData.get("plazoId") ?? "");
  const procedimientoId = String(formData.get("procedimientoId") ?? "");
  const cumplido = String(formData.get("cumplido") ?? "") === "true";

  await prisma.procedimientoPlazo.update({
    where: { id: plazoId },
    data: { cumplido },
  });

  revalidatePath(`/procedimientos/${procedimientoId}`);
  revalidatePath("/procedimientos");
}

export async function eliminarPlazoAction(formData: FormData) {
  await requireUser();

  const plazoId = String(formData.get("plazoId") ?? "");
  const procedimientoId = String(formData.get("procedimientoId") ?? "");

  await prisma.procedimientoPlazo.delete({ where: { id: plazoId } });

  redirect(`/procedimientos/${procedimientoId}`);
}
