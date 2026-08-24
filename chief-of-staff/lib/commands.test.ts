import { describe, expect, it } from "vitest";
import { applyCommand, parseCommand } from "./commands";
import { createSeedState } from "./seed";

const NOW = Date.parse("2026-08-24T12:00:00.000Z");

describe("parseCommand", () => {
  it("parses a follow-up with a person and a due hint", () => {
    expect(
      parseCommand("follow up with Priya about the risk table by Friday"),
    ).toEqual({
      kind: "add-follow-up",
      personName: "Priya",
      title: "the risk table",
      dueHint: "the risk table by Friday",
    });
  });

  it("parses a priority", () => {
    expect(parseCommand("priority: close Aurora diligence")).toEqual({
      kind: "add-priority",
      title: "close Aurora diligence",
    });
  });

  it("parses a person", () => {
    expect(parseCommand("add person Jane Hale, reviewer, FDA")).toEqual({
      kind: "add-person",
      name: "Jane Hale",
      role: "reviewer",
      organization: "FDA",
    });
  });
});

describe("applyCommand", () => {
  it("adds a follow-up against a known person", () => {
    const seed = createSeedState(NOW);
    const result = applyCommand(
      seed,
      "follow up with Priya about the risk table by Friday",
      NOW,
    );
    const created = result.state.followUps[0];
    expect(created?.personId).toBe("ppl_priya");
    expect(created?.title).toBe("the risk table");
    expect(created?.dueAt).not.toBeNull();
    expect(result.reply).toContain("Priya");
  });

  it("closes a follow-up by title fragment", () => {
    const seed = createSeedState(NOW);
    const result = applyCommand(seed, "done residual-risk", NOW);
    const closed = result.state.followUps.find((item) => item.id === "fu_risk");
    expect(closed?.status).toBe("done");
  });

  it("parks unknown text in the inbox", () => {
    const seed = createSeedState(NOW);
    const result = applyCommand(seed, "remind me to water the ferns", NOW);
    expect(result.state.inbox[0]?.title).toBe("remind me to water the ferns");
  });
});
