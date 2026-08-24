# Desk

Personal Cursor agents and a local Chief of Staff for Andrew Hillman.

This repository started as a Perplexity-to-Claude bridge. That name is leftover. What is here now:

1. **Google Contacts Enricher** — a Cursor plugin that audits and fills Google Contacts. Already on `main`.
2. **Chief of Staff** — a local operating desk (brief, people, meetings, decisions, follow-ups). Lives in [`chief-of-staff/`](./chief-of-staff).

## Google Contacts Enricher

A Cursor agent that loads Google Contacts, finds missing profile fields, researches sourced facts, and writes the completed record back to Google.

Use it when a contact is only a name, or a name plus an email, and you want phone, title, company, address, and LinkedIn filled in.

### What it does

1. Connects to Google Contacts through Composio (`googlecontacts`).
2. Lists every personal contact, not the Workspace directory.
3. Scores each person for missing email, phone, company, title, and profile URL.
4. Researches gaps with Clay, Gmail signatures, and public web sources.
5. Shows a proposed update, then writes only confirmed, sourced fields.

Existing values are kept. Empty fields are filled. The agent will not invent a match on a common name.

### Commands

| Command | Effect |
| --- | --- |
| `/list-contacts` | Read-only audit of missing fields |
| `/enrich-contacts` | Research and fill the address book |
| `/fill-contact` | Fully complete one named contact |

You can also ask in plain language: "Fill out my Google contacts."

### First-time Google auth

1. Open [Set up Google Contacts in Composio](https://dashboard.composio.dev/~/org/connect/apps/googlecontacts?open=true).
2. Add your Google Cloud OAuth client with People API access (`https://www.googleapis.com/auth/contacts`).
3. Return to the agent and say "connect Google Contacts."
4. Complete the OAuth redirect the agent shows.

Until that connection is `ACTIVE`, the agent will not list or update contacts.

## Chief of Staff

A private operating desk. First load seeds a sample family-office / biotech brief. After that the desk lives in the browser.

```bash
cd chief-of-staff
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The **Staff** line files work without a model key:

```
follow up with Priya about the risk table by Friday
priority: close Aurora diligence
add person Jane Hale, reviewer, FDA
decide: do we share the file with Northwater?
done residual-risk
help
```

## Layout

```
.cursor-plugin/plugin.json
agents/google-contacts-enricher.md
skills/
commands/
rules/
chief-of-staff/          Next.js desk
```
