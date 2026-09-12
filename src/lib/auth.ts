import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { getSession } from "./session";
import { prisma } from "./prisma";

const SALT_ROUNDS = 10;

export function hashPassword(password: string) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

/** Devuelve el usuario logueado, o lo redirige a /login si no hay sesión. */
export async function requireUser() {
  const session = await getSession();
  if (!session.userId) {
    redirect("/login");
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id: session.userId },
  });

  if (!usuario || !usuario.activo) {
    session.destroy();
    redirect("/login");
  }

  return usuario;
}

/** Igual que requireUser(), pero además exige que el usuario sea administrador. */
export async function requireAdmin() {
  const usuario = await requireUser();
  if (usuario.rol !== "ADMIN") {
    redirect("/no-autorizado");
  }
  return usuario;
}
