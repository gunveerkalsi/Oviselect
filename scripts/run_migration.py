"""Run the add_nearby_places.sql migration via Supabase Management API."""
import os, sys, requests
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', 'oviselect-cp-scraper', '.env'))

SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY', '')
URL = os.getenv('SUPABASE_URL', '')

if not SERVICE_KEY or not URL:
    print('ERROR: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set')
    sys.exit(1)

PROJECT_REF = URL.replace('https://', '').split('.')[0]
print(f'Project ref: {PROJECT_REF}')

# SQL to execute
SQL = """
ALTER TABLE college_info
  ADD COLUMN IF NOT EXISTS lat  double precision,
  ADD COLUMN IF NOT EXISTS lng  double precision;

CREATE TABLE IF NOT EXISTS college_nearby_places (
  institute   text PRIMARY KEY,
  places      jsonb        NOT NULL DEFAULT '{}'::jsonb,
  fetched_at  timestamptz  NOT NULL DEFAULT now()
);

ALTER TABLE college_nearby_places ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename='college_nearby_places' AND policyname='public read college_nearby_places'
  ) THEN
    CREATE POLICY "public read college_nearby_places"
      ON college_nearby_places FOR SELECT USING (true);
  END IF;
END $$;
"""

# Use Supabase Management API to run SQL
resp = requests.post(
    f'https://api.supabase.com/v1/projects/{PROJECT_REF}/database/query',
    headers={
        'Authorization': f'Bearer {SERVICE_KEY}',
        'Content-Type': 'application/json',
    },
    json={'query': SQL},
    timeout=20,
)

print(f'Status: {resp.status_code}')
if resp.status_code in (200, 201):
    print('Migration succeeded')
    print(resp.json())
else:
    print('Error:', resp.text[:400])
    # Try alternate approach - direct psql via supabase client
    print('\nTrying via supabase-py rpc...')
    from supabase import create_client
    sb = create_client(URL, SERVICE_KEY)
    try:
        # Add columns one by one
        sb.table('college_info').update({'lat': None}).eq('lat', 'IMPOSSIBLE').execute()
        print('lat column already exists (update did not error)')
    except Exception as e:
        print(f'lat check: {e}')
