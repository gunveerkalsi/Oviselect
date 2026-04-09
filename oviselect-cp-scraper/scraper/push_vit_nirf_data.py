"""Push NIRF 2025 data for VIT Vellore into Supabase stats JSONB."""
import json, os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
sb = create_client(os.getenv("SUPABASE_URL", ""), os.getenv("SUPABASE_SERVICE_KEY", ""))

SLUG = "vit-vellore"

payload = {
    "nirf_institute_id": "IR-E-U-0490",
    "total_faculty": 3154,

    "sanctioned_intake": {
        "ug_4yr": {"2023-24": 8190, "2022-23": 7620, "2021-22": 7620, "2020-21": 7500},
        "pg_2yr": {"2023-24": 1320, "2022-23": 1563},
        "pg_integrated": {"2023-24": 1080, "2022-23": 1080, "2021-22": 1080, "2020-21": 1020},
    },

    "student_strength": {
        "ug_4yr":       {"male": 27684, "female": 8273, "total": 35957, "within_state": 8458, "outside_state": 26123, "outside_country": 1376, "econ_backward": 9646, "sc_st_obc": 11081},
        "pg_2yr":       {"male": 1802,  "female": 798,  "total": 2600,  "within_state": 895,  "outside_state": 1689,  "outside_country": 16,   "econ_backward": 771,  "sc_st_obc": 1347},
        "pg_integrated":{"male": 3957,  "female": 2351, "total": 6308,  "within_state": 3575, "outside_state": 2717,  "outside_country": 16,   "econ_backward": 1688, "sc_st_obc": 3820},
    },
    "total_students": 44865,

    "ug_placement_data": {
        "intake":      {"2018-19": 7100, "2019-20": 7620, "2020-21": 7500},
        "admitted":    {"2018-19": 6435, "2019-20": 7404, "2020-21": 6194},
        "graduating":  {"2021-22": 6177, "2022-23": 7053, "2023-24": 5964},
    },
    "pg_placement_data": {
        "intake":     {"2020-21": 1521, "2021-22": 1551, "2022-23": 1563},
        "admitted":   {"2020-21": 1468, "2021-22": 1393, "2022-23": 1307},
        "graduating": {"2021-22": 1415, "2022-23": 1357, "2023-24": 1270},
    },
    "pg_integrated_data": {
        "intake":     {"2017-18": 660, "2018-19": 660, "2019-20": 900},
        "admitted":   {"2017-18": 700, "2018-19": 513, "2019-20": 945},
        "graduating": {"2021-22": 683, "2022-23": 502, "2023-24": 918},
    },

    "phd_details": {
        "pursuing_fulltime": 2432,
        "pursuing_parttime": 480,
        "pursuing_total": 2912,
        "graduated": {
            "2023-24": {"fulltime": 221, "parttime": 7, "total": 228},
            "2022-23": {"fulltime": 196, "parttime": 12, "total": 208},
        },
    },

    "financial_capital_expenditure": {
        "library":      {"2023-24": 104893369, "2022-23": 94234387},
        "equipment_software": {"2023-24": 659556045, "2022-23": 412190251},
        "workshops":    {"2023-24": 8628067, "2022-23": 3320766},
        "other_assets": {"2023-24": 824821570, "2022-23": 584456945},
    },
    "financial_operational_expenditure": {
        "salaries":     {"2023-24": 5907198672, "2022-23": 4873132813},
        "maintenance":  {"2023-24": 2357361490, "2022-23": 1392336862},
        "seminars":     {"2023-24": 7715276, "2022-23": 7298541},
    },

    "sponsored_research": {
        "2023-24": {"projects": 177, "funding_agencies": 28, "amount_inr": 274967689},
        "2022-23": {"projects": 146, "funding_agencies": 30, "amount_inr": 139097324},
    },
    "consultancy": {
        "2023-24": {"projects": 354, "clients": 210, "amount_inr": 39593169},
        "2022-23": {"projects": 255, "clients": 178, "amount_inr": 26472034},
    },

    "pcs_facilities": {
        "lifts_ramps": "Yes, more than 80% of buildings",
        "wheelchairs": "Yes (including transport between buildings)",
        "toilets": "Yes, more than 80% of buildings",
    },
}

row = sb.table("vit_campus_insights").select("stats").eq("campus_slug", SLUG).single().execute()
stats = row.data.get("stats", {}) if row.data else {}
if isinstance(stats, str):
    stats = json.loads(stats)
stats.update(payload)
sb.table("vit_campus_insights").update({"stats": json.dumps(stats)}).eq("campus_slug", SLUG).execute()
print(f"✅ Pushed NIRF 2025 data ({len(payload)} fields) to {SLUG}")
