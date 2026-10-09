"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guards";
import type { AudienceScope, NoticeResponseType } from "@/lib/enums";

export type CreateNoticeInput = {
  title: string;
  body: string;
  audienceScope: AudienceScope;
  levelId?: string;
  groupId?: string;
  childId?: string;
  responseType: NoticeResponseType;
  dueAt?: string; // "YYYY-MM-DD"
  addToCalendar: boolean;
};

export async function createNotice(input: CreateNoticeInput) {
  const session = await requireRole(["ADMIN", "RECEPCION"]);
  if (!input.title.trim() || !input.body.trim()) throw new Error("Falta título o mensaje.");

  let children: { id: string; groupId: string }[] = [];
  if (input.audienceScope === "PLANTEL") {
    children = await prisma.child.findMany({ select: { id: true, groupId: true } });
  } else if (input.audienceScope === "NIVEL" && input.levelId) {
    children = await prisma.child.findMany({ where: { group: { levelId: input.levelId } }, select: { id: true, groupId: true } });
  } else if (input.audienceScope === "GRUPO" && input.groupId) {
    children = await prisma.child.findMany({ where: { groupId: input.groupId }, select: { id: true, groupId: true } });
  } else if (input.audienceScope === "ALUMNO" && input.childId) {
    children = await prisma.child.findMany({ where: { id: input.childId }, select: { id: true, groupId: true } });
  }

  const childGuardians = await prisma.childGuardian.findMany({
    where: { childId: { in: children.map((c) => c.id) } },
    select: { childId: true, guardianId: true },
  });

  const dueAt = input.dueAt ? new Date(`${input.dueAt}T00:00:00.000Z`) : null;

  const notice = await prisma.notice.create({
    data: {
      title: input.title.trim(),
      body: input.body.trim(),
      audienceScope: input.audienceScope,
      groupId: input.audienceScope === "GRUPO" ? input.groupId : null,
      responseType: input.responseType,
      dueAt,
      authorId: session.user.id,
      addToCalendar: input.addToCalendar,
      recipients: {
        create: childGuardians.map((cg) => ({ guardianId: cg.guardianId, childId: cg.childId })),
      },
    },
  });

  if (input.addToCalendar && dueAt) {
    await prisma.event.create({
      data: {
        title: notice.title,
        description: notice.body,
        type: "ESCUELA",
        date: dueAt,
        audienceScope: input.audienceScope,
        groupId: input.audienceScope === "GRUPO" ? input.groupId : null,
      },
    });
  }

  revalidatePath("/admin/avisos");
  revalidatePath("/papas/hoy");
  revalidatePath("/papas/calendario");
  return notice.id;
}

export async function remindPending(noticeId: string) {
  await requireRole(["ADMIN", "RECEPCION"]);
  const count = await prisma.noticeRecipient.count({ where: { noticeId, response: "PENDIENTE" } });
  return count;
}

export async function getOptionsForAudience() {
  await requireRole(["ADMIN", "RECEPCION"]);
  const [levels, groups, children] = await Promise.all([
    prisma.level.findMany({ select: { id: true, name: true } }),
    prisma.group.findMany({ select: { id: true, name: true, levelId: true } }),
    prisma.child.findMany({ select: { id: true, firstName: true, lastName: true, groupId: true } }),
  ]);
  return { levels, groups, children };
}
