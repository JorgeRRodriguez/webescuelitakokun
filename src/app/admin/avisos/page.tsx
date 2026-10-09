import { requireRole } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { formatDateUTC } from "@/lib/dates";
import { NoticesAdmin, type NoticeListItem, type AudienceOptions } from "./NoticesAdmin";

export default async function AvisosAdminPage() {
  await requireRole(["ADMIN", "RECEPCION"]);

  const notices = await prisma.notice.findMany({
    orderBy: { createdAt: "desc" },
    include: { recipients: { include: { guardian: true, child: { include: { group: true } } } }, group: true },
  });

  const [levels, groups, children] = await Promise.all([
    prisma.level.findMany({ select: { id: true, name: true } }),
    prisma.group.findMany({ select: { id: true, name: true, levelId: true } }),
    prisma.child.findMany({ select: { id: true, firstName: true, lastName: true, groupId: true }, orderBy: { firstName: "asc" } }),
  ]);
  const options: AudienceOptions = { levels, groups, children };

  const list: NoticeListItem[] = notices.map((n) => {
    const total = n.recipients.length;
    const responded = n.recipients.filter((r) => r.response !== "PENDIENTE").length;
    const read = n.recipients.filter((r) => r.readAt).length;
    return {
      id: n.id,
      title: n.title,
      body: n.body,
      responseType: n.responseType as NoticeListItem["responseType"],
      audienceLabel: n.audienceScope === "GRUPO" && n.group ? `Grupo ${n.group.name}` : n.audienceScope,
      createdAtLabel: formatDateUTC(n.createdAt),
      dueAtLabel: n.dueAt ? formatDateUTC(n.dueAt) : null,
      total,
      responded,
      read,
      pending: total - responded,
      recipients: n.recipients.map((r) => ({
        id: r.id,
        familyName: r.guardian.name,
        childName: `${r.child.firstName} ${r.child.lastName}`,
        groupName: r.child.group.name,
        readAtLabel: r.readAt ? formatDateUTC(r.readAt) : null,
        response: r.response as "PENDIENTE" | "ENTERADO" | "AUTORIZO" | "NO_AUTORIZO",
      })),
    };
  });

  return (
    <main className="p-4 md:p-6 flex flex-col gap-4">
      <div>
        <p className="text-[13px] font-bold text-texto-3">Avisos y eventos</p>
        <h1 className="font-heading font-bold text-[26px] leading-tight text-ink">Comunicación con las familias</h1>
      </div>
      <NoticesAdmin notices={list} options={options} />
    </main>
  );
}
