"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Sustituto simple de tiempo real: refresca los Server Components de la
// ruta actual cada `intervalMs`. Suficiente para un prototipo sin
// infraestructura de websockets/Pusher/Supabase Realtime.
export function PollingRefresher({ intervalMs = 6000 }: { intervalMs?: number }) {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => router.refresh(), intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);
  return null;
}
