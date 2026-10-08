import { requireRole } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { formatDateUTC } from "@/lib/dates";
import { ConciliacionAdmin, type PaymentRow } from "./ConciliacionAdmin";

export default async function ConciliacionPage() {
  await requireRole(["ADMIN", "DIRECCION", "RECEPCION"]);

  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      guardian: true,
      allocations: { include: { charge: { include: { child: true, concept: true } } } },
    },
  });

  const rows: PaymentRow[] = payments.map((p) => ({
    id: p.id,
    dateLabel: formatDateUTC(p.createdAt),
    familyName: p.guardian.name,
    appliesTo: p.allocations.map((a) => `${a.charge.concept.name} (${a.charge.child.firstName})`).join(", "),
    method: p.method as PaymentRow["method"],
    reference: p.reference,
    amount: p.amount,
    status: p.status as PaymentRow["status"],
    folio: p.folio,
  }));

  return (
    <main className="p-4 md:p-6 flex flex-col gap-4">
      <div>
        <p className="text-[13px] font-bold text-texto-3">Conciliación</p>
        <h1 className="font-heading font-bold text-[26px] leading-tight text-ink">Pagos y validaciones</h1>
      </div>
      <ConciliacionAdmin rows={rows} />
    </main>
  );
}
