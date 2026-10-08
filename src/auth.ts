import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { Role } from "@/lib/enums";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Correo", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const email = (credentials?.email as string | undefined)?.trim().toLowerCase();
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const staff = await prisma.staff.findUnique({
          where: { email },
          include: { assignments: true },
        });
        if (staff) {
          const ok = await bcrypt.compare(password, staff.passwordHash);
          if (!ok) return null;
          return {
            id: staff.id,
            name: staff.name,
            email: staff.email,
            role: staff.role as Role,
            avatarInitials: staff.avatarInitials,
            avatarColor: staff.avatarColor,
            groupIds: staff.assignments.map((a) => a.groupId).filter((g): g is string => !!g),
          };
        }

        const guardian = await prisma.guardian.findUnique({
          where: { email },
          include: { children: true },
        });
        if (guardian) {
          const ok = await bcrypt.compare(password, guardian.passwordHash);
          if (!ok) return null;
          return {
            id: guardian.id,
            name: guardian.name,
            email: guardian.email,
            role: "TUTOR" as Role,
            avatarInitials: guardian.name
              .split(" ")
              .map((p) => p[0])
              .slice(0, 2)
              .join("")
              .toUpperCase(),
            avatarColor: "#B3166F",
            childIds: guardian.children.map((c) => c.childId),
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.avatarInitials = user.avatarInitials;
        token.avatarColor = user.avatarColor;
        token.groupIds = user.groupIds ?? [];
        token.childIds = user.childIds ?? [];
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.sub as string;
      session.user.role = token.role as Role;
      session.user.avatarInitials = token.avatarInitials as string;
      session.user.avatarColor = token.avatarColor as string;
      session.user.groupIds = (token.groupIds as string[]) ?? [];
      session.user.childIds = (token.childIds as string[]) ?? [];
      return session;
    },
  },
});

export function roleHome(role: Role): string {
  switch (role) {
    case "TUTOR":
      return "/papas";
    case "DOCENTE":
      return "/docentes";
    case "ADMIN":
    case "DIRECCION":
    case "RECEPCION":
      return "/admin";
    default:
      return "/login";
  }
}
