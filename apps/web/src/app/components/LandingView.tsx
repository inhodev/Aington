"use client";

import type { ReactNode } from "react";

export function LandingView({ children }: { children: ReactNode }) {
  return <section className="hero">{children}</section>;
}
