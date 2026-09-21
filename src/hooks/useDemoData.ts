import { useEffect, useState } from "react";
import { getDemoData, type DemoData } from "@/lib/demo-seed";

/**
 * Reads the locally seeded demo dataset after hydration, so server and client
 * render the same markup on first paint.
 */
export function useDemoData(): DemoData | null {
  const [data, setData] = useState<DemoData | null>(null);

  useEffect(() => {
    setData(getDemoData());
  }, []);

  return data;
}
