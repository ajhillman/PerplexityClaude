# Chief of Staff

A private operating desk for a principal. It keeps the morning brief, the book of people, the calendar, open decisions, and the commitments that otherwise slip.

The first load seeds a sample family-office / biotech desk so the brief is immediately readable. Everything then lives in this browser. Export a JSON copy from Inbox when you want a backup.

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm test
npm run lint
npm run build
```

## The desk

- **Brief** — overdue commitments, today’s meetings, decisions that have sat, relationship drift, and the top priorities.
- **Priorities** — ranked work with a written “why”.
- **People** — a relationship book, not a contact dump.
- **Meetings** — purpose, prep, and outcome.
- **Decisions** — questions that need a written call.
- **Follow-ups** — dated commitments against people.
- **Inbox** — the tray for anything that is not yet a commitment, plus export / import / sample restore.

## Staff command

The command line at the top of every page files work without a model key.

```
follow up with Priya about the risk table by Friday
priority: close Aurora diligence
add person Jane Hale, reviewer, FDA
decide: do we share the file with Northwater?
meeting: scholarship panel Thursday 3pm
done residual-risk
note on Samir: mentor match still open
inbox: intro from Marcus, no materials yet
brief
help
```

Unparsed text is parked in the inbox so nothing typed is lost.
