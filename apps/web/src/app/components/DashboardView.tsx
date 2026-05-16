"use client";

import type { ReactNode } from "react";

export function DashboardView({ children }: { children: ReactNode }) {
  return <div className="app-dashboard">{children}</div>;
}
