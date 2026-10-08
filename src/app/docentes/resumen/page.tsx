import { requireRole } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { demoToday, formatTimeLocal } from "@/lib/dates";
import { ResumenView, type ChildSummaryData } from "./ResumenView";

export default async function ResumenPage() {
  const session = await requireRole(["DOCENTE"]);
  const groupId = session.user.groupIds[0];
  const today = demoToday();

  if (!groupId) return <main className="p-6">No tienes un grupo asignado.</main>;

  const children = await prisma.child.findMany({
    where: { groupId, attendances: { some: { date: today, status: "PRESENTE" } } },
    orderBy: { firstName: "asc" },
    include: {
      dailyEntries: { where: { date: today } },
      dailySummaries: { where: { date: today } },
    },
  });

  const data: ChildSummaryData[] = children.map((c) => {
    const summary = c.dailySummaries[0];
    const meals = c.dailyEntries.filter((e) => e.type === "COMIDA");
    const naps = c.dailyEntries.filter((e) => e.type === "SIESTA");
    const diapers = c.dailyEntries.filter((e) => e.type === "PANIAL");
    const activities = c.dailyEntries.filter((e) => e.type === "ACTIVIDAD");

    let siestaMinutes: number | null = null;
    let siestaRange: string | null = null;
    const nap = naps[0];
    if (nap?.startTime && nap?.endTime) {
      siestaMinutes = Math.round((nap.endTime.getTime() - nap.startTime.getTime()) / 60000);
      siestaRange = `${formatTimeLocal(nap.startTime)} – ${formatTimeLocal(nap.endTime)}`;
    }

    return {
      id: c.id,
      firstName: c.firstName,
      lastName: c.lastName,
      avatarColor: c.avatarColor,
      status: (summary?.status ?? "SIN_REGISTROS") as ChildSummaryData["status"],
      mood: summary?.mood ?? null,
      note: summary?.note ?? "",
      materialsForTomorrow: summary?.materialsForTomorrow ?? "",
      sentAt: summary?.sentAt ? formatTimeLocal(summary.sentAt) : null,
      readAt: summary?.readAt ? formatTimeLocal(summary.readAt) : null,
      mealsCount: meals.length,
      lastMeal: meals.length ? meals[meals.length - 1].title : null,
      siestaMinutes,
      siestaRange,
      diaperCount: diapers.length,
      activities: activities.map((a) => ({ title: a.title, detail: a.detail })),
    };
  });

  return (
    <main className="p-4 md:p-6 flex flex-col gap-4 h-full">
      <div>
        <p className="text-[13px] font-bold text-texto-3">Resumen del día</p>
        <h1 className="font-heading font-bold text-[26px] leading-tight text-ink">
          Revisa y envía el resumen de cada alumno
        </h1>
      </div>
      <ResumenView data={data} />
    </main>
  );
}
