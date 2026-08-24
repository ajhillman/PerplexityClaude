"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Field, PageHeader, Pill } from "@/components/desk-chrome";
import { daysBetween, formatShortDate } from "@/lib/dates";
import { createId } from "@/lib/ids";
import { setDesk, useDesk } from "@/lib/store";
import type { Person, Relationship, Warmth } from "@/lib/types";

const RELATIONSHIPS: Relationship[] = [
  "investor",
  "operator",
  "regulator",
  "counsel",
  "scholar",
  "family",
  "other",
];

export default function PeoplePage() {
  const desk = useDesk();
  const [query, setQuery] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [organization, setOrganization] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const people = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = needle
      ? desk.people.filter((person) =>
          `${person.name} ${person.role} ${person.organization}`
            .toLowerCase()
            .includes(needle),
        )
      : desk.people;
    return [...filtered].sort((left, right) => left.name.localeCompare(right.name));
  }, [desk.people, query]);

  function addPerson(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) {
      return;
    }
    const person: Person = {
      id: createId("ppl"),
      name: name.trim(),
      role: role.trim(),
      organization: organization.trim(),
      email: "",
      relationship: "other",
      warmth: "warm",
      lastContactAt: Date.now(),
      nextAction: "",
      notes: "",
    };
    setDesk({ ...desk, people: [...desk.people, person] });
    setName("");
    setRole("");
    setOrganization("");
    setOpenId(person.id);
  }

  function patch(id: string, update: Partial<Person>) {
    setDesk({
      ...desk,
      people: desk.people.map((person) =>
        person.id === id ? { ...person, ...update } : person,
      ),
    });
  }

  return (
    <div>
      <PageHeader kicker="The book" title="People" />
      <form className="composer" onSubmit={addPerson}>
        <Field label="Name">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Priya Nandakumar"
          />
        </Field>
        <Field label="Role">
          <input
            value={role}
            onChange={(event) => setRole(event.target.value)}
            placeholder="CEO"
          />
        </Field>
        <Field label="Organization">
          <input
            value={organization}
            onChange={(event) => setOrganization(event.target.value)}
            placeholder="Aurora Bio"
          />
        </Field>
        <button type="submit" className="command-submit">
          Add
        </button>
      </form>
      <Field label="Search the book">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Name, role, or firm"
        />
      </Field>
      <ul className="stack">
        {people.map((person) => {
          const gap = person.lastContactAt
            ? daysBetween(person.lastContactAt, desk.asOf)
            : null;
          return (
            <li key={person.id} className="card">
              <button
                type="button"
                className="card-button"
                onClick={() =>
                  setOpenId((current) => (current === person.id ? null : person.id))
                }
              >
                <div className="card-row">
                  <strong>{person.name}</strong>
                  <Pill tone={gap !== null && gap >= 21 ? "watch" : "default"}>
                    {person.relationship}
                  </Pill>
                </div>
                <p>
                  {[person.role, person.organization].filter(Boolean).join(", ")}
                </p>
                <p className="meta">
                  {person.lastContactAt
                    ? `Last contact ${formatShortDate(person.lastContactAt)}`
                    : "No contact filed"}
                  {person.nextAction ? ` · ${person.nextAction}` : ""}
                </p>
              </button>
              {openId === person.id ? (
                <div className="drawer">
                  <Field label="Relationship">
                    <select
                      value={person.relationship}
                      onChange={(event) =>
                        patch(person.id, {
                          relationship: event.target.value as Relationship,
                        })
                      }
                    >
                      {RELATIONSHIPS.map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Warmth">
                    <select
                      value={person.warmth}
                      onChange={(event) =>
                        patch(person.id, { warmth: event.target.value as Warmth })
                      }
                    >
                      <option value="cold">Cold</option>
                      <option value="warm">Warm</option>
                      <option value="close">Close</option>
                    </select>
                  </Field>
                  <Field label="Email">
                    <input
                      value={person.email}
                      onChange={(event) =>
                        patch(person.id, { email: event.target.value })
                      }
                    />
                  </Field>
                  <Field label="Next action">
                    <input
                      value={person.nextAction}
                      onChange={(event) =>
                        patch(person.id, { nextAction: event.target.value })
                      }
                    />
                  </Field>
                  <Field label="Notes">
                    <textarea
                      value={person.notes}
                      onChange={(event) =>
                        patch(person.id, { notes: event.target.value })
                      }
                      rows={4}
                    />
                  </Field>
                  <button
                    type="button"
                    className="text-action"
                    onClick={() => patch(person.id, { lastContactAt: Date.now() })}
                  >
                    Mark contacted today
                  </button>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
