"use client";

import { LogOut } from "lucide-react";
import { KokunLogo } from "@/components/KokunLogo";
import { logoutAction } from "@/lib/authActions";
import { ChildSwitcher, type ChildOption } from "./ChildSwitcher";

export function PapasHeader({
  childOptions,
  activeChildId,
}: {
  childOptions: ChildOption[];
  activeChildId: string | null;
}) {
  return (
    <header className="md:hidden sticky top-0 z-40 flex items-center justify-between gap-2 px-3 py-2.5 bg-fondo-app/95 backdrop-blur border-b border-divisor">
      <ChildSwitcher childOptions={childOptions} activeChildId={activeChildId} />
      <div className="flex items-center gap-2">
        <KokunLogo withTagline={false} className="items-end" />
        <form action={logoutAction}>
          <button type="submit" aria-label="Cerrar sesión" className="text-texto-3 p-1">
            <LogOut size={18} />
          </button>
        </form>
      </div>
    </header>
  );
}
