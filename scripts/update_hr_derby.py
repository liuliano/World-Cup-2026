#!/usr/bin/env python3
"""Build the Home Run Derby JSON feed from official MLB-owned pages only."""
from __future__ import annotations

import argparse
import json
import re
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup

PLAYERS = [
    "Kyle Schwarber", "Junior Caminero", "Munetaka Murakami", "Jordan Walker",
    "Jac Caglianone", "Bryce Harper", "Ben Rice", "Willson Contreras",
]

SEED_URLS = [
    "https://www.mlb.com/home-run-derby",
    "https://www.mlb.com/events/home-run-derby",
    "https://www.mlb.com/search?query=home%20run%20derby",
    "https://www.mlb.com/news/topic/home-run-derby",
]

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
}


def normalize_space(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def official_mlb(url: str) -> bool:
    host = urlparse(url).netloc.lower()
    return host == "mlb.com" or host.endswith(".mlb.com")


def fetch_page(session: requests.Session, url: str) -> tuple[str, list[str]]:
    response = session.get(url, headers=HEADERS, timeout=25)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")
    chunks = [soup.get_text(" ", strip=True)]
    for script in soup.find_all("script"):
        if script.string:
            chunks.append(script.string)
    links: list[str] = []
    for anchor in soup.find_all("a", href=True):
        target = urljoin(url, anchor["href"])
        label = normalize_space(anchor.get_text(" ", strip=True)).lower()
        if official_mlb(target) and ("derby" in target.lower() or "home run" in label or "live" in label):
            links.append(target.split("#", 1)[0])
    return normalize_space(" ".join(chunks)), links


def player_window(text: str, player: str, before: int = 220, after: int = 520) -> str:
    match = re.search(re.escape(player), text, re.I)
    if not match:
        return ""
    return text[max(0, match.start() - before): min(len(text), match.end() + after)]


def parse_player(text: str, player: str) -> dict[str, Any] | None:
    window = player_window(text, player)
    if not window:
        return None
    hr_patterns = [
        rf"{re.escape(player)}.{{0,180}}?(\d{{1,2}})\s*(?:home\s*runs?|hrs?)\b",
        rf"{re.escape(player)}.{{0,180}}?(?:home\s*runs?|hrs?)\s*[:\-]?\s*(\d{{1,2}})\b",
        r"(\d{1,2})\s*(?:home\s*runs?|hrs?)\b",
        r"(?:home\s*runs?|hrs?)\s*[:\-]?\s*(\d{1,2})\b",
        r'"(?:homeRuns|homeRunCount|hr)"\s*:\s*(\d{1,2})',
    ]
    distance_patterns = [
        r"(?:longest(?:\s+distance)?|max(?:imum)?\s+distance)\s*[:\-]?\s*(\d{3})\s*(?:feet|ft)\b",
        r"(\d{3})\s*(?:feet|ft)\b",
        r'"(?:maxDistance|longestDistance|totalDistance)"\s*:\s*(\d{3})',
    ]
    hr = next((int(m.group(1)) for p in hr_patterns if (m := re.search(p, window, re.I | re.S))), None)
    distance = next((int(m.group(1)) for p in distance_patterns if (m := re.search(p, window, re.I | re.S))), None)
    return None if hr is None else {"hr": hr, "maxDistance": distance}


def build_payload() -> dict[str, Any]:
    session = requests.Session()
    queue = list(SEED_URLS)
    visited: set[str] = set()
    texts: list[str] = []
    used_urls: list[str] = []
    errors: list[str] = []

    while queue and len(visited) < 20:
        url = queue.pop(0)
        if url in visited or not official_mlb(url):
            continue
        visited.add(url)
        try:
            text, links = fetch_page(session, url)
            if text:
                texts.append(text)
                used_urls.append(url)
            for link in links:
                if link not in visited and link not in queue:
                    queue.append(link)
        except Exception as exc:  # noqa: BLE001
            errors.append(f"{url}: {exc}")

    combined = normalize_space(" ".join(texts))
    players: dict[str, Any] = {}
    for player in PLAYERS:
        parsed = parse_player(combined, player)
        if parsed:
            players[player] = parsed

    current_hitter = ""
    for player in PLAYERS:
        window = player_window(combined, player, 100, 160)
        if re.search(r"currently hitting|up next|at bat|now hitting", window, re.I):
            current_hitter = player
            break

    status = "live" if players or re.search(r"\bround\s*[123]\b|semifinal|final|currently hitting", combined, re.I) else "waiting"
    return {
        "updatedAt": datetime.now(timezone.utc).isoformat(),
        "source": "MLB.com",
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
