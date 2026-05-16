"use client";

import type { ReactNode } from "react";

export function SignupView({ children }: { children: ReactNode }) {
  return <section className="onboarding-shell">{children}</section>;
}
