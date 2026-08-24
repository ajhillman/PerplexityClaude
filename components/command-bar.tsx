"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { parseCommand } from "@/lib/commands";
import { runCommand, useDesk } from "@/lib/store";

export function CommandBar() {
  const desk = useDesk();
  const router = useRouter();
  const [draft, setDraft] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) {
      return;
    }
    const parsed = parseCommand(text);
    runCommand(text);
    setDraft("");
    if (parsed.kind === "brief") {
      router.push("/");
    }
    if (parsed.kind === "add-follow-up") {
      router.push("/follow-ups");
    }
    if (parsed.kind === "add-priority") {
      router.push("/priorities");
    }
    if (parsed.kind === "add-person" || parsed.kind === "note") {
      router.push("/people");
    }
    if (parsed.kind === "add-decision") {
      router.push("/decisions");
    }
    if (parsed.kind === "add-meeting") {
      router.push("/meetings");
    }
    if (parsed.kind === "add-inbox" || parsed.kind === "unknown") {
      router.push("/inbox");
    }
  }

  return (
    <section className="command" aria-label="Staff command">
      <form onSubmit={submit} className="command-form">
        <label htmlFor="staff-command" className="command-label">
          Staff
        </label>
        <input
          id="staff-command"
          className="command-input"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="follow up with Priya about the risk table by Friday"
          autoComplete="off"
        />
        <button type="submit" className="command-submit">
          File
        </button>
      </form>
      {desk.lastReply ? (
        <p className="command-reply" role="status">
          {desk.lastReply}
        </p>
      ) : (
        <p className="command-hint">
          Type a commitment, a priority, a person, or “help”.
        </p>
      )}
    </section>
  );
}
