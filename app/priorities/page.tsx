"use client";

import { useState, type FormEvent } from "react";
import { Field, PageHeader, Pill } from "@/components/desk-chrome";
import { formatShortDate } from "@/lib/dates";
import { createId } from "@/lib/ids";
import { setDesk, useDesk } from "@/lib/store";
import type { Priority, PriorityStatus } from "@/lib/types";

export default function PrioritiesPage() {
  const desk = useDesk();
  const [title, setTitle] = useState("");
  const [why, setWhy] = useState("");

  const items = [...desk.priorities].sort((left, right) => left.rank - right.rank);

  function addPriority(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) {
      return;
    }
    const priority: Priority = {
      id: createId("pri"),
      title: title.trim(),
      why: why.trim(),
      rank: items.filter((item) => item.status !== "done").length + 1,
      status: "active",
      dueAt: null,
    };
    setDesk({ ...desk, priorities: [...desk.priorities, priority] });
    setTitle("");
    setWhy("");
  }

  function patch(id: string, update: Partial<Priority>) {
    setDesk({
      ...desk,
      priorities: desk.priorities.map((item) =>
        item.id === id ? { ...item, ...update } : item,
      ),
    });
  }

  return (
    <div>
      <PageHeader kicker="The work" title="Priorities" />
      <form className="composer" onSubmit={addPriority}>
        <Field label="Priority">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Close Aurora diligence or walk"
          />
        </Field>
        <Field label="Why it matters">
          <input
            value={why}
            onChange={(event) => setWhy(event.target.value)}
            placeholder="The pathway choice changes the hold period."
          />
        </Field>
        <button type="submit" className="command-submit">
          Add
        </button>
      </form>
      <ul className="stack">
        {items.map((item) => (
          <li key={item.id} className="card">
            <div className="card-row">
              <strong>
                {item.rank}. {item.title}
              </strong>
              <Pill
                tone={
                  item.status === "done"
                    ? "done"
                    : item.status === "parked"
                      ? "watch"
                      : "today"
                }
              >
                {item.status}
              </Pill>
            </div>
            {item.why ? <p>{item.why}</p> : null}
            {item.dueAt ? <p className="meta">Due {formatShortDate(item.dueAt)}</p> : null}
            <div className="row-actions">
              <StatusSelect
                value={item.status}
                onChange={(status) => patch(item.id, { status })}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StatusSelect({
  value,
  onChange,
}: {
  value: PriorityStatus;
  onChange: (status: PriorityStatus) => void;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value as PriorityStatus)}
    >
      <option value="active">Active</option>
      <option value="parked">Parked</option>
      <option value="done">Done</option>
    </select>
  );
}
