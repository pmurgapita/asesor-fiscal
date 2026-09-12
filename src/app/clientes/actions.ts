"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

type EstadoCivilValor =
  | "SOLTERO"
  | "CASADO"
  | "DIVORCIADO"
  | "VIUDO"
  | "PAREJA_DE_HECHO";

const ESTADOS_CIVILES_VALIDOS: EstadoCivilValor[] = [
  "SOLTERO",
  "CASADO",
  "DIVORCIADO",
  "VIUDO",
  "PAREJA_DE_HECHO",
];

function campoTexto(formData: FormData, nombre: string): string | null {
  const valor = String(formData.get(nombre) ?? "").trim();
  return valor || null;
}

function campoDecimal(formData: FormData, nombre: string): number | null {
  const valor = String(formData.get(nombre) ?? "").trim();
  if (!valor) return null;
  const numero = Number(valor.replace(",", "."));
  return Number.isFinite(numero) ? numero : null;
}

function campoEstadoCivil(formData: FormData): EstadoCivilValor | null {
  const valor = String(formData.get("estadoCivil") ?? "").trim();
  return ESTADOS_CIVILES_VALIDOS.includes(valor as EstadoCivilValor)
    ? (valor as EstadoCivilValor)
    : null;
}

async function resolverCategoriaId(formData: FormData): Promise<string | null> {
  const nombreCategoria = campoTexto(formData, "categoria");
  if (!nombreCategoria) return null;

  const categoria = await prisma.categoriaCliente.upsert({
    where: { nombre: nombreCategoria },
    update: {},
    create: { nombre: nombreCategoria },
  });
  return categoria.id;
}

function datosClienteComunes(formData: FormData, categoriaId: string | null) {
  return {
    nombre: String(formData.get("nombre") ?? "").trim(),
    dni: campoTexto(formData, "dni"),
    direccion: campoTexto(formData, "direccion"),
    telefono: campoTexto(formData, "telefono"),
    email: campoTexto(formData, "email"),
    estadoCivil: campoEstadoCivil(formData),
    regimenMatrimonial: campoTexto(formData, "regimenMatrimonial"),
    tarifaHoraEspecial: campoDecimal(formData, "tarifaHoraEspecial"),
    razonSocialFacturacion: campoTexto(formData, "razonSocialFacturacion"),
    cifFacturacion: campoTexto(formData, "cifFacturacion"),
    direccionFacturacion: campoTexto(formData, "direccionFacturacion"),
    notas: campoTexto(formData, "notas"),
    categoriaId,
  };
}

export async function crearClienteAction(_prevState: unknown, formData: FormData) {
  await requireUser();

  const nombre = String(formData.get("nombre") ?? "").trim();
  if (!nombre) {
    return { error: "El nombre del cliente es obligatorio." };
  }

  const categoriaId = await resolverCategoriaId(formData);

  const cliente = await prisma.cliente.create({
    data: datosClienteComunes(formData, categoriaId),
  });

  redirect(`/clientes/${cliente.id}/ficha?creado=1`);
}

export async function actualizarClienteAction(
  clienteId: string,
  _prevState: unknown,
  formData: FormData
) {
  await requireUser();

  const nombre = String(formData.get("nombre") ?? "").trim();
  if (!nombre) {
    return { error: "El nombre del cliente es obligatorio." };
  }

  const categoriaId = await resolverCategoriaId(formData);

  await prisma.cliente.update({
    where: { id: clienteId },
    data: datosClienteComunes(formData, categoriaId),
  });

  redirect(`/clientes/${clienteId}/ficha?actualizado=1`);
}

export async function añadirFamiliarAction(clienteId: string, formData: FormData) {
  await requireUser();

  const nombre = String(formData.get("nombre") ?? "").trim();
  if (!nombre) redirect(`/clientes/${clienteId}/ficha`);

  const tipo = String(formData.get("tipo") ?? "") === "HIJO" ? "HIJO" : "CONYUGE";
  const dni = campoTexto(formData, "dni");
  const fechaNacimientoStr = campoTexto(formData, "fechaNacimiento");

  await prisma.familiar.create({
    data: {
      clienteId,
      tipo,
      nombre,
      dni,
      fechaNacimiento: fechaNacimientoStr ? new Date(fechaNacimientoStr) : null,
    },
  });

  redirect(`/clientes/${clienteId}/ficha`);
}

export async function eliminarFamiliarAction(formData: FormData) {
  await requireUser();
  const familiarId = String(formData.get("familiarId") ?? "");
  const clienteId = String(formData.get("clienteId") ?? "");

  await prisma.familiar.delete({ where: { id: familiarId } });

  redirect(`/clientes/${clienteId}/ficha`);
}

export async function añadirEmpresaAction(clienteId: string, formData: FormData) {
  await requireUser();

  const nombre = String(formData.get("nombre") ?? "").trim();
  if (!nombre) redirect(`/clientes/${clienteId}/ficha`);

  await prisma.empresa.create({
    data: {
      clienteId,
      nombre,
      cif: campoTexto(formData, "cif"),
      direccion: campoTexto(formData, "direccion"),
      actividad: campoTexto(formData, "actividad"),
    },
  });

  redirect(`/clientes/${clienteId}/ficha`);
}

export async function eliminarEmpresaAction(formData: FormData) {
  await requireUser();
  const empresaId = String(formData.get("empresaId") ?? "");
  const clienteId = String(formData.get("clienteId") ?? "");

  await prisma.empresa.delete({ where: { id: empresaId } });

  redirect(`/clientes/${clienteId}/ficha`);
}
