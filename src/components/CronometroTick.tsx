"use client";

import { useEffect, useState } from "react";

function formatearTranscurrido(segundos: number): string {
  const h = Math.floor(segundos / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  const s = segundos % 60;
  const dosDigitos = (n: number) => n.toString().padStart(2, "0");
  return h > 0
    ? `${dosDigitos(h)}:${dosDigitos(m)}:${dosDigitos(s)}`
    : `${dosDigitos(m)}:${dosDigitos(s)}`;
}

export function CronometroTick({ horaInicioIso }: { horaInicioIso: string }) {
  const [segundos, setSegundos] = useState(() =>
    Math.max(0, Math.floor((Date.now() - new Date(horaInicioIso).getTime()) / 1000))
  );

  useEffect(() => {
    const id = setInterval(() => {
      setSegundos(
        Math.max(0, Math.floor((Date.now() - new Date(horaInicioIso).getTime()) / 1000))
      );
    }, 1000);
    return () => clearInterval(id);
  }, [horaInicioIso]);

  return <span>{formatearTranscurrido(segundos)}</span>;
}
