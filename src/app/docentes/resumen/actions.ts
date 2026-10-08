"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guards";
import { demoToday } from "@/lib/dates";

export async function sendSummary(input: {
  childId: string;
  mood: string | null;
  note: string;
  materialsForTomorrow: string;
}) {
  const session = await requireRole(["DOCENTE"]);
  const today = demoToday();

  await prisma.dailySummary.upsert({
    where: { childId_date: { childId: input.childId, date: today } },
    create: {
      childId: input.childId,
      date: today,
      mood: input.mood,
      note: input.note,
      materialsForTomorrow: input.materialsForTomorrow,
      status: "ENVIADO",
      authorId: session.user.id,
      sentAt: new Date(),
    },
    update: {
      mood: input.mood,
      note: input.note,
      materialsForTomorrow: input.materialsForTomorrow,
      status: "ENVIADO",
      authorId: session.user.id,
      sentAt: new Date(),
      readAt: null,
    },
  });

  revalidatePath("/docentes/resumen");
  revalidatePath("/papas/hoy");
}

export async function sendAllPending(childIds: string[]) {
  const session = await requireRole(["DOCENTE"]);
  const today = demoToday();

  await prisma.dailySummary.updateMany({
    where: { childId: { in: childIds }, date: today, status: "POR_REVISAR" },
    data: { status: "ENVIADO", sentAt: new Date(), authorId: session.user.id },
  });

  revalidatePath("/docentes/resumen");
  revalidatePath("/papas/hoy");
}
