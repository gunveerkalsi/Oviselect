import React, { useMemo, useState, Suspense, lazy } from 'react';
import { ArrowLeft, MapPin, GraduationCap, TrendingDown, BookOpen, ExternalLink, Users, Building2, Star, DollarSign, Award, Briefcase, Code, FlaskConical, Home, Loader2, Trophy, Globe, ArrowUpRight, MessageSquare } from 'lucide-react';

const NearbyPlaces = lazy(() => import('./NearbyPlaces'));

/* ── Design tokens (copilot palette) ──────────────────────────────────── */
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

/* ── Keyframes (injected once) ────────────────────────────────────────── */
const FADE_CSS = `@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`;
if (typeof document !== 'undefined' && !document.getElementById('cp-fade')) {
  const s = document.createElement('style'); s.id = 'cp-fade'; s.textContent = FADE_CSS; document.head.appendChild(s);
}

/* ── Section label (used in multiple places) ─────────────────── */
const SLabel: React.FC<{children: React.ReactNode}> = ({children}) => (
  <p style={{fontFamily:V.mono,fontSize:9,letterSpacing:'0.1em',textTransform:'uppercase',color:V.ink4,marginBottom:10,paddingBottom:8,borderBottom:`1px solid ${V.paper3}`}}>{children}</p>
);

/* Branch detection patterns (must match Hero.tsx) */
const BRANCH_PATTERNS: [RegExp, string][] = [
  [/computer science|cse|\bcs\b|artificial intelligence|data science|cyber|software/i, 'CSE'],
  [/information technology\b|^it\b/i, 'IT'],
  [/math.*comput|mnc|\bmnc\b|computational math/i, 'MnC'],
  [/electronics.*communic|ece|\bec\b|vlsi|telecom/i, 'ECE'],
  [/electrical.*electro|^electrical|eee|\beee\b|power.*auto|power.*electron/i, 'EEE'],
  [/instru|eni\b|biomedical.*eng/i, 'ENI'],
  [/mechani|aerospace|aeronaut/i, 'Mechanical'],
  [/chemical|biochem/i, 'Chemical'],
  [/produc|industr.*prod|manufact/i, 'Production'],
  [/civil|infra.*eng|environment.*eng|structural/i, 'Civil'],
  [/metallur|material/i, 'Metallurgy'],
  [/mining/i, 'Mining'],
];

const getBranchKey = (programName: string): string | null => {
  const lo = programName.toLowerCase();
  for (const [pat, key] of BRANCH_PATTERNS) {
    if (pat.test(lo)) return key;
  }
  return null;
};

interface CollegeProfileProps {
  college: any;
  homeState: string;
  priorityBranches: string[];
  onBack: () => void;
}

type TabId = 'overview' | 'cutoffs' | 'reddit' | 'nearby';

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview'       },
  { id: 'cutoffs',  label: 'Cutoffs'        },
  { id: 'reddit',   label: 'Reddit Insights'},
  { id: 'nearby',   label: 'Nearby'         },
];

const CollegeProfile: React.FC<CollegeProfileProps> = ({ college, homeState, priorityBranches, onBack }) => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const collegeState = college.state || null;
  const isHomeState = collegeState && homeState && collegeState.toLowerCase() === homeState.toLowerCase();
  const filteredPrograms = college.programs.filter((p: any) => {
    if (p.quota === 'HS' && !isHomeState) return false;
    return true;
  });
  const hasPriority = priorityBranches.length > 0;
  const priorityPrograms = hasPriority ? filteredPrograms.filter((p: any) => {
    const key = getBranchKey(p.name); return key !== null && priorityBranches.includes(key);
  }) : [];
  const otherPrograms = hasPriority ? filteredPrograms.filter((p: any) => {
    const key = getBranchKey(p.name); return key === null || !priorityBranches.includes(key);
  }) : filteredPrograms;

  const initials = college.inst.split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();

  return (
    <div className="max-w-5xl mx-auto mt-4 mb-16 px-2" style={{ fontFamily: V.sans }}>
      <button onClick={onBack} className="flex items-center gap-2 text-sm hover:opacity-70 transition-colors mb-6 group" style={{ color: V.ink3 }}>
        <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" /> Back to results
      </button>

      <div style={{ background: V.paper, border: `1px solid ${V.paper3}`, borderRadius: 4, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.06)' }}>
        {/* Dark ink header */}
        <div style={{ background: V.ink, borderRadius: '4px 4px 0 0', padding: '1.75rem 2rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position:'absolute', top:-40, right:-40, width:220, height:220, borderRadius:'50%', border:'1px solid rgba(245,242,236,0.06)' }} />
          <div style={{ position:'absolute', top:20, right:20, width:100, height:100, borderRadius:'50%', border:'1px solid rgba(245,242,236,0.04)' }} />
          <div className="flex items-start justify-between flex-wrap gap-4" style={{ position:'relative', zIndex:1 }}>
            <div className="flex items-center gap-4">
              <div style={{ width:48, height:48, borderRadius:4, background:'rgba(245,242,236,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:V.mono, fontSize:13, color:V.paper, fontWeight:600 }}>{initials}</div>
              <div>
                <h1 style={{ fontFamily:V.serif, fontSize:'clamp(1.5rem,4vw,2rem)', color:V.paper, lineHeight:1.2, marginBottom:6 }}>{college.inst}</h1>
                <div className="flex items-center flex-wrap gap-3" style={{ fontFamily:V.mono, fontSize:11, color:'rgba(245,242,236,0.4)' }}>
                  <span>{filteredPrograms.length} programme{filteredPrograms.length!==1?'s':''}</span>
                  {filteredPrograms[0]?.close && <><span>·</span><span>Best cutoff: <strong style={{color:V.paper}}>{filteredPrograms[0].close.toLocaleString()}</strong></span></>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {college.collegeInfo?.naac_grade && (
                <span style={{ fontSize:11, fontWeight:700, padding:'4px 12px', borderRadius:2, background:V.greenL, color:V.green, border:`1px solid ${V.green}40`, fontFamily:V.mono }}>NAAC {college.collegeInfo.naac_grade}</span>
              )}
              {college.collegeInfo?.established_year && (
                <span style={{ fontSize:11, padding:'4px 12px', borderRadius:2, background:'rgba(245,242,236,0.1)', color:'rgba(245,242,236,0.5)', fontFamily:V.mono }}>Est. {college.collegeInfo.established_year}</span>
              )}
            </div>
          </div>
        </div>

        {/* Stat strip */}
        {college.collegeInfo && <StatStrip info={college.collegeInfo} />}

        {/* Tab bar */}
        <div style={{ borderBottom: `1px solid ${V.paper3}`, display:'flex', paddingLeft:'1.5rem', background: V.paper, overflowX:'auto' }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                fontFamily: V.mono, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase',
                padding: '14px 18px', border: 'none', borderBottom: activeTab === tab.id ? `2px solid ${V.ink}` : '2px solid transparent',
                background: 'none', cursor: 'pointer', color: activeTab === tab.id ? V.ink : V.ink4,
                fontWeight: activeTab === tab.id ? 700 : 400, whiteSpace: 'nowrap',
                transition: 'color 0.15s',
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Overview tab ── */}
        {activeTab === 'overview' && (
          <>
            {college.loadingInfo && (
              <div style={{ padding:'2rem' }}>
                <div className="flex items-center justify-center gap-2 text-sm" style={{ color: V.ink4 }}>
                  <Loader2 size={16} className="animate-spin" /> Loading college details...
                </div>
              </div>
            )}
            {!college.loadingInfo && college.collegeInfo && <CollegeInfoSection info={college.collegeInfo} />}
            {!college.loadingInfo && !college.collegeInfo && (
              <div style={{ padding:'2rem' }}>
                <div style={{ background:V.paper2, borderRadius:4, padding:'1.5rem', textAlign:'center' }}>
                  <p style={{ fontSize:14, color:V.ink4, fontStyle:'italic' }}>Detailed college information not yet available.</p>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Cutoffs tab ── */}
        {activeTab === 'cutoffs' && (
          <div style={{ padding:'2rem' }}>
            {priorityPrograms.length > 0 && (
              <div style={{ marginBottom:'2rem' }}>
                <SLabel>Your priority branches</SLabel>
                <div className="space-y-2.5">
                  {priorityPrograms.map((p: any, j: number) => (
                    <ProgramRow key={j} p={p} index={j} priority />
                  ))}
                </div>
              </div>
            )}
            {otherPrograms.length > 0 && (
              <>
                <SLabel>{hasPriority ? 'Other available branches' : 'All programs & cutoffs'}</SLabel>
                <div className="space-y-2">
                  {otherPrograms.map((p: any, j: number) => (
                    <ProgramRow key={j} p={p} index={j} />
                  ))}
                </div>
              </>
            )}
            {filteredPrograms.length === 0 && (
              <p style={{ fontSize:14, color:V.ink4, fontStyle:'italic', textAlign:'center', padding:'2rem 0' }}>No cutoff data available for this college.</p>
            )}
          </div>
        )}

        {/* ── Reddit Insights tab ── */}
        {activeTab === 'reddit' && (
          <RedditInsights info={college.collegeInfo} loading={!!college.loadingInfo} />
        )}

        {/* ── Nearby tab ── */}
        {activeTab === 'nearby' && (
          <Suspense fallback={
            <div className="flex items-center justify-center gap-2" style={{ padding:'3rem', color: V.ink4 }}>
              <Loader2 size={16} className="animate-spin" /> Loading nearby places...
            </div>
          }>
            <NearbyPlaces college={college} />
          </Suspense>
        )}
      </div>
    </div>
  );
};

/* ── Program row (shared by priority + other) ────────────────── */
const ProgramRow: React.FC<{ p: any; index: number; priority?: boolean }> = ({ p, index, priority }) => (
  <div className="flex items-center justify-between" style={{ background: priority ? V.amberL : V.paper2, borderRadius:4, padding:'12px 18px', border:`1px solid ${priority ? V.amber+'30' : V.paper3}` }}>
    <div className="flex items-center gap-4 flex-1 min-w-0 mr-4">
      <span style={{ fontFamily: priority ? V.serif : V.mono, fontSize: priority ? 16 : 11, color: priority ? V.amber : V.ink4, width:24, textAlign:'center', flexShrink:0 }}>{index+1}</span>
      <div className="min-w-0">
        <p style={{ fontSize:14, fontWeight:600, color:V.ink }} className="truncate">{p.name}</p>
        <p style={{ fontSize:12, color:V.ink3, fontFamily:V.mono, marginTop:2 }}>{p.deg} · {p.yrs}yr · {p.quota}</p>
      </div>
    </div>
    <div className="text-right flex-shrink-0 flex items-baseline gap-4">
      <div>
        <p style={{ fontSize:9, fontFamily:V.mono, color:V.ink4, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:2 }}>Opening</p>
        <p style={{ fontSize:14, fontWeight:700, color:V.ink2, fontFamily:V.serif }} className="tabular-nums">{p.open?.toLocaleString()||'—'}</p>
      </div>
      <div style={{ width:1, height:28, background:V.paper3 }} />
      <div>
        <p style={{ fontSize:9, fontFamily:V.mono, color:V.ink4, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:2 }}>Closing</p>
        <p style={{ fontSize:14, fontWeight:700, color:V.ink, fontFamily:V.serif }} className="tabular-nums">{p.close?.toLocaleString()||'—'}</p>
      </div>
    </div>
  </div>
);

/* ── Helper: stat pill ─────────────────────────────────────────── */
const Stat: React.FC<{ label: string; value: string | number | null | undefined; icon?: React.ReactNode }> = ({ label, value, icon }) => {
  if (value === null || value === undefined) return null;
  return (
    <div style={{background:V.paper2,border:`1px solid ${V.paper3}`,borderRadius:4,padding:'10px 14px',display:'flex',flexDirection:'column',gap:3}}>
      <span style={{fontSize:10,fontFamily:V.mono,color:V.ink4,textTransform:'uppercase',letterSpacing:'0.07em',display:'flex',alignItems:'center',gap:4}}>{icon}{label}</span>
      <span style={{fontSize:14,fontWeight:700,color:V.ink,fontFamily:V.serif}}>{value}</span>
    </div>
  );
};

const TagList: React.FC<{ items: string[] | null | undefined; max?: number }> = ({ items, max = 8 }) => {
  if (!items || items.length === 0) return null;
  const shown = items.slice(0, max);
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {shown.map((t, i) => (
        <span key={i} style={{fontSize:11,background:V.paper,border:`1px solid ${V.paper3}`,color:V.ink2,padding:'4px 10px',borderRadius:2,fontFamily:V.mono}}>{t}</span>
      ))}
      {items.length > max && <span style={{fontSize:11,color:V.ink4,padding:'4px 6px'}}>+{items.length - max} more</span>}
    </div>
  );
};

/* ── Stat Strip ───────────────────────────────────────────────── */
const StatStrip: React.FC<{ info: any }> = ({ info }) => {
  const cells: { label: string; value: string; color?: string }[] = [];
  if (info.nirf_engineering_rank) cells.push({ label: 'NIRF ENG', value: `#${info.nirf_engineering_rank}` });
  if (info.nirf_overall_rank) cells.push({ label: 'NIRF OVERALL', value: `#${info.nirf_overall_rank}` });
  if (info.naac_grade) cells.push({ label: 'NAAC', value: `${info.naac_grade}${info.naac_cgpa ? ` (${info.naac_cgpa})` : ''}`, color: V.green });
  if (info.phd_seats) cells.push({ label: 'PHD SEATS', value: Number(info.phd_seats).toLocaleString() });
  if (info.avg_package_lpa) cells.push({ label: 'AVG CTC', value: `₹${info.avg_package_lpa}`, color: V.amber });
  if (info.avg_package_lpa) cells.push({ label: '', value: 'LPA ↑', color: V.amber });
  if (cells.length === 0) return null;
  return (
    <div className="grid grid-cols-3 sm:grid-cols-6" style={{ gap:1, background: V.paper3 }}>
      {cells.map((c, i) => (
        <div key={i} style={{ background: V.paper2, padding: '14px 12px', textAlign: 'center' }}>
          {c.label && <p style={{ fontFamily: V.mono, fontSize: 9, letterSpacing: '0.1em', color: V.ink4, textTransform: 'uppercase', marginBottom: 4 }}>{c.label}</p>}
          <p style={{ fontFamily: V.serif, fontSize: 20, color: c.color || V.ink, lineHeight: 1 }}>{c.value}</p>
        </div>
      ))}
    </div>
  );
};

/* ── College Info Section ─────────────────────────────────────── */
const IRow: React.FC<{k:string; v:any; link?:boolean}> = ({k,v,link}) => {
  if(v==null) return null;
  return <div className="flex items-baseline" style={{padding:'8px 0',borderBottom:`0.5px solid ${V.paper3}`}}>
    <span style={{width:160,flexShrink:0,fontSize:12,color:V.ink3}}>{k}</span>
    {link?<a href={String(v).startsWith('http')?v:`https://${v}`} target="_blank" rel="noopener noreferrer" style={{fontSize:13,color:V.blue,marginLeft:'auto',textDecoration:'none'}}>{v} ↗</a>
    :<span style={{fontSize:13,color:V.ink2,marginLeft:'auto',textAlign:'right'}}>{v}</span>}
  </div>;
};

const CollegeInfoSection: React.FC<{ info: any }> = ({ info }) => {
  const fmt = (v: number|null|undefined, s='') => v!=null?`${v.toLocaleString()}${s}`:null;
  const fmtLPA = (v: number|null|undefined) => v!=null?`₹${v} LPA`:null;
  const fmtCr = (v: number|null|undefined) => v!=null?`₹${v} Cr`:null;

  // Parse UG/PG programmes
  const parseProgs = (raw: any): any[] => {
    if(!raw) return [];
    if(Array.isArray(raw)) return raw;
    if(typeof raw==='string'){ try{return JSON.parse(raw)}catch{return []} }
    return [];
  };
  const ugProgs = parseProgs(info.ug_programmes);
  const pgProgs = parseProgs(info.pg_programmes);

  // Parse NIRF rank history
  const parseHistory = (raw: any): Record<string,number> => {
    if(!raw) return {};
    if(typeof raw==='string'){ try{return JSON.parse(raw)}catch{return {}} }
    if(typeof raw==='object'&&!Array.isArray(raw)) return raw;
    return {};
  };
  const nirfHist = parseHistory(info.nirf_rank_history);

  let sectionIdx = 0;
  const fadeStyle = (i:number) => ({animation:`fadeUp 0.4s ease ${i*0.05}s both`});

  return (
    <div style={{padding:'1.5rem 2rem'}}>

      {/* Location & Access */}
      {(info.city||info.nearest_airport)&&<div style={fadeStyle(sectionIdx++)}>
        <SLabel>LOCATION & ACCESS</SLabel>
        <IRow k="City" v={info.city&&info.state?`${info.city}, ${info.state}`:info.city}/>
        <IRow k="City Tier" v={info.city_tier}/>
        <IRow k="Nearest Airport" v={info.nearest_airport?(info.nearest_airport_km?`${info.nearest_airport} (${info.nearest_airport_km} km)`:info.nearest_airport):null}/>
        <IRow k="Nearest Railway" v={info.nearest_railway_station?(info.nearest_railway_km?`${info.nearest_railway_station} (${info.nearest_railway_km} km)`:info.nearest_railway_station):null}/>
        <IRow k="Website" v={info.official_website||info.website} link/>
        {/* Map stub */}
        <div style={{background:V.paper2,border:`1px solid ${V.paper3}`,borderRadius:4,height:120,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',marginTop:12,marginBottom:16}}>
          <div style={{width:8,height:8,borderRadius:'50%',background:V.accent,marginBottom:6}}/>
          <span style={{fontFamily:V.mono,fontSize:10,color:V.ink4}}>{info.city}, {info.state}</span>
        </div>
      </div>}

      {/* Fee Structure */}
      {(info.fees_general||info.hostel_fee_per_yr||info.annual_fees||info.tuition_fee_per_sem)&&<div style={fadeStyle(sectionIdx++)}>
        <SLabel>FEE STRUCTURE</SLabel>
        <div style={{background:V.amberL,border:`1px solid ${V.amber}`,borderRadius:4,padding:'1rem 1.25rem',display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:12,marginBottom:12}}>
          <div>
            <p style={{fontFamily:V.mono,fontSize:9,letterSpacing:'0.1em',textTransform:'uppercase',color:V.amber,marginBottom:4}}>Annual Tuition</p>
            <p style={{fontFamily:V.serif,fontSize:26,color:V.amber}}>₹{(info.fees_general||info.annual_fees||info.tuition_fee_per_sem*2||0).toLocaleString()}</p>
          </div>
          {info.fee_note&&<p style={{fontSize:11,color:V.amber,opacity:0.8,maxWidth:340}}>{info.fee_note}</p>}
        </div>
        <IRow k="Hostel / Year" v={info.hostel_fee_per_yr!=null?`₹${info.hostel_fee_per_yr.toLocaleString()}`:info.hostel_fee_per_sem!=null?`₹${info.hostel_fee_per_sem.toLocaleString()}/sem`:null}/>
        <IRow k="Mess / Month" v={info.mess_fee_per_month!=null?`₹${info.mess_fee_per_month.toLocaleString()}`:null}/>
        <IRow k="Total 4-Year" v={info.total_4yr_cost_estimate!=null?`₹${info.total_4yr_cost_estimate.toLocaleString()}`:null}/>
        {info.fee_waivers&&<div className="flex flex-wrap gap-2" style={{marginTop:10}}>
          {(Array.isArray(info.fee_waivers)?info.fee_waivers:[info.fee_waivers]).map((w:any,i:number)=>(
            <span key={i} style={{fontSize:11,padding:'5px 12px',borderRadius:2,background:V.greenL,color:V.green,border:`1px solid ${V.green}`,fontFamily:V.mono}}>{typeof w==='string'?w:w.name||JSON.stringify(w)}</span>
          ))}
        </div>}
        <div style={{height:16}}/>
      </div>}

      {/* Programmes (Bug fix 1) */}
      {(ugProgs.length>0||pgProgs.length>0)&&<div style={fadeStyle(sectionIdx++)}>
        <SLabel>PROGRAMMES OFFERED</SLabel>
        {ugProgs.length>0&&<>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" style={{marginBottom:12}}>
            {ugProgs.map((p:any,i:number)=>(
              <div key={i} style={{borderLeft:`3px solid ${V.blue}`,background:V.paper2,border:`1px solid ${V.paper3}`,borderLeftColor:V.blue,borderLeftWidth:3,borderRadius:4,padding:'10px 14px',position:'relative'}}>
                <span style={{position:'absolute',top:8,right:10,fontSize:9,fontFamily:V.mono,padding:'2px 8px',borderRadius:2,background:V.blueL,color:V.blue}}>UG</span>
                <p style={{fontSize:13,fontWeight:500,color:V.ink,paddingRight:40}}>{p.name||p}</p>
                <p style={{fontFamily:V.mono,fontSize:10,color:V.ink4,marginTop:3}}>
                  {[p.level,p.duration_years&&`${p.duration_years}yr`,p.intake_seats&&`${p.intake_seats} seats`].filter(Boolean).join(' · ')}
                </p>
              </div>
            ))}
          </div>
        </>}
        {pgProgs.length>0&&<>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" style={{marginBottom:12}}>
            {pgProgs.map((p:any,i:number)=>(
              <div key={i} style={{borderLeft:`3px solid ${V.accent}`,background:V.paper2,border:`1px solid ${V.paper3}`,borderLeftColor:V.accent,borderLeftWidth:3,borderRadius:4,padding:'10px 14px',position:'relative'}}>
                <span style={{position:'absolute',top:8,right:10,fontSize:9,fontFamily:V.mono,padding:'2px 8px',borderRadius:2,background:V.accentL,color:V.accent}}>PG</span>
                <p style={{fontSize:13,fontWeight:500,color:V.ink,paddingRight:40}}>{p.name||p}</p>
                <p style={{fontFamily:V.mono,fontSize:10,color:V.ink4,marginTop:3}}>
                  {[p.level,p.duration_years&&`${p.duration_years}yr`,p.intake_seats&&`${p.intake_seats} seats`].filter(Boolean).join(' · ')}
                </p>
              </div>
            ))}
          </div>
        </>}
        {/* PhD row */}
        {info.phd_available&&<div style={{background:V.paper2,border:`1px solid ${V.paper3}`,borderRadius:4,padding:'0.75rem 1rem',display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
          <span style={{fontSize:12,color:V.ink2}}>PhD programme available{info.phd_seats?`, ${Number(info.phd_seats).toLocaleString()} seats across disciplines`:''}</span>
          <span style={{fontSize:10,fontFamily:V.mono,padding:'3px 10px',borderRadius:2,background:V.greenL,color:V.green,border:`1px solid ${V.green}`}}>PhD Available</span>
        </div>}
      </div>}

      {/* NIRF Rank History (Bug fix 2) */}
      {Object.keys(nirfHist).length>0&&<div style={fadeStyle(sectionIdx++)}>
        <SLabel>NIRF RANK HISTORY</SLabel>
        {(()=>{
          const entries = Object.entries(nirfHist).sort(([a],[b])=>Number(b)-Number(a));
          const best = Math.min(...entries.map(([,r])=>Number(r)));
          return <div className="flex gap-3 overflow-x-auto pb-2" style={{marginBottom:16}}>
            {entries.map(([year,rank])=>{
              const pct = Math.min((best/Number(rank))*100,100);
              return <div key={year} style={{background:V.paper2,border:`1px solid ${V.paper3}`,borderRadius:4,padding:'12px 16px',minWidth:80,textAlign:'center'}}>
                <p style={{fontFamily:V.mono,fontSize:9,textTransform:'uppercase',letterSpacing:'0.07em',color:V.ink4,marginBottom:6}}>{year}</p>
                <p style={{fontFamily:V.serif,fontSize:24,color:V.ink,lineHeight:1,marginBottom:8}}>#{rank}</p>
                <div style={{height:4,background:V.paper3,borderRadius:2,overflow:'hidden'}}><div style={{width:`${pct}%`,height:'100%',background:V.ink,borderRadius:2}}/></div>
              </div>;
            })}
          </div>;
        })()}
      </div>}

      {/* Placements */}
      {(info.avg_package_lpa||info.median_package_lpa||info.placement_percentage)&&<div style={fadeStyle(sectionIdx++)}>
        <SLabel>PLACEMENTS</SLabel>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" style={{marginBottom:12}}>
          <Stat label="Average" value={fmtLPA(info.avg_package_lpa)} />
          <Stat label="Median" value={fmtLPA(info.median_package_lpa)} />
          <Stat label="Highest" value={fmtLPA(info.highest_package_lpa)} />
          <Stat label="Placed" value={info.placement_percentage!=null?`${info.placement_percentage}%`:null} />
          <Stat label="Companies" value={fmt(info.companies_visited)} />
          <Stat label="PPOs" value={fmt(info.ppo_count)} />
          <Stat label="MS Abroad/yr" value={fmt(info.ms_abroad_per_yr)} />
        </div>
        <TagList items={info.top_recruiters} max={10} />
        <div style={{height:16}}/>
      </div>}

      {/* Coding & Tech */}
      {(info.gsoc_selections_total||info.coding_club||info.startup_count)&&<div style={fadeStyle(sectionIdx++)}>
        <SLabel>TECH & CODING CULTURE</SLabel>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3" style={{marginBottom:16}}>
          <Stat label="GSoC" value={fmt(info.gsoc_selections_total)} />
          <Stat label="ICPC (3yr)" value={fmt(info.icpc_regionals_3yr)} />
          <Stat label="Hackathons" value={fmt(info.hackathon_wins_national)} />
          <Stat label="Startups" value={fmt(info.startup_count)} />
          {info.coding_club&&<Stat label="Coding Club" value="Yes" />}
          {info.gdsc_present&&<Stat label="GDSC" value="Yes" />}
        </div>
      </div>}

      {/* Campus Life */}
      {(info.hostel_capacity_boys||info.student_clubs_count||info.tech_fest_name)&&<div style={fadeStyle(sectionIdx++)}>
        <SLabel>CAMPUS LIFE</SLabel>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3" style={{marginBottom:16}}>
          <Stat label="Boys Hostel" value={fmt(info.hostel_capacity_boys,' seats')} />
          <Stat label="Girls Hostel" value={fmt(info.hostel_capacity_girls,' seats')} />
          <Stat label="Clubs" value={fmt(info.student_clubs_count)} />
          <Stat label="Tech Fest" value={info.tech_fest_name} />
          <Stat label="Cultural Fest" value={info.cultural_fest_name} />
          {info.swimming_pool&&<Stat label="Pool" value="Yes" />}
          {info.gym_on_campus&&<Stat label="Gym" value="Yes" />}
          <Stat label="Medical" value={info.medical_facility} />
          <Stat label="Intl. Exchange" value={fmt(info.international_exchange_programs,' programs')} />
        </div>
      </div>}

      {/* Faculty & Research */}
      {(info.total_faculty||info.total_research_grants_cr)&&<div style={fadeStyle(sectionIdx++)}>
        <SLabel>FACULTY & RESEARCH</SLabel>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3" style={{marginBottom:16}}>
          <Stat label="Faculty" value={fmt(info.total_faculty)} />
          <Stat label="PhD Faculty" value={info.faculty_with_phd_pct!=null?`${info.faculty_with_phd_pct}%`:null} />
          <Stat label="S:F Ratio" value={info.student_faculty_ratio!=null?`${info.student_faculty_ratio}:1`:null} />
          <Stat label="Research Grants" value={fmtCr(info.total_research_grants_cr)} />
          <Stat label="Active Projects" value={fmt(info.active_funded_projects)} />
          <Stat label="Patents (5yr)" value={fmt(info.patents_filed_5yr)} />
          <Stat label="Publications/yr" value={fmt(info.sci_scopus_publications_per_yr)} />
        </div>
      </div>}

      {/* Notable Alumni */}
      {info.notable_alumni&&info.notable_alumni.length>0&&<div style={fadeStyle(sectionIdx++)}>
        <SLabel>NOTABLE ALUMNI</SLabel>
        <TagList items={info.notable_alumni} max={12} />
        <div style={{height:16}}/>
      </div>}
    </div>
  );
};

/* ── Reddit Insights tab ─────────────────────────────────────── */
const RedditInsights: React.FC<{ info: any; loading: boolean }> = ({ info, loading }) => {
  if (loading) return (
    <div className="flex items-center justify-center gap-2" style={{ padding:'3rem', color: V.ink4 }}>
      <Loader2 size={16} className="animate-spin" /> Loading...
    </div>
  );

  const hasSentiment = info?.reddit_positive_pct != null || info?.reddit_negative_pct != null;
  const hasThemes    = info?.reddit_top_positive_themes?.length || info?.reddit_top_negative_themes?.length;
  const hasData      = info?.reddit_summary || hasSentiment || hasThemes;

  if (!hasData) return (
    <div style={{ padding:'2rem', textAlign:'center' }}>
      <MessageSquare size={32} style={{ color: V.ink4, margin:'0 auto 12px' }} />
      <p style={{ fontSize:14, color:V.ink4, fontStyle:'italic' }}>No Reddit data available for this college yet.</p>
    </div>
  );

  const pos  = Math.round(info.reddit_positive_pct ?? 0);
  const neg  = Math.round(info.reddit_negative_pct ?? 0);
  const neu  = Math.round(info.reddit_neutral_pct  ?? 100 - pos - neg);
  const total= info.reddit_mentions_count ?? null;

  return (
    <div style={{ padding:'2rem', fontFamily: V.sans }}>
      {total != null && (
        <div style={{ background:V.paper2, borderRadius:4, padding:'10px 16px', display:'inline-flex', alignItems:'center', gap:8, marginBottom:'1.5rem', border:`1px solid ${V.paper3}` }}>
          <MessageSquare size={14} style={{ color:V.ink4 }} />
          <span style={{ fontFamily:V.mono, fontSize:11, color:V.ink3 }}>{total.toLocaleString()} Reddit mention{total!==1?'s':''} analysed</span>
        </div>
      )}

      {/* Summary */}
      {info.reddit_summary && (
        <div style={{ marginBottom:'1.5rem' }}>
          <SLabel>Community Summary</SLabel>
          <p style={{ fontSize:14, color:V.ink2, lineHeight:1.7 }}>{info.reddit_summary}</p>
        </div>
      )}

      {/* Sentiment bar */}
      {hasSentiment && (
        <div style={{ marginBottom:'1.5rem' }}>
          <SLabel>Sentiment Breakdown</SLabel>
          <div style={{ display:'flex', borderRadius:4, overflow:'hidden', height:10, marginBottom:10 }}>
            <div style={{ width:`${pos}%`, background:V.green,  transition:'width 0.4s' }} title={`Positive ${pos}%`} />
            <div style={{ width:`${neu}%`, background:V.paper3, transition:'width 0.4s' }} title={`Neutral ${neu}%`} />
            <div style={{ width:`${neg}%`, background:V.accent, transition:'width 0.4s' }} title={`Negative ${neg}%`} />
          </div>
          <div className="flex gap-4" style={{ fontFamily:V.mono, fontSize:11 }}>
            <span style={{ color:V.green  }}>Positive {pos}%</span>
            <span style={{ color:V.ink4   }}>Neutral {neu}%</span>
            <span style={{ color:V.accent }}>Negative {neg}%</span>
          </div>
        </div>
      )}

      {/* Themes */}
      {info.reddit_top_positive_themes?.length > 0 && (
        <div style={{ marginBottom:'1rem' }}>
          <SLabel>What people praise</SLabel>
          <div className="flex flex-wrap gap-2">
            {info.reddit_top_positive_themes.map((t: string, i: number) => (
              <span key={i} style={{ padding:'4px 12px', borderRadius:20, background:V.greenL, color:V.green, fontSize:12, fontFamily:V.mono, border:`1px solid ${V.green}30` }}>{t}</span>
            ))}
          </div>
        </div>
      )}
      {info.reddit_top_negative_themes?.length > 0 && (
        <div>
          <SLabel>Common concerns</SLabel>
          <div className="flex flex-wrap gap-2">
            {info.reddit_top_negative_themes.map((t: string, i: number) => (
              <span key={i} style={{ padding:'4px 12px', borderRadius:20, background:V.accentL, color:V.accent, fontSize:12, fontFamily:V.mono, border:`1px solid ${V.accent}30` }}>{t}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CollegeProfile;
