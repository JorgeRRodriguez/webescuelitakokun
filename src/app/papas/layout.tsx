import { requireRole } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { getActiveChildId } from "@/lib/activeChild";
import { PapasHeader } from "./PapasHeader";
import { PapasSidebar } from "./PapasSidebar";
import { PapasTabBar } from "./PapasTabBar";
import { PollingRefresher } from "@/components/PollingRefresher";

export default async function PapasLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole(["TUTOR"]);

  const childOptions = await prisma.child.findMany({
    where: { id: { in: session.user.childIds } },
    include: { group: { include: { level: true } } },
    orderBy: { firstName: "asc" },
  });

  const activeChildId = await getActiveChildId(session.user.childIds);
  const activeChild = childOptions.find((c) => c.id === activeChildId) ?? childOptions[0];

  const pendingNotices = activeChild
    ? await prisma.noticeRecipient.count({
        where: { childId: activeChild.id, response: "PENDIENTE" },
      })
    : 0;

  const childOptionItems = childOptions.map((c) => ({
    id: c.id,
    name: `${c.firstName} ${c.lastName}`,
    avatarColor: c.avatarColor,
    groupLabel: `${c.group.level.name} · ${c.group.name}`,
  }));

  return (
    <div className="flex-1 flex flex-col md:flex-row bg-fondo-app min-h-screen">
      <PollingRefresher intervalMs={6000} />
      <PapasSidebar childOptions={childOptionItems} activeChildId={activeChild?.id ?? null} pendingCount={pendingNotices} />
      <div className="flex-1 flex flex-col min-w-0">
        <PapasHeader childOptions={childOptionItems} activeChildId={activeChild?.id ?? null} />
        <main className="flex-1 pb-20 md:pb-10 overflow-y-auto">
          <div className="mx-auto w-full max-w-[480px] md:max-w-2xl lg:max-w-4xl">{children}</div>
        </main>
        <PapasTabBar pendingCount={pendingNotices} />
      </div>
    </div>
  );
}
