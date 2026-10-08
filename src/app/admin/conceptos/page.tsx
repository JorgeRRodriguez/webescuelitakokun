import { requireRole } from "@/lib/guards";
import { prisma } from "@/lib/prisma";

function money(n: number) {
  return n.toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });
}

export default async function ConceptosPage() {
  await requireRole(["ADMIN", "DIRECCION", "RECEPCION"]);
  const concepts = await prisma.concept.findMany({ orderBy: { key: "asc" } });

  return (
    <main className="p-4 md:p-6 flex flex-col gap-4">
      <div>
        <p className="text-[13px] font-bold text-texto-3">Conceptos de cobro</p>
        <h1 className="font-heading font-bold text-[26px] leading-tight text-ink">Catálogo de conceptos</h1>
      </div>

      <div className="rounded-card bg-white border border-borde-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] font-extrabold uppercase text-texto-3 bg-magenta-25">
              <th className="px-3 py-2.5">Clave</th>
              <th className="px-3 py-2.5">Concepto</th>
              <th className="px-3 py-2.5">Importe</th>
              <th className="px-3 py-2.5">Periodicidad</th>
              <th className="px-3 py-2.5">Vencimiento</th>
              <th className="px-3 py-2.5">Cálculo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-divisor">
            {concepts.map((c) => (
              <tr key={c.id}>
                <td className="px-3 py-2.5 font-extrabold text-magenta">{c.key}</td>
                <td className="px-3 py-2.5 font-bold">{c.name}</td>
                <td className="px-3 py-2.5">{money(c.amount)} / {c.unit}</td>
                <td className="px-3 py-2.5 text-texto-2">{c.periodicity}</td>
                <td className="px-3 py-2.5 text-texto-3">{c.dueRule ?? "—"}</td>
                <td className="px-3 py-2.5 text-texto-3">{c.calculation ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-texto-4">Cambiar un importe solo afecta cargos futuros.</p>
    </main>
  );
}
