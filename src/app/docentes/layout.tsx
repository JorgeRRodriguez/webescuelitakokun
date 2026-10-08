import { requireRole } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { demoToday } from "@/lib/dates";
import { DocentesNav } from "./DocentesNav";

export default async function DocentesLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole(["DOCENTE"]);

  const staff = await prisma.staff.findUnique({
    where: { id: session.user.id },
    include: { assignments: { include: { group: true } } },
  });

  const titularLabel = staff?.assignments.find((a) => a.groupId)?.roleLabel ?? "Docente";
  const groupNames = staff?.assignments
    .map((a) => a.group?.name)
    .filter((n): n is string => !!n)
    .join(", ");

  const pendingSummaries = await prisma.dailySummary.count({
    where: {
      date: demoToday(),
      status: "POR_REVISAR",
      child: { groupId: { in: session.user.groupIds } },
    },
  });

  return (
    <div className="flex-1 flex flex-col md:flex-row bg-fondo-app min-h-screen">
      <DocentesNav
        staffName={session.user.name ?? ""}
        avatarInitials={session.user.avatarInitials}
        avatarColor={session.user.avatarColor}
        roleLabel={titularLabel}
        groupNames={groupNames || "Sin grupo asignado"}
        pendingSummaries={pendingSummaries}
      />
      <main className="flex-1 pb-20 md:pb-0 overflow-y-auto">{children}</main>
    </div>
  );
}
