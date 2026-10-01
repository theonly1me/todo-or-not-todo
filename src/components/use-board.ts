"use client";

import { useEffect, useRef, useState } from "react";
import { changeWorkspace, readWorkspace } from "@/app/actions";
import type { Mutation, Workspace } from "@/lib/model";

export function useBoard(options: { initialWorkspace: Workspace; notify: (message: string) => void }) {
  const { initialWorkspace, notify } = options;
  const [workspace, setWorkspace] = useState(initialWorkspace);
  const [pending, setPending] = useState(false);
  const busy = useRef(false);
  useEffect(() => {
    let alive = true;
    async function refresh() {
      if (busy.current || document.visibilityState !== "visible") return;
      try {
        const result = await readWorkspace(workspace.id);
        if (result.data && alive && !busy.current) setWorkspace(result.data);
      } catch { return; }
    }
    const timer = setInterval(refresh, 5000);
    return () => { alive = false; clearInterval(timer); };
  }, [workspace.id]);
  async function mutate(mutation: Mutation): Promise<boolean> {
    if (busy.current) return false;
    busy.current = true; setPending(true);
    try {
      const result = await changeWorkspace({ id: workspace.id, mutation });
      if (result.error) { notify(result.error); return false; }
      if (result.data) setWorkspace(previous => ({ ...previous, board: result.data }));
      return true;
    } catch { notify("Couldn't save that change. Please try again."); return false; }
    finally { busy.current = false; setPending(false); }
  }
  return { workspace, pending, mutate };
}
