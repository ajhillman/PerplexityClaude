"use client";

import { useEffect, type ReactNode } from "react";
import { hydrateDesk } from "@/lib/store";

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    hydrateDesk();
  }, []);

  return children;
}
