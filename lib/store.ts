"use client";

import { useSyncExternalStore } from "react";
import { applyCommand } from "./commands";
import { createSeedState, emptyDesk } from "./seed";
import type { DeskState } from "./types";

const STORAGE_KEY = "chief-of-staff:v1";

let state: DeskState = emptyDesk();
const serverSnapshot: DeskState = emptyDesk();
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

function persist(next: DeskState): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      version: next.version,
      priorities: next.priorities,
      people: next.people,
      meetings: next.meetings,
      decisions: next.decisions,
      followUps: next.followUps,
      inbox: next.inbox,
    }),
  );
}

function readStorage(): DeskState | null {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return null;
    }
    const record = parsed as Partial<DeskState>;
    return {
      ...emptyDesk(),
      ...record,
      version: 1,
      hydrated: true,
      asOf: Date.now(),
      lastReply: "",
    };
  } catch {
    return null;
  }
}

export function hydrateDesk(): void {
  if (state.hydrated) {
    return;
  }
  const stored = readStorage();
  const asOf = Date.now();
  state = stored
    ? { ...stored, asOf, hydrated: true }
    : createSeedState(asOf);
  persist(state);
  emit();
}

export function getDesk(): DeskState {
  return state;
}

export function setDesk(next: DeskState): void {
  state = next;
  persist(next);
  emit();
}

export function resetDesk(): void {
  state = createSeedState();
  persist(state);
  emit();
}

export function runCommand(raw: string): string {
  const asOf = Date.now();
  const result = applyCommand(state, raw, asOf, createSeedState);
  state = { ...result.state, asOf, lastReply: result.reply };
  persist(state);
  emit();
  return result.reply;
}

export function subscribeDesk(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useDesk(): DeskState {
  return useSyncExternalStore(subscribeDesk, getDesk, () => serverSnapshot);
}

export function exportDesk(): string {
  const current = getDesk();
  return JSON.stringify(
    {
      version: current.version,
      priorities: current.priorities,
      people: current.people,
      meetings: current.meetings,
      decisions: current.decisions,
      followUps: current.followUps,
      inbox: current.inbox,
    },
    null,
    2,
  );
}

export function importDesk(json: string): string {
  const parsed: unknown = JSON.parse(json);
  if (!parsed || typeof parsed !== "object") {
    throw new Error("That file is not a desk export.");
  }
  const record = parsed as Partial<DeskState>;
  state = {
    ...emptyDesk(),
    ...record,
    version: 1,
    hydrated: true,
    asOf: Date.now(),
    lastReply: "Desk imported.",
  };
  persist(state);
  emit();
  return "Desk imported.";
}
