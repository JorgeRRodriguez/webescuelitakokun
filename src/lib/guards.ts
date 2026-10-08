import { redirect } from "next/navigation";
import { auth, roleHome } from "@/auth";
import type { Role } from "@/lib/enums";
import type { Session } from "next-auth";

export async function requireRole(roles: Role[]): Promise<Session> {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!roles.includes(session.user.role)) redirect(roleHome(session.user.role));
  return session;
}
