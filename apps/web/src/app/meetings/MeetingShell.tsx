"use client";

import {
  BarChart3,
  CalendarDays,
  HomeIcon,
  Settings,
  User,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

const meetingNavItems = [
  { label: "홈", icon: HomeIcon, href: "/?view=dashboard" },
  { label: "분석 리포트", icon: BarChart3, href: "/?view=dashboard&tab=report" },
  { label: "네트워킹", icon: Users, href: "/?view=dashboard&tab=networking" },
  { label: "모임", icon: CalendarDays, href: "/meetings", active: true },
  { label: "프로필", icon: User, href: "/?view=dashboard&tab=profile" },
  { label: "설정", icon: Settings, href: "/?view=dashboard&tab=settings" },
];

export function MeetingShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-dashboard meetings-dashboard">
      <aside className="app-sidebar">
        <Link className="app-sidebar-brand meeting-sidebar-brand" href="/">
          <span className="logo-mark">
            <Image
              src="/assets/gwayeon-logo.png"
              alt=""
              width={58}
              height={64}
              priority
              unoptimized
            />
          </span>
          <strong>과연</strong>
        </Link>

        <nav className="app-nav" aria-label="모임 메뉴">
          {meetingNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link className={item.active ? "active" : ""} href={item.href} key={item.label}>
                <Icon size={24} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="app-main meetings-main">{children}</main>
    </div>
  );
}
