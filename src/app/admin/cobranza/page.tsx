import { requireRole } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { demoToday } from "@/lib/dates";
import { CobranzaAdmin, type FamilyRow } from "./CobranzaAdmin";

export default async function CobranzaPage() {
  await requireRole(["ADMIN", "DIRECCION", "RECEPCION"]);
  const today = demoToday();
  const monthStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
  const monthEnd = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 1));

  const [concepts, levels, groups, children, charges, paymentsThisMonth] = await Promise.all([
    prisma.concept.findMany({ orderBy: { key: "asc" } }),
    prisma.level.findMany({ select: { id: true, name: true } }),
    prisma.group.findMany({ select: { id: true, name: true, levelId: true } }),
    prisma.child.findMany({ select: { id: true, firstName: true, lastName: true }, orderBy: { firstName: "asc" } }),
    prisma.charge.findMany({ include: { child: true, concept: true } }),
    prisma.payment.findMany({ where: { status: "CONFIRMADO", createdAt: { gte: monthStart, lt: monthEnd } } }),
  ]);

  let porCobrar = 0;
  let vencido = 0;
  let enValidacion = 0;
  const byChild = new Map<string, FamilyRow>();

  for (const c of charges) {
    if (c.status === "PENDIENTE") {
      porCobrar += c.amount;
      if (c.dueAt < today) vencido += c.amount;
    }
    if (c.status === "VALIDACION") enValidacion += c.amount;

    const row = byChild.get(c.childId) ?? {
      childId: c.childId,
      childName: `${c.child.firstName} ${c.child.lastName}`,
      porCobrar: 0,
      vencido: 0,
      enValidacion: 0,
    };
    if (c.status === "PENDIENTE") {
      row.porCobrar += c.amount;
      if (c.dueAt < today) row.vencido += c.amount;
    }
    if (c.status === "VALIDACION") row.enValidacion += c.amount;
    byChild.set(c.childId, row);
  }

  const cobradoMes = paymentsThisMonth.reduce((sum, p) => sum + p.amount, 0);

  return (
    <main className="p-4 md:p-6 flex flex-col gap-4">
      <div>
        <p className="text-[13px] font-bold text-texto-3">Cobranza</p>
        <h1 className="font-heading font-bold text-[26px] leading-tight text-ink">Estado de cobranza</h1>
      </div>
      <CobranzaAdmin
        kpis={{ porCobrar, vencido, enValidacion, cobradoMes }}
        rows={[...byChild.values()].filter((r) => r.porCobrar > 0 || r.enValidacion > 0).sort((a, b) => b.porCobrar - a.porCobrar)}
        concepts={concepts}
        levels={levels}
        groups={groups}
        students={children}
      />
    </main>
  );
}
