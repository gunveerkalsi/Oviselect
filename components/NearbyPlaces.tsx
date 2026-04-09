/**
 * NearbyPlaces — shows Google Places data within 1.5 km of a college campus.
 * Data is fetched via the fetch-nearby-places Supabase Edge Function and cached
 * in college_nearby_places for 90 days (near-zero marginal cost after first fetch).
 */
import React, { useState, useEffect } from 'react';
import { MapPin, Loader2, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';

/* ── Design tokens (must match CollegeProfile.tsx) ── */
const V = {
  ink: '#0e0e0e', ink2: '#3a3a3a', ink3: '#6b6b6b', ink4: '#a8a8a8',
  paper: '#f5f2ec', paper2: '#edeae3', paper3: '#e3dfd7',
  accent: '#c8522a', accentL: '#f5e6e0',
  green: '#2a6b4a', greenL: '#d5ece1',
  amber: '#8a5a1d', amberL: '#f5e6d0',
  blue: '#1d4f8a', blueL: '#d6e4f5',
  serif: "'DM Serif Display',Georgia,serif",
  sans: "'Instrument Sans',sans-serif",
  mono: "'DM Mono',monospace",
};

const SLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p style={{ fontFamily: V.mono, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: V.ink4, marginBottom: 10, paddingBottom: 8, borderBottom: `1px solid ${V.paper3}` }}>
    {children}
  </p>
);

/* ── Category config ── */
type Category = 'restaurant' | 'hospital' | 'supermarket' | 'shopping_mall' | 'movie_theater' | 'tourist_attraction' | 'pharmacy';

const CATEGORIES: { id: Category; label: string; color: string; bg: string }[] = [
  { id: 'restaurant',        label: 'Restaurants',  color: V.accent, bg: V.accentL },
  { id: 'hospital',          label: 'Hospitals',    color: '#7b2d8b', bg: '#f3e8f7' },
  { id: 'supermarket',       label: 'Supermarkets', color: V.green,  bg: V.greenL  },
  { id: 'shopping_mall',     label: 'Malls',        color: V.blue,   bg: V.blueL   },
  { id: 'movie_theater',     label: 'Cinemas',      color: '#6b3a1d', bg: '#f5e8de' },
  { id: 'tourist_attraction',label: 'Attractions',  color: '#1d6b5a', bg: '#d5ecec' },
  { id: 'pharmacy',          label: 'Pharmacies',   color: V.amber,  bg: V.amberL  },
];

interface Place {
  name: string;
  address: string | null;
  rating: number | null;
  lat: number | null;
  lng: number | null;
  distance_m: number | null;
}

function fmtDist(m: number | null): string {
  if (m == null) return '';
  return m < 1000 ? `${m} m` : `${(m / 1000).toFixed(1)} km`;
}

function StarRating({ rating }: { rating: number | null }) {
  if (!rating) return null;
  const full = Math.floor(rating);
  return (
    <span style={{ fontFamily: V.mono, fontSize: 10, color: V.amber, display: 'inline-flex', alignItems: 'center', gap: 2 }}>
      {'★'.repeat(full)}{'☆'.repeat(5 - full)} {rating.toFixed(1)}
    </span>
  );
}

interface NearbyPlacesProps {
  college: { inst: string; collegeInfo?: { lat?: number | null; lng?: number | null } | null };
}

const NearbyPlaces: React.FC<NearbyPlacesProps> = ({ college }) => {
  const lat = college.collegeInfo?.lat;
  const lng = college.collegeInfo?.lng;

  const [activeCat, setActiveCat] = useState<Category>('restaurant');
  const [places,    setPlaces]    = useState<Record<string, Place[]> | null>(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [cached,    setCached]    = useState(false);

  useEffect(() => {
    if (!lat || !lng || places) return;
    setLoading(true);
    setError(null);
    supabase.functions.invoke('fetch-nearby-places', {
      body: { institute: college.inst, lat, lng },
    }).then(({ data, error: err }) => {
      setLoading(false);
      if (err || !data?.places) { setError('Could not load nearby places. Please try again.'); return; }
      setPlaces(data.places);
      setCached(!!data.cached);
    });
  }, [lat, lng]);

  if (!lat || !lng) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <MapPin size={32} style={{ color: V.ink4, marginBottom: 12, margin: '0 auto 12px' }} />
        <p style={{ fontSize: 14, color: V.ink4 }}>Location coordinates not yet available for this college.</p>
      </div>
    );
  }

  const catCfg = CATEGORIES.find(c => c.id === activeCat)!;
  const list   = (places?.[activeCat] ?? []) as Place[];
  const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(catCfg.label + ' near ' + college.inst)}/@${lat},${lng},15z`;

  return (
    <div style={{ padding: '1.5rem 2rem', fontFamily: V.sans }}>
      <SLabel>WITHIN 1.5 KM{cached ? '  (from cache)' : ''}</SLabel>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2" style={{ marginBottom: '1.25rem' }}>
        {CATEGORIES.map(cat => (
          <button key={cat.id} onClick={() => setActiveCat(cat.id)}
            style={{
              padding: '5px 14px', borderRadius: 20, border: `1px solid ${activeCat === cat.id ? cat.color : V.paper3}`,
              background: activeCat === cat.id ? cat.bg : V.paper,
              color: activeCat === cat.id ? cat.color : V.ink3,
              fontFamily: V.mono, fontSize: 11, cursor: 'pointer', transition: 'all 0.15s',
            }}>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading && (
        <div className="flex items-center justify-center gap-2" style={{ padding: '2rem', color: V.ink4 }}>
          <Loader2 size={16} className="animate-spin" /> Fetching nearby places...
        </div>
      )}

      {error && <p style={{ color: V.accent, fontSize: 13, padding: '1rem 0' }}>{error}</p>}

      {!loading && !error && places && (
        list.length === 0
          ? <p style={{ fontSize: 13, color: V.ink4, fontStyle: 'italic', padding: '1rem 0' }}>No {catCfg.label.toLowerCase()} found within 1.5 km.</p>
          : (
            <div className="space-y-2" style={{ marginBottom: '1.5rem' }}>
              {list.map((p, i) => (
                <div key={i} style={{ background: V.paper2, border: `1px solid ${V.paper3}`, borderRadius: 4, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: V.ink, marginBottom: 3 }}>{p.name}</p>
                    {p.address && <p style={{ fontSize: 12, color: V.ink3, marginBottom: 4 }} className="truncate">{p.address}</p>}
                    <StarRating rating={p.rating} />
                  </div>
                  {p.distance_m != null && (
                    <div style={{ flexShrink: 0, textAlign: 'right' }}>
                      <p style={{ fontFamily: V.mono, fontSize: 11, color: V.ink3 }}>{fmtDist(p.distance_m)}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
      )}

      {/* Google Maps deep-link */}
      {!loading && (
        <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: V.blue, fontFamily: V.mono, textDecoration: 'none', marginTop: 4 }}>
          <ExternalLink size={12} /> Open {catCfg.label} near {college.inst} in Google Maps
        </a>
      )}
    </div>
  );
};

export default NearbyPlaces;
