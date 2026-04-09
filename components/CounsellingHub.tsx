import React from 'react';
import { ArrowRight, Lock, Plus } from 'lucide-react';
import { ALL_COUNSELLINGS } from './CounsellingOnboarding';

/* ── Design tokens ────────────────────────────────────────────────────── */
const V = {
  ink: '#0e0e0e', ink2: '#3a3a3a', ink3: '#6b6b6b', ink4: '#a8a8a8',
  paper: '#f5f2ec', paper2: '#edeae3', paper3: '#e3dfd7',
  green: '#2A6B4A', greenLt: '#d5ece1',
  serif: "'DM Serif Display',Georgia,serif",
  mono: "'DM Mono',monospace",
  sans: "'Instrument Sans',sans-serif",
};

/* Live portals that have actual working UIs */
const LIVE_IDS = new Set(['josaa', 'viteee']);

interface CounsellingHubProps {
  userName: string;
  selectedCounsellings: string[];
  onSelect: (portalId: string) => void;
  onAddMore: () => void;
}

const CounsellingHub: React.FC<CounsellingHubProps> = ({ userName, selectedCounsellings, onSelect, onAddMore }) => {
  const firstName = userName?.split(' ')[0] || 'there';
  const userPortals = ALL_COUNSELLINGS.filter(c => selectedCounsellings.includes(c.id));
  const livePortals = userPortals.filter(c => LIVE_IDS.has(c.id));
  const comingSoon  = userPortals.filter(c => !LIVE_IDS.has(c.id));

  return (
    <div style={{ background: V.paper, fontFamily: V.sans, minHeight: '100vh' }} className="px-4 sm:px-8 py-12">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontFamily: V.mono, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: V.ink4, marginBottom: 12 }}>
            Welcome back, {firstName}
          </p>
          <h1 style={{ fontFamily: V.serif, fontSize: 'clamp(2rem, 5vw, 3rem)', color: V.ink, lineHeight: 1.1, marginBottom: 10 }}>
            Your counselling<br />
            <span style={{ color: V.ink4 }}>dashboard.</span>
          </h1>
          <p style={{ fontSize: 15, color: V.ink3, lineHeight: 1.6, maxWidth: 480 }}>
            Cutoff predictions, college deep-dives, and Reddit insights, tailored to your counsellings.
          </p>
        </div>

        {/* Live portals — featured cards */}
        {livePortals.length > 0 && livePortals.map(portal => (
          <button
            key={portal.id}
            onClick={() => onSelect(portal.id)}
            className="group w-full text-left hover:shadow-lg transition-all"
            style={{ background: V.paper2, border: `1px solid ${V.paper3}`, borderRadius: 4, padding: '1.5rem 2rem', marginBottom: 12 }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
              <div className="flex items-center gap-4">
                <div style={{
                  width: 52, height: 52, borderRadius: 4, flexShrink: 0,
                  background: `${portal.color}15`, border: `1.5px solid ${portal.color}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: V.mono, fontSize: 15, fontWeight: 700, color: portal.color,
                }}>{portal.abbr}</div>
                <div>
                  <div className="flex items-center gap-3" style={{ marginBottom: 3 }}>
                    <span style={{ fontFamily: V.serif, fontSize: 22, color: V.ink }}>{portal.name}</span>
                    <span style={{
                      fontSize: 10, fontFamily: V.mono, fontWeight: 600,
                      padding: '2px 10px', borderRadius: 2,
                      background: `${V.green}15`, color: V.green, border: `1px solid ${V.green}30`,
                      display: 'flex', alignItems: 'center', gap: 5,
                    }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: V.green }} className="animate-pulse" />
                      Live
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: V.ink3 }}>{portal.description}</p>
                  <p style={{ fontSize: 11, fontFamily: V.mono, color: V.ink4, marginTop: 2 }}>{portal.fullName}</p>
                </div>
              </div>
              <div style={{ color: portal.color, fontFamily: V.mono, fontSize: 12, fontWeight: 600, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                Open Portal
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </button>
        ))}

        {/* Coming Soon */}
        {comingSoon.length > 0 && <>
          <p style={{ fontFamily: V.mono, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: V.ink4, marginBottom: 10, marginTop: 28 }}>Coming Soon</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" style={{ marginBottom: 24 }}>
            {comingSoon.map(portal => (
              <div key={portal.id} style={{
                background: V.paper2, border: `1px solid ${V.paper3}`, borderRadius: 4,
                padding: '16px 18px', opacity: 0.6, cursor: 'not-allowed', position: 'relative',
              }}>
                <div className="flex items-start justify-between" style={{ marginBottom: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 4,
                    background: `${portal.color}12`, border: `1px solid ${portal.color}20`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: V.mono, fontSize: 12, fontWeight: 700, color: portal.color,
                  }}>{portal.abbr}</div>
                  <span style={{ fontSize: 9, fontFamily: V.mono, color: V.ink4, padding: '2px 8px', borderRadius: 2, background: V.paper3, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Lock size={8} /> Soon
                  </span>
                </div>
                <p style={{ fontFamily: V.serif, fontSize: 15, color: V.ink, marginBottom: 2 }}>{portal.name}</p>
                <p style={{ fontSize: 11, color: V.ink3, lineHeight: 1.4, marginBottom: 4 }}>{portal.description}</p>
                <p style={{ fontSize: 10, fontFamily: V.mono, color: V.ink4 }}>{portal.scope}</p>
              </div>
            ))}
          </div>
        </>}

        {/* Add more counsellings button */}
        <button
          onClick={onAddMore}
          className="group hover:shadow-md transition-all"
          style={{
            width: '100%', background: 'transparent', border: `1.5px dashed ${V.paper3}`,
            borderRadius: 4, padding: '16px 20px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            marginTop: 12,
          }}
        >
          <Plus size={16} style={{ color: V.ink4 }} />
          <span style={{ fontFamily: V.mono, fontSize: 11, color: V.ink4, fontWeight: 600, letterSpacing: '0.05em' }}>
            Add more counsellings
          </span>
        </button>

        <p style={{ textAlign: 'center', fontSize: 10, fontFamily: V.mono, color: V.ink4, marginTop: 28, letterSpacing: '0.05em' }}>
          Oviselect · Data updated for 2025–26 session
        </p>
      </div>
    </div>
  );
};

export default CounsellingHub;