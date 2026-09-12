/**
 * Datos de prueba FICTICIOS para poder navegar la aplicación durante el
 * desarrollo. Ningún dato real de clientes debe entrar aquí.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // ---------- Trabajadores ----------
  const passwordHash = await bcrypt.hash("cambiar123", 10);

  const admin = await prisma.usuario.upsert({
    where: { email: "admin@despacho.test" },
    update: {},
    create: {
      nombre: "Admin del Despacho",
      email: "admin@despacho.test",
      passwordHash,
      rol: "ADMIN",
      tarifaHoraDefecto: 40,
    },
  });

  const maria = await prisma.usuario.upsert({
    where: { email: "maria@despacho.test" },
    update: {},
    create: {
      nombre: "María López",
      email: "maria@despacho.test",
      passwordHash,
      rol: "TRABAJADOR",
      tarifaHoraDefecto: 35,
    },
  });

  const javier = await prisma.usuario.upsert({
    where: { email: "javier@despacho.test" },
    update: {},
    create: {
      nombre: "Javier Ortega",
      email: "javier@despacho.test",
      passwordHash,
      rol: "TRABAJADOR",
      tarifaHoraDefecto: 35,
    },
  });

  // ---------- Categorías ----------
  const [catParticular, catAutonomo, catPyme] = await Promise.all([
    prisma.categoriaCliente.upsert({
      where: { nombre: "Particular" },
      update: {},
      create: { nombre: "Particular" },
    }),
    prisma.categoriaCliente.upsert({
      where: { nombre: "Autónomo" },
      update: {},
      create: { nombre: "Autónomo" },
    }),
    prisma.categoriaCliente.upsert({
      where: { nombre: "Pyme" },
      update: {},
      create: { nombre: "Pyme" },
    }),
  ]);

  const [catRenta, catAsesoriaContinua, catConstitucion] = await Promise.all([
    prisma.categoriaTrabajo.upsert({
      where: { nombre: "Declaración de la renta" },
      update: {},
      create: { nombre: "Declaración de la renta" },
    }),
    prisma.categoriaTrabajo.upsert({
      where: { nombre: "Asesoría continua" },
      update: {},
      create: { nombre: "Asesoría continua" },
    }),
    prisma.categoriaTrabajo.upsert({
      where: { nombre: "Constitución de sociedad" },
      update: {},
      create: { nombre: "Constitución de sociedad" },
    }),
  ]);

  // ---------- Clientes ----------
  // Los clientes y trabajos de prueba se crean solo la primera vez: si ya
  // existen, no los duplicamos (a diferencia de los usuarios/categorías, no
  // tienen un campo único natural sobre el que hacer upsert).
  const yaHayClientesDePrueba = (await prisma.cliente.count()) > 0;
  if (yaHayClientesDePrueba) {
    console.log("Ya existen clientes de prueba: no se crean duplicados.");
    return;
  }

  const ana = await prisma.cliente.create({
    data: {
      nombre: "Ana Gómez Ruiz",
      dni: "11111111A",
      direccion: "Calle Ficticia 1, Madrid",
      telefono: "600111111",
      email: "ana.gomez@ejemplo.test",
      estadoCivil: "CASADO",
      regimenMatrimonial: "Gananciales",
      categoriaId: catParticular.id,
      familiares: {
        create: [
          { tipo: "CONYUGE", nombre: "Pedro Sánchez Vila", dni: "22222222B" },
          { tipo: "HIJO", nombre: "Lucía Sánchez Gómez", fechaNacimiento: new Date("2015-03-10") },
        ],
      },
    },
  });

  const carlos = await prisma.cliente.create({
    data: {
      nombre: "Carlos Fernández Soto",
      dni: "33333333C",
      direccion: "Avenida Imaginaria 22, Sevilla",
      telefono: "600222222",
      email: "carlos.fs@ejemplo.test",
      estadoCivil: "SOLTERO",
      categoriaId: catAutonomo.id,
      empresas: {
        create: [{ nombre: "Carlos Fernández Fontanería", cif: "B12345678", actividad: "Fontanería" }],
      },
    },
  });

  const rocio = await prisma.cliente.create({
    data: {
      nombre: "Rocío Jiménez Alba",
      dni: "44444444D",
      direccion: "Plaza Inventada 5, Valencia",
      telefono: "600333333",
      email: "rocio.jimenez@ejemplo.test",
      estadoCivil: "PAREJA_DE_HECHO",
      categoriaId: catPyme.id,
      empresas: {
        create: [{ nombre: "Jiménez Consulting S.L.", cif: "B87654321", actividad: "Consultoría" }],
      },
    },
  });

  // Cliente con tarifa especial pactada (más baja que la tarifa por defecto)
  const manuel = await prisma.cliente.create({
    data: {
      nombre: "Manuel Torres Vidal",
      dni: "55555555E",
      direccion: "Calle de Prueba 8, Bilbao",
      telefono: "600444444",
      estadoCivil: "VIUDO",
      categoriaId: catParticular.id,
      tarifaHoraEspecial: 25,
    },
  });

  // ---------- Trabajos ----------
  await prisma.trabajo.create({
    data: {
      clienteId: ana.id,
      categoriaId: catRenta.id,
      titulo: "Declaración de la renta 2025",
      estado: "EN_CURSO",
      creadoPorId: admin.id,
      asignaciones: { create: [{ usuarioId: maria.id }] },
    },
  });

  await prisma.trabajo.create({
    data: {
      clienteId: carlos.id,
      categoriaId: catAsesoriaContinua.id,
      titulo: "Asesoría fiscal mensual",
      estado: "EN_CURSO",
      creadoPorId: admin.id,
      asignaciones: { create: [{ usuarioId: javier.id }, { usuarioId: maria.id }] },
    },
  });

  await prisma.trabajo.create({
    data: {
      clienteId: rocio.id,
      categoriaId: catConstitucion.id,
      titulo: "Constitución de Jiménez Consulting S.L.",
      estado: "TERMINADO",
      fechaFin: new Date("2026-06-01"),
      creadoPorId: admin.id,
      asignaciones: { create: [{ usuarioId: javier.id }] },
    },
  });

  await prisma.trabajo.create({
    data: {
      clienteId: manuel.id,
      categoriaId: catRenta.id,
      titulo: "Declaración de la renta 2025",
      estado: "POR_COMENZAR",
      creadoPorId: admin.id,
      asignaciones: { create: [{ usuarioId: maria.id }] },
    },
  });

  console.log("Datos de prueba creados correctamente.");
  console.log("Usuarios de prueba (contraseña para todos: cambiar123):");
  console.log("  - admin@despacho.test (administrador)");
  console.log("  - maria@despacho.test (trabajadora)");
  console.log("  - javier@despacho.test (trabajador)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
