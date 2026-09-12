import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { generarCsv, respuestaCsv } from "@/lib/csv";

export async function GET() {
  await requireUser();

  const clientes = await prisma.cliente.findMany({
    orderBy: { nombre: "asc" },
    include: { categoria: true },
  });

  const csv = generarCsv(
    ["Nombre", "DNI", "Categoría", "Dirección", "Teléfono", "Correo", "Estado civil", "Activo"],
    clientes.map((c) => [
      c.nombre,
      c.dni,
      c.categoria?.nombre,
      c.direccion,
      c.telefono,
      c.email,
      c.estadoCivil,
      c.activo ? "Sí" : "No",
    ])
  );

  return respuestaCsv("clientes.csv", csv);
}
