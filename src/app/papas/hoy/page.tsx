import { requireRole } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { getActiveChildId } from "@/lib/activeChild";
import { demoToday, formatTimeLocal, formatDateUTC } from "@/lib/dates";
import { DAILY_ENTRY_TYPE_LABEL, DAILY_ENTRY_TYPE_COLOR } from "@/lib/enums";
import { NoticeCard, type NoticeCardData } from "./NoticeCard";
import { SummaryTrigger, type SummaryData } from "./SummarySheet";

export default async function HoyPage() {
  const session = await requireRole(["TUTOR"]);
  const today = demoToday();
  const childId = await getActiveChildId(session.user.childIds);

  if (!childId) {
    return <div className="p-4">No tienes hijos vinculados a esta cuenta.</div>;
  }

  const child = await prisma.child.findUnique({
    where: { id: childId },
    include: {
      attendances: { where: { date: today } },
      dailyEntries: { where: { date: today }, orderBy: { time: "desc" } },
      dailySummaries: { where: { date: today } },
    },
  });
  if (!child) return <div className="p-4">Alumno no encontrado.</div>;

  const noticeRecipients = await prisma.noticeRecipient.findMany({
    where: { childId, guardianId: session.user.id },
    include: { notice: { include: { author: true } } },
  });
  const notices: NoticeCardData[] = noticeRecipients
    .sort((a, b) => {
      if ((a.response === "PENDIENTE") !== (b.response === "PENDIENTE")) {
        return a.response === "PENDIENTE" ? -1 : 1;
      }
      return b.notice.createdAt.getTime() - a.notice.createdAt.getTime();
    })
    .map((r) => ({
      noticeId: r.noticeId,
      childId,
      title: r.notice.title,
      body: r.notice.body,
      responseType: r.notice.responseType as NoticeCardData["responseType"],
      dueAt: r.notice.dueAt ? formatDateUTC(r.notice.dueAt) : null,
      author: r.notice.author.name,
      createdAt: formatDateUTC(r.notice.createdAt),
      readAt: r.readAt,
      response: r.response as NoticeCardData["response"],
      respondedAt: r.respondedAt ? formatTimeLocal(r.respondedAt) : null,
    }));

  const attendance = child.attendances[0];
  const meals = child.dailyEntries.filter((e) => e.type === "COMIDA");
  const naps = child.dailyEntries.filter((e) => e.type === "SIESTA");
  const diapers = child.dailyEntries.filter((e) => e.type === "PANIAL");
  const summary = child.dailySummaries[0];

  let siestaLabel = "—";
  const nap = naps[0];
  if (nap?.startTime && nap?.endTime) {
    const minutes = Math.round((nap.endTime.getTime() - nap.startTime.getTime()) / 60000);
    siestaLabel = `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}`;
  }

  const summaryData: SummaryData | null = summary?.sentAt
    ? {
        childId,
        childName: child.firstName,
        dateLabel: formatDateUTC(today).toUpperCase(),
        dateIso: today.toISOString(),
        mood: summary.mood,
        mealsCount: meals.length,
        siestaLabel,
        diaperCount: diapers.length,
        activities: child.dailyEntries
          .filter((e) => e.type === "ACTIVIDAD")
          .map((a) => ({ title: a.title, detail: a.detail })),
        note: summary.note,
        materialsForTomorrow: summary.materialsForTomorrow,
        alreadyViewed: !!summary.readAt,
      }
    : null;

  return (
    <div className="flex flex-col gap-4 p-4 lg:grid lg:grid-cols-[1fr_320px] lg:items-start lg:gap-6">
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-[13px] font-bold text-texto-3">
            {new Intl.DateTimeFormat("es-MX", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(today)}
          </p>
          <h1 className="font-heading font-bold text-[28px] leading-tight text-ink">Hola, {session.user.name?.split(" ")[0]}</h1>
        </div>

        <div className="rounded-card bg-white border border-borde-card p-3.5 flex items-center gap-2.5">
          <span
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              attendance?.status === "PRESENTE" ? "bg-verde" : attendance?.status === "AUSENTE" ? "bg-rojo" : "bg-texto-4"
            }`}
          />
          <div>
            <p className="text-sm font-extrabold">
              {child.firstName}{" "}
              {attendance?.status === "PRESENTE"
                ? "está en la escuela"
                : attendance?.status === "AUSENTE"
                  ? "está marcada/o como ausente hoy"
                  : "aún no tiene registro de entrada"}
            </p>
            {attendance?.status === "PRESENTE" && attendance.checkInTime && (
              <p className="text-[11px] text-texto-3">
                Llegó a las {formatTimeLocal(attendance.checkInTime)} · la entregó {attendance.checkInBy}
              </p>
            )}
          </div>
        </div>

        {notices.length > 0 && (
          <div className="flex flex-col gap-2">
            {notices.map((n) => (
              <NoticeCard key={n.noticeId} data={n} />
            ))}
          </div>
        )}

        {summaryData && <SummaryTrigger data={summaryData} />}
      </div>

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-card bg-naranja-50 p-3 text-center">
            <p className="font-heading font-bold text-xl text-naranja-text">{meals.length}</p>
            <p className="text-[10px] font-extrabold text-naranja-text uppercase">
              {meals[0] ? meals[0].title : "Comidas"}
            </p>
          </div>
          <div className="rounded-card bg-teal-50 p-3 text-center">
            <p className="font-heading font-bold text-xl text-teal-text">{siestaLabel}</p>
            <p className="text-[10px] font-extrabold text-teal-text uppercase">Siesta</p>
          </div>
          <div className="rounded-card bg-morado-50 p-3 text-center">
            <p className="font-heading font-bold text-xl text-morado-text">{diapers.length}</p>
            <p className="text-[10px] font-extrabold text-morado-text uppercase">Pañal</p>
          </div>
        </div>

        <div>
          <h2 className="font-heading font-bold text-lg mb-2">Su día</h2>
          <div className="flex flex-col">
            {child.dailyEntries.length === 0 && (
              <p className="text-sm text-texto-3">Aún no hay registros de hoy.</p>
            )}
            {child.dailyEntries.map((entry) => {
              const color = DAILY_ENTRY_TYPE_COLOR[entry.type as keyof typeof DAILY_ENTRY_TYPE_COLOR];
              return (
                <div key={entry.id} className="flex gap-3">
                  <div className="flex flex-col items-center w-10 shrink-0">
                    <span className="text-[11px] text-texto-3 pt-1">{formatTimeLocal(entry.time)}</span>
                    <span className={`w-3 h-3 rounded-full mt-1 ${color.solid}`} />
                    <span className="flex-1 w-0.5 bg-divisor" />
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="rounded-card bg-white border border-borde-card p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-extrabold">{entry.title}</p>
                        <span className={`text-[10px] font-extrabold uppercase ${color.text}`}>
                          {DAILY_ENTRY_TYPE_LABEL[entry.type as keyof typeof DAILY_ENTRY_TYPE_LABEL]}
                        </span>
                      </div>
                      {entry.detail && <p className="text-xs text-texto-2 mt-1">{entry.detail}</p>}
                      {entry.exceptionValue && (
                        <p className="text-xs text-texto-3 mt-1">Registrado: {entry.exceptionValue}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
