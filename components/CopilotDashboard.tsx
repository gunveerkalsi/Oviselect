import React from 'react';
import './copilot-dashboard.css';

const CopilotDashboard: React.FC = () => (
  <div className="copilot-dash">

    {/* Header */}
    <div className="header">
      <div className="wordmark">
        <div className="wordmark-glyph" />
        <div>
          <div className="wordmark-text">OviSelect</div>
          <div className="wordmark-sub">COUNSELLING COPILOT</div>
        </div>
      </div>
      <div className="header-right">
        <span className="round-chip">ROUND 3 ACTIVE · JoSAA 2025</span>
        <span className="live-chip"><span className="live-dot" /> LIVE TRACKING</span>
      </div>
    </div>

    {/* Rank Hero */}
    <div className="rank-hero">
      <div>
        <div className="rank-number">24,135</div>
        <div className="rank-sublabel">JEE MAIN CRL · GENERAL · JoSAA 2025</div>
      </div>
      <div className="rank-attrs">
        <div className="ra-item"><span className="ra-label">Category</span><span className="ra-val">General</span></div>
        <div className="ra-item"><span className="ra-label">Percentile</span><span className="ra-val">~97.8</span></div>
        <div className="ra-item"><span className="ra-label">Home State</span><span className="ra-val">Maharashtra</span></div>
        <div className="ra-item"><span className="ra-label">Preference</span><span className="ra-val">Civil Engg.</span></div>
      </div>
    </div>

    {/* Allotment Banner */}
    <div className="allotment-banner">
      <span className="ab-badge">Current allotment</span>
      <div className="ab-body">
        <div className="ab-college">NIT Warangal</div>
        <div className="ab-branch">Civil Engineering · Other State · Gender Neutral</div>
        <div className="ab-cutoff">R5 closing 2024 → 25,857 &nbsp;·&nbsp; you are ~1,722 ranks inside cutoff</div>
      </div>
      <button className="ab-action">Freeze →</button>
    </div>

    {/* Metrics */}
    <div className="metrics-row">
      <div className="mcard">
        <div className="mcard-label">Current allotment</div>
        <div className="mcard-val green" style={{ fontSize: 19, marginTop: 2 }}>NITW Civil</div>
        <div className="mcard-sub">~1,722 ranks inside cutoff</div>
      </div>
      <div className="mcard">
        <div className="mcard-label">Upgrade possible?</div>
        <div className="mcard-val amber">Slim</div>
        <div className="mcard-sub">Surathkal, slight chance</div>
      </div>
      <div className="mcard">
        <div className="mcard-label">ECE / CS top NIT</div>
        <div className="mcard-val red">✕</div>
        <div className="mcard-sub">Closes well under 10k</div>
      </div>
      <div className="mcard">
        <div className="mcard-label">Decision score</div>
        <div className="mcard-val green">76</div>
        <div className="mcard-sub">Strong, consider float</div>
      </div>
    </div>

    {/* Two col */}
    <div className="two-col">
      {/* Copilot Panel */}
      <div className="copilot-panel">
        <div className="cp-header">
          <div className="cp-header-left">
            <div className="cp-icon">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <circle cx="5" cy="5" r="3.5" stroke="rgba(245,242,236,0.55)" strokeWidth="1"/>
                <path d="M3.5 5l1 1L6.5 3.5" stroke="rgba(245,242,236,0.8)" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="cp-title">COPILOT RECOMMENDATION</span>
          </div>
          <span className="cp-round-tag">R3 / JoSAA 2025</span>
        </div>

        <div className="round-track">
          <div className="rt-step"><div className="rt-dot rt-done">✓</div><span className="rt-label">R1</span></div>
          <div className="rt-step"><div className="rt-dot rt-done">✓</div><span className="rt-label">R2</span></div>
          <div className="rt-step"><div className="rt-dot rt-active">3</div><span className="rt-label active">R3</span></div>
          <div className="rt-step"><div className="rt-dot rt-pending">4</div><span className="rt-label">R4</span></div>
          <div className="rt-step"><div className="rt-dot rt-pending">5</div><span className="rt-label">R5</span></div>
        </div>

        <div className="advice-list">
          <div className="adv adv-green">
            <span className="adv-sym">→</span>
            <div className="adv-body"><strong>Freeze recommended as base strategy.</strong> NIT Warangal Civil (R5 OS closing: <strong>25,857</strong>) is a strong outcome at your rank. You sit 1,722 ranks inside the cutoff, giving you a comfortable buffer. NITW is a Tier-1 NIT with excellent civil + core placements. Avg package <strong>₹9.14 LPA</strong>, median <strong>₹8.99 LPA</strong>, placement rate <strong>73.42%</strong>.</div>
          </div>
          <div className="adv adv-amber">
            <span className="adv-sym">!</span>
            <div className="adv-body"><strong>Slight float opportunity: NIT Surathkal Civil.</strong> R5 OS closing was <strong>22,939</strong> in 2024, that's 1,196 ranks ahead of your CRL 24,135. This is a stretch but not impossible if cutoffs shift upward in 2025 R4-R5. Keep Surathkal listed above NITW and float, but do not Slide out of Warangal for it.</div>
          </div>
          <div className="adv adv-red">
            <span className="adv-sym">✕</span>
            <div className="adv-body"><strong>NIT Trichy Civil is firmly out of range.</strong> Verified R5 OS closing: <strong>18,965</strong>, which is 5,170 ranks beyond your CRL. Do not waste choice slots on Trichy Civil. NIT Rourkela Civil closed at <strong>25,893</strong>, narrowly ahead of you and notably <em>lower-ranked than NITW</em> in academics, placements, and infrastructure. Even if Rourkela opens, it is not an upgrade.</div>
          </div>
          <div className="adv adv-blue">
            <span className="adv-sym">i</span>
            <div className="adv-body"><strong>Why NITW beats Rourkela in every aspect:</strong> Better faculty, stronger alumni network, superior civil placement record, higher median packages, and significantly better campus infrastructure. Rourkela Civil at a higher cutoff than Warangal in 2024 does not make it a better college. NITW is the clear winner on merit.</div>
          </div>
        </div>

        <div className="cp-actions">
          <button className="cta-btn">Freeze this seat →</button>
          <button className="cta-btn ghost">NITW Civil placements</button>
          <button className="cta-btn ghost">CSAB special round</button>
        </div>
      </div>

      {/* Right col */}
      <div className="right-col">
        <div className="bv-card">
          <div className="section-label">Civil Engg. closing ranks · General OS R5 2024</div>
          <div className="br-row">
            <span className="br-name" style={{ color: 'var(--accent)', fontWeight: 600 }}>NIT Trichy</span>
            <div className="br-track"><div className="br-fill" style={{ width: '9%', background: 'var(--accent)' }} /></div>
            <span className="br-score na">18,965 ✕</span>
          </div>
          <div className="br-row">
            <span className="br-name" style={{ color: 'var(--accent)', fontWeight: 600 }}>NIT Surathkal</span>
            <div className="br-track"><div className="br-fill" style={{ width: '11%', background: 'var(--accent)', opacity: 0.65 }} /></div>
            <span className="br-score na">22,939 ~</span>
          </div>
          <div className="br-row">
            <span className="br-name" style={{ color: 'var(--accent)', fontWeight: 600 }}>NIT Rourkela</span>
            <div className="br-track"><div className="br-fill" style={{ width: '14%', background: 'var(--accent)', opacity: 0.45 }} /></div>
            <span className="br-score na">25,893 ✕</span>
          </div>
          <div className="divider" />
          <div className="br-row">
            <span className="br-name" style={{ color: 'var(--green)', fontWeight: 600 }}>✓ NITW (yours)</span>
            <div className="br-track"><div className="br-fill" style={{ width: '78%', background: 'var(--green)' }} /></div>
            <span className="br-score" style={{ color: 'var(--green)', fontWeight: 500 }}>25,857</span>
          </div>
          <div className="br-row">
            <span className="br-name">NIT Calicut</span>
            <div className="br-track"><div className="br-fill" style={{ width: '92%', background: '#2a6b4a', opacity: 0.4 }} /></div>
            <span className="br-score">33,650</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 12, lineHeight: 1.6, paddingTop: 10, borderTop: '1px solid var(--paper-3)' }}>
            NITW Civil is the <strong>best realistic civil seat</strong> at CRL 24,135. Surathkal (22,939) is a slim float. Rourkela (25,893) closed just ahead and is a <strong>weaker college than NITW</strong> on every metric.
          </div>
        </div>

        <div className="dark-card">
          <div className="section-label" style={{ color: 'rgba(245,242,236,.3)' }}>Verdict</div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 18, color: 'var(--paper)', lineHeight: 1.4, letterSpacing: '-0.01em' }}>
            Float for Surathkal, Freeze on Warangal. Don't chase Rourkela.
          </div>
          <div style={{ fontSize: 11, color: 'rgba(245,242,236,.42)', marginTop: 10, lineHeight: 1.6 }}>
            NITW Civil · Avg ₹9.14 LPA · Median ₹8.99 LPA · 73.42% placed · Better than Rourkela on every metric.
          </div>
        </div>
      </div>
    </div>

    {/* College list */}
    <div className="matches-card">
      <div className="matches-header">
        <span>Civil Engg. · General OS · Gender Neutral · verified CollegePravesh 2024</span>
        <span className="col-count">6 shown</span>
      </div>
      <div className="college-item">
        <span className="ci-rank">-</span>
        <div className="ci-prob-bar" style={{ background: 'var(--accent)', opacity: 0.4 }} />
        <div className="ci-body">
          <div className="ci-name">NIT Tiruchirappalli</div>
          <div className="ci-branch">Civil Engineering · OS · Gender Neutral</div>
          <div className="ci-cutoff">R5 closing 2024 → 18,965 &nbsp;·&nbsp; 5,170 ranks beyond your CRL</div>
        </div>
        <div className="ci-right"><span className="ci-prob prob-lo">✕</span><span className="ci-tag tag-out">out of range</span></div>
      </div>
      <div className="college-item">
        <span className="ci-rank">~</span>
        <div className="ci-prob-bar" style={{ background: 'var(--amber)', opacity: 0.7 }} />
        <div className="ci-body">
          <div className="ci-name">NIT Surathkal</div>
          <div className="ci-branch">Civil Engineering · OS · Gender Neutral</div>
          <div className="ci-cutoff">R5 closing 2024 → 22,939 &nbsp;·&nbsp; 1,196 ranks ahead · slim float if 2025 cutoffs rise</div>
        </div>
        <div className="ci-right"><span className="ci-prob prob-md">~18%</span><span className="ci-tag tag-float">float only</span></div>
      </div>
      <div className="college-item">
        <span className="ci-rank">-</span>
        <div className="ci-prob-bar" style={{ background: 'var(--accent)', opacity: 0.3 }} />
        <div className="ci-body">
          <div className="ci-name">NIT Rourkela <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--accent)', fontWeight: 400 }}>weaker than NITW on all metrics</span></div>
          <div className="ci-branch">Civil Engineering · OS · Gender Neutral</div>
          <div className="ci-cutoff">R5 closing 2024 → 25,893 &nbsp;·&nbsp; lower-ranked college than NITW</div>
        </div>
        <div className="ci-right"><span className="ci-prob prob-lo">✕</span><span className="ci-tag tag-out">not worth it</span></div>
      </div>
      <div className="college-item current">
        <span className="ci-rank">01</span>
        <div className="ci-prob-bar" style={{ background: 'var(--green)' }} />
        <div className="ci-body">
          <div className="ci-name">NIT Warangal <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--green)', fontWeight: 400 }}>← your allotment</span></div>
          <div className="ci-branch">Civil Engineering · OS · Gender Neutral</div>
          <div className="ci-cutoff">R5 closing 2024 → 25,857 &nbsp;·&nbsp; ~1,722 ranks inside · best realistic civil seat at your rank</div>
        </div>
        <div className="ci-right"><span className="ci-prob prob-hi">Freeze</span><span className="ci-tag tag-current">current</span></div>
      </div>
      <div className="college-item">
        <span className="ci-rank">02</span>
        <div className="ci-prob-bar" style={{ background: 'var(--green)', opacity: 0.5 }} />
        <div className="ci-body">
          <div className="ci-name">NIT Calicut</div>
          <div className="ci-branch">Civil Engineering · OS · Gender Neutral</div>
          <div className="ci-cutoff">R5 closing 2024 → 33,650 &nbsp;·&nbsp; safe but lower-ranked than NITW</div>
        </div>
        <div className="ci-right"><span className="ci-prob prob-hi">91%</span><span className="ci-tag tag-safe">downgrade</span></div>
      </div>
      <div className="college-item">
        <span className="ci-rank">03</span>
        <div className="ci-prob-bar" style={{ background: 'var(--amber)', opacity: 0.6 }} />
        <div className="ci-body">
          <div className="ci-name">NIT Calicut</div>
          <div className="ci-branch">Chemical Engineering · OS · Gender Neutral &nbsp;·&nbsp; branch alternative</div>
          <div className="ci-cutoff">R5 closing 2024 → 26,194 &nbsp;·&nbsp; safe if branch flexibility exists</div>
        </div>
        <div className="ci-right"><span className="ci-prob prob-hi">78%</span><span className="ci-tag tag-float">alt branch</span></div>
      </div>
    </div>

  </div>
);

export default CopilotDashboard;
