"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Avatar } from "@/components/Avatar";
import { KokunLogo } from "@/components/KokunLogo";
import { LogoutButton } from "@/components/LogoutButton";

const ITEMS = [
  { href: "/docentes/mi-grupo", label: "Mi grupo", icon: "👥" },
  { href: "/docentes/captura", label: "Captura rápida", icon: "✏️" },
  { href: "/docentes/resumen", label: "Resumen del día", icon: "📋" },
];

export function DocentesNav({
  staffName,
  avatarInitials,
  avatarColor,
  roleLabel,
  groupNames,
  pendingSummaries,
}: {
  staffName: string;
  avatarInitials: string;
  avatarColor: string;
  roleLabel: string;
  groupNames: string;
  pendingSummaries: number;
}) {
  const pathname = usePathname();
  const now = new Date();

  return (
    <>
      {/* Riel lateral — tablet y escritorio */}
      <aside className="hidden md:flex md:w-[196px] shrink-0 flex-col bg-white border-r border-borde-card">
        <div className="p-4 border-b border-divisor">
          <KokunLogo />
        </div>
        <div className="p-4 flex items-center gap-2 border-b border-divisor">
          <Avatar name={avatarInitials} color={avatarColor} size={40} />
          <div className="min-w-0">
            <p className="text-sm font-extrabold truncate">{staffName}</p>
            <p className="text-[11px] text-texto-3 truncate">
              {roleLabel} · {groupNames}
            </p>
          </div>
        </div>
        <nav className="flex-1 p-2 flex flex-col gap-1">
          {ITEMS.map((item) => {
            const active = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center justify-between rounded-card-sm px-3 py-2.5 text-sm font-bold",
                  active ? "bg-magenta-50 text-magenta" : "text-texto-2 hover:bg-magenta-25"
                )}
              >
                <span className="flex items-center gap-2">
                  <span aria-hidden>{item.icon}</span>
                  {item.label}
                </span>
                {item.href === "/docentes/resumen" && pendingSummaries > 0 && (
                  <span className="rounded-pill bg-amarillo text-amarillo-text text-[10px] font-extrabold px-1.5 py-0.5 min-w-[18px] text-center">
                    {pendingSummaries}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-divisor flex flex-col gap-2">
          <p className="text-[11px] text-texto-4">
            {now.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <LogoutButton />
        </div>
      </aside>

      {/* Tab bar inferior — móvil */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-borde-card grid grid-cols-3">
        {ITEMS.map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "relative flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-extrabold",
                active ? "text-magenta" : "text-texto-4"
              )}
            >
              <span aria-hidden className="text-lg leading-none">
                {item.icon}
              </span>
              {item.label}
              {item.href === "/docentes/resumen" && pendingSummaries > 0 && (
                <span className="absolute top-1 right-1/4 rounded-pill bg-amarillo text-amarillo-text text-[9px] font-extrabold px-1 min-w-[16px] text-center">
                  {pendingSummaries}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
