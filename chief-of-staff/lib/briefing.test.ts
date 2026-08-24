import { describe, expect, it } from "vitest";
import { buildBrief } from "./briefing";
import { createSeedState } from "./seed";

const NOW = Date.parse("2026-08-24T12:00:00.000Z");

describe("buildBrief", () => {
  it("flags overdue follow-ups and pending decisions", () => {
    const brief = buildBrief(createSeedState(NOW), NOW);
    expect(brief.counts.overdue).toBeGreaterThan(0);
    expect(brief.mustMove.some((item) => item.tone === "overdue")).toBe(true);
    expect(brief.decisions.length).toBeGreaterThan(0);
    expect(brief.posture).toMatch(/overdue/i);
  });

  it("marks meetings that still need prep", () => {
    const brief = buildBrief(createSeedState(NOW), NOW);
    const unprepared = brief.meetings.find(
      (item) => item.meeting.id === "mtg_priya",
    );
    expect(unprepared?.missingPrep).toBe(true);
  });

  it("surfaces people who have gone quiet", () => {
    const brief = buildBrief(createSeedState(NOW), NOW);
    expect(brief.drift.some((person) => person.id === "ppl_samir")).toBe(true);
  });
});
