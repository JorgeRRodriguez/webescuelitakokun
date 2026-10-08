import { cookies } from "next/headers";
import { ACTIVE_CHILD_COOKIE } from "./activeChildCookie";

export async function getActiveChildId(childIds: string[]): Promise<string | null> {
  if (childIds.length === 0) return null;
  const store = await cookies();
  const cookieVal = store.get(ACTIVE_CHILD_COOKIE)?.value;
  if (cookieVal && childIds.includes(cookieVal)) return cookieVal;
  return childIds[0];
}
