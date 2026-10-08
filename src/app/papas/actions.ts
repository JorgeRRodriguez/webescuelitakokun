"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guards";
import type { NoticeResponse } from "@/lib/enums";

export async function markNoticeRead(noticeId: string, childId: string) {
  const session = await requireRole(["TUTOR"]);
  await prisma.noticeRecipient.updateMany({
    where: { noticeId, childId, guardianId: session.user.id, readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath("/papas/hoy");
  revalidatePath("/admin/avisos");
}

export async function respondNotice(noticeId: string, childId: string, response: NoticeResponse) {
  const session = await requireRole(["TUTOR"]);
  await prisma.noticeRecipient.updateMany({
    where: { noticeId, childId, guardianId: session.user.id },
    data: { response, respondedAt: new Date(), readAt: new Date() },
  });
  revalidatePath("/papas/hoy");
  revalidatePath("/admin/avisos");
}

export async function markSummaryViewed(childId: string, date: Date) {
  await requireRole(["TUTOR"]);
  await prisma.dailySummary.updateMany({
    where: { childId, date, readAt: null },
    data: { readAt: new Date(), status: "VISTO" },
  });
  revalidatePath("/papas/hoy");
  revalidatePath("/docentes/resumen");
}

export async function setEventReminder(eventId: string, childId: string, reminder: boolean) {
  const session = await requireRole(["TUTOR"]);
  await prisma.eventGuardian.upsert({
    where: { eventId_guardianId_childId: { eventId, guardianId: session.user.id, childId } },
    create: { eventId, guardianId: session.user.id, childId, reminder },
    update: { reminder },
  });
  revalidatePath("/papas/calendario");
}

export async function setEventRsvp(eventId: string, childId: string, rsvp: "ASISTIRE" | "NO_PODRE") {
  const session = await requireRole(["TUTOR"]);
  await prisma.eventGuardian.upsert({
    where: { eventId_guardianId_childId: { eventId, guardianId: session.user.id, childId } },
    create: { eventId, guardianId: session.user.id, childId, rsvp },
    update: { rsvp },
  });
  revalidatePath("/papas/calendario");
}
