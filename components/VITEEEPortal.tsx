import React, { useEffect, useState } from 'react';
import { ArrowLeft, MapPin, MessageCircle, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';

/* ── Design tokens ────────────────────────────────────────────────────── */
const C = {
  paper: '#f5f2ec', paper2: '#edeae3', paper3: '#e3dfd7',
  ink: '#0e0e0e', ink2: '#3a3a3a', ink3: '#6b6b6b', ink4: '#a8a8a8',
  green: '#2A6B4A', greenLt: '#d5ece1',
  amber: '#8a5a1d', amberLt: '#f5e6d0',
  blue: '#1d4f8a', blueLt: '#d6e4f5',
  accent: '#c8522a', accentLt: '#f5e6e0',  // terracotta
  red: '#a83232', redLt: '#fce4e4',
  purple: '#6b3fa0', purpleLt: '#ede4f5',
  teal: '#1a7a6d', tealLt: '#d4f0eb',
  serif: "'DM Serif Display',Georgia,serif",
  mono: "'DM Mono',monospace",
  sans: "'Instrument Sans',sans-serif",
};

interface CampusData {
  campus_slug: string; campus_name: string; stats: Record<string, any>;
  reddit_insights: Record<string, any[]>; total_reddit_posts: number;
  total_insights: number; confidence_score: number;
}

const TH: Record<string, { label: string; emoji: string; bg: string; fg: string; border: string }> = {
  placements_reality:      { label: 'Placements Reality',   emoji: '💰', bg: C.greenLt,  fg: C.green,  border: C.green },
  hostel_and_food:         { label: 'Hostel & Food',        emoji: '🏠', bg: C.amberLt,  fg: C.amber,  border: C.amber },
  fees_and_money:          { label: 'Fees & Money',         emoji: '💸', bg: C.redLt,    fg: C.red,    border: C.red },
  faculty_and_academics:   { label: 'Faculty & Academics',  emoji: '📚', bg: C.blueLt,   fg: C.blue,   border: C.blue },
  campus_life_and_culture: { label: 'Campus Life',          emoji: '🎉', bg: C.purpleLt, fg: C.purple, border: C.purple },
  safety_and_controversy:  { label: 'Safety & Controversy', emoji: '⚠️', bg: C.redLt,    fg: C.red,    border: C.red },
  infrastructure:          { label: 'Infrastructure',       emoji: '🏗️', bg: C.tealLt,   fg: C.teal,   border: C.teal },
  admission_reality:       { label: 'Admission Reality',    emoji: '🎓', bg: C.amberLt,  fg: C.amber,  border: C.amber },
  general:                 { label: 'General',              emoji: '💬', bg: C.paper2,   fg: C.ink3,   border: C.paper3 },
};

const Pill: React.FC<{ label: string; value: string; color?: string }> = ({ label, value, color }) => (
  <div style={{ background: C.paper2, border: `1px solid ${C.paper3}`, borderRadius:4, padding:'12px 10px', textAlign:'center' }}>
    <p style={{ color: C.ink4, fontFamily:C.mono, fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:4 }}>{label}</p>
    <p style={{ color: color||C.ink, fontFamily:C.serif, fontSize:20, lineHeight:1 }}>{value}</p>
  </div>
);

const VITEEEPortal: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [campuses, setCampuses] = useState<CampusData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState<string | null>(null);
  const [oTheme, setOTheme] = useState<string | null>(null);
  const [oPost, setOPost] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('vit_campus_insights').select('*').order('campus_slug');
      if (data) {
        const ORDER = ['vit-vellore','vit-chennai','vit-bhopal','vit-amaravati'];
        const parsed = data.map((d: any) => ({
          ...d,
          stats: typeof d.stats === 'string' ? JSON.parse(d.stats) : (d.stats || {}),
          reddit_insights: typeof d.reddit_insights === 'string' ? JSON.parse(d.reddit_insights) : (d.reddit_insights || {}),
        }));
        parsed.sort((a: CampusData, b: CampusData) => {
          const ai = ORDER.indexOf(a.campus_slug), bi = ORDER.indexOf(b.campus_slug);
          return (ai===-1?99:ai)-(bi===-1?99:bi);
        });
        setCampuses(parsed);
      }
      setLoading(false);
    })();
  }, []);

  const act = campuses.find(c => c.campus_slug === sel);
  if (loading) return (
    <div style={{background:C.paper,fontFamily:C.sans}} className="min-h-screen flex items-center justify-center">
      <div style={{width:32,height:32,border:`2px solid ${C.ink}`,borderTopColor:'transparent',borderRadius:'50%'}} className="animate-spin"/>
    </div>
  );

  return (
    <div style={{background:C.paper,color:C.ink,fontFamily:C.sans}} className="min-h-screen px-4 sm:px-8 py-12">
      <div className="max-w-6xl mx-auto">
        <button onClick={sel?()=>{setSel(null);setOTheme(null);setOPost(null)}:onBack}
          style={{color:C.ink3,fontFamily:C.mono,fontSize:10,letterSpacing:'0.07em',textTransform:'uppercase'}} className="flex items-center gap-2 hover:opacity-70 mb-8 group">
          <span className="group-hover:-translate-x-0.5 transition-transform">‹</span>
          {sel?'BACK TO CAMPUSES':'BACK TO COUNSELLING HUB'}
        </button>

        {/* Page header (campus list view only) */}
        {!sel&&<div style={{marginBottom:40}} className="flex items-center gap-4">
          <div style={{width:48,height:48,borderRadius:4,background:C.amberLt,border:`1.5px solid ${C.amber}`,color:C.amber,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:C.mono,fontSize:14,fontWeight:700}}>VI</div>
          <div>
            <h1 style={{fontFamily:C.serif,color:C.ink,fontSize:'clamp(1.75rem,4vw,2.25rem)',lineHeight:1.1}}>VITEEE</h1>
            <p style={{color:C.ink4,fontFamily:C.mono,fontSize:11,marginTop:4,letterSpacing:'0.03em'}}>Unfiltered insights · {campuses.reduce((a,c)=>a+c.total_reddit_posts,0).toLocaleString()} Reddit posts analyzed</p>
          </div>
        </div>}

        {!sel&&<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{campuses.map(c=><Card key={c.campus_slug} c={c} onClick={()=>setSel(c.campus_slug)}/>)}</div>}
        {act&&<Detail c={act} oTheme={oTheme} setOTheme={setOTheme} oPost={oPost} setOPost={setOPost}/>}
      </div>
    </div>
  );
};

/* ── Card ─────────────────────────────────────────────────────────────────── */
const Card: React.FC<{c: CampusData; onClick:()=>void}> = ({c, onClick}) => {
  const s = c.stats||{};
  const initials = c.campus_name.split(/\s+/).slice(0,2).map(w=>w[0]).join('').toUpperCase();
  return (
    <button onClick={onClick} style={{background:C.paper2,border:`1px solid ${C.paper3}`,borderRadius:4,textAlign:'left',padding:'1.5rem 1.75rem'}} className="group hover:shadow-lg transition-all w-full">
      <div className="flex items-start justify-between" style={{marginBottom:14}}>
        <div className="flex items-center gap-3">
          <div style={{width:36,height:36,borderRadius:4,background:C.paper3,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:C.mono,fontSize:11,color:C.ink3,fontWeight:600,flexShrink:0}}>{initials}</div>
          <div>
            <h2 style={{color:C.ink,fontFamily:C.serif,fontSize:18,lineHeight:1.2,marginBottom:3}}>{c.campus_name}</h2>
            <div className="flex items-center gap-2" style={{fontSize:11,color:C.ink4,fontFamily:C.mono}}>
              <MapPin size={11}/><span>{s.city}, {s.state}</span>
              {s.established_year&&<span>· Est. {s.established_year}</span>}
            </div>
          </div>
        </div>
        {s.naac_grade&&<span style={{fontSize:10,fontWeight:700,padding:'3px 10px',borderRadius:2,background:C.greenLt,color:C.green,border:`1px solid ${C.green}40`,fontFamily:C.mono,flexShrink:0}}>NAAC {s.naac_grade}</span>}
      </div>
      <div className="grid grid-cols-3 gap-2" style={{marginBottom:14}}>
        {s.nirf_engineering_rank&&<Pill label="NIRF ENG" value={`#${s.nirf_engineering_rank}`} color={C.blue}/>}
        {s.avg_package_lpa&&<Pill label="AVG CTC" value={`₹${s.avg_package_lpa}`} color={C.amber}/>}
        {s.highest_package_lpa&&<Pill label="HIGHEST" value={`₹${s.highest_package_lpa}L`} color={C.green}/>}
        {s.total_faculty&&<Pill label="FACULTY" value={Number(s.total_faculty).toLocaleString()} color={C.purple}/>}
        {s.total_students&&<Pill label="STUDENTS" value={Number(s.total_students).toLocaleString()} color={C.teal}/>}
        {s.tuition_fee_per_sem&&<Pill label="FEE/SEM" value={`₹${(s.tuition_fee_per_sem/1000).toFixed(0)}K`} color={C.accent}/>}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2" style={{fontSize:10,color:C.ink4,fontFamily:C.mono}}>
          <MessageCircle size={10}/>{c.total_reddit_posts} posts · {c.total_insights} insights
        </div>
        <span style={{color:C.green,fontFamily:C.mono,fontSize:11,fontWeight:600}} className="group-hover:translate-x-1 transition-transform">Explore →</span>
      </div>
    </button>
  );
};

/* ── Detail with Tabs ──────────────────────────────────────────────────── */
const TABS = ['Overview','Placements','Research','Reddit Insights'] as const;
type Tab = typeof TABS[number];

const Detail: React.FC<{c:CampusData; oTheme:string|null; setOTheme:(t:string|null)=>void; oPost:string|null; setOPost:(p:string|null)=>void}> = ({c, oTheme, setOTheme, oPost, setOPost}) => {
  const [tab, setTab] = useState<Tab>('Overview');
  const s = c.stats||{};
  const initials = c.campus_name.split(/\s+/).slice(0,2).map(w=>w[0]).join('').toUpperCase();
  return (<div>
    {/* ── Dark ink header ───────────────── */}
    <div style={{background:C.ink,borderRadius:4,padding:'1.75rem 2rem',marginBottom:'1rem',position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',top:-40,right:-40,width:220,height:220,borderRadius:'50%',border:'1px solid rgba(245,242,236,0.06)'}}/>
      <div style={{position:'absolute',top:20,right:20,width:100,height:100,borderRadius:'50%',border:'1px solid rgba(245,242,236,0.04)'}}/>
      <div className="flex items-start justify-between flex-wrap gap-4" style={{position:'relative',zIndex:1}}>
        <div className="flex items-center gap-4">
          <div style={{width:48,height:48,borderRadius:4,background:'rgba(245,242,236,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:C.mono,fontSize:13,color:C.paper,fontWeight:600}}>{initials}</div>
          <div>
            <h1 style={{fontFamily:C.serif,fontSize:'clamp(1.5rem,4vw,2rem)',color:C.paper,lineHeight:1.2,marginBottom:6}}>{c.campus_name.replace(/^VIT\s*/i,'').length<c.campus_name.length?'VITEEE':c.campus_name}</h1>
            <div className="flex items-center flex-wrap gap-2" style={{fontFamily:C.mono,fontSize:11,color:'rgba(245,242,236,0.4)'}}>
              <span>{s.also_known_as||c.campus_name}</span>
              <span>·</span>
              <span>{s.city}, {s.state}</span>
              <span style={{fontSize:10,padding:'2px 8px',borderRadius:2,background:'rgba(200,82,42,0.2)',border:'1px solid rgba(200,82,42,0.35)',color:'#f0a070'}}>{c.total_reddit_posts.toLocaleString()} reddit posts analysed</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {s.naac_grade&&<span style={{fontSize:11,fontWeight:700,padding:'4px 12px',borderRadius:2,background:C.greenLt,color:C.green,border:`1px solid ${C.green}40`,fontFamily:C.mono}}>NAAC {s.naac_grade}{s.naac_cgpa?` ${s.naac_cgpa}`:''}</span>}
          {s.established_year&&<span style={{fontSize:11,padding:'4px 12px',borderRadius:2,background:'rgba(245,242,236,0.1)',color:'rgba(245,242,236,0.5)',fontFamily:C.mono}}>EST. {s.established_year}</span>}
        </div>
      </div>
    </div>

    {/* ── Stat strip ────────────────────── */}
    <div className="grid grid-cols-3 sm:grid-cols-6" style={{gap:1,background:C.paper3,marginBottom:'1.25rem'}}>
      {s.nirf_engineering_rank&&<Pill label="NIRF ENG" value={`#${s.nirf_engineering_rank}`} color={C.blue}/>}
      {s.nirf_overall_rank&&<Pill label="NIRF OVERALL" value={`#${s.nirf_overall_rank}`} color={C.blue}/>}
      {s.naac_grade&&<Pill label="NAAC" value={s.naac_grade} color={C.green}/>}
      {s.phd_seats&&<Pill label="PHD SEATS" value={Number(s.phd_seats).toLocaleString()} color={C.purple}/>}
      {s.avg_package_lpa&&<Pill label="AVG CTC" value={String(s.avg_package_lpa)} color={C.amber}/>}
      {s.avg_package_lpa&&<Pill label="LPA" value="↑" color={C.amber}/>}
    </div>

    {/* ── Underline tab bar ─────────────── */}
    <div className="flex" style={{borderBottom:`1px solid ${C.paper3}`,marginBottom:'1.25rem'}}>
      {TABS.map(t=>{
        const isReddit = t==='Reddit Insights';
        const active = tab===t;
        return <button key={t} onClick={()=>setTab(t)} style={{
          fontFamily:C.mono,fontSize:10,letterSpacing:'0.07em',textTransform:'uppercase',
          padding:'0.65rem 1.1rem',
          borderBottom:`2px solid ${active?(isReddit?C.accent:C.ink):'transparent'}`,
          color:active?(isReddit?C.accent:C.ink):C.ink4,
          background:'transparent',transition:'all 0.15s',
        }}>{t}</button>;
      })}
    </div>

    {tab==='Overview'&&<OverviewTab s={s}/>}
    {tab==='Placements'&&<PlacementsTab s={s}/>}
    {tab==='Research'&&<ResearchTab s={s}/>}
    {tab==='Reddit Insights'&&<RedditTab themes={c.reddit_insights||{}} oTheme={oTheme} setOTheme={setOTheme} oPost={oPost} setOPost={setOPost}/>}
  </div>);
};

/* ── Reusable primitives ──────────────────────────────────────────────── */
const SLabel: React.FC<{children:React.ReactNode}> = ({children}) => (
  <p style={{fontFamily:C.mono,fontSize:9,letterSpacing:'0.1em',textTransform:'uppercase',color:C.ink4,marginBottom:10,paddingBottom:8,borderBottom:`1px solid ${C.paper3}`}}>{children}</p>
);
const IRow: React.FC<{k:string; v:any; link?:boolean; last?:boolean}> = ({k,v,link,last}) => {
  if(v==null) return null;
  const txt = typeof v==='string'||typeof v==='number'?String(v):JSON.stringify(v);
  return <div className="flex items-baseline" style={{padding:'8px 0',...(!last?{borderBottom:`0.5px solid ${C.paper3}`}:{})}}>
    <span style={{width:160,flexShrink:0,fontSize:12,color:C.ink3}}>{k}</span>
    {link
      ?<a href={txt.startsWith('http')?txt:`https://${txt}`} target="_blank" rel="noopener noreferrer" style={{fontSize:13,color:C.blue,marginLeft:'auto',textDecoration:'none'}}>{txt.replace(/^https?:\/\//,'')} ↗</a>
      :<span style={{fontSize:13,color:C.ink2,marginLeft:'auto',textAlign:'right'}}>{txt}</span>}
  </div>;
};
const Section: React.FC<{title:string; children:React.ReactNode}> = ({title,children}) => (
  <div style={{marginBottom:28}}><SLabel>{title}</SLabel><div>{children}</div></div>
);

/* ── Tuition Fee Table ─────────────────────────────────────────────────── */
const FeeTable: React.FC<{group:any; color:string; colorLt:string}> = ({group,color,colorLt}) => {
  const cats: any[] = group.categories||[];
  return (
    <div style={{marginBottom:20}}>
      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
        <span style={{fontFamily:C.serif,fontSize:16,color}}>{group.label}</span>
        <span style={{fontSize:10,fontFamily:C.mono,color,padding:'2px 8px',borderRadius:2,background:colorLt}}>{(group.branches||[]).length} branches</span>
      </div>
      {/* Branch chips */}
      <div className="flex flex-wrap gap-1" style={{marginBottom:10}}>
        {(group.branches||[]).map((b:string,i:number)=>(
          <span key={i} style={{fontSize:9,fontFamily:C.mono,padding:'3px 8px',borderRadius:2,background:C.paper2,border:`1px solid ${C.paper3}`,color:C.ink3}}>{b}</span>
        ))}
      </div>
      {/* Table */}
      <div style={{borderRadius:4,overflow:'hidden',border:`1px solid ${C.paper3}`}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',background:C.ink,padding:'8px 14px'}}>
          {['Category','Total (₹)','Advance (₹)','Balance (₹)'].map(h=>(
            <span key={h} style={{fontSize:9,fontFamily:C.mono,color:C.paper,textTransform:'uppercase',letterSpacing:'0.07em'}}>{h}</span>
          ))}
        </div>
        {cats.map((c:any,i:number)=>(
          <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',padding:'10px 14px',background:i%2===0?C.paper:C.paper2,borderTop:`1px solid ${C.paper3}`}}>
            <span style={{fontSize:12,fontWeight:600,color}}>{`Cat ${c.cat}`}</span>
            <span style={{fontSize:13,fontFamily:C.serif,color:C.ink}}>₹{Number(c.total).toLocaleString('en-IN')}</span>
            <span style={{fontSize:12,color:C.ink3}}>₹{Number(c.advance).toLocaleString('en-IN')}</span>
            <span style={{fontSize:12,color:C.ink3}}>₹{Number(c.balance).toLocaleString('en-IN')}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const TuitionSection: React.FC<{tf:any; rcm:any; note?:string}> = ({tf,rcm,note}) => (
  <div style={{marginBottom:28}}>
    <SLabel>B.TECH FEE STRUCTURE (VITEEE 2026)</SLabel>
    {note&&<p style={{fontSize:11,color:C.amber,fontStyle:'italic',lineHeight:1.5,marginBottom:16}}>{note}</p>}
    {tf.group_a&&<FeeTable group={tf.group_a} color={C.blue} colorLt={C.blueLt}/>}
    {tf.group_b&&<FeeTable group={tf.group_b} color={C.accent} colorLt={C.accentLt}/>}
    {/* Rank → Category mapping */}
    {rcm&&Array.isArray(rcm)&&rcm.length>0&&<>
      <p style={{fontFamily:C.mono,fontSize:9,letterSpacing:'0.1em',textTransform:'uppercase',color:C.ink4,marginBottom:8,marginTop:16}}>VITEEE RANK → CATEGORY MAPPING</p>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {rcm.map((r:any,i:number)=>(
          <div key={i} style={{background:C.paper2,border:`1px solid ${C.paper3}`,borderRadius:4,padding:'10px 16px',minWidth:130,textAlign:'center',flexShrink:0}}>
            <p style={{fontFamily:C.mono,fontSize:10,color:C.ink4,marginBottom:4}}>{r.rank_range}</p>
            <p style={{fontFamily:C.serif,fontSize:20,color:C.amber}}>Cat {r.category}</p>
          </div>
        ))}
      </div>
    </>}
  </div>
);

/* ── Hostel Fee Section ───────────────────────────────────────────────── */
const HostelAccordion: React.FC<{label:string; color:string; rows:any[]; currency?:string}> = ({label,color,rows,currency='₹'}) => {
  const [open, setOpen] = useState(false);
  const grouped: Record<string,any[]> = {};
  rows.forEach(r => { const k=r.room_type; if(!grouped[k])grouped[k]=[]; grouped[k].push(r); });
  return (
    <div style={{borderLeft:`3px solid ${color}`,background:C.paper2,border:`1px solid ${C.paper3}`,borderLeftColor:color,borderLeftWidth:3,borderRadius:4,overflow:'hidden',marginBottom:8}}>
      <button onClick={()=>setOpen(!open)} style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 16px',background:'transparent',cursor:'pointer',border:'none'}}>
        <span style={{fontFamily:C.sans,fontSize:13,fontWeight:600,color:C.ink}}>{label}</span>
        <div className="flex items-center gap-2">
          <span style={{fontSize:10,fontFamily:C.mono,color,padding:'2px 8px',borderRadius:2,background:`${color}15`}}>{rows.length} options</span>
          {open?<ChevronUp size={14} style={{color:C.ink4}}/>:<ChevronDown size={14} style={{color:C.ink4}}/>}
        </div>
      </button>
      {open&&<div style={{borderTop:`1px solid ${C.paper3}`}}>
        <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr',padding:'8px 16px',background:C.ink}}>
          {['Room Type','Meal','Room+Mess','Adm Fee','Total'].map(h=>(
            <span key={h} style={{fontSize:8,fontFamily:C.mono,color:C.paper,textTransform:'uppercase',letterSpacing:'0.07em'}}>{h}</span>
          ))}
        </div>
        {rows.map((r:any,i:number)=>(
          <div key={i} style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr',padding:'8px 16px',background:i%2===0?C.paper:C.paper2,borderTop:`1px solid ${C.paper3}`}}>
            <span style={{fontSize:11,color:C.ink2}}>{r.room_type} {r.ac}</span>
            <span style={{fontSize:10,fontFamily:C.mono,color:r.meal_plan==='Veg'?C.green:r.meal_plan==='Non-Veg'?C.red:C.purple}}>{r.meal_plan}</span>
            <span style={{fontSize:11,color:C.ink3}}>{currency}{Number(r.room_mess).toLocaleString('en-IN')}</span>
            <span style={{fontSize:11,color:C.ink4}}>{currency}{Number(r.admission_fee).toLocaleString('en-IN')}</span>
            <span style={{fontSize:12,fontWeight:600,color:C.ink}}>{currency}{Number(r.total).toLocaleString('en-IN')}</span>
          </div>
        ))}
      </div>}
    </div>
  );
};

const HostelSection: React.FC<{hf:any; notes?:string[]}> = ({hf,notes}) => (
  <div style={{marginBottom:28}}>
    <SLabel>MEN'S HOSTEL FEE STRUCTURE (2025-26)</SLabel>
    {hf.indian&&<>
      <p style={{fontFamily:C.mono,fontSize:9,color:C.ink4,textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:8,marginTop:4}}>INDIAN CATEGORY</p>
      {hf.indian.regular&&<HostelAccordion label="Regular Blocks" color={C.blue} rows={hf.indian.regular}/>}
      {hf.indian.deluxe_mhs_mht&&<HostelAccordion label="Deluxe Blocks (MHS & MHT)" color={C.purple} rows={hf.indian.deluxe_mhs_mht}/>}
      {hf.indian.apartment_mhr&&<HostelAccordion label="Apartment Block (MHR)" color={C.teal} rows={hf.indian.apartment_mhr}/>}
    </>}
    {hf.nri&&<>
      <p style={{fontFamily:C.mono,fontSize:9,color:C.ink4,textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:8,marginTop:16}}>NRI & FOREIGN CATEGORY (USD)</p>
      {hf.nri.regular&&<HostelAccordion label="Regular Blocks" color={C.amber} rows={hf.nri.regular} currency="$"/>}
      {hf.nri.deluxe_mhs_mht&&<HostelAccordion label="Deluxe Blocks (MHS & MHT)" color={C.amber} rows={hf.nri.deluxe_mhs_mht} currency="$"/>}
      {hf.nri.apartment_mhr&&<HostelAccordion label="Apartment Block (MHR)" color={C.amber} rows={hf.nri.apartment_mhr} currency="$"/>}
    </>}
    {notes&&notes.length>0&&<div style={{marginTop:16,background:C.paper2,border:`1px solid ${C.paper3}`,borderRadius:4,padding:'12px 16px'}}>
      <p style={{fontFamily:C.mono,fontSize:9,color:C.ink4,textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:8}}>HOSTEL NOTES</p>
      {notes.map((n:string,i:number)=>(
        <p key={i} style={{fontSize:11,color:C.ink3,lineHeight:1.5,paddingLeft:12,borderLeft:`2px solid ${C.paper3}`,marginBottom:4}}>{n}</p>
      ))}
    </div>}
  </div>
);

/* ── NIRF Sub-components ───────────────────────────────────────────────── */
const fmtCr = (n:number) => `₹${(n/10000000).toFixed(1)} Cr`;
const fmtL  = (n:number) => `₹${(n/100000).toFixed(1)} L`;

const NirfStudentStrength: React.FC<{ss:any; total?:number; faculty?:number}> = ({ss,total,faculty}) => {
  const progs = [
    {key:'ug_4yr',label:'UG (4 Year)',color:C.blue},
    {key:'pg_2yr',label:'PG (2 Year)',color:C.purple},
    {key:'pg_integrated',label:'PG Integrated',color:C.teal},
  ];
  return (<div style={{marginBottom:28}}>
    <SLabel>NIRF 2025: STUDENT STRENGTH</SLabel>
    {/* Summary strip */}
    <div className="grid grid-cols-2 sm:grid-cols-4" style={{gap:1,background:C.paper3,marginBottom:12}}>
      {total&&<Pill label="TOTAL STUDENTS" value={Number(total).toLocaleString()} color={C.blue}/>}
      {faculty&&<Pill label="TOTAL FACULTY" value={Number(faculty).toLocaleString()} color={C.purple}/>}
      {total&&faculty&&<Pill label="STUDENT:FACULTY" value={`${(total/faculty).toFixed(0)}:1`} color={C.teal}/>}
      {ss.ug_4yr?.outside_country&&<Pill label="INTERNATIONAL" value={Number(ss.ug_4yr.outside_country+ss.pg_2yr?.outside_country+ss.pg_integrated?.outside_country).toLocaleString()} color={C.amber}/>}
    </div>
    {/* Per-programme breakdown */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {progs.map(p=>{const d=ss[p.key]; if(!d)return null; return(
        <div key={p.key} style={{background:C.paper2,border:`1px solid ${C.paper3}`,borderLeft:`3px solid ${p.color}`,borderRadius:4,padding:'14px 16px'}}>
          <p style={{fontFamily:C.mono,fontSize:9,textTransform:'uppercase',letterSpacing:'0.07em',color:p.color,marginBottom:8}}>{p.label}</p>
          <p style={{fontFamily:C.serif,fontSize:22,color:C.ink,marginBottom:8}}>{Number(d.total).toLocaleString()}</p>
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            <span style={{fontSize:9,fontFamily:C.mono,padding:'2px 6px',borderRadius:2,background:C.blueLt,color:C.blue}}>♂ {d.male?.toLocaleString()}</span>
            <span style={{fontSize:9,fontFamily:C.mono,padding:'2px 6px',borderRadius:2,background:C.accentLt,color:C.accent}}>♀ {d.female?.toLocaleString()}</span>
          </div>
          <div style={{marginTop:6,display:'flex',gap:6,flexWrap:'wrap'}}>
            {d.within_state&&<span style={{fontSize:9,fontFamily:C.mono,color:C.ink4}}>In-state: {d.within_state.toLocaleString()}</span>}
            {d.outside_state&&<span style={{fontSize:9,fontFamily:C.mono,color:C.ink4}}>Out-state: {d.outside_state.toLocaleString()}</span>}
          </div>
        </div>
      );})}
    </div>
  </div>);
};

const NirfIntake: React.FC<{si:any}> = ({si}) => {
  const progs = [{key:'ug_4yr',label:'UG (4 Year)',color:C.blue},{key:'pg_2yr',label:'PG (2 Year)',color:C.purple},{key:'pg_integrated',label:'PG Integrated',color:C.teal}];
  return (<div style={{marginBottom:28}}>
    <SLabel>NIRF 2025: SANCTIONED INTAKE</SLabel>
    <div style={{borderRadius:4,overflow:'hidden',border:`1px solid ${C.paper3}`}}>
      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr',background:C.ink,padding:'8px 14px'}}>
        {['Programme','2023-24','2022-23','2021-22','2020-21'].map(h=>(
          <span key={h} style={{fontSize:9,fontFamily:C.mono,color:C.paper,textTransform:'uppercase',letterSpacing:'0.07em'}}>{h}</span>
        ))}
      </div>
      {progs.map((p,i)=>{const d=si[p.key]; if(!d)return null; return(
        <div key={p.key} style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr',padding:'10px 14px',background:i%2===0?C.paper:C.paper2,borderTop:`1px solid ${C.paper3}`}}>
          <span style={{fontSize:12,fontWeight:600,color:p.color}}>{p.label}</span>
          {['2023-24','2022-23','2021-22','2020-21'].map(yr=>(
            <span key={yr} style={{fontSize:13,fontFamily:C.serif,color:d[yr]?C.ink:C.ink4}}>{d[yr]?Number(d[yr]).toLocaleString():'–'}</span>
          ))}
        </div>
      );})}
    </div>
  </div>);
};

const NirfPhd: React.FC<{phd:any}> = ({phd}) => (
  <div style={{marginBottom:28}}>
    <SLabel>NIRF 2025: Ph.D DETAILS</SLabel>
    <div className="grid grid-cols-2 sm:grid-cols-4" style={{gap:1,background:C.paper3,marginBottom:12}}>
      <Pill label="PURSUING (FULL)" value={Number(phd.pursuing_fulltime).toLocaleString()} color={C.blue}/>
      <Pill label="PURSUING (PART)" value={Number(phd.pursuing_parttime).toLocaleString()} color={C.purple}/>
      <Pill label="TOTAL PURSUING" value={Number(phd.pursuing_total).toLocaleString()} color={C.teal}/>
      {phd.graduated?.['2023-24']&&<Pill label="GRADUATED 23-24" value={String(phd.graduated['2023-24'].total)} color={C.green}/>}
    </div>
    {phd.graduated&&<div className="flex gap-3 overflow-x-auto">
      {Object.entries(phd.graduated).sort(([a],[b])=>b.localeCompare(a)).map(([yr,d]:any)=>(
        <div key={yr} style={{background:C.paper2,border:`1px solid ${C.paper3}`,borderLeft:`3px solid ${C.green}`,borderRadius:4,padding:'12px 18px',minWidth:140}}>
          <p style={{fontFamily:C.mono,fontSize:9,color:C.green,textTransform:'uppercase',marginBottom:6}}>{yr}</p>
          <p style={{fontFamily:C.serif,fontSize:22,color:C.ink}}>{d.total} graduated</p>
          <p style={{fontFamily:C.mono,fontSize:10,color:C.ink4,marginTop:4}}>Full: {d.fulltime} · Part: {d.parttime}</p>
        </div>
      ))}
    </div>}
  </div>
);

const NirfResearch: React.FC<{sr?:any; co?:any}> = ({sr,co}) => (
  <div style={{marginBottom:28}}>
    <SLabel>NIRF 2025: RESEARCH & CONSULTANCY</SLabel>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {sr&&Object.entries(sr).sort(([a],[b])=>b.localeCompare(a)).map(([yr,d]:any)=>(
        <div key={`sr-${yr}`} style={{background:C.paper2,border:`1px solid ${C.paper3}`,borderLeft:`3px solid ${C.blue}`,borderRadius:4,padding:'14px 18px'}}>
          <p style={{fontFamily:C.mono,fontSize:9,color:C.blue,textTransform:'uppercase',marginBottom:4}}>SPONSORED RESEARCH · {yr}</p>
          <p style={{fontFamily:C.serif,fontSize:22,color:C.ink,marginBottom:6}}>{fmtCr(d.amount_inr)}</p>
          <div className="flex gap-3" style={{fontSize:10,fontFamily:C.mono,color:C.ink3}}>
            <span>{d.projects} projects</span><span>{d.funding_agencies} agencies</span>
          </div>
        </div>
      ))}
      {co&&Object.entries(co).sort(([a],[b])=>b.localeCompare(a)).map(([yr,d]:any)=>(
        <div key={`co-${yr}`} style={{background:C.paper2,border:`1px solid ${C.paper3}`,borderLeft:`3px solid ${C.amber}`,borderRadius:4,padding:'14px 18px'}}>
          <p style={{fontFamily:C.mono,fontSize:9,color:C.amber,textTransform:'uppercase',marginBottom:4}}>CONSULTANCY · {yr}</p>
          <p style={{fontFamily:C.serif,fontSize:22,color:C.ink,marginBottom:6}}>{fmtL(d.amount_inr)}</p>
          <div className="flex gap-3" style={{fontSize:10,fontFamily:C.mono,color:C.ink3}}>
            <span>{d.projects} projects</span><span>{d.clients} clients</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const NirfFinance: React.FC<{cap?:any; op?:any}> = ({cap,op}) => {
  const items: {label:string; data:Record<string,number>; color:string}[] = [];
  if(cap){
    if(cap.library) items.push({label:'Library',data:cap.library,color:C.blue});
    if(cap.equipment_software) items.push({label:'Equipment & Software',data:cap.equipment_software,color:C.teal});
    if(cap.other_assets) items.push({label:'Other Capital Assets',data:cap.other_assets,color:C.purple});
  }
  if(op){
    if(op.salaries) items.push({label:'Salaries',data:op.salaries,color:C.green});
    if(op.maintenance) items.push({label:'Maintenance',data:op.maintenance,color:C.amber});
  }
  return (<div style={{marginBottom:28}}>
    <SLabel>NIRF 2025: FINANCIAL RESOURCES (INR)</SLabel>
    <div style={{borderRadius:4,overflow:'hidden',border:`1px solid ${C.paper3}`}}>
      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr',background:C.ink,padding:'8px 14px'}}>
        {['Head','2023-24','2022-23'].map(h=>(
          <span key={h} style={{fontSize:9,fontFamily:C.mono,color:C.paper,textTransform:'uppercase',letterSpacing:'0.07em'}}>{h}</span>
        ))}
      </div>
      {items.map((it,i)=>(
        <div key={i} style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr',padding:'10px 14px',background:i%2===0?C.paper:C.paper2,borderTop:`1px solid ${C.paper3}`}}>
          <span style={{fontSize:12,fontWeight:500,color:it.color}}>{it.label}</span>
          <span style={{fontSize:12,fontFamily:C.serif,color:C.ink}}>{fmtCr(it.data['2023-24']||0)}</span>
          <span style={{fontSize:12,color:C.ink3}}>{fmtCr(it.data['2022-23']||0)}</span>
        </div>
      ))}
    </div>
  </div>);
};

/* ── Overview Tab ──────────────────────────────────────────────────────── */
const OverviewTab: React.FC<{s:Record<string,any>}> = ({s}) => {
  // parse programme arrays
  const parseArr = (raw:any):any[] => { if(!raw)return[]; if(Array.isArray(raw))return raw; if(typeof raw==='string'){try{return JSON.parse(raw)}catch{return[]}} return[]; };
  const ug = parseArr(s.ug_programmes);
  const pg = parseArr(s.pg_programmes);
  // parse NIRF histories
  const parseHist = (raw:any):Record<string,number> => { if(!raw)return{}; if(typeof raw==='string'){try{return JSON.parse(raw)}catch{return{}}} if(typeof raw==='object'&&!Array.isArray(raw))return raw; return{}; };
  const nirfEng = parseHist(s.nirf_engineering_rank_history);
  const nirfOvr = parseHist(s.nirf_overall_rank_history);

  return (<div>
    {/* Location & Access */}
    <Section title="LOCATION & ACCESS">
      <IRow k="City" v={s.city&&s.state?`${s.city}, ${s.state}`:s.city}/>
      <IRow k="Address" v={s.address}/>
      <IRow k="Nearest Airport" v={s.nearest_airport?(s.nearest_airport_km?`${s.nearest_airport} (${s.nearest_airport_km} km)`:s.nearest_airport):null}/>
      <IRow k="Nearest Railway" v={s.nearest_railway_station?(s.nearest_railway_km?`${s.nearest_railway_station} · ${s.nearest_railway_km} km`:s.nearest_railway_station):null}/>
      <IRow k="Official Website" v={s.official_website} link last/>
    </Section>

    {/* Map stub */}
    <div style={{background:C.paper2,border:`1px solid ${C.paper3}`,borderRadius:4,height:100,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',marginBottom:28}}>
      <div style={{width:8,height:8,borderRadius:'50%',background:C.accent,marginBottom:6}}/>
      <span style={{fontFamily:C.mono,fontSize:10,color:C.ink4}}>{s.city}, {s.state}{s.latitude?` · ${s.latitude}° N, ${s.longitude}° E`:''}</span>
    </div>

    {/* Fee Structure — detailed tuition tables */}
    {s.tuition_fee_structure?<TuitionSection tf={s.tuition_fee_structure} rcm={s.rank_category_mapping} note={s.fee_note}/>
    :(s.annual_fees||s.tuition_fee_per_sem)&&<Section title="FEE STRUCTURE">
      <div style={{background:C.amberLt,border:`1px solid ${C.amber}`,borderRadius:4,padding:'1rem 1.25rem',display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:12,marginBottom:12}}>
        <div>
          <p style={{fontFamily:C.mono,fontSize:9,letterSpacing:'0.1em',textTransform:'uppercase',color:C.amber,marginBottom:4}}>ANNUAL TUITION</p>
          <p style={{fontFamily:C.serif,fontSize:26,color:C.amber}}>₹{(s.annual_fees||s.tuition_fee_per_sem*2||0).toLocaleString()}</p>
        </div>
        {s.fee_note&&<p style={{fontSize:11,color:C.amber,opacity:0.8,maxWidth:340,lineHeight:1.5}}>{s.fee_note}</p>}
      </div>
    </Section>}

    {/* Waivers */}
    {s.fee_waivers&&Array.isArray(s.fee_waivers)&&s.fee_waivers.length>0&&<Section title="WAIVERS">
      <div className="flex flex-wrap gap-2">
        {s.fee_waivers.map((w:any,i:number)=>(
          <span key={i} style={{fontSize:11,padding:'5px 12px',borderRadius:2,background:C.greenLt,color:C.green,border:`1px solid ${C.green}`,fontFamily:C.mono}}>{typeof w==='string'?w:w.name||w.description||JSON.stringify(w)}</span>
        ))}
      </div>
    </Section>}

    {/* Hostel Fee Structure */}
    {s.hostel_fee_structure&&<HostelSection hf={s.hostel_fee_structure} notes={s.hostel_notes}/>}

    {/* Courses Offered (UG/PG cards) */}
    {(ug.length>0||pg.length>0)&&<Section title="COURSES OFFERED">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" style={{marginBottom:12}}>
        {ug.map((p:any,i:number)=>(
          <div key={`ug-${i}`} style={{borderLeft:`3px solid ${C.blue}`,background:C.paper2,border:`1px solid ${C.paper3}`,borderLeftColor:C.blue,borderLeftWidth:3,borderRadius:4,padding:'12px 16px',position:'relative'}}>
            <p style={{fontFamily:C.mono,fontSize:9,letterSpacing:'0.07em',textTransform:'uppercase',color:C.ink4,marginBottom:4}}>UG PROGRAMME</p>
            <span style={{position:'absolute',top:10,right:12,fontSize:9,fontFamily:C.mono,padding:'2px 8px',borderRadius:2,background:C.blueLt,color:C.blue}}>Undergraduate</span>
            <p style={{fontSize:15,fontWeight:500,color:C.ink,fontFamily:C.serif,marginBottom:4}}>{p.name||p}</p>
            <p style={{fontFamily:C.mono,fontSize:10,color:C.ink4}}>
              {[p.duration_years&&`${p.duration_years} years`,p.intake_seats&&`${Number(p.intake_seats).toLocaleString()} seats`,p.eligibility].filter(Boolean).join(' · ')}
            </p>
          </div>
        ))}
        {pg.map((p:any,i:number)=>(
          <div key={`pg-${i}`} style={{borderLeft:`3px solid ${C.accent}`,background:C.paper2,border:`1px solid ${C.paper3}`,borderLeftColor:C.accent,borderLeftWidth:3,borderRadius:4,padding:'12px 16px',position:'relative'}}>
            <p style={{fontFamily:C.mono,fontSize:9,letterSpacing:'0.07em',textTransform:'uppercase',color:C.ink4,marginBottom:4}}>PG PROGRAMME</p>
            <span style={{position:'absolute',top:10,right:12,fontSize:9,fontFamily:C.mono,padding:'2px 8px',borderRadius:2,background:C.accentLt,color:C.accent}}>Postgraduate</span>
            <p style={{fontSize:15,fontWeight:500,color:C.ink,fontFamily:C.serif,marginBottom:4}}>{p.name||p}</p>
            <p style={{fontFamily:C.mono,fontSize:10,color:C.ink4}}>
              {[p.duration_years&&`${p.duration_years} years`,p.intake_seats&&`${Number(p.intake_seats).toLocaleString()} seats`,p.eligibility].filter(Boolean).join(' · ')}
            </p>
          </div>
        ))}
      </div>
      {/* PhD row */}
      {s.phd_available&&<div style={{background:C.paper2,border:`1px solid ${C.paper3}`,borderRadius:4,padding:'0.75rem 1rem',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <span style={{fontSize:12,color:C.ink2}}>PhD programme available{s.phd_seats?`, ${Number(s.phd_seats).toLocaleString()} seats across disciplines`:''}</span>
        <span style={{fontSize:10,fontFamily:C.mono,padding:'3px 10px',borderRadius:2,background:C.greenLt,color:C.green,border:`1px solid ${C.green}`}}>PhD Available</span>
      </div>}
    </Section>}

    {/* NIRF Rank History */}
    {(Object.keys(nirfEng).length>0||Object.keys(nirfOvr).length>0)&&<Section title="NIRF RANK HISTORY">
      <div className="flex gap-3 overflow-x-auto pb-2">
        {Object.entries(nirfEng).sort(([a],[b])=>Number(b)-Number(a)).map(([yr,rank])=>(
          <div key={`eng-${yr}`} style={{background:C.paper2,border:`1px solid ${C.paper3}`,borderLeft:`3px solid ${C.blue}`,borderRadius:4,padding:'14px 20px',minWidth:120,textAlign:'center'}}>
            <p style={{fontFamily:C.mono,fontSize:9,textTransform:'uppercase',letterSpacing:'0.07em',color:C.blue,marginBottom:8}}>{yr} · ENGINEERING</p>
            <p style={{fontFamily:C.serif,fontSize:28,color:C.blue,lineHeight:1}}>#{rank}</p>
            <p style={{fontFamily:C.mono,fontSize:9,color:C.ink4,marginTop:4}}>Engineering</p>
          </div>
        ))}
        {Object.entries(nirfOvr).sort(([a],[b])=>Number(b)-Number(a)).map(([yr,rank])=>(
          <div key={`ovr-${yr}`} style={{background:C.paper2,border:`1px solid ${C.paper3}`,borderLeft:`3px solid ${C.teal}`,borderRadius:4,padding:'14px 20px',minWidth:120,textAlign:'center'}}>
            <p style={{fontFamily:C.mono,fontSize:9,textTransform:'uppercase',letterSpacing:'0.07em',color:C.teal,marginBottom:8}}>{yr} · OVERALL</p>
            <p style={{fontFamily:C.serif,fontSize:28,color:C.teal,lineHeight:1}}>#{rank}</p>
            <p style={{fontFamily:C.mono,fontSize:9,color:C.ink4,marginTop:4}}>Overall</p>
          </div>
        ))}
      </div>
    </Section>}

    {/* NIRF 2025 — Student Strength */}
    {s.student_strength&&<NirfStudentStrength ss={s.student_strength} total={s.total_students} faculty={s.total_faculty}/>}

    {/* NIRF 2025 — Sanctioned Intake */}
    {s.sanctioned_intake&&<NirfIntake si={s.sanctioned_intake}/>}

    {/* NIRF 2025 — PhD Details */}
    {s.phd_details&&<NirfPhd phd={s.phd_details}/>}

    {/* NIRF 2025 — Research Funding */}
    {(s.sponsored_research||s.consultancy)&&<NirfResearch sr={s.sponsored_research} co={s.consultancy}/>}

    {/* NIRF 2025 — Financial Resources */}
    {(s.financial_capital_expenditure||s.financial_operational_expenditure)&&<NirfFinance cap={s.financial_capital_expenditure} op={s.financial_operational_expenditure}/>}
  </div>);
};

/* ── Placements Tab ───────────────────────────────────────────────────── */
const PlacementsTab: React.FC<{s:Record<string,any>}> = ({s}) => (
  <div>
    {/* Hero stats */}
    <div className="grid grid-cols-2 sm:grid-cols-4" style={{gap:1,background:C.paper3,marginBottom:4}}>
      {s.avg_package_lpa&&<Pill label="AVG PACKAGE" value={`₹${s.avg_package_lpa}`} color={C.amber}/>}
      {s.median_package_lpa&&<Pill label="MEDIAN" value={`₹${s.median_package_lpa}`} color={C.amber}/>}
      {s.highest_package_lpa&&<Pill label="HIGHEST" value={`₹${s.highest_package_lpa}L`} color={C.green}/>}
      {s.total_offers&&<Pill label="TOTAL OFFERS" value={Number(s.total_offers).toLocaleString()} color={C.green}/>}
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-4" style={{gap:1,background:C.paper3,marginBottom:16}}>
      {s.total_offers&&<Pill label="TOTAL OFFERS" value={Number(s.total_offers).toLocaleString()} color={C.blue}/>}
      {s.companies_visited&&<Pill label="COMPANIES" value={String(s.companies_visited)} color={C.blue}/>}
      {s.students_placed&&<Pill label="STUDENTS PLACED" value={Number(s.students_placed).toLocaleString()} color={C.teal}/>}
      {s.marquee_offers&&<Pill label="MARQUEE (≥20L)" value={String(s.marquee_offers)} color={C.purple}/>}
      {s.super_dream_offers&&<Pill label="SUPER DREAM" value={Number(s.super_dream_offers).toLocaleString()} color={C.purple}/>}
      {s.dream_offers&&<Pill label="DREAM (≥6L)" value={Number(s.dream_offers).toLocaleString()} color={C.teal}/>}
    </div>
    {s.placement_year&&<p style={{color:C.ink4,fontFamily:C.mono,fontSize:10,marginBottom:4}}>Data from {s.placement_year} batch</p>}
    {s.placement_note&&<p style={{color:C.ink3,fontSize:12,fontStyle:'italic',lineHeight:1.6,marginBottom:24}}>{s.placement_note}</p>}

    {/* Top Recruiters */}
    {s.top_recruiters&&<Section title="TOP RECRUITERS">
      <div className="flex flex-wrap gap-2" style={{paddingTop:4}}>
        {(Array.isArray(s.top_recruiters)?s.top_recruiters:[s.top_recruiters]).map((r:string,i:number)=>
          <span key={i} style={{fontSize:11,padding:'5px 12px',borderRadius:2,background:C.paper,border:`1px solid ${C.paper3}`,color:C.ink2,fontFamily:C.mono}}>{r}</span>
        )}
      </div>
    </Section>}

    {/* Year-wise trends */}
    {s.year_wise_placements&&<Section title="YEAR-WISE PLACEMENT TRENDS">
      <div className="flex gap-3 overflow-x-auto pb-2">
        {(Array.isArray(s.year_wise_placements)?s.year_wise_placements:[]).map((yw:any,i:number)=>(
          <div key={i} style={{background:C.paper2,border:`1px solid ${C.paper3}`,borderRadius:4,padding:'14px 18px',minWidth:150,flexShrink:0}}>
            <p style={{fontFamily:C.serif,fontSize:18,color:C.ink,marginBottom:6}}>{yw.year||yw.batch||`Year ${i+1}`}</p>
            <div style={{display:'flex',flexDirection:'column',gap:3}}>
              {yw.highest_package&&<span style={{fontSize:10,color:C.ink3,fontFamily:C.mono}}>Highest: {yw.highest_package}</span>}
              {yw.avg_package&&<span style={{fontSize:10,color:C.ink3,fontFamily:C.mono}}>Avg: ₹{yw.avg_package} LPA</span>}
              {yw.total_offers&&<span style={{fontSize:10,color:C.ink3,fontFamily:C.mono}}>{Number(yw.total_offers).toLocaleString()} offers</span>}
              {yw.students_placed&&<span style={{fontSize:10,color:C.ink3,fontFamily:C.mono}}>{Number(yw.students_placed).toLocaleString()} placed</span>}
              {yw.companies&&<span style={{fontSize:10,color:C.ink3,fontFamily:C.mono}}>{yw.companies} companies</span>}
              {yw.super_dream&&<span style={{fontSize:10,color:C.green,fontFamily:C.mono}}>{Number(yw.super_dream).toLocaleString()} super dream</span>}
            </div>
          </div>
        ))}
      </div>
    </Section>}

    {s.placement_officer&&<Section title="PLACEMENT CONTACT">
      <IRow k="Officer" v={typeof s.placement_officer==='string'?s.placement_officer:s.placement_officer.name||JSON.stringify(s.placement_officer)}/>
    </Section>}

    {/* Source links */}
    {s.placement_sources&&<Section title="DATA SOURCES">
      <div style={{display:'flex',flexDirection:'column',gap:4}}>
        {(s.placement_sources as any[]).map((src:any,i:number)=>(
          <a key={i} href={src.url} target="_blank" rel="noopener noreferrer" style={{color:C.blue,fontSize:11,fontFamily:C.mono,textDecoration:'none',display:'flex',alignItems:'center',gap:6,padding:'6px 0'}}>
            <ExternalLink size={10}/> {src.label} ↗
          </a>
        ))}
      </div>
    </Section>}

    {!s.avg_package_lpa&&!s.top_recruiters&&<p style={{color:C.ink4,fontFamily:C.mono,fontSize:12,textAlign:'center',padding:'2rem 0'}}>Detailed placement data not yet available for this campus.</p>}
  </div>
);

/* ── Research Tab ─────────────────────────────────────────────────────── */
const ResearchTab: React.FC<{s:Record<string,any>}> = ({s}) => {
  const r = s.research;
  if(!r) return <p style={{color:C.ink4,fontFamily:C.mono,fontSize:12,textAlign:'center',padding:'2rem 0'}}>Research data not available for this campus yet.</p>;
  if(typeof r==='string') return <div style={{color:C.ink2,fontSize:13,lineHeight:1.7}}>{r}</div>;
  return (<div>
    {s.nirf_research_rank&&<div style={{marginBottom:24}}><Pill label="NIRF RESEARCH" value={`#${s.nirf_research_rank}`}/></div>}
    <Section title="RESEARCH OVERVIEW">
      {Object.entries(r).map(([key,val])=>{
        if(typeof val==='object'&&val!==null&&!Array.isArray(val)){
          return Object.entries(val as Record<string,any>).map(([k2,v2])=>
            <IRow key={`${key}-${k2}`} k={k2.replace(/_/g,' ').replace(/\b\w/g,l=>l.toUpperCase())} v={v2}/>
          );
        }
        return <IRow key={key} k={key.replace(/_/g,' ').replace(/\b\w/g,l=>l.toUpperCase())} v={val}/>;
      })}
    </Section>
  </div>);
};

/* ── Reddit Tab ──────────────────────────────────────────────────────── */
const RedditTab: React.FC<{themes:Record<string,any[]>; oTheme:string|null; setOTheme:(t:string|null)=>void; oPost:string|null; setOPost:(p:string|null)=>void}> = ({themes, oTheme, setOTheme, oPost, setOPost}) => (
  <div style={{display:'flex',flexDirection:'column',gap:8}}>
    {Object.entries(themes).filter(([,p])=>(p as any[]).length>0).map(([theme, posts])=>{
      const m = TH[theme]||{label:theme,emoji:'💬',bg:C.paper2,fg:C.ink3,border:C.paper3};
      const open = oTheme===theme;
      return (<div key={theme} style={{background:C.paper2,borderRadius:4,overflow:'hidden',borderLeft:`3px solid ${m.border}`,border:`1px solid ${C.paper3}`,borderLeftWidth:3,borderLeftColor:m.border}}>
        {/* Accordion header with theme color accent */}
        <button onClick={()=>setOTheme(open?null:theme)} style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 18px',background:'transparent',cursor:'pointer',border:'none'}} className="hover:opacity-90 transition-colors">
          <div className="flex items-center gap-3">
            <span style={{fontSize:16}}>{m.emoji}</span>
            <span style={{color:C.ink,fontFamily:C.sans,fontSize:14,fontWeight:600}}>{m.label}</span>
            <span style={{fontSize:10,fontFamily:C.mono,color:m.fg,padding:'2px 8px',borderRadius:2,background:m.bg,fontWeight:600}}>{(posts as any[]).length}</span>
          </div>
          {open?<ChevronUp size={14} style={{color:m.fg}}/>:<ChevronDown size={14} style={{color:C.ink4}}/>}
        </button>
        {open&&<div style={{borderTop:`1px solid ${C.paper3}`,padding:'12px 18px 18px',display:'flex',flexDirection:'column',gap:10}}>
          {(posts as any[]).slice(0,15).map((post:any,i:number)=>{
            const pk=`${theme}-${i}`;
            const ex=oPost===pk;
            return (<div key={pk} style={{background:C.paper,border:`1px solid ${C.paper3}`,borderRadius:4,overflow:'hidden'}}>
              <button onClick={()=>setOPost(ex?null:pk)} style={{width:'100%',textAlign:'left',padding:12,background:'transparent',cursor:'pointer',border:'none'}} className="hover:opacity-90 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <p style={{color:C.ink2,fontSize:13,fontWeight:500,lineHeight:1.4,flex:1}}>{post.title}</p>
                  <span style={{fontSize:9,fontWeight:700,padding:'2px 8px',borderRadius:2,background:m.bg,color:m.fg,flexShrink:0,fontFamily:C.mono}}>▲ {post.score}</span>
                </div>
                <div className="flex items-center gap-3" style={{marginTop:6,fontSize:10,color:C.ink4,fontFamily:C.mono}}>
                  <span>r/{post.subreddit}</span><span>{post.date}</span>
                  {post.comments?.length>0&&<span>{post.comments.length} comments</span>}
                </div>
              </button>
              {ex&&<div style={{borderTop:`1px solid ${C.paper3}`,padding:12,display:'flex',flexDirection:'column',gap:10}}>
                {post.body&&<p style={{color:C.ink3,fontSize:12,lineHeight:1.6}}>{post.body}</p>}
                {post.url&&<a href={post.url} target="_blank" rel="noopener noreferrer" style={{color:m.fg,fontSize:11,fontFamily:C.mono,textDecoration:'none',display:'inline-flex',alignItems:'center',gap:4}}>
                  <ExternalLink size={10}/>View on Reddit ↗
                </a>}
                {post.comments?.length>0&&<div style={{display:'flex',flexDirection:'column',gap:8,marginTop:4}}>
                  <p style={{color:m.fg,fontFamily:C.mono,fontSize:9,textTransform:'uppercase',letterSpacing:'0.1em',fontWeight:600}}>Top Comments</p>
                  {post.comments.map((cm:any,ci:number)=>(<div key={ci} style={{paddingLeft:12,borderLeft:`2px solid ${m.border}`}}>
                    <p style={{color:C.ink3,fontSize:12,lineHeight:1.5}}>{cm.text}</p>
                    <span style={{color:m.fg,fontSize:10,fontFamily:C.mono,marginTop:2,display:'inline-block'}}>▲ {cm.score}</span>
                  </div>))}
                </div>}
              </div>}
            </div>);
          })}
        </div>}
      </div>);
    })}
  </div>
);

export default VITEEEPortal;
