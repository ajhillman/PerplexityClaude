---
name: audit-google-contacts
description: Inventory Google Contacts and report missing emails, phones, companies, titles, and profile URLs without writing anything. Use for a dry run or completeness check.
---

# Audit Google Contacts

## Trigger

The user wants a completeness report only: "audit my contacts", "what's missing", "list incomplete contacts", or `/list-contacts`.

## Workflow

1. Follow the connection steps in `skills/enrich-google-contacts/SKILL.md`.
2. List every connection with `GOOGLECONTACTS_LIST_CONNECTIONS` and paginate to the end.
3. Score each contact against the required set: email, phone, company, title, profile URL.
4. Do **not** call `GOOGLECONTACTS_UPDATE_CONTACT`.
5. Do **not** spend Clay credits unless the user also asked to enrich.

## Report

Give counts first:

- Total contacts
- Complete (all five required fields present)
- Incomplete, broken down by missing field
- Unusable (no name and no email)

Then list incomplete contacts as a table of display name plus missing field names. Omit emails and phone numbers unless the user asked for a specific person.

Offer to run `/enrich-contacts` on the incomplete set, or on a named subset.
