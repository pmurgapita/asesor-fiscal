"use client";

export function BotonEliminar({
  action,
  hiddenFields,
  confirmacion,
  etiqueta = "Eliminar",
}: {
  action: (formData: FormData) => void | Promise<void>;
  hiddenFields: Record<string, string>;
  confirmacion: string;
  etiqueta?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(confirmacion)) {
          e.preventDefault();
        }
      }}
    >
      {Object.entries(hiddenFields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <button type="submit" className="text-sm font-medium text-red-700">
        {etiqueta}
      </button>
    </form>
  );
}
