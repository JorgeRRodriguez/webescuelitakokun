"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guards";

export async function togglePermission(
  childGuardianId: string,
  field: "receivesComms" | "canPickUp" | "canPay",
  value: boolean
) {
  await requireRole(["TUTOR"]);
  const link = await prisma.childGuardian.findUnique({ where: { id: childGuardianId } });
  if (!link) throw new Error("No encontrado");
  if (link.isPrimary) throw new Error("La tutora o tutor principal no puede perder permisos.");

  await prisma.childGuardian.update({ where: { id: childGuardianId }, data: { [field]: value } });
  revalidatePath("/papas/mi-hijo");
}
