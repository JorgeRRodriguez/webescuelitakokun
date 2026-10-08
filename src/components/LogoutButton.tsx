import clsx from "clsx";
import { logoutAction } from "@/lib/authActions";

export function LogoutButton({ className }: { className?: string }) {
  return (
    <form action={logoutAction}>
      <button type="submit" className={clsx("text-xs font-bold text-texto-3 hover:text-magenta-hover", className)}>
        Cerrar sesión
      </button>
    </form>
  );
}
