"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, hashPassword } from "@/lib/auth";

export async function crearUsuarioAction(_prevState: unknown, formData: FormData) {
  await requireAdmin();

  const nombre = String(formData.get("nombre") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const rol = String(formData.get("rol") ?? "TRABAJADOR") === "ADMIN" ? "ADMIN" : "TRABAJADOR";

  if (!nombre) return { error: "Indica el nombre del trabajador." };
  if (!email) return { error: "Indica un correo para iniciar sesión." };
  if (password.length < 8) return { error: "La contraseña debe tener al menos 8 caracteres." };

  const existente = await prisma.usuario.findUnique({ where: { email } });
  if (existente) return { error: "Ya existe un usuario con ese correo." };

  const passwordHash = await hashPassword(password);

  await prisma.usuario.create({
    data: { nombre, email, passwordHash, rol },
  });

  redirect("/usuarios?creado=1");
}

export async function cambiarActivoUsuarioAction(formData: FormData) {
  const admin = await requireAdmin();

  const usuarioId = String(formData.get("usuarioId") ?? "");
  const activo = String(formData.get("activo") ?? "") === "true";

  if (usuarioId === admin.id) {
    // Nunca te puedes desactivar a ti mismo: evita quedarte fuera de la app.
    return;
  }

  await prisma.usuario.update({ where: { id: usuarioId }, data: { activo } });
  revalidatePath("/usuarios");
}
