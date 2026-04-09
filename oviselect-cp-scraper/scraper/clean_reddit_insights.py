"""
clean_reddit_insights.py
Reads raw scraped Reddit data from Supabase → filters out noise → outputs
categorised "unhinged insights" per campus that you can't find on any
official website.

Usage:
    python scraper/clean_reddit_insights.py           # all campuses
    python scraper/clean_reddit_insights.py vit-bhopal # single campus
"""

import json, os, re, sys
from datetime import datetime, timezone
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
sb = create_client(os.getenv("SUPABASE_URL", ""), os.getenv("SUPABASE_SERVICE_KEY", ""))

OUT_DIR = Path(__file__).resolve().parent.parent / "data" / "cleaned_insights"
OUT_DIR.mkdir(parents=True, exist_ok=True)

# ── theme keywords (order = priority) ────────────────────────────────────────
THEMES = {
    "placements_reality": [
        "placement", "placed", "lpa", "ctc", "package", "recruit", "hire",
        "offer", "mass recruit", "tcs", "infosys", "wipro", "superdream",
        "dream offer", "off campus", "oncampus", "ppo", "intern",
    ],
    "hostel_and_food": [
        "hostel", "mess", "food", "canteen", "warden", "room", "laundry",
        "washroom", "hygiene", "cockroach", "rat", "wifi", "water",
        "jaundice", "sick", "bathroom", "block", "curfew",
    ],
    "fees_and_money": [
        "fee", "tuition", "category", "cat 1", "cat 2", "cat 3", "cat 4",
        "cat 5", "scholarship", "refund", "expensive", "lakh", "lakhs",
        "money", "afford", "loan", "financial",
    ],
    "faculty_and_academics": [
        "faculty", "professor", "prof", "teacher", "cgpa", "gpa", "attendance",
        "grade", "grading", "ffcs", "curriculum", "lab", "course", "elective",
        "exam", "cat exam", "fat exam", "assignment",
    ],
    "campus_life_and_culture": [
        "fest", "riviera", "club", "committee", "campus", "life",
        "bangalore", "social", "dating", "culture", "crowd", "peer",
        "friend", "senior", "ragging", "bully", "party", "alcohol",
    ],
    "safety_and_controversy": [
        "protest", "death", "suicide", "fir", "police", "beaten", "scam",
        "fake", "rigged", "corrupt", "suspend", "expel", "debar",
        "unsafe", "threat", "violence",
    ],
    "infrastructure": [
        "infra", "building", "ac", "gym", "sports", "ground", "library",
        "transport", "bus", "metro", "location", "city", "rural",
        "construction", "lab", "equipment",
    ],
    "admission_reality": [
        "viteee", "rank", "category", "counselling", "seat", "branch",
        "cse", "ece", "eee", "mechanical", "cutoff", "admission",
        "management quota", "spot round",
    ],
}

# ── noise filters ────────────────────────────────────────────────────────────
NOISE_TITLE_PATTERNS = [
    r"^(help|please|urgent|should i)",
    r"bitsat.*prediction",
    r"^mht.cet|^jee.*score|^neet",
    r"what laptop",
    r"^congratulations",
]
NOISE_TITLE_RE = re.compile("|".join(NOISE_TITLE_PATTERNS), re.I)

JUNK_COMMENT_RE = re.compile(
    r"\[img\]\(emote\|.*?\)|https?://preview\.redd\.it/\S+|"
    r"https?://i\.redd\.it/\S+|!\[img\]\(emote\|.*?\)", re.I
)

MIN_COMMENT_LEN   = 30   # chars
MIN_COMMENT_SCORE  = 3
MIN_POST_SCORE     = 5
MAX_COMMENTS_PER   = 8   # per post


def _clean_text(t: str) -> str:
    """Strip Reddit artifacts, image links, broken markdown."""
    t = JUNK_COMMENT_RE.sub("", t)
    t = re.sub(r"\n{3,}", "\n\n", t)
    t = re.sub(r"&amp;", "&", t)
    t = re.sub(r"&gt;", ">", t)
    t = re.sub(r"&lt;", "<", t)
    return t.strip()


def _classify_theme(title: str, body: str, comments_text: str) -> str:
    blob = f"{title} {body} {comments_text}".lower()
    scores = {}
    for theme, keywords in THEMES.items():
        scores[theme] = sum(blob.count(kw) for kw in keywords)
    best = max(scores, key=scores.get)
    return best if scores[best] > 0 else "general"


def _is_noise_post(title: str, body: str, score: int) -> bool:
    if score < MIN_POST_SCORE:
        return True
    if NOISE_TITLE_RE.search(title or ""):
        return True
    combined = f"{title} {body}".lower()
    # posts that are purely about JEE/NEET with no campus insight
    if ("jee" in combined or "neet" in combined) and "vit" not in combined:
        return True
    return False


def _is_noise_comment(body: str, score: int) -> bool:
    if score < MIN_COMMENT_SCORE:
        return True
    clean = _clean_text(body)
    if len(clean) < MIN_COMMENT_LEN:
        return True
    # pure hindi reactions with no insight
    if re.match(r"^(same|yup|yes|no|true|lmao|bro|bruh|this|fr|real)\s*$", clean, re.I):
        return True
    return False


def _dedup_posts(posts: list[dict]) -> list[dict]:
    """Remove posts with nearly identical titles (first 60 chars)."""
    seen = set()
    out = []
    for p in posts:
        key = re.sub(r"\W+", "", (p.get("post_title") or "")[:60].lower())
        if key in seen:
            continue
        seen.add(key)
        out.append(p)
    return out


def process_campus(slug: str) -> dict:
    """Fetch, clean, categorise, and return structured insights for one campus."""
    print(f"\n{'='*60}")
    print(f"  Processing: {slug}")
    print(f"{'='*60}")

    # pull everything from Supabase
    resp = sb.table("vit_reddit_posts").select("*").eq("campus", slug).execute()
    raw_posts = resp.data or []
    print(f"  Raw posts from DB: {len(raw_posts)}")

    # dedup
    posts = _dedup_posts(raw_posts)
    print(f"  After dedup:       {len(posts)}")

    # bucket by theme
    themed: dict[str, list] = {t: [] for t in THEMES}
    themed["general"] = []
    skipped = 0

    for p in posts:
        title = p.get("post_title") or ""
        body  = p.get("post_body") or ""
        score = p.get("score") or 0

        if _is_noise_post(title, body, score):
            skipped += 1
            continue

        # clean comments
        raw_comments = json.loads(p.get("top_comments") or "[]")
        good_comments = []
        all_comment_text = ""
        for c in raw_comments:
            cbody = c.get("body", "")
            cscore = c.get("score", 0)
            if _is_noise_comment(cbody, cscore):
                continue
            cleaned = _clean_text(cbody)
            good_comments.append({"text": cleaned[:500], "score": cscore})
            all_comment_text += " " + cleaned

        # skip if post + comments have nothing substantive
        if not body.strip() and not good_comments:
            skipped += 1
            continue

        theme = _classify_theme(title, body, all_comment_text)
        good_comments.sort(key=lambda c: c["score"], reverse=True)

        entry = {
            "title":    title,
            "body":     _clean_text(body)[:800],
            "score":    score,
            "url":      p.get("url", ""),
            "date":     (p.get("created_utc") or "")[:10],
            "subreddit": p.get("subreddit", ""),
            "comments": good_comments[:MAX_COMMENTS_PER],
        }
        themed[theme].append(entry)

    # sort each theme by score desc
    for t in themed:
        themed[t].sort(key=lambda e: e["score"], reverse=True)

    total_kept = sum(len(v) for v in themed.values())
    print(f"  Noise filtered:    {skipped}")
    print(f"  Insights kept:     {total_kept}")
    for t, entries in themed.items():
        if entries:
            print(f"    {t:30s} → {len(entries)} posts")

    return themed


def write_insight_txt(slug: str, themed: dict) -> Path:
    """Write a human-readable insights file — the stuff you CANNOT find online."""
    path = OUT_DIR / f"{slug}_insights.txt"
    lines = [
        f"{'='*70}",
        f"  UNFILTERED REDDIT INSIGHTS — {slug.upper().replace('-', ' ')}",
        f"  Generated: {datetime.now(tz=timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}",
        f"{'='*70}",
        "",
    ]

    for theme, entries in themed.items():
        if not entries:
            continue
        label = theme.upper().replace("_", " ")
        lines.append(f"\n{'─'*70}")
        lines.append(f"  📌 {label}  ({len(entries)} posts)")
        lines.append(f"{'─'*70}")

        for e in entries[:15]:  # top 15 per theme
            lines.append(f"\n★ [{e['score']}] {e['title']}")
            lines.append(f"  r/{e['subreddit']} | {e['date']} | {e['url']}")
            if e["body"]:
                lines.append(f"\n  {e['body'][:400]}")
            for c in e["comments"]:
                lines.append(f"\n    → [{c['score']}] {c['text'][:300]}")
            lines.append("")

    path.write_text("\n".join(lines), encoding="utf-8")
    print(f"  ✓ Written: {path}")
    return path


def write_insight_json(slug: str, themed: dict) -> Path:
    """Write structured JSON for programmatic use."""
    path = OUT_DIR / f"{slug}_insights.json"
    # strip empty themes
    clean = {t: entries for t, entries in themed.items() if entries}
    payload = {
        "campus": slug,
        "generated_utc": datetime.now(tz=timezone.utc).isoformat(),
        "total_insights": sum(len(v) for v in clean.values()),
        "themes": clean,
    }
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"  ✓ Written: {path}")
    return path


# ── main ─────────────────────────────────────────────────────────────────────
CAMPUS_SLUGS = ["vit-vellore", "vit-chennai", "vit-amaravati", "vit-bhopal"]

if __name__ == "__main__":
    targets = sys.argv[1:] if len(sys.argv) > 1 else CAMPUS_SLUGS
    for slug in targets:
        themed = process_campus(slug)
        write_insight_txt(slug, themed)
        write_insight_json(slug, themed)

    print(f"\n{'='*60}")
    print("  ALL DONE — cleaned insights in data/cleaned_insights/")
    print(f"{'='*60}")
