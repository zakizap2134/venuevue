import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  clearSyncedMutations,
  getPendingMutations,
  markSynced,
} from "@/lib/offline-storage";

/**
 * Replays anything queued while offline as soon as the connection returns.
 */
export function useOfflineSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    let running = false;

    async function sync() {
      if (running || typeof navigator === "undefined" || !navigator.onLine) return;
      running = true;
      try {
        const pending = await getPendingMutations();
        for (const mutation of pending) {
          const table = supabase.from(mutation.table as never);
          try {
            if (mutation.type === "insert") {
              await table.insert(mutation.data as never);
            } else if (mutation.type === "update") {
              await table.update(mutation.data as never).match(mutation.where as never);
            } else if (mutation.type === "delete") {
              await table.delete().match(mutation.where as never);
            }
            await markSynced(mutation.id);
          } catch {
            // Leave it queued for the next reconnect.
          }
        }
        await clearSyncedMutations();
        if (pending.length > 0) await queryClient.invalidateQueries();
      } catch {
        // IndexedDB unavailable — nothing to sync.
      } finally {
        running = false;
      }
    }

    void sync();
    window.addEventListener("online", sync);
    return () => window.removeEventListener("online", sync);
  }, [queryClient]);
}
