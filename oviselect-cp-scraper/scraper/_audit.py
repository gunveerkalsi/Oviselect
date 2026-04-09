"""Quick data audit across all VIT campuses."""
import json, os
from dotenv import load_dotenv
load_dotenv()
from supabase import create_client
sb = create_client(os.getenv("SUPABASE_URL",""), os.getenv("SUPABASE_SERVICE_KEY",""))

for campus in ["vit-vellore","vit-chennai","vit-amaravati","vit-bhopal"]:
    rows = sb.table("vit_reddit_posts").select("score,num_comments").eq("campus", campus).execute().data
    scores = [r["score"] for r in rows if r.get("score")]
    high = [s for s in scores if s >= 50]
    comments = sum(r.get("num_comments") or 0 for r in rows)

    ci = json.load(open(f"data/cleaned_insights/{campus}_insights.json"))
    themes = ci.get("themes", {})

    print(f"\n{'='*55}")
    print(f"  {campus.upper()}")
    print(f"{'='*55}")
    print(f"  DB posts:            {len(rows)}")
    if scores:
        print(f"  Score range:         {min(scores)} – {max(scores)}")
        print(f"  Avg score:           {sum(scores)//len(scores)}")
    print(f"  High-quality (50+):  {len(high)}")
    print(f"  Total comments:      {comments}")
    print(f"  Cleaned insights:    {ci['total_insights']}")
    for t, v in themes.items():
        print(f"    {t:30s}  {len(v):>3}")

# structured data
try:
    sj = json.load(open("data/parsed/vit-campuses_structured.json"))
    campuses = sj.get("campuses", [])
    print(f"\n{'='*55}")
    print("  STRUCTURED DATA (vit-campuses_structured.json)")
    print(f"{'='*55}")
    for c in campuses:
        name = c.get("name","")
        conf = c.get("data_confidence_score","?")
        fields = sum(1 for v in c.values() if v is not None)
        print(f"  {name:25s} confidence={conf}%  fields={fields}")
except FileNotFoundError:
    print("\n  (structured JSON not found)")
