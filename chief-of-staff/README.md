# Chief of Staff

A private operating desk for a principal. It keeps the morning brief, the book of people, the calendar, open decisions, and the commitments that otherwise slip.

This app lives in `chief-of-staff/` so it does not overwrite the Google Contacts Cursor plugin at the repository root.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The first load seeds a sample family-office / biotech desk. After that the desk lives in this browser. Export a JSON copy from Inbox when you want a backup.

## Staff command

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
