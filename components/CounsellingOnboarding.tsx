import React, { useState } from 'react';
import { Check, ArrowRight, ChevronDown } from 'lucide-react';

/* ── Design tokens ─────────────────────────────────────────────────── */
const V = {
  ink: '#0e0e0e', ink2: '#3a3a3a', ink3: '#6b6b6b', ink4: '#a8a8a8',
  paper: '#f5f2ec', paper2: '#edeae3', paper3: '#e3dfd7',
  green: '#2A6B4A', greenLt: '#d5ece1',
  accent: '#c8522a', accentLt: '#f5e6e0',
  serif: "'DM Serif Display',Georgia,serif",
  mono: "'DM Mono',monospace",
  sans: "'Instrument Sans',sans-serif",
};

export interface Counselling {
  id: string;
  abbr: string;           // 2-letter logo text
  name: string;
  fullName: string;
  color: string;
  description: string;
  scope: string;
}

export const ALL_COUNSELLINGS: Counselling[] = [
  { id: 'josaa',          abbr: 'JO', name: 'JoSAA',          fullName: 'Joint Seat Allocation Authority',                      color: '#4A9EFF', description: 'IITs, NITs, IIITs & GFTIs',            scope: 'National' },
  { id: 'csab',           abbr: 'CS', name: 'CSAB',            fullName: 'Central Seat Allocation Board',                        color: '#34D399', description: 'NIT+ special rounds',                   scope: 'National' },
  { id: 'jac-delhi',      abbr: 'JD', name: 'JAC Delhi',       fullName: 'Joint Admission Counselling - Delhi',                  color: '#A78BFA', description: 'DTU, NSIT, IGDTUW, IIIT-D, DSEU',      scope: 'Delhi' },
  { id: 'jac-chandigarh', abbr: 'JC', name: 'JAC Chandigarh',  fullName: 'Joint Admission Counselling - Chandigarh',             color: '#38BDF8', description: 'UIET & Chandigarh colleges',            scope: 'Chandigarh' },
  { id: 'comedk',         abbr: 'CK', name: 'COMEDK',          fullName: 'Consortium of Medical & Dental Colleges of Karnataka', color: '#F87171', description: 'Karnataka colleges for AI (All India) folks',   scope: 'Karnataka' },
  { id: 'kcet',           abbr: 'KC', name: 'KCET',            fullName: 'Karnataka Common Entrance Test',                       color: '#C084FC', description: 'Karnataka colleges for Karnataka domicile folks', scope: 'Karnataka' },
  { id: 'mhtcet',         abbr: 'MH', name: 'MHT-CET',         fullName: 'Maharashtra Common Entrance Test',                     color: '#60A5FA', description: 'Maharashtra engineering colleges',       scope: 'Maharashtra' },
  { id: 'wbjee',          abbr: 'WB', name: 'WBJEE',           fullName: 'West Bengal Joint Entrance Exam',                      color: '#4ADE80', description: 'West Bengal state colleges',             scope: 'West Bengal' },
  { id: 'viteee',         abbr: 'VI', name: 'VITEEE',          fullName: 'VIT Engineering Entrance Exam',                        color: '#FBBF24', description: 'VIT Vellore, Chennai, Bhopal & AP',     scope: 'Private' },
  { id: 'bitsat',         abbr: 'BI', name: 'BITSAT',          fullName: 'BITS Admission Test',                                  color: '#F472B6', description: 'BITS Pilani, Goa & Hyderabad',          scope: 'Private' },
  { id: 'met',            abbr: 'ME', name: 'MET',             fullName: 'Manipal Entrance Test',                                color: '#FB923C', description: 'Manipal Academy of Higher Ed.',         scope: 'Private' },
  { id: 'tiet',           abbr: 'TI', name: 'TIET',            fullName: 'Thapar Institute of Engg & Tech',                      color: '#818CF8', description: 'Thapar University admissions',           scope: 'Private' },
];

const STORAGE_KEY = 'oviguide_counsellings';

export function getStoredCounsellings(): string[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}

export function setStoredCounsellings(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

interface Props {
  userName: string;
  initial?: string[];
  onComplete: (selected: string[]) => void;
}

const CounsellingOnboarding: React.FC<Props> = ({ userName, initial, onComplete }) => {
  const [selected, setSelected] = useState<Set<string>>(new Set(initial || []));
  const [agreed, setAgreed] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const firstName = userName?.split(' ')[0] || 'there';

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleContinue = () => {
    if (!agreed) return;
    localStorage.setItem('oviguide_marketing_consent', JSON.stringify({ consented: true, timestamp: new Date().toISOString() }));
    const ids = Array.from(selected);
    setStoredCounsellings(ids);
    onComplete(ids);
  };

  return (
    <div style={{ background: V.paper, fontFamily: V.sans, minHeight: '100vh' }} className="px-4 sm:px-8 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontFamily: V.mono, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: V.ink4, marginBottom: 12 }}>
            Welcome, {firstName}
          </p>
          <h1 style={{ fontFamily: V.serif, fontSize: 'clamp(1.75rem, 5vw, 2.75rem)', color: V.ink, lineHeight: 1.15, marginBottom: 10 }}>
            Which counsellings are<br />you appearing for?
          </h1>
          <p style={{ fontSize: 15, color: V.ink3, lineHeight: 1.6, maxWidth: 480 }}>
            Select all that apply. We'll tailor your dashboard to show only what matters. You can always add more later.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" style={{ marginBottom: 32 }}>
          {ALL_COUNSELLINGS.map(c => {
            const on = selected.has(c.id);
            return (
              <button key={c.id} onClick={() => toggle(c.id)} style={{
                background: on ? V.ink : V.paper2,
                border: `1.5px solid ${on ? V.ink : V.paper3}`,
                borderRadius: 4, padding: '16px 18px', textAlign: 'left',
                cursor: 'pointer', transition: 'all 0.15s',
                position: 'relative', overflow: 'hidden',
              }}>
                {/* Logo + content */}
                <div className="flex items-start gap-3">
                  <div style={{
                    width: 42, height: 42, borderRadius: 4, flexShrink: 0,
                    background: on ? `${c.color}30` : `${c.color}15`,
                    border: `1.5px solid ${c.color}${on ? '60' : '30'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: V.mono, fontSize: 13, fontWeight: 700, color: on ? '#fff' : c.color,
                  }}>{c.abbr}</div>
                  <div style={{ flex: 1 }}>
                    <div className="flex items-center gap-2">
                      <span style={{ fontFamily: V.serif, fontSize: 16, color: on ? V.paper : V.ink }}>{c.name}</span>
                      <span style={{ fontSize: 9, fontFamily: V.mono, padding: '1px 6px', borderRadius: 2, background: on ? 'rgba(245,242,236,0.15)' : V.paper3, color: on ? 'rgba(245,242,236,0.5)' : V.ink4 }}>{c.scope}</span>
                    </div>
                    <p style={{ fontSize: 11, color: on ? 'rgba(245,242,236,0.5)' : V.ink3, marginTop: 2, lineHeight: 1.4 }}>{c.description}</p>
                    <p style={{ fontSize: 10, fontFamily: V.mono, color: on ? 'rgba(245,242,236,0.3)' : V.ink4, marginTop: 3 }}>{c.fullName}</p>
                  </div>
                </div>
                {/* Checkmark */}
                {on && (
                  <div style={{
                    position: 'absolute', top: 10, right: 10, width: 22, height: 22, borderRadius: '50%',
                    background: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Check size={13} color="#fff" strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* T&C + Continue */}
        <div style={{ borderTop: `1px solid ${V.paper3}`, paddingTop: 20, marginTop: 4 }}>

          {/* Subtle checkbox */}
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', marginBottom: 14 }}>
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              style={{ marginTop: 2, width: 13, height: 13, accentColor: V.ink, flexShrink: 0, cursor: 'pointer' }}
            />
            <span style={{ fontSize: 11, color: V.ink4, lineHeight: 1.5, fontFamily: V.sans }}>
              I agree to the{' '}
              <a href="/terms" style={{ color: V.ink3, textDecoration: 'underline' }}>terms and conditions</a>
              {' '}and{' '}
              <a href="/privacy" style={{ color: V.ink3, textDecoration: 'underline' }}>privacy policy</a>
              {'  '}
              <button
                onClick={e => { e.preventDefault(); setTermsOpen(o => !o); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: V.ink4, display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 10, fontFamily: V.mono, verticalAlign: 'middle' }}
              >
                <ChevronDown size={11} style={{ transform: termsOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
              </button>
            </span>
          </label>

          {/* Expandable terms summary — subtle, long paragraph */}
          {termsOpen && (
            <div style={{ marginBottom: 16, padding: '12px 14px', background: V.paper2, borderRadius: 4, border: `1px solid ${V.paper3}` }}>
              <p style={{ fontSize: 10.5, color: V.ink4, lineHeight: 1.75, fontFamily: V.sans }}>
                By continuing, you acknowledge that OviGuide (operated by Oviqo) is an AI-assisted counselling decision tool and that all predictions, recommendations, and college suggestions generated by the platform are based on historical data and statistical modelling, provided for informational purposes only and do not constitute official admission guarantees, professional advice, or any binding commitment on the part of Oviqo or any affiliated institution. The platform sources cutoff data from publicly available JoSAA, VITEEE, and state counselling records, and while we make every effort to keep this data accurate and current, we cannot guarantee the completeness or correctness of any information displayed. You agree that Oviqo shall not be held liable for any admission decisions, financial losses, missed opportunities, or other consequences that arise from your use of or reliance on OviGuide's outputs. Your personal information, including name, email address, JEE rank, category, home state, and educational preferences, may be shared with third-party educational institutions, coaching centres, and counselling partners for the purpose of providing you with relevant outreach and admissions-related communications; by proceeding you consent to this. You may opt out at any time by writing to team@oviqo.in. Automated access, scraping, or reverse-engineering of the platform is strictly prohibited. Oviqo reserves the right to suspend or terminate your access for violations of these terms. This agreement is governed by the laws of India, and any disputes shall be resolved in the courts of Bengaluru, Karnataka.
              </p>
            </div>
          )}

          {/* Row: count + button */}
          <div className="flex items-center justify-between">
            <p style={{ fontSize: 11, fontFamily: V.mono, color: V.ink4 }}>
              {selected.size === 0 ? 'Select at least one' : `${selected.size} selected`}
            </p>
            <button
              onClick={handleContinue}
              disabled={selected.size === 0 || !agreed}
              style={{
                background: selected.size > 0 && agreed ? V.ink : V.paper3,
                color: selected.size > 0 && agreed ? V.paper : V.ink4,
                border: 'none', borderRadius: 4, padding: '12px 28px',
                fontFamily: V.mono, fontSize: 12, fontWeight: 600, letterSpacing: '0.05em',
                cursor: selected.size > 0 && agreed ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.15s',
              }}
            >
              Continue
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CounsellingOnboarding;
