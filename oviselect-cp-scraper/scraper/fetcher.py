"""HTTP fetcher with local file caching for CollegePravesh pages."""

from __future__ import annotations

import random
import time
from pathlib import Path

import cloudscraper
from bs4 import BeautifulSoup
from loguru import logger
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
)

from config.settings import CACHE_DIR, CP_BASE_URL, HEADERS


class RateLimitError(Exception):
    """Raised on HTTP 429."""


# Use cloudscraper to bypass Cloudflare protection
_scraper = cloudscraper.create_scraper(
    browser={"browser": "chrome", "platform": "darwin", "mobile": False},
)
_scraper.headers.update(HEADERS)


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=10, min=10, max=120),
    retry=retry_if_exception_type((RateLimitError,)),
    reraise=True,
)
def _fetch_with_retry(url: str):
    """GET with tenacity retry on 429/403."""
    resp = _scraper.get(url, timeout=30)
    if resp.status_code == 429:
        logger.warning(f"429 rate-limited on {url} — backing off")
        raise RateLimitError(f"429 for {url}")
    if resp.status_code == 403:
        logger.warning(f"403 on {url} — retrying with backoff")
        raise RateLimitError(f"403 for {url}")
    return resp


def fetch_page(
    slug: str,
    *,
    force_refresh: bool = False,
    from_cache: bool = False,
) -> BeautifulSoup | None:
    """Fetch a CollegePravesh page, using local cache when available.

    Args:
        slug: The URL slug (e.g. "nit-trichy").
        force_refresh: If True, ignore cache and re-fetch.
        from_cache: If True, only read from cache — never make HTTP requests.

    Returns:
        Parsed BeautifulSoup or None on failure.
    """
    cache_file: Path = CACHE_DIR / f"{slug}.html"

    # ── Read from cache ──────────────────────────────────────
    if not force_refresh and cache_file.exists():
        logger.debug(f"[{slug}] Cache hit → {cache_file.name}")
        html = cache_file.read_text(encoding="utf-8")
        return BeautifulSoup(html, "lxml")

    if from_cache:
        logger.warning(f"[{slug}] No cache file and --from-cache set — skipping")
        return None

    # ── Fetch from web ───────────────────────────────────────
    url = f"{CP_BASE_URL}/{slug}/"
    logger.info(f"[{slug}] Fetching {url}")

    try:
        resp = _fetch_with_retry(url)
    except RateLimitError:
        logger.error(f"[{slug}] Still 429 after retries — giving up")
        return None
    except requests.RequestException as e:
        logger.error(f"[{slug}] Request failed: {e}")
        return None

    if resp.status_code == 404:
        logger.warning(f"[{slug}] 404 — wrong slug or page removed")
        return None

    if resp.status_code != 200:
        logger.error(f"[{slug}] HTTP {resp.status_code}")
        return None

    # ── Save to cache ────────────────────────────────────────
    html = resp.text
    if not html or not html.strip().startswith("<!") and not html.strip().startswith("<html"):
        # Fallback: try decoding content manually
        try:
            html = resp.content.decode("utf-8")
        except Exception:
            logger.error(f"[{slug}] Response is not valid HTML text")
            return None

    cache_file.write_text(html, encoding="utf-8")
    logger.info(f"[{slug}] Cached → {cache_file.name} ({len(html)} chars)")

    # Polite delay
    delay = random.uniform(3, 6)
    logger.debug(f"[{slug}] Sleeping {delay:.1f}s")
    time.sleep(delay)

    return BeautifulSoup(html, "lxml")

