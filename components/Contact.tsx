import React, { useState } from 'react';
import { ArrowLeft, Mail, Send } from 'lucide-react';
import { track } from '../lib/analytics';

const V = {
  ink:'#0e0e0e', ink2:'#3a3a3a', ink3:'#6b6b6b', ink4:'#a8a8a8',
  paper:'#f5f2ec', paper2:'#edeae3', paper3:'#e3dfd7',
  green:'#2A6B4A', greenLt:'#d5ece1',
  accent:'#c8522a',
  serif:"'DM Serif Display',Georgia,serif",
  mono:"'DM Mono',monospace",
  sans:"'Instrument Sans',sans-serif",
};

const SUBJECTS = ['General Inquiry','Bug Report','Data Deletion Request','Partnership'] as const;

const inputStyle: React.CSSProperties = {
  width:'100%', padding:'10px 14px', fontSize:13, fontFamily:V.sans,
  background:V.paper2, border:`1px solid ${V.paper3}`, borderRadius:4,
  color:V.ink, outline:'none',
};

const Contact: React.FC<{onBack:()=>void}> = ({onBack}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState<string>(SUBJECTS[0]);
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const sessionKey = 'oviguide_contact_count';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const count = Number(sessionStorage.getItem(sessionKey) || '0');
    if (count >= 3) { alert('You\'ve sent 3 messages this session. Please try again later.'); return; }
    sessionStorage.setItem(sessionKey, String(count + 1));
    const body = `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`;
    window.location.href = `mailto:team@oviqo.in?subject=${encodeURIComponent(`[OviGuide] ${subject}`)}&body=${encodeURIComponent(body)}`;
    track('contact_form_submitted', { subject });
    setSent(true);
  };

  return (
    <div style={{background:V.paper,fontFamily:V.sans,minHeight:'100vh'}} className="px-4 sm:px-8 py-12">
      <div className="max-w-2xl mx-auto">
        <button onClick={onBack} style={{fontFamily:V.mono,fontSize:10,color:V.ink4,letterSpacing:'0.07em',textTransform:'uppercase',marginBottom:32,background:'none',border:'none',cursor:'pointer'}} className="flex items-center gap-2 hover:opacity-70">
          <ArrowLeft size={12}/>BACK
        </button>

        <h1 style={{fontFamily:V.serif,fontSize:'clamp(2rem,5vw,2.75rem)',color:V.ink,lineHeight:1.1,marginBottom:8}}>Get in Touch</h1>
        <p style={{fontSize:14,color:V.ink3,marginBottom:32,lineHeight:1.6}}>Have a question, found a bug, or want to request data deletion? Reach out. We typically respond within 24 hours.</p>

        {/* Email card */}
        <div style={{background:V.paper2,border:`1px solid ${V.paper3}`,borderRadius:4,padding:'16px 20px',marginBottom:32}} className="flex items-center gap-3">
          <Mail size={18} style={{color:V.accent,flexShrink:0}}/>
          <div>
            <p style={{fontFamily:V.mono,fontSize:13,color:V.ink}}>team@oviqo.in</p>
            <p style={{fontSize:11,color:V.ink4}}>For all support, privacy, and partnership inquiries</p>
          </div>
        </div>

        {sent ? (
          <div style={{background:V.greenLt,border:`1px solid ${V.green}`,borderRadius:4,padding:'2rem',textAlign:'center'}}>
            <p style={{fontFamily:V.serif,fontSize:20,color:V.green,marginBottom:8}}>Message sent!</p>
            <p style={{fontSize:13,color:V.ink3}}>Your email client should have opened. If not, please email us directly at <strong>team@oviqo.in</strong>.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:16}}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label style={{fontFamily:V.mono,fontSize:9,color:V.ink4,textTransform:'uppercase',letterSpacing:'0.07em',display:'block',marginBottom:6}}>Name</label>
                <input value={name} onChange={e=>setName(e.target.value)} required style={inputStyle} placeholder="Your name"/>
              </div>
              <div>
                <label style={{fontFamily:V.mono,fontSize:9,color:V.ink4,textTransform:'uppercase',letterSpacing:'0.07em',display:'block',marginBottom:6}}>Email</label>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required style={inputStyle} placeholder="you@example.com"/>
              </div>
            </div>
            <div>
              <label style={{fontFamily:V.mono,fontSize:9,color:V.ink4,textTransform:'uppercase',letterSpacing:'0.07em',display:'block',marginBottom:6}}>Subject</label>
              <select value={subject} onChange={e=>setSubject(e.target.value)} style={{...inputStyle,cursor:'pointer'}}>
                {SUBJECTS.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{fontFamily:V.mono,fontSize:9,color:V.ink4,textTransform:'uppercase',letterSpacing:'0.07em',display:'block',marginBottom:6}}>Message</label>
              <textarea value={message} onChange={e=>setMessage(e.target.value)} required minLength={20} rows={6} style={{...inputStyle,resize:'vertical'}} placeholder="Describe your inquiry in detail..."/>
            </div>
            <button type="submit" style={{
              background:V.ink, color:V.paper, border:'none', borderRadius:4,
              padding:'12px 24px', fontFamily:V.mono, fontSize:12, fontWeight:600,
              letterSpacing:'0.05em', cursor:'pointer', display:'flex', alignItems:'center',
              gap:8, alignSelf:'flex-end',
            }}>
              <Send size={13}/>Send Message
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Contact;
