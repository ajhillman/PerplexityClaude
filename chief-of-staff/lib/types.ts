export type Relationship =
  | "investor"
  | "operator"
  | "regulator"
  | "counsel"
  | "scholar"
  | "family"
  | "other";

export type Warmth = "cold" | "warm" | "close";

export type PriorityStatus = "active" | "parked" | "done";

export type MeetingStatus = "upcoming" | "done" | "cancelled";

export type DecisionStatus = "pending" | "decided";

export type FollowUpStatus = "open" | "done";

export type InboxStatus = "open" | "triaged";

export type Person = {
  id: string;
  name: string;
  role: string;
  organization: string;
  email: string;
  relationship: Relationship;
  warmth: Warmth;
  lastContactAt: number | null;
  nextAction: string;
  notes: string;
};

export type Priority = {
  id: string;
  title: string;
  why: string;
  rank: number;
  status: PriorityStatus;
  dueAt: number | null;
};

export type Meeting = {
  id: string;
  title: string;
  startsAt: number;
  endsAt: number;
  attendeeIds: string[];
  purpose: string;
  prep: string;
  outcome: string;
  status: MeetingStatus;
};

export type Decision = {
  id: string;
  question: string;
  context: string;
  status: DecisionStatus;
  decision: string;
  createdAt: number;
  decidedAt: number | null;
};

export type FollowUp = {
  id: string;
  title: string;
  personId: string | null;
  dueAt: number | null;
  status: FollowUpStatus;
  source: string;
  createdAt: number;
};

export type InboxItem = {
  id: string;
  title: string;
  body: string;
  createdAt: number;
  status: InboxStatus;
};

export type DeskState = {
  version: 1;
  hydrated: boolean;
  asOf: number;
  priorities: Priority[];
  people: Person[];
  meetings: Meeting[];
  decisions: Decision[];
  followUps: FollowUp[];
  inbox: InboxItem[];
  lastReply: string;
};

export type CommandResult = {
  reply: string;
  state: DeskState;
};
