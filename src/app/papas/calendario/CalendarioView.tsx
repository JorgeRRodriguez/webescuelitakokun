"use client";

import { useMemo, useState, useTransition } from "react";
import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Segmented } from "@/components/Segmented";
import { useToast } from "@/components/Toast";
import { EVENT_TYPE_COLOR, type EventType } from "@/lib/enums";
import { setEventReminder, setEventRsvp } from "../actions";

export type EventItem = {
  id: string;
  title: string;
  description: string | null;
  type: EventType;
  dateIso: string;
  scope: "grupo" | "escuela";
  rsvpRequired: boolean;
  reminder: boolean;
  rsvp: "ASISTIRE" | "NO_PODRE" | null;
};

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const DIAS = ["L", "M", "M", "J", "V", "S", "D"];

function ymd(iso: string) {
  const d = new Date(iso);
  return `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`;
}

function sameDay(a: Date, iso: string) {
  const b = new Date(iso);
  return a.getUTCFullYear() === b.getUTCFullYear() && a.getUTCMonth() === b.getUTCMonth() && a.getUTCDate() === b.getUTCDate();
}

export function CalendarioView({ events, childId }: { events: EventItem[]; childId: string }) {
  const now = useMemo(() => new Date(), []);
  const todayUTC = useMemo(() => new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())), [now]);

  const [filter, setFilter] = useState<"todo" | "grupo" | "escuela">("todo");
  const [viewYear, setViewYear] = useState(todayUTC.getUTCFullYear());
  const [viewMonth, setViewMonth] = useState(todayUTC.getUTCMonth());
  const [selectedIso, setSelectedIso] = useState<string | null>(todayUTC.toISOString());

  const filtered = events.filter((e) => filter === "todo" || e.scope === filter);
  const eventDates = new Set(filtered.map((e) => ymd(e.dateIso)));

  const firstOfMonth = new Date(Date.UTC(viewYear, viewMonth, 1));
  const startWeekday = (firstOfMonth.getUTCDay() + 6) % 7; // lunes=0
  const daysInMonth = new Date(Date.UTC(viewYear, viewMonth + 1, 0)).getUTCDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(Date.UTC(viewYear, viewMonth, d)));

  function changeMonth(delta: number) {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) {
      m = 11;
      y -= 1;
    } else if (m > 11) {
      m = 0;
      y += 1;
    }
    setViewMonth(m);
    setViewYear(y);
    setSelectedIso(null);
  }

  const selectedEvents = selectedIso ? filtered.filter((e) => sameDay(new Date(selectedIso), e.dateIso)) : [];
  const upcoming = filtered.filter((e) => new Date(e.dateIso).getTime() >= todayUTC.getTime()).slice(0, 6);

  return (
    <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[360px_1fr] lg:items-start lg:gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-bold text-lg">
            {MESES[viewMonth]} {viewYear}
          </h2>
          <div className="flex gap-1">
            <button onClick={() => changeMonth(-1)} className="p-1.5 rounded-full border border-borde-input text-texto-2">
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => changeMonth(1)} className="p-1.5 rounded-full border border-borde-input text-texto-2">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <Segmented
          options={[
            { value: "todo", label: "Todo" },
            { value: "grupo", label: "Mi grupo" },
            { value: "escuela", label: "Escuela" },
          ]}
          value={filter}
          onChange={setFilter}
        />

        <div>
          <div className="grid grid-cols-7 mb-1">
            {DIAS.map((d, i) => (
              <div key={i} className="text-center text-[11px] font-extrabold text-texto-4">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((d, i) => {
              if (!d) return <div key={i} />;
              const isToday = d.getTime() === todayUTC.getTime();
              const isSelected = selectedIso ? sameDay(d, selectedIso) : false;
              const hasEvent = eventDates.has(`${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`);
              return (
                <button
                  key={i}
                  onClick={() => setSelectedIso(d.toISOString())}
                  className={clsx(
                    "h-10 rounded-[10px] flex flex-col items-center justify-center text-sm font-bold relative",
                    isSelected ? "bg-magenta text-white" : isToday ? "bg-magenta-50 text-magenta" : "text-texto-2"
                  )}
                >
                  {d.getUTCDate()}
                  {hasEvent && !isSelected && <span className="absolute bottom-1 w-[5px] h-[5px] rounded-full bg-magenta" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <h3 className="font-heading font-bold text-base">
          {selectedIso && selectedEvents.length > 0 ? "Este día" : "Próximos"}
        </h3>
        {(selectedIso && selectedEvents.length > 0 ? selectedEvents : upcoming).length === 0 && (
          <p className="text-sm text-texto-3">No hay eventos.</p>
        )}
        <div className="flex flex-col gap-2.5 lg:grid lg:grid-cols-2 lg:gap-3">
          {(selectedIso && selectedEvents.length > 0 ? selectedEvents : upcoming).map((e) => (
            <EventCard key={e.id} event={e} childId={childId} />
          ))}
        </div>
      </div>
    </div>
  );
}

function EventCard({ event, childId }: { event: EventItem; childId: string }) {
  const [reminder, setReminder] = useState(event.reminder);
  const [rsvp, setRsvp] = useState(event.rsvp);
  const [, startTransition] = useTransition();
  const { showToast } = useToast();
  const color = EVENT_TYPE_COLOR[event.type];
  const d = new Date(event.dateIso);

  function remind() {
    setReminder(true);
    startTransition(() => setEventReminder(event.id, childId, true));
  }

  function rsvpTo(value: "ASISTIRE" | "NO_PODRE") {
    setRsvp(value);
    startTransition(() => setEventRsvp(event.id, childId, value));
    showToast(value === "ASISTIRE" ? "Confirmaste tu asistencia" : "Marcaste que no podrás asistir");
  }

  return (
    <div className="rounded-card bg-white border border-borde-card p-3 flex gap-3">
      <div className={clsx("w-[46px] h-[46px] rounded-[10px] flex flex-col items-center justify-center text-white shrink-0", color.solid)}>
        <span className="text-[10px] font-extrabold uppercase leading-none">
          {d.toLocaleString("es-MX", { month: "short", timeZone: "UTC" })}
        </span>
        <span className="text-base font-heading font-bold leading-none">{d.getUTCDate()}</span>
      </div>
      <div className="flex-1 min-w-0">
        <span className={clsx("text-[10px] font-extrabold uppercase", color.text)}>{event.type}</span>
        <p className="text-sm font-extrabold">{event.title}</p>
        {event.description && <p className="text-xs text-texto-2 mt-0.5">{event.description}</p>}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {!reminder ? (
            <button onClick={remind} className="rounded-pill border border-borde-input text-xs font-extrabold px-2.5 py-1 text-texto-2">
              Recordarme
            </button>
          ) : (
            <span className="rounded-pill bg-verde-50 text-verde-text text-xs font-extrabold px-2.5 py-1">
              ✓ Te recordaremos un día antes
            </span>
          )}
          {event.rsvpRequired && (
            <>
              <button
                onClick={() => rsvpTo("ASISTIRE")}
                className={clsx(
                  "rounded-pill text-xs font-extrabold px-2.5 py-1",
                  rsvp === "ASISTIRE" ? "bg-verde text-white" : "border border-borde-input text-texto-2"
                )}
              >
                Asistiré
              </button>
              <button
                onClick={() => rsvpTo("NO_PODRE")}
                className={clsx(
                  "rounded-pill text-xs font-extrabold px-2.5 py-1",
                  rsvp === "NO_PODRE" ? "bg-rojo text-white" : "border border-borde-input text-texto-2"
                )}
              >
                No podré
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
