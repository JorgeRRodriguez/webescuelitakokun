"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guards";

export async function payWithCard(chargeIds: string[]) {
  const session = await requireRole(["TUTOR"]);
  const charges = await prisma.charge.findMany({ where: { id: { in: chargeIds } } });
  const amount = charges.reduce((s, c) => s + c.amount, 0);
  const folio = `KK-${Math.floor(100000 + Math.random() * 900000)}`;

  await prisma.$transaction([
    prisma.payment.create({
      data: {
        guardianId: session.user.id,
        method: "TARJETA",
        amount,
        status: "CONFIRMADO",
        folio,
        validatedAt: new Date(),
        allocations: { create: charges.map((c) => ({ chargeId: c.id, amount: c.amount })) },
      },
    }),
    ...charges.map((c) => prisma.charge.update({ where: { id: c.id }, data: { status: "PAGADO" } })),
  ]);

  revalidatePath("/papas/pagos");
  revalidatePath("/admin/cobranza");
  revalidatePath("/admin/conciliacion");
  return folio;
}

export async function paySpei(chargeIds: string[], reference: string) {
  const session = await requireRole(["TUTOR"]);
  const charges = await prisma.charge.findMany({ where: { id: { in: chargeIds } } });
  const amount = charges.reduce((s, c) => s + c.amount, 0);

  await prisma.$transaction([
    prisma.payment.create({
      data: {
        guardianId: session.user.id,
        method: "SPEI",
        reference,
        proofUrl: "/comprobantes/demo-upload.png",
        amount,
        status: "VALIDACION",
        allocations: { create: charges.map((c) => ({ chargeId: c.id, amount: c.amount })) },
      },
    }),
    ...charges.map((c) => prisma.charge.update({ where: { id: c.id }, data: { status: "VALIDACION" } })),
  ]);

  revalidatePath("/papas/pagos");
  revalidatePath("/admin/cobranza");
  revalidatePath("/admin/conciliacion");
}
