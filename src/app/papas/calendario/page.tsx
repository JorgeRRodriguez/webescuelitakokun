import { requireRole } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { getActiveChildId } from "@/lib/activeChild";
import { CalendarioView, type EventItem } from "./CalendarioView";

export default async function CalendarioPage() {
  const session = await requireRole(["TUTOR"]);
  const childId = await getActiveChildId(session.user.childIds);
  if (!childId) return <div className="p-4">No tienes hijos vinculados a esta cuenta.</div>;

  const child = await prisma.child.findUnique({ where: { id: childId }, include: { group: true } });
  if (!child) return <div className="p-4">Alumno no encontrado.</div>;

  const events = await prisma.event.findMany({
    where: { OR: [{ audienceScope: "PLANTEL" }, { groupId: child.groupId }] },
    orderBy: { date: "asc" },
    include: { guardians: { where: { guardianId: session.user.id, childId } } },
  });

  const items: EventItem[] = events.map((e) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    type: e.type as EventItem["type"],
    dateIso: e.date.toISOString(),
    scope: e.audienceScope === "GRUPO" ? "grupo" : "escuela",
    rsvpRequired: e.rsvpRequired,
    reminder: e.guardians[0]?.reminder ?? false,
    rsvp: (e.guardians[0]?.rsvp as "ASISTIRE" | "NO_PODRE" | null) ?? null,
  }));

  return (
    <div className="p-4 flex flex-col gap-4">
      <h1 className="font-heading font-bold text-[26px] leading-tight text-ink">Calendario</h1>
      <CalendarioView events={items} childId={childId} />
    </div>
  );
}
