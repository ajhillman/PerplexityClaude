"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Field, PageHeader, Pill } from "@/components/desk-chrome";
import { formatWhen } from "@/lib/dates";
import { createId } from "@/lib/ids";
import {
  exportDesk,
  importDesk,
  resetDesk,
  setDesk,
  useDesk,
} from "@/lib/store";
import type { InboxItem } from "@/lib/types";

export default function InboxPage() {
  const desk = useDesk();
  const [title, setTitle] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const items = [...desk.inbox].sort((left, right) => right.createdAt - left.createdAt);

  function addItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) {
      return;
    }
    const item: InboxItem = {
      id: createId("inb"),
      title: title.trim(),
      body: "",
      createdAt: Date.now(),
      status: "open",
    };
    setDesk({ ...desk, inbox: [item, ...desk.inbox] });
    setTitle("");
  }

  function patch(id: string, update: Partial<InboxItem>) {
    setDesk({
      ...desk,
      inbox: desk.inbox.map((item) =>
        item.id === id ? { ...item, ...update } : item,
      ),
    });
  }

  function download() {
    const blob = new Blob([exportDesk()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "chief-of-staff-desk.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function onImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const text = await file.text();
    importDesk(text);
    event.target.value = "";
  }

  return (
    <div>
      <PageHeader kicker="The tray" title="Inbox" />
      <form className="composer" onSubmit={addItem}>
        <Field label="Capture">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Inbound intro. No materials yet."
          />
        </Field>
        <button type="submit" className="command-submit">
          Park
        </button>
      </form>
      <ul className="stack">
        {items.map((item) => (
          <li key={item.id} className="card">
            <div className="card-row">
              <strong>{item.title}</strong>
              <Pill tone={item.status === "triaged" ? "done" : "watch"}>
                {item.status}
              </Pill>
            </div>
            {item.body ? <p>{item.body}</p> : null}
            <p className="meta">{formatWhen(item.createdAt)}</p>
            {item.status === "open" ? (
              <button
                type="button"
                className="text-action"
                onClick={() => patch(item.id, { status: "triaged" })}
              >
                Mark triaged
              </button>
            ) : null}
          </li>
        ))}
      </ul>
      <section className="desk-tools">
        <h2>Desk files</h2>
        <p>
          This desk lives in this browser. Export a copy if you change machines.
          Restore the sample desk if you want the original briefing back.
        </p>
        <div className="row-actions">
          <button type="button" className="command-submit" onClick={download}>
            Export JSON
          </button>
          <button
            type="button"
            className="command-submit ghost"
            onClick={() => fileRef.current?.click()}
          >
            Import JSON
          </button>
          <button type="button" className="text-action" onClick={resetDesk}>
            Restore sample desk
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            hidden
            onChange={onImport}
          />
        </div>
      </section>
    </div>
  );
}
