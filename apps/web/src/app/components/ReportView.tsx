"use client";

import type { ReactNode } from "react";

export function ReportView({ children }: { children: ReactNode }) {
  return <section className="result-page">{children}</section>;
}
