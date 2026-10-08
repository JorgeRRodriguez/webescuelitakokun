"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";
import { Avatar } from "@/components/Avatar";
import { ACTIVE_CHILD_COOKIE } from "@/lib/activeChildCookie";

export type ChildOption = { id: string; name: string; avatarColor: string; groupLabel: string };

export function ChildSwitcher({
  childOptions,
  activeChildId,
  fullWidth = false,
}: {
  childOptions: ChildOption[];
  activeChildId: string | null;
  fullWidth?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const active = childOptions.find((c) => c.id === activeChildId) ?? childOptions[0];

  function selectChild(id: string) {
    // Mutación de document.cookie en un event handler (no durante el render);
    // el linter de React Compiler la marca como falso positivo.
    // eslint-disable-next-line react-hooks/immutability
    document.cookie = `${ACTIVE_CHILD_COOKIE}=${id}; path=/; max-age=31536000`;
    setOpen(false);
    router.refresh();
  }

  if (childOptions.length === 0) return null;

  return (
    <div className={clsx("relative", fullWidth && "w-full")}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={clsx(
          "flex items-center gap-2 bg-white border border-borde-card rounded-pill pl-1.5 pr-2.5 py-1.5",
          fullWidth && "w-full"
        )}
      >
        {active && <Avatar name={active.name} color={active.avatarColor} size={30} rounded="rounded-full" />}
        <span className="flex flex-col items-start leading-tight min-w-0">
          <span className="text-sm font-extrabold truncate max-w-full">{active?.name ?? "Selecciona"}</span>
          <span className="text-[11px] text-texto-3 truncate max-w-full">{active?.groupLabel}</span>
        </span>
        <ChevronDown size={16} className="text-texto-3 ml-auto shrink-0" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className={clsx(
              "absolute left-0 top-full mt-1.5 z-50 bg-white rounded-card border border-borde-card shadow-popover py-1.5 min-w-[220px]",
              fullWidth && "w-full"
            )}
          >
            {childOptions.map((c) => (
              <button
                key={c.id}
                onClick={() => selectChild(c.id)}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-magenta-25 text-left"
              >
                <Avatar name={c.name} color={c.avatarColor} size={30} rounded="rounded-full" />
                <span className="flex flex-col leading-tight">
                  <span className="text-sm font-extrabold">{c.name}</span>
                  <span className="text-[11px] text-texto-3">{c.groupLabel}</span>
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
