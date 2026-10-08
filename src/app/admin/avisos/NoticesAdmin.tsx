"use client";

import { useMemo, useState, useTransition } from "react";
import clsx from "clsx";
import { useToast } from "@/components/Toast";
import { NOTICE_RESPONSE_TYPE_LABEL, type NoticeResponseType } from "@/lib/enums";
import { createNotice } from "./actions";

export type AudienceOptions = {
  levels: { id: string; name: string }[];
  groups: { id: string; name: string; levelId: string }[];
  children: { id: string; firstName: string; lastName: string; groupId: string }[];
};

export type NoticeListItem = {
  id: string;
  title: string;
  body: string;
  responseType: NoticeResponseType;
  audienceLabel: string;
  createdAtLabel: string;
  dueAtLabel: string | null;
  total: number;
  responded: number;
  read: number;
  pending: number;
  recipients: {
    id: string;
    familyName: string;
    childName: string;
    groupName: string;
    readAtLabel: string | null;
    response: "PENDIENTE" | "ENTERADO" | "AUTORIZO" | "NO_AUTORIZO";
  }[];
};

const RESPONSE_PILL: Record<string, string> = {
  AUTORIZO: "bg-verde-50 text-verde-text",
  NO_AUTORIZO: "bg-rojo-50 text-rojo-text",
  ENTERADO: "bg-teal-50 text-teal-text",
  PENDIENTE: "bg-amarillo-50 text-amarillo-text",
};
const RESPONSE_LABEL: Record<string, string> = {
  AUTORIZO: "Autorizó",
  NO_AUTORIZO: "No autorizó",
  ENTERADO: "Enterado",
  PENDIENTE: "Pendiente",
};

export function NoticesAdmin({ notices, options }: { notices: NoticeListItem[]; options: AudienceOptions }) {
  const [formOpen, setFormOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(notices[0]?.id);
  const [onlyPending, setOnlyPending] = useState(false);
  const selected = notices.find((n) => n.id === selectedId) ?? notices[0] ?? null;

  const rows = useMemo(() => {
    if (!selected) return [];
    return onlyPending ? selected.recipients.filter((r) => r.response === "PENDIENTE") : selected.recipients;
  }, [selected, onlyPending]);

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={() => setFormOpen((o) => !o)}
        className="self-start rounded-pill bg-magenta text-white font-extrabold text-sm px-4 py-2.5"
      >
        {formOpen ? "Cancelar" : "+ Nuevo aviso"}
      </button>

      {formOpen && <NewNoticeForm options={options} onDone={() => setFormOpen(false)} />}

      {notices.length === 0 ? (
        <p className="text-sm text-texto-3">Aún no hay avisos publicados.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[330px_1fr] gap-4">
          <div className="rounded-card bg-white border border-borde-card overflow-hidden lg:max-h-[620px] lg:overflow-y-auto">
            {notices.map((n) => {
              const pct = n.total ? Math.round((n.responded / n.total) * 100) : 0;
              return (
                <button
                  key={n.id}
                  onClick={() => {
                    setSelectedId(n.id);
                    setOnlyPending(false);
                  }}
                  className={clsx(
                    "w-full text-left px-3.5 py-3 border-b border-divisor flex flex-col gap-1.5",
                    selected?.id === n.id && "bg-magenta-25"
                  )}
                >
                  <span className="text-[10px] font-extrabold uppercase text-texto-3">
                    {NOTICE_RESPONSE_TYPE_LABEL[n.responseType]} · {n.createdAtLabel}
                  </span>
                  <span className="text-sm font-extrabold">{n.title}</span>
                  <div className="h-1.5 rounded-pill bg-track overflow-hidden">
                    <div className="h-full bg-verde" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[11px] text-texto-3">
                    {n.responded} de {n.total} respondieron · {n.audienceLabel}
                  </span>
                </button>
              );
            })}
          </div>

          {selected && (
            <div className="rounded-card bg-white border border-borde-card p-4 flex flex-col gap-4">
              <div>
                <p className="font-heading font-bold text-xl">{selected.title}</p>
                <p className="text-sm text-texto-2 mt-1">{selected.body}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Kpi label="Destinatarios" value={selected.total} />
                <Kpi label="Leyeron" value={selected.read} />
                <Kpi label="Respondieron" value={selected.responded} />
                <Kpi label="Pendientes" value={selected.pending} tone="amarillo" />
              </div>

              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="flex items-center gap-1.5 text-sm font-bold text-texto-2">
                  <input type="checkbox" checked={onlyPending} onChange={(e) => setOnlyPending(e.target.checked)} />
                  Solo pendientes
                </label>
                <RemindButton noticeId={selected.id} pending={selected.pending} />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] font-extrabold uppercase text-texto-3 bg-magenta-25">
                      <th className="px-2 py-2">Familia</th>
                      <th className="px-2 py-2">Alumno</th>
                      <th className="px-2 py-2">Grupo</th>
                      <th className="px-2 py-2">Leído</th>
                      <th className="px-2 py-2">Respuesta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-divisor">
                    {rows.map((r) => (
                      <tr key={r.id}>
                        <td className="px-2 py-2 font-bold">{r.familyName}</td>
                        <td className="px-2 py-2">{r.childName}</td>
                        <td className="px-2 py-2 text-texto-3">{r.groupName}</td>
                        <td className="px-2 py-2 text-texto-3">{r.readAtLabel ?? "—"}</td>
                        <td className="px-2 py-2">
                          <span className={clsx("rounded-pill px-2 py-0.5 text-[11px] font-extrabold", RESPONSE_PILL[r.response])}>
                            {RESPONSE_LABEL[r.response]}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Kpi({ label, value, tone }: { label: string; value: number; tone?: "amarillo" }) {
  return (
    <div className={clsx("rounded-card-sm p-2.5 text-center", tone === "amarillo" ? "bg-amarillo-50" : "bg-magenta-25")}>
      <p className={clsx("font-heading font-bold text-xl", tone === "amarillo" ? "text-amarillo-text" : "text-magenta")}>{value}</p>
      <p className="text-[10px] font-extrabold uppercase text-texto-3">{label}</p>
    </div>
  );
}

function RemindButton({ noticeId, pending }: { noticeId: string; pending: number }) {
  const { showToast } = useToast();
  void noticeId;
  if (pending === 0) return null;
  return (
    <button
      onClick={() => showToast(`Recordatorio enviado a ${pending} familias pendientes`)}
      className="rounded-pill bg-ink text-white text-xs font-extrabold px-3 py-2"
    >
      Recordar a {pending} pendientes
    </button>
  );
}

function NewNoticeForm({ options, onDone }: { options: AudienceOptions; onDone: () => void }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [scope, setScope] = useState<"PLANTEL" | "NIVEL" | "GRUPO" | "ALUMNO">("GRUPO");
  const [levelId, setLevelId] = useState(options.levels[0]?.id ?? "");
  const [groupId, setGroupId] = useState(options.groups[0]?.id ?? "");
  const [childId, setChildId] = useState(options.children[0]?.id ?? "");
  const [responseType, setResponseType] = useState<NoticeResponseType>("LECTURA");
  const [dueAt, setDueAt] = useState("");
  const [addToCalendar, setAddToCalendar] = useState(false);
  const [pending, startTransition] = useTransition();
  const { showToast } = useToast();

  const valid = title.trim().length > 0 && body.trim().length > 0;

  function publish() {
    if (!valid) return;
    startTransition(async () => {
      await createNotice({
        title,
        body,
        audienceScope: scope,
        levelId: scope === "NIVEL" ? levelId : undefined,
        groupId: scope === "GRUPO" ? groupId : undefined,
        childId: scope === "ALUMNO" ? childId : undefined,
        responseType,
        dueAt: dueAt || undefined,
        addToCalendar,
      });
      showToast("Aviso publicado");
      onDone();
    });
  }

  return (
    <div className="rounded-card bg-white border-2 border-magenta p-4 flex flex-col gap-3">
      <label className="flex flex-col gap-1">
        <span className="text-[11px] font-extrabold uppercase text-texto-3">Título</span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-[10px] border border-borde-input px-3 py-2 text-sm" />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-[11px] font-extrabold uppercase text-texto-3">Mensaje</span>
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} className="rounded-[10px] border border-borde-input px-3 py-2 text-sm" />
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-extrabold uppercase text-texto-3">Destinatarios</span>
          <select value={scope} onChange={(e) => setScope(e.target.value as typeof scope)} className="rounded-[10px] border border-borde-input px-3 py-2 text-sm">
            <option value="PLANTEL">Plantel completo</option>
            <option value="NIVEL">Nivel</option>
            <option value="GRUPO">Grupo</option>
            <option value="ALUMNO">Alumno</option>
          </select>
        </label>

        {scope === "NIVEL" && (
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-extrabold uppercase text-texto-3">Nivel</span>
            <select value={levelId} onChange={(e) => setLevelId(e.target.value)} className="rounded-[10px] border border-borde-input px-3 py-2 text-sm">
              {options.levels.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </label>
        )}
        {scope === "GRUPO" && (
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-extrabold uppercase text-texto-3">Grupo</span>
            <select value={groupId} onChange={(e) => setGroupId(e.target.value)} className="rounded-[10px] border border-borde-input px-3 py-2 text-sm">
              {options.groups.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </label>
        )}
        {scope === "ALUMNO" && (
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-extrabold uppercase text-texto-3">Alumno</span>
            <select value={childId} onChange={(e) => setChildId(e.target.value)} className="rounded-[10px] border border-borde-input px-3 py-2 text-sm">
              {options.children.map((c) => (
                <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
              ))}
            </select>
          </label>
        )}

        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-extrabold uppercase text-texto-3">Respuesta</span>
          <select value={responseType} onChange={(e) => setResponseType(e.target.value as NoticeResponseType)} className="rounded-[10px] border border-borde-input px-3 py-2 text-sm">
            <option value="LECTURA">Solo informativo</option>
            <option value="ENTERADO">Confirmar de enterado</option>
            <option value="AUTORIZACION">Autorización sí/no</option>
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-extrabold uppercase text-texto-3">Fecha límite</span>
          <input type="date" value={dueAt} onChange={(e) => setDueAt(e.target.value)} className="rounded-[10px] border border-borde-input px-3 py-2 text-sm" />
        </label>
      </div>

      <label className="flex items-center gap-1.5 text-sm font-bold text-texto-2">
        <input type="checkbox" checked={addToCalendar} disabled={!dueAt} onChange={(e) => setAddToCalendar(e.target.checked)} />
        Agregar al calendario {dueAt ? `el ${dueAt}` : ""}
      </label>

      <button
        onClick={publish}
        disabled={!valid || pending}
        className="self-start rounded-pill bg-magenta text-white font-extrabold text-sm px-5 py-2.5 disabled:opacity-45"
      >
        Publicar
      </button>
    </div>
  );
}
