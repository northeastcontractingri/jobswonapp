import { useState, useEffect, useRef } from "react";

const AMBER = "#f59e0b";
const AMBER_DARK = "#d97706";
const BG = "#0b0c0f";
const SURFACE = "#13151a";
const BORDER = "#1f2229";
const TEXT = "#e8eaf0";
const MUTED = "#6b7280";

const trades = ["Roofing", "Siding", "Windows", "Gutters", "Painting", "Decking", "HVAC", "Plumbing", "Electrical", "Fencing"];

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

const Fade = ({ children, delay = 0, style = {} }) => {
  const [ref, visible] = useInView();
  return (
    <div ref={ref} style={{ transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`, opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)", ...style }}>
      {children}
    </div>
  );
};

const ProposalMock = () => (
  <div style={{ background: "#fff", borderRadius: 12, padding: "28px 32px", fontFamily: "'Barlow', sans-serif", color: "#111", width: 380, boxShadow: "0 32px 80px rgba(0,0,0,0.6)", flexShrink: 0 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
      <div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#0b0c0f" }}>Iron Ridge Roofing</div>
        <div style={{ fontSize: 12, color: "#6b7280" }}>Providence, RI · (401) 555-0182</div>
      </div>
      <div style={{ background: "#fef3c7", color: "#92400e", fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20 }}>PROPOSAL</div>
    </div>
    <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 16, marginBottom: 16 }}>
      <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 4 }}>CLIENT</div>
      <div style={{ fontSize: 15, fontWeight: 600 }}>Mike & Sarah Donovan</div>
      <div style={{ fontSize: 13, color: "#6b7280" }}>24 Elmwood Ave, Cranston RI</div>
    </div>
    <div style={{ background: "#f9fafb", borderRadius: 8, padding: "14px 16px", marginBottom: 16 }}>
      {[["Remove & replace 28 sq architectural shingles", "$4,200"], ["Ice & water shield (full roof)", "$840"], ["New ridge cap & flashing", "$380"], ["Disposal & cleanup", "$250"]].map(([item, price]) => (
        <div key={item} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
          <span style={{ color: "#374151" }}>{item}</span>
          <span style={{ fontWeight: 600, color: "#111" }}>{price}</span>
        </div>
      ))}
      <div style={{ borderTop: "1px solid #e5e7eb", marginTop: 10, paddingTop: 10, display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontWeight: 700, fontSize: 15 }}>TOTAL</span>
        <span style={{ fontWeight: 700, fontSize: 15, color: "#f59e0b" }}>$5,670</span>
      </div>
    </div>
    <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 16 }}>Valid 30 days · 5-yr workmanship warranty · Licensed & Insured</div>
    <div style={{ display: "flex", gap: 10 }}>
      <div style={{ flex: 1, background: "#f59e0b", color: "#000", fontSize: 13, fontWeight: 700, padding: "10px 0", borderRadius: 8, textAlign: "center" }}>APPROVE & SIGN</div>
      <div style={{ flex: 1, border: "1px solid #e5e7eb", color: "#374151", fontSize: 13, fontWeight: 600, padding: "10px 0", borderRadius: 8, textAlign: "center" }}>DOWNLOAD PDF</div>
    </div>
  </div>
);

const PricingCard = ({ plan, price, desc, features, highlight, cta }) => {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: highlight ? AMBER : SURFACE, border: `1px solid ${highlight ? AMBER : hov ? "#2d3748" : BORDER}`, borderRadius: 16, padding: "36px 32px", flex: 1, transition: "transform 0.2s, box-shadow 0.2s", transform: highlight ? "scale(1.04)" : hov ? "scale(1.02)" : "scale(1)", boxShadow: highlight ? `0 0 60px rgba(245,158,11,0.25)` : hov ? "0 8px 40px rgba(0,0,0,0.4)" : "none", position: "relative" }}>
      {highlight && <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: "#0b0c0f", border: `1px solid ${AMBER}`, color: AMBER, fontSize: 11, fontWeight: 700, padding: "4px 16px", borderRadius: 20, letterSpacing: 1.5 }}>MOST POPULAR</div>}
      <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 2, color: highlight ? "#0b0c0f" : MUTED, marginBottom: 8 }}>{plan.toUpperCase()}</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 4, marginBottom: 6 }}>
        <div style={{ fontSize: 48, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, color: highlight ? "#0b0c0f" : TEXT, lineHeight: 1 }}>${price}</div>
        <div style={{ fontSize: 14, color: highlight ? "#451a03" : MUTED, marginBottom: 8 }}>/mo</div>
      </div>
      <div style={{ fontSize: 14, color: highlight ? "#451a03" : MUTED, marginBottom: 28 }}>{desc}</div>
      {features.map((f, i) => (
        <div key={i} style={{ display: "flex", gap: 10, marginBottom: 12, fontSize: 14, color: highlight ? "#0b0c0f" : TEXT, alignItems: "flex-start" }}>
          <span style={{ color: highlight ? "#92400e" : AMBER, marginTop: 1 }}>✓</span> {f}
        </div>
      ))}
      <div style={{ marginTop: 32, background: highlight ? "#0b0c0f" : AMBER, color: highlight ? AMBER : "#0b0c0f", borderRadius: 10, padding: "14px 0", textAlign: "center", fontWeight: 700, fontSize: 15, cursor: "pointer", letterSpacing: 0.5 }}>
        {cta}
      </div>
    </div>
  );
};

export default function App() {
  const [tradeIdx, setTradeIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTradeIdx(i => (i + 1) % trades.length), 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ background: BG, color: TEXT, fontFamily: "'Barlow', sans-serif", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&family=Barlow:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: rgba(245,158,11,0.3); }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #0b0c0f; } ::-webkit-scrollbar-thumb { background: #2d3748; }
        .nav-link { color: #9ca3af; font-size: 14px; cursor: pointer; transition: color 0.2s; text-decoration: none; }
        .nav-link:hover { color: #e8eaf0; }
        .feature-row:hover { background: rgba(245,158,11,0.03); }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes slideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .trade-cycle { animation: slideUp 0.35s ease; }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .card-float { animation: float 4s ease-in-out infinite; }
      `}</style>

      {/* NAV */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, borderBottom: `1px solid ${BORDER}`, background: "rgba(11,12,15,0.92)", backdropFilter: "blur(12px)", padding: "0 48px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 32, height: 32, background: AMBER, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 18, color: "#000" }}>✈</span>
          </div>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 800, letterSpacing: 0.5 }}>
            BID<span style={{ color: AMBER }}>PILOT</span>
          </span>
        </div>
        <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
          {["Features", "How It Works", "Pricing"].map(l => <a key={l} className="nav-link">{l}</a>)}
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <a className="nav-link">Log In</a>
          <div style={{ background: AMBER, color: "#000", padding: "9px 22px", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            Start Free →
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding: "100px 48px 80px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 80 }}>
          <div style={{ flex: 1 }}>
            <Fade>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 20, padding: "6px 16px", marginBottom: 28 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: AMBER, animation: "pulse 2s infinite" }} />
                <span style={{ fontSize: 13, color: AMBER, fontWeight: 600 }}>AI-Powered · No Training Required</span>
              </div>
            </Fade>
            <Fade delay={100}>
              <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 72, fontWeight: 900, lineHeight: 1, letterSpacing: "-1px", marginBottom: 24 }}>
                WIN MORE<br />
                <span style={{ color: AMBER }}>
                  <span className="trade-cycle" key={tradeIdx}>{trades[tradeIdx]}</span>
                </span><br />
                JOBS TODAY
              </h1>
            </Fade>
            <Fade delay={200}>
              <p style={{ fontSize: 18, color: "#9ca3af", lineHeight: 1.7, marginBottom: 40, maxWidth: 480 }}>
                Describe any job in plain English. BidPilot's AI generates a professional, branded proposal with accurate pricing in under 60 seconds — right from your phone.
              </p>
            </Fade>
            <Fade delay={300}>
              <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 40 }}>
                <div style={{ background: AMBER, color: "#000", padding: "16px 36px", borderRadius: 10, fontSize: 16, fontWeight: 800, cursor: "pointer", letterSpacing: 0.3 }}>
                  Try Free — No Card Needed
                </div>
                <div style={{ color: "#9ca3af", fontSize: 14, cursor: "pointer" }}>▶ Watch 90-sec demo</div>
              </div>
            </Fade>
            <Fade delay={400}>
              <div style={{ display: "flex", gap: 32 }}>
                {[["2,000+", "Contractors"], ["$40M+", "Proposals Sent"], ["< 60s", "Per Proposal"]].map(([val, label]) => (
                  <div key={label}>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 800, color: TEXT }}>{val}</div>
                    <div style={{ fontSize: 13, color: MUTED }}>{label}</div>
                  </div>
                ))}
              </div>
            </Fade>
          </div>

          {/* Proposal Card */}
          <div style={{ flexShrink: 0, position: "relative" }}>
            <div style={{ position: "absolute", inset: -2, background: `radial-gradient(ellipse at center, rgba(245,158,11,0.15) 0%, transparent 70%)`, borderRadius: 16, filter: "blur(20px)" }} />
            <div className="card-float">
              <ProposalMock />
            </div>
            {/* Badge */}
            <div style={{ position: "absolute", top: -20, right: -20, background: "#16a34a", color: "#fff", borderRadius: 12, padding: "10px 16px", fontSize: 13, fontWeight: 700, boxShadow: "0 8px 24px rgba(22,163,74,0.4)" }}>
              ✓ Job Won!
            </div>
          </div>
        </div>
      </section>

      {/* TRADES STRIP */}
      <div style={{ borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, padding: "18px 0", overflow: "hidden", background: SURFACE }}>
        <div style={{ display: "flex", gap: 0 }}>
          {[...trades, ...trades].map((t, i) => (
            <div key={i} style={{ padding: "0 32px", fontSize: 13, fontWeight: 600, color: MUTED, whiteSpace: "nowrap", borderRight: `1px solid ${BORDER}` }}>
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* PROBLEM */}
      <section style={{ padding: "100px 48px", maxWidth: 1200, margin: "0 auto" }}>
        <Fade>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: AMBER, letterSpacing: 2, marginBottom: 12 }}>THE PROBLEM</div>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 52, fontWeight: 800, lineHeight: 1.1 }}>
              You're losing jobs<br />while writing proposals
            </h2>
          </div>
        </Fade>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {[
            { icon: "⏱", title: "2+ Hours Per Proposal", body: "The average contractor spends 2–3 hours writing a single proposal. That's time off the job site and money out of your pocket." },
            { icon: "😤", title: "Clients Won't Wait", body: "The first contractor to send a professional proposal wins 70% of the time. Slow quotes = lost jobs to your competition." },
            { icon: "💸", title: "Existing Tools Cost Too Much", body: "Housecall Pro starts at $149/mo. Jobber at $39/mo minimum. And neither one uses AI to actually help you price jobs." },
          ].map((c, i) => (
            <Fade key={i} delay={i * 100}>
              <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "32px 28px" }}>
                <div style={{ fontSize: 36, marginBottom: 16 }}>{c.icon}</div>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>{c.title}</div>
                <div style={{ fontSize: 15, color: MUTED, lineHeight: 1.7 }}>{c.body}</div>
              </div>
            </Fade>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: "80px 48px", background: SURFACE, borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Fade>
            <div style={{ textAlign: "center", marginBottom: 64 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: AMBER, letterSpacing: 2, marginBottom: 12 }}>HOW IT WORKS</div>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 52, fontWeight: 800 }}>3 steps. 60 seconds. Closed.</h2>
            </div>
          </Fade>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 40, position: "relative" }}>
            {[
              { n: "01", title: "Describe the Job", body: "Type or speak a quick description: \"28 square roof replacement, GAF Timberline HDZ, Cranston RI, 2-story colonial.\" That's it.", icon: "🎙" },
              { n: "02", title: "AI Builds the Proposal", body: "BidPilot fills in materials, labor, local rates, warranty terms, and your business info automatically. No templates to fight.", icon: "⚡" },
              { n: "03", title: "Send & Win", body: "Review, tap send. Your client gets a professional PDF they can approve and e-sign on the spot. Job's yours.", icon: "🏆" },
            ].map((step, i) => (
              <Fade key={i} delay={i * 150}>
                <div style={{ position: "relative" }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 80, fontWeight: 900, color: "rgba(245,158,11,0.07)", position: "absolute", top: -20, left: -10, lineHeight: 1 }}>{step.n}</div>
                  <div style={{ fontSize: 40, marginBottom: 20 }}>{step.icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>{step.title}</div>
                  <div style={{ fontSize: 15, color: MUTED, lineHeight: 1.7 }}>{step.body}</div>
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARISON */}
      <section style={{ padding: "100px 48px", maxWidth: 900, margin: "0 auto" }}>
        <Fade>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: AMBER, letterSpacing: 2, marginBottom: 12 }}>VS. THE COMPETITION</div>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 52, fontWeight: 800 }}>Simple choice.</h2>
          </div>
        </Fade>
        <Fade delay={100}>
          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", background: "#0f1117", padding: "14px 24px" }}>
              {["Feature", "BidPilot", "Housecall Pro", "Jobber"].map((h, i) => (
                <div key={h} style={{ fontSize: 12, fontWeight: 700, color: i === 1 ? AMBER : MUTED, letterSpacing: 1.5, textAlign: i > 0 ? "center" : "left" }}>{h}</div>
              ))}
            </div>
            {[
              ["AI Proposal Generation", true, false, false],
              ["Works on Mobile (Field-Ready)", true, true, true],
              ["Plain English Input", true, false, false],
              ["Starting Price", "$15/mo", "$149/mo", "$39/mo"],
              ["Setup Time", "2 min", "4+ hrs", "2+ hrs"],
              ["Trades-Specific Pricing", true, false, false],
              ["E-Sign Built In", true, false, false],
            ].map(([feat, b, h, j], rowIdx) => (
              <div key={rowIdx} className="feature-row" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", padding: "16px 24px", borderTop: `1px solid ${BORDER}`, transition: "background 0.15s" }}>
                <div style={{ fontSize: 14, color: TEXT }}>{feat}</div>
                {[b, h, j].map((v, ci) => (
                  <div key={ci} style={{ textAlign: "center", fontSize: 14, fontWeight: typeof v === "string" ? 700 : 400, color: v === true ? "#22c55e" : v === false ? "#4b5563" : ci === 0 ? AMBER : TEXT }}>
                    {v === true ? "✓" : v === false ? "—" : v}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Fade>
      </section>

      {/* PRICING */}
      <section style={{ padding: "80px 48px", background: SURFACE, borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Fade>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: AMBER, letterSpacing: 2, marginBottom: 12 }}>PRICING</div>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 52, fontWeight: 800 }}>Pay less. Win more.</h2>
              <p style={{ color: MUTED, marginTop: 12, fontSize: 16 }}>Cancel anytime. No contracts. No hidden fees.</p>
            </div>
          </Fade>
          <Fade delay={100}>
            <div style={{ display: "flex", gap: 24, alignItems: "stretch" }}>
              <PricingCard plan="Free" price="0" desc="Get started, no credit card" cta="Start Free" features={["3 proposals/month", "AI-generated content", "PDF download", "Mobile-ready"]} />
              <PricingCard plan="Solo" price="15" desc="For independent contractors" cta="Start Solo" highlight features={["Unlimited proposals", "Custom branding & logo", "Client e-signature", "Email & SMS delivery", "All trade types"]} />
              <PricingCard plan="Team" price="47" desc="For crews up to 5 users" cta="Start Team" features={["Everything in Solo", "Up to 5 team members", "Shared price book", "Analytics dashboard", "Priority support"]} />
            </div>
          </Fade>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding: "100px 48px", maxWidth: 1100, margin: "0 auto" }}>
        <Fade>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: AMBER, letterSpacing: 2, marginBottom: 12 }}>TESTIMONIALS</div>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 52, fontWeight: 800 }}>Contractors love it.</h2>
          </div>
        </Fade>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {[
            { name: "Tony R.", trade: "Roofing · Providence, RI", body: "I was spending Sunday nights writing proposals. Now I send one from the client's driveway before I even get in my truck. Closed 4 jobs this week alone." },
            { name: "Carlos M.", trade: "Siding & Windows · Hartford, CT", body: "Other apps made me feel like an IT guy. BidPilot I figured out in 5 minutes. My proposals look more professional than companies 10x my size." },
            { name: "Dana K.", trade: "Painting & Exteriors · Boston, MA", body: "At $15/month it's basically free money. The AI nails my pricing every time because I told it my labor rates once and it never forgets." },
          ].map((t, i) => (
            <Fade key={i} delay={i * 100}>
              <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "28px 28px" }}>
                <div style={{ color: AMBER, fontSize: 20, marginBottom: 16 }}>★★★★★</div>
                <div style={{ fontSize: 15, color: "#d1d5db", lineHeight: 1.7, marginBottom: 20 }}>"{t.body}"</div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{t.name}</div>
                <div style={{ fontSize: 13, color: MUTED }}>{t.trade}</div>
              </div>
            </Fade>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "80px 48px", background: `linear-gradient(135deg, rgba(245,158,11,0.12) 0%, transparent 60%)`, borderTop: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
          <Fade>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 64, fontWeight: 900, lineHeight: 1, marginBottom: 20 }}>
              Your next job starts<br /><span style={{ color: AMBER }}>right here.</span>
            </h2>
            <p style={{ fontSize: 18, color: MUTED, marginBottom: 40, lineHeight: 1.7 }}>
              Join 2,000+ contractors sending proposals that win. Start free — no credit card, no setup, no nonsense.
            </p>
            <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
              <div style={{ background: AMBER, color: "#000", padding: "18px 44px", borderRadius: 12, fontSize: 17, fontWeight: 800, cursor: "pointer" }}>
                Get Started Free →
              </div>
            </div>
            <div style={{ fontSize: 13, color: "#4b5563", marginTop: 20 }}>Free forever · No credit card · Cancel anytime</div>
          </Fade>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: `1px solid ${BORDER}`, padding: "40px 48px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, background: AMBER, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 16, color: "#000" }}>✈</span>
          </div>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 800 }}>
            BID<span style={{ color: AMBER }}>PILOT</span>
          </span>
        </div>
        <div style={{ display: "flex", gap: 32 }}>
          {["Privacy", "Terms", "Support", "Contact"].map(l => (
            <a key={l} className="nav-link" style={{ fontSize: 13 }}>{l}</a>
          ))}
        </div>
        <div style={{ fontSize: 13, color: "#374151" }}>© 2026 BidPilot · Built for the trades</div>
      </footer>
    </div>
  );
}
