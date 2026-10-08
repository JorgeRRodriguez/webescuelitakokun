"use client";

import { useState, useTransition } from "react";
import { X } from "lucide-react";
import { markSummaryViewed } from "../actions";

export type SummaryData = {
  childId: string;
  childName: string;
  dateLabel: string;
  dateIso: string; // fecha pura en ISO, para reenviar al server action
  mood: string | null;
  mealsCount: number;
  siestaLabel: string;
  diaperCount: number;
  activities: { title: string; detail: string | null }[];
  note: string | null;
  materialsForTomorrow: string | null;
  alreadyViewed: boolean;
};

export function SummaryTrigger({ data }: { data: SummaryData }) {
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();

  function handleOpen() {
    setOpen(true);
    if (!data.alreadyViewed) {
      startTransition(() => markSummaryViewed(data.childId, new Date(data.dateIso)));
    }
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="w-full rounded-card bg-magenta text-white px-4 py-3.5 text-left flex items-center justify-between"
      >
        <span className="font-heading font-bold text-[15px]">El resumen de hoy está listo</span>
        <span aria-hidden>→</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
          <div className="absolute inset-0 bg-[rgba(35,26,38,.45)]" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-[480px] bg-white rounded-t-[28px] p-5 pb-8 flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.04em] text-texto-3">
                  Resumen del día · {data.dateLabel}
                </p>
                <h2 className="font-heading font-bold text-xl">El día de {data.childName}</h2>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Cerrar" className="text-texto-3 p-1">
                <X size={22} />
              </button>
            </div>

            {data.mood && (
              <span className="self-start rounded-pill bg-magenta-50 text-magenta text-xs font-extrabold px-3 py-1.5">
                Estuvo: {data.mood}
              </span>
            )}

            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-card-sm bg-naranja-50 p-2.5 text-center">
                <p className="font-heading font-bold text-lg text-naranja-text">{data.mealsCount}</p>
                <p className="text-[10px] font-extrabold text-naranja-text uppercase">Comidas</p>
              </div>
              <div className="rounded-card-sm bg-teal-50 p-2.5 text-center">
                <p className="font-heading font-bold text-sm text-teal-text">{data.siestaLabel}</p>
                <p className="text-[10px] font-extrabold text-teal-text uppercase">Siesta</p>
              </div>
              <div className="rounded-card-sm bg-morado-50 p-2.5 text-center">
                <p className="font-heading font-bold text-lg text-morado-text">{data.diaperCount}</p>
                <p className="text-[10px] font-extrabold text-morado-text uppercase">Pañal</p>
              </div>
            </div>

            {data.activities.length > 0 && (
              <div className="rounded-card-sm bg-magenta-25 p-3 flex flex-col gap-1">
                <p className="text-[11px] font-extrabold uppercase text-magenta">Actividades</p>
                {data.activities.map((a, i) => (
                  <p key={i} className="text-sm">
                    <span className="font-bold">{a.title}</span>
                    {a.detail ? ` — ${a.detail}` : ""}
                  </p>
                ))}
              </div>
            )}

            {data.note && (
              <div>
                <p className="text-[11px] font-extrabold uppercase text-texto-3 mb-1">Nota de la maestra</p>
                <p className="text-sm text-texto-2">{data.note}</p>
              </div>
            )}

            {data.materialsForTomorrow && (
              <div className="rounded-card-sm bg-amarillo-50 px-3 py-2.5 text-sm text-amarillo-text font-bold">
                Para mañana: {data.materialsForTomorrow}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
