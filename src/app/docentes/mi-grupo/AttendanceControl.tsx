"use client";

import { useState, useTransition } from "react";
import { useToast } from "@/components/Toast";
import { registerAttendance } from "./actions";

export function AttendanceControl({
  childId,
  checkInTime,
  checkInBy,
  status,
}: {
  childId: string;
  checkInTime: string | null;
  checkInBy: string | null;
  status: "PRESENTE" | "AUSENTE" | null;
}) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const { showToast } = useToast();

  function mark(next: "PRESENTE" | "AUSENTE") {
    startTransition(async () => {
      await registerAttendance(childId, next, next === "PRESENTE" ? "Recepción" : undefined);
      showToast(next === "PRESENTE" ? "Entrada registrada" : "Se marcó como ausente");
      setEditing(false);
    });
  }

  if (status && !editing) {
    return (
      <div className="flex items-center justify-between gap-1 text-[11px]">
        <span className={status === "PRESENTE" ? "text-verde-text font-bold" : "text-rojo-text font-bold"}>
          {status === "PRESENTE" ? `Llegó ${checkInTime} · ${checkInBy}` : "Ausente"}
        </span>
        <button onClick={() => setEditing(true)} className="text-texto-3 underline shrink-0">
          Cambiar
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-1.5">
      <button
        disabled={pending}
        onClick={() => mark("PRESENTE")}
        className="flex-1 rounded-pill bg-verde text-white text-[11px] font-extrabold py-1.5 disabled:opacity-45"
      >
        Entrada
      </button>
      <button
        disabled={pending}
        onClick={() => mark("AUSENTE")}
        className="flex-1 rounded-pill border border-borde-input text-texto-2 text-[11px] font-extrabold py-1.5 disabled:opacity-45"
      >
        Ausente
      </button>
    </div>
  );
}
