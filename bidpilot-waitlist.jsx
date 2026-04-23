import { useState, useEffect, useRef } from "react";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
// 1. Go to formspree.io → New Form → copy your endpoint here
const FORMSPREE_ENDPOINT = "https://formspree.io/f/REPLACE_WITH_YOUR_ID";
// 2. This counter is cosmetic — replace with a real DB counter if you want
const WAITLIST_COUNT_BASE = 847;

const AMBER = "#f59e0b";
const BG = "#08090c";
const CARD = "#10121a";
const BORDER = "#1a1e2a";
const TEXT = "#eef0f6";
const MUTED = "#5a6278";

export default function WaitlistPage() {
  const [email, setEmail]         = useState("");
  const [trade, setTrade]         = useState("");
  const [state, setState]         = useState("idle"); // idle | loading | success | error
  const [count, setCount]         = useState(WAITLIST_COUNT_BASE);
  const [showCount, setShowCount] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setShowCount(true), 600);
    const counter = setInterval(() => {
      setCount(c => c + (Math.random() > 0.7 ? 1 : 0));
    }, 8000);
    return () => { clearTimeout(t); clearInterval(counter); };
  }, []);

  const submit = async () => {
    if (!email || !email.includes("@")) { inputRef.current?.focus(); return; }
    setState("loading");
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email, trade: trade || "Not specified", source: "BidPilot Waitlist", _subject: `New BidPilot Waitlist Signup: ${email}` }),
      });
      if (res.ok) {
        setState("success");
        setCount(c => c + 1);
      } else {
        setState("error");
      }
    } catch {
      setState("error");
    }
  };

  const TRADES = ["Roofing", "Siding", "Windows & Doors", "Gutters", "Painting", "General Contracting", "HVAC", "Plumbing", "Electrical", "Landscaping", "Other"];

  return (
    <div style={{ background: BG, minHeight: "100vh", color: TEXT, fontFamily: "'Barlow','Segoe UI',sans-serif", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Barlow:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: rgba(245,158,11,0.3); }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.4;} }
        @keyframes countUp { from { opacity:0; transform:scale(0.8); } to { opacity:1; transform:scale(1); } }
        @keyframes float { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-6px);} }
        .fade1 { animation: fadeUp 0.6s ease 0.1s both; }
        .fade2 { animation: fadeUp 0.6s ease 0.25s both; }
        .fade3 { animation: fadeUp 0.6s ease 0.4s both; }
        .fade4 { animation: fadeUp 0.6s ease 0.55s both; }
        .fade5 { animation: fadeUp 0.6s ease 0.7s both; }
        .count-anim { animation: countUp 0.4s ease; }
        .card-float { animation: float 5s ease-in-out infinite; }
        input, select { -webkit-appearance: none; appearance: none; }
        input:focus, select:focus { border-color: ${AMBER} !important; outline: none; }
        .trade-select option { background: #10121a; color: #eef0f6; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: ${BG}; } ::-webkit-scrollbar-thumb { background: #1a1e2a; }
      `}</style>

      {/* Background grid */}
      <div style={{ position: "fixed", inset: 0, backgroundImage: "linear-gradient(rgba(245,158,11,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.03) 1px, transparent 1px)", backgroundSize: "48px 48px", pointerEvents: "none" }} />

      {/* Nav */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, backdropFilter: "blur(16px)", background: "rgba(8,9,12,0.85)", borderBottom: `1px solid ${BORDER}`, padding: "0 32px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 30, height: 30, background: AMBER, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>✈</div>
          <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 20, fontWeight: 800 }}>BID<span style={{ color: AMBER }}>PILOT</span></span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: 13, color: "#22c55e", fontWeight: 600 }}>Launching Soon</span>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: "80px 24px 60px", maxWidth: 1100, margin: "0 auto", display: "flex", gap: 80, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 300 }}>
          {/* Live counter */}
          <div className="fade1" style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 24, padding: "8px 18px", marginBottom: 32 }}>
            <div style={{ display: "flex", gap: 2 }}>
              {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: AMBER, animation: `pulse ${1 + i * 0.3}s infinite` }} />)}
            </div>
            <span style={{ fontSize: 13, color: AMBER, fontWeight: 700 }}>
              <span className={showCount ? "count-anim" : ""} key={count}>{count.toLocaleString()}</span> contractors on the waitlist
            </span>
          </div>

          <h1 className="fade2" style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "clamp(48px,7vw,80px)", fontWeight: 900, lineHeight: 0.95, letterSpacing: "-1px", marginBottom: 24 }}>
            CLOSE EVERY<br />
            <span style={{ color: AMBER, WebkitTextStroke: "1px rgba(245,158,11,0.4)" }}>JOB FASTER</span><br />
            WITH AI
          </h1>

          <p className="fade3" style={{ fontSize: 18, color: "#7080a0", lineHeight: 1.75, marginBottom: 40, maxWidth: 460 }}>
            BidPilot turns a quick job description into a professional, branded proposal in under 60 seconds. Built by contractors, for contractors. iOS + Web app — launching soon.
          </p>

          {/* Signup Form */}
          <div className="fade4">
            {state !== "success" ? (
              <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, padding: "28px 28px" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: AMBER, letterSpacing: 1.5, marginBottom: 20 }}>GET EARLY ACCESS + 30 DAYS FREE</div>

                <div style={{ marginBottom: 14 }}>
                  <input ref={inputRef} type="email" value={email} onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && submit()}
                    placeholder="your@email.com"
                    style={{ background: "#0a0b10", border: `1px solid ${BORDER}`, borderRadius: 12, color: TEXT, fontFamily: "inherit", fontSize: 16, padding: "15px 18px", width: "100%" }} />
                </div>

                <div style={{ marginBottom: 20 }}>
                  <select value={trade} onChange={e => setTrade(e.target.value)} className="trade-select"
                    style={{ background: "#0a0b10", border: `1px solid ${BORDER}`, borderRadius: 12, color: trade ? TEXT : MUTED, fontFamily: "inherit", fontSize: 16, padding: "15px 18px", width: "100%", cursor: "pointer" }}>
                    <option value="">Your trade (optional)</option>
                    {TRADES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <button onClick={submit} disabled={state === "loading"} style={{ width: "100%", background: AMBER, color: "#000", border: "none", borderRadius: 12, padding: "17px 0", fontSize: 17, fontWeight: 800, fontFamily: "inherit", cursor: state === "loading" ? "default" : "pointer", opacity: state === "loading" ? 0.8 : 1, transition: "opacity 0.2s" }}>
                  {state === "loading" ? "Joining…" : "Join the Waitlist — It's Free →"}
                </button>

                {state === "error" && <div style={{ marginTop: 12, fontSize: 13, color: "#f87171", textAlign: "center" }}>Something went wrong. Try again or email us directly.</div>}

                <div style={{ marginTop: 14, display: "flex", gap: 20, justifyContent: "center" }}>
                  {["No spam ever", "Launch pricing locked in", "30-day free trial"].map(t => (
                    <div key={t} style={{ fontSize: 12, color: MUTED, display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ color: "#22c55e" }}>✓</span>{t}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 20, padding: "40px 32px", textAlign: "center", animation: "fadeUp 0.5s ease" }}>
                <div style={{ fontSize: 52, marginBottom: 16 }}>🎉</div>
                <h3 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 32, fontWeight: 800, color: "#22c55e", marginBottom: 8 }}>You're on the list!</h3>
                <p style={{ color: MUTED, fontSize: 15, lineHeight: 1.7 }}>
                  We'll email you the moment BidPilot launches — with your 30-day free trial already activated.<br /><br />
                  <strong style={{ color: TEXT }}>Tell a contractor friend →</strong> every referral moves you up the list for early access.
                </p>
                <div style={{ marginTop: 24, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                  <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent("Just joined the BidPilot waitlist — AI-powered proposals for contractors in 60 seconds. Check it out: getbidpilot.com")}`} target="_blank" style={{ background: "#1da1f2", color: "#fff", textDecoration: "none", padding: "10px 22px", borderRadius: 10, fontSize: 14, fontWeight: 700 }}>Share on Twitter</a>
                  <a href={`https://www.facebook.com/sharer/sharer.php?u=getbidpilot.com`} target="_blank" style={{ background: "#1877f2", color: "#fff", textDecoration: "none", padding: "10px 22px", borderRadius: 10, fontSize: 14, fontWeight: 700 }}>Share on Facebook</a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Floating phone mockup */}
        <div className="fade5 card-float" style={{ flexShrink: 0 }}>
          <div style={{ width: 280, background: "#0a0b0e", borderRadius: 36, border: "6px solid #1a1e2a", overflow: "hidden", boxShadow: "0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(245,158,11,0.1)" }}>
            {/* Phone notch */}
            <div style={{ background: "#0a0b0e", height: 32, display: "flex", justifyContent: "center", alignItems: "flex-end", paddingBottom: 6 }}>
              <div style={{ width: 80, height: 6, background: "#1a1e2a", borderRadius: 3 }} />
            </div>
            {/* App preview */}
            <div style={{ padding: "16px 14px", background: "#0a0b0e" }}>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 22, fontWeight: 900, marginBottom: 16 }}>BID<span style={{ color: AMBER }}>PILOT</span></div>
              <div style={{ background: "#111318", border: "1px solid #1c1f27", borderRadius: 14, padding: 14, marginBottom: 12 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: AMBER, letterSpacing: 1.5, marginBottom: 8 }}>DESCRIBE YOUR JOB</div>
                <div style={{ fontSize: 12, color: "#5a6070", lineHeight: 1.5 }}>28 sq roof replacement GAF HDZ, colonial in Cranston RI, Mike Johnson…</div>
                <div style={{ marginTop: 12, background: AMBER, borderRadius: 8, padding: "9px 0", textAlign: "center", fontSize: 12, fontWeight: 800, color: "#000" }}>⚡ Generate Proposal</div>
              </div>
              {/* Mini proposal preview */}
              <div style={{ background: "#fff", borderRadius: 12, padding: "12px 14px", color: "#111" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>Iron Ridge Roofing</div>
                  <div style={{ background: "#fef3c7", color: "#92400e", fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 10 }}>PROPOSAL</div>
                </div>
                {[["Remove & replace 28 sq shingles", "$4,200"], ["Ice & water shield", "$840"], ["Flashing & ridge cap", "$380"]].map(([d, p]) => (
                  <div key={d} style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 4, color: "#374151" }}>
                    <span>{d}</span><span style={{ fontWeight: 600 }}>{p}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #e5e7eb", paddingTop: 6, marginTop: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 800 }}>TOTAL</span>
                  <span style={{ fontSize: 13, fontWeight: 900, color: AMBER }}>$5,670</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof strip */}
      <div style={{ borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, background: CARD, padding: "20px 32px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", gap: 48, justifyContent: "center", flexWrap: "wrap" }}>
          {[["60 sec", "Avg proposal time"], ["$15/mo", "Starting price"], ["10+", "Trade types covered"], ["0", "Office work required"]].map(([val, label]) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 32, fontWeight: 900, color: AMBER }}>{val}</div>
              <div style={{ fontSize: 13, color: MUTED }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <section style={{ padding: "80px 24px", maxWidth: 900, margin: "0 auto" }}>
        <h2 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 48, fontWeight: 900, textAlign: "center", marginBottom: 48 }}>
          Everything you need.<br /><span style={{ color: AMBER }}>Nothing you don't.</span>
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
          {[
            { icon: "⚡", title: "AI-Powered Pricing", body: "Describe the job in plain English. AI fills in materials, labor, and local rates automatically." },
            { icon: "📱", title: "iOS & Web App", body: "Works on your phone in the field. No laptop, no office, no waiting. Send from the driveway." },
            { icon: "✍️", title: "E-Sign Built In", body: "Clients approve and sign right on their phone. No printing, no scanning, no chasing." },
            { icon: "🏷️", title: "Your Brand", body: "Your logo, your colors, your name. Looks like you spent hours on it. Took you 60 seconds." },
            { icon: "📊", title: "Proposal History", body: "Every bid you've ever sent, searchable and accessible. Never lose a proposal again." },
            { icon: "💸", title: "Starts at $15/mo", body: "70% cheaper than Housecall Pro. No hidden fees, no setup costs, cancel anytime." },
          ].map((f, i) => (
            <div key={i} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "24px 22px" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{f.icon}</div>
              <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{f.title}</div>
              <div style={{ fontSize: 14, color: MUTED, lineHeight: 1.7 }}>{f.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={{ padding: "60px 24px 80px", textAlign: "center", borderTop: `1px solid ${BORDER}` }}>
        <h3 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 52, fontWeight: 900, marginBottom: 16 }}>Ready to close more jobs?</h3>
        <p style={{ color: MUTED, fontSize: 16, marginBottom: 32 }}>Join {count.toLocaleString()}+ contractors already on the list.</p>
        <button onClick={() => { setState("idle"); window.scrollTo({ top: 0, behavior: "smooth" }); }} style={{ background: AMBER, color: "#000", border: "none", borderRadius: 14, padding: "18px 48px", fontSize: 18, fontWeight: 800, fontFamily: "inherit", cursor: "pointer" }}>
          Get Early Access →
        </button>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${BORDER}`, padding: "28px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 26, height: 26, background: AMBER, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>✈</div>
          <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 17, fontWeight: 800 }}>BID<span style={{ color: AMBER }}>PILOT</span></span>
        </div>
        <div style={{ fontSize: 13, color: MUTED }}>© 2026 BidPilot · Built for the trades · getbidpilot.com</div>
      </footer>
    </div>
  );
}
