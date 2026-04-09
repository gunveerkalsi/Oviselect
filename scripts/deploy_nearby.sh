#!/usr/bin/env bash
# =============================================================
# One-shot deployment script for the Nearby Places feature.
#
# Prerequisites:
#   1. Supabase CLI installed  (brew install supabase/tap/supabase)
#   2. supabase login          (opens browser — run this first)
#   3. Google Maps API key     (see instructions below)
#
# Google Cloud Console setup:
#   - Create an API key at https://console.cloud.google.com/apis/credentials
#   - Restrict to APIs: "Geocoding API" and "Places API"
#   - HTTP referrer restriction: https://oviguide.in/*  (for production use)
#   - For the geocoding script (server-side), disable referrer restriction
#     or add your server IP; the edge function runs server-side so no
#     referrer restriction is needed for the edge function key.
#
# Usage:
#   export GOOGLE_MAPS_API_KEY="AIza..."
#   bash scripts/deploy_nearby.sh
# =============================================================

set -e

PROJECT_REF="wpoypojwwzeafolkkhvg"
GMAPS_KEY="${GOOGLE_MAPS_API_KEY:-}"

if [ -z "$GMAPS_KEY" ]; then
  echo "ERROR: set GOOGLE_MAPS_API_KEY before running this script."
  echo "  export GOOGLE_MAPS_API_KEY=AIza..."
  exit 1
fi

echo "==> Linking Supabase project..."
supabase link --project-ref "$PROJECT_REF"

echo ""
echo "==> Running SQL migration (add lat/lng + college_nearby_places)..."
echo "    NOTE: If the command below fails with 'password required', run the SQL"
echo "          manually in the Supabase SQL Editor (https://supabase.com/dashboard)"
echo "          The SQL file is: supabase/migrations/add_nearby_places.sql"
echo ""
# Try via CLI (requires DB password — supabase link will have prompted for it)
supabase db execute --file supabase/migrations/add_nearby_places.sql 2>/dev/null || \
  echo "    Skipping CLI migration — please run supabase/migrations/add_nearby_places.sql in the SQL Editor."

echo ""
echo "==> Setting GOOGLE_MAPS_API_KEY secret on Supabase Edge Functions..."
supabase secrets set GOOGLE_MAPS_API_KEY="$GMAPS_KEY" --project-ref "$PROJECT_REF"

echo ""
echo "==> Deploying fetch-nearby-places edge function..."
supabase functions deploy fetch-nearby-places --project-ref "$PROJECT_REF" --no-verify-jwt

echo ""
echo "==> Done! Edge function live at:"
echo "    https://$PROJECT_REF.supabase.co/functions/v1/fetch-nearby-places"
echo ""
echo "==> Next: geocode colleges (run once after setting GOOGLE_MAPS_API_KEY)"
echo "    python3 scripts/geocode_colleges.py"
