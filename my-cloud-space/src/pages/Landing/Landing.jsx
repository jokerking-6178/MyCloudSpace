import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const FEATURES = [
  {
    icon: '🧠',
    tag: 'AI-Powered',
    title: 'Chat with your documents',
    desc: 'Ask anything about your files in plain English. Our on-premise RAG pipeline powered by Ollama means your data never leaves your infrastructure.',
    color: '#7c3aed',
  },
  {
    icon: '🔗',
    tag: 'Smart Sharing',
    title: 'Share links with real control',
    desc: 'Expiry in minutes, hours, or days. Set per-link download caps. Auto-revoke when the limit is hit. Zero guesswork.',
    color: '#0ea5e9',
  },
  {
    icon: '💳',
    tag: 'Flexible Pricing',
    title: '₹7 per GB. Exactly what you need.',
    desc: 'Pick 10 GB or 2 TB — or anything in between. Stackable tiers. No wasted storage, no forced upgrades.',
    color: '#10b981',
  },
  {
    icon: '🔒',
    tag: 'Security First',
    title: 'Enterprise-grade security',
    desc: 'Stateless JWT auth, BCrypt hashing, GitHub OAuth 2.0, HMAC-SHA256 payment verification, OWASP-aligned access control.',
    color: '#f59e0b',
  },
];

const STATS = [
  { value: '50 MB', label: 'Max file size' },
  { value: '2 TB', label: 'Max storage' },
  { value: '₹7/GB', label: 'Per month' },
  { value: '100 days', label: 'Max link expiry' },
];

const COMPARISON = [
  { feature: 'AI Document Chat', mcs: true, google: false, dropbox: false, onedrive: 'Cloud only' },
  { feature: 'Data stays on your infra', mcs: true, google: false, dropbox: false, onedrive: false },
  { feature: 'Per-GB custom pricing', mcs: true, google: false, dropbox: false, onedrive: false },
  { feature: 'Per-link download caps', mcs: true, google: false, dropbox: false, onedrive: false },
  { feature: 'Minute-level link expiry', mcs: true, google: false, dropbox: false, onedrive: false },
  { feature: 'Stackable storage tiers', mcs: true, google: false, dropbox: false, onedrive: false },
];


function PricingSlider() {
  const [gb, setGb] = useState(100);
  const price = gb * 7;
  return (
    <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: '40px 44px', maxWidth: 520 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 }}>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600 }}>Storage</span>
        <span style={{ fontSize: 32, fontWeight: 700, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>{gb >= 1024 ? `${(gb/1024).toFixed(gb%1024===0?0:1)} TB` : `${gb} GB`}</span>
      </div>
      <input
        type="range"
        min={10}
        max={2048}
        step={10}
        value={gb}
        onChange={e => setGb(Number(e.target.value))}
        style={{ width: '100%', accentColor: '#a78bfa', height: 4, cursor: 'pointer', marginBottom: 28 }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>Monthly cost</div>
          <div style={{ fontSize: 40, fontWeight: 800, color: '#a78bfa', letterSpacing: '-0.02em' }}>₹{price.toLocaleString('en-IN')}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>₹{Math.round(price/30).toLocaleString('en-IN')}/day</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>Rate</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#34d399' }}>₹7/GB</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>always</div>
        </div>
      </div>
    </div>
  );
}

function CheckIcon({ ok }) {
  if (ok === true) return <span style={{ color: '#34d399', fontSize: 18, fontWeight: 700 }}>✓</span>;
  if (ok === false) return <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 15 }}>—</span>;
  return <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{ok}</span>;
}

export default function Landing() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{ background: '#08070f', color: '#fff', minHeight: '100vh', fontFamily: "'DM Sans', 'Inter', sans-serif", overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400;1,9..40,500&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #08070f; }
        ::selection { background: rgba(167,139,250,0.35); }

        .nav-pill {
          position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
          z-index: 100; display: flex; align-items: center; gap: 0;
          background: rgba(18,16,30,0.85); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 50px; padding: 8px 8px 8px 24px;
          backdrop-filter: blur(20px); transition: all 0.3s;
          width: clamp(340px, 680px, 90vw);
        }
        .nav-pill.scrolled { background: rgba(12,10,22,0.95); border-color: rgba(167,139,250,0.2); }
        .nav-links { display: flex; gap: 28px; flex: 1; }
        .nav-links a { color: rgba(255,255,255,0.55); text-decoration: none; font-size: 14px; font-weight: 500; transition: color 0.2s; }
        .nav-links a:hover { color: #fff; }
        .nav-cta { background: #7c3aed; color: #fff; border: none; border-radius: 50px; padding: 9px 22px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
        .nav-cta:hover { background: #6d28d9; transform: translateY(-1px); }

        .hero-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(124,58,237,0.15); border: 1px solid rgba(124,58,237,0.35); border-radius: 50px; padding: 6px 16px 6px 8px; font-size: 12px; color: #a78bfa; font-weight: 600; letter-spacing: 0.04em; margin-bottom: 32px; }
        .hero-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #a78bfa; animation: pulse-dot 2s ease-in-out infinite; }
        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }

        .hero-title { font-size: clamp(44px, 7vw, 88px); font-weight: 800; line-height: 1.0; letter-spacing: -0.03em; margin-bottom: 28px; }
        .hero-title .accent { color: #a78bfa; font-style: italic; font-weight: 400; }
        .hero-title .accent-green { color: #34d399; }

        .hero-sub { font-size: clamp(16px, 2vw, 20px); color: rgba(255,255,255,0.5); max-width: 560px; line-height: 1.65; margin-bottom: 44px; font-weight: 400; }

        .btn-primary { display: inline-flex; align-items: center; gap: 10px; background: #7c3aed; color: #fff; border: none; border-radius: 50px; padding: 16px 32px; font-size: 16px; font-weight: 700; cursor: pointer; transition: all 0.25s; text-decoration: none; }
        .btn-primary:hover { background: #6d28d9; transform: translateY(-2px); box-shadow: 0 12px 40px rgba(124,58,237,0.4); }
        .btn-ghost { display: inline-flex; align-items: center; gap: 8px; background: transparent; color: rgba(255,255,255,0.65); border: 1px solid rgba(255,255,255,0.15); border-radius: 50px; padding: 16px 28px; font-size: 15px; font-weight: 500; cursor: pointer; transition: all 0.2s; text-decoration: none; }
        .btn-ghost:hover { color: #fff; border-color: rgba(255,255,255,0.35); background: rgba(255,255,255,0.05); }

        .stat-chip { display: flex; flex-direction: column; align-items: center; gap: 4px; }
        .stat-val { font-size: 28px; font-weight: 800; letter-spacing: -0.02em; }
        .stat-lbl { font-size: 12px; color: rgba(255,255,255,0.4); font-weight: 500; letter-spacing: 0.04em; text-transform: uppercase; }

        .glow-blob { position: absolute; border-radius: 50%; filter: blur(90px); pointer-events: none; }

        .section-tag { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #a78bfa; margin-bottom: 16px; }
        .section-tag::before { content: ''; width: 20px; height: 1px; background: #a78bfa; }

        .feature-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; padding: 32px; transition: all 0.3s; position: relative; overflow: hidden; }
        .feature-card:hover { border-color: rgba(255,255,255,0.14); background: rgba(255,255,255,0.05); transform: translateY(-4px); }
        .feature-card::before { content: ''; position: absolute; inset: 0; border-radius: 20px; opacity: 0; transition: opacity 0.3s; }
        .feature-icon { width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 20px; }
        .feature-tag { font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 10px; }
        .feature-title { font-size: 18px; font-weight: 700; margin-bottom: 12px; line-height: 1.3; }
        .feature-desc { font-size: 14px; color: rgba(255,255,255,0.5); line-height: 1.7; }

        .email-form { display: flex; align-items: center; gap: 0; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); border-radius: 50px; padding: 6px 6px 6px 22px; max-width: 440px; width: 100%; }
        .email-input { flex: 1; background: transparent; border: none; outline: none; color: #fff; font-size: 15px; font-family: inherit; }
        .email-input::placeholder { color: rgba(255,255,255,0.3); }
        .email-submit { background: #7c3aed; color: #fff; border: none; border-radius: 50px; padding: 12px 24px; font-size: 14px; font-weight: 700; cursor: pointer; white-space: nowrap; transition: all 0.2s; }
        .email-submit:hover { background: #6d28d9; }

        .table-row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; gap: 0; align-items: center; padding: 14px 24px; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .table-row:last-child { border-bottom: none; }
        .table-row.header { padding: 12px 24px; background: rgba(255,255,255,0.03); border-radius: 12px 12px 0 0; }
        .table-cell { text-align: center; font-size: 14px; }
        .table-cell:first-child { text-align: left; color: rgba(255,255,255,0.65); font-size: 14px; }
        .table-header { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: rgba(255,255,255,0.35); }
        .table-header:first-child { text-align: left; }
        .mcs-col { color: #a78bfa; font-weight: 700; }
        
        .tech-pill { display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); border-radius: 50px; padding: 6px 14px; font-size: 12px; font-weight: 500; color: rgba(255,255,255,0.55); font-family: 'DM Mono', monospace; transition: all 0.2s; }
        .tech-pill:hover { background: rgba(167,139,250,0.1); border-color: rgba(167,139,250,0.3); color: #a78bfa; }

        @media (max-width: 680px) {
          .nav-links { display: none; }
          .hero-title { font-size: 42px; }
          .stats-row { gap: 24px; }
          .features-grid { grid-template-columns: 1fr !important; }
          .table-row { grid-template-columns: 2fr 1fr 1fr; }
          .hide-mobile { display: none; }
        }
      `}</style>

      <nav className={`nav-pill ${scrolled ? 'scrolled' : ''}`}>
        <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.02em', marginRight: 32, color: '#fff' }}>
          MyCloud<span style={{ color: '#a78bfa' }}>Space</span>
        </div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#compare">Compare</a>
        </div>
        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
          <button onClick={() => navigate('/login')} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 14, fontWeight: 500, padding: '9px 16px' }}>Login</button>
          <button className="nav-cta" onClick={() => navigate('/login')}>Get started →</button>
        </div>
      </nav>

      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '120px 5vw 80px', overflow: 'hidden' }}>
       
        <div className="glow-blob" style={{ width: 600, height: 600, background: 'rgba(124,58,237,0.15)', top: -100, right: -100 }} />
        <div className="glow-blob" style={{ width: 400, height: 400, background: 'rgba(52,211,153,0.08)', bottom: 0, left: '30%' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 820 }}>
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              Open-source · Self-hostable · Privacy-first
            </div>
            <h1 className="hero-title">
              Cloud storage<br />
              with <span className="accent">intelligence</span><br />
              built <span className="accent-green">in.</span>
            </h1>
            <p className="hero-sub">
              Upload, share, and chat with your files using on-premise AI — no cloud subscriptions, no data leaks. Built on Spring Boot, React 18, and AWS S3.
            </p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 64 }}>
              <button className="btn-primary" onClick={() => navigate('/login')}>
                Start for free <span style={{ fontSize: 18 }}>→</span>
              </button>
              <a className="btn-ghost" href="https://github.com/jokerking-6178/MyCloudSpace" target="_blank" rel="noopener noreferrer">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>
                View source
              </a>
            </div>
          </div>

          <div className="stats-row" style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
            {STATS.map(s => (
              <div key={s.label} className="stat-chip">
                <span className="stat-val" style={{ background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.5) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.value}</span>
                <span className="stat-lbl">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'absolute', right: '5%', top: '50%', transform: 'translateY(-50%)', width: 320, display: 'flex', flexDirection: 'column', gap: 12, opacity: 0.85, pointerEvents: 'none' }} className="hide-mobile">
        
          <div style={{ background: 'rgba(18,16,30,0.9)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 16, padding: '16px 18px' }}>
            <div style={{ fontSize: 11, color: '#a78bfa', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>AI Document Chat</div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(167,139,250,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>U</div>
              <div style={{ background: 'rgba(124,58,237,0.25)', borderRadius: '4px 12px 12px 12px', padding: '8px 12px', fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>What are the key risks in Q3 report?</div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(52,211,153,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>AI</div>
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px 4px 12px 12px', padding: '8px 12px', fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>Based on the report, the three key risks are supply chain disruptions, currency exposure in APAC, and regulatory changes in...</div>
            </div>
          </div>
          
          <div style={{ background: 'rgba(18,16,30,0.9)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '14px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Storage used</span>
              <span style={{ fontSize: 12, color: '#a78bfa', fontWeight: 600 }}>0.37 MB / 10 GB</span>
            </div>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
              <div style={{ width: '0.37%', height: '100%', background: '#a78bfa', borderRadius: 2 }} />
            </div>
          </div>
         
          <div style={{ background: 'rgba(18,16,30,0.9)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '14px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>report-final.pdf</div>
                <div style={{ fontSize: 12, color: '#34d399', fontWeight: 600 }}>Link active · expires in 2h · max 5 downloads</div>
              </div>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(52,211,153,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🔗</div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" style={{ padding: '100px 5vw', maxWidth: 1100, margin: '0 auto' }}>
        <div className="section-tag">Features</div>
        <h2 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 16 }}>
          Everything you need.<br />
          <span style={{ color: 'rgba(255,255,255,0.35)' }}>Nothing you don't.</span>
        </h2>
        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.45)', maxWidth: 520, lineHeight: 1.65, marginBottom: 60 }}>
          Built by a developer who was tired of paying for features they'd never use and privacy they never got.
        </p>
        <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
          {FEATURES.map(f => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon" style={{ background: `${f.color}20` }}>
                <span>{f.icon}</span>
              </div>
              <div className="feature-tag" style={{ color: f.color }}>{f.tag}</div>
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '20px 5vw 80px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', marginRight: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Built with</span>
          {['Spring Boot 3.x', 'React 18', 'AWS S3', 'PostgreSQL 16', 'pgvector', 'Ollama', 'llama3.2:1b', 'Spring AI', 'Razorpay', 'JWT', 'OAuth 2.0', 'Apache Tika'].map(t => (
            <span key={t} className="tech-pill">{t}</span>
          ))}
        </div>
      </section>

      <section id="pricing" style={{ padding: '100px 5vw', background: 'linear-gradient(180deg, #08070f 0%, rgba(124,58,237,0.06) 50%, #08070f 100%)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="section-tag">Pricing</div>
          <h2 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 16 }}>
            Pay for exactly<br />
            <span style={{ color: '#a78bfa' }}>what you use.</span>
          </h2>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.45)', maxWidth: 480, lineHeight: 1.65, marginBottom: 60 }}>
            No tiers. No rounding up. ₹7 per GB per month. Start at 10 GB, go up to 2 TB. Stack tiers as you grow.
          </p>
          <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <PricingSlider />
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>
                {[
                  ['10 GB', '₹70/mo', 'Get started'],
                  ['100 GB', '₹700/mo', 'Most popular'],
                  ['1 TB', '₹7,168/mo', 'Power users'],
                ].map(([size, price, label]) => (
                  <div key={size} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12 }}>
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: 2 }}>{size}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{label}</div>
                    </div>
                    <div style={{ fontWeight: 700, color: '#a78bfa' }}>{price}</div>
                  </div>
                ))}
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', lineHeight: 1.6 }}>
                  Tiers stack independently. Each expires after 30 days. HMAC-SHA256 verified payments via Razorpay.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="compare" style={{ padding: '100px 5vw', maxWidth: 1100, margin: '0 auto' }}>
        <div className="section-tag">Compare</div>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 48 }}>
          How we stack up.
        </h2>
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
          <div className="table-row header">
            <div className="table-header">Feature</div>
            <div className="table-header" style={{ textAlign: 'center', color: '#a78bfa' }}>MyCloudSpace</div>
            <div className="table-header" style={{ textAlign: 'center' }}>Google Drive</div>
            <div className="table-header hide-mobile" style={{ textAlign: 'center' }}>Dropbox</div>
            <div className="table-header hide-mobile" style={{ textAlign: 'center' }}>OneDrive</div>
          </div>
          {COMPARISON.map((row, i) => (
            <div key={row.feature} className="table-row" style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
              <div className="table-cell">{row.feature}</div>
              <div className="table-cell mcs-col"><CheckIcon ok={row.mcs} /></div>
              <div className="table-cell"><CheckIcon ok={row.google} /></div>
              <div className="table-cell hide-mobile"><CheckIcon ok={row.dropbox} /></div>
              <div className="table-cell hide-mobile"><CheckIcon ok={row.onedrive} /></div>
            </div>
          ))}
        </div>
      </section>
      <section style={{ padding: '100px 5vw 120px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div className="glow-blob" style={{ width: 700, height: 400, background: 'rgba(124,58,237,0.12)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.05, marginBottom: 24 }}>
            Your files.<br />
            <span style={{ color: '#a78bfa' }}>Your infra.</span><br />
            Your AI.
          </h2>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.45)', marginBottom: 48, lineHeight: 1.65 }}>
            Start with 10 GB free. Upgrade to exactly what you need.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <button className="btn-primary" onClick={() => navigate('/register')}>
              Create your free account →
            </button>
            <button
              onClick={() => navigate('/login')}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.45)', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Already have an account? Sign in
            </button>
          </div>
        </div>
      </section>
      
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '32px 5vw', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: '-0.02em' }}>
          MyCloud<span style={{ color: '#a78bfa' }}>Space</span>
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', display: 'flex', gap: 24 }}>
          <span>Built by Shubham Garg</span>
          <a href="https://github.com/jokerking-6178/MyCloudSpace" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>GitHub ↗</a>
          <span>MIT License</span>
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)' }}>
          Java 21 · Spring Boot 3.x · React 18 · AWS S3 · pgvector
        </div>
      </footer>
    </div>
  );
}