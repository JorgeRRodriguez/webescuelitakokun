"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guards";

// Contraseña de demo, igual que todas las cuentas sembradas (ver prisma/seed.ts).
const DEMO_PASSWORD = "kokun2026";

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

export type AddFamilyMemberInput = {
  name: string;
  relationshipLabel: string;
  email: string;
  phone?: string;
  receivesComms: boolean;
  canPickUp: boolean;
  canPay: boolean;
};

export async function addFamilyMember(childId: string, input: AddFamilyMemberInput) {
  const session = await requireRole(["TUTOR"]);

  const requesterLink = await prisma.childGuardian.findFirst({ where: { childId, guardianId: session.user.id } });
  if (!requesterLink) throw new Error("No tienes acceso a este alumno.");

  const name = input.name.trim();
  const relationshipLabel = input.relationshipLabel.trim();
  const email = input.email.trim().toLowerCase();
  const phone = input.phone?.trim() || null;

  if (!name) throw new Error("Falta el nombre.");
  if (!relationshipLabel) throw new Error("Falta el parentesco.");
  if (!email) throw new Error("Falta el correo.");
  if (!input.receivesComms && !input.canPickUp && !input.canPay) {
    throw new Error("Selecciona al menos un permiso: comunicaciones, recoger o pagos.");
  }

  const existingGuardian = await prisma.guardian.findUnique({ where: { email } });

  if (existingGuardian) {
    const existingLink = await prisma.childGuardian.findUnique({
      where: { childId_guardianId: { childId, guardianId: existingGuardian.id } },
    });
    if (existingLink) throw new Error("Esa persona ya está vinculada a este alumno.");

    await prisma.childGuardian.create({
      data: {
        childId,
        guardianId: existingGuardian.id,
        receivesComms: input.receivesComms,
        canPickUp: input.canPickUp,
        canPay: input.canPay,
      },
    });
  } else {
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
    await prisma.guardian.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        relationshipLabel,
        children: {
          create: {
            childId,
            receivesComms: input.receivesComms,
            canPickUp: input.canPickUp,
            canPay: input.canPay,
          },
        },
      },
    });
  }

  revalidatePath("/papas/mi-hijo");
  return { email, isNewAccount: !existingGuardian };
}
