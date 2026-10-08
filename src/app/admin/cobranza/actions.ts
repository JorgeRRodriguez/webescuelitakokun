"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guards";

export type GenerateChargesInput = {
  conceptId: string;
  period: string;
  scope: "PLANTEL" | "NIVEL" | "GRUPO" | "ALUMNO";
  levelId?: string;
  groupId?: string;
  childId?: string;
  generatedAt?: string; // YYYY-MM-DD
  dueAt: string; // YYYY-MM-DD
  amount: number;
};

export async function previewRecipients(input: Pick<GenerateChargesInput, "scope" | "levelId" | "groupId" | "childId">) {
  await requireRole(["ADMIN", "DIRECCION"]);
  return resolveChildren(input);
}

async function resolveChildren(input: Pick<GenerateChargesInput, "scope" | "levelId" | "groupId" | "childId">) {
  if (input.scope === "PLANTEL") return prisma.child.findMany({ select: { id: true } });
  if (input.scope === "NIVEL" && input.levelId) return prisma.child.findMany({ where: { group: { levelId: input.levelId } }, select: { id: true } });
  if (input.scope === "GRUPO" && input.groupId) return prisma.child.findMany({ where: { groupId: input.groupId }, select: { id: true } });
  if (input.scope === "ALUMNO" && input.childId) return prisma.child.findMany({ where: { id: input.childId }, select: { id: true } });
  return [];
}

export async function generateCharges(input: GenerateChargesInput) {
  await requireRole(["ADMIN", "DIRECCION"]);
  const children = await resolveChildren(input);
  if (children.length === 0) throw new Error("No hay alumnos para esta selección.");

  const dueAt = new Date(`${input.dueAt}T00:00:00.000Z`);
  const generatedAt = input.generatedAt ? new Date(`${input.generatedAt}T00:00:00.000Z`) : new Date();

  await prisma.charge.createMany({
    data: children.map((c) => ({
      childId: c.id,
      conceptId: input.conceptId,
      period: input.period,
      generatedAt,
      dueAt,
      amount: input.amount,
      status: "PENDIENTE",
    })),
  });

  revalidatePath("/admin/cobranza");
  revalidatePath("/papas/pagos");
  return children.length;
}
