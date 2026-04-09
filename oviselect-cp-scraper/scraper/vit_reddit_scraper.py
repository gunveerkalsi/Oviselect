"""
vit_reddit_scraper.py
Scrapes Reddit for VIT campus discussions using the public JSON API.
No Reddit credentials required — only SUPABASE_URL and SUPABASE_SERVICE_KEY in .env.

-- Run SQL below in Supabase SQL editor before first use --

CREATE TABLE IF NOT EXISTS vit_reddit_posts (
    id            bigserial PRIMARY KEY,
    campus        text NOT NULL,
    post_id       text NOT NULL,
    subreddit     text,
    post_title    text,
    post_body     text,
    score         integer,
    upvote_ratio  float,
    num_comments  integer,
    url           text,
    created_utc   timestamptz,
    search_query  text,
    top_comments  jsonb,
    multi_campus  boolean DEFAULT false,
    scraped_at    timestamptz DEFAULT now(),
    UNIQUE (campus, post_id)
);

CREATE TABLE IF NOT EXISTS vit_reddit_sentiment_prep (
    id             bigserial PRIMARY KEY,
    campus         text UNIQUE NOT NULL,
    total_posts    integer,
    total_comments integer,
    top_posts_by_score jsonb,
    all_titles     text,
    sentiment_blob text,
    last_updated   timestamptz DEFAULT now()
);
"""

import argparse
import json
import os
import re
import shutil
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

import requests
from dotenv import load_dotenv
from supabase import create_client

# ── environment ──────────────────────────────────────────────────────────────
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")

missing = [k for k, v in {"SUPABASE_URL": SUPABASE_URL, "SUPABASE_SERVICE_KEY": SUPABASE_KEY}.items() if not v]
if missing:
    print(f"[ERROR] Missing required environment variable(s): {', '.join(missing)}")
    print("        Create a .env file with SUPABASE_URL and SUPABASE_SERVICE_KEY.")
    sys.exit(1)

sb = create_client(SUPABASE_URL, SUPABASE_KEY)

# ── HTTP headers (no auth needed — uses community Reddit mirrors) ──────────────
HEADERS = {
    "User-Agent": "python:oviselect_vit_scraper:v3.0",
    "Accept": "application/json",
}

# ── data source base URLs ─────────────────────────────────────────────────────
# Arctic Shift: community Reddit data mirror, full-text search, no key required
# Pullpush.io:  Pushshift successor, used as fallback
ARCTIC_SHIFT_BASE = "https://arctic-shift.photon-reddit.com/api"
PULLPUSH_BASE     = "https://api.pullpush.io/reddit/search"

# ── campus definitions ────────────────────────────────────────────────────────
CAMPUSES = {
    "vit-vellore": {
        "name": "VIT Vellore",
        "slug": "vit-vellore",
        "queries": [
            "VIT Vellore", "VITEEE Vellore", "Vellore Institute of Technology",
            "VIT Vellore placements", "VIT Vellore CSE", "VIT Vellore review",
            "VIT Vellore hostel", "VIT Vellore fees", "VIT Vellore honest review",
        ],
        "exclusions": ["VIT Chennai", "VIT Amaravati", "VIT Bhopal", "VITAP", "VIT AP"],
    },
    "vit-chennai": {
        "name": "VIT Chennai",
        "slug": "vit-chennai",
        "queries": [
            "VIT Chennai", "VIT Vandalur", "VIT-C campus", "VIT Chennai placements",
            "VIT Chennai review", "VIT Chennai CSE", "VIT Chennai hostel",
            "VIT Chennai fees", "chennai campus VIT", "VIT Chennai vs",
        ],
        "exclusions": ["VIT Vellore", "VIT Amaravati", "VIT Bhopal", "VITAP"],
    },
    "vit-amaravati": {
        "name": "VIT Amaravati",
        "slug": "vit-amaravati",
        "queries": [
            "VIT Amaravati", "VITAP", "VIT AP", "VIT-AP", "VIT Amaravati placements",
            "VIT Amaravati review", "VITAP placements", "VITAP review",
            "VIT Amaravati CSE", "VIT AP campus", "VIT Amaravati hostel",
            "VIT Amaravati fees", "VIT Andhra Pradesh",
        ],
        "exclusions": ["VIT Vellore", "VIT Chennai", "VIT Bhopal"],
    },
    "vit-bhopal": {
        "name": "VIT Bhopal",
        "slug": "vit-bhopal",
        "queries": [
            "VIT Bhopal", "VIT Bhopal placements", "VIT Bhopal review",
            "VIT Bhopal CSE", "VIT Bhopal hostel", "VIT Bhopal fees",
            "VIT Bhopal campus", "VIT Bhopal vs", "VIT Bhopal suspension",
        ],
        "exclusions": ["VIT Vellore", "VIT Chennai", "VIT Amaravati", "VITAP"],
    },
}

SUBREDDITS = [
    "Btechtards", "JEENEETards", "developersIndia", "india",
    "IITJEE", "EngineeringStudents", "Indian_Academia", "vit", "vituniversity",
]
VIT_TOP_SUBREDDITS = ["vit", "vituniversity"]

# ── directory paths ───────────────────────────────────────────────────────────
BASE_DIR   = Path(__file__).resolve().parent.parent   # oviselect-cp-scraper/
CACHE_DIR  = BASE_DIR / "data" / "reddit_cache"
BLOB_DIR   = BASE_DIR / "data" / "sentiment_blobs"
OUT_DIR    = BASE_DIR / "data"

CACHE_DIR.mkdir(parents=True, exist_ok=True)
BLOB_DIR.mkdir(parents=True, exist_ok=True)

CACHE_TTL_DAYS = 7

# ── global stats (module-level dict avoids global keyword clutter) ────────────
_stats = {"api_calls": 0, "cache_hits": 0}


# ═══════════════════════════════════════════════════════════════════════════════
# CACHE UTILITIES
# ═══════════════════════════════════════════════════════════════════════════════

def _slugify(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", text.lower()).strip("_")[:60]


def _cache_path_search(campus_slug: str, subreddit: str, query: str) -> Path:
    d = CACHE_DIR / campus_slug
    d.mkdir(parents=True, exist_ok=True)
    return d / f"{_slugify(subreddit)}_{_slugify(query)}.json"


def _cache_path_top(subreddit: str) -> Path:
    d = CACHE_DIR / "_top"
    d.mkdir(parents=True, exist_ok=True)
    return d / f"{_slugify(subreddit)}_top.json"


def _cache_path_comments(post_id: str) -> Path:
    d = CACHE_DIR / "comments"
    d.mkdir(parents=True, exist_ok=True)
    return d / f"{post_id}.json"


def _cache_fresh(path: Path) -> bool:
    if not path.exists():
        return False
    age_days = (time.time() - path.stat().st_mtime) / 86400
    return age_days < CACHE_TTL_DAYS


def _cache_read(path: Path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def _cache_write(path: Path, data) -> None:
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f)


# ═══════════════════════════════════════════════════════════════════════════════
# HTTP LAYER  (rate-limit-aware, max 3 retries, no auth needed)
# ═══════════════════════════════════════════════════════════════════════════════

def _api_get(url: str, params: dict | None = None, label: str = "") -> dict | list | None:
    """GET with retry logic. Returns parsed JSON on success, None on failure."""
    max_retries = 3
    for attempt in range(1, max_retries + 1):
        try:
            resp = requests.get(url, params=params, headers=HEADERS, timeout=20)
            _stats["api_calls"] += 1
            time.sleep(1)

            if resp.status_code == 200:
                return resp.json()
            elif resp.status_code == 429:
                wait = int(resp.headers.get("Retry-After", 60))
                print(f"  [429] Rate-limited — sleeping {wait} s  (attempt {attempt}/{max_retries})")
                time.sleep(wait)
            elif resp.status_code in (502, 503):
                print(f"  [{resp.status_code}] Unavailable — sleeping 30 s  (attempt {attempt}/{max_retries})")
                time.sleep(30)
            else:
                print(f"  [HTTP {resp.status_code}] {label or url[:80]} — skipping")
                return None
        except Exception as exc:
            print(f"  [ERR] {exc} — attempt {attempt}/{max_retries}")
            time.sleep(2)
    print(f"  [FAIL] Permanently failed: {label or url[:80]}")
    return None


# ═══════════════════════════════════════════════════════════════════════════════
# POST NORMALISATION (Arctic Shift / Pullpush → Reddit-compatible dict)
# ═══════════════════════════════════════════════════════════════════════════════

def _norm_arctic(p: dict) -> dict:
    return {
        "id":           p.get("id", ""),
        "title":        p.get("title", ""),
        "selftext":     p.get("selftext") or p.get("body") or "",
        "score":        int(p.get("score") or 0),
        "upvote_ratio": p.get("upvote_ratio"),
        "num_comments": int(p.get("num_comments") or 0),
        "permalink":    p.get("permalink", ""),
        "author":       p.get("author", ""),
        "created_utc":  int(p.get("created_utc") or 0),
        "subreddit":    p.get("subreddit", ""),
    }


def _norm_pullpush(p: dict) -> dict:
    sub = p.get("subreddit", "")
    pid = p.get("id", "")
    slug = re.sub(r"[^a-z0-9]+", "_", (p.get("title", "") or "")[:50].lower())
    permalink = p.get("permalink") or f"/r/{sub}/comments/{pid}/{slug}/"
    return {
        "id":           pid,
        "title":        p.get("title", ""),
        "selftext":     p.get("selftext") or p.get("body") or "",
        "score":        int(p.get("score") or 0),
        "upvote_ratio": None,
        "num_comments": int(p.get("num_comments") or 0),
        "permalink":    permalink,
        "author":       p.get("author", ""),
        "created_utc":  int(p.get("created_utc") or 0),
        "subreddit":    sub,
    }


# ═══════════════════════════════════════════════════════════════════════════════
# FETCH HELPERS
# ═══════════════════════════════════════════════════════════════════════════════

def _search_arctic(query: str, subreddit: str | None, limit: int = 100) -> list[dict]:
    """
    Search via Arctic Shift API.
    - Requires subreddit when using query param.
    - sort=desc means newest first (Arctic Shift sorts by date).
    Returns normalised posts, or [] if subreddit is None (Arctic doesn't support global search).
    """
    if not subreddit:
        return []  # Arctic Shift requires subreddit; Pullpush handles global
    params: dict = {
        "query":     query,
        "subreddit": subreddit,
        "limit":     str(limit),
        "sort":      "desc",
    }
    data = _api_get(f"{ARCTIC_SHIFT_BASE}/posts/search", params,
                    label=f"arctic/r/{subreddit}/{query[:30]}")
    if not isinstance(data, dict) or not isinstance(data.get("data"), list):
        return []
    return [_norm_arctic(p) for p in data["data"] if p.get("id")]


def _search_pullpush(query: str, subreddit: str | None, limit: int = 100) -> list[dict]:
    """Search via Pullpush API (supports global search). Returns normalised posts."""
    params: dict = {"q": query, "size": min(limit, 100), "sort": "score", "order": "desc"}
    if subreddit:
        params["subreddit"] = subreddit
    data = _api_get(f"{PULLPUSH_BASE}/submission/", params,
                    label=f"pullpush/{subreddit or 'global'}/{query[:30]}")
    if not isinstance(data, dict) or not isinstance(data.get("data"), list):
        return []
    return [_norm_pullpush(p) for p in data["data"] if p.get("id")]


def fetch_search(campus_slug: str, subreddit: str | None, query: str,
                 from_cache: bool = False) -> list[dict]:
    """
    Search for posts about a query (subreddit-scoped or global).
    Tries Arctic Shift first (subreddit-scoped only), falls back to Pullpush.io.
    Returns list of normalised post dicts.
    """
    label = subreddit or "global"
    cache_path = _cache_path_search(campus_slug, label, query)

    if _cache_fresh(cache_path):
        print(f"  [cache hit] {cache_path.name}")
        _stats["cache_hits"] += 1
        cached = _cache_read(cache_path)
        return cached if isinstance(cached, list) else []

    if from_cache:
        return []

    print(f"  Searching r/{label!s:<18} — \"{query}\"")
    posts = _search_arctic(query, subreddit)
    if not posts:
        posts = _search_pullpush(query, subreddit)

    _cache_write(cache_path, posts)
    return posts


def fetch_top(subreddit: str, from_cache: bool = False) -> list[dict]:
    """Fetch recent posts for a subreddit via Arctic Shift (falls back to Pullpush)."""
    cache_path = _cache_path_top(subreddit)

    if _cache_fresh(cache_path):
        print(f"  [cache hit] top/{subreddit}")
        _stats["cache_hits"] += 1
        cached = _cache_read(cache_path)
        return cached if isinstance(cached, list) else []

    if from_cache:
        return []

    print(f"  Fetching top posts from r/{subreddit}")
    params: dict = {"subreddit": subreddit, "limit": "100", "sort": "desc"}
    data = _api_get(f"{ARCTIC_SHIFT_BASE}/posts/search", params,
                    label=f"arctic/top/{subreddit}")
    if not isinstance(data, dict) or not isinstance(data.get("data"), list):
        posts: list = _search_pullpush("", subreddit, limit=100)
    else:
        posts = [_norm_arctic(p) for p in data["data"] if p.get("id")]

    _cache_write(cache_path, posts)
    return posts


# ═══════════════════════════════════════════════════════════════════════════════
# POST FILTERING
# ═══════════════════════════════════════════════════════════════════════════════

def _text(post: dict) -> str:
    return f"{post.get('title', '')} {post.get('selftext', '')}".lower()


def post_passes_filter(post: dict, campus: dict) -> bool:
    """Return True if post is relevant to this campus."""
    txt = _text(post)

    # must contain at least one campus search term
    if not any(q.lower() in txt for q in campus["queries"]):
        return False

    # check exclusions (allow if campus term freq > exclusion term freq)
    for excl in campus["exclusions"]:
        if excl.lower() in txt:
            excl_freq = txt.count(excl.lower())
            campus_freq = sum(txt.count(q.lower()) for q in campus["queries"])
            if excl_freq >= campus_freq:
                return False

    # score filter
    if post.get("score", 0) < 2:
        return False

    # thin link-post filter
    if not post.get("selftext", "").strip() and len(post.get("title", "")) < 15:
        return False

    return True


def detect_campuses(post: dict) -> list[str]:
    """Return all campus slugs that this post appears to discuss."""
    txt = _text(post)
    found = []
    for slug, campus in CAMPUSES.items():
        if any(q.lower() in txt for q in campus["queries"]):
            found.append(slug)
    return found


# ═══════════════════════════════════════════════════════════════════════════════
# COMMENT FETCHING  (Arctic Shift comments API — flat list, no tree needed)
# ═══════════════════════════════════════════════════════════════════════════════

def fetch_comments(post: dict, from_cache: bool = False) -> list[dict]:
    """
    Fetch top comments for a post via Arctic Shift comments search API.
    Returns up to 25 comments sorted by score descending.
    """
    post_id = post.get("id", "")
    op_name = post.get("author", "")
    cache_path = _cache_path_comments(post_id)

    if _cache_fresh(cache_path):
        _stats["cache_hits"] += 1
        raw: list = _cache_read(cache_path)
    elif from_cache:
        return []
    else:
        params = {
            "link_id": f"t3_{post_id}",
            "limit":   "100",
        }
        data = _api_get(f"{ARCTIC_SHIFT_BASE}/comments/search", params,
                        label=f"arctic/comments/{post_id}")
        raw = data.get("data", []) if isinstance(data, dict) else []
        _cache_write(cache_path, raw)

    comments = []
    for c in raw:
        body = (c.get("body") or "").strip()
        if body in {"[deleted]", "[removed]", ""}:
            continue
        score = int(c.get("score") or 0)
        if score < 1:
            continue
        comments.append({
            "comment_id":  c.get("id"),
            "body":        body[:2000],
            "score":       score,
            "created_utc": _ts_iso(c.get("created_utc")),
            "is_op":       c.get("author") == op_name,
            "depth":       0,
        })

    comments.sort(key=lambda c: c["score"], reverse=True)
    comments = comments[:25]
    title_short = post.get("title", "")[:50]
    print(f"    ↳ \"{title_short}\" — {len(comments)} comment(s)")
    return comments


# ═══════════════════════════════════════════════════════════════════════════════
# HELPERS
# ═══════════════════════════════════════════════════════════════════════════════

def _ts_iso(ts) -> str | None:
    if ts is None:
        return None
    try:
        return datetime.fromtimestamp(float(ts), tz=timezone.utc).isoformat()
    except Exception:
        return None


def _build_row(post: dict, campus_slug: str, query: str,
               comments: list[dict], multi: bool) -> dict:
    body = (post.get("selftext") or "")[:5000]
    return {
        "campus":       campus_slug,
        "post_id":      post.get("id"),
        "subreddit":    post.get("subreddit"),
        "post_title":   post.get("title"),
        "post_body":    body,
        "score":        post.get("score"),
        "upvote_ratio": post.get("upvote_ratio"),
        "num_comments": post.get("num_comments"),
        "url":          f"https://www.reddit.com{post.get('permalink', '')}",
        "created_utc":  _ts_iso(post.get("created_utc")),
        "search_query": query,
        "top_comments": json.dumps(comments),
        "multi_campus": multi,
        "scraped_at":   datetime.now(tz=timezone.utc).isoformat(),
    }


# ═══════════════════════════════════════════════════════════════════════════════
# SUPABASE OPS
# ═══════════════════════════════════════════════════════════════════════════════

def upsert_posts(rows: list[dict], dry_run: bool = False) -> None:
    if not rows:
        return
    if dry_run:
        print(f"  [dry-run] would upsert {len(rows)} rows → vit_reddit_posts")
        return
    sb.table("vit_reddit_posts").upsert(rows, on_conflict="campus,post_id").execute()
    print(f"  ✓ Upserted {len(rows)} rows → vit_reddit_posts")


def upsert_sentiment_prep(campus_slug: str, rows: list[dict],
                          blob: str, dry_run: bool = False) -> None:
    total_comments = sum(len(json.loads(r.get("top_comments", "[]"))) for r in rows)
    top10 = sorted(rows, key=lambda r: r.get("score") or 0, reverse=True)[:10]
    top10_payload = [{"title": r["post_title"], "url": r["url"], "score": r["score"]} for r in top10]
    all_titles = "\n".join(r["post_title"] or "" for r in rows)
    record = {
        "campus":         campus_slug,
        "total_posts":    len(rows),
        "total_comments": total_comments,
        "top_posts_by_score": json.dumps(top10_payload),
        "all_titles":     all_titles,
        "sentiment_blob": blob,
        "last_updated":   datetime.now(tz=timezone.utc).isoformat(),
    }
    if dry_run:
        print(f"  [dry-run] would upsert sentiment_prep for {campus_slug}")
        return
    sb.table("vit_reddit_sentiment_prep").upsert(record, on_conflict="campus").execute()
    print(f"  ✓ Upserted sentiment_prep → {campus_slug}")


# ═══════════════════════════════════════════════════════════════════════════════
# SENTIMENT BLOB
# ═══════════════════════════════════════════════════════════════════════════════

def build_sentiment_blob(campus_name: str, rows: list[dict]) -> str:
    sorted_rows = sorted(rows, key=lambda r: r.get("score") or 0, reverse=True)[:50]
    total_comments = sum(len(json.loads(r.get("top_comments", "[]"))) for r in rows)
    lines = [
        f"CAMPUS: {campus_name}",
        f"Total posts: {len(rows)} | Total comments included: {total_comments}",
        "=" * 70,
    ]
    for row in sorted_rows:
        lines.append(f"\nTITLE: {row.get('post_title', '')}")
        lines.append(f"r/{row.get('subreddit', '')} | score: {row.get('score', 0)}")
        body = (row.get("post_body") or "").strip()
        if body:
            lines.append(body[:1000])
        comments = json.loads(row.get("top_comments", "[]"))
        for c in comments:
            lines.append(f"  - [{c.get('score', 0)}] {c.get('body', '')}")
        lines.append("-" * 70)
    return "\n".join(lines)


def write_blob_file(campus_slug: str, blob: str) -> None:
    path = BLOB_DIR / f"{campus_slug}_sentiment.txt"
    path.write_text(blob, encoding="utf-8")
    print(f"  ✓ Blob written → {path}")


# ═══════════════════════════════════════════════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════════════════════════════════════════════

def build_summary(all_rows: dict[str, list[dict]]) -> dict:
    summary = {}
    for slug, rows in all_rows.items():
        if not rows:
            continue
        sr_dist: dict[str, int] = {}
        q_dist:  dict[str, int] = {}
        dates = []
        for r in rows:
            sr_dist[r.get("subreddit") or "unknown"] = sr_dist.get(r.get("subreddit") or "unknown", 0) + 1
            q_dist[r.get("search_query") or ""] = q_dist.get(r.get("search_query") or "", 0) + 1
            if r.get("created_utc"):
                dates.append(r["created_utc"])
        dates.sort()
        top10 = sorted(rows, key=lambda r: r.get("score") or 0, reverse=True)[:10]
        summary[slug] = {
            "total_posts":    len(rows),
            "total_comments": sum(len(json.loads(r.get("top_comments", "[]"))) for r in rows),
            "top_10_posts":   [{"title": r["post_title"], "url": r["url"], "score": r["score"]} for r in top10],
            "subreddit_dist": sr_dist,
            "query_dist":     q_dist,
            "date_range":     {"oldest": dates[0] if dates else None, "newest": dates[-1] if dates else None},
        }
    return summary


# ═══════════════════════════════════════════════════════════════════════════════
# CAMPUS ORCHESTRATOR
# ═══════════════════════════════════════════════════════════════════════════════

def scrape_campus(campus_slug: str, args) -> list[dict]:
    campus = CAMPUSES[campus_slug]
    print(f"\n{'═'*70}")
    print(f"  CAMPUS: {campus['name']}")
    print(f"{'═'*70}")

    if args.force_refresh:
        campus_cache = CACHE_DIR / campus_slug
        if campus_cache.exists():
            shutil.rmtree(campus_cache)
            print(f"  [force-refresh] cleared cache for {campus_slug}")

    seen_ids: set[str] = set()
    raw_posts: list[tuple[dict, str]] = []   # (post, query)

    # subreddit-restricted searches
    for query in campus["queries"]:
        for sub in SUBREDDITS:
            posts = fetch_search(campus_slug, sub, query, from_cache=args.from_cache)
            new = [(p, query) for p in posts if p.get("id") not in seen_ids]
            dupes = len(posts) - len(new)
            passed = [(p, q) for p, q in new if post_passes_filter(p, campus)]
            for p, q in passed:
                seen_ids.add(p["id"])
            raw_posts.extend(passed)
            print(f"    r/{sub:<20} q=\"{query[:30]}\" → raw={len(posts)} pass={len(passed)} dup={dupes}")

    # global searches
    for query in campus["queries"]:
        posts = fetch_search(campus_slug, None, query, from_cache=args.from_cache)
        new = [(p, query) for p in posts if p.get("id") not in seen_ids]
        passed = [(p, q) for p, q in new if post_passes_filter(p, campus)]
        for p, q in passed:
            seen_ids.add(p["id"])
        raw_posts.extend(passed)

    # top posts from community subreddits
    for sub in VIT_TOP_SUBREDDITS:
        posts = fetch_top(sub, from_cache=args.from_cache)
        new = [(p, f"top/{sub}") for p in posts if p.get("id") not in seen_ids]
        passed = [(p, q) for p, q in new if post_passes_filter(p, campus)]
        for p, q in passed:
            seen_ids.add(p["id"])
        raw_posts.extend(passed)

    if args.limit:
        raw_posts = raw_posts[: args.limit]

    # fetch comments and build rows
    rows: list[dict] = []
    for post, query in raw_posts:
        other_campuses = [s for s in detect_campuses(post) if s != campus_slug]
        multi = len(other_campuses) > 0
        if args.skip_comments:
            comments = []
        else:
            comments = fetch_comments(post, from_cache=args.from_cache)
        rows.append(_build_row(post, campus_slug, query, comments, multi))

    # persist
    upsert_posts(rows, dry_run=args.dry_run)
    blob = build_sentiment_blob(campus["name"], rows)
    write_blob_file(campus_slug, blob)
    upsert_sentiment_prep(campus_slug, rows, blob, dry_run=args.dry_run)

    total_comments = sum(len(json.loads(r.get("top_comments", "[]"))) for r in rows)
    print(f"\n  ┌─ SUMMARY: {campus['name']}")
    print(f"  │  Posts collected : {len(rows)}")
    print(f"  │  Comments kept   : {total_comments}")
    print(f"  │  API calls       : {_stats['api_calls']}")
    print(f"  └─ Cache hits      : {_stats['cache_hits']}")
    return rows


# ═══════════════════════════════════════════════════════════════════════════════
# CLI + MAIN
# ═══════════════════════════════════════════════════════════════════════════════

def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description="Scrape Reddit for VIT campus posts → Supabase")
    p.add_argument("--campus", default="all",
                   choices=list(CAMPUSES.keys()) + ["all"],
                   help="Which campus to scrape (default: all)")
    p.add_argument("--from-cache", action="store_true",
                   help="Skip all network requests; use only cached files")
    p.add_argument("--force-refresh", action="store_true",
                   help="Delete cache for specified campus and re-fetch everything")
    p.add_argument("--skip-comments", action="store_true",
                   help="Skip comment fetching (fast first pass)")
    p.add_argument("--dry-run", action="store_true",
                   help="Parse and print results without writing to Supabase")
    p.add_argument("--limit", type=int, default=None,
                   help="Cap posts per campus (useful for testing)")
    return p


def main() -> None:
    args = build_parser().parse_args()
    slugs = list(CAMPUSES.keys()) if args.campus == "all" else [args.campus]

    all_rows: dict[str, list[dict]] = {}
    for slug in slugs:
        all_rows[slug] = scrape_campus(slug, args)

    summary = build_summary(all_rows)
    out_path = OUT_DIR / "vit_reddit_summary.json"
    out_path.write_text(json.dumps(summary, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"\n{'═'*70}")
    print("  FINAL SUMMARY")
    print(f"{'═'*70}")
    for slug, info in summary.items():
        print(f"  {CAMPUSES[slug]['name']:<22} posts={info['total_posts']}  comments={info['total_comments']}")
    print(f"\n  Summary JSON  → {out_path}")
    print(f"  API calls     : {_stats['api_calls']}")
    print(f"  Cache hits    : {_stats['cache_hits']}")


if __name__ == "__main__":
    main()

