"use client";

import { useState, type FormEvent } from "react";
import { Field, PageHeader, Pill } from "@/components/desk-chrome";
import { formatWhen } from "@/lib/dates";
import { createId } from "@/lib/ids";
import { setDesk, useDesk } from "@/lib/store";
import type { Meeting, MeetingStatus } from "@/lib/types";

export default function MeetingsPage() {
  const desk = useDesk();
  const [title, setTitle] = useState("");
  const [purpose, setPurpose] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const meetings = [...desk.meetings].sort(
    (left, right) => left.startsAt - right.startsAt,
  );
  const peopleById = new Map(desk.people.map((person) => [person.id, person]));

  function addMeeting(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) {
      return;
    }
    const startsAt = Date.now() + 60 * 60 * 1000;
    const meeting: Meeting = {
      id: createId("mtg"),
      title: title.trim(),
      startsAt,
      endsAt: startsAt + 45 * 60 * 1000,
      attendeeIds: [],
      purpose: purpose.trim(),
      prep: "",
      outcome: "",
      status: "upcoming",
    };
    setDesk({ ...desk, meetings: [...desk.meetings, meeting] });
    setTitle("");
    setPurpose("");
    setOpenId(meeting.id);
  }

  function patch(id: string, update: Partial<Meeting>) {
    setDesk({
      ...desk,
      meetings: desk.meetings.map((meeting) =>
        meeting.id === id ? { ...meeting, ...update } : meeting,
      ),
    });
  }

  return (
    <div>
      <PageHeader kicker="The calendar" title="Meetings" />
      <form className="composer" onSubmit={addMeeting}>
        <Field label="Meeting">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Aurora pathway with counsel"
          />
        </Field>
        <Field label="Purpose">
          <input
            value={purpose}
            onChange={(event) => setPurpose(event.target.value)}
            placeholder="Choose a written path."
          />
        </Field>
        <button type="submit" className="command-submit">
          Add
        </button>
      </form>
      <ul className="stack">
        {meetings.map((meeting) => (
          <li key={meeting.id} className="card">
            <button
              type="button"
              className="card-button"
              onClick={() =>
                setOpenId((current) => (current === meeting.id ? null : meeting.id))
              }
            >
              <div className="card-row">
                <strong>{meeting.title}</strong>
                <Pill
                  tone={
                    meeting.status === "done"
                      ? "done"
                      : meeting.status === "cancelled"
                        ? "watch"
                        : "today"
                  }
                >
                  {meeting.status}
                </Pill>
              </div>
              <p className="meta">{formatWhen(meeting.startsAt)}</p>
              <p>
                {meeting.attendeeIds
                  .map((id) => peopleById.get(id)?.name)
                  .filter(Boolean)
                  .join(", ") || "No attendees filed"}
              </p>
              {meeting.purpose ? <p>{meeting.purpose}</p> : null}
            </button>
            {openId === meeting.id ? (
              <div className="drawer">
                <Field label="Status">
                  <select
                    value={meeting.status}
                    onChange={(event) =>
                      patch(meeting.id, {
                        status: event.target.value as MeetingStatus,
                      })
                    }
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="done">Done</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </Field>
                <Field label="Prep">
                  <textarea
                    value={meeting.prep}
                    onChange={(event) =>
                      patch(meeting.id, { prep: event.target.value })
                    }
                    rows={3}
                  />
                </Field>
                <Field label="Outcome">
                  <textarea
                    value={meeting.outcome}
                    onChange={(event) =>
                      patch(meeting.id, { outcome: event.target.value })
                    }
                    rows={3}
                  />
                </Field>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
