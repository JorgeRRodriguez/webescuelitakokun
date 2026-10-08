"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guards";
import { demoToday } from "@/lib/dates";
import type { AttendanceStatus } from "@/lib/enums";

export async function registerAttendance(childId: string, status: AttendanceStatus, checkInBy?: string) {
  const session = await requireRole(["DOCENTE"]);
  const today = demoToday();

  await prisma.attendance.upsert({
    where: { childId_date: { childId, date: today } },
    create: {
      childId,
      date: today,
      status,
      checkInTime: status === "PRESENTE" ? new Date() : null,
      checkInBy: status === "PRESENTE" ? checkInBy || "Registrado en recepción" : null,
      registeredById: session.user.id,
    },
    update: {
      status,
      checkInTime: status === "PRESENTE" ? new Date() : null,
      checkInBy: status === "PRESENTE" ? checkInBy || "Registrado en recepción" : null,
      registeredById: session.user.id,
    },
  });

  revalidatePath("/docentes/mi-grupo");
  revalidatePath("/papas/hoy");
}
