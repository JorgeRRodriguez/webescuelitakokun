"use client";

import { useState, useTransition } from "react";
import clsx from "clsx";
import { useToast } from "@/components/Toast";
import { generateCharges, previewRecipients } from "./actions";

export type FamilyRow = { childId: string; childName: string; porCobrar: number; vencido: number; enValidacion: number };
type Concept = { id: string; key: string; name: string; amount: number };
type Level = { id: string; name: string };
type Group = { id: string; name: string; levelId: string };
type ChildOpt = { id: string; firstName: string; lastName: string };

function money(n: number) {
  return n.toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });
}

export function CobranzaAdmin({
  kpis,
  rows,
  concepts,
  levels,
  groups,
  students,
}: {
  kpis: { porCobrar: number; vencido: number; enValidacion: number; cobradoMes: number };
  rows: FamilyRow[];
  concepts: Concept[];
  levels: Level[];
  groups: Group[];
  students: ChildOpt[];
}) {
  const [formOpen, setFormOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <Kpi label="Por cobrar" value={kpis.porCobrar} />
        <Kpi label="Vencido" value={kpis.vencido} tone="rojo" />
        <Kpi label="En validación" value={kpis.enValidacion} tone="validacion" />
        <Kpi label="Cobrado en octubre" value={kpis.cobradoMes} tone="verde" />
      </div>

      <button
        onClick={() => setFormOpen((o) => !o)}
        className="self-start rounded-pill bg-magenta text-white font-extrabold text-sm px-4 py-2.5"
      >
        {formOpen ? "Cancelar" : "+ Generar cargos"}
      </button>

      {formOpen && (
        <GenerateChargesForm concepts={concepts} levels={levels} groups={groups} students={students} onDone={() => setFormOpen(false)} />
      )}

      <div className="rounded-card bg-white border border-borde-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] font-extrabold uppercase text-texto-3 bg-magenta-25">
              <th className="px-3 py-2.5">Familia</th>
              <th className="px-3 py-2.5">Por cobrar</th>
              <th className="px-3 py-2.5">Vencido</th>
              <th className="px-3 py-2.5">En validación</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-divisor">
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-4 text-texto-3">No hay saldos pendientes.</td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.childId}>
                <td className="px-3 py-2.5 font-bold">{r.childName}</td>
                <td className="px-3 py-2.5">{r.porCobrar ? money(r.porCobrar) : "—"}</td>
                <td className="px-3 py-2.5 text-rojo-text">{r.vencido ? money(r.vencido) : "—"}</td>
                <td className="px-3 py-2.5" style={{ color: "#A07800" }}>{r.enValidacion ? money(r.enValidacion) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Kpi({ label, value, tone }: { label: string; value: number; tone?: "rojo" | "verde" | "validacion" }) {
  const toneClass =
    tone === "rojo" ? "bg-rojo-50 text-rojo-text" : tone === "verde" ? "bg-verde-50 text-verde-text" : tone === "validacion" ? "bg-amarillo-50" : "bg-magenta-25 text-magenta";
  return (
    <div className={clsx("rounded-card p-3 text-center", toneClass)}>
      <p className="font-heading font-bold text-xl" style={tone === "validacion" ? { color: "#A07800" } : undefined}>
        {money(value)}
      </p>
      <p className="text-[10px] font-extrabold uppercase">{label}</p>
    </div>
  );
}

function GenerateChargesForm({
  concepts,
  levels,
  groups,
  students,
  onDone,
}: {
  concepts: Concept[];
  levels: Level[];
  groups: Group[];
  students: ChildOpt[];
  onDone: () => void;
}) {
  const [conceptId, setConceptId] = useState(concepts[0]?.id ?? "");
  const [period, setPeriod] = useState("Octubre 2026");
  const [scope, setScope] = useState<"PLANTEL" | "NIVEL" | "GRUPO" | "ALUMNO">("GRUPO");
  const [levelId, setLevelId] = useState(levels[0]?.id ?? "");
  const [groupId, setGroupId] = useState(groups[0]?.id ?? "");
  const [childId, setChildId] = useState(students[0]?.id ?? "");
  const [dueAt, setDueAt] = useState("");
  const [amount, setAmount] = useState(concepts[0]?.amount ?? 0);
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();
  const { showToast } = useToast();

  const concept = concepts.find((c) => c.id === conceptId);

  function onConceptChange(id: string) {
    setConceptId(id);
    const c = concepts.find((x) => x.id === id);
    if (c) setAmount(c.amount);
    setPreviewCount(null);
  }

  function preview() {
    startTransition(async () => {
      const list = await previewRecipients({ scope, levelId, groupId, childId });
      setPreviewCount(list.length);
    });
  }

  function submit() {
    if (!dueAt) return;
    startTransition(async () => {
      const count = await generateCharges({ conceptId, period, scope, levelId, groupId, childId, dueAt, amount });
      showToast(`Se generaron ${count} cargos`);
      onDone();
    });
  }

  const total = (previewCount ?? 0) * amount;

  return (
    <div className="rounded-card bg-white border-2 border-magenta p-4 flex flex-col gap-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-extrabold uppercase text-texto-3">Concepto</span>
          <select value={conceptId} onChange={(e) => onConceptChange(e.target.value)} className="rounded-[10px] border border-borde-input px-3 py-2 text-sm">
            {concepts.map((c) => (
              <option key={c.id} value={c.id}>{c.key} · {c.name}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-extrabold uppercase text-texto-3">Periodo</span>
          <input value={period} onChange={(e) => setPeriod(e.target.value)} className="rounded-[10px] border border-borde-input px-3 py-2 text-sm" />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-extrabold uppercase text-texto-3">Destinatarios</span>
          <select
            value={scope}
            onChange={(e) => {
              setScope(e.target.value as typeof scope);
              setPreviewCount(null);
            }}
            className="rounded-[10px] border border-borde-input px-3 py-2 text-sm"
          >
            <option value="PLANTEL">Plantel completo</option>
            <option value="NIVEL">Nivel</option>
            <option value="GRUPO">Grupo</option>
            <option value="ALUMNO">Alumno</option>
          </select>
        </label>
        {scope === "NIVEL" && (
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-extrabold uppercase text-texto-3">Nivel</span>
            <select value={levelId} onChange={(e) => { setLevelId(e.target.value); setPreviewCount(null); }} className="rounded-[10px] border border-borde-input px-3 py-2 text-sm">
              {levels.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </label>
        )}
        {scope === "GRUPO" && (
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-extrabold uppercase text-texto-3">Grupo</span>
            <select value={groupId} onChange={(e) => { setGroupId(e.target.value); setPreviewCount(null); }} className="rounded-[10px] border border-borde-input px-3 py-2 text-sm">
              {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </label>
        )}
        {scope === "ALUMNO" && (
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-extrabold uppercase text-texto-3">Alumno</span>
            <select value={childId} onChange={(e) => { setChildId(e.target.value); setPreviewCount(null); }} className="rounded-[10px] border border-borde-input px-3 py-2 text-sm">
              {students.map((c) => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
            </select>
          </label>
        )}

        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-extrabold uppercase text-texto-3">Vencimiento</span>
          <input type="date" value={dueAt} onChange={(e) => setDueAt(e.target.value)} className="rounded-[10px] border border-borde-input px-3 py-2 text-sm" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-extrabold uppercase text-texto-3">Importe</span>
          <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="rounded-[10px] border border-borde-input px-3 py-2 text-sm" />
        </label>
      </div>

      <button onClick={preview} disabled={pending} className="self-start rounded-pill border border-borde-input text-xs font-extrabold px-3 py-1.5 text-texto-2">
        Calcular vista previa
      </button>

      {previewCount !== null && (
        <p className="text-sm text-texto-2 bg-magenta-25 rounded-card-sm px-3 py-2">
          Se generarán <b>{previewCount}</b> cargos de {concept?.name} por <b>{money(amount)}</b> c/u · total <b>{money(total)}</b>
          {dueAt ? ` · vencen el ${dueAt}` : ""}
        </p>
      )}

      <button
        onClick={submit}
        disabled={pending || !dueAt}
        className="self-start rounded-pill bg-magenta text-white font-extrabold text-sm px-5 py-2.5 disabled:opacity-45"
      >
        Generar cargos
      </button>
    </div>
  );
}
