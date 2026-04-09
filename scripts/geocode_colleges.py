"""
One-time geocoding script: populates lat/lng in college_info using Google Geocoding API.

Safe to re-run — only geocodes rows where lat IS NULL.

Usage:
  export GOOGLE_MAPS_API_KEY=your_key
  python3 scripts/geocode_colleges.py

Google Cloud Console setup:
  - Restrict API key to server IP or disable HTTP referrer restriction for this script
  - Enable: Geocoding API
"""

import os
import sys
import time
import urllib.request
import urllib.parse
import json

# Load env
env_path = os.path.join(os.path.dirname(__file__), '..', 'oviselect-cp-scraper', '.env')
from dotenv import load_dotenv
load_dotenv(dotenv_path=env_path)

from supabase import create_client

SUPABASE_URL  = os.getenv('SUPABASE_URL', '')
SERVICE_KEY   = os.getenv('SUPABASE_SERVICE_KEY', '')
GMAPS_KEY     = os.getenv('GOOGLE_MAPS_API_KEY', '')

if not GMAPS_KEY:
    print('ERROR: set GOOGLE_MAPS_API_KEY environment variable')
    sys.exit(1)

sb = create_client(SUPABASE_URL, SERVICE_KEY)

# ── Fetch all colleges missing lat ────────────────────────────────
rows = sb.table('college_info') \
         .select('institute, address, city, state, lat') \
         .is_('lat', 'null') \
         .execute().data

print(f'Found {len(rows)} colleges to geocode')

def geocode(query: str) -> tuple[float, float] | None:
    """Call Google Geocoding API; returns (lat, lng) or None."""
    encoded = urllib.parse.quote(query)
    url = f'https://maps.googleapis.com/maps/api/geocode/json?address={encoded}&key={GMAPS_KEY}'
    try:
        with urllib.request.urlopen(url, timeout=10) as r:
            data = json.loads(r.read())
        if data.get('status') == 'OK' and data.get('results'):
            loc = data['results'][0]['geometry']['location']
            return loc['lat'], loc['lng']
    except Exception as e:
        print(f'  geocode error: {e}')
    return None

ok = 0
skipped = 0
errors = []

for row in rows:
    institute = row['institute']

    # Build query: prefer full address, fallback to institute + city + state
    if row.get('address') and row.get('city'):
        query = f"{row['address']}, {row['city']}, {row['state'] or ''}, India"
    elif row.get('city'):
        query = f"{institute}, {row['city']}, {row.get('state', '')}, India"
    else:
        query = f"{institute}, India"

    result = geocode(query)
    if result:
        lat, lng = result
        sb.table('college_info') \
          .update({'lat': lat, 'lng': lng}) \
          .eq('institute', institute) \
          .execute()
        print(f'  OK  {institute} -> ({lat:.4f}, {lng:.4f})')
        ok += 1
    else:
        print(f'  MISS {institute}')
        skipped += 1

    time.sleep(0.05)  # 50 ms delay to stay within rate limits

print(f'\nDone: {ok} geocoded, {skipped} missed, {len(errors)} errors')
