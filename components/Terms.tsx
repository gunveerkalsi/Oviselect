import React, { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { track } from '../lib/analytics';

const V = {
  ink:'#0e0e0e', ink2:'#3a3a3a', ink3:'#6b6b6b', ink4:'#a8a8a8',
  paper:'#f5f2ec', paper2:'#edeae3', paper3:'#e3dfd7',
  accent:'#c8522a',
  serif:"'DM Serif Display',Georgia,serif",
  mono:"'DM Mono',monospace",
  sans:"'Instrument Sans',sans-serif",
};

const TOC = [
  {id:'service',label:'Service Description'},
  {id:'liability',label:'No Liability'},
  {id:'use',label:'Acceptable Use'},
  {id:'ip',label:'Intellectual Property'},
  {id:'data',label:'Data & Lead Sharing'},
  {id:'termination',label:'Account Termination'},
  {id:'law',label:'Governing Law'},
  {id:'changes',label:'Changes to Terms'},
  {id:'contact',label:'Contact'},
];

const H: React.FC<{id:string; children:React.ReactNode}> = ({id,children}) => (
  <h2 id={id} style={{fontFamily:V.serif,fontSize:22,color:V.ink,marginTop:40,marginBottom:12,scrollMarginTop:80}}>{children}</h2>
);
const P: React.FC<{children:React.ReactNode}> = ({children}) => (
  <p style={{fontSize:14,color:V.ink2,lineHeight:1.8,marginBottom:12}}>{children}</p>
);

const Terms: React.FC<{onBack:()=>void}> = ({onBack}) => {
  useEffect(()=>{track('terms_viewed')},[]);
  return (
    <div style={{background:V.paper,fontFamily:V.sans,minHeight:'100vh'}} className="px-4 sm:px-8 py-12">
      <div className="max-w-4xl mx-auto flex gap-10">
        <nav className="hidden lg:block" style={{width:200,flexShrink:0,position:'sticky',top:80,alignSelf:'flex-start'}}>
          <p style={{fontFamily:V.mono,fontSize:9,letterSpacing:'0.1em',textTransform:'uppercase',color:V.ink4,marginBottom:12}}>On this page</p>
          {TOC.map(t=>(
            <a key={t.id} href={`#${t.id}`} style={{display:'block',fontSize:11,color:V.ink4,padding:'4px 0',textDecoration:'none',borderLeft:`2px solid ${V.paper3}`,paddingLeft:10,marginBottom:2}} className="hover:text-[#0e0e0e]">{t.label}</a>
          ))}
        </nav>
        <div style={{flex:1,minWidth:0}}>
          <button onClick={onBack} style={{fontFamily:V.mono,fontSize:10,color:V.ink4,letterSpacing:'0.07em',textTransform:'uppercase',marginBottom:32,background:'none',border:'none',cursor:'pointer'}} className="flex items-center gap-2 hover:opacity-70">
            <ArrowLeft size={12}/>BACK
          </button>
          <p style={{fontFamily:V.mono,fontSize:10,letterSpacing:'0.1em',textTransform:'uppercase',color:V.ink4,marginBottom:8}}>EFFECTIVE DATE: APRIL 6, 2026</p>
          <h1 style={{fontFamily:V.serif,fontSize:'clamp(2rem,5vw,2.75rem)',color:V.ink,lineHeight:1.1,marginBottom:8}}>Terms & Conditions</h1>
          <p style={{fontSize:14,color:V.ink3,marginBottom:32}}>OviGuide by Oviqo · team@oviqo.in</p>

          <P>By accessing or using OviGuide, you agree to be bound by these Terms and Conditions. If you do not agree, do not use this service.</P>

          <H id="service">1. Service Description</H>
          <P>OviGuide is an AI-assisted counselling decision tool that provides college cutoff predictions, seat availability insights, and personalised recommendations for JEE-based admissions counselling (JoSAA, VITEEE, and other counsellings).</P>
          <P>All predictions, recommendations, and analysis are generated using historical data and machine learning models. They are provided <strong>for informational purposes only</strong> and do not constitute official admission offers, guarantees, or professional advice.</P>

          <H id="liability">2. No Liability</H>
          <div style={{background:V.paper2,border:`1.5px solid ${V.accent}40`,borderLeft:`3px solid ${V.accent}`,borderRadius:4,padding:'16px 20px',marginBottom:16}}>
            <P>Oviqo is not responsible for any admission decisions, financial losses, or other consequences arising from your use of OviGuide predictions. Cutoff data is sourced from publicly available JoSAA records and may contain inaccuracies, omissions, or outdated information.</P>
            <P>You should always verify predictions against official counselling authority data before making admission decisions. OviGuide is a supplementary tool, not a replacement for official counselling resources.</P>
          </div>

          <H id="use">3. Acceptable Use</H>
          <P>You agree not to:</P>
          <ul style={{paddingLeft:20,listStyle:'disc',marginBottom:12}}>
            <li style={{fontSize:14,color:V.ink2,lineHeight:1.7,marginBottom:4}}>Scrape, crawl, or use automated tools to extract data from OviGuide</li>
            <li style={{fontSize:14,color:V.ink2,lineHeight:1.7,marginBottom:4}}>Share your account credentials or allow others to access your account</li>
            <li style={{fontSize:14,color:V.ink2,lineHeight:1.7,marginBottom:4}}>Attempt to reverse-engineer our prediction algorithms</li>
            <li style={{fontSize:14,color:V.ink2,lineHeight:1.7,marginBottom:4}}>Use the service for any purpose other than personal educational counselling</li>
            <li style={{fontSize:14,color:V.ink2,lineHeight:1.7,marginBottom:4}}>Upload malicious content or attempt to compromise the service</li>
          </ul>

          <H id="ip">4. Intellectual Property</H>
          <P>All content, user interface designs, prediction models, data compilations, and software code on OviGuide are the exclusive intellectual property of Oviqo. You may not reproduce, distribute, or create derivative works without prior written consent.</P>

          <H id="data">5. Data & Lead Sharing</H>
          <P>By using OviGuide, you acknowledge and agree to the data collection and sharing practices described in our <a href="/privacy" style={{color:V.accent,textDecoration:'none',fontWeight:600}}>Privacy Policy</a>, including the sharing of your personal data with third-party educational institutions and partners for counselling-related outreach.</P>

          <H id="termination">6. Account Termination</H>
          <P>Oviqo reserves the right to suspend or terminate your account at any time, with or without notice, for violation of these Terms or for any other reason. Upon termination, your right to use the service ceases immediately.</P>

          <H id="law">7. Governing Law</H>
          <P>These Terms are governed by the laws of India. Any disputes arising from these Terms shall be resolved exclusively in the courts of Bengaluru, Karnataka, India.</P>

          <H id="changes">8. Changes to Terms</H>
          <P>We may update these Terms at any time. Continued use of OviGuide after changes constitutes acceptance of the updated Terms. We will notify registered users of material changes via email.</P>

          <H id="contact">9. Contact</H>
          <P>For questions about these Terms:</P>
          <div style={{background:V.paper2,border:`1px solid ${V.paper3}`,borderRadius:4,padding:'16px 20px',marginTop:8}}>
            <p style={{fontFamily:V.mono,fontSize:12,color:V.ink}}>Email: <a href="mailto:team@oviqo.in" style={{color:V.accent,textDecoration:'none'}}>team@oviqo.in</a></p>
            <p style={{fontFamily:V.mono,fontSize:11,color:V.ink4,marginTop:4}}>Oviqo · Bengaluru, Karnataka, India</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
