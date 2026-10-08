"use client";

import { useState, useTransition } from "react";
import clsx from "clsx";
import { Avatar } from "@/components/Avatar";
import { useToast } from "@/components/Toast";
import { MOODS, type SummaryStatus } from "@/lib/enums";
import { sendSummary, sendAllPending } from "./actions";

export type ChildSummaryData = {
  id: string;
  firstName: string;
  lastName: string;
  avatarColor: string;
  status: SummaryStatus;
  mood: string | null;
  note: string;
  materialsForTomorrow: string;
  sentAt: string | null;
  readAt: string | null;
  mealsCount: number;
  lastMeal: string | null;
  siestaMinutes: number | null;
  siestaRange: string | null;
  diaperCount: number;
  activities: { title: string; detail: string | null }[];
};

const STATUS_STYLE: Record<SummaryStatus, { label: string; dot: string; text: string }> = {
  SIN_REGISTROS: { label: "Sin registros", dot: "bg-texto-4", text: "text-texto-4" },
  POR_REVISAR: { label: "Por revisar", dot: "bg-amarillo", text: "text-amarillo-text" },
  ENVIADO: { label: "Enviado", dot: "bg-teal", text: "text-teal-text" },
  VISTO: { label: "Visto", dot: "bg-verde", text: "text-verde-text" },
};

export function ResumenView({ data }: { data: ChildSummaryData[] }) {
  const [selectedId, setSelectedId] = useState(data.find((d) => d.status === "POR_REVISAR")?.id ?? data[0]?.id);
  const selected = data.find((d) => d.id === selectedId) ?? null;
  const [pending, startTransition] = useTransition();
  const { showToast } = useToast();

  const [mood, setMood] = useState(selected?.mood ?? null);
  const [note, setNote] = useState(selected?.note ?? "");
  const [materials, setMaterials] = useState(selected?.materialsForTomorrow ?? "");

  function select(id: string) {
    const child = data.find((d) => d.id === id);
    setSelectedId(id);
    setMood(child?.mood ?? null);
    setNote(child?.note ?? "");
    setMaterials(child?.materialsForTomorrow ?? "");
  }

  function send() {
    if (!selected) return;
    startTransition(async () => {
      await sendSummary({ childId: selected.id, mood, note, materialsForTomorrow: materials });
      showToast(`Resumen enviado a la familia de ${selected.firstName}`);
    });
  }

  const pendingIds = data.filter((d) => d.status === "POR_REVISAR").map((d) => d.id);

  function sendAll() {
    if (pendingIds.length === 0) return;
    startTransition(async () => {
      await sendAllPending(pendingIds);
      showToast(`Se enviaron ${pendingIds.length} resúmenes`);
    });
  }

  if (data.length === 0) {
    return <p className="text-sm text-texto-3">No hay alumnos presentes hoy.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {pendingIds.length > 0 && (
        <button
          onClick={sendAll}
          disabled={pending}
          className="self-start rounded-pill bg-ink text-white text-xs font-extrabold px-3 py-2 disabled:opacity-45"
        >
          Enviar los {pendingIds.length} pendientes
        </button>
      )}
      <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-4">
        <div className="rounded-card bg-white border border-borde-card overflow-hidden md:max-h-[560px] md:overflow-y-auto">
          {data.map((c) => {
            const s = STATUS_STYLE[c.status];
            const active = c.id === selectedId;
            return (
              <button
                key={c.id}
                onClick={() => select(c.id)}
                className={clsx(
                  "w-full flex items-center gap-2 px-3 py-2.5 border-b border-divisor text-left",
                  active && "bg-magenta-25"
                )}
              >
                <Avatar name={`${c.firstName} ${c.lastName}`} color={c.avatarColor} size={32} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-extrabold truncate">{c.firstName} {c.lastName}</p>
                  <p className={clsx("text-[11px] font-bold flex items-center gap-1", s.text)}>
                    <span className={clsx("w-1.5 h-1.5 rounded-full", s.dot)} />
                    {s.label}
                    {c.status === "VISTO" && c.readAt ? ` ${c.readAt}` : ""}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {selected && (
          <div className="rounded-card bg-white border border-borde-card p-4 flex flex-col gap-4">
            <div>
              <p className="font-heading font-bold text-xl">{selected.firstName} {selected.lastName}</p>
              <p className={clsx("text-xs font-bold", STATUS_STYLE[selected.status].text)}>
                {STATUS_STYLE[selected.status].label}
                {selected.sentAt ? ` · enviado a las ${selected.sentAt}` : ""}
                {selected.readAt ? ` · la familia lo vio a las ${selected.readAt}` : ""}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-card-sm bg-naranja-50 p-2.5 text-center">
                <p className="font-heading font-bold text-lg text-naranja-text">{selected.mealsCount}</p>
                <p className="text-[10px] font-extrabold text-naranja-text uppercase">Comidas</p>
              </div>
              <div className="rounded-card-sm bg-teal-50 p-2.5 text-center">
                <p className="font-heading font-bold text-lg text-teal-text">
                  {selected.siestaMinutes ? `${selected.siestaMinutes}m` : "—"}
                </p>
                <p className="text-[10px] font-extrabold text-teal-text uppercase">Siesta</p>
              </div>
              <div className="rounded-card-sm bg-morado-50 p-2.5 text-center">
                <p className="font-heading font-bold text-lg text-morado-text">{selected.diaperCount}</p>
                <p className="text-[10px] font-extrabold text-morado-text uppercase">Pañal</p>
              </div>
            </div>

            {selected.activities.length > 0 && (
              <div className="rounded-card-sm bg-magenta-25 p-3 flex flex-col gap-1">
                <p className="text-[11px] font-extrabold uppercase text-magenta">Actividades</p>
                {selected.activities.map((a, i) => (
                  <p key={i} className="text-sm">
                    <span className="font-bold">{a.title}</span>
                    {a.detail ? ` — ${a.detail}` : ""}
                  </p>
                ))}
              </div>
            )}

            <div>
              <p className="text-[11px] font-extrabold uppercase text-texto-3 mb-1.5">Estuvo</p>
              <div className="flex flex-wrap gap-1.5">
                {MOODS.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMood(m)}
                    className={clsx(
                      "rounded-pill px-3 py-1.5 text-xs font-bold border",
                      mood === m ? "bg-magenta-50 border-magenta text-magenta" : "border-borde-input text-texto-2"
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-extrabold uppercase text-texto-3">Nota para la familia</span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="rounded-[10px] border border-borde-input px-3 py-2 text-sm"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-extrabold uppercase text-texto-3">Materiales para mañana</span>
              <input
                value={materials}
                onChange={(e) => setMaterials(e.target.value)}
                className="rounded-[10px] border border-borde-input px-3 py-2 text-sm"
              />
            </label>

            <button
              onClick={send}
              disabled={pending}
              className="self-start rounded-pill bg-magenta text-white font-extrabold text-sm px-5 py-2.5 disabled:opacity-45"
            >
              {selected.status === "ENVIADO" || selected.status === "VISTO" ? "Reenviar con cambios" : "Enviar resumen a la familia"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
