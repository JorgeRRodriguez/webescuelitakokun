"use client";

import { useState, useTransition } from "react";
import { useToast } from "@/components/Toast";
import { createConcept, updateConcept, type ConceptInput } from "./actions";

export type ConceptRow = {
  id: string;
  key: string;
  name: string;
  amount: number;
  unit: string;
  periodicity: string;
  dueRule: string | null;
  calculation: string | null;
};

function money(n: number) {
  return n.toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });
}

export function ConceptosAdmin({ concepts, canEdit }: { concepts: ConceptRow[]; canEdit: boolean }) {
  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<ConceptRow | null>(null);

  function openCreate() {
    setEditing(null);
    setFormMode("create");
  }
  function openEdit(c: ConceptRow) {
    setEditing(c);
    setFormMode("edit");
  }
  function close() {
    setFormMode(null);
    setEditing(null);
  }

  return (
    <div className="flex flex-col gap-4">
      {canEdit && (
        <button
          onClick={() => (formMode ? close() : openCreate())}
          className="self-start rounded-pill bg-magenta text-white font-extrabold text-sm px-4 py-2.5"
        >
          {formMode ? "Cancelar" : "+ Nuevo concepto"}
        </button>
      )}

      {formMode && <ConceptForm concept={editing} onDone={close} />}

      <div className="rounded-card bg-white border border-borde-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] font-extrabold uppercase text-texto-3 bg-magenta-25">
              <th className="px-3 py-2.5">Clave</th>
              <th className="px-3 py-2.5">Concepto</th>
              <th className="px-3 py-2.5">Importe</th>
              <th className="px-3 py-2.5">Periodicidad</th>
              <th className="px-3 py-2.5">Vencimiento</th>
              <th className="px-3 py-2.5">Cálculo</th>
              {canEdit && <th className="px-3 py-2.5"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-divisor">
            {concepts.map((c) => (
              <tr key={c.id}>
                <td className="px-3 py-2.5 font-extrabold text-magenta">{c.key}</td>
                <td className="px-3 py-2.5 font-bold">{c.name}</td>
                <td className="px-3 py-2.5">{money(c.amount)} / {c.unit}</td>
                <td className="px-3 py-2.5 text-texto-2">{c.periodicity}</td>
                <td className="px-3 py-2.5 text-texto-3">{c.dueRule ?? "—"}</td>
                <td className="px-3 py-2.5 text-texto-3">{c.calculation ?? "—"}</td>
                {canEdit && (
                  <td className="px-3 py-2.5">
                    <button
                      onClick={() => openEdit(c)}
                      className="rounded-pill border border-borde-input text-xs font-extrabold px-2.5 py-1 text-texto-2"
                    >
                      Editar
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-texto-4">Cambiar un importe solo afecta cargos futuros.</p>
    </div>
  );
}

function ConceptForm({ concept, onDone }: { concept: ConceptRow | null; onDone: () => void }) {
  const [key, setKey] = useState(concept?.key ?? "");
  const [name, setName] = useState(concept?.name ?? "");
  const [amount, setAmount] = useState(concept?.amount ?? 0);
  const [unit, setUnit] = useState(concept?.unit ?? "");
  const [periodicity, setPeriodicity] = useState(concept?.periodicity ?? "");
  const [dueRule, setDueRule] = useState(concept?.dueRule ?? "");
  const [calculation, setCalculation] = useState(concept?.calculation ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const { showToast } = useToast();

  const isValid = key.trim() !== "" && name.trim() !== "" && unit.trim() !== "" && periodicity.trim() !== "" && Number.isFinite(amount) && amount >= 0;

  function submit() {
    setError(null);
    const input: ConceptInput = { key, name, amount, unit, periodicity, dueRule, calculation };
    startTransition(async () => {
      try {
        if (concept) {
          await updateConcept(concept.id, input);
          showToast("Concepto actualizado");
        } else {
          await createConcept(input);
          showToast("Concepto creado");
        }
        onDone();
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo guardar el concepto.");
      }
    });
  }

  return (
    <div className="rounded-card bg-white border-2 border-magenta p-4 flex flex-col gap-3">
      <h2 className="font-heading font-bold text-lg">{concept ? `Editar ${concept.key}` : "Nuevo concepto"}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-extrabold uppercase text-texto-3">Clave</span>
          <input
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="COL"
            className="rounded-[10px] border border-borde-input px-3 py-2 text-sm uppercase"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-extrabold uppercase text-texto-3">Nombre</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Colegiatura"
            className="rounded-[10px] border border-borde-input px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-extrabold uppercase text-texto-3">Importe</span>
          <input
            type="number"
            min={0}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="rounded-[10px] border border-borde-input px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-extrabold uppercase text-texto-3">Unidad</span>
          <input
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="mensual"
            className="rounded-[10px] border border-borde-input px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-extrabold uppercase text-texto-3">Periodicidad</span>
          <input
            value={periodicity}
            onChange={(e) => setPeriodicity(e.target.value)}
            placeholder="Mensual"
            className="rounded-[10px] border border-borde-input px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-extrabold uppercase text-texto-3">Regla de vencimiento</span>
          <input
            value={dueRule}
            onChange={(e) => setDueRule(e.target.value)}
            placeholder="Día 10 de cada mes"
            className="rounded-[10px] border border-borde-input px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 sm:col-span-2">
          <span className="text-[11px] font-extrabold uppercase text-texto-3">Cálculo</span>
          <input
            value={calculation}
            onChange={(e) => setCalculation(e.target.value)}
            placeholder="Importe fijo"
            className="rounded-[10px] border border-borde-input px-3 py-2 text-sm"
          />
        </label>
      </div>

      {error && <p className="text-xs font-bold text-rojo-text">{error}</p>}

      <div className="flex gap-2">
        <button onClick={onDone} className="rounded-pill border border-borde-input text-sm font-extrabold px-4 py-2.5 text-texto-2">
          Cancelar
        </button>
        <button
          onClick={submit}
          disabled={pending || !isValid}
          className="rounded-pill bg-magenta text-white font-extrabold text-sm px-5 py-2.5 disabled:opacity-45"
        >
          {concept ? "Guardar cambios" : "Crear concepto"}
        </button>
      </div>
    </div>
  );
}
