import { requireRole } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { demoToday, formatTimeLocal } from "@/lib/dates";
import { Avatar } from "@/components/Avatar";
import { AttendanceControl } from "./AttendanceControl";

export default async function MiGrupoPage() {
  const session = await requireRole(["DOCENTE"]);
  const groupId = session.user.groupIds[0];
  const today = demoToday();

  if (!groupId) {
    return <main className="p-6">No tienes un grupo asignado.</main>;
  }

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      level: true,
      children: {
        orderBy: { firstName: "asc" },
        include: {
          attendances: { where: { date: today } },
          guardians: { include: { guardian: true } },
        },
      },
    },
  });

  if (!group) return <main className="p-6">Grupo no encontrado.</main>;

  const presentes = group.children.filter((c) => c.attendances[0]?.status === "PRESENTE").length;
  const ausentes = group.children.filter((c) => c.attendances[0]?.status === "AUSENTE").length;
  const sinRegistro = group.children.length - presentes - ausentes;

  const pendingRecipients = await prisma.noticeRecipient.findMany({
    where: {
      response: "PENDIENTE",
      child: { groupId },
      notice: { OR: [{ dueAt: null }, { dueAt: { gte: today } }] },
    },
    include: { notice: true, guardian: true, child: true },
  });
  const pendingByNotice = new Map<string, { title: string; names: Set<string> }>();
  for (const r of pendingRecipients) {
    const entry = pendingByNotice.get(r.noticeId) ?? { title: r.notice.title, names: new Set<string>() };
    entry.names.add(`${r.child.firstName} ${r.child.lastName}`);
    pendingByNotice.set(r.noticeId, entry);
  }

  return (
    <main className="p-4 md:p-6 flex flex-col gap-5 max-w-5xl">
      <div>
        <p className="text-[13px] font-bold text-texto-3">
          {group.level.name} · {group.room} · {group.schedule}
        </p>
        <h1 className="font-heading font-bold text-[28px] leading-tight text-ink">{group.name}</h1>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-card bg-verde-50 border border-borde-card p-3 text-center">
          <p className="font-heading font-bold text-2xl text-verde-text">{presentes}</p>
          <p className="text-[11px] font-extrabold text-verde-text uppercase tracking-[0.04em]">Presentes</p>
        </div>
        <div className="rounded-card bg-rojo-50 border border-borde-card p-3 text-center">
          <p className="font-heading font-bold text-2xl text-rojo-text">{ausentes}</p>
          <p className="text-[11px] font-extrabold text-rojo-text uppercase tracking-[0.04em]">Ausentes</p>
        </div>
        <div className="rounded-card bg-track border border-borde-card p-3 text-center">
          <p className="font-heading font-bold text-2xl text-texto-2">{sinRegistro}</p>
          <p className="text-[11px] font-extrabold text-texto-2 uppercase tracking-[0.04em]">Sin registro</p>
        </div>
      </div>

      {[...pendingByNotice.values()].map((n) => (
        <div key={n.title} className="rounded-card-sm bg-amarillo-50 border border-amarillo/40 px-3 py-2 text-[13px]">
          <span className="font-extrabold text-amarillo-text">{n.title}: </span>
          <span className="text-texto-2">faltan {n.names.size} familias por responder — {[...n.names].join(", ")}</span>
        </div>
      ))}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {group.children.map((child) => {
          const att = child.attendances[0];
          const primaryGuardian = child.guardians.find((g) => g.isPrimary)?.guardian;
          return (
            <div key={child.id} className="rounded-card bg-white border border-borde-card p-3 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Avatar name={`${child.firstName} ${child.lastName}`} color={child.avatarColor} size={42} />
                <div className="min-w-0">
                  <p className="text-sm font-extrabold truncate">{child.firstName}</p>
                  <p className="text-[11px] text-texto-3 truncate">{child.lastName}</p>
                </div>
              </div>
              {child.allergySevere && (
                <span className="self-start rounded-pill bg-rojo-50 text-rojo-text text-[10px] font-extrabold px-2 py-0.5">
                  Alergia
                </span>
              )}
              <AttendanceControl
                childId={child.id}
                status={(att?.status as "PRESENTE" | "AUSENTE" | undefined) ?? null}
                checkInTime={att?.checkInTime ? formatTimeLocal(att.checkInTime) : null}
                checkInBy={att?.checkInBy ?? primaryGuardian?.relationshipLabel ?? null}
              />
            </div>
          );
        })}
      </div>
    </main>
  );
}
