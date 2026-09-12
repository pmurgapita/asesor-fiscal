"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

function campoTexto(formData: FormData, nombre: string): string | null {
  const valor = String(formData.get(nombre) ?? "").trim();
  return valor || null;
}

async function resolverCategoriaTrabajoId(formData: FormData): Promise<string | null> {
  const nombreCategoria = campoTexto(formData, "categoria");
  if (!nombreCategoria) return null;

  const categoria = await prisma.categoriaTrabajo.upsert({
    where: { nombre: nombreCategoria },
    update: {},
    create: { nombre: nombreCategoria },
  });
  return categoria.id;
}

export async function crearTrabajoAction(
  clienteId: string,
  _prevState: unknown,
  formData: FormData
) {
  const usuario = await requireUser();

  const titulo = String(formData.get("titulo") ?? "").trim();
  if (!titulo) {
    return { error: "Indica un título para el trabajo." };
  }

  const asignados = formData.getAll("asignados").map(String);
  if (asignados.length === 0) {
    return { error: "Asigna el trabajo al menos a un trabajador." };
  }

  const categoriaId = await resolverCategoriaTrabajoId(formData);
  const estado = String(formData.get("estado") ?? "POR_COMENZAR");

  const trabajo = await prisma.trabajo.create({
    data: {
      clienteId,
      categoriaId,
      titulo,
      descripcion: campoTexto(formData, "descripcion"),
      estado: estado === "EN_CURSO" || estado === "TERMINADO" ? estado : "POR_COMENZAR",
      creadoPorId: usuario.id,
      asignaciones: { create: asignados.map((usuarioId) => ({ usuarioId })) },
    },
  });

  redirect(`/clientes/${clienteId}/trabajos/${trabajo.id}?creado=1`);
}

export async function actualizarTrabajoAction(
  trabajoId: string,
  clienteId: string,
  _prevState: unknown,
  formData: FormData
) {
  await requireUser();

  const titulo = String(formData.get("titulo") ?? "").trim();
  if (!titulo) {
    return { error: "Indica un título para el trabajo." };
  }

  const asignados = formData.getAll("asignados").map(String);
  if (asignados.length === 0) {
    return { error: "Asigna el trabajo al menos a un trabajador." };
  }

  const categoriaId = await resolverCategoriaTrabajoId(formData);
  const estado = String(formData.get("estado") ?? "POR_COMENZAR");

  await prisma.$transaction([
    prisma.trabajo.update({
      where: { id: trabajoId },
      data: {
        categoriaId,
        titulo,
        descripcion: campoTexto(formData, "descripcion"),
        estado: ["POR_COMENZAR", "EN_CURSO", "TERMINADO"].includes(estado)
          ? (estado as "POR_COMENZAR" | "EN_CURSO" | "TERMINADO")
          : "POR_COMENZAR",
      },
    }),
    prisma.trabajoAsignacion.deleteMany({ where: { trabajoId } }),
    prisma.trabajoAsignacion.createMany({
      data: asignados.map((usuarioId) => ({ trabajoId, usuarioId })),
    }),
  ]);

  redirect(`/clientes/${clienteId}/trabajos/${trabajoId}/detalles?actualizado=1`);
}

export async function crearGastoAction(
  trabajoId: string,
  clienteId: string,
  formData: FormData
) {
  const usuario = await requireUser();

  const concepto = String(formData.get("concepto") ?? "").trim();
  const importeStr = String(formData.get("importe") ?? "").trim();
  const importe = Number(importeStr.replace(",", "."));

  if (!concepto || !Number.isFinite(importe)) {
    redirect(`/clientes/${clienteId}/trabajos/${trabajoId}/detalles`);
  }

  await prisma.gasto.create({
    data: {
      trabajoId,
      concepto,
      importe,
      repercutirACliente: formData.get("repercutirACliente") === "on",
      creadoPorId: usuario.id,
    },
  });

  redirect(`/clientes/${clienteId}/trabajos/${trabajoId}/detalles`);
}

export async function eliminarGastoAction(formData: FormData) {
  await requireUser();

  const gastoId = String(formData.get("gastoId") ?? "");
  const clienteId = String(formData.get("clienteId") ?? "");
  const trabajoId = String(formData.get("trabajoId") ?? "");

  await prisma.gasto.delete({ where: { id: gastoId } });

  redirect(`/clientes/${clienteId}/trabajos/${trabajoId}/detalles`);
}
