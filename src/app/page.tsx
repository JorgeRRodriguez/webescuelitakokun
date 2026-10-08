import { redirect } from "next/navigation";
import { auth, roleHome } from "@/auth";

export default async function RootPage() {
  const session = await auth();
  redirect(session?.user ? roleHome(session.user.role) : "/login");
}
