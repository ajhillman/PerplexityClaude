"use client";

import { useState, type FormEvent } from "react";
import { Field, PageHeader, Pill } from "@/components/desk-chrome";
import { daysBetween } from "@/lib/dates";
import { createId } from "@/lib/ids";
import { setDesk, useDesk } from "@/lib/store";
import type { Decision } from "@/lib/types";

export default function DecisionsPage() {
  const desk = useDesk();
  const [question, setQuestion] = useState("");
  const [context, setContext] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const decisions = [...desk.decisions].sort(
    (left, right) => right.createdAt - left.createdAt,
  );

  function addDecision(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!question.trim()) {
      return;
    }
    const decision: Decision = {
      id: createId("dec"),
      question: question.trim(),
      context: context.trim(),
      status: "pending",
      decision: "",
      createdAt: Date.now(),
      decidedAt: null,
    };
    setDesk({ ...desk, decisions: [decision, ...desk.decisions] });
    setQuestion("");
    setContext("");
    setOpenId(decision.id);
  }

  function patch(id: string, update: Partial<Decision>) {
    setDesk({
      ...desk,
      decisions: desk.decisions.map((item) =>
        item.id === id ? { ...item, ...update } : item,
      ),
    });
  }

  return (
    <div>
      <PageHeader kicker="The calls" title="Decisions" />
      <form className="composer" onSubmit={addDecision}>
        <Field label="Question">
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="510(k) or De Novo from day one?"
          />
        </Field>
        <Field label="Context">
          <input
            value={context}
            onChange={(event) => setContext(event.target.value)}
            placeholder="What would make this a bad call later?"
          />
        </Field>
        <button type="submit" className="command-submit">
          Open
        </button>
      </form>
      <ul className="stack">
        {decisions.map((item) => (
          <li key={item.id} className="card">
            <button
              type="button"
              className="card-button"
              onClick={() =>
                setOpenId((current) => (current === item.id ? null : item.id))
              }
            >
              <div className="card-row">
                <strong>{item.question}</strong>
                <Pill tone={item.status === "decided" ? "done" : "watch"}>
                  {item.status === "decided"
                    ? "Decided"
                    : `${daysBetween(item.createdAt, desk.asOf)}d open`}
                </Pill>
              </div>
              {item.context ? <p>{item.context}</p> : null}
              {item.status === "decided" && item.decision ? (
                <p className="decision-line">{item.decision}</p>
              ) : null}
            </button>
            {openId === item.id ? (
              <div className="drawer">
                <Field label="The call">
                  <textarea
                    value={item.decision}
                    onChange={(event) =>
                      patch(item.id, { decision: event.target.value })
                    }
                    rows={3}
                    placeholder="Write the decision in a sentence."
                  />
                </Field>
                <button
                  type="button"
                  className="text-action"
                  onClick={() =>
                    patch(item.id, {
                      status: "decided",
                      decidedAt: Date.now(),
                    })
                  }
                >
                  Mark decided
                </button>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
