#!/usr/bin/env python3
"""Build a small JSON API from official MLB.com Home Run Derby pages.

The script only reads MLB-owned pages. It is designed for GitHub Actions and
writes home-run-derby/data/live.json when official results change.
"""
from __future__ import annotations

import argparse
import json
import re
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import requests
from bs4 import BeautifulSoup

PLAYERS = [
    "Kyle Schwarber",
    "Junior Caminero",
    "Munetaka Murakami",
    "Jordan Walker",
    "Jac Caglianone",
    "Bryce Harper",
    "Ben Rice",
    "Willson Contreras",
]

OFFICIAL_URLS = [
    "https://www.mlb.com/home-run-derby",
    "https://www.mlb.com/events/home-run-derby",
    "https://www.mlb.com/search?query=home%20run%20derby",
]

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
}


def normalize_space(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def fetch_text(session: requests.Session, url: str) -> str:
    response = session.get(url, headers=HEADERS, timeout=25)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")
    chunks = [soup.get_text(" ", strip=True)]
    for script in soup.find_all("script"):
        if script.string:
            chunks.append(script.string)
    return normalize_space(" ".join(chunks))


def parse_player(text: str, player: str) -> dict[str, Any] | None:
    escaped = re.escape(player)
    window_match = re.search(rf"{escaped}.{{0,260}}", text, flags=re.I)
    if not window_match:
        return None
    window = window_match.group(0)

    hr_patterns = [
        r"(\d{1,2})\s*(?:home\s*runs?|hrs?)\b",
        r"(?:home\s*runs?|hrs?)\s*[:\-]?\s*(\d{1,2})\b",
        r'"(?:homeRuns|homeRunCount|hr)"\s*:\s*(\d{1,2})',
    ]
    distance_patterns = [
        r"(?:longest(?:\s+distance)?|max(?:imum)?\s+distance)\s*[:\-]?\s*(\d{3})\s*(?:feet|ft)\b",
        r"(\d{3})\s*(?:feet|ft)\b",
        r'"(?:maxDistance|longestDistance|totalDistance)"\s*:\s*(\d{3})',
    ]

    hr = next((int(m.group(1)) for p in hr_patterns if (m := re.search(p, window, re.I))), None)
    distance = next((int(m.group(1)) for p in distance_patterns if (m := re.search(p, window, re.I))), None)
    if hr is None:
        return None
    return {"hr": hr, "maxDistance": distance}


def build_payload() -> dict[str, Any]:
    session = requests.Session()
    combined = ""
    used_urls: list[str] = []
    errors: list[str] = []
    for url in OFFICIAL_URLS:
        try:
            text = fetch_text(session, url)
            if text:
                combined += " " + text
                used_urls.append(url)
        except Exception as exc:  # noqa: BLE001
            errors.append(f"{url}: {exc}")

    players: dict[str, Any] = {}
    for player in PLAYERS:
        parsed = parse_player(combined, player)
        if parsed:
            players[player] = parsed

    current_hitter = ""
    for player in PLAYERS:
        if re.search(rf"{re.escape(player)}.{{0,90}}(?:currently hitting|up next|at bat)", combined, re.I):
            current_hitter = player
            break

    is_live = bool(players) or bool(re.search(r"\blive\b|round\s*[123]|semifinal|final", combined, re.I))
    return {
        "updatedAt": datetime.now(timezone.utc).isoformat(),
        "source": "MLB.com",
        "sourceUrls": used_urls,
        "status": "live" if is_live else "waiting",
        "currentHitter": current_hitter,
        "players": players,
        "errors": errors,
    }


def write_if_changed(path: Path, payload: dict[str, Any]) -> bool:
    comparable = {k: v for k, v in payload.items() if k != "updatedAt"}
    if path.exists():
        try:
            existing = json.loads(path.read_text(encoding="utf-8"))
            existing_comparable = {k: v for k, v in existing.items() if k != "updatedAt"}
            if existing_comparable == comparable:
                return False
        except Exception:  # noqa: BLE001
            pass
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    return True


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", default="home-run-derby/data/live.json")
    parser.add_argument("--watch", type=int, default=0, help="Seconds to keep polling")
    parser.add_argument("--interval", type=int, default=20)
    args = parser.parse_args()

    output = Path(args.output)
    deadline = time.monotonic() + max(0, args.watch)
    changed_any = False
    while True:
        payload = build_payload()
        changed_any = write_if_changed(output, payload) or changed_any
        if args.watch <= 0 or time.monotonic() >= deadline:
            break
        time.sleep(max(10, args.interval))
    print("changed" if changed_any else "unchanged")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
