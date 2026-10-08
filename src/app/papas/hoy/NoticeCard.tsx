"use client";

import { useState, useTransition } from "react";
import clsx from "clsx";
import { useToast } from "@/components/Toast";
import { NOTICE_RESPONSE_TYPE_LABEL, type NoticeResponseType, type NoticeResponse } from "@/lib/enums";
import { markNoticeRead, respondNotice } from "../actions";

export type NoticeCardData = {
  noticeId: string;
  childId: string;
  title: string;
  body: string;
  responseType: NoticeResponseType;
  dueAt: string | null; // ya formateado
  author: string;
  createdAt: string; // ya formateado
  readAt: Date | null;
  response: NoticeResponse;
  respondedAt: string | null; // ya formateado
};

const LABEL_COLOR: Record<NoticeResponseType, string> = {
  AUTORIZACION: "text-magenta",
  ENTERADO: "text-teal-text",
  LECTURA: "text-texto-3",
};

export function NoticeCard({ data }: { data: NoticeCardData }) {
  const [expanded, setExpanded] = useState(false);
  const [localReadAt, setLocalReadAt] = useState(data.readAt);
  const [pending, startTransition] = useTransition();
  const { showToast } = useToast();

  const answered = data.response !== "PENDIENTE";

  function expand() {
    const next = !expanded;
    setExpanded(next);
    if (next && !localReadAt) {
      setLocalReadAt(new Date());
      startTransition(() => markNoticeRead(data.noticeId, data.childId));
    }
  }

  function respond(response: NoticeResponse) {
    startTransition(async () => {
      await respondNotice(data.noticeId, data.childId, response);
      showToast(response === "AUTORIZO" ? "Autorización enviada" : response === "NO_AUTORIZO" ? "Respuesta enviada" : "Marcado como enterado");
    });
  }

  return (
    <div
      className={clsx(
        "rounded-card bg-white border p-3.5 flex flex-col gap-2",
        !answered ? "border-[#F2C6DD]" : "border-borde-card"
      )}
    >
      <button onClick={expand} className="flex flex-col gap-1 text-left">
        <span className={clsx("text-[11px] font-extrabold uppercase tracking-[0.04em]", answered ? "text-texto-3" : LABEL_COLOR[data.responseType])}>
          {answered ? "Aviso" : NOTICE_RESPONSE_TYPE_LABEL[data.responseType]}
        </span>
        <span className="text-sm font-extrabold text-ink">{data.title}</span>
        <span className="text-[11px] text-texto-3">
          {data.author} · {data.createdAt}
          {data.dueAt ? ` · responde antes del ${data.dueAt}` : ""}
        </span>
      </button>

      {expanded && (
        <div className="flex flex-col gap-2.5 pt-1">
          <p className="text-sm text-texto-2">{data.body}</p>

          {!answered && data.responseType === "ENTERADO" && (
            <button
              disabled={pending}
              onClick={() => respond("ENTERADO")}
              className="w-full rounded-pill bg-teal text-white font-extrabold text-sm py-2.5 disabled:opacity-45"
            >
              Enterado
            </button>
          )}
          {!answered && data.responseType === "AUTORIZACION" && (
            <div className="flex gap-2">
              <button
                disabled={pending}
                onClick={() => respond("NO_AUTORIZO")}
                className="flex-1 rounded-pill border border-borde-input text-texto-2 font-extrabold text-sm py-2.5 disabled:opacity-45"
              >
                No autorizo
              </button>
              <button
                disabled={pending}
                onClick={() => respond("AUTORIZO")}
                className="flex-1 rounded-pill bg-verde text-white font-extrabold text-sm py-2.5 disabled:opacity-45"
              >
                Autorizo
              </button>
            </div>
          )}
          {answered && (
            <div
              className={clsx(
                "rounded-card-sm px-3 py-2 text-xs font-extrabold",
                data.response === "NO_AUTORIZO" ? "bg-rojo-50 text-rojo-text" : "bg-verde-50 text-verde-text"
              )}
            >
              {data.response === "AUTORIZO" && `✓ Autorizaste · ${data.respondedAt}`}
              {data.response === "NO_AUTORIZO" && `No autorizaste · ${data.respondedAt}`}
              {data.response === "ENTERADO" && `✓ Enterado · ${data.respondedAt}`}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
