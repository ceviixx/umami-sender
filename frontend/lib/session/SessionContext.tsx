// SessionContext.tsx
'use client'

import React, { createContext, useContext, useEffect, useState } from "react";
import { verify } from "../api/account";

type User = { id: string; username: string; role: "admin" | "user" | string };
type SessionState = { user: User | null; loading: boolean; error?: string; setUser?: (user: User | null) => void };

const SessionCtx = createContext<SessionState>({ user: null, loading: true, setUser: () => {} });

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const payload = await verify();
        const user = normalizeVerifyPayload(payload);
        if (!user) throw new Error('Malformed verify response');
        if (!cancelled) {
          setUser(user);
          setLoading(false);
        }
      } catch (e: any) {
        if (!cancelled) {
          setUser(null);
          setLoading(false);
          setError(e.message);
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const contextValue: SessionState = {
    user,
    setUser,
    loading,
    error,
  };
  return <SessionCtx.Provider value={contextValue}>{children}</SessionCtx.Provider>;
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

