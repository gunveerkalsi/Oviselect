"""
update_placement_data.py
Updates VIT campus placement data in Supabase with latest 2026 stats
from official sources, NDTV, Careers360, Shiksha, Campusoption.
"""
import json, os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
sb = create_client(os.getenv("SUPABASE_URL", ""), os.getenv("SUPABASE_SERVICE_KEY", ""))

SOURCE_LINKS = [
    {"label": "VIT 2026 Batch Placement Tracker (Reddit)", "url": "https://www.reddit.com/r/Btechtards/s/TTMWOdJbjm"},
    {"label": "B.Tech 2026 Placements Tracker (Streamlit)", "url": "https://placements-tracker-btech2026.streamlit.app/"},
    {"label": "VIT Official CDC Tracker", "url": "https://vit.ac.in/cdc-tracker"},
    {"label": "VIT Placement Log 2026", "url": "https://placementlog.vercel.app/placement-stats"},
]

# ── Updated placement data per campus (2026 batch, latest available) ─────
UPDATES = {
    "vit-vellore": {
        "avg_package_lpa": 9.6,
        "median_package_lpa": 9.15,
        "highest_package_lpa": 100,  # ₹1 Cr
        "overall_placement_pct": 90,
        "placement_year": "2026",
        "total_offers": 10071,
        "companies_visited": 701,
        "marquee_offers": 696,  # CTC ≥ 20 LPA
        "super_dream_offers": 2292,  # CTC ≥ 10 LPA
        "dream_offers": 3333,  # CTC ≥ 6 LPA
        "placement_note": "4th time crossing 10,000 offers. Limca Book of Records holder for highest placements from single institution.",
        "top_recruiters": [
            "Microsoft", "Amazon", "Google", "Goldman Sachs", "JPMorgan",
            "Intel", "PayPal", "Cisco", "Deloitte", "Accenture",
            "TCS", "Infosys", "Wipro", "DE Shaw", "Krypto",
        ],
        "year_wise_placements": [
            {"year": "2026", "highest_package": "₹1 Cr", "total_offers": 10071, "companies": 701, "marquee_offers": 696, "super_dream": 2292},
            {"year": "2025", "highest_package": "₹1 Cr", "avg_package": 9.9, "companies": 868, "students_placed": 11140, "super_dream": 3563},
            {"year": "2024", "highest_package": "₹1.02 Cr", "avg_package": 9.6, "companies": 945, "students_placed": 8938, "super_dream": 4480},
            {"year": "2023", "highest_package": "₹1.2 Cr", "avg_package": 9.23, "total_offers": 14345, "companies": 904},
            {"year": "2022", "highest_package": "₹75 LPA", "total_offers": 717, "companies": 658},
        ],
        "placement_sources": SOURCE_LINKS,
    },
    "vit-chennai": {
        "avg_package_lpa": 9.9,
        "median_package_lpa": 8.99,
        "highest_package_lpa": 88,
        "overall_placement_pct": 85,
        "placement_year": "2026",
        "companies_visited": 867,
        "students_placed": 7526,
        "super_dream_offers": 3362,
        "placement_note": "Centralized placement with Vellore. Same companies recruit across all 4 campuses.",
        "top_recruiters": [
            "Microsoft", "Amazon", "Krypto", "PayPal", "Cisco",
            "Goldman Sachs", "Deloitte", "TCS", "Infosys", "Wipro",
        ],
        "year_wise_placements": [
            {"year": "2024", "highest_package": "₹88 LPA", "avg_package": 9.9, "companies": 867, "students_placed": 7526, "super_dream": 3362},
            {"year": "2023", "highest_package": "₹1.02 Cr", "avg_package": 9.23, "total_offers": 14345, "companies": 904},
            {"year": "2022", "highest_package": "₹75 LPA"},
        ],
        "placement_sources": SOURCE_LINKS,
    },
    "vit-amaravati": {
        "avg_package_lpa": 14.43,
        "highest_package_lpa": 96.26,
        "overall_placement_pct": 90,
        "placement_year": "2026",
        "students_placed": 1799,
        "total_offers": 2197,
        "marquee_offers": 30,  # CTC ≥ 20 LPA
        "dream_offers_10lpa": 365,  # CTC ≥ 10 LPA
        "dream_offers_6lpa": 463,  # CTC ≥ 6 LPA
        "placement_note": "Highest package ₹96.26 LPA for 2026 batch. Previously ₹1 Cr in 2025.",
        "top_recruiters": [
            "Intel", "eBay", "Amazon", "Dell", "Schneider Electric",
            "DE Shaw", "Hitachi", "PayPal", "Tata Motors", "L&T",
            "Bosch", "Morgan Stanley", "Ashok Leyland",
        ],
        "year_wise_placements": [
            {"year": "2026", "highest_package": "₹96.26 LPA", "students_placed": 1799, "total_offers": 2197, "marquee_offers": 30},
            {"year": "2025", "highest_package": "₹1 Cr", "companies": 632, "total_offers": 12571},
            {"year": "2024", "highest_package": "₹27 LPA", "avg_package": 14.43, "companies": 950, "total_offers": 16800},
            {"year": "2023", "highest_package": "₹34.40 LPA", "avg_package": 9.23, "total_offers": 14000, "companies": 904},
        ],
        "placement_sources": SOURCE_LINKS,
    },
    "vit-bhopal": {
        "avg_package_lpa": 5.2,
        "highest_package_lpa": 70,
        "placement_year": "2026",
        "registered_students": 2023,
        "students_placed": 874,
        "overall_placement_pct": 43.2,
        "placement_note": "Highest ever package of ₹70 LPA for 2026 batch. Placement drive ongoing — more offers expected.",
        "top_recruiters": [
            "Microsoft", "Amazon", "TCS", "Infosys", "Wipro",
            "Cognizant", "Accenture",
        ],
        "year_wise_placements": [
            {"year": "2026", "highest_package": "₹70 LPA", "avg_package": 5.2, "students_placed": 874, "registered": 2023},
            {"year": "2025", "highest_package": "₹51 LPA"},
            {"year": "2024", "highest_package": "₹52 LPA"},
            {"year": "2023", "highest_package": "₹59 LPA"},
            {"year": "2022", "highest_package": "₹45.03 LPA"},
            {"year": "2021", "highest_package": "₹18 LPA"},
        ],
        "placement_sources": SOURCE_LINKS,
    },
}

# ── Merge into existing stats JSONB and upsert ───────────────────────────
for slug, new_data in UPDATES.items():
    row = sb.table("vit_campus_insights").select("stats").eq("campus_slug", slug).single().execute()
    stats = row.data.get("stats", {}) if row.data else {}
    if isinstance(stats, str):
        stats = json.loads(stats)
    stats.update(new_data)
    sb.table("vit_campus_insights").update({"stats": json.dumps(stats)}).eq("campus_slug", slug).execute()
    print(f"  ✓ {slug}: updated with {len(new_data)} placement fields")

print("\n✅ All placement data updated in Supabase.")
