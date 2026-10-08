import { redirect } from "next/navigation";
import { auth, roleHome } from "@/auth";
import { KokunLogo } from "@/components/KokunLogo";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect(roleHome(session.user.role));

  return (
    <main className="flex-1 flex flex-col items-center justify-center gap-8 px-4 py-10 bg-fondo-app">
      <div className="flex flex-col items-center gap-2">
        <KokunLogo className="items-center" />
        <h1 className="font-heading font-bold text-2xl text-ink text-center">
          Un espacio para crecer, transformarse y volar
        </h1>
      </div>
      <LoginForm />
    </main>
  );
}
