"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";

const DEMO_ACCOUNTS = [
  { label: "Tutora (varios hijos)", email: "mariana.lopez@example.com", color: "bg-magenta-50 text-magenta" },
  { label: "Docente (Colibríes)", email: "ana.torres@kokun.mx", color: "bg-teal-50 text-teal-text" },
  { label: "Dirección", email: "direccion@kokun.mx", color: "bg-amarillo-50 text-amarillo-text" },
  { label: "Administración", email: "administracion@kokun.mx", color: "bg-verde-50 text-verde-text" },
];

export function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(loginAction, undefined);

  return (
    <div className="w-full max-w-sm">
      <form action={formAction} className="flex flex-col gap-3 bg-white rounded-card border border-borde-card p-6">
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.04em] text-texto-3">Correo</span>
          <input
            name="email"
            type="email"
            required
            defaultValue={DEMO_ACCOUNTS[0].email}
            className="rounded-[10px] border border-borde-input px-3 py-2 text-sm outline-none focus:border-magenta"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.04em] text-texto-3">Contraseña</span>
          <input
            name="password"
            type="password"
            required
            defaultValue="kokun2026"
            className="rounded-[10px] border border-borde-input px-3 py-2 text-sm outline-none focus:border-magenta"
          />
        </label>
        {state?.error && <p className="text-sm text-rojo-text">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="mt-1 rounded-pill bg-magenta text-white font-extrabold text-sm py-2.5 disabled:opacity-45"
        >
          {pending ? "Entrando…" : "Entrar"}
        </button>
      </form>

      <div className="mt-5">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.04em] text-texto-3 mb-2">Cuentas demo</p>
        <div className="grid grid-cols-2 gap-2">
          {DEMO_ACCOUNTS.map((a) => (
            <form action={formAction} key={a.email}>
              <input type="hidden" name="email" value={a.email} />
              <input type="hidden" name="password" value="kokun2026" />
              <button
                type="submit"
                className={`w-full text-left rounded-card-sm px-3 py-2 text-xs font-bold ${a.color}`}
              >
                {a.label}
              </button>
            </form>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-texto-4">Contraseña para todas: kokun2026</p>
      </div>
    </div>
  );
}
