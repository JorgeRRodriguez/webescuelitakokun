import { requireRole } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { AdminNav } from "./AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole(["ADMIN", "DIRECCION", "RECEPCION"]);

  const paymentsInValidation = await prisma.payment.count({ where: { status: "VALIDACION" } });

  return (
    <div className="flex-1 flex flex-col md:flex-row bg-fondo-app min-h-screen">
      <AdminNav
        staffName={session.user.name ?? ""}
        avatarInitials={session.user.avatarInitials}
        avatarColor={session.user.avatarColor}
        paymentsInValidation={paymentsInValidation}
      />
      <main className="flex-1 pb-20 md:pb-0 overflow-y-auto">{children}</main>
    </div>
  );
}
