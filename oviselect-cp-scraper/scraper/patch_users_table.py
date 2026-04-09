"""Add selected_counsellings, marketing_consent, consent_timestamp columns to users table."""
import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
sb = create_client(os.getenv("SUPABASE_URL", ""), os.getenv("SUPABASE_SERVICE_KEY", ""))

# Check current columns
r = sb.table("users").select("*").limit(1).execute()
cols = list(r.data[0].keys()) if r.data else []
print("Current columns:", cols)

# Add columns via SQL through rpc if they don't exist
# We'll do this via direct upsert with new fields — Supabase will error if columns don't exist
# Use the REST API to run SQL

import requests

url = os.getenv("SUPABASE_URL", "") + "/rest/v1/rpc/exec_sql"
headers = {
    "apikey": os.getenv("SUPABASE_SERVICE_KEY", ""),
    "Authorization": f"Bearer {os.getenv('SUPABASE_SERVICE_KEY', '')}",
    "Content-Type": "application/json",
}

# Try adding columns via management API
mgmt_url = f"https://api.supabase.com"
# Fall back: use pg directly via supabase SQL endpoint

sql_statements = [
    "ALTER TABLE public.users ADD COLUMN IF NOT EXISTS selected_counsellings text[] DEFAULT '{}';",
    "ALTER TABLE public.users ADD COLUMN IF NOT EXISTS marketing_consent boolean DEFAULT false;",
    "ALTER TABLE public.users ADD COLUMN IF NOT EXISTS consent_timestamp timestamptz;",
    "ALTER TABLE public.users ADD COLUMN IF NOT EXISTS source text DEFAULT 'google';",
]

# Use Supabase's SQL execution via service role
project_ref = os.getenv("SUPABASE_URL", "").replace("https://", "").split(".")[0]
sql_url = f"https://{project_ref}.supabase.co/rest/v1/rpc/exec_sql"

for sql in sql_statements:
    try:
        resp = requests.post(
            f"https://{project_ref}.supabase.co/pg/query",
            headers={
                "Authorization": f"Bearer {os.getenv('SUPABASE_SERVICE_KEY', '')}",
                "Content-Type": "application/json",
            },
            json={"query": sql},
        )
        print(f"SQL: {sql[:60]}... → {resp.status_code}")
    except Exception as e:
        print(f"SQL failed: {e}")

# Verify
r2 = sb.table("users").select("*").limit(1).execute()
cols2 = list(r2.data[0].keys()) if r2.data else []
print("Updated columns:", cols2)
