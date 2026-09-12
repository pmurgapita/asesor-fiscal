export function EnlaceExportarCsv({ href, texto = "Exportar a CSV" }: { href: string; texto?: string }) {
  return (
    <a href={href} className="text-base font-medium text-blue-700">
      ⬇ {texto}
    </a>
  );
}
