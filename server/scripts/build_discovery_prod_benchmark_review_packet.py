"""Build a compact review packet from prod benchmark discovery aggregates."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

REPORT_VERSION = "build-discovery-prod-benchmark-review-packet-v1"
DEFAULT_SUPPORTED_LIMIT = 10
DEFAULT_FUTURE_LIMIT = 10


def load_json(path: Path) -> dict[str, Any]:
    with open(path, encoding="utf-8") as file:
        return json.load(file)


def prompt_for_profile(profile: dict[str, Any]) -> str:
    level = profile.get("level", 200)
    element = profile.get("element", "unknown")
    class_name = profile.get("className") or "unknown"
    ap = profile.get("ap")
    mp = profile.get("mp")
    range_value = profile.get("range")
    return f"{level} {element} {class_name} {ap}/{mp}/{range_value}"


def profile_summary(profile: dict[str, Any]) -> dict[str, Any]:
    generated_candidate = profile.get("generatedQueryCandidate") or {}
    return {
        "prompt": prompt_for_profile(profile),
        "className": profile.get("className"),
        "element": profile.get("element"),
        "ap": profile.get("ap"),
        "mp": profile.get("mp"),
        "range": profile.get("range"),
        "sampleCount": profile.get("sampleCount", 0),
        "supported": bool(generated_candidate.get("supported")),
        "unsupportedReasons": generated_candidate.get("unsupportedReasons", []),
        "generatedQuery": generated_candidate.get("query"),
        "commonItems": profile.get("commonItems", []),
    }


def sorted_profiles(discovery_report: dict[str, Any]) -> list[dict[str, Any]]:
    return sorted(
        discovery_report.get("profiles", []),
        key=lambda profile: profile.get("sampleCount", 0),
        reverse=True,
    )


def build_review_packet(
    discovery_report: dict[str, Any],
    supported_limit: int = DEFAULT_SUPPORTED_LIMIT,
    future_limit: int = DEFAULT_FUTURE_LIMIT,
) -> dict[str, Any]:
    profiles = [profile_summary(profile) for profile in sorted_profiles(discovery_report)]
    supported = [profile for profile in profiles if profile["supported"]]
    future = [profile for profile in profiles if not profile["supported"]]
    return {
        "reportVersion": REPORT_VERSION,
        "sourceReportVersion": discovery_report.get("reportVersion"),
        "source": discovery_report.get("source"),
        "limits": {
            "supportedLimit": supported_limit,
            "futureLimit": future_limit,
        },
        "sourceLimits": discovery_report.get("limits", {}),
        "sample": discovery_report.get("sample", {}),
        "supportedGeneratedBenchmarkPrompts": supported[:supported_limit],
        "futureBenchmarkPrompts": future[:future_limit],
        "notes": [
            "This packet is derived from aggregate prod discovery output and does not connect to prod.",
            "Prompt rows are profile buckets, not individual custom sets.",
            "Unsupported prompts are benchmark expansion targets until class/model support exists.",
        ],
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("discovery_report", type=Path)
    parser.add_argument("--supported-limit", type=int, default=DEFAULT_SUPPORTED_LIMIT)
    parser.add_argument("--future-limit", type=int, default=DEFAULT_FUTURE_LIMIT)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()

    packet = build_review_packet(
        load_json(args.discovery_report),
        supported_limit=args.supported_limit,
        future_limit=args.future_limit,
    )
    output = json.dumps(packet, indent=2, ensure_ascii=False)
    if args.output:
        args.output.write_text(output + "\n", encoding="utf-8")
    else:
        print(output)


if __name__ == "__main__":
    main()
