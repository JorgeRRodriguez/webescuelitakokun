"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Sun, User, Calendar, CreditCard } from "lucide-react";
import { KokunLogo } from "@/components/KokunLogo";
import { LogoutButton } from "@/components/LogoutButton";
import { ChildSwitcher, type ChildOption } from "./ChildSwitcher";

const ITEMS = [
  { href: "/papas/hoy", label: "Hoy", Icon: Sun },
  { href: "/papas/mi-hijo", label: "Mi hijo", Icon: User },
  { href: "/papas/calendario", label: "Calendario", Icon: Calendar },
  { href: "/papas/pagos", label: "Pagos", Icon: CreditCard },
];

export function PapasSidebar({
  childOptions,
  activeChildId,
  pendingCount,
}: {
  childOptions: ChildOption[];
  activeChildId: string | null;
  pendingCount: number;
}) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-[240px] shrink-0 flex-col bg-white border-r border-borde-card">
      <div className="p-4">
        <KokunLogo />
      </div>

      {childOptions.length > 0 && (
        <div className="px-4 pb-3">
          <ChildSwitcher childOptions={childOptions} activeChildId={activeChildId} fullWidth />
        </div>
      )}

      <nav className="flex-1 px-2 mt-2 flex flex-col gap-1">
        {ITEMS.map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "relative flex items-center gap-2 rounded-card-sm px-3 py-2.5 text-sm font-bold",
                active ? "bg-magenta-25 text-magenta" : "text-texto-2 hover:bg-magenta-25/60"
              )}
            >
              <item.Icon size={18} strokeWidth={2} />
              {item.label}
              {item.href === "/papas/hoy" && pendingCount > 0 && (
                <span className="ml-auto rounded-pill bg-rojo text-white text-[10px] font-extrabold px-1.5 py-0.5 min-w-[18px] text-center">
                  {pendingCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-divisor">
        <LogoutButton />
      </div>
    </aside>
  );
}
