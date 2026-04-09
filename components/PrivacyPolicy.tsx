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
  {id:'collect',label:'Information We Collect'},
  {id:'use',label:'How We Use Your Data'},
  {id:'sharing',label:'Data Sharing & Lead Disclosure'},
  {id:'consent',label:'Your Consent'},
  {id:'optout',label:'Opt-Out & Data Deletion'},
  {id:'cookies',label:'Cookies & Tracking'},
  {id:'retention',label:'Data Retention'},
  {id:'security',label:'Security'},
  {id:'jurisdiction',label:'Jurisdiction'},
  {id:'contact',label:'Contact Us'},
];

const H: React.FC<{id:string; children:React.ReactNode}> = ({id,children}) => (
  <h2 id={id} style={{fontFamily:V.serif,fontSize:22,color:V.ink,marginTop:40,marginBottom:12,scrollMarginTop:80}}>{children}</h2>
);
const P: React.FC<{children:React.ReactNode}> = ({children}) => (
  <p style={{fontSize:14,color:V.ink2,lineHeight:1.8,marginBottom:12}}>{children}</p>
);
const Li: React.FC<{children:React.ReactNode}> = ({children}) => (
  <li style={{fontSize:14,color:V.ink2,lineHeight:1.7,paddingLeft:8,marginBottom:4}}>{children}</li>
);

const PrivacyPolicy: React.FC<{onBack:()=>void}> = ({onBack}) => {
  useEffect(()=>{track('privacy_policy_viewed')},[]);
  return (
    <div style={{background:V.paper,fontFamily:V.sans,minHeight:'100vh'}} className="px-4 sm:px-8 py-12">
      <div className="max-w-4xl mx-auto flex gap-10">
        {/* Sticky TOC (desktop) */}
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
          <h1 style={{fontFamily:V.serif,fontSize:'clamp(2rem,5vw,2.75rem)',color:V.ink,lineHeight:1.1,marginBottom:8}}>Privacy Policy</h1>
          <p style={{fontSize:14,color:V.ink3,marginBottom:32}}>OviGuide by Oviqo · team@oviqo.in</p>

          <P>This Privacy Policy describes how OviGuide (operated by Oviqo, "we", "us", "our") collects, uses, shares, and protects information when you use our website and services.</P>

          <H id="collect">1. Information We Collect</H>
          <P>We collect the following personal information when you sign up or use OviGuide:</P>
          <ul style={{paddingLeft:20,listStyle:'disc'}}>
            <Li>Name and email address (via Google OAuth)</Li>
            <Li>Profile picture (from your Google account)</Li>
            <Li>JEE Main rank, category, home state, and quota</Li>
            <Li>College and branch preferences you select</Li>
            <Li>Counselling selections (JoSAA, VITEEE, etc.)</Li>
            <Li>Usage behaviour: pages visited, features used, prediction history</Li>
            <Li>Device information: browser type, operating system, IP address</Li>
          </ul>

          <H id="use">2. How We Use Your Data</H>
          <P>We use your information to:</P>
          <ul style={{paddingLeft:20,listStyle:'disc'}}>
            <Li>Generate personalised college cutoff predictions and recommendations</Li>
            <Li>Improve our prediction algorithms and user experience</Li>
            <Li>Send counselling-related updates and notifications</Li>
            <Li>Conduct analytics to understand usage patterns and improve our services</Li>
          </ul>

          <H id="sharing">3. Data Sharing & Lead Disclosure</H>
          <div style={{background:V.paper2,border:`1.5px solid ${V.accent}40`,borderLeft:`3px solid ${V.accent}`,borderRadius:4,padding:'16px 20px',marginBottom:16}}>
            <p style={{fontFamily:V.mono,fontSize:10,color:V.accent,textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:8,fontWeight:600}}>IMPORTANT: PLEASE READ</p>
            <P>OviGuide may share your personal data, including your name, email address, JEE rank, category, home state, and educational preferences, with third-party educational institutions, coaching centres, ed-tech partners, and lead aggregators for the purpose of marketing, counselling outreach, and admissions-related communications.</P>
            <P>This means you may receive emails, phone calls, SMS, or WhatsApp messages from partner organisations about their educational programmes, admission processes, or related services. We share this data to connect you with relevant counselling opportunities.</P>
          </div>
          <P>We may also share anonymised, aggregated data with research partners to improve educational outcomes.</P>

          <H id="consent">4. Your Consent</H>
          <P>By creating an account on OviGuide or submitting a rank prediction, you consent to the collection and use of your data as described in this policy, including the sharing of your data with partner institutions as described in Section 3.</P>
          <P>During signup, you will be presented with a consent checkbox. This checkbox is unchecked by default and must be actively selected by you.</P>

          <H id="optout">5. Opt-Out & Data Deletion</H>
          <P>You may opt out of lead sharing or request complete deletion of your personal data at any time by emailing <strong>team@oviqo.in</strong>. We will process your request within 30 days.</P>
          <P>After deletion, your prediction history and preferences will be permanently removed and cannot be recovered.</P>

          <H id="cookies">6. Cookies & Tracking</H>
          <P>OviGuide uses the following tracking technologies:</P>
          <ul style={{paddingLeft:20,listStyle:'disc'}}>
            <Li><strong>Google Analytics 4 (GA4):</strong> page views, events, user demographics</Li>
            <Li><strong>Microsoft Clarity:</strong> session recordings, heatmaps, click tracking</Li>
            <Li><strong>Supabase Auth:</strong> session tokens stored in localStorage</Li>
          </ul>
          <P>You can disable cookies through your browser settings. This may affect the functionality of OviGuide.</P>

          <H id="retention">7. Data Retention</H>
          <P>We retain your personal data for as long as your account is active or as needed to provide services. If you request deletion, we will remove your data within 30 days of receipt. Anonymised analytics data may be retained indefinitely.</P>

          <H id="security">8. Security</H>
          <P>We use industry-standard security measures including encrypted connections (HTTPS/TLS), Supabase Row Level Security (RLS), and secure OAuth 2.0 authentication. However, no method of transmission over the internet is 100% secure.</P>

          <H id="jurisdiction">9. Jurisdiction</H>
          <P>This policy is governed by the laws of India. For California (USA) residents, you may have additional rights under the CCPA including the right to know what data is collected and the right to request deletion. Contact us at team@oviqo.in to exercise these rights.</P>

          <H id="contact">10. Contact Us</H>
          <P>For privacy-related inquiries, data deletion requests, or to opt out of lead sharing:</P>
          <div style={{background:V.paper2,border:`1px solid ${V.paper3}`,borderRadius:4,padding:'16px 20px',marginTop:8}}>
            <p style={{fontFamily:V.mono,fontSize:12,color:V.ink}}>Email: <a href="mailto:team@oviqo.in" style={{color:V.accent,textDecoration:'none'}}>team@oviqo.in</a></p>
            <p style={{fontFamily:V.mono,fontSize:11,color:V.ink4,marginTop:4}}>Oviqo · Bengaluru, Karnataka, India</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
