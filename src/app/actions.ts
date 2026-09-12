"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { requireUser, verifyPassword } from "@/lib/auth";
import { tarifaEfectiva, calcularImporte } from "@/lib/tiempo";

export async function loginAction(_prevState: unknown, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Introduce tu correo y tu contraseña." };
  }

  const usuario = await prisma.usuario.findUnique({ where: { email } });
  if (!usuario || !usuario.activo) {
    return { error: "No reconocemos ese usuario. Revísalo e inténtalo de nuevo." };
  }

  const passwordOk = await verifyPassword(password, usuario.passwordHash);
  if (!passwordOk) {
    return { error: "La contraseña no es correcta." };
  }

  const session = await getSession();
  session.userId = usuario.id;
  await session.save();

  redirect("/clientes");
}

export async function logoutAction() {
  const session = await getSession();
  session.destroy();
  redirect("/login");
}

/**
 * Inicia un cronómetro para el trabajo indicado. Si el trabajador ya tiene
 * uno en marcha (en cualquier trabajo), lo llevamos a ese en vez de crear
 * uno nuevo: así es imposible tener dos cronómetros corriendo a la vez.
 */
export async function iniciarCronometroAction(trabajoId: string) {
  const usuario = await requireUser();

  const activo = await prisma.registroTiempo.findFirst({
    where: { usuarioId: usuario.id, horaFin: null },
    include: { trabajo: true },
  });

  if (activo) {
    redirect(`/clientes/${activo.trabajo.clienteId}/trabajos/${activo.trabajoId}`);
  }

  const trabajo = await prisma.trabajo.findUniqueOrThrow({
    where: { id: trabajoId },
    include: { cliente: true },
  });

  const tarifa = tarifaEfectiva(usuario, trabajo.cliente);
  const ahora = new Date();

  await prisma.registroTiempo.create({
    data: {
      trabajoId: trabajo.id,
      usuarioId: usuario.id,
      fecha: ahora,
      horaInicio: ahora,
      tarifaAplicada: tarifa,
      origen: "CRONOMETRO",
    },
  });

  if (trabajo.estado === "POR_COMENZAR") {
    await prisma.trabajo.update({
      where: { id: trabajo.id },
      data: { estado: "EN_CURSO" },
    });
  }

  revalidatePath("/", "layout");
  redirect(`/clientes/${trabajo.clienteId}/trabajos/${trabajo.id}`);
}

export async function detenerCronometroAction(formData: FormData) {
  const usuario = await requireUser();
  const registroId = String(formData.get("registroId") ?? "");
  const nota = String(formData.get("nota") ?? "").trim();

  const registro = await prisma.registroTiempo.findUniqueOrThrow({
    where: { id: registroId },
    include: { trabajo: true },
  });

  if (registro.usuarioId !== usuario.id) {
    throw new Error("No puedes detener el cronómetro de otro trabajador.");
  }

  const ahora = new Date();
  const duracionMinutos = Math.max(
    1,
    Math.round((ahora.getTime() - registro.horaInicio.getTime()) / 60000)
  );
  const importe = calcularImporte(duracionMinutos, Number(registro.tarifaAplicada));

  await prisma.registroTiempo.update({
    where: { id: registro.id },
    data: {
      horaFin: ahora,
      duracionMinutos,
      importe,
      nota: nota || null,
    },
  });

  revalidatePath("/", "layout");
  redirect(
    `/clientes/${registro.trabajo.clienteId}/trabajos/${registro.trabajoId}?guardado=${registro.id}`
  );
}

export async function actualizarRegistroAction(
  registroId: string,
  _prevState: unknown,
  formData: FormData
) {
  const usuario = await requireUser();

  const registro = await prisma.registroTiempo.findUniqueOrThrow({
    where: { id: registroId },
  });

  if (registro.usuarioId !== usuario.id && usuario.rol !== "ADMIN") {
    return { error: "No puedes corregir el registro de otro trabajador." };
  }

  const fecha = String(formData.get("fecha") ?? "");
  const horaInicio = String(formData.get("horaInicio") ?? "");
  const horaFin = String(formData.get("horaFin") ?? "");
  const nota = String(formData.get("nota") ?? "").trim();
  const motivoEdicion = String(formData.get("motivoEdicion") ?? "").trim();

  if (!fecha || !horaInicio || !horaFin) {
    return { error: "Rellena la fecha y las horas de inicio y fin." };
  }
  if (!motivoEdicion) {
    return { error: "Indica brevemente el motivo de la corrección." };
  }

  const inicio = new Date(`${fecha}T${horaInicio}:00`);
  const fin = new Date(`${fecha}T${horaFin}:00`);

  if (fin <= inicio) {
    return { error: "La hora de fin debe ser posterior a la hora de inicio." };
  }

  const duracionMinutos = Math.round((fin.getTime() - inicio.getTime()) / 60000);
  const importe = calcularImporte(duracionMinutos, Number(registro.tarifaAplicada));

  await prisma.registroTiempo.update({
    where: { id: registro.id },
    data: {
      fecha: inicio,
      horaInicio: inicio,
      horaFin: fin,
      duracionMinutos,
      importe,
      nota: nota || null,
      editadoManualmente: true,
      motivoEdicion,
    },
  });

  redirect("/mis-tiempos?corregido=1");
}
