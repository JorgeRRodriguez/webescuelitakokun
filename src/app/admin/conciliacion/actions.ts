"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guards";

export async function confirmPayment(paymentId: string) {
  const session = await requireRole(["ADMIN"]);
  const payment = await prisma.payment.findUnique({ where: { id: paymentId }, include: { allocations: true } });
  if (!payment) throw new Error("Pago no encontrado.");

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: paymentId },
      data: { status: "CONFIRMADO", validatedById: session.user.id, validatedAt: new Date() },
    }),
    ...payment.allocations.map((a) =>
      prisma.charge.update({ where: { id: a.chargeId }, data: { status: "PAGADO" } })
    ),
  ]);

  revalidatePath("/admin/conciliacion");
  revalidatePath("/admin/cobranza");
  revalidatePath("/papas/pagos");
}

export async function rejectPayment(paymentId: string) {
  const session = await requireRole(["ADMIN"]);
  const payment = await prisma.payment.findUnique({ where: { id: paymentId }, include: { allocations: true } });
  if (!payment) throw new Error("Pago no encontrado.");

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: paymentId },
      data: { status: "RECHAZADO", validatedById: session.user.id, validatedAt: new Date() },
    }),
    ...payment.allocations.map((a) =>
      prisma.charge.update({ where: { id: a.chargeId }, data: { status: "PENDIENTE" } })
    ),
  ]);

  revalidatePath("/admin/conciliacion");
  revalidatePath("/admin/cobranza");
  revalidatePath("/papas/pagos");
}
