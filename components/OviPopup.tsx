import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from 'firebase/auth';
import { firebaseAuth } from '../lib/firebase';

type Screen = 'main' | 'otp' | 'success';

interface Props {
  onClose: () => void;
  onVerified?: (phone: string) => void;
}

const OviPopup: React.FC<Props> = ({ onClose, onVerified }) => {
  const [screen,     setScreen]     = useState<Screen>('main');
  const [phone,      setPhone]      = useState('');
  const [otp,        setOtp]        = useState(['','','','','','']);
  const [sending,    setSending]    = useState(false);
  const [verifying,  setVerifying]  = useState(false);
  const [otpError,   setOtpError]   = useState('');
  const [sendError,  setSendError]  = useState('');
  const boxRefs        = useRef<(HTMLInputElement|null)[]>([]);
  const confirmRef     = useRef<ConfirmationResult | null>(null);
  const recaptchaRef   = useRef<RecaptchaVerifier | null>(null);

  // Inject keyframe animations + lock body scroll
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'ovi-popup-keyframes';
    style.textContent = `
      @keyframes oviSlideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
      @keyframes oviFadeIn  { from { opacity:0; } to { opacity:1; } }
    `;
    document.head.appendChild(style);
    document.body.style.overflow = 'hidden';
    return () => {
      document.head.removeChild(style);
      document.body.style.overflow = '';
    };
  }, []);

  const sendOtp = async () => {
    setSendError('');
    setSending(true);
    try {
      // Create invisible reCAPTCHA (destroy previous if re-sending)
      if (recaptchaRef.current) {
        recaptchaRef.current.clear();
        recaptchaRef.current = null;
      }
      recaptchaRef.current = new RecaptchaVerifier(firebaseAuth, 'ovi-recaptcha', {
        size: 'invisible',
        callback: () => {},
      });
      const result = await signInWithPhoneNumber(
        firebaseAuth,
        '+91' + phone,
        recaptchaRef.current,
      );
      confirmRef.current = result;
      setOtp(['','','','','','']);
      setScreen('otp');
      setTimeout(() => boxRefs.current[0]?.focus(), 80);
    } catch (err: any) {
      setSendError(err?.message?.replace('Firebase: ', '') ?? 'Failed to send OTP. Try again.');
    } finally {
      setSending(false);
    }
  };

  const verifyOtp = async () => {
    const code = otp.join('');
    if (code.length < 6) { boxRefs.current[0]?.focus(); return; }
    if (!confirmRef.current) { setOtpError('Session expired. Please go back and resend.'); return; }
    setVerifying(true);
    setOtpError('');
    try {
      await confirmRef.current.confirm(code);
      setScreen('success');
      onVerified?.('+91' + phone);
    } catch (err: any) {
      setOtpError('Invalid OTP. Please check and try again.');
      setOtp(['','','','','','']);
      setTimeout(() => boxRefs.current[0]?.focus(), 80);
    } finally {
      setVerifying(false);
    }
  };

  const handleBox = (i: number, val: string) => {
    const digit = val.replace(/\D/g,'').slice(-1);
    const next = [...otp]; next[i] = digit; setOtp(next);
    if (digit && i < 5) boxRefs.current[i+1]?.focus();
  };

  const handleBoxKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) boxRefs.current[i-1]?.focus();
  };

  return createPortal(
    <div onClick={onClose} style={S.overlay}>
      {/* Invisible reCAPTCHA anchor — must stay in DOM while auth is in progress */}
      <div id="ovi-recaptcha" style={{ display: 'none' }} />
      <div onClick={e => e.stopPropagation()} style={S.card}>

        {/* ── MAIN SCREEN ── */}
        {screen === 'main' && (<>
          <div style={S.top}>
            <div style={S.grain} />
            <div style={S.weekTag}>
              <div style={S.pulse} /><span style={S.weekLabel}>Free for 7 days</span>
            </div>
            <div style={S.headline}>Your personal<br /><em style={{ fontStyle:'italic', color:'#f4c66a' }}>admissions edge.</em></div>
            <div style={S.sub}>No card&nbsp;·&nbsp;no commitment&nbsp;·&nbsp;instant access</div>
          </div>

          <div style={S.body}>
            <div style={{ marginBottom: 22 }}>
              {[
                { n:'1', title:'College list built around you',          pills:['Research culture','Placement record','Location','Branch aspirations','Fee & ROI','Campus life'], hi:[0,1] },
                { n:'2', title:'AI that actually knows every college',    pills:['Compare colleges','Branch vs college tradeoff','Placement deep-dives','Fee breakdowns'], hi:[0,1] },
                { n:'3', title:'Counselling copilot with simulations',    pills:['Admission probabilities','Best option for you','Freeze / Float / Slide','Round-by-round'], hi:[0,1] },
              ].map(f => (
                <div key={f.n} style={S.feat}>
                  <div style={S.featNum}>{f.n}</div>
                  <div>
                    <div style={S.featTitle}>{f.title}</div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                      {f.pills.map((p,i) => (
                        <span key={p} style={{ ...S.pill, ...(f.hi.includes(i) ? S.pillHi : {}) }}>{p}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <button style={S.btnPrimary} onClick={() => setScreen('otp')}>Unlock free access &nbsp;→</button>
              <button style={S.btnOutline} onClick={() => setScreen('otp')}>Access now</button>
              <div style={S.dismiss} onClick={onClose}>Maybe later</div>
            </div>
          </div>
        </>)}

        {/* ── OTP SCREEN ── */}
        {screen === 'otp' && (
          <div style={{ padding: 28 }}>
            <button style={S.back} onClick={() => { setScreen('main'); setPhone(''); setOtp(['','','','','','']); }}>
              ← Back
            </button>
            <div style={S.otpHead}>Verify your number</div>
            <div style={S.otpDesc}>Enter your mobile to get an OTP. Your <strong>free week</strong> starts the moment you verify.</div>

            <div style={S.fieldLabel}>Mobile number</div>
            <div style={{ display:'flex', gap:8, marginBottom:16 }}>
              <div style={S.prefix}>+91</div>
              <input style={S.phInput} type="tel" placeholder="98765 43210" maxLength={10}
                value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g,''))} />
            </div>

            {otp[0] === '' && otp.every(d => d === '') ? (
              <>
                {sendError && <p style={{ fontSize:11, color:'#c0392b', marginBottom:8, fontFamily:"'DM Mono',monospace" }}>{sendError}</p>}
                <button style={{ ...S.sendBtn, opacity: phone.length===10 && !sending ? 1 : 0.5 }}
                  disabled={phone.length !== 10 || sending} onClick={sendOtp}>
                  {sending ? 'Sending…' : 'Send OTP'}
                </button>
              </>
            ) : (<>
              <div style={S.fieldLabel}>6-digit code</div>
              <div style={{ display:'flex', gap:8, marginBottom:8 }}>
                {otp.map((d,i) => (
                  <input key={i} ref={el => { boxRefs.current[i] = el; }} style={S.box}
                    maxLength={1} inputMode="numeric" type="text" value={d}
                    onChange={e => handleBox(i, e.target.value)}
                    onKeyDown={e => handleBoxKey(i, e)} />
                ))}
              </div>
              {otpError && <p style={{ fontSize:11, color:'#c0392b', marginBottom:8, fontFamily:"'DM Mono',monospace" }}>{otpError}</p>}
              <div style={S.resend}>Didn't get it?{' '}
                <button style={S.resendBtn} onClick={() => { setOtp(['','','','','','']); setOtpError(''); sendOtp(); }}>Resend</button>
              </div>
              <button style={{ ...S.verifyBtn, opacity: verifying ? 0.6 : 1 }} disabled={verifying} onClick={verifyOtp}>
                {verifying ? 'Verifying…' : 'Verify & unlock'}
              </button>
            </>)}
          </div>
        )}

        {/* ── SUCCESS SCREEN ── */}
        {screen === 'success' && (
          <div style={{ padding:'36px 28px', textAlign:'center' }}>
            <div style={S.checkCircle}>✓</div>
            <div style={S.successHead}>You're in.</div>
            <div style={S.successSub}>Your free week is live. Personalised list, AI chat, and copilot — all yours, tuned to your rank and goals.</div>
            <button style={S.btnPrimary} onClick={onClose}>Open my copilot</button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

/* ── Styles ── */
const S: Record<string, React.CSSProperties> = {
  overlay:    { position:'fixed', inset:0, background:'rgba(26,22,18,0.65)', display:'flex', alignItems:'center', justifyContent:'center', padding:24, zIndex:9999, backdropFilter:'blur(2px)', animation:'oviFadeIn .2s ease' },
  card:       { width:'100%', maxWidth:400, background:'#faf8f4', borderRadius:16, overflow:'hidden', boxShadow:'0 24px 64px rgba(0,0,0,0.35)', animation:'oviSlideUp .3s cubic-bezier(.22,1,.36,1)' },
  top:        { background:'#111109', padding:'32px 30px 28px', position:'relative', overflow:'hidden' },
  grain:      { position:'absolute', inset:0, opacity:.03, backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize:'160px' },
  weekTag:    { display:'inline-flex', alignItems:'center', gap:7, border:'1px solid rgba(244,198,106,.22)', borderRadius:20, padding:'4px 13px 4px 10px', marginBottom:20, position:'relative', zIndex:1 },
  pulse:      { width:7, height:7, borderRadius:'50%', background:'#f4c66a', boxShadow:'0 0 0 3px rgba(244,198,106,.2)' },
  weekLabel:  { fontFamily:"'DM Mono',monospace", fontSize:10, letterSpacing:'.1em', color:'rgba(244,198,106,.75)' },
  headline:   { fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:34, fontWeight:400, lineHeight:1.15, color:'#f5f0e8', letterSpacing:'-.01em', position:'relative', zIndex:1, marginBottom:8 },
  sub:        { fontSize:12, color:'rgba(245,240,232,.32)', fontFamily:"'DM Mono',monospace", letterSpacing:'.05em', position:'relative', zIndex:1 },
  body:       { padding:'24px 28px 28px' },
  feat:       { display:'flex', gap:14, alignItems:'flex-start', padding:'14px 0', borderBottom:'1px solid #ece8e0' },
  featNum:    { fontFamily:"'Cormorant Garamond',serif", fontSize:19, fontWeight:500, color:'#c8b89a', lineHeight:1, flexShrink:0, width:20, paddingTop:1 },
  featTitle:  { fontSize:13, fontWeight:500, color:'#1a1612', lineHeight:1.3, marginBottom:5 },
  pill:       { fontSize:11, color:'#6b6357', background:'#f0ece4', borderRadius:4, padding:'2px 8px', lineHeight:1.6 },
  pillHi:     { color:'#3b2e1a', background:'#e8dfc8' },
  btnPrimary: { width:'100%', background:'#1a1612', color:'#f5f0e8', border:'none', borderRadius:10, padding:'14px 20px', fontFamily:"'DM Mono',monospace", fontSize:12, letterSpacing:'.06em', cursor:'pointer' },
  btnOutline: { width:'100%', background:'transparent', color:'#1a1612', border:'1.5px solid #d5cfc4', borderRadius:10, padding:'13px 20px', fontFamily:"'DM Mono',monospace", fontSize:12, letterSpacing:'.06em', cursor:'pointer' },
  dismiss:    { textAlign:'center', fontSize:11, color:'#b0a898', fontFamily:"'DM Mono',monospace", letterSpacing:'.04em', cursor:'pointer', paddingTop:2 },
  back:       { background:'none', border:'none', fontFamily:"'DM Mono',monospace", fontSize:11, color:'#b0a898', letterSpacing:'.04em', cursor:'pointer', marginBottom:22, padding:0 },
  otpHead:    { fontFamily:"'Cormorant Garamond',serif", fontSize:26, fontWeight:400, color:'#1a1612', marginBottom:6, letterSpacing:'-.01em' },
  otpDesc:    { fontSize:12, color:'#8a8070', lineHeight:1.65, marginBottom:26 },
  fieldLabel: { fontFamily:"'DM Mono',monospace", fontSize:10, letterSpacing:'.09em', color:'#b0a898', marginBottom:7 },
  prefix:     { background:'#f0ece4', border:'1.5px solid #ddd8ce', borderRadius:8, padding:'0 13px', fontFamily:"'DM Mono',monospace", fontSize:13, color:'#5a5045', display:'flex', alignItems:'center', flexShrink:0, height:46 },
  phInput:    { flex:1, height:46, background:'#fff', border:'1.5px solid #ddd8ce', borderRadius:8, padding:'0 15px', fontSize:14, fontFamily:"'Inter',sans-serif", color:'#1a1612', outline:'none' },
  sendBtn:    { width:'100%', height:46, background:'#1a1612', color:'#f5f0e8', border:'none', borderRadius:10, fontFamily:"'DM Mono',monospace", fontSize:12, letterSpacing:'.06em', cursor:'pointer' },
  box:        { width:46, height:52, background:'#fff', border:'1.5px solid #ddd8ce', borderRadius:10, textAlign:'center', fontSize:22, fontFamily:"'DM Mono',monospace", fontWeight:500, color:'#1a1612', outline:'none' },
  resend:     { fontFamily:"'DM Mono',monospace", fontSize:10, color:'#b0a898', letterSpacing:'.04em', marginBottom:18 },
  resendBtn:  { background:'none', border:'none', fontFamily:"'DM Mono',monospace", fontSize:10, letterSpacing:'.04em', color:'#8a6a3a', cursor:'pointer', padding:0 },
  verifyBtn:  { width:'100%', height:46, background:'#3b5e35', color:'#f0f8ec', border:'none', borderRadius:10, fontFamily:"'DM Mono',monospace", fontSize:12, letterSpacing:'.06em', cursor:'pointer' },
  checkCircle:{ width:56, height:56, borderRadius:'50%', border:'1.5px solid #b8d4b0', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 18px', fontSize:22, color:'#3b5e35' },
  successHead:{ fontFamily:"'Cormorant Garamond',serif", fontSize:26, fontWeight:400, color:'#1a1612', marginBottom:8 },
  successSub: { fontSize:13, color:'#8a8070', lineHeight:1.7, marginBottom:26 },
};

export default OviPopup;
