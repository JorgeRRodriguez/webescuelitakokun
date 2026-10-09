"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guards";

export type ConceptInput = {
  key: string;
  name: string;
  amount: number;
  unit: string;
  periodicity: string;
  dueRule?: string;
  calculation?: string;
};

function normalize(input: ConceptInput) {
  const key = input.key.trim().toUpperCase();
  const name = input.name.trim();
  const unit = input.unit.trim();
  const periodicity = input.periodicity.trim();

  if (!key) throw new Error("Falta la clave.");
  if (!name) throw new Error("Falta el nombre del concepto.");
  if (!unit) throw new Error("Falta la unidad.");
  if (!periodicity) throw new Error("Falta la periodicidad.");
  if (!Number.isFinite(input.amount) || input.amount < 0) throw new Error("El importe no es válido.");

  return {
    key,
    name,
    amount: input.amount,
    unit,
    periodicity,
    dueRule: input.dueRule?.trim() || null,
    calculation: input.calculation?.trim() || null,
  };
}

export async function createConcept(input: ConceptInput) {
  await requireRole(["ADMIN", "DIRECCION"]);
  const data = normalize(input);

  const existing = await prisma.concept.findUnique({ where: { key: data.key } });
  if (existing) throw new Error(`Ya existe un concepto con la clave "${data.key}".`);

  const concept = await prisma.concept.create({ data });

  revalidatePath("/admin/conceptos");
  revalidatePath("/admin/cobranza");
  return concept.id;
}

export async function updateConcept(id: string, input: ConceptInput) {
  await requireRole(["ADMIN", "DIRECCION"]);
  const data = normalize(input);

  const existing = await prisma.concept.findUnique({ where: { key: data.key } });
  if (existing && existing.id !== id) throw new Error(`Ya existe un concepto con la clave "${data.key}".`);

  await prisma.concept.update({ where: { id }, data });

  revalidatePath("/admin/conceptos");
  revalidatePath("/admin/cobranza");
}
