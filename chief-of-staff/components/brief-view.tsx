"use client";

import Link from "next/link";
import { buildBrief } from "@/lib/briefing";
import { daysBetween, formatTime, isSameDay } from "@/lib/dates";
import { useDesk } from "@/lib/store";
import { EmptyState, Pill } from "./desk-chrome";

export function BriefView() {
  const desk = useDesk();
  if (!desk.hydrated) {
    return <p className="opening">Opening the desk…</p>;
  }

  const brief = buildBrief(desk, desk.asOf);
  const now = brief.asOf;

  return (
    <article className="brief">
      <header className="brief-head">
        <p className="desk-kicker">Morning brief</p>
        <h1>{brief.dateLabel}</h1>
        <p className="brief-posture">{brief.posture}</p>
        <dl className="brief-counts">
          <div>
            <dt>Overdue</dt>
            <dd>{brief.counts.overdue}</dd>
          </div>
          <div>
            <dt>Meetings today</dt>
            <dd>{brief.counts.todayMeetings}</dd>
          </div>
          <div>
            <dt>Open decisions</dt>
            <dd>{brief.counts.openDecisions}</dd>
          </div>
          <div>
            <dt>Inbox</dt>
            <dd>{brief.counts.openInbox}</dd>
          </div>
        </dl>
      </header>

      <section className="brief-section">
        <h2>Must move</h2>
        {brief.mustMove.length === 0 ? (
          <EmptyState>Nothing is late. Keep it that way.</EmptyState>
        ) : (
          <ul className="stack">
            {brief.mustMove.map((item) => (
              <li key={item.id} className="card">
                <div className="card-row">
                  <strong>{item.title}</strong>
                  <Pill tone={item.tone}>
                    {item.tone === "overdue" ? "Overdue" : "Today"}
                  </Pill>
                </div>
                <p>{item.detail}</p>
              </li>
            ))}
          </ul>
        )}
        <p className="section-link">
          <Link href="/follow-ups">Open follow-ups</Link>
        </p>
      </section>

      <section className="brief-section">
        <h2>The day</h2>
        {brief.meetings.length === 0 ? (
          <EmptyState>No meetings today or tomorrow.</EmptyState>
        ) : (
          <ul className="stack">
            {brief.meetings.map(({ meeting, attendees, missingPrep }) => (
              <li key={meeting.id} className="card">
                <div className="card-row">
                  <strong>{meeting.title}</strong>
                  <Pill tone={isSameDay(meeting.startsAt, now) ? "today" : "watch"}>
                    {isSameDay(meeting.startsAt, now) ? "Today" : "Tomorrow"}{" "}
                    {formatTime(meeting.startsAt)}
                  </Pill>
                </div>
                <p>
                  {attendees.map((person) => person.name).join(", ") ||
                    "No attendees filed"}
                  {meeting.purpose ? ` — ${meeting.purpose}` : ""}
                </p>
                {missingPrep ? (
                  <p className="warn">Prep is empty. Do not walk in cold.</p>
                ) : (
                  <p className="prep">{meeting.prep}</p>
                )}
              </li>
            ))}
          </ul>
        )}
        <p className="section-link">
          <Link href="/meetings">Open meetings</Link>
        </p>
      </section>

      <section className="brief-section">
        <h2>Decisions waiting</h2>
        {brief.decisions.length === 0 ? (
          <EmptyState>No open questions.</EmptyState>
        ) : (
          <ul className="stack">
            {brief.decisions.map((decision) => (
              <li key={decision.id} className="card">
                <div className="card-row">
                  <strong>{decision.question}</strong>
                  <Pill tone="watch">
                    {daysBetween(decision.createdAt, now)}d open
                  </Pill>
                </div>
                {decision.context ? <p>{decision.context}</p> : null}
              </li>
            ))}
          </ul>
        )}
        <p className="section-link">
          <Link href="/decisions">Open decisions</Link>
        </p>
      </section>

      <section className="brief-section">
        <h2>Priorities</h2>
        <ol className="stack numbered">
          {brief.priorities.map((priority) => (
            <li key={priority.id} className="card">
              <strong>{priority.title}</strong>
              {priority.why ? <p>{priority.why}</p> : null}
            </li>
          ))}
        </ol>
        <p className="section-link">
          <Link href="/priorities">Open priorities</Link>
        </p>
      </section>

      <section className="brief-section">
        <h2>Relationship drift</h2>
        {brief.drift.length === 0 ? (
          <EmptyState>The book is current.</EmptyState>
        ) : (
          <ul className="stack">
            {brief.drift.map((person) => (
              <li key={person.id} className="card">
                <div className="card-row">
                  <strong>{person.name}</strong>
                  <Pill tone="watch">{person.relationship}</Pill>
                </div>
                <p>
                  {person.role}
                  {person.organization ? `, ${person.organization}` : ""}
                </p>
                {person.nextAction ? <p>{person.nextAction}</p> : null}
              </li>
            ))}
          </ul>
        )}
        <p className="section-link">
          <Link href="/people">Open the book</Link>
        </p>
      </section>
    </article>
  );
}
