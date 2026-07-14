#!/usr/bin/env python3
"""Build a JSON API from official MLB.com Home Run Derby pages.

MLB's Derby scoreboard is client-rendered, so this scraper renders the official
pages with Playwright and extracts the live scoreboard text and embedded JSON.
"""
from __future__ import annotations

import argparse
import json
import re
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

PLAYERS = [
    "Kyle Schwarber", "Junior Caminero", "Munetaka Murakami", "Jordan Walker",
    "Jac Caglianone", "Bryce Harper", "Ben Rice", "Willson Contreras",
]

OFFICIAL_URLS = [
    "https://www.mlb.com/home-run-derby",
    "https://www.mlb.com/events/home-run-derby",
    "https://www.mlb.com/news/topic/home-run-derby",
]


def normalize_space(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def rendered_text(urls: list[str]) -> tuple[str, list[str], list[str]]:
    from playwright.sync_api import sync_playwright

    chunks: list[str] = []
    errors: list[str] = []
    used: list[str] = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36",
            locale="en-US",
        )
        page = context.new_page()
        for url in urls:
            try:
                page.goto(url, wait_until="domcontentloaded", timeout=60000)
                page.wait_for_timeout(10000)
                chunks.append(page.locator("body").inner_text(timeout=15000))
                chunks.extend(page.locator("script").all_text_contents())
                used.append(url)
            except Exception as exc:  # noqa: BLE001
                errors.append(f"{url}: {exc}")
        browser.close()
    return normalize_space(" ".join(chunks)), used, errors


def player_windows(text: str, player: str, radius: int = 650) -> list[str]:
    windows: list[str] = []
    for match in re.finditer(re.escape(player), text, re.I):
        windows.append(text[max(0, match.start() - 180): min(len(text), match.end() + radius)])
    return windows


def parse_player(text: str, player: str) -> dict[str, Any] | None:
    windows = player_windows(text, player)
    if not windows:
        return None

    hr_patterns = [
        r"(\d{1,2})\s*(?:home\s*runs?|hrs?)\b",
        r"(?:home\s*runs?|hrs?)\s*[:\-]?\s*(\d{1,2})\b",
        r'"(?:homeRuns|homeRunCount|totalHomeRuns|hr)"\s*:\s*"?(\d{1,2})"?',
        r'"score"\s*:\s*"?(\d{1,2})"?',
    ]
    distance_patterns = [
        r"(?:longest(?:\s+distance)?|max(?:imum)?\s+distance)\s*[:\-]?\s*(\d{3})\s*(?:feet|ft)\b",
        r"(\d{3})\s*(?:feet|ft)\b",
        r'"(?:maxDistance|longestDistance|totalDistance)"\s*:\s*(\d{3})',
    ]

    hrs: list[int] = []
    distances: list[int] = []
    for window in windows:
        for pattern in hr_patterns:
            for match in re.finditer(pattern, window, re.I | re.S):
                value = int(match.group(1))
                if 0 <= value <= 60:
                    hrs.append(value)
        for pattern in distance_patterns:
            for match in re.finditer(pattern, window, re.I | re.S):
                value = int(match.group(1))
                if 250 <= value <= 600:
                    distances.append(value)

    if not hrs:
        return None
    return {"hr": max(hrs), "maxDistance": max(distances) if distances else None}


def build_payload() -> dict[str, Any]:
    combined, used_urls, errors = rendered_text(OFFICIAL_URLS)
    players: dict[str, Any] = {}
    for player in PLAYERS:
        parsed = parse_player(combined, player)
        if parsed:
            players[player] = parsed

    current_hitter = ""
    for player in PLAYERS:
        if any(re.search(r"currently hitting|up next|at bat|now hitting|hitting now", w, re.I) for w in player_windows(combined, player, 180)):
            current_hitter = player
            break

    status = "live" if players or re.search(r"\bround\s*[123]\b|semifinal|final|currently hitting", combined, re.I) else "waiting"
    return {
        "updatedAt": datetime.now(timezone.utc).isoformat(),
        "source": "MLB.com rendered official pages",
        "sourceUrls": used_urls,
        "status": status,
        "currentHitter": current_hitter,
        "players": players,
        "errors": errors,
    }


def write_if_changed(path: Path, payload: dict[str, Any]) -> bool:
    comparable = {k: v for k, v in payload.items() if k != "updatedAt"}
    if path.exists():
        try:
            existing = json.loads(path.read_text(encoding="utf-8"))
            if {k: v for k, v in existing.items() if k != "updatedAt"} == comparable:
                return False
        except Exception:  # noqa: BLE001
            pass
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    return True


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", default="home-run-derby/data/live.json")
    parser.add_argument("--watch", type=int, default=0)
    parser.add_argument("--interval", type=int, default=20)
    args = parser.parse_args()

    output = Path(args.output)
    deadline = time.monotonic() + max(0, args.watch)
    changed_any = False
    while True:
        changed_any = write_if_changed(output, build_payload()) or changed_any
        if args.watch <= 0 or time.monotonic() >= deadline:
            break
        time.sleep(max(10, args.interval))
    print("changed" if changed_any else "unchanged")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
