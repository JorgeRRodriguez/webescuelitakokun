import { requireRole } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { getActiveChildId } from "@/lib/activeChild";
import { demoToday, ageFromBirthDateUTC } from "@/lib/dates";
import { MiHijoView } from "./MiHijoView";

export default async function MiHijoPage() {
  const session = await requireRole(["TUTOR"]);
  const childId = await getActiveChildId(session.user.childIds);
  if (!childId) return <div className="p-4">No tienes hijos vinculados a esta cuenta.</div>;

  const child = await prisma.child.findUnique({
    where: { id: childId },
    include: {
      emergencyContacts: true,
      guardians: { include: { guardian: true } },
      group: { include: { level: true, routine: { orderBy: { order: "asc" } }, children: true, staff: { include: { staff: true } } } },
    },
  });
  if (!child) return <div className="p-4">Alumno no encontrado.</div>;

  const specialists = await prisma.staffAssignment.findMany({
    where: { groupId: null },
    include: { staff: true },
  });

  const teachers = [...child.group.staff, ...specialists].map((a) => ({
    name: a.staff.name,
    roleLabel: a.roleLabel,
    bio: a.staff.bio,
    attentionHours: a.staff.attentionHours,
    avatarColor: a.staff.avatarColor,
    isSpecialist: a.roleLabel !== "Titular" && a.roleLabel !== "Auxiliar",
  }));

  const classmates = child.group.children
    .filter((c) => c.id !== child.id)
    .map((c) => ({ firstName: c.firstName, avatarColor: c.avatarColor, photoVisibility: c.photoVisibility }));

  const family = child.guardians.map((g) => ({
    childGuardianId: g.id,
    name: g.guardian.name,
    relationshipLabel: g.guardian.relationshipLabel,
    isPrimary: g.isPrimary,
    receivesComms: g.receivesComms,
    canPickUp: g.canPickUp,
    canPay: g.canPay,
  }));

  const data = {
    child: {
      firstName: child.firstName,
      lastName: child.lastName,
      birthDateLabel: new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(child.birthDate),
      ageLabel: ageFromBirthDateUTC(child.birthDate, demoToday()),
      allergySevere: child.allergySevere,
      allergyDetail: child.allergyDetail,
      feedingNotes: child.feedingNotes,
      sleepNotes: child.sleepNotes,
      likes: child.likes,
      adaptationNotes: child.adaptationNotes,
      avatarColor: child.avatarColor,
    },
    emergencyContacts: child.emergencyContacts,
    group: {
      levelName: child.group.level.name,
      name: child.group.name,
      room: child.group.room,
      schedule: child.group.schedule,
      project: child.group.project,
      routine: child.group.routine.map((r) => ({ time: r.time, activity: r.activity })),
    },
    classmates,
    teachers,
    family,
  };

  return (
    <div className="p-4 flex flex-col gap-4">
      <h1 className="font-heading font-bold text-[26px] leading-tight text-ink">Mi hijo</h1>
      <MiHijoView data={data} />
    </div>
  );
}
