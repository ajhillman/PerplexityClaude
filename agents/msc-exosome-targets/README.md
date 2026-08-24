# MSC Exosome Sales Targets Agent

This agent builds a comprehensive B2B sales target list for **mesenchymal stem cell (MSC) exosome** products.

## What it produces

A spreadsheet with one row per target company or institution, including:

- Company Name
- Category
- Sub-Category
- Geography
- Website
- Products/Pipeline
- Stage
- Use Case
- Priority (High / Medium / Low)
- Notes

## Target categories

1. Pharmaceutical / biotech therapeutics
2. CDMO / manufacturing partners
3. Aesthetics / cosmetics
4. Research reagents / tools
5. Clinical / hospital / clinic networks
6. Veterinary regenerative medicine
7. Distributors / wholesalers
8. Academic research institutions

## Run locally

```bash
cd agents/msc-exosome-targets
python3 agent.py --summary
```

Output file:

```text
agents/msc-exosome-targets/output/msc_exosome_sales_targets.csv
```

## Google Sheet workflow

1. Run the agent to generate the CSV.
2. Upload the CSV to Google Drive as a Google Sheet, or use the Composio Google Sheets integration to populate a sheet programmatically.

## Refresh strategy

Re-run the agent and replace the sheet when:

- New MSC exosome clinical trials are announced
- CDMO capacity or partnerships change
- Aesthetic distributors add exosome product lines
- Priority accounts move from preclinical to clinical stage
