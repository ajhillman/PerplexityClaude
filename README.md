# Google Contacts Enricher

A Cursor agent that loads your Google Contacts, finds missing profile fields, researches sourced facts, and writes the completed record back to Google.

Use it when a contact is only a name, or a name plus an email, and you want phone, title, company, address, and LinkedIn filled in.

## What it does

1. Connects to Google Contacts through Composio (`googlecontacts`).
2. Lists every personal contact, not the Workspace directory.
3. Scores each person for missing email, phone, company, title, and profile URL.
4. Researches gaps with Clay, Gmail signatures, and public web sources.
5. Shows a proposed update, then writes only confirmed, sourced fields.

Existing values are kept. Empty fields are filled. The agent will not invent a match on a common name.

## Install

This repository is a single Cursor plugin.

**From this repo**

1. Clone or open `ajhillman/PerplexityClaude` in Cursor.
2. Cursor discovers `.cursor-plugin/plugin.json` plus the `agents/`, `skills/`, `commands/`, and `rules/` folders.

**Local plugin copy**

Copy the plugin tree to `~/.cursor/plugins/local/google-contacts-enricher/` if you want it available in every workspace.

## Commands

| Command | Effect |
| --- | --- |
| `/list-contacts` | Read-only audit of missing fields |
| `/enrich-contacts` | Research and fill the address book |
| `/fill-contact` | Fully complete one named contact |

You can also ask in plain language: "Fill out my Google contacts."

## First-time Google auth

Composio does not ship a managed OAuth app for Google Contacts. Create one, then connect:

1. Open [Set up Google Contacts in Composio](https://dashboard.composio.dev/~/org/connect/apps/googlecontacts?open=true).
2. Add your Google Cloud OAuth client with People API access (`https://www.googleapis.com/auth/contacts`).
3. Return to the agent and say "connect Google Contacts."
4. Complete the OAuth redirect the agent shows.

Until that connection is `ACTIVE`, the agent will not list or update contacts.

## Safety

- First write in a session always asks for confirmation.
- Updates merge into multi-value fields so existing emails and phones are not deleted.
- Writes use the contact `etag` and retry once on conflict.
- Chat output is a summary, not a dump of the whole book.

## Repo layout

```
.cursor-plugin/plugin.json
agents/google-contacts-enricher.md
skills/enrich-google-contacts/SKILL.md
skills/audit-google-contacts/SKILL.md
commands/enrich-contacts.md
commands/list-contacts.md
commands/fill-contact.md
rules/google-contacts-safety.mdc
```
