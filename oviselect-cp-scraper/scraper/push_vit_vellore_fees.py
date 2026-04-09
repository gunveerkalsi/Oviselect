"""Push detailed VIT Vellore fee + hostel data into Supabase stats JSONB."""
import json, os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
sb = create_client(os.getenv("SUPABASE_URL", ""), os.getenv("SUPABASE_SERVICE_KEY", ""))

SLUG = "vit-vellore"

tuition = {
    "group_a": {
        "label": "Group A",
        "branches": ["Biotechnology","Chemical Engineering","Civil Engineering","Electrical and Electronics Engineering","Electronics and Instrumentation Engineering"],
        "categories": [
            {"cat": 1, "total": 176000, "advance": 150000, "balance": 26000},
            {"cat": 2, "total": 235000, "advance": 150000, "balance": 85000},
            {"cat": 3, "total": 343000, "advance": 200000, "balance": 143000},
            {"cat": 4, "total": 368000, "advance": 200000, "balance": 168000},
            {"cat": 5, "total": 398000, "advance": 250000, "balance": 148000},
        ],
    },
    "group_b": {
        "label": "Group B",
        "branches": ["Computer Science and Business Systems","Computer Science and Engineering","CSE (AI & ML)","CSE (Bioinformatics)","CSE (Blockchain Technology)","CSE (Data Science)","CSE (Information Security)","CSE (IoT)","Electrical and Computer Engineering","EEE (Group B)","Electronics and Communication Engineering","ECE (Biomedical)","Information Technology","Mechanical Engineering","Mechanical (Electric Vehicles)","Mechanical (Manufacturing Engineering)"],
        "categories": [
            {"cat": 1, "total": 198000, "advance": 198000, "balance": 0},
            {"cat": 2, "total": 307000, "advance": 200000, "balance": 107000},
            {"cat": 3, "total": 405000, "advance": 250000, "balance": 155000},
            {"cat": 4, "total": 448000, "advance": 300000, "balance": 148000},
            {"cat": 5, "total": 493000, "advance": 300000, "balance": 193000},
        ],
    },
}

rank_category_map = [
    {"rank_range": "1 – 10,000",      "category": 1},
    {"rank_range": "10,001 – 20,000",  "category": 2},
    {"rank_range": "20,001 – 30,000",  "category": 3},
    {"rank_range": "30,001 – 45,000",  "category": "3 or 4"},
    {"rank_range": "45,001 – 60,000",  "category": "4 or 5"},
    {"rank_range": "60,001+",          "category": 5},
]

def _h(room, ac, meal, rm, adm=15000, cau=15000):
    return {"room_type": room, "ac": ac, "meal_plan": meal, "room_mess": rm, "admission_fee": adm, "caution_deposit": cau, "total": rm + adm + cau}

hostel_regular = [
    _h("6-share","NAC","Veg",112400), _h("6-share","NAC","Non-Veg",121900), _h("6-share","NAC","Special",133800),
    _h("6-share","AC","Veg",136800),  _h("6-share","AC","Non-Veg",146300),  _h("6-share","AC","Special",158200),
    _h("4-share","NAC","Veg",117500), _h("4-share","NAC","Non-Veg",127000), _h("4-share","NAC","Special",138900),
    _h("4-share","AC","Veg",145300),  _h("4-share","AC","Non-Veg",154800),  _h("4-share","AC","Special",166700),
    _h("3-share","NAC","Veg",124100), _h("3-share","NAC","Non-Veg",133600), _h("3-share","NAC","Special",145500),
    _h("3-share","AC","Veg",158200),  _h("3-share","AC","Non-Veg",167700),  _h("3-share","AC","Special",179600),
    _h("2-share","NAC","Veg",131100), _h("2-share","NAC","Non-Veg",140600), _h("2-share","NAC","Special",152500),
    _h("2-share","AC","Veg",165000),  _h("2-share","AC","Non-Veg",174500),  _h("2-share","AC","Special",186400),
    _h("1-share","NAC","Veg",149100), _h("1-share","NAC","Non-Veg",158600), _h("1-share","NAC","Special",170500),
    _h("1-share","AC","Veg",198900),  _h("1-share","AC","Non-Veg",208400),  _h("1-share","AC","Special",220300),
]

hostel_deluxe = [
    _h("4-share","AC","Veg",167300),  _h("4-share","AC","Non-Veg",176800),  _h("4-share","AC","Special",188700),
    _h("3-share","AC","Veg",182600),  _h("3-share","AC","Non-Veg",192100),  _h("3-share","AC","Special",204000),
    _h("2-share","AC","Veg",196800),  _h("2-share","AC","Non-Veg",206300),  _h("2-share","AC","Special",218200),
]

hostel_apartment = [
    _h("4-share","AC","Veg",199900),  _h("4-share","AC","Non-Veg",209400),  _h("4-share","AC","Special",221300),
    _h("3-share","AC","Veg",210300),  _h("3-share","AC","Non-Veg",219800),  _h("3-share","AC","Special",231700),
    _h("2-share","AC","Veg",223600),  _h("2-share","AC","Non-Veg",233100),  _h("2-share","AC","Special",245000),
]

def _n(room, ac, rm, adm=250, cau=400):
    return {"room_type":room,"ac":ac,"meal_plan":"Special","room_mess":rm,"admission_fee":adm,"caution_deposit":cau,"total":rm+adm+cau,"currency":"USD"}

hostel_nri_regular = [
    _n("6-share","NAC",2290), _n("6-share","AC",2790), _n("4-share","NAC",2430), _n("4-share","AC",3060),
    _n("3-share","NAC",2630), _n("3-share","AC",3430), _n("2-share","NAC",2830), _n("2-share","AC",3720),
    _n("1-share","NAC",3170), _n("1-share","AC",4270),
]
hostel_nri_deluxe = [_n("4-share","AC",3660), _n("3-share","AC",4020), _n("2-share","AC",4550)]
hostel_nri_apartment = [_n("4-share","AC",4380), _n("3-share","AC",4690), _n("2-share","AC",5120)]

payload = {
    "tuition_fee_structure": tuition,
    "rank_category_mapping": rank_category_map,
    "hostel_fee_structure": {
        "indian": {"regular": hostel_regular, "deluxe_mhs_mht": hostel_deluxe, "apartment_mhr": hostel_apartment},
        "nri": {"regular": hostel_nri_regular, "deluxe_mhs_mht": hostel_nri_deluxe, "apartment_mhr": hostel_nri_apartment},
    },
    "hostel_notes": [
        "Admission fee (Indian: ₹15,000 | NRI: $250) is NON-REFUNDABLE",
        "Caution deposit (Indian: ₹15,000 | NRI: $400) is REFUNDABLE (first-time only)",
        "Hostel fee includes laundry (max 44 washes/year)",
        "Mess change: monthly. Upgrade in Fall = full differential; Winter = 50%",
        "NO REFUND for mess or room downgrade",
        "Fees subject to annual escalation",
        "NAC = Non-Air Conditioned | AC = Air Conditioned",
    ],
}

# Merge into existing stats
row = sb.table("vit_campus_insights").select("stats").eq("campus_slug", SLUG).single().execute()
stats = row.data.get("stats", {}) if row.data else {}
if isinstance(stats, str):
    stats = json.loads(stats)
stats.update(payload)
sb.table("vit_campus_insights").update({"stats": json.dumps(stats)}).eq("campus_slug", SLUG).execute()
print(f"✅ Pushed {len(payload)} fee data blocks to {SLUG}")
