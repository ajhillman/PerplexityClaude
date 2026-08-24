"use client";

import type { ReactNode } from "react";

export function PageHeader({
  kicker,
  title,
  children,
}: {
  kicker: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <header className="page-header">
      <p className="desk-kicker">{kicker}</p>
      <div className="page-header-row">
        <h1>{title}</h1>
        {children}
      </div>
    </header>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="empty-state">{children}</p>;
}

export function Meta({ children }: { children: ReactNode }) {
  return <p className="meta">{children}</p>;
}

export function Pill({
  tone = "default",
  children,
}: {
  tone?: "default" | "overdue" | "today" | "done" | "watch";
  children: ReactNode;
}) {
  return <span className={`pill tone-${tone}`}>{children}</span>;
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}
