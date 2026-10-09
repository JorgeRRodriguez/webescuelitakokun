"use client";

import { useMemo, useState, useTransition } from "react";
import clsx from "clsx";
import { Avatar } from "@/components/Avatar";
import { useToast } from "@/components/Toast";
import {
  DAILY_ENTRY_TYPES,
  DAILY_ENTRY_TYPE_LABEL,
  DAILY_ENTRY_TYPE_COLOR,
  MEAL_PORTIONS,
  DIAPER_STATES,
  type DailyEntryType,
} from "@/lib/enums";
import { captureEntries } from "./actions";

type ChildOption = { id: string; firstName: string; lastName: string; avatarColor: string };

export function CapturaForm({ students }: { students: ChildOption[] }) {
  const [type, setType] = useState<DailyEntryType | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [mealType, setMealType] = useState<"Desayuno" | "Colación" | "Comida">("Desayuno");
  const [menu, setMenu] = useState("");
  const [startTime, setStartTime] = useState("12:00");
  const [endTime, setEndTime] = useState("13:00");
  const [activityTitle, setActivityTitle] = useState("");
  const [activityDesc, setActivityDesc] = useState("");
  const [observation, setObservation] = useState("");
  const [exceptions, setExceptions] = useState<Record<string, string[]>>({});
  const [pending, startTransition] = useTransition();
  const { showToast } = useToast();

  function toggleChild(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  function selectAll() {
    setSelected(students.map((c) => c.id));
  }

  const hasExceptionsRow = type === "COMIDA" || type === "PANIAL";
  const exceptionOptions = type === "COMIDA" ? MEAL_PORTIONS : DIAPER_STATES;
  const isMultiSelect = type === "PANIAL";
  const defaultExceptions = useMemo(() => (type === "COMIDA" ? ["Todo"] : []), [type]);

  const selectedChildren = students.filter((c) => selected.includes(c.id));

  function exceptionsFor(childId: string) {
    return exceptions[childId] ?? defaultExceptions;
  }

  function toggleException(childId: string, opt: string) {
    setExceptions((e) => {
      const current = e[childId] ?? defaultExceptions;
      if (!isMultiSelect) return { ...e, [childId]: [opt] };
      const next = current.includes(opt) ? current.filter((v) => v !== opt) : [...current, opt];
      return { ...e, [childId]: next };
    });
  }

  const isValid = useMemo(() => {
    if (!type || selected.length === 0) return false;
    if (type === "ACTIVIDAD" && !activityTitle.trim()) return false;
    if (type === "OBSERVACION" && !observation.trim()) return false;
    if (type === "PANIAL" && selectedChildren.some((c) => exceptionsFor(c.id).length === 0)) return false;
    return true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, selected, activityTitle, observation, exceptions]);

  function buildPayload() {
    if (!type) return null;
    const base = { type, childIds: selected };
    if (type === "COMIDA") {
      return { ...base, title: mealType, detail: menu || undefined, exceptions: fillExceptions() };
    }
    if (type === "SIESTA") {
      return { ...base, title: "Siesta", startTime, endTime };
    }
    if (type === "PANIAL") {
      return { ...base, title: "Cambio de pañal", exceptions: fillExceptions() };
    }
    if (type === "ACTIVIDAD") {
      return { ...base, title: activityTitle, detail: activityDesc || undefined };
    }
    return { ...base, title: "Observación", detail: observation };
  }

  function fillExceptions() {
    const result: Record<string, string> = {};
    for (const c of selectedChildren) result[c.id] = exceptionsFor(c.id).join(", ");
    return result;
  }

  function submit() {
    const payload = buildPayload();
    if (!payload || !isValid) return;
    startTransition(async () => {
      const res = await captureEntries(payload);
      showToast(`Registrado para ${res.count} alumno${res.count === 1 ? "" : "s"}`);
      setSelected([]);
      setMenu("");
      setActivityTitle("");
      setActivityDesc("");
      setObservation("");
      setExceptions({});
    });
  }

  const now = new Date();
  const nowLabel = `${now.getHours() % 12 || 12}:${String(now.getMinutes()).padStart(2, "0")}`;

  return (
    <div className="flex flex-col gap-5">
      {/* Tiles de tipo */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {DAILY_ENTRY_TYPES.map((t) => {
          const color = DAILY_ENTRY_TYPE_COLOR[t];
          const active = type === t;
          return (
            <button
              key={t}
              onClick={() => setType(t)}
              className={clsx(
                "rounded-tile border-2 p-3 flex flex-col items-center gap-1.5 text-center transition-colors",
                active ? `${color.bg50} border-current` : "border-borde-card bg-white"
              )}
              style={active ? { color: undefined } : undefined}
            >
              <span className={clsx("w-[22px] h-[22px] rounded-[6px]", color.solid)} />
              <span className={clsx("text-xs font-extrabold", active ? color.text : "text-texto-2")}>
                {DAILY_ENTRY_TYPE_LABEL[t]}
              </span>
            </button>
          );
        })}
      </div>

      {type && (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,260px)_1fr] gap-5">
          {/* Columna alumnos */}
          <div className="rounded-card bg-white border border-borde-card p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.04em] text-texto-3">Alumnos</p>
              <button
                onClick={() => (selected.length === students.length ? setSelected([]) : selectAll())}
                className="text-[11px] font-bold text-magenta"
              >
                {selected.length === students.length ? "Quitar todos" : `Todo el grupo (${students.length})`}
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {students.map((c) => {
                const active = selected.includes(c.id);
                return (
                  <button
                    key={c.id}
                    onClick={() => toggleChild(c.id)}
                    className={clsx(
                      "flex items-center gap-1.5 rounded-pill border px-2 py-1 text-xs font-bold",
                      active ? "bg-magenta-50 border-magenta text-magenta" : "border-borde-input text-texto-2"
                    )}
                  >
                    <Avatar name={`${c.firstName} ${c.lastName}`} color={c.avatarColor} size={22} rounded="rounded-full" />
                    {c.firstName}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Columna detalle */}
          <div className="rounded-card bg-white border border-borde-card p-4 flex flex-col gap-4">
            {type === "COMIDA" && (
              <>
                <div className="flex gap-2">
                  {(["Desayuno", "Colación", "Comida"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMealType(m)}
                      className={clsx(
                        "rounded-pill px-3 py-1.5 text-xs font-extrabold border",
                        mealType === m ? "bg-naranja text-white border-naranja" : "border-borde-input text-texto-2"
                      )}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <label className="flex flex-col gap-1">
                  <span className="text-[11px] font-extrabold uppercase text-texto-3">Menú</span>
                  <input
                    value={menu}
                    onChange={(e) => setMenu(e.target.value)}
                    placeholder="Ej. Quesadilla con fruta"
                    className="rounded-[10px] border border-borde-input px-3 py-2 text-sm"
                  />
                </label>
              </>
            )}

            {type === "SIESTA" && (
              <div className="flex gap-3">
                <label className="flex flex-col gap-1">
                  <span className="text-[11px] font-extrabold uppercase text-texto-3">Inicio</span>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="rounded-[10px] border border-borde-input px-3 py-2 text-sm"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-[11px] font-extrabold uppercase text-texto-3">Fin</span>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="rounded-[10px] border border-borde-input px-3 py-2 text-sm"
                  />
                </label>
              </div>
            )}

            {type === "ACTIVIDAD" && (
              <>
                <label className="flex flex-col gap-1">
                  <span className="text-[11px] font-extrabold uppercase text-texto-3">Nombre de la actividad *</span>
                  <input
                    value={activityTitle}
                    onChange={(e) => setActivityTitle(e.target.value)}
                    placeholder="Ej. Pintura con los dedos"
                    className="rounded-[10px] border border-borde-input px-3 py-2 text-sm"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-[11px] font-extrabold uppercase text-texto-3">Descripción</span>
                  <textarea
                    value={activityDesc}
                    onChange={(e) => setActivityDesc(e.target.value)}
                    rows={3}
                    className="rounded-[10px] border border-borde-input px-3 py-2 text-sm"
                  />
                </label>
                <button
                  type="button"
                  disabled
                  className="self-start rounded-pill border border-borde-input text-texto-4 text-xs font-bold px-3 py-1.5"
                >
                  📷 Adjuntar foto (próximamente)
                </button>
              </>
            )}

            {type === "OBSERVACION" && (
              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-extrabold uppercase text-texto-3">Observación *</span>
                <textarea
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                  rows={3}
                  placeholder="¿Qué pasó?"
                  className="rounded-[10px] border border-borde-input px-3 py-2 text-sm"
                />
              </label>
            )}

            {hasExceptionsRow && selectedChildren.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-[11px] font-extrabold uppercase text-texto-3">Excepciones por niño</p>
                {selectedChildren.map((c) => (
                  <div key={c.id} className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-sm font-bold flex items-center gap-1.5">
                      <Avatar name={`${c.firstName} ${c.lastName}`} color={c.avatarColor} size={22} rounded="rounded-full" />
                      {c.firstName}
                    </span>
                    <div className="flex gap-1">
                      {exceptionOptions.map((opt) => {
                        const active = exceptionsFor(c.id).includes(opt);
                        return (
                          <button
                            key={opt}
                            onClick={() => toggleException(c.id, opt)}
                            className={clsx(
                              "rounded-pill px-2 py-1 text-[11px] font-bold border",
                              active ? "bg-magenta-50 border-magenta text-magenta" : "border-borde-input text-texto-2"
                            )}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {type && (
        <div className="sticky bottom-0 bg-fondo-app/95 backdrop-blur pt-2 pb-1 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-divisor">
          <p className="text-[12px] text-texto-3">
            Se registrará a las {nowLabel} · las familias lo ven al momento
          </p>
          <button
            onClick={submit}
            disabled={!isValid || pending}
            className="w-full sm:w-auto rounded-pill bg-magenta text-white font-extrabold text-sm px-5 py-2.5 disabled:opacity-45"
          >
            Registrar para {selected.length} alumno{selected.length === 1 ? "" : "s"}
          </button>
        </div>
      )}
    </div>
  );
}
