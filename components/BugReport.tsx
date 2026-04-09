import React, { useState } from 'react';
import { X } from 'lucide-react';
import { track } from '../lib/analytics';

const V = {
  ink:'#0e0e0e', paper:'#f5f2ec', paper2:'#edeae3', paper3:'#e3dfd7',
  ink3:'#6b6b6b', ink4:'#a8a8a8', green:'#2A6B4A', greenLt:'#d5ece1',
  mono:"'DM Mono',monospace", sans:"'Instrument Sans',sans-serif",
};

const BugReport: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [desc, setDesc] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = () => {
    if (desc.length < 20) return;
    const meta = [
      `URL: ${window.location.href}`,
      `User-Agent: ${navigator.userAgent}`,
      `Timestamp: ${new Date().toISOString()}`,
      `Screen: ${screen.width}x${screen.height}`,
    ].join('\n');
    const userId = (() => { try { const u = JSON.parse(localStorage.getItem('oviguide_user')||'{}'); return u.id || 'anonymous'; } catch { return 'anonymous'; } })();
    const body = `Bug Description:\n${desc}\n\n--- Auto-captured ---\nUser ID: ${userId}\n${meta}`;
    window.location.href = `mailto:team@oviqo.in?subject=${encodeURIComponent('[OviGuide Bug Report]')}&body=${encodeURIComponent(body)}`;
    track('bug_report_submitted', { desc_length: desc.length });
    setSent(true);
    setTimeout(() => { setOpen(false); setSent(false); setDesc(''); }, 2000);
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button onClick={() => setOpen(true)} style={{
          position:'fixed', bottom:20, right:20, zIndex:9999,
          background:V.ink, color:V.paper, border:'none', borderRadius:4,
          padding:'8px 16px', fontFamily:V.mono, fontSize:11, fontWeight:600,
          cursor:'pointer', letterSpacing:'0.03em', boxShadow:'0 2px 10px rgba(0,0,0,0.15)',
        }}>
          Bug?
        </button>
      )}

      {/* Modal */}
      {open && (
        <div style={{
          position:'fixed', bottom:20, right:20, zIndex:9999,
          width:340, background:V.paper, border:`1px solid ${V.paper3}`,
          borderRadius:4, boxShadow:'0 8px 32px rgba(0,0,0,0.12)',
          padding:'18px 20px',
        }}>
          <div className="flex items-center justify-between" style={{marginBottom:14}}>
            <span style={{fontFamily:V.mono,fontSize:10,letterSpacing:'0.1em',textTransform:'uppercase',color:V.ink4}}>Report a Bug</span>
            <button onClick={()=>{setOpen(false);setSent(false)}} style={{background:'none',border:'none',cursor:'pointer',color:V.ink4}}><X size={14}/></button>
          </div>

          {sent ? (
            <div style={{background:V.greenLt,borderRadius:4,padding:'16px',textAlign:'center'}}>
              <p style={{fontSize:13,color:V.green,fontWeight:600}}>Thanks! Bug report sent.</p>
            </div>
          ) : (
            <>
              <textarea
                value={desc}
                onChange={e => setDesc(e.target.value)}
                placeholder="Describe what went wrong... (min 20 chars)"
                rows={4}
                style={{
                  width:'100%', padding:'10px 12px', fontSize:12, fontFamily:V.sans,
                  background:V.paper2, border:`1px solid ${V.paper3}`, borderRadius:4,
                  color:V.ink, outline:'none', resize:'vertical', marginBottom:10,
                }}
              />
              <div className="flex items-center justify-between">
                <span style={{fontSize:10,fontFamily:V.mono,color:V.ink4}}>{desc.length}/20 min</span>
                <button
                  onClick={handleSubmit}
                  disabled={desc.length < 20}
                  style={{
                    background: desc.length >= 20 ? V.ink : V.paper3,
                    color: desc.length >= 20 ? V.paper : V.ink4,
                    border:'none', borderRadius:4, padding:'8px 18px',
                    fontFamily:V.mono, fontSize:11, fontWeight:600,
                    cursor: desc.length >= 20 ? 'pointer' : 'not-allowed',
                  }}
                >
                  Send
                </button>
              </div>
              <p style={{fontSize:9,fontFamily:V.mono,color:V.ink4,marginTop:8}}>
                Auto-includes: page URL, browser info, timestamp. No personal data.
              </p>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default BugReport;
