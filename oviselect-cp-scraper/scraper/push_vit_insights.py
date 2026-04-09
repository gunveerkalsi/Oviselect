"""
push_vit_insights.py
Creates `vit_campus_insights` table (via RPC) and pushes structured + Reddit data.
Run: python scraper/push_vit_insights.py
"""
import json, os, sys
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
sb = create_client(os.getenv("SUPABASE_URL", ""), os.getenv("SUPABASE_SERVICE_KEY", ""))

BASE = Path(__file__).resolve().parent.parent

# ── load structured campus data ──────────────────────────────────────────────
structured_path = BASE / "data" / "parsed" / "vit-campuses_structured.json"
structured = json.loads(structured_path.read_text())
campus_profiles = {c["campus_id"]: c for c in structured["campuses"]}

# ── load cleaned Reddit insights ─────────────────────────────────────────────
insights_dir = BASE / "data" / "cleaned_insights"

CAMPUSES = ["vit-vellore", "vit-chennai", "vit-amaravati", "vit-bhopal"]

rows = []
for slug in CAMPUSES:
    profile = campus_profiles.get(slug, {})
    
    # load Reddit insights
    insights_path = insights_dir / f"{slug}_insights.json"
    if insights_path.exists():
        reddit = json.loads(insights_path.read_text())
    else:
        reddit = {"themes": {}, "total_insights": 0}
    
    # load post counts from DB
    db_posts = sb.table("vit_reddit_posts").select("id", count="exact").eq("campus", slug).execute()
    total_posts = db_posts.count or 0
    
    # build full stats object — everything from structured JSON
    stats = {
        # identity
        "institute_type": profile.get("institute_type"),
        "also_known_as": profile.get("also_known_as"),
        "established_year": profile.get("established_year"),
        "city": profile.get("city"),
        "state": profile.get("state"),
        "address": profile.get("address"),
        "official_website": profile.get("official_website"),
        # location
        "nearest_airport": profile.get("nearest_airport"),
        "nearest_airport_km": profile.get("nearest_airport_km"),
        "nearest_railway_station": profile.get("nearest_railway_station"),
        "nearest_railway_km": profile.get("nearest_railway_km"),
        # rankings
        "nirf_engineering_rank": profile.get("nirf_engineering_rank"),
        "nirf_overall_rank": profile.get("nirf_overall_rank"),
        "nirf_research_rank": profile.get("nirf_research_rank"),
        "nirf_innovation_rank": profile.get("nirf_innovation_rank"),
        "nirf_note": profile.get("nirf_note"),
        "nirf_overall_rank_history": profile.get("nirf_overall_rank_history"),
        "naac_grade": profile.get("naac_grade"),
        "naac_cgpa": profile.get("naac_cgpa"),
        "naac_valid_until": profile.get("naac_valid_until"),
        # fees
        "annual_fees": profile.get("annual_fees"),
        "tuition_fee_per_sem": profile.get("tuition_fee_per_sem"),
        "hostel_fee_per_sem": profile.get("hostel_fee_per_sem"),
        "fee_note": profile.get("fee_note"),
        "fee_waivers": profile.get("fee_waivers"),
        # placements
        "overall_placement_pct": profile.get("overall_placement_pct"),
        "avg_package_lpa": profile.get("avg_package_lpa"),
        "median_package_lpa": profile.get("median_package_lpa"),
        "highest_package_lpa": profile.get("highest_package_lpa"),
        "placement_year": profile.get("placement_year"),
        "top_recruiters": profile.get("top_recruiters"),
        "year_wise_placements": profile.get("year_wise_placements"),
        "placement_officer": profile.get("placement_officer"),
        # academics
        "courses_offered": profile.get("courses_offered"),
        "ug_programmes": profile.get("ug_programmes"),
        "pg_programmes": profile.get("pg_programmes"),
        "phd_available": profile.get("phd_available"),
        "phd_seats": profile.get("phd_seats"),
        "total_students_enrolled": profile.get("total_students_enrolled"),
        "student_faculty_ratio": profile.get("student_faculty_ratio"),
        # research (Vellore has rich data)
        "research": profile.get("research"),
    }
    
    row = {
        "campus_slug": slug,
        "campus_name": profile.get("institute", slug.replace("-", " ").title()),
        "stats": json.dumps(stats),
        "reddit_insights": json.dumps(reddit.get("themes", {})),
        "total_reddit_posts": total_posts,
        "total_insights": reddit.get("total_insights", 0),
        "confidence_score": profile.get("data_confidence_score"),
    }
    rows.append(row)
    print(f"  ✓ {slug}: {total_posts} posts, {reddit.get('total_insights', 0)} insights")

# ── upsert to Supabase ──────────────────────────────────────────────────────
print(f"\nUpserting {len(rows)} campus rows to vit_campus_insights...")
try:
    resp = sb.table("vit_campus_insights").upsert(rows, on_conflict="campus_slug").execute()
    print(f"  ✓ Upserted {len(resp.data)} rows")
except Exception as e:
    if "relation" in str(e) and "does not exist" in str(e):
        print("\n[ERROR] Table 'vit_campus_insights' does not exist.")
        print("Run this SQL in Supabase SQL editor first:\n")
        print("""
CREATE TABLE vit_campus_insights (
    id              bigserial PRIMARY KEY,
    campus_slug     text UNIQUE NOT NULL,
    campus_name     text NOT NULL,
    stats           jsonb,
    reddit_insights jsonb,
    total_reddit_posts integer DEFAULT 0,
    total_insights  integer DEFAULT 0,
    confidence_score integer,
    updated_at      timestamptz DEFAULT now()
);

-- Enable RLS but allow public read
ALTER TABLE vit_campus_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON vit_campus_insights FOR SELECT USING (true);
""")
    else:
        print(f"  [ERROR] {e}")
    sys.exit(1)

print("\n✅ All VIT campus data pushed to Supabase.")
