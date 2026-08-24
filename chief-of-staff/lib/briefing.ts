import {
  addDays,
  daysBetween,
  formatDate,
  formatTime,
  isSameDay,
  startOfDay,
} from "./dates";
import type { Decision, DeskState, Meeting, Person, Priority } from "./types";

export type BriefItem = {
  id: string;
  title: string;
  detail: string;
  tone: "overdue" | "today" | "watch";
};

export type BriefMeeting = {
  meeting: Meeting;
  attendees: Person[];
  missingPrep: boolean;
};

export type Brief = {
  asOf: number;
  dateLabel: string;
  posture: string;
  mustMove: BriefItem[];
  meetings: BriefMeeting[];
  decisions: Decision[];
  drift: Person[];
  priorities: Priority[];
  counts: {
    overdue: number;
    openDecisions: number;
    todayMeetings: number;
    openInbox: number;
  };
};

const DRIFT_DAYS = 21;

export function buildBrief(state: DeskState, now = Date.now()): Brief {
  const openFollowUps = state.followUps.filter((item) => item.status === "open");
  const overdue = openFollowUps.filter(
    (item) => item.dueAt !== null && item.dueAt < startOfDay(now),
  );
  const dueToday = openFollowUps.filter(
    (item) => item.dueAt !== null && isSameDay(item.dueAt, now),
  );

  const peopleById = new Map(state.people.map((person) => [person.id, person]));

  const mustMove: BriefItem[] = [
    ...overdue.map((item) => {
      const person = item.personId ? peopleById.get(item.personId) : undefined;
      const lateBy = item.dueAt ? Math.abs(daysBetween(item.dueAt, now)) : 0;
      return {
        id: item.id,
        title: item.title,
        detail: [
          person ? person.name : item.source,
          lateBy === 0 ? "due now" : `${lateBy} day${lateBy === 1 ? "" : "s"} late`,
        ].join(" · "),
        tone: "overdue" as const,
      };
    }),
    ...dueToday.map((item) => {
      const person = item.personId ? peopleById.get(item.personId) : undefined;
      return {
        id: item.id,
        title: item.title,
        detail: person ? `${person.name} · due today` : "due today",
        tone: "today" as const,
      };
    }),
  ];

  const todayAndTomorrow = state.meetings
    .filter(
      (meeting) =>
        meeting.status === "upcoming" &&
        (isSameDay(meeting.startsAt, now) ||
          isSameDay(meeting.startsAt, addDays(now, 1))),
    )
    .sort((left, right) => left.startsAt - right.startsAt)
    .map((meeting) => ({
      meeting,
      attendees: meeting.attendeeIds
        .map((id) => peopleById.get(id))
        .filter((person): person is Person => person !== undefined),
      missingPrep: meeting.prep.trim().length === 0,
    }));

  const pendingDecisions = state.decisions
    .filter((decision) => decision.status === "pending")
    .sort((left, right) => left.createdAt - right.createdAt);

  const drift = state.people
    .filter((person) => {
      if (!person.lastContactAt) {
        return true;
      }
      return daysBetween(person.lastContactAt, now) >= DRIFT_DAYS;
    })
    .sort((left, right) => {
      const leftGap = left.lastContactAt
        ? daysBetween(left.lastContactAt, now)
        : 999;
      const rightGap = right.lastContactAt
        ? daysBetween(right.lastContactAt, now)
        : 999;
      return rightGap - leftGap;
    });

  const priorities = state.priorities
    .filter((priority) => priority.status === "active")
    .sort((left, right) => left.rank - right.rank)
    .slice(0, 3);

  const todayMeetings = todayAndTomorrow.filter((item) =>
    isSameDay(item.meeting.startsAt, now),
  );
  const firstMeeting = todayMeetings[0];
  const oldestDecision = pendingDecisions[0];
  const openInbox = state.inbox.filter((item) => item.status === "open").length;

  const postureParts: string[] = [];
  if (overdue.length > 0) {
    postureParts.push(
      `${overdue.length} overdue commitment${overdue.length === 1 ? "" : "s"}`,
    );
  }
  if (oldestDecision) {
    const age = daysBetween(oldestDecision.createdAt, now);
    postureParts.push(
      `a decision that has sat ${age} day${age === 1 ? "" : "s"}`,
    );
  }
  if (todayMeetings.length === 0) {
    postureParts.push("no meetings on the book today");
  }

  let posture: string;
  if (postureParts.length === 0) {
    posture = "The desk is current. Protect the morning for the top priority.";
  } else {
    posture = `The desk is carrying ${joinEnglish(postureParts)}.`;
    if (firstMeeting) {
      posture += ` First meeting is at ${formatTime(firstMeeting.meeting.startsAt)} — ${firstMeeting.meeting.title}.`;
    }
  }

  return {
    asOf: now,
    dateLabel: formatDate(now),
    posture,
    mustMove,
    meetings: todayAndTomorrow,
    decisions: pendingDecisions,
    drift,
    priorities,
    counts: {
      overdue: overdue.length,
      openDecisions: pendingDecisions.length,
      todayMeetings: todayMeetings.length,
      openInbox,
    },
  };
}

function joinEnglish(parts: string[]): string {
  const first = parts[0];
  if (parts.length === 0 || first === undefined) {
    return "";
  }
  if (parts.length === 1) {
    return first;
  }
  if (parts.length === 2) {
    return `${first} and ${parts[1]}`;
  }
  return `${parts.slice(0, -1).join(", ")}, and ${parts[parts.length - 1]}`;
}
