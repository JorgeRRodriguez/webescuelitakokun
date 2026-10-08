import type { Role } from "@/lib/enums";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role: Role;
    avatarInitials: string;
    avatarColor: string;
    groupIds?: string[];
    childIds?: string[];
  }

  interface Session {
    user: {
      id: string;
      role: Role;
      avatarInitials: string;
      avatarColor: string;
      groupIds: string[];
      childIds: string[];
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role;
    avatarInitials: string;
    avatarColor: string;
    groupIds: string[];
    childIds: string[];
  }
}
