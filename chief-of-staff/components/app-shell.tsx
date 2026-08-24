"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useDesk } from "@/lib/store";
import { CommandBar } from "./command-bar";

const NAV = [
  { href: "/", label: "Brief" },
  { href: "/priorities", label: "Priorities" },
  { href: "/people", label: "People" },
  { href: "/meetings", label: "Meetings" },
  { href: "/decisions", label: "Decisions" },
  { href: "/follow-ups", label: "Follow-ups" },
  { href: "/inbox", label: "Inbox" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const desk = useDesk();

  return (
    <div className="desk-frame">
      <header className="desk-masthead">
        <div className="desk-brand">
          <p className="desk-kicker">Office of the principal</p>
          <Link href="/" className="desk-wordmark">
            Chief of Staff
          </Link>
        </div>
        <nav className="desk-nav" aria-label="Desk">
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? "desk-nav-link is-active" : "desk-nav-link"}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <CommandBar />
      <main className="desk-main">
        {desk.hydrated ? children : <p className="opening">Opening the desk…</p>}
      </main>
    </div>
  );
}
