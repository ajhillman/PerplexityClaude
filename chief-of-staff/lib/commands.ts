import { parseClock, parseDueHint, startOfDay } from "./dates";
import { createId } from "./ids";
import type { CommandResult, DeskState, Person } from "./types";

export type ParsedCommand =
  | { kind: "brief" }
  | { kind: "help" }
  | { kind: "reset" }
  | { kind: "add-follow-up"; title: string; personName: string | null; dueHint: string | null }
  | { kind: "add-priority"; title: string }
  | { kind: "add-person"; name: string; role: string; organization: string }
  | { kind: "add-decision"; question: string }
  | { kind: "add-meeting"; title: string; whenText: string }
  | { kind: "add-inbox"; title: string }
  | { kind: "complete"; query: string }
  | { kind: "note"; name: string; text: string }
  | { kind: "unknown"; raw: string };

const HELP = [
  "I keep the desk. Try:",
  "• follow up with Priya about the risk table by Friday",
  "• priority: close Aurora diligence",
  "• add person Jane Hale, reviewer, FDA",
  "• decide: do we share the file with Northwater?",
  "• meeting: scholarship panel Thursday 3pm",
  "• done residual-risk",
  "• note on Samir: mentor match still open",
  "• inbox: intro from Marcus, no materials yet",
  "• brief",
].join("\n");

export function parseCommand(raw: string): ParsedCommand {
  const text = raw.trim();
  if (text.length === 0) {
    return { kind: "unknown", raw };
  }

  const lower = text.toLowerCase();

  if (/^(brief|what's on my plate|whats on my plate|status)$/.test(lower)) {
    return { kind: "brief" };
  }
  if (/^(help|\?|commands)$/.test(lower)) {
    return { kind: "help" };
  }
  if (/^(reset desk|reset sample|start over)$/.test(lower)) {
    return { kind: "reset" };
  }

  const follow = text.match(
    /^(?:follow up(?: with)?|fu)\s+(?:with\s+)?(.+?)(?:\s+about\s+|\s*:\s+)(.+)$/i,
  );
  if (follow?.[1] && follow[2]) {
    return {
      kind: "add-follow-up",
      personName: follow[1].trim(),
      title: stripDue(follow[2]),
      dueHint: follow[2],
    };
  }

  const priority = text.match(/^(?:priority|p0|p1)\s*[:—-]\s*(.+)$/i);
  if (priority?.[1]) {
    return { kind: "add-priority", title: priority[1].trim() };
  }

  const person = text.match(/^add person\s+([^,]+)(?:,\s*([^,]+))?(?:,\s*(.+))?$/i);
  if (person?.[1]) {
    return {
      kind: "add-person",
      name: person[1].trim(),
      role: person[2]?.trim() ?? "",
      organization: person[3]?.trim() ?? "",
    };
  }

  const decision = text.match(/^(?:decide|decision)\s*[:—-]\s*(.+)$/i);
  if (decision?.[1]) {
    return { kind: "add-decision", question: decision[1].trim() };
  }

  const meeting = text.match(/^meeting\s*[:—-]\s*(.+)$/i);
  if (meeting?.[1]) {
    return { kind: "add-meeting", title: stripWhen(meeting[1]), whenText: meeting[1] };
  }

  const inbox = text.match(/^(?:inbox|triage)\s*[:—-]\s*(.+)$/i);
  if (inbox?.[1]) {
    return { kind: "add-inbox", title: inbox[1].trim() };
  }

  const complete = text.match(/^(?:done|complete|close)\s+(.+)$/i);
  if (complete?.[1]) {
    return { kind: "complete", query: complete[1].trim() };
  }

  const note = text.match(/^note on\s+(.+?)\s*[:—-]\s*(.+)$/i);
  if (note?.[1] && note[2]) {
    return { kind: "note", name: note[1].trim(), text: note[2].trim() };
  }

  return { kind: "unknown", raw: text };
}

export function applyCommand(
  state: DeskState,
  raw: string,
  now = Date.now(),
  resetFactory?: () => DeskState,
): CommandResult {
  const parsed = parseCommand(raw);

  switch (parsed.kind) {
    case "brief":
      return { state, reply: "Opening the morning brief." };
    case "help":
      return { state: { ...state, lastReply: HELP }, reply: HELP };
    case "reset": {
      const next = resetFactory ? resetFactory() : state;
      return {
        state: { ...next, hydrated: true, lastReply: "Sample desk restored." },
        reply: "Sample desk restored.",
      };
    }
    case "add-follow-up": {
      const person = parsed.personName
        ? findPerson(state.people, parsed.personName)
        : undefined;
      const followUp = {
        id: createId("fu"),
        title: parsed.title,
        personId: person?.id ?? null,
        dueAt: parseDueHint(parsed.dueHint ?? "", now),
        status: "open" as const,
        source: "Command",
        createdAt: now,
      };
      return {
        state: {
          ...state,
          followUps: [followUp, ...state.followUps],
          lastReply: person
            ? `Logged follow-up with ${person.name}: ${followUp.title}.`
            : `Logged follow-up: ${followUp.title}.`,
        },
        reply: person
          ? `Logged follow-up with ${person.name}: ${followUp.title}.`
          : `Logged follow-up: ${followUp.title}.`,
      };
    }
    case "add-priority": {
      const rank =
        state.priorities.filter((item) => item.status === "active").length + 1;
      const priority = {
        id: createId("pri"),
        title: parsed.title,
        why: "",
        rank,
        status: "active" as const,
        dueAt: null,
      };
      return {
        state: {
          ...state,
          priorities: [...state.priorities, priority],
          lastReply: `Priority added at rank ${rank}: ${priority.title}.`,
        },
        reply: `Priority added at rank ${rank}: ${priority.title}.`,
      };
    }
    case "add-person": {
      const person: Person = {
        id: createId("ppl"),
        name: parsed.name,
        role: parsed.role,
        organization: parsed.organization,
        email: "",
        relationship: inferRelationship(parsed.role, parsed.organization),
        warmth: "warm",
        lastContactAt: now,
        nextAction: "",
        notes: "",
      };
      return {
        state: {
          ...state,
          people: [...state.people, person],
          lastReply: `Added ${person.name} to the book.`,
        },
        reply: `Added ${person.name} to the book.`,
      };
    }
    case "add-decision": {
      const decision = {
        id: createId("dec"),
        question: parsed.question,
        context: "",
        status: "pending" as const,
        decision: "",
        createdAt: now,
        decidedAt: null,
      };
      return {
        state: {
          ...state,
          decisions: [decision, ...state.decisions],
          lastReply: `Decision opened: ${decision.question}`,
        },
        reply: `Decision opened: ${decision.question}`,
      };
    }
    case "add-meeting": {
      const due = parseDueHint(parsed.whenText, now) ?? now;
      const start = parseClock(parsed.whenText, startOfDay(due));
      const meeting = {
        id: createId("mtg"),
        title: parsed.title,
        startsAt: start,
        endsAt: start + 45 * 60 * 1000,
        attendeeIds: [] as string[],
        purpose: "",
        prep: "",
        outcome: "",
        status: "upcoming" as const,
      };
      return {
        state: {
          ...state,
          meetings: [...state.meetings, meeting],
          lastReply: `Meeting booked: ${meeting.title}.`,
        },
        reply: `Meeting booked: ${meeting.title}.`,
      };
    }
    case "add-inbox": {
      const item = {
        id: createId("inb"),
        title: parsed.title,
        body: "",
        createdAt: now,
        status: "open" as const,
      };
      return {
        state: {
          ...state,
          inbox: [item, ...state.inbox],
          lastReply: `Parked in inbox: ${item.title}`,
        },
        reply: `Parked in inbox: ${item.title}`,
      };
    }
    case "complete": {
      const query = parsed.query.toLowerCase();
      const followUp = state.followUps.find(
        (item) =>
          item.status === "open" && item.title.toLowerCase().includes(query),
      );
      if (followUp) {
        return {
          state: {
            ...state,
            followUps: state.followUps.map((item) =>
              item.id === followUp.id ? { ...item, status: "done" } : item,
            ),
            lastReply: `Closed: ${followUp.title}`,
          },
          reply: `Closed: ${followUp.title}`,
        };
      }
      const priority = state.priorities.find(
        (item) =>
          item.status === "active" && item.title.toLowerCase().includes(query),
      );
      if (priority) {
        return {
          state: {
            ...state,
            priorities: state.priorities.map((item) =>
              item.id === priority.id ? { ...item, status: "done" } : item,
            ),
            lastReply: `Marked done: ${priority.title}`,
          },
          reply: `Marked done: ${priority.title}`,
        };
      }
      const inbox = state.inbox.find(
        (item) =>
          item.status === "open" && item.title.toLowerCase().includes(query),
      );
      if (inbox) {
        return {
          state: {
            ...state,
            inbox: state.inbox.map((item) =>
              item.id === inbox.id ? { ...item, status: "triaged" } : item,
            ),
            lastReply: `Triaged: ${inbox.title}`,
          },
          reply: `Triaged: ${inbox.title}`,
        };
      }
      return {
        state: { ...state, lastReply: `Nothing open matched “${parsed.query}”.` },
        reply: `Nothing open matched “${parsed.query}”.`,
      };
    }
    case "note": {
      const person = findPerson(state.people, parsed.name);
      if (!person) {
        return {
          state: { ...state, lastReply: `No one named ${parsed.name} is on the book.` },
          reply: `No one named ${parsed.name} is on the book.`,
        };
      }
      const notes = person.notes
        ? `${person.notes}\n${parsed.text}`
        : parsed.text;
      return {
        state: {
          ...state,
          people: state.people.map((item) =>
            item.id === person.id
              ? { ...item, notes, lastContactAt: now }
              : item,
          ),
          lastReply: `Noted on ${person.name}.`,
        },
        reply: `Noted on ${person.name}.`,
      };
    }
    case "unknown": {
      const item = {
        id: createId("inb"),
        title: parsed.raw,
        body: "Captured from the command line because I could not parse it.",
        createdAt: now,
        status: "open" as const,
      };
      const reply = `I parked that in the inbox. Try “help” if you want the grammar.`;
      return {
        state: {
          ...state,
          inbox: [item, ...state.inbox],
          lastReply: reply,
        },
        reply,
      };
    }
    default: {
      const _never: never = parsed;
      return { state, reply: `Unhandled command: ${JSON.stringify(_never)}` };
    }
  }
}

function findPerson(people: Person[], name: string): Person | undefined {
  const needle = name.toLowerCase();
  return (
    people.find((person) => person.name.toLowerCase() === needle) ??
    people.find((person) => person.name.toLowerCase().includes(needle)) ??
    people.find((person) =>
      person.name.toLowerCase().split(/\s+/).some((part) => part.startsWith(needle)),
    )
  );
}

function inferRelationship(
  role: string,
  organization: string,
): Person["relationship"] {
  const hay = `${role} ${organization}`.toLowerCase();
  if (/fda|regulator|cdhr|cders/.test(hay)) {
    return "regulator";
  }
  if (/counsel|lawyer|attorney/.test(hay)) {
    return "counsel";
  }
  if (/investor|partner|capital|ventures/.test(hay)) {
    return "investor";
  }
  if (/scholar|student|fellow/.test(hay)) {
    return "scholar";
  }
  if (/ceo|founder|operator/.test(hay)) {
    return "operator";
  }
  return "other";
}

function stripDue(text: string): string {
  return text.replace(/\s+by\s+.+$/i, "").trim();
}

function stripWhen(text: string): string {
  return text
    .replace(
      /\s+(today|tomorrow|next week|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b.*$/i,
      "",
    )
    .trim();
}
