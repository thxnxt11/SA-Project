// src/hooks/useServerReady.ts
import { useEffect, useState } from "react";

export function useServerReady(pingUrl = "http://localhost:8000/healthz") {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    const ping = async () => {
      try {
        const res = await fetch(pingUrl, { mode: "cors" });
        if (!alive) return;
        setReady(res.ok);
      } catch {
        if (!alive) return;
        setReady(false);
      }
    };
    // ping now + retry every 1s until ok
    ping();
    const id = setInterval(ping, 1000);
    return () => { alive = false; clearInterval(id); };
  }, [pingUrl]);

  return ready;
}
