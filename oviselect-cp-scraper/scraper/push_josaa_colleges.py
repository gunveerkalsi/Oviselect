"""
Push all 86 structured JoSAA college JSON files to Supabase (college_info + institutes tables).
Run from: /Users/gunveerkalsi/Desktop/Oviselect/oviselect-cp-scraper
"""
import os, json, glob
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
sb = create_client(os.getenv("SUPABASE_URL", ""), os.getenv("SUPABASE_SERVICE_KEY", ""))

JSON_DIR = "/Users/gunveerkalsi/Desktop/Oviselect-main/oviselect-cp-scraper/data/parsed"

# Fields that map directly (same name in JSON and Supabase)
DIRECT_FIELDS = [
    "institute", "institute_type", "also_known_as", "established_year",
    "city", "state", "address", "nearest_airport", "nearest_airport_km",
    "nearest_railway_station", "nearest_railway_km",
    "nirf_overall_rank", "nirf_engineering_rank", "nirf_research_rank",
    "nirf_innovation_rank", "qs_world_rank", "qs_asia_rank",
    "the_world_rank", "the_asia_rank", "outlook_rank", "the_week_rank",
    "courses_offered", "tuition_fee_per_sem", "hostel_fee_per_sem",
    "mess_advance_per_sem", "one_time_fees", "caution_money",
    "annual_fees", "total_institute_fee", "total_hostel_fee", "fee_waivers",
    "overall_placement_pct", "avg_package_lpa", "median_package_lpa",
    "highest_package_lpa", "branch_wise_placement_pct", "branch_wise_median_ctc",
    "branch_wise_highest_ctc", "branch_wise_avg_ctc", "top_recruiters",
    "placement_year", "faculty_with_phd_pct",
    "phd_seats", "needs_review", "collegepravesh_url", "last_scraped_at",
    "data_confidence_score", "data_sources",
]

# Fields with different names: json_key → supabase_column
RENAMED_FIELDS = {
    "nirf_overall_rank":    "nirf_rank",          # also store as nirf_rank alias
    "total_faculty_count":  "total_faculty",
    "faculty_student_ratio":"student_faculty_ratio",
    "pg_programmes":        "pg_programs",
    "department_count":     "total_departments",
}

def build_row(d: dict) -> dict:
    row = {}
    # Direct fields
    for f in DIRECT_FIELDS:
        if f in d and d[f] is not None:
            row[f] = d[f]
    # Renamed fields
    for json_key, db_col in RENAMED_FIELDS.items():
        if json_key in d and d[json_key] is not None:
            val = d[json_key]
            # pg_programs column is integer — if JSON has a list, store its length
            if db_col == "pg_programs" and isinstance(val, list):
                val = len(val)
            row[db_col] = val
    # nirf_rank alias
    if "nirf_overall_rank" in d and d["nirf_overall_rank"] is not None:
        row["nirf_rank"] = d["nirf_overall_rank"]
    return row


files = sorted(glob.glob(f"{JSON_DIR}/*_structured.json"))
print(f"Found {len(files)} structured JSON files")

ok, skipped, errors = 0, 0, []

for fpath in files:
    fname = os.path.basename(fpath)
    try:
        with open(fpath, "r", encoding="utf-8") as f:
            d = json.load(f)

        institute_name = d.get("institute", "").strip()
        if not institute_name:
            print(f"  SKIP {fname} - no institute name")
            skipped += 1
            continue

        # 1. Ensure college exists in institutes table (for search)
        existing_inst = sb.table("institutes").select("id").eq("name", institute_name).execute()
        if not existing_inst.data:
            sb.table("institutes").insert({"name": institute_name}).execute()

        # 2. Insert or update college_info (no unique constraint, so do select first)
        row = build_row(d)
        if not row.get("institute"):
            row["institute"] = institute_name

        existing = sb.table("college_info").select("institute").eq("institute", institute_name).execute()
        if existing.data:
            sb.table("college_info").update(row).eq("institute", institute_name).execute()
            action = "UPD"
        else:
            sb.table("college_info").insert(row).execute()
            action = "INS"

        print(f"  {action} {institute_name}")
        ok += 1

    except Exception as e:
        print(f"  ERR {fname}: {e}")
        errors.append((fname, str(e)))

print(f"\nDone: {ok} upserted, {skipped} skipped, {len(errors)} errors")
if errors:
    for fname, msg in errors:
        print(f"  - {fname}: {msg}")
