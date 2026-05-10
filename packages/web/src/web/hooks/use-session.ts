import { useState, useEffect } from "react";
import { getStoredSession, type StoredSession } from "../lib/auth";

export interface SessionState {
  data: StoredSession | null;
  isPending: boolean;
}

export function useSession(): SessionState {
  const [state, setState] = useState<SessionState>({
    data: getStoredSession(),
    isPending: false,
  });

  useEffect(() => {
    const handler = () => {
      setState({ data: getStoredSession(), isPending: false });
    };
    window.addEventListener("s2a:session-change", handler);
    return () => window.removeEventListener("s2a:session-change", handler);
  }, []);

  return state;
}
