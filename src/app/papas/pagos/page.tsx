import { requireRole } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { getActiveChildId } from "@/lib/activeChild";
import { demoToday, formatDateUTC } from "@/lib/dates";
import { PagosView, type ChargeItem } from "./PagosView";

export default async function PagosPage() {
  const session = await requireRole(["TUTOR"]);
  const childId = await getActiveChildId(session.user.childIds);
  if (!childId) return <div className="p-4">No tienes hijos vinculados a esta cuenta.</div>;

  const child = await prisma.child.findUnique({ where: { id: childId } });
  if (!child) return <div className="p-4">Alumno no encontrado.</div>;

  const today = demoToday();
  const charges = await prisma.charge.findMany({
    where: { childId },
    include: { concept: true, allocations: { include: { payment: true } } },
    orderBy: { dueAt: "asc" },
  });

  const items: ChargeItem[] = charges.map((c) => {
    const payment = c.allocations[0]?.payment;
    return {
      id: c.id,
      conceptName: c.concept.name,
      period: c.period,
      amount: c.amount,
      dueAtLabel: formatDateUTC(c.dueAt),
      overdue: c.status === "PENDIENTE" && c.dueAt < today,
      status: c.status as ChargeItem["status"],
      paymentMethod: (payment?.method as ChargeItem["paymentMethod"]) ?? null,
      paymentDateLabel: payment ? formatDateUTC(payment.createdAt) : null,
    };
  });

  const pending = items.filter((i) => i.status === "PENDIENTE");
  const validation = items.filter((i) => i.status === "VALIDACION");
  const saldoPendiente = pending.reduce((s, i) => s + i.amount, 0);
  const enValidacion = validation.reduce((s, i) => s + i.amount, 0);
  const nextDue = pending[0]?.dueAtLabel ?? null;

  return (
    <div className="p-4 flex flex-col gap-4">
      <h1 className="font-heading font-bold text-[26px] leading-tight text-ink">Pagos</h1>
      <PagosView
        childName={child.firstName}
        saldoPendiente={saldoPendiente}
        enValidacion={enValidacion}
        nextDue={nextDue}
        items={items}
      />
    </div>
  );
}
