"use client";

import { useState, useTransition } from "react";
import clsx from "clsx";
import { useToast } from "@/components/Toast";
import { PAYMENT_METHOD_LABEL, type PaymentMethod } from "@/lib/enums";
import { payWithCard, paySpei, payEfectivo } from "./actions";

export type ChargeItem = {
  id: string;
  conceptName: string;
  period: string;
  amount: number;
  dueAtLabel: string;
  overdue: boolean;
  status: "PENDIENTE" | "VALIDACION" | "PAGADO" | "CANCELADO";
  paymentMethod: PaymentMethod | null;
  paymentDateLabel: string | null;
};

function money(n: number) {
  return n.toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });
}

const STATUS_LABEL: Record<ChargeItem["status"], string> = {
  PAGADO: "Pagado",
  VALIDACION: "En validación",
  PENDIENTE: "Pendiente",
  CANCELADO: "Cancelado",
};

function statusClass(item: ChargeItem) {
  if (item.status === "PAGADO") return "text-verde-text";
  if (item.status === "VALIDACION") return "";
  if (item.status === "PENDIENTE" && item.overdue) return "text-rojo-text";
  if (item.status === "PENDIENTE") return "text-magenta";
  return "text-texto-3";
}

export function PagosView({
  childName,
  saldoPendiente,
  enValidacion,
  nextDue,
  items,
}: {
  childName: string;
  saldoPendiente: number;
  enValidacion: number;
  nextDue: string | null;
  items: ChargeItem[];
}) {
  const pendingItems = items.filter((i) => i.status === "PENDIENTE");
  const [selected, setSelected] = useState<string[]>(pendingItems.map((i) => i.id));
  const [sheetOpen, setSheetOpen] = useState(false);

  const total = items.filter((i) => selected.includes(i.id)).reduce((s, i) => s + i.amount, 0);

  function toggle(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  return (
    <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6">
      <div className="flex flex-col gap-4">
        <div className="rounded-card bg-ink text-white p-4">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.04em] text-white/70">Saldo pendiente · {childName}</p>
          <p className="font-heading font-bold text-[34px] leading-none mt-1">{money(saldoPendiente)}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {nextDue && <span className="text-xs text-white/80">Próximo vencimiento: {nextDue}</span>}
            {enValidacion > 0 && (
              <span className="rounded-pill bg-amarillo text-amarillo-text text-[11px] font-extrabold px-2.5 py-1">
                {money(enValidacion)} en validación
              </span>
            )}
          </div>
        </div>

        {pendingItems.length > 0 && (
          <div className="flex flex-col gap-2">
            {pendingItems.map((i) => (
              <label key={i.id} className="rounded-card bg-white border border-borde-card p-3 flex items-center gap-3">
                <input type="checkbox" checked={selected.includes(i.id)} onChange={() => toggle(i.id)} />
                <div className="flex-1">
                  <p className="text-sm font-extrabold">{i.conceptName}</p>
                  <p className={clsx("text-xs", i.overdue ? "text-rojo-text font-bold" : "text-texto-3")}>
                    {i.period} · vence {i.dueAtLabel}
                  </p>
                </div>
                <span className="text-sm font-extrabold">{money(i.amount)}</span>
              </label>
            ))}
            <button
              onClick={() => setSheetOpen(true)}
              disabled={total === 0}
              className="rounded-pill bg-magenta text-white font-extrabold text-sm py-2.5 disabled:opacity-45"
            >
              Pagar {money(total)}
            </button>
          </div>
        )}
      </div>

      <div>
        <h2 className="font-heading font-bold text-lg mb-2">Estado de cuenta</h2>
        <div className="rounded-card bg-white border border-borde-card divide-y divide-divisor">
          {items.map((i) => (
            <div key={i.id} className="p-3 flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-bold">{i.conceptName}</p>
                <p className="text-[11px] text-texto-3">
                  {i.period}
                  {i.paymentMethod ? ` · ${PAYMENT_METHOD_LABEL[i.paymentMethod]}` : ""}
                  {i.paymentDateLabel ? ` · ${i.paymentDateLabel}` : ""}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-extrabold">{money(i.amount)}</p>
                <p className={clsx("text-[11px] font-extrabold", statusClass(i))} style={i.status === "VALIDACION" ? { color: "#A07800" } : undefined}>
                  {STATUS_LABEL[i.status]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {sheetOpen && (
        <PaymentSheet
          chargeIds={selected}
          total={total}
          onClose={() => setSheetOpen(false)}
        />
      )}
    </div>
  );
}

type SheetStep = "metodo" | "tarjeta" | "spei" | "efectivo" | "confirmado-tarjeta" | "confirmado-spei" | "confirmado-efectivo";

function PaymentSheet({ chargeIds, total, onClose }: { chargeIds: string[]; total: number; onClose: () => void }) {
  const [step, setStep] = useState<SheetStep>("metodo");
  const [reference, setReference] = useState("");
  const [proofName, setProofName] = useState<string | null>(null);
  const [folio, setFolio] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const { showToast } = useToast();

  function payCard() {
    startTransition(async () => {
      const f = await payWithCard(chargeIds);
      setFolio(f);
      setStep("confirmado-tarjeta");
    });
  }

  function sendSpei() {
    if (!proofName) return;
    startTransition(async () => {
      await paySpei(chargeIds, reference || "012180011122233344");
      setStep("confirmado-spei");
      showToast("Comprobante enviado");
    });
  }

  function reportEfectivo() {
    startTransition(async () => {
      const f = await payEfectivo(chargeIds);
      setFolio(f);
      setStep("confirmado-efectivo");
      showToast("Avisamos al plantel de tu pago en efectivo");
    });
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      <div className="absolute inset-0 bg-[rgba(35,26,38,.45)]" onClick={onClose} />
      <div className="relative w-full max-w-[480px] bg-white rounded-t-[28px] p-5 pb-8 flex flex-col gap-4">
        {step === "metodo" && (
          <>
            <h2 className="font-heading font-bold text-xl">Pagar {money(total)}</h2>
            <button onClick={() => setStep("tarjeta")} className="rounded-card border border-borde-card p-3.5 text-left font-bold">
              💳 Tarjeta guardada ···· 4242
            </button>
            <button onClick={() => setStep("spei")} className="rounded-card border border-borde-card p-3.5 text-left font-bold">
              🏦 Transferencia SPEI
            </button>
            <button onClick={() => setStep("efectivo")} className="rounded-card border border-borde-card p-3.5 text-left font-bold">
              💵 Pago en efectivo
            </button>
          </>
        )}

        {step === "tarjeta" && (
          <>
            <h2 className="font-heading font-bold text-xl">Tarjeta guardada</h2>
            <p className="text-sm text-texto-2">Visa ···· 4242 · se cobrará {money(total)}</p>
            <button
              onClick={payCard}
              disabled={pending}
              className="rounded-pill bg-magenta text-white font-extrabold text-sm py-2.5 disabled:opacity-45"
            >
              Pagar {money(total)}
            </button>
          </>
        )}

        {step === "spei" && (
          <>
            <h2 className="font-heading font-bold text-xl">Transferencia SPEI</h2>
            <div className="rounded-card-sm bg-magenta-25 p-3 text-sm">
              <p><b>Banco:</b> BBVA</p>
              <p><b>CLABE:</b> 012180001234567890</p>
              <p><b>Referencia:</b> KOKUN-{chargeIds[0]?.slice(-6) ?? "000000"}</p>
            </div>
            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-extrabold uppercase text-texto-3">Referencia de tu transferencia</span>
              <input value={reference} onChange={(e) => setReference(e.target.value)} className="rounded-[10px] border border-borde-input px-3 py-2 text-sm" />
            </label>
            <label className="rounded-card-sm border border-dashed border-borde-input p-3 text-center text-sm text-texto-3 cursor-pointer">
              {proofName ?? "Adjuntar comprobante (imagen o PDF)"}
              <input type="file" className="hidden" onChange={(e) => setProofName(e.target.files?.[0]?.name ?? null)} />
            </label>
            <button
              onClick={sendSpei}
              disabled={!proofName || pending}
              className="rounded-pill bg-magenta text-white font-extrabold text-sm py-2.5 disabled:opacity-45"
            >
              Enviar comprobante
            </button>
          </>
        )}

        {step === "efectivo" && (
          <>
            <h2 className="font-heading font-bold text-xl">Pago en efectivo</h2>
            <div className="rounded-card-sm bg-magenta-25 p-3 text-sm">
              <p>Puedes pagar en la caja de recepción del plantel, de lunes a viernes de 8:00 a 15:00.</p>
              <p className="mt-1">
                <b>Folio para caja:</b> KOKUN-{chargeIds[0]?.slice(-6) ?? "000000"}
              </p>
              <p className="mt-1">
                <b>Monto a pagar:</b> {money(total)}
              </p>
            </div>
            <p className="text-xs text-texto-3">
              Avisa al plantel que ya vas a pagar; el cargo quedará &quot;En validación&quot; hasta que recepción confirme que recibió tu efectivo.
            </p>
            <button
              onClick={reportEfectivo}
              disabled={pending}
              className="rounded-pill bg-magenta text-white font-extrabold text-sm py-2.5 disabled:opacity-45"
            >
              Ya voy a pagar en caja
            </button>
          </>
        )}

        {step === "confirmado-tarjeta" && (
          <div className="rounded-card bg-amarillo-50 p-4 text-center">
            <p className="font-extrabold text-amarillo-text">Pago registrado · Folio {folio} · En validación</p>
          </div>
        )}
        {step === "confirmado-spei" && (
          <div className="rounded-card bg-amarillo-50 p-4 text-center">
            <p className="font-extrabold text-amarillo-text">Comprobante enviado… En validación</p>
          </div>
        )}
        {step === "confirmado-efectivo" && (
          <div className="rounded-card bg-amarillo-50 p-4 text-center">
            <p className="font-extrabold text-amarillo-text">Pago en efectivo registrado · Folio {folio} · En validación</p>
          </div>
        )}

        {(step === "confirmado-tarjeta" || step === "confirmado-spei" || step === "confirmado-efectivo") && (
          <button onClick={onClose} className="rounded-pill border border-borde-input text-sm font-extrabold py-2.5">
            Cerrar
          </button>
        )}
      </div>
    </div>
  );
}
