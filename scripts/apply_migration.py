"""
Apply the nearby-places migration to Supabase.
Adds lat/lng to college_info and creates college_nearby_places table.
Run from project root: python3 scripts/apply_migration.py
"""
import os
import sys

# Load env from the scraper directory
env_path = os.path.join(os.path.dirname(__file__), '..', 'oviselect-cp-scraper', '.env')
from dotenv import load_dotenv
load_dotenv(dotenv_path=env_path)

from supabase import create_client

SUPABASE_URL = os.getenv('SUPABASE_URL', '')
SERVICE_KEY  = os.getenv('SUPABASE_SERVICE_KEY', '')

if not SUPABASE_URL or not SERVICE_KEY:
    print('ERROR: missing env vars')
    sys.exit(1)

sb = create_client(SUPABASE_URL, SERVICE_KEY)

# ── Step 1: Check if lat/lng already present ──────────────────────
r = sb.table('college_info').select('institute').limit(1).execute()
if r.data:
    row = sb.table('college_info').select('*').limit(1).execute().data[0]
    lat_present = 'lat' in row
    lng_present = 'lng' in row
    print(f'lat in college_info: {lat_present}')
    print(f'lng in college_info: {lng_present}')
    if lat_present and lng_present:
        print('Columns already exist - skipping ALTER TABLE')
else:
    lat_present = False

# ── Step 2: Add columns using the Management REST API ────────────
import urllib.request, json

PROJECT_REF = SUPABASE_URL.replace('https://', '').split('.')[0]
print(f'Project ref: {PROJECT_REF}')

SQL = """
ALTER TABLE college_info ADD COLUMN IF NOT EXISTS lat double precision;
ALTER TABLE college_info ADD COLUMN IF NOT EXISTS lng double precision;
CREATE TABLE IF NOT EXISTS college_nearby_places (
  institute   text PRIMARY KEY,
  places      jsonb NOT NULL DEFAULT '{}',
  fetched_at  timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE college_nearby_places ENABLE ROW LEVEL SECURITY;
"""

req = urllib.request.Request(
    f'https://api.supabase.com/v1/projects/{PROJECT_REF}/database/query',
    data=json.dumps({'query': SQL}).encode(),
    headers={
        'Authorization': f'Bearer {SERVICE_KEY}',
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
    },
    method='POST'
)

try:
    with urllib.request.urlopen(req, timeout=20) as resp:
        body = resp.read().decode()
        print(f'Management API status: {resp.status}')
        print(f'Response: {body[:300]}')
except urllib.error.HTTPError as e:
    body = e.read().decode()
    print(f'Management API HTTP error {e.code}: {body[:400]}')
    print('NOTE: Management API requires a personal access token, not the service key.')
    print('Please run the SQL in the Supabase SQL Editor instead.')
    print()
    print('SQL to run:')
    print(SQL)
except Exception as e:
    print(f'Error: {e}')
    print()
    print('Please run the following SQL in your Supabase SQL Editor:')
    print(SQL)

# ── Step 3: Verify ────────────────────────────────────────────────
print()
print('Verifying...')
try:
    r2 = sb.table('college_nearby_places').select('institute').limit(1).execute()
    print('college_nearby_places table: OK')
except Exception as e2:
    print(f'college_nearby_places table: NOT FOUND - {e2}')

r3 = sb.table('college_info').select('*').limit(1).execute()
if r3.data:
    cols = list(r3.data[0].keys())
    print(f'lat present: {"lat" in cols}')
    print(f'lng present: {"lng" in cols}')
