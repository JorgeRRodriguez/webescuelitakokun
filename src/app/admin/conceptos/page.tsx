import { requireRole } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { ConceptosAdmin } from "./ConceptosAdmin";

export default async function ConceptosPage() {
  const session = await requireRole(["ADMIN", "DIRECCION", "RECEPCION"]);
  const concepts = await prisma.concept.findMany({ orderBy: { key: "asc" } });
  const canEdit = session.user.role === "ADMIN" || session.user.role === "DIRECCION";

  return (
    <main className="p-4 md:p-6 flex flex-col gap-4">
      <div>
        <p className="text-[13px] font-bold text-texto-3">Conceptos de cobro</p>
        <h1 className="font-heading font-bold text-[26px] leading-tight text-ink">Catálogo de conceptos</h1>
      </div>

      <ConceptosAdmin concepts={concepts} canEdit={canEdit} />
    </main>
  );
}
