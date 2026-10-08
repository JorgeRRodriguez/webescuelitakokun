import { requireRole } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { demoToday } from "@/lib/dates";
import { CapturaForm } from "./CapturaForm";

export default async function CapturaPage() {
  const session = await requireRole(["DOCENTE"]);
  const groupId = session.user.groupIds[0];
  const today = demoToday();

  if (!groupId) return <main className="p-6">No tienes un grupo asignado.</main>;

  const children = await prisma.child.findMany({
    where: { groupId, attendances: { some: { date: today, status: "PRESENTE" } } },
    orderBy: { firstName: "asc" },
    select: { id: true, firstName: true, lastName: true, avatarColor: true },
  });

  return (
    <main className="p-4 md:p-6 max-w-4xl flex flex-col gap-5">
      <div>
        <p className="text-[13px] font-bold text-texto-3">Captura rápida</p>
        <h1 className="font-heading font-bold text-[26px] leading-tight text-ink">
          Registra el día para todo el grupo
        </h1>
      </div>
      {children.length === 0 ? (
        <p className="text-sm text-texto-3">
          Aún no hay alumnos presentes registrados hoy. Ve a{" "}
          <span className="font-bold">Mi grupo</span> para registrar entradas.
        </p>
      ) : (
        <CapturaForm students={children} />
      )}
    </main>
  );
}
