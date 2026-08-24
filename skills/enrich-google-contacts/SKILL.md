---
name: enrich-google-contacts
description: List every Google contact, find missing profile fields, research sourced facts, and write confirmed values back to Google Contacts. Use when the user asks to complete, fill out, or enrich their contacts.
---

# Enrich Google Contacts

## Trigger

The user wants Google Contacts completed: "fill out my contacts", "enrich Google contacts", "get all information on my contacts", or `/enrich-contacts`.

## Prerequisites

Google Contacts is reached through Composio toolkit `googlecontacts`.

1. Search Composio for Google Contacts tools with a new or existing session.
2. If there is no active connection, call `COMPOSIO_MANAGE_CONNECTIONS` with toolkit `googlecontacts`.
3. If Composio says managed auth is missing, send the user this setup link and stop until they finish:
   [Set up Google Contacts in Composio](https://dashboard.composio.dev/~/org/connect/apps/googlecontacts?open=true)
4. After they finish, call `COMPOSIO_MANAGE_CONNECTIONS` again, show the OAuth link, then `COMPOSIO_WAIT_FOR_CONNECTIONS`.
5. Do not list or update contacts until the connection is `ACTIVE`.

Clay, Gmail, and web search are optional enrichers. They are not a substitute for the Contacts connection.

## Target fields

Fill these People API fields when empty:

| Field | Write when missing |
| --- | --- |
| `names` | given, family, and display name |
| `emailAddresses` | work and personal emails |
| `phoneNumbers` | mobile, work, home |
| `organizations` | company, title, department, current role |
| `addresses` | city, region, country, street when public |
| `urls` | LinkedIn, company site, personal site |
| `locations` | city / metro |
| `occupations` | current occupation |
| `biographies` | short sourced note, not a dump of research |
| `birthdays` | only if a reliable public source exists |
| `photos` | only if the API accepts a sourced photo and the user asked |

Do not write gender, relations, or political/religious notes unless the user explicitly asked for that field.

## Workflow

### 1. Inventory

Call `GOOGLECONTACTS_LIST_CONNECTIONS` with:

- `person_id`: `me`
- `page_size`: `1000`
- `sort_order`: `LAST_NAME_ASCENDING`
- `person_fields`: `names,emailAddresses,phoneNumbers,organizations,addresses,urls,locations,occupations,biographies,birthdays,photos,nicknames,metadata`

Paginate with `page_token` until no token remains.

For each contact, record:

- `resourceName`
- `etag` from `metadata` or the person object
- display name
- present fields
- missing fields

A contact is **incomplete** when any of these are empty: email, phone, company, title, LinkedIn/profile URL.

### 2. Prioritize

Work incomplete contacts first, in this order:

1. Has a name and an email
2. Has a name and a company
3. Has a name and a phone
4. Has only a name

Skip:

- `people/me`
- deleted contacts (`metadata.deleted`)
- contacts with no name and no email
- contacts the user asked to exclude

If the book is large, process in batches of 25 and report progress after each batch. Ask before continuing past the first 100 unless the user already said "all".

### 3. Research one contact

Use only what you need to fill missing fields.

**Identity keys.** Prefer name + email domain, then name + company.

**Clay.** For a named person with a company or domain, call `find-and-enrich-list-of-contacts` with `contactName` and `companyIdentifier` (a domain, not a company name when you can convert it). When the user asked to fully fill contacts, request:

- contact: `Email`, `Summarize Work History`
- company: only if company/title/location is still missing

Then call `get-task-context` before treating enrichment as missing.

**Gmail.** Search threads from the contact email (`from:address`) or the display name. Use `PLAIN_TEXT` / `MINIMAL` views. Pull signature blocks for title, phone, address, and website.

**Web.** Search `"Full Name" Company` and official LinkedIn or company-team pages. Keep the source URL.

**LinkedIn toolkit.** `LINKEDIN_GET_PERSON` needs a LinkedIn person ID. Do not use it as a directory search.

Reject a candidate when:

- The name is common and company/email do not match
- Sources disagree on employer and you cannot tell which is current
- The only hit is a different middle name, city, or generation

### 4. Propose the write

For each contact, show a compact proposal:

```
Name: Jane Doe
Resource: people/c123
Missing: phone, title, LinkedIn
Proposed:
- phoneNumbers: +1 415 555 0100 (mobile) — source: email signature
- organizations.title: Head of Product — source: company team page
- urls: https://www.linkedin.com/in/janedoe — source: Clay
Keep: existing work email
```

Never send `GOOGLECONTACTS_UPDATE_CONTACT` until the user has approved writes for this session.

On the first write, ask whether later approved proposals should apply automatically. Honor that choice for the rest of the session.

### 5. Write

Re-read the contact with `GOOGLECONTACTS_GET_PERSON` immediately before update so the `etag` is current.

Call `GOOGLECONTACTS_UPDATE_CONTACT` with:

- `resourceName`: the contact resource name
- `updatePersonFields`: only the fields you are filling
- `person.etag`: the fresh etag
- `person.<field>`: **existing values plus new values** for multi-value fields (`emailAddresses`, `phoneNumbers`, `urls`, `organizations`, `addresses`)
- `personFields`: the same fields so you can verify the write

Rules:

- Fields in `updatePersonFields` are replaced. If you omit an existing email while updating `emailAddresses`, that email is deleted. Always merge.
- Send updates for the same user sequentially. Do not parallelize writes.
- On etag mismatch, re-get and retry once.
- After a successful write, mark those fields complete.

### 6. Report

End with counts, per-contact changes (display names only), remaining gaps, and contacts you refused to match.

Do not paste phone numbers, emails, or addresses for the whole book. Show those details only for the contacts just updated, or when the user asks for a specific person.

## Composio tool slugs

| Action | Slug |
| --- | --- |
| List address book | `GOOGLECONTACTS_LIST_CONNECTIONS` |
| Get one person | `GOOGLECONTACTS_GET_PERSON` |
| Batch get | `GOOGLECONTACTS_GET_BATCH_PEOPLE` |
| Search | `GOOGLECONTACTS_SEARCH_CONTACTS` |
| Update | `GOOGLECONTACTS_UPDATE_CONTACT` |

Load schemas with `COMPOSIO_GET_TOOL_SCHEMAS` before the first call if the search result used a `schemaRef`.

## Common failures

| Symptom | Fix |
| --- | --- |
| No managed auth for `googlecontacts` | User creates an auth config at the Composio Google Contacts app page, then you reconnect |
| Connection not active | Show the OAuth redirect URL and wait |
| 410 on sync token | Full list again without `sync_token` |
| 400 etag | Re-get person, retry update once |
| Clay returned a widget but no values | Call `get-task-context` |
| Directory people tools | Those are Workspace directory APIs, not the personal address book. Use `LIST_CONNECTIONS` |

## Stop conditions

Stop and tell the user if:

- Google Contacts cannot be connected
- The user has not approved writes
- A contact cannot be uniquely identified
- A source looks like a different person
