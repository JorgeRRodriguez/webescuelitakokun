"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Megaphone, Wallet, CircleCheck, ClipboardList } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { LogoutButton } from "@/components/LogoutButton";

const ITEMS = [
  { href: "/admin/avisos", label: "Avisos y eventos", Icon: Megaphone },
  { href: "/admin/cobranza", label: "Cobranza", Icon: Wallet },
  { href: "/admin/conciliacion", label: "Conciliación", Icon: CircleCheck },
  { href: "/admin/conceptos", label: "Conceptos de cobro", Icon: ClipboardList },
];

export function AdminNav({
  staffName,
  avatarInitials,
  avatarColor,
  paymentsInValidation,
}: {
  staffName: string;
  avatarInitials: string;
  avatarColor: string;
  paymentsInValidation: number;
}) {
  const pathname = usePathname();

  return (
    <>
      <aside className="hidden md:flex md:w-[220px] shrink-0 flex-col bg-ink text-white">
        <div className="p-4">
          <div className="inline-block bg-white rounded-[10px] px-2.5 py-1.5">
            <span className="font-heading font-bold text-sm">
              <span style={{ color: "#B3166F" }}>KOKUN</span>
            </span>
          </div>
        </div>
        <div className="px-4 pb-3 flex items-center gap-2">
          <Avatar name={avatarInitials} color={avatarColor} size={34} />
          <p className="text-sm font-extrabold truncate">{staffName}</p>
        </div>
        <nav className="flex-1 px-2 flex flex-col gap-1">
          {ITEMS.map((item) => {
            const active = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center justify-between rounded-card-sm px-3 py-2.5 text-sm font-bold",
                  active ? "bg-white/[.14] text-white" : "text-white/70 hover:bg-white/[.08]"
                )}
              >
                <span className="flex items-center gap-2">
                  <item.Icon size={18} strokeWidth={2} />
                  {item.label}
                </span>
                {item.href === "/admin/conciliacion" && paymentsInValidation > 0 && (
                  <span className="rounded-pill bg-amarillo text-amarillo-text text-[10px] font-extrabold px-1.5 py-0.5 min-w-[18px] text-center">
                    {paymentsInValidation}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 flex flex-col gap-2 border-t border-white/10">
          <p className="text-[11px] text-white/60">Ciclo 2026–2027 · Polanco</p>
          <LogoutButton className="text-white/70 hover:text-white" />
        </div>
      </aside>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-ink grid grid-cols-4">
        {ITEMS.map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "relative flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-extrabold text-center px-1",
                active ? "text-white" : "text-white/50"
              )}
            >
              <item.Icon size={20} strokeWidth={2} />
              {item.label}
              {item.href === "/admin/conciliacion" && paymentsInValidation > 0 && (
                <span className="absolute top-1 right-1/4 rounded-pill bg-amarillo text-amarillo-text text-[9px] font-extrabold px-1 min-w-[16px] text-center">
                  {paymentsInValidation}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
