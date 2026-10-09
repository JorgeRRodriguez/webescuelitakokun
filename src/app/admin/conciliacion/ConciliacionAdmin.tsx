"use client";

import { useTransition } from "react";
import clsx from "clsx";
import { useToast } from "@/components/Toast";
import { PAYMENT_METHOD_LABEL, type PaymentMethod } from "@/lib/enums";
import { confirmPayment, rejectPayment } from "./actions";

export type PaymentRow = {
  id: string;
  dateLabel: string;
  familyName: string;
  appliesTo: string;
  method: PaymentMethod;
  reference: string | null;
  amount: number;
  status: "VALIDACION" | "CONFIRMADO" | "RECHAZADO";
  folio: string | null;
};

function money(n: number) {
  return n.toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });
}

const STATUS_LABEL: Record<PaymentRow["status"], string> = {
  VALIDACION: "En validación",
  CONFIRMADO: "Confirmado",
  RECHAZADO: "Rechazado",
};
const STATUS_PILL: Record<PaymentRow["status"], string> = {
  VALIDACION: "",
  CONFIRMADO: "bg-verde-50 text-verde-text",
  RECHAZADO: "bg-rojo-50 text-rojo-text",
};

export function ConciliacionAdmin({ rows }: { rows: PaymentRow[] }) {
  const sorted = [...rows].sort((a, b) => {
    if (a.status === "VALIDACION" && b.status !== "VALIDACION") return -1;
    if (b.status === "VALIDACION" && a.status !== "VALIDACION") return 1;
    return 0;
  });

  return (
    <div className="rounded-card bg-white border border-borde-card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[11px] font-extrabold uppercase text-texto-3 bg-magenta-25">
            <th className="px-3 py-2.5">Fecha</th>
            <th className="px-3 py-2.5">Familia</th>
            <th className="px-3 py-2.5">Aplica a</th>
            <th className="px-3 py-2.5">Método</th>
            <th className="px-3 py-2.5">Referencia</th>
            <th className="px-3 py-2.5">Importe</th>
            <th className="px-3 py-2.5">Estado</th>
            <th className="px-3 py-2.5"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-divisor">
          {sorted.map((r) => (
            <Row key={r.id} row={r} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Row({ row }: { row: PaymentRow }) {
  const [pending, startTransition] = useTransition();
  const { showToast } = useToast();
  const inValidation = row.status === "VALIDACION";

  function confirm() {
    startTransition(async () => {
      await confirmPayment(row.id);
      showToast("Pago confirmado");
    });
  }
  function reject() {
    startTransition(async () => {
      await rejectPayment(row.id);
      showToast("Pago rechazado, el cargo vuelve a pendiente");
    });
  }

  return (
    <tr className={inValidation ? "bg-fila-destacada" : undefined}>
      <td className="px-3 py-2.5">{row.dateLabel}</td>
      <td className="px-3 py-2.5 font-bold">{row.familyName}</td>
      <td className="px-3 py-2.5 text-texto-2">{row.appliesTo || "—"}</td>
      <td className="px-3 py-2.5">{PAYMENT_METHOD_LABEL[row.method]}</td>
      <td className="px-3 py-2.5 text-texto-3">{row.reference ?? "—"}{row.folio ? ` · ${row.folio}` : ""}</td>
      <td className="px-3 py-2.5 font-bold">{money(row.amount)}</td>
      <td className="px-3 py-2.5">
        {inValidation ? (
          <span style={{ color: "#A07800" }} className="font-extrabold text-xs">En validación</span>
        ) : (
          <span className={clsx("rounded-pill px-2 py-0.5 text-[11px] font-extrabold", STATUS_PILL[row.status])}>
            {STATUS_LABEL[row.status]}
          </span>
        )}
      </td>
      <td className="px-3 py-2.5">
        {inValidation && (
          <div className="flex gap-1.5">
            <button onClick={reject} disabled={pending} className="rounded-pill border border-borde-input text-xs font-extrabold px-2.5 py-1 text-texto-2 disabled:opacity-45">
              Rechazar
            </button>
            <button onClick={confirm} disabled={pending} className="rounded-pill bg-verde text-white text-xs font-extrabold px-2.5 py-1 disabled:opacity-45">
              Confirmar
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}
