"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guards";
import { demoToday } from "@/lib/dates";
import type { DailyEntryType } from "@/lib/enums";

export type CaptureInput = {
  type: DailyEntryType;
  childIds: string[];
  title: string;
  detail?: string;
  startTime?: string; // "HH:MM"
  endTime?: string;
  exceptions?: Record<string, string>; // childId -> valor de excepción
};

function timeOnToday(hm: string, today: Date) {
  const [h, m] = hm.split(":").map(Number);
  const d = new Date(today);
  d.setUTCHours(h, m, 0, 0);
  return d;
}

export async function captureEntries(input: CaptureInput) {
  const session = await requireRole(["DOCENTE"]);
  if (input.childIds.length === 0) throw new Error("Selecciona al menos un alumno.");

  const today = demoToday();
  const now = new Date();
  const batchId = `batch-${input.type}-${now.getTime()}`;

  for (const childId of input.childIds) {
    await prisma.dailyEntry.create({
      data: {
        childId,
        date: today,
        type: input.type,
        time: now,
        title: input.title,
        detail: input.detail || null,
        exceptionValue: input.exceptions?.[childId] ?? null,
        startTime: input.startTime ? timeOnToday(input.startTime, today) : null,
        endTime: input.endTime ? timeOnToday(input.endTime, today) : null,
        authorId: session.user.id,
        batchId,
      },
    });

    const existing = await prisma.dailySummary.findUnique({ where: { childId_date: { childId, date: today } } });
    if (!existing) {
      await prisma.dailySummary.create({ data: { childId, date: today, status: "POR_REVISAR" } });
    } else if (existing.status === "SIN_REGISTROS") {
      await prisma.dailySummary.update({ where: { id: existing.id }, data: { status: "POR_REVISAR" } });
    }
  }

  revalidatePath("/docentes/resumen");
  revalidatePath("/docentes/mi-grupo");
  revalidatePath("/papas/hoy");

  return { count: input.childIds.length };
}
