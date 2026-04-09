/**
 * Supabase Edge Function: fetch-nearby-places
 *
 * Google Cloud Console setup:
 *   - Create API key restricted to HTTP referrers: https://oviguide.in/*
 *   - Restrict to APIs: Geocoding API, Places API (Legacy)
 *   - Store key ONLY as a Supabase secret (never in frontend env vars):
 *       supabase secrets set GOOGLE_MAPS_API_KEY=<your-key>
 *
 * Request body: { institute: string, lat: number, lng: number }
 * Returns:      { places: Record<type, Place[]>, cached: boolean }
 */

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

const CACHE_MS   = 90 * 24 * 60 * 60 * 1000; // 90 days
const RADIUS     = 1500;                        // metres
const MAX_PLACES = 5;

const TYPES = [
  "restaurant", "hospital", "supermarket",
  "shopping_mall", "movie_theater", "tourist_attraction", "pharmacy",
] as const;

/** Haversine distance in metres between two lat/lng pairs. */
function haversineM(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R  = 6_371_000;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;
  const a  = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  let body: { institute?: string; lat?: number; lng?: number };
  try { body = await req.json(); } catch { return json({ error: "invalid JSON" }, 400); }

  const { institute, lat, lng } = body;
  if (!institute || lat == null || lng == null) {
    return json({ error: "institute, lat and lng are required" }, 400);
  }

  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // ── Cache check ─────────────────────────────────────────────────
  const { data: cached } = await sb
    .from("college_nearby_places")
    .select("places, fetched_at")
    .eq("institute", institute)
    .maybeSingle();

  if (cached && Date.now() - new Date(cached.fetched_at).getTime() < CACHE_MS) {
    return json({ places: cached.places, cached: true });
  }

  // ── Fetch from Google Places Nearby Search (legacy) ─────────────
  const API_KEY = Deno.env.get("GOOGLE_MAPS_API_KEY");
  if (!API_KEY) return json({ error: "GOOGLE_MAPS_API_KEY secret not set" }, 500);

  const BASE = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";
  const places: Record<string, object[]> = {};

  await Promise.all(
    TYPES.map(async (type) => {
      const url = `${BASE}?location=${lat},${lng}&radius=${RADIUS}&type=${type}&key=${API_KEY}`;
      const res  = await fetch(url);
      const data = await res.json();
      places[type] = (data.results ?? []).slice(0, MAX_PLACES).map((p: any) => ({
        name:       p.name,
        address:    p.vicinity ?? null,
        rating:     p.rating   ?? null,
        lat:        p.geometry?.location?.lat ?? null,
        lng:        p.geometry?.location?.lng ?? null,
        distance_m: p.geometry?.location
          ? haversineM(lat, lng, p.geometry.location.lat, p.geometry.location.lng)
          : null,
      }));
    }),
  );

  // ── Upsert into cache ────────────────────────────────────────────
  await sb.from("college_nearby_places").upsert({
    institute,
    places,
    fetched_at: new Date().toISOString(),
  });

  return json({ places, cached: false });
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: CORS });
}
