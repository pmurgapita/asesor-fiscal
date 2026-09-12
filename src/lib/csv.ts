type Celda = string | number | boolean | null | undefined;

function escaparCelda(valor: Celda): string {
  const texto = valor == null ? "" : String(valor);
  if (/[",;\n\r]/.test(texto)) {
    return `"${texto.replace(/"/g, '""')}"`;
  }
  return texto;
}

/**
 * Genera un CSV listo para abrir en Excel (con BOM UTF-8, para que las
 * tildes y la Ñ se vean bien).
 */
export function generarCsv(cabecera: string[], filas: Celda[][]): string {
  const BOM = "﻿";
  const lineas = [cabecera, ...filas].map((fila) => fila.map(escaparCelda).join(";"));
  return BOM + lineas.join("\r\n");
}

export function respuestaCsv(nombreArchivo: string, csv: string): Response {
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${nombreArchivo}"`,
    },
  });
}
