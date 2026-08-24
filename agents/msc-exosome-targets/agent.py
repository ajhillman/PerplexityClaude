#!/usr/bin/env python3
"""Agent to build and export MSC exosome sales target lists."""

from __future__ import annotations

import argparse
import csv
import json
import sys
from collections import Counter
from pathlib import Path

from targets_data import HEADERS, TARGETS

AGENT_DIR = Path(__file__).resolve().parent
DEFAULT_OUTPUT = AGENT_DIR / "output" / "msc_exosome_sales_targets.csv"


def validate_targets() -> None:
    if not TARGETS:
        raise ValueError("No targets defined")

    seen: set[str] = set()
    for row in TARGETS:
        if len(row) != len(HEADERS):
            raise ValueError(f"Invalid row width for {row[0]}: expected {len(HEADERS)}")
        name = row[0].strip()
        if name in seen:
            raise ValueError(f"Duplicate company name: {name}")
        seen.add(name)


def rows_for_sheet() -> list[list[str]]:
    return [list(HEADERS)] + [list(row) for row in TARGETS]


def write_csv(path: Path) -> Path:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerows(rows_for_sheet())
    return path


def summary() -> dict[str, object]:
    categories = Counter(row[1] for row in TARGETS)
    priorities = Counter(row[8] for row in TARGETS)
    geographies = Counter(row[3] for row in TARGETS)
    return {
        "total_targets": len(TARGETS),
        "categories": dict(sorted(categories.items())),
        "priorities": dict(sorted(priorities.items())),
        "top_geographies": dict(geographies.most_common(10)),
    }


def print_summary() -> None:
    info = summary()
    print(f"Total targets: {info['total_targets']}")
    print("\nBy category:")
    for category, count in info["categories"].items():
        print(f"  - {category}: {count}")
    print("\nBy priority:")
    for priority, count in info["priorities"].items():
        print(f"  - {priority}: {count}")


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Generate MSC exosome B2B sales target spreadsheets."
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=DEFAULT_OUTPUT,
        help="CSV output path",
    )
    parser.add_argument(
        "--summary",
        action="store_true",
        help="Print target summary statistics",
    )
    parser.add_argument(
        "--json-summary",
        action="store_true",
        help="Print summary as JSON",
    )
    args = parser.parse_args()

    validate_targets()
    output_path = write_csv(args.output)

    if args.summary:
        print_summary()
    if args.json_summary:
        print(json.dumps(summary(), indent=2))

    print(f"Wrote {len(TARGETS)} targets to {output_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
