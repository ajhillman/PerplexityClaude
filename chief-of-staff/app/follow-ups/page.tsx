"use client";

import { useState, type FormEvent } from "react";
import { Field, PageHeader, Pill } from "@/components/desk-chrome";
import { formatShortDate, startOfDay } from "@/lib/dates";
import { createId } from "@/lib/ids";
import { setDesk, useDesk } from "@/lib/store";
import type { FollowUp } from "@/lib/types";

export default function FollowUpsPage() {
  const desk = useDesk();
  const [title, setTitle] = useState("");
  const [personId, setPersonId] = useState("");

  const peopleById = new Map(desk.people.map((person) => [person.id, person]));
  const items = [...desk.followUps].sort((left, right) => {
    if (left.status !== right.status) {
      return left.status === "open" ? -1 : 1;
    }
    return (left.dueAt ?? Number.MAX_SAFE_INTEGER) - (right.dueAt ?? Number.MAX_SAFE_INTEGER);
  });

  function addFollowUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) {
      return;
    }
    const followUp: FollowUp = {
      id: createId("fu"),
      title: title.trim(),
      personId: personId || null,
      dueAt: Date.now() + 86_400_000,
      status: "open",
      source: "Desk",
      createdAt: Date.now(),
    };
    setDesk({ ...desk, followUps: [followUp, ...desk.followUps] });
    setTitle("");
    setPersonId("");
  }

  function patch(id: string, update: Partial<FollowUp>) {
    setDesk({
      ...desk,
      followUps: desk.followUps.map((item) =>
        item.id === id ? { ...item, ...update } : item,
      ),
    });
  }

  return (
    <div>
      <PageHeader kicker="The commitments" title="Follow-ups" />
      <form className="composer" onSubmit={addFollowUp}>
        <Field label="Commitment">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Get the residual-risk table from Priya"
          />
        </Field>
        <Field label="Person">
          <select
            value={personId}
            onChange={(event) => setPersonId(event.target.value)}
          >
            <option value="">Unassigned</option>
            {desk.people.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>
        </Field>
        <button type="submit" className="command-submit">
          Add
        </button>
      </form>
      <ul className="stack">
        {items.map((item) => {
          const overdue =
            item.status === "open" &&
            item.dueAt !== null &&
            item.dueAt < startOfDay(desk.asOf);
          const person = item.personId ? peopleById.get(item.personId) : undefined;
          return (
            <li key={item.id} className="card">
              <div className="card-row">
                <strong>{item.title}</strong>
                <Pill
                  tone={
                    item.status === "done"
                      ? "done"
                      : overdue
                        ? "overdue"
                        : "today"
                  }
                >
                  {item.status === "done"
                    ? "Done"
                    : overdue
                      ? "Overdue"
                      : item.dueAt
                        ? formatShortDate(item.dueAt)
                        : "Open"}
                </Pill>
              </div>
              <p className="meta">
                {[person?.name, item.source].filter(Boolean).join(" · ")}
              </p>
              {item.status === "open" ? (
                <button
                  type="button"
                  className="text-action"
                  onClick={() => patch(item.id, { status: "done" })}
                >
                  Mark done
                </button>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
