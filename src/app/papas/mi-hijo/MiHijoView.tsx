"use client";

import { useState, useTransition } from "react";
import { Segmented } from "@/components/Segmented";
import { Avatar } from "@/components/Avatar";
import { useToast } from "@/components/Toast";
import { togglePermission, addFamilyMember } from "./actions";

type Data = {
  childId: string;
  child: {
    firstName: string;
    lastName: string;
    birthDateLabel: string;
    ageLabel: string;
    allergySevere: boolean;
    allergyDetail: string | null;
    feedingNotes: string | null;
    sleepNotes: string | null;
    likes: string | null;
    adaptationNotes: string | null;
    avatarColor: string;
  };
  emergencyContacts: { name: string; relationship: string; phone: string }[];
  group: { levelName: string; name: string; room: string; schedule: string; project: string; routine: { time: string; activity: string }[] };
  classmates: { firstName: string; avatarColor: string; photoVisibility: boolean }[];
  teachers: { name: string; roleLabel: string; bio: string | null; attentionHours: string | null; avatarColor: string; isSpecialist: boolean }[];
  family: {
    childGuardianId: string;
    name: string;
    relationshipLabel: string;
    isPrimary: boolean;
    receivesComms: boolean;
    canPickUp: boolean;
    canPay: boolean;
  }[];
};

const TABS = [
  { value: "profesores", label: "Profesores" },
  { value: "grupo", label: "Grupo" },
  { value: "perfil", label: "Perfil" },
  { value: "familia", label: "Familia" },
] as const;
type Tab = (typeof TABS)[number]["value"];

export function MiHijoView({ data }: { data: Data }) {
  const [tab, setTab] = useState<Tab>("profesores");
  const [addOpen, setAddOpen] = useState(false);
  const { showToast } = useToast();

  return (
    <div className="flex flex-col gap-4">
      <Segmented options={TABS as unknown as { value: Tab; label: string }[]} value={tab} onChange={setTab} />

      {tab === "profesores" && (
        <div className="flex flex-col gap-3">
          {data.teachers
            .filter((t) => !t.isSpecialist)
            .map((t, i) => (
              <div key={i} className="rounded-card bg-white border border-borde-card p-3.5 flex gap-3">
                <Avatar name={t.name} color={t.avatarColor} size={56} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-extrabold">{t.name}</p>
                  <p className="text-xs font-bold" style={{ color: t.avatarColor }}>
                    {t.roleLabel}
                  </p>
                  {t.bio && <p className="text-xs text-texto-2 mt-1">{t.bio}</p>}
                  {t.attentionHours && <p className="text-[11px] text-texto-3 mt-1">Atención: {t.attentionHours}</p>}
                  <button
                    onClick={() => showToast("La mensajería privada estará disponible próximamente")}
                    className="mt-2 rounded-pill border border-borde-input text-xs font-extrabold px-3 py-1.5 text-texto-2"
                  >
                    Escribir
                  </button>
                </div>
              </div>
            ))}

          {data.teachers.some((t) => t.isSpecialist) && (
            <div>
              <p className="text-[11px] font-extrabold uppercase text-texto-3 mb-2">Actividades especiales</p>
              <div className="grid grid-cols-2 gap-2">
                {data.teachers
                  .filter((t) => t.isSpecialist)
                  .map((t, i) => (
                    <div key={i} className="rounded-card bg-white border border-borde-card p-3 flex flex-col items-center text-center gap-1.5">
                      <Avatar name={t.name} color={t.avatarColor} size={44} />
                      <p className="text-xs font-extrabold">{t.name}</p>
                      <p className="text-[11px] font-bold" style={{ color: t.avatarColor }}>
                        {t.roleLabel}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "grupo" && (
        <div className="flex flex-col gap-4">
          <div className="rounded-card bg-teal text-white p-4">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.04em] opacity-90">
              {data.group.levelName} · {data.group.room}
            </p>
            <p className="font-heading font-bold text-2xl">{data.group.name}</p>
            <p className="text-sm mt-1 opacity-95">{data.group.project}</p>
          </div>

          <div>
            <p className="text-[11px] font-extrabold uppercase text-texto-3 mb-2">Rutina diaria</p>
            <div className="rounded-card bg-white border border-borde-card divide-y divide-divisor">
              {data.group.routine.map((r, i) => (
                <div key={i} className="grid grid-cols-[70px_1fr] px-3 py-2 text-sm">
                  <span className="font-bold text-texto-3">{r.time}</span>
                  <span>{r.activity}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-extrabold uppercase text-texto-3 mb-2">Compañeros</p>
            <div className="grid grid-cols-4 gap-2">
              {data.classmates.map((c, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <Avatar name={c.firstName} color={c.photoVisibility ? c.avatarColor : "#A894A3"} size={44} rounded="rounded-full" />
                  <p className="text-[11px] font-bold text-center">{c.firstName}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "perfil" && (
        <div className="flex flex-col gap-4">
          <div className="rounded-card bg-white border border-borde-card p-4 flex items-center gap-3">
            <Avatar name={`${data.child.firstName} ${data.child.lastName}`} color={data.child.avatarColor} size={64} />
            <div>
              <p className="font-heading font-bold text-lg">
                {data.child.firstName} {data.child.lastName}
              </p>
              <p className="text-xs text-texto-3">
                {data.child.birthDateLabel} · {data.child.ageLabel}
              </p>
            </div>
          </div>

          {data.child.allergySevere && (
            <div className="rounded-card bg-rojo-50 border border-rojo/30 p-3.5">
              <p className="text-[11px] font-extrabold uppercase text-rojo-text mb-1">Alergia severa</p>
              <p className="text-sm text-rojo-text">{data.child.allergyDetail}</p>
            </div>
          )}

          <div className="rounded-card bg-white border border-borde-card divide-y divide-divisor">
            {data.child.feedingNotes && (
              <div className="p-3.5">
                <p className="text-[11px] font-extrabold uppercase text-texto-3">Alimentación</p>
                <p className="text-sm mt-0.5">{data.child.feedingNotes}</p>
              </div>
            )}
            {data.child.sleepNotes && (
              <div className="p-3.5">
                <p className="text-[11px] font-extrabold uppercase text-texto-3">Para dormir</p>
                <p className="text-sm mt-0.5">{data.child.sleepNotes}</p>
              </div>
            )}
            {data.child.likes && (
              <div className="p-3.5">
                <p className="text-[11px] font-extrabold uppercase text-texto-3">Le gusta</p>
                <p className="text-sm mt-0.5">{data.child.likes}</p>
              </div>
            )}
            {data.child.adaptationNotes && (
              <div className="p-3.5">
                <p className="text-[11px] font-extrabold uppercase text-texto-3">Adaptación</p>
                <p className="text-sm mt-0.5">{data.child.adaptationNotes}</p>
              </div>
            )}
          </div>

          {data.emergencyContacts.length > 0 && (
            <div>
              <p className="text-[11px] font-extrabold uppercase text-texto-3 mb-2">Contactos de emergencia</p>
              <div className="rounded-card bg-white border border-borde-card divide-y divide-divisor">
                {data.emergencyContacts.map((c, i) => (
                  <div key={i} className="p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold">{c.name}</p>
                      <p className="text-[11px] text-texto-3">{c.relationship}</p>
                    </div>
                    <span className="text-sm text-texto-2">{c.phone}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "familia" && (
        <div className="flex flex-col gap-3">
          {data.family.map((f) => (
            <FamilyCard key={f.childGuardianId} f={f} />
          ))}

          <button
            onClick={() => setAddOpen((o) => !o)}
            className="self-start rounded-pill bg-magenta text-white font-extrabold text-sm px-4 py-2.5"
          >
            {addOpen ? "Cancelar" : "+ Agregar persona"}
          </button>

          {addOpen && <AddFamilyMemberForm childId={data.childId} onDone={() => setAddOpen(false)} />}

          <p className="text-[11px] text-texto-4">Recepción verifica identificación oficial al entregar.</p>
        </div>
      )}
    </div>
  );
}

function FamilyCard({
  f,
}: {
  f: Data["family"][number];
}) {
  const { showToast } = useToast();
  const [state, setState] = useState({ receivesComms: f.receivesComms, canPickUp: f.canPickUp, canPay: f.canPay });

  function toggle(field: "receivesComms" | "canPickUp" | "canPay") {
    if (f.isPrimary) {
      showToast("La tutora o tutor principal no puede perder permisos");
      return;
    }
    const next = !state[field];
    setState((s) => ({ ...s, [field]: next }));
    togglePermission(f.childGuardianId, field, next).catch(() => {
      setState((s) => ({ ...s, [field]: !next }));
      showToast("No se pudo actualizar el permiso");
    });
  }

  const chips: { key: "receivesComms" | "canPickUp" | "canPay"; label: string }[] = [
    { key: "receivesComms", label: "Comunicaciones" },
    { key: "canPickUp", label: "Puede recoger" },
    { key: "canPay", label: "Pagos" },
  ];

  return (
    <div className="rounded-card bg-white border border-borde-card p-3.5 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-extrabold">{f.name}</p>
          <p className="text-[11px] text-texto-3">
            {f.relationshipLabel}
            {f.isPrimary ? " · Tutora principal" : ""}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {chips.map((c) => {
          const active = f.isPrimary ? true : state[c.key];
          return (
            <button
              key={c.key}
              onClick={() => toggle(c.key)}
              className={`rounded-pill px-2.5 py-1 text-[11px] font-extrabold border ${
                active ? "bg-verde-50 border-verde/40 text-verde-text" : "bg-track border-transparent text-texto-4"
              }`}
            >
              {active ? "✓ " : ""}
              {c.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AddFamilyMemberForm({ childId, onDone }: { childId: string; onDone: () => void }) {
  const [name, setName] = useState("");
  const [relationshipLabel, setRelationshipLabel] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [receivesComms, setReceivesComms] = useState(true);
  const [canPickUp, setCanPickUp] = useState(false);
  const [canPay, setCanPay] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const { showToast } = useToast();

  const atLeastOnePermission = receivesComms || canPickUp || canPay;
  const isValid = name.trim() !== "" && relationshipLabel.trim() !== "" && email.trim() !== "" && atLeastOnePermission;

  function submit() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await addFamilyMember(childId, { name, relationshipLabel, email, phone, receivesComms, canPickUp, canPay });
        showToast(
          result.isNewAccount
            ? `Agregado. Puede entrar con ${result.email} y contraseña kokun2026`
            : "Persona vinculada a este alumno"
        );
        onDone();
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo agregar a esta persona.");
      }
    });
  }

  const chips: { key: "receivesComms" | "canPickUp" | "canPay"; label: string; value: boolean; set: (v: boolean) => void }[] = [
    { key: "receivesComms", label: "Comunicaciones", value: receivesComms, set: setReceivesComms },
    { key: "canPickUp", label: "Puede recoger", value: canPickUp, set: setCanPickUp },
    { key: "canPay", label: "Pagos", value: canPay, set: setCanPay },
  ];

  return (
    <div className="rounded-card bg-white border-2 border-magenta p-4 flex flex-col gap-3">
      <h2 className="font-heading font-bold text-lg">Agregar persona</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-extrabold uppercase text-texto-3">Nombre</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre completo" className="rounded-[10px] border border-borde-input px-3 py-2 text-sm" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-extrabold uppercase text-texto-3">Parentesco</span>
          <input value={relationshipLabel} onChange={(e) => setRelationshipLabel(e.target.value)} placeholder="Abuela, niñera…" className="rounded-[10px] border border-borde-input px-3 py-2 text-sm" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-extrabold uppercase text-texto-3">Correo</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@ejemplo.com" className="rounded-[10px] border border-borde-input px-3 py-2 text-sm" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-extrabold uppercase text-texto-3">Teléfono (opcional)</span>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="55 1234 5678" className="rounded-[10px] border border-borde-input px-3 py-2 text-sm" />
        </label>
      </div>

      <div>
        <p className="text-[11px] font-extrabold uppercase text-texto-3 mb-1.5">¿De qué se encargará?</p>
        <div className="flex flex-wrap gap-1.5">
          {chips.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => c.set(!c.value)}
              className={`rounded-pill px-2.5 py-1 text-[11px] font-extrabold border ${
                c.value ? "bg-verde-50 border-verde/40 text-verde-text" : "bg-track border-transparent text-texto-4"
              }`}
            >
              {c.value ? "✓ " : ""}
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-xs font-bold text-rojo-text">{error}</p>}

      <div className="flex gap-2">
        <button onClick={onDone} className="rounded-pill border border-borde-input text-sm font-extrabold px-4 py-2.5 text-texto-2">
          Cancelar
        </button>
        <button
          onClick={submit}
          disabled={pending || !isValid}
          className="rounded-pill bg-magenta text-white font-extrabold text-sm px-5 py-2.5 disabled:opacity-45"
        >
          Agregar
        </button>
      </div>
    </div>
  );
}
