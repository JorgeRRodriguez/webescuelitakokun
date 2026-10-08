"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Sun, User, Calendar, CreditCard } from "lucide-react";

const ITEMS = [
  { href: "/papas/hoy", label: "Hoy", Icon: Sun },
  { href: "/papas/mi-hijo", label: "Mi hijo", Icon: User },
  { href: "/papas/calendario", label: "Calendario", Icon: Calendar },
  { href: "/papas/pagos", label: "Pagos", Icon: CreditCard },
];

export function PapasTabBar({ pendingCount }: { pendingCount: number }) {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 mx-auto w-full max-w-[480px] bg-white border-t border-borde-card grid grid-cols-4">
      {ITEMS.map(({ href, label, Icon }) => {
        const active = pathname?.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={clsx(
              "relative flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-extrabold",
              active ? "text-magenta" : "text-texto-4"
            )}
          >
            <Icon size={24} strokeWidth={2} />
            {label}
            {href === "/papas/hoy" && pendingCount > 0 && (
              <span className="absolute top-1 right-[28%] rounded-pill bg-rojo text-white text-[9px] font-extrabold px-1 min-w-[16px] text-center">
                {pendingCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
