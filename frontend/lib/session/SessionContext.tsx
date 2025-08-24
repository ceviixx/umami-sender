// SessionContext.tsx
'use client'

import React, { createContext, useContext, useEffect, useState } from "react";
import { verify } from "../api/account";

type User = { id: string; username: string; role: "admin" | "user" | string };
type SessionState = { user: User | null; loading: boolean; error?: string };

const SessionCtx = createContext<SessionState>({ user: null, loading: true });

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SessionState>({ user: null, loading: true });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const payload = await verify();
        const user = normalizeVerifyPayload(payload);
        if (!user) throw new Error('Malformed verify response');
        if (!cancelled) setState({ user, loading: false });
      } catch (e: any) {
        if (!cancelled) setState({ user: null, loading: false, error: e.message });
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return <SessionCtx.Provider value={state}>{children}</SessionCtx.Provider>;
}

export const useSession = () => useContext(SessionCtx);

function normalizeVerifyPayload(payload: any): User | null {
  const src = payload?.user ?? payload ?? null;
  if (!src?.id) return null;

  let role: string;

  if (src.role) {
    role = src.role.toString().toLowerCase();
  } else if (typeof src.is_admin === 'boolean') {
    role = src.is_admin ? 'admin' : 'user';
  } else if (typeof src.isAdmin === 'boolean') {
    role = src.isAdmin ? 'admin' : 'user';
  } else {
    role = 'user';
  }

  return {
    id: String(src.id),
    username: String(src.username ?? src.name ?? ''),
    role,
  };
}

